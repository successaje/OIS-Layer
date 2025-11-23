# IntentManager Setup Guide

This guide outlines all the setup steps required **before** users can start creating intents.

## ✅ Already Completed

1. **LayerZero Peer Configuration** - `setPeer()` has been called to enable cross-chain messaging

## 🔧 Required Setup Steps

### 1. CCIP Chain Selectors
**Function:** `addChainSelector(uint64 chainSelector)`

Add Chainlink CCIP chain selectors for cross-chain communication.

```typescript
// Example for Sepolia
await intentManager.addChainSelector(10344971235874465080n); // Base Sepolia
await intentManager.addChainSelector(3478487238524512106n); // Arbitrum Sepolia
await intentManager.addChainSelector(5224473277236331295n); // Optimism Sepolia
```

**Chain Selectors:**
- Sepolia: `16015286601586328007`
- Base Sepolia: `10344971235874465080`
- Arbitrum Sepolia: `3478487238524512106`
- Optimism Sepolia: `5224473277236331295`

### 2. Authorize Executors
**Function:** `addExecutor(address executor)`

Authorize addresses that can execute intents. The deployer is automatically granted EXECUTOR_ROLE in the constructor, but you may want to add additional executors.

```typescript
// Authorize deployer or trusted executor
await intentManager.addExecutor(deployerAddress);
```

### 3. Add Oracle
**Function:** `addOracle(address oracle)`

Add the Chainlink oracle adapter for price feeds.

```typescript
await intentManager.addOracle(oracleAdapterAddress);
```

### 4. Configure Payment Escrow Releasers
**Function (PaymentEscrow):** `authorizeReleaser(address releaser, bool authorized)`

Authorize IntentManager and ExecutionProxy to release escrowed funds.

```typescript
// Authorize IntentManager
await paymentEscrow.authorizeReleaser(intentManagerAddress, true);

// Authorize ExecutionProxy
await paymentEscrow.authorizeReleaser(executionProxyAddress, true);
```

### 5. Set Chainlink Price Feeds (Optional but Recommended)
**Function (OracleAdapter):** `addPriceFeed(address token, address priceFeed)`

Add Chainlink price feeds for tokens used in intents.

```typescript
// Example: Add ETH/USD price feed
await oracleAdapter.addPriceFeed(
  "0x0000000000000000000000000000000000000000", // Native ETH
  "0x694AA1769357215DE4FAC081bf1f309aDC325306"  // ETH/USD feed on Sepolia
);
```

### 6. Register Test Agents (Optional)
**Function (AgentRegistry):** `registerAgent(string memory ensName, string memory specialization)`

Register test agents for testing intent creation.

```typescript
await agentRegistry.registerAgent(
  "test-agent.solver.eth",
  "Yield Optimization",
  { value: ethers.parseEther("1.0") } // Stake amount
);
```

## 🚀 Quick Setup Script

Run the automated setup script:

```bash
# For Sepolia
npx hardhat run scripts/setup-intent-manager.ts --network sepolia

# For Base Sepolia
npx hardhat run scripts/setup-intent-manager.ts --network baseSepolia
```

## 📋 Setup Checklist

Before creating intents, verify:

- [x] LayerZero peers set (✅ Already done)
- [ ] CCIP chain selectors added (`addChainSelector`)
- [ ] At least one executor authorized (`addExecutor`)
- [ ] Oracle added (`addOracle`)
- [ ] Payment escrow releasers authorized (`addAuthorizedReleaser` on PaymentEscrow)
- [ ] Price feeds added (optional - `addPriceFeed` on OracleAdapter)
- [ ] Test agents registered (optional - `registerAgent` on AgentRegistry)

**Note:** IntentManager doesn't require explicit "set" calls for executionProxy, agentRegistry, or paymentEscrow. These contracts work together via their deployed addresses.

## 🔍 Verification

After setup, verify configurations:

```typescript
// Check executor authorization
const isExecutor = await intentManager.validExecutors(deployerAddress);

// Check oracle
const isOracle = await intentManager.validOracles(oracleAdapterAddress);

// Check CCIP chain selector
const isSupported = await intentManager.supportedChainSelectors(chainSelector);

// Check payment escrow releasers
const isReleaser = await paymentEscrow.authorizedReleasers(intentManagerAddress);
```

## ⚠️ Important Notes

1. **All setup functions require admin/owner privileges** - Ensure you're using the deployer account
2. **Network-specific addresses** - Update contract addresses in the setup script for your network
3. **Gas costs** - Setup transactions require gas, ensure sufficient balance
4. **Order matters** - Set dependencies (oracle, registry, escrow) before setting them in IntentManager

## 🐛 Troubleshooting

**Error: "Unauthorized"**
- Ensure you're using the deployer/owner account
- Check contract ownership

**Error: "Contract not set"**
- Verify all contract addresses are correct
- Ensure contracts are deployed on the network

**Error: "Invalid address"**
- Verify contract addresses are checksummed correctly
- Check that contracts exist on the network

