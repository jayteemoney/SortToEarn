import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying SortToEarn contracts to Celo Alfajores...\n");

  // Alfajores cUSD address
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO\n");

  // Deploy SortToEarn
  console.log("📜 Deploying SortToEarn contract...");
  const SortToEarn = await ethers.getContractFactory("SortToEarn");
  const sortToEarn = await SortToEarn.deploy(CUSD_ADDRESS);
  await sortToEarn.waitForDeployment();
  const sortToEarnAddress = await sortToEarn.getAddress();
  console.log("✅ SortToEarn deployed to:", sortToEarnAddress);

  // Deploy LevelCreator
  console.log("\n📜 Deploying LevelCreator contract...");
  const LevelCreator = await ethers.getContractFactory("LevelCreator");
  const levelCreator = await LevelCreator.deploy(CUSD_ADDRESS);
  await levelCreator.waitForDeployment();
  const levelCreatorAddress = await levelCreator.getAddress();
  console.log("✅ LevelCreator deployed to:", levelCreatorAddress);

  // Wait for confirmations
  console.log("\n⏳ Waiting for confirmations...");
  await sortToEarn.deploymentTransaction()?.wait(5);
  await levelCreator.deploymentTransaction()?.wait(5);

  console.log("\n🎉 Deployment complete!\n");
  console.log("================================================");
  console.log("📋 Contract Addresses:");
  console.log("================================================");
  console.log("SortToEarn:   ", sortToEarnAddress);
  console.log("LevelCreator: ", levelCreatorAddress);
  console.log("cUSD Token:   ", CUSD_ADDRESS);
  console.log("================================================\n");

  console.log("📝 Update your .env file with:");
  console.log(`VITE_SORTTOEARN_CONTRACT=${sortToEarnAddress}`);
  console.log(`VITE_LEVELCREATOR_CONTRACT=${levelCreatorAddress}\n`);

  console.log("🔍 Verify contracts with:");
  console.log(`npx hardhat verify --network alfajores ${sortToEarnAddress} ${CUSD_ADDRESS}`);
  console.log(`npx hardhat verify --network alfajores ${levelCreatorAddress} ${CUSD_ADDRESS}\n`);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: "alfajores",
    chainId: 44787,
    timestamp: new Date().toISOString(),
    contracts: {
      SortToEarn: sortToEarnAddress,
      LevelCreator: levelCreatorAddress,
      cUSD: CUSD_ADDRESS,
    },
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployment.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
