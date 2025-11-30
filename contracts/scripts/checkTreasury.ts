import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🔍 Checking Treasury Balances...\n");

  // Get contract addresses from env
  const SORTTOEARN_CONTRACT = process.env.VITE_SORTTOEARN_CONTRACT;
  const LEVELCREATOR_CONTRACT = process.env.VITE_LEVELCREATOR_CONTRACT;
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  if (!SORTTOEARN_CONTRACT || !LEVELCREATOR_CONTRACT) {
    console.error("❌ Contract addresses not found in .env");
    process.exit(1);
  }

  console.log("Contract Addresses:");
  console.log("SortToEarn:  ", SORTTOEARN_CONTRACT);
  console.log("LevelCreator:", LEVELCREATOR_CONTRACT);
  console.log("cUSD Token:  ", CUSD_ADDRESS);
  console.log();

  // Get contracts
  const sortToEarn = await ethers.getContractAt("SortToEarn", SORTTOEARN_CONTRACT);
  const levelCreator = await ethers.getContractAt("LevelCreator", LEVELCREATOR_CONTRACT);

  // Check treasury balances
  const sortToEarnBalance = await sortToEarn.treasuryBalance();
  const levelCreatorBalance = await levelCreator.treasuryBalance();

  console.log("💰 Treasury Balances:");
  console.log("SortToEarn:  ", ethers.formatEther(sortToEarnBalance), "cUSD");
  console.log("LevelCreator:", ethers.formatEther(levelCreatorBalance), "cUSD");
  console.log();

  // Check contract cUSD balances
  const cUSD = await ethers.getContractAt("IERC20", CUSD_ADDRESS);
  const sortToEarnCUSDBalance = await cUSD.balanceOf(SORTTOEARN_CONTRACT);
  const levelCreatorCUSDBalance = await cUSD.balanceOf(LEVELCREATOR_CONTRACT);

  console.log("💵 Actual cUSD Balances:");
  console.log("SortToEarn:  ", ethers.formatEther(sortToEarnCUSDBalance), "cUSD");
  console.log("LevelCreator:", ethers.formatEther(levelCreatorCUSDBalance), "cUSD");
  console.log();

  // Warn if treasury is low
  if (sortToEarnBalance < ethers.parseEther("1")) {
    console.log("⚠️  WARNING: SortToEarn treasury is low!");
    console.log("   Players won't be able to claim rewards.");
    console.log("   Run: npm run fund-treasury");
  }

  if (levelCreatorBalance < ethers.parseEther("1")) {
    console.log("⚠️  WARNING: LevelCreator treasury is low!");
    console.log("   Players won't be able to play custom levels.");
    console.log("   Run: npm run fund-treasury");
  }

  console.log("✅ Treasury check complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
