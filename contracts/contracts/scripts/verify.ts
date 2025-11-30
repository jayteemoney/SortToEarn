import { run } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("🔍 Verifying contracts on Celoscan...\n");

  // Load deployment info
  if (!fs.existsSync("./deployment.json")) {
    console.error("❌ deployment.json not found. Run deploy script first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync("./deployment.json", "utf8"));
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  console.log("Verifying contracts from deployment:");
  console.log("Network:", deployment.network);
  console.log("Timestamp:", deployment.timestamp, "\n");

  // Verify SortToEarn
  try {
    console.log("Verifying SortToEarn...");
    await run("verify:verify", {
      address: deployment.contracts.SortToEarn,
      constructorArguments: [CUSD_ADDRESS],
    });
    console.log("✅ SortToEarn verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ SortToEarn already verified\n");
    } else {
      console.error("❌ SortToEarn verification failed:", error.message, "\n");
    }
  }

  // Verify LevelCreator
  try {
    console.log("Verifying LevelCreator...");
    await run("verify:verify", {
      address: deployment.contracts.LevelCreator,
      constructorArguments: [CUSD_ADDRESS],
    });
    console.log("✅ LevelCreator verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ LevelCreator already verified\n");
    } else {
      console.error("❌ LevelCreator verification failed:", error.message, "\n");
    }
  }

  console.log("🎉 Verification complete!\n");
  console.log("View on Celoscan:");
  console.log(`SortToEarn:   https://alfajores.celoscan.io/address/${deployment.contracts.SortToEarn}`);
  console.log(`LevelCreator: https://alfajores.celoscan.io/address/${deployment.contracts.LevelCreator}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
