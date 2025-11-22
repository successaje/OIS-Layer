import hre from "hardhat";
import * as fs from "fs";

/**
 * Setup LayerZero peer on Base Sepolia to connect to Sepolia
 */

const SEPOLIA_EID = 40161;

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();

  console.log("Setting up LayerZero peer on Base Sepolia");
  console.log("Deployer:", deployer.address);
  console.log("Network:", hre.network.name);

  // Load deployments
  const sepoliaDeployment = JSON.parse(
    fs.readFileSync("deployments/sepolia.json", "utf-8")
  );
  const baseSepoliaDeployment = JSON.parse(
    fs.readFileSync("deployments/baseSepolia.json", "utf-8")
  );

  const sepoliaIntentManager = sepoliaDeployment.contracts.intentManager;
  const baseSepoliaIntentManager = baseSepoliaDeployment.contracts.intentManager;

  console.log("\nBase Sepolia IntentManager:", baseSepoliaIntentManager);
  console.log("Sepolia IntentManager:", sepoliaIntentManager);
  console.log("Sepolia EID:", SEPOLIA_EID);

  const IntentManager = await ethers.getContractFactory("IntentManager");
  const intentManager = IntentManager.attach(baseSepoliaIntentManager);

  // Check current peer
  const currentPeer = await intentManager.peers(SEPOLIA_EID);
  console.log("\nCurrent peer (bytes32):", currentPeer);
  
  // Convert to address for comparison
  const currentPeerAddress = ethers.getAddress("0x" + currentPeer.slice(-40));
  console.log("Current peer (address):", currentPeerAddress);

  if (currentPeerAddress.toLowerCase() === sepoliaIntentManager.toLowerCase()) {
    console.log("✅ Peer already configured correctly!");
    return;
  }

  // Set peer - LayerZero uses bytes32 addresses (padded with zeros)
  console.log("\nSetting peer...");
  // Convert address to bytes32 (pad with zeros on the left)
  const peerBytes32 = ethers.zeroPadValue(sepoliaIntentManager, 32);
  console.log("Peer address (bytes32):", peerBytes32);
  
  const tx = await intentManager.setPeer(SEPOLIA_EID, peerBytes32);
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Peer configured! Block:", receipt.blockNumber);

  // Verify
  const verifiedPeer = await intentManager.peers(SEPOLIA_EID);
  console.log("\nVerified peer (bytes32):", verifiedPeer);
  
  // Convert to address for comparison
  const verifiedPeerAddress = ethers.getAddress("0x" + verifiedPeer.slice(-40));
  console.log("Verified peer (address):", verifiedPeerAddress);
  
  if (verifiedPeerAddress.toLowerCase() === sepoliaIntentManager.toLowerCase()) {
    console.log("✅ Peer verification successful!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

