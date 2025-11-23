# Base Sepolia Deployment Summary

## ✅ Deployment Complete

All contracts have been successfully deployed to **Base Sepolia** testnet.

**Network:** Base Sepolia  
**Chain ID:** 84532  
**Deployer:** `0x60eF148485C2a5119fa52CA13c52E9fd98F28e87`  
**Deployment Date:** 2025-11-22

---

## 📋 Contract Addresses

### Core Contracts

| Contract | Address | Basescan Link |
|----------|---------|---------------|
| **IntentManager** | `0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7` | [View on Basescan](https://sepolia.basescan.org/address/0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7) |
| **AgentRegistry** | `0x47f4917805C577a168d411b4531F2A49fBeF311e` | [View on Basescan](https://sepolia.basescan.org/address/0x47f4917805C577a168d411b4531F2A49fBeF311e) |
| **PaymentEscrow** | `0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892` | [View on Basescan](https://sepolia.basescan.org/address/0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892) |
| **ExecutionProxy** | `0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E` | [View on Basescan](https://sepolia.basescan.org/address/0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E) |
| **ChainlinkOracleAdapter** | `0x603FD7639e33cAf15336E5BB52E06558122E4832` | [View on Basescan](https://sepolia.basescan.org/address/0x603FD7639e33cAf15336E5BB52E06558122E4832) |
| **ReputationToken (MockERC20)** | `0x5467EB13A408C48EB02811E92968F6e2A2556040` | [View on Basescan](https://sepolia.basescan.org/address/0x5467EB13A408C48EB02811E92968F6e2A2556040) |

---

## ⚙️ Configuration

### LayerZero V2
- **Endpoint:** `0x6EDCE65403992e310A62460808c4b910D972f10f`
- **Endpoint ID (EID):** `40245`

### Chainlink CCIP
- **Router:** `0x80AF2F44ed0469018922c9F483dc5A909862fdc2`
- **Chain Selector:** `10344971235874465080`

### Other Settings
- **Minimum Stake:** `1 REP` (1000000000000000000 wei)

---

## 🔍 Manual Verification Instructions

If automated verification failed, you can verify contracts manually on Basescan:

### 1. MockERC20 (Reputation Token)

**Contract Address:** `0x5467EB13A408C48EB02811E92968F6e2A2556040`

**Constructor Arguments:**
```
"Reputation Token"
"REP"
```

**Verification Steps:**
1. Go to [Basescan Contract Page](https://sepolia.basescan.org/address/0x5467EB13A408C48EB02811E92968F6e2A2556040)
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Select "Solidity (Single file)" or "Solidity (Standard JSON Input)"
5. Enter compiler version: `0.8.24`
6. Enter optimization: `Yes` with `200` runs
7. Paste contract code from `contracts/MockERC20.sol`
8. Enter constructor arguments: `"Reputation Token","REP"`

---

### 2. AgentRegistry

**Contract Address:** `0x47f4917805C577a168d411b4531F2A49fBeF311e`

**Constructor Arguments (ABI-encoded):**
```
0x5467EB13A408C48EB02811E92968F6e2A2556040,  // reputationToken
1000000000000000000,                          // minStake (1 REP)
0x60eF148485C2a5119fa52CA13c52E9fd98F28e87,  // owner
84532                                         // chainId
```

**Verification Steps:**
1. Go to [Basescan Contract Page](https://sepolia.basescan.org/address/0x47f4917805C577a168d411b4531F2A49fBeF311e)
2. Click "Contract" tab → "Verify and Publish"
3. Select "Solidity (Standard JSON Input)"
4. Compiler: `0.8.24`, Optimization: `Yes` (200 runs), Via-IR: `Yes`
5. Upload `contracts/AgentRegistry.sol` and all dependencies
6. Enter constructor arguments as ABI-encoded

---

### 3. PaymentEscrow

**Contract Address:** `0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892`

**Constructor Arguments:**
```
0x60eF148485C2a5119fa52CA13c52E9fd98F28e87  // owner
```

**Verification Steps:**
1. Go to [Basescan Contract Page](https://sepolia.basescan.org/address/0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892)
2. Click "Contract" tab → "Verify and Publish"
3. Select "Solidity (Standard JSON Input)"
4. Compiler: `0.8.24`, Optimization: `Yes` (200 runs)
5. Upload contract and dependencies
6. Enter constructor argument: `0x60eF148485C2a5119fa52CA13c52E9fd98F28e87`

---

### 4. IntentManager

**Contract Address:** `0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7`

**Constructor Arguments (ABI-encoded):**
```
0x6EDCE65403992e310A62460808c4b910D972f10f,  // layerZeroEndpoint
0x80AF2F44ed0469018922c9F483dc5A909862fdc2,  // ccipRouter
0x60eF148485C2a5119fa52CA13c52E9fd98F28e87,  // owner
84532                                         // chainId
```

**Verification Steps:**
1. Go to [Basescan Contract Page](https://sepolia.basescan.org/address/0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7)
2. Click "Contract" tab → "Verify and Publish"
3. Select "Solidity (Standard JSON Input)"
4. Compiler: `0.8.24`, Optimization: `Yes` (200 runs), Via-IR: `Yes`
5. Upload `contracts/IntentManager.sol` and all dependencies:
   - `contracts/interfaces/IErrors.sol`
   - `contracts/interfaces/ICrossChainIntent.sol`
   - `contracts/interfaces/ICCIPReceiver.sol`
   - `contracts/libraries/CrossChainMessageLib.sol`
6. Enter constructor arguments as ABI-encoded

---

### 5. ExecutionProxy

**Contract Address:** `0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E`

**Constructor Arguments (ABI-encoded):**
```
0x6EDCE65403992e310A62460808c4b910D972f10f,  // endpoint
0x60eF148485C2a5119fa52CA13c52E9fd98F28e87,  // owner
0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7,  // intentManager
0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892   // paymentEscrow
```

**Verification Steps:**
1. Go to [Basescan Contract Page](https://sepolia.basescan.org/address/0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E)
2. Click "Contract" tab → "Verify and Publish"
3. Select "Solidity (Standard JSON Input)"
4. Compiler: `0.8.24`, Optimization: `Yes` (200 runs), Via-IR: `Yes`
5. Upload `contracts/ExecutionProxy.sol` and all dependencies
6. Enter constructor arguments as ABI-encoded

---

### 6. ChainlinkOracleAdapter

**Contract Address:** `0x603FD7639e33cAf15336E5BB52E06558122E4832`

**Constructor Arguments:**
```
0x60eF148485C2a5119fa52CA13c52E9fd98F28e87  // owner
```

**Verification Steps:**
1. Go to [Basescan Contract Page](https://sepolia.basescan.org/address/0x603FD7639e33cAf15336E5BB52E06558122E4832)
2. Click "Contract" tab → "Verify and Publish"
3. Select "Solidity (Standard JSON Input)"
4. Compiler: `0.8.24`, Optimization: `Yes` (200 runs)
5. Upload `contracts/ChainlinkOracleAdapter.sol` and dependencies
6. Enter constructor argument: `0x60eF148485C2a5119fa52CA13c52E9fd98F28e87`

---

## 🔗 Cross-Chain Setup

### LayerZero Peer Configuration

To enable cross-chain messaging, set up peers between Base Sepolia and other chains:

```solidity
// On Base Sepolia IntentManager
intentManager.setPeer(40231, arbitrumSepoliaIntentManager); // Arbitrum Sepolia
intentManager.setPeer(40161, sepoliaIntentManager);         // Sepolia
intentManager.setPeer(40232, optimismSepoliaIntentManager);   // Optimism Sepolia
```

### CCIP Chain Selector Configuration

Add supported chain selectors:

```solidity
// On Base Sepolia IntentManager
intentManager.addChainSelector(16015286601757825753); // Sepolia
intentManager.addChainSelector(3478487238524512106); // Arbitrum Sepolia
intentManager.addChainSelector(5224473277236331295); // Optimism Sepolia
```

---

## 📝 Next Steps

1. ✅ **Deployment Complete** - All contracts deployed
2. ⏳ **Verification** - Verify contracts manually on Basescan (see instructions above)
3. 🔗 **Cross-Chain Setup** - Configure LayerZero peers and CCIP chain selectors
4. 💰 **Price Feeds** - Add Chainlink price feeds to OracleAdapter
5. 🤖 **Agent Registration** - Register initial agents in AgentRegistry
6. 🧪 **Testing** - Test cross-chain intent flows

---

## 📊 Deployment Files

- **Deployment Info:** `contracts/deployments/baseSepolia.json`
- **Backend Config:** `backend/.contract-addresses.json`

---

## 🔍 Quick Links

- **Basescan Explorer:** https://sepolia.basescan.org
- **LayerZero Docs:** https://docs.layerzero.network/v2
- **Chainlink CCIP Docs:** https://docs.chain.link/ccip
- **Base Sepolia Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

## ✅ Verification Status

| Contract | Status | Notes |
|----------|--------|-------|
| MockERC20 | ⏳ Pending | Manual verification required |
| AgentRegistry | ⏳ Pending | Manual verification required |
| PaymentEscrow | ⏳ Pending | Manual verification required |
| IntentManager | ⏳ Pending | Manual verification required |
| ExecutionProxy | ⏳ Pending | Manual verification required |
| ChainlinkOracleAdapter | ⏳ Pending | Manual verification required |

**Note:** Automated verification encountered API key issues. Please verify manually using the instructions above or wait a few minutes and retry automated verification.

