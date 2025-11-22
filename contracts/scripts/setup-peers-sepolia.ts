import hre from "hardhat";
import * as fs from "fs";

/**
 * Setup LayerZero peer on Sepolia to connect to Base Sepolia
 */

const BASE_SEPOLIA_EID = 40245;

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();

  console.log("Setting up LayerZero peer on Sepolia");
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

  console.log("\nSepolia IntentManager:", sepoliaIntentManager);
  console.log("Base Sepolia IntentManager:", baseSepoliaIntentManager);
  console.log("Base Sepolia EID:", BASE_SEPOLIA_EID);

  const IntentManager = await ethers.getContractFactory("IntentManager");
  const intentManager = IntentManager.attach(sepoliaIntentManager);

  // Check current peer
  const currentPeer = await intentManager.peers(BASE_SEPOLIA_EID);
  console.log("\nCurrent peer (bytes32):", currentPeer);
  
  // Convert to address for comparison
  const currentPeerAddress = ethers.getAddress("0x" + currentPeer.slice(-40));
  console.log("Current peer (address):", currentPeerAddress);

  if (currentPeerAddress.toLowerCase() === baseSepoliaIntentManager.toLowerCase()) {
    console.log("✅ Peer already configured correctly!");
    return;
  }

  // Set peer - LayerZero uses bytes32 addresses (padded with zeros)
  console.log("\nSetting peer...");
  // Convert address to bytes32 (pad with zeros on the left)
  const peerBytes32 = ethers.zeroPadValue(baseSepoliaIntentManager, 32);
  console.log("Peer address (bytes32):", peerBytes32);
  
  const tx = await intentManager.setPeer(BASE_SEPOLIA_EID, peerBytes32);
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Peer configured! Block:", receipt.blockNumber);

  // Verify
  const verifiedPeer = await intentManager.peers(BASE_SEPOLIA_EID);
  console.log("\nVerified peer (bytes32):", verifiedPeer);
  
  // Convert to address for comparison
  const verifiedPeerAddress = ethers.getAddress("0x" + verifiedPeer.slice(-40));
  console.log("Verified peer (address):", verifiedPeerAddress);
  
  if (verifiedPeerAddress.toLowerCase() === baseSepoliaIntentManager.toLowerCase()) {
    console.log("✅ Peer verification successful!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

