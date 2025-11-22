import hre from "hardhat";

/**
 * Setup Chainlink Price Feeds for OracleAdapter
 * 
 * This script adds price feeds for common tokens on testnets.
 * Update addresses based on your network and token requirements.
 */

// Sepolia Price Feed Addresses (Chainlink)
// Source: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
// Verified addresses from Chainlink documentation
const SEPOLIA_PRICE_FEEDS: { [key: string]: { token: string; feed: string } } = {
  ETH: {
    token: "0x0000000000000000000000000000000000000000", // Native ETH
    feed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD - ✅ Verified working
  },
  // Add more feeds from: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
  // Example: BTC/USD, LINK/USD, etc. (verify addresses before adding)
};

// Base Sepolia Price Feed Addresses (Chainlink)
// Source: https://docs.chain.link/data-feeds/price-feeds/addresses?network=base&page=1#base-sepolia-testnet
// Note: Base Sepolia has limited feeds. Check official docs for latest addresses.
const BASE_SEPOLIA_PRICE_FEEDS: { [key: string]: { token: string; feed: string } } = {
  ETH: {
    token: "0x0000000000000000000000000000000000000000", // Native ETH
    feed: "0x4aDC67696bA383F43DD60A171e9278f74A5fB1f7", // ETH/USD on Base Sepolia
  },
  // Add more feeds from: https://docs.chain.link/data-feeds/price-feeds/addresses?network=base&page=1#base-sepolia-testnet
};

const STALENESS_THRESHOLD = 3600; // 1 hour in seconds

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;

  console.log("Setting up price feeds on:", network);
  console.log("Deployer:", deployer.address);

  // Get OracleAdapter address from deployment
  const deploymentFile = `deployments/${network}.json`;
  const fs = await import("fs");
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const oracleAdapterAddress = deployment.contracts.oracleAdapter;

  console.log("OracleAdapter:", oracleAdapterAddress);

  const oracleAdapter = await ethers.getContractAt(
    "ChainlinkOracleAdapter",
    oracleAdapterAddress
  );

  // Select price feeds based on network
  const priceFeeds = network === "baseSepolia" 
    ? BASE_SEPOLIA_PRICE_FEEDS 
    : SEPOLIA_PRICE_FEEDS;

  // Add price feeds
  for (const [tokenName, { token, feed }] of Object.entries(priceFeeds)) {
    if (!feed || feed === "0x..." || feed.length !== 42) {
      console.log(`⚠️  Skipping ${tokenName} - invalid price feed address`);
      continue;
    }

    try {
      // Validate and checksum addresses
      let checksummedToken: string;
      let checksummedFeed: string;

      try {
        checksummedToken = token === "0x0000000000000000000000000000000000000000" 
          ? token 
          : ethers.getAddress(token);
        checksummedFeed = ethers.getAddress(feed);
      } catch (checksumError: any) {
        console.error(`❌ Invalid address format for ${tokenName}:`, checksumError.message);
        continue;
      }

      console.log(`\nAdding price feed for ${tokenName}...`);
      console.log(`  Token: ${checksummedToken}`);
      console.log(`  Feed: ${checksummedFeed}`);
      console.log(`  Staleness Threshold: ${STALENESS_THRESHOLD}s`);

      const tx = await oracleAdapter.addPriceFeed(
        checksummedToken,
        checksummedFeed,
        STALENESS_THRESHOLD
      );

      const receipt = await tx.wait();
      console.log(`✅ ${tokenName} price feed added! Tx: ${tx.hash}`);
      
      // Verify the feed was added
      const addedFeed = await oracleAdapter.priceFeeds(checksummedToken);
      if (addedFeed.toLowerCase() === checksummedFeed.toLowerCase()) {
        console.log(`   ✓ Verified: Feed is registered`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to add ${tokenName} price feed:`, error.message);
      if (error.message.includes("revert") || error.message.includes("execution reverted")) {
        console.error(`   Hint: Check if the price feed address is correct and the contract exists`);
      }
    }
  }

  console.log("\n✅ Price feed setup complete!");
  console.log("\nNext steps:");
  console.log("1. Verify price feeds are working:");
  console.log(`   const price = await oracleAdapter.getLatestPrice(tokenAddress);`);
  console.log("2. Add more price feeds as needed");
  console.log("3. Update staleness thresholds based on requirements");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

