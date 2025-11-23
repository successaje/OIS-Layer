# Chainlink Price Feed Addresses

## 📚 Official Documentation

- **Chainlink Data Feeds:** https://docs.chain.link/data-feeds/price-feeds/addresses
- **Sepolia Testnet:** https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
- **Base Sepolia Testnet:** https://docs.chain.link/data-feeds/price-feeds/addresses?network=base&page=1#base-sepolia-testnet

---

## 🔵 Sepolia Testnet Price Feeds

| Pair | Address | Status |
|------|---------|--------|
| **ETH/USD** | `0x694AA1769357215DE4FAC081bf1f309aDC325306` | ✅ Verified |
| **BTC/USD** | `0x1b44F3514812ea8353b35eCaCaC62b5177F7410` | ✅ Available |
| **LINK/USD** | Check Chainlink docs | ⚠️ Verify |
| **USDC/USD** | May not be available on Sepolia | ⚠️ Use mock |
| **DAI/USD** | May not be available on Sepolia | ⚠️ Use mock |

**Note:** Some price feeds may not be available on Sepolia. For testing, you can:
1. Use mock price feeds
2. Deploy your own price feed contracts
3. Use available feeds (ETH/USD, BTC/USD)

---

## 🟦 Base Sepolia Testnet Price Feeds

| Pair | Address | Status |
|------|---------|--------|
| **ETH/USD** | `0x4aDC67696bA383F43DD60A171e9278f74A5fB1f7` | ✅ Available |
| **BTC/USD** | `0x1b44F3514812ea8353b35eCaCaC62b5177F7410` | ✅ Available |

**Note:** Base Sepolia has limited price feeds. Check the official Chainlink documentation for the most up-to-date addresses.

---

## 🔍 How to Find Price Feed Addresses

### Method 1: Chainlink Documentation
1. Go to https://docs.chain.link/data-feeds/price-feeds/addresses
2. Select your network (Sepolia, Base Sepolia, etc.)
3. Find the price feed pair you need
4. Copy the address

### Method 2: Chainlink Data Feeds Explorer
1. Visit https://data.chain.link/
2. Select your network
3. Browse available feeds
4. Get the contract address

### Method 3: Verify on Block Explorer
1. Check the contract on Etherscan/Basescan
2. Verify it's a Chainlink AggregatorV3Interface contract
3. Confirm it's the correct pair (e.g., ETH/USD)

---

## ✅ Verification Checklist

Before using a price feed address:

- [ ] Address is properly checksummed (EIP-55)
- [ ] Address is verified on block explorer
- [ ] Contract implements AggregatorV3Interface
- [ ] Price feed is active and updating
- [ ] Network matches your deployment network

---

## 🛠️ Adding Price Feeds

Use the setup script:

```bash
# Sepolia
npx hardhat run scripts/setup-price-feeds.ts --network sepolia

# Base Sepolia
npx hardhat run scripts/setup-price-feeds.ts --network baseSepolia
```

Or manually:

```typescript
const oracleAdapter = await ethers.getContractAt(
  "ChainlinkOracleAdapter",
  oracleAdapterAddress
);

await oracleAdapter.addPriceFeed(
  tokenAddress,      // Token address (0x0 for native ETH)
  priceFeedAddress,  // Chainlink price feed address
  3600               // Staleness threshold (seconds)
);
```

---

## 📝 Notes

1. **Native Token (ETH)**: Use `0x0000000000000000000000000000000000000000` as token address
2. **Staleness Threshold**: Recommended 3600 seconds (1 hour) for testnets
3. **Mainnet vs Testnet**: Addresses are different between mainnet and testnet
4. **Updates**: Chainlink may update addresses, always check official docs

---

## 🔗 Quick Links

- **Chainlink Docs:** https://docs.chain.link
- **Data Feeds Explorer:** https://data.chain.link/
- **Price Feed Addresses:** https://docs.chain.link/data-feeds/price-feeds/addresses
- **Aggregator Interface:** https://docs.chain.link/data-feeds/api-reference

