# Smart Contracts - Omnichain Intent Settlement Layer

Hardhat-based smart contract suite implementing the core intent settlement protocol with LayerZero, Chainlink, and Filecoin integrations.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Contracts](#contracts)
- [Deployment](#deployment)
- [Testing](#testing)
- [Verification](#verification)
- [Scripts](#scripts)

## 🌟 Overview

The contracts implement:
- **Intent Management** - Lifecycle and state management
- **Agent Registry** - Agent registration and reputation
- **Cross-Chain Execution** - LayerZero OApp integration
- **Price Validation** - Chainlink oracle integration
- **Escrow Management** - Secure fund handling

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         IntentManager                  │
│  - Intent lifecycle                    │
│  - Agent selection                     │
│  - LayerZero OApp                      │
└──────┬──────────────┬──────────────────┘
       │              │
┌──────▼──────┐ ┌─────▼──────────────┐
│AgentRegistry│ │ ExecutionProxy      │
│- Staking    │ │- Cross-chain exec  │
│- Reputation │ │- Route validation  │
└─────────────┘ └─────┬──────────────┘
                      │
              ┌───────▼────────┐
              │ PaymentEscrow  │
              │- Fund holding  │
              │- Agent rewards │
              └────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Hardhat 3
- Wallet with testnet ETH

### Installation

```bash
cd contracts
npm install
```

### Environment Setup

Create a `.env` file in the `contracts/` directory:

```env
# Private Keys
PRIVATE_KEY=0x...your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# LayerZero Configuration
LAYERZERO_ENDPOINT_ID_SEPOLIA=40161
LAYERZERO_ENDPOINT_ID_BASE_SEPOLIA=40245

# Chainlink Configuration
CHAINLINK_PRICE_FEED_ETH_USD_SEPOLIA=0x694AA1769357215DE4FAC081bf1f309aDC325306
CHAINLINK_PRICE_FEED_ETH_USD_BASE_SEPOLIA=0x4aDC67696bAd3839733643C2A0B869b22F6F0e9e

# Etherscan API Keys (for verification)
ETHERSCAN_API_KEY=your_etherscan_key
BASESCAN_API_KEY=your_basescan_key
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
npm run test:coverage
```

## 📜 Contracts

### Core Contracts

#### IntentManager.sol

Main contract managing intent lifecycle and LayerZero integration.

**Key Functions:**
- `createIntent()` - Create new intent
- `startBidding()` - Start agent bidding phase
- `submitProposal()` - Agent submits execution proposal
- `selectAgent()` - User selects winning agent
- `executeIntent()` - Execute the intent
- `sendIntentToChain()` - Send intent cross-chain via LayerZero

**Events:**
- `IntentCreated`
- `ProposalSubmitted`
- `AgentSelected`
- `IntentExecuted`

#### AgentRegistry.sol

Manages agent registration, staking, and reputation.

**Key Functions:**
- `registerAgent()` - Register new agent
- `updateReputation()` - Update agent reputation
- `stake()` - Agent stakes tokens
- `slash()` - Slash agent stake for misbehavior

#### ExecutionProxy.sol

Handles cross-chain execution and route validation.

**Key Functions:**
- `executeCrossChain()` - Execute on destination chain
- `validateRoute()` - Validate execution route
- `settle()` - Settle execution

#### PaymentEscrow.sol

Manages fund escrow and agent payments.

**Key Functions:**
- `deposit()` - Deposit funds to escrow
- `release()` - Release funds to agent
- `refund()` - Refund to user

#### ChainlinkOracleAdapter.sol

Integrates Chainlink price feeds for validation.

**Key Functions:**
- `getLatestPrice()` - Get latest price feed
- `validatePrice()` - Validate price data
- `getPriceFeed()` - Get price feed address

### Interfaces

- `ICrossChainIntent.sol` - Cross-chain intent interface
- `ICCIPReceiver.sol` - CCIP receiver interface
- `IErrors.sol` - Custom error definitions

### Libraries

- `CrossChainMessageLib.sol` - Cross-chain message encoding/decoding

## 🚢 Deployment

### Local Network

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npm run deploy:local
```

### Testnet Deployment

#### Sepolia

```bash
npm run deploy:sepolia
# or
npx hardhat run scripts/deploy.ts --network sepolia
```

#### Base Sepolia

```bash
npm run deploy:base-sepolia
# or
npx hardhat run scripts/deploy.ts --network baseSepolia
```

#### Multi-Chain Deployment

```bash
# Deploy to all configured testnets
npm run deploy:all-testnets
```

### Deployment Scripts

- `scripts/deploy.ts` - Main deployment script
- `scripts/deploy-multi-chain.ts` - Multi-chain deployment
- `scripts/setup-peers.ts` - Configure LayerZero peers
- `scripts/setup-price-feeds.ts` - Configure Chainlink price feeds
- `scripts/register-test-agent.ts` - Register test agent

### Post-Deployment Setup

After deployment, configure cross-chain peers:

```bash
# Setup LayerZero peers
npx hardhat run scripts/setup-peers-sepolia.ts --network sepolia
npx hardhat run scripts/setup-peers-base-sepolia.ts --network baseSepolia

# Setup Chainlink price feeds
npx hardhat run scripts/setup-price-feeds.ts --network sepolia
```

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Specific Test Suite

```bash
# Intent Manager tests
npx hardhat test test/IntentManager.test.ts

# Agent Registry tests
npx hardhat test test/AgentRegistry.test.ts

# Cross-chain tests
npx hardhat test test/CrossChainIntentManager.test.ts
```

### Test Coverage

```bash
npm run test:coverage
```

### Test Structure

```
test/
├── IntentManager.test.ts          # Intent lifecycle tests
├── AgentRegistry.test.ts          # Agent registration tests
├── ExecutionProxy.test.ts         # Execution tests
├── PaymentEscrow.test.ts          # Escrow tests
├── CrossChainIntentManager.test.ts # Cross-chain tests
├── Integration.test.ts            # End-to-end tests
└── fixtures.ts                    # Test fixtures
```

## ✅ Verification

### Verify on Etherscan

```bash
# Verify single contract
npm run verify:sepolia

# Verify all contracts
npm run verify:all

# Verify with custom script
npx hardhat run scripts/verify.ts --network sepolia
```

### Manual Verification

See [QUICK_VERIFY.md](./QUICK_VERIFY.md) for detailed verification steps.

## 📜 Scripts

### Available Scripts

```bash
# Deployment
npm run deploy:local          # Deploy to local network
npm run deploy:sepolia        # Deploy to Sepolia
npm run deploy:base-sepolia   # Deploy to Base Sepolia
npm run deploy:all-testnets   # Deploy to all testnets

# Verification
npm run verify:sepolia        # Verify on Sepolia
npm run verify:base-sepolia   # Verify on Base Sepolia
npm run verify:all            # Verify all contracts

# Testing
npm run test                  # Run all tests
npm run test:coverage         # Test coverage
npm run test:gas              # Gas usage reports

# Utilities
npm run compile               # Compile contracts
npm run clean                 # Clean artifacts
npm run size                  # Contract size analysis
```

### Interaction Scripts

```bash
# Call Chainlink functions
npx hardhat run scripts/call-chainlink.ts --network sepolia

# Call LayerZero functions
npx hardhat run scripts/call-layerzero.ts --network sepolia

# Call ExecutionProxy functions
npx hardhat run scripts/call-execution-proxy.ts --network sepolia
```

## 🔧 Configuration

### Hardhat Config

The `hardhat.config.ts` includes:
- Network configurations (Sepolia, Base Sepolia)
- LayerZero endpoint IDs
- Chainlink price feed addresses
- Compiler settings (Solidity 0.8.24)
- Gas optimization settings

### Network Settings

| Network | Chain ID | LayerZero EID | RPC Required |
|---------|----------|---------------|--------------|
| Sepolia | 11155111 | 40161 | Yes |
| Base Sepolia | 84532 | 40245 | Yes |
| Local | 31337 | - | No |

## 📚 Documentation

### Contract Documentation

- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)
- [Integration Examples](./INTEGRATION_EXAMPLES.md)
- [Technology Integration](./TECHNOLOGY_INTEGRATION.md)
- [Setup Guide](./SETUP_GUIDE.md)

### Integration Guides

- [Chainlink Price Feeds](./CHAINLINK_PRICE_FEEDS.md)
- [LayerZero Qualification](./LAYERZERO_QUALIFICATION_ANALYSIS.md)
- [Peer Configuration](./PEER_CONFIGURATION_STATUS.md)

## 🐛 Troubleshooting

### Compilation Errors

```bash
# Clear cache and recompile
npx hardhat clean
npm run compile
```

### Deployment Failures

1. Check RPC URL is accessible
2. Verify private key has sufficient funds
3. Check gas prices
4. Review deployment logs

### Verification Issues

1. Ensure contract is deployed
2. Check constructor arguments match
3. Verify network and API key
4. Try manual verification via Etherscan UI

## 📝 Notes

- Contracts use **Solidity 0.8.24** with optimizations enabled
- LayerZero integration requires proper peer configuration
- Chainlink price feeds must be configured per network
- Filecoin CIDs are stored as `bytes32` in contracts

## 🔗 Related Documentation

- [Main README](../README.md)
- [Backend README](../backend/README.md)
- [Deployment Guide](./DEPLOYMENT_SUMMARY.md)

