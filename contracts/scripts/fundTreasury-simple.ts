import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("💰 Funding SortToEarn Treasury...\n");

  // Get contract addresses from env
  const SORTTOEARN_CONTRACT = process.env.VITE_SORTTOEARN_CONTRACT;
  const LEVELCREATOR_CONTRACT = process.env.VITE_LEVELCREATOR_CONTRACT;
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  if (!SORTTOEARN_CONTRACT || !LEVELCREATOR_CONTRACT) {
    console.error("❌ Contract addresses not found in .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("Funding from:", signer.address);

  // Get contracts
  const cUSD = await ethers.getContractAt("IERC20", CUSD_ADDRESS);
  const sortToEarn = await ethers.getContractAt("SortToEarn", SORTTOEARN_CONTRACT);
  const levelCreator = await ethers.getContractAt("LevelCreator", LEVELCREATOR_CONTRACT);

  // Amount to fund (50 cUSD to each contract)
  const amount = ethers.parseEther("50");

  console.log(`Funding amount: ${ethers.formatEther(amount)} cUSD per contract\n`);

  // Check balance
  const balance = await cUSD.balanceOf(signer.address);
  console.log("Your cUSD balance:", ethers.formatEther(balance));

  if (balance < amount * 2n) {
    console.log("\n⚠️  Insufficient cUSD balance!");
    console.log("Get Celo Sepolia testnet cUSD from: https://faucet.celo.org");
    console.log("Or use the Sepolia Bridge");
    process.exit(1);
  }

  // Approve and fund SortToEarn
  console.log("\n📤 Funding SortToEarn contract...");
  let tx = await cUSD.approve(SORTTOEARN_CONTRACT, amount);
  await tx.wait();
  console.log("   Approved cUSD transfer");

  tx = await sortToEarn.fundTreasury(amount);
  await tx.wait();
  console.log("✅ SortToEarn funded!");

  // Approve and fund LevelCreator
  console.log("\n📤 Funding LevelCreator contract...");
  tx = await cUSD.approve(LEVELCREATOR_CONTRACT, amount);
  await tx.wait();
  console.log("   Approved cUSD transfer");

  tx = await levelCreator.fundTreasury(amount);
  await tx.wait();
  console.log("✅ LevelCreator funded!");

  // Check treasury balances
  const sortToEarnBalance = await sortToEarn.treasuryBalance();
  const levelCreatorBalance = await levelCreator.treasuryBalance();

  console.log("\n💰 New Treasury Balances:");
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
