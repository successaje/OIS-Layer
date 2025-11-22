import hre from "hardhat";
import * as fs from "fs";

/**
 * Setup LayerZero peers between Sepolia and Base Sepolia
 * 
 * This script configures the IntentManager contracts to communicate
 * cross-chain via LayerZero V2.
 */

// LayerZero Endpoint IDs (EIDs)
const LAYERZERO_EIDS = {
  sepolia: 40161,
  baseSepolia: 40245,
};

// Load deployment addresses
function loadDeployment(network: string) {
  const file = `deployments/${network}.json`;
  if (!fs.existsSync(file)) {
    throw new Error(`Deployment file not found: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

async function setupPeer(
  network: string,
  intentManagerAddress: string,
  peerEid: number,
  peerAddress: string
) {
  console.log(`\n=== Setting up peer on ${network} ===");
  console.log(`IntentManager: ${intentManagerAddress}`);
  console.log(`Peer EID: ${peerEid}`);
  console.log(`Peer Address: ${peerAddress}`);

  // Switch to the network
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();

  const IntentManager = await ethers.getContractFactory("IntentManager");
  const intentManager = IntentManager.attach(intentManagerAddress);

  try {
    // Check if peer is already set
    const currentPeer = await intentManager.peers(peerEid);
    if (currentPeer.toLowerCase() === peerAddress.toLowerCase()) {
      console.log(`✅ Peer already configured correctly`);
      return;
    }

    if (currentPeer !== "0x0000000000000000000000000000000000000000") {
      console.log(`⚠️  Peer already set to different address: ${currentPeer}`);
      console.log(`   Updating to new address...`);
    }

    // Set peer using LayerZero OApp's setPeer function
    console.log(`Setting peer...`);
    const tx = await intentManager.setPeer(peerEid, peerAddress);
    console.log(`Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Peer configured! Block: ${receipt.blockNumber}`);

    // Verify peer was set
    const verifiedPeer = await intentManager.peers(peerEid);
    if (verifiedPeer.toLowerCase() === peerAddress.toLowerCase()) {
      console.log(`✅ Verified: Peer is correctly set`);
    } else {
      console.log(`⚠️  Warning: Peer verification failed`);
      console.log(`   Expected: ${peerAddress}`);
      console.log(`   Got: ${verifiedPeer}`);
    }
  } catch (error: any) {
    console.error(`❌ Failed to set peer:`, error.message);
    if (error.message.includes("Ownable")) {
      console.error(`   Hint: Make sure you're using the deployer account`);
    }
    throw error;
  }
}

async function main() {
  console.log("==========================================");
  console.log("Setting up LayerZero Peers");
  console.log("==========================================");

  // Load deployments
  const sepoliaDeployment = loadDeployment("sepolia");
  const baseSepoliaDeployment = loadDeployment("baseSepolia");

  const sepoliaIntentManager = sepoliaDeployment.contracts.intentManager;
  const baseSepoliaIntentManager = baseSepoliaDeployment.contracts.intentManager;

  console.log("\nDeployment Addresses:");
  console.log(`Sepolia IntentManager: ${sepoliaIntentManager}`);
  console.log(`Base Sepolia IntentManager: ${baseSepoliaIntentManager}`);

  // Setup Sepolia → Base Sepolia peer
  console.log("\n" + "=".repeat(50));
  console.log("Step 1: Configure Sepolia → Base Sepolia");
  console.log("=".repeat(50));
  
  // Note: We need to run this on Sepolia network
  // For now, we'll provide instructions
  console.log("\n📋 To set up peers, run these commands:");
  console.log("\n1. Set peer on Sepolia:");
  console.log(`   npx hardhat run scripts/setup-peers-sepolia.ts --network sepolia`);
  console.log("\n2. Set peer on Base Sepolia:");
  console.log(`   npx hardhat run scripts/setup-peers-base-sepolia.ts --network baseSepolia`);

  // Actually set the peers if we can
  try {
    const network = hre.network.name;
    
    if (network === "sepolia") {
      await setupPeer(
        "sepolia",
        sepoliaIntentManager,
        LAYERZERO_EIDS.baseSepolia,
        baseSepoliaIntentManager
      );
    } else if (network === "baseSepolia") {
      await setupPeer(
        "baseSepolia",
        baseSepoliaIntentManager,
        LAYERZERO_EIDS.sepolia,
        sepoliaIntentManager
      );
    } else {
      console.log("\n⚠️  Please run this script on sepolia or baseSepolia network");
      console.log("   Example: npx hardhat run scripts/setup-peers.ts --network sepolia");
    }
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Peer setup complete!");
  console.log("=".repeat(50));
  console.log("\nNext steps:");
  console.log("1. Verify peers are set correctly");
  console.log("2. Test cross-chain message sending");
  console.log("3. Monitor LayerZero message delivery");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

