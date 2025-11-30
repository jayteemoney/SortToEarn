import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("💰 Funding SortToEarn Treasury...\n");

  // Load deployment
  if (!fs.existsSync("./deployment.json")) {
    console.error("❌ deployment.json not found. Deploy contracts first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync("./deployment.json", "utf8"));
  const CUSD_ADDRESS = deployment.contracts.cUSD;

  const [signer] = await ethers.getSigners();
  console.log("Funding from:", signer.address);

  // Get contracts
  const cUSD = await ethers.getContractAt("IERC20", CUSD_ADDRESS);
  const sortToEarn = await ethers.getContractAt(
    "SortToEarn",
    deployment.contracts.SortToEarn
  );
  const levelCreator = await ethers.getContractAt(
    "LevelCreator",
    deployment.contracts.LevelCreator
  );

  // Amount to fund (100 cUSD to each contract)
  const amount = ethers.parseEther("100");

  console.log(`\nFunding amount: ${ethers.formatEther(amount)} cUSD per contract\n`);

  // Check balance
  const balance = await cUSD.balanceOf(signer.address);
  console.log("Your cUSD balance:", ethers.formatEther(balance));

  if (balance < amount * 2n) {
    console.log("\n⚠️  Insufficient cUSD balance!");
    console.log("Get Alfajores cUSD from: https://faucet.celo.org");
    process.exit(1);
  }

  // Approve and fund SortToEarn
  console.log("\n📤 Funding SortToEarn contract...");
  let tx = await cUSD.approve(deployment.contracts.SortToEarn, amount);
  await tx.wait();
  tx = await sortToEarn.fundTreasury(amount);
  await tx.wait();
  console.log("✅ SortToEarn funded!");

  // Approve and fund LevelCreator
  console.log("\n📤 Funding LevelCreator contract...");
  tx = await cUSD.approve(deployment.contracts.LevelCreator, amount);
  await tx.wait();
  tx = await levelCreator.fundTreasury(amount);
  await tx.wait();
  console.log("✅ LevelCreator funded!");

  // Check treasury balances
  const sortToEarnBalance = await sortToEarn.treasuryBalance();
  const levelCreatorBalance = await levelCreator.treasuryBalance();

  console.log("\n💰 Treasury Balances:");
  console.log("SortToEarn:  ", ethers.formatEther(sortToEarnBalance), "cUSD");
  console.log("LevelCreator:", ethers.formatEther(levelCreatorBalance), "cUSD");

  console.log("\n🎉 Treasury funding complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
