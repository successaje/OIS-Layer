# Deployment Summary - All Networks

## 📊 Overview

This document summarizes all contract deployments across different networks.

---

## 🌐 Sepolia (Ethereum Testnet)

**Network:** Sepolia  
**Chain ID:** 11155111  
**Status:** ✅ Deployed & Verified

| Contract | Address |
|----------|---------|
| IntentManager | `0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3` |
| AgentRegistry | `0x3500C12Fbc16CB9beC23362b7524306ccac5018B` |
| PaymentEscrow | `0x6b27B5864cEF6DC12159cD1DC5b335d6abcFC1a5` |
| ExecutionProxy | `0xcA834417fb31B46Db5544e0ddF000b3a822aD9dA` |
| ChainlinkOracleAdapter | `0x857a55F93d14a348003356A373D2fCc926b18A7E` |
| ReputationToken | `0xc7024823429a8224d32e076e637413CC4eF4E26B` |

**View on Etherscan:** https://sepolia.etherscan.io

---

## 🟦 Base Sepolia

**Network:** Base Sepolia  
**Chain ID:** 84532  
**Status:** ✅ Deployed | ⏳ Verification Pending

| Contract | Address |
|----------|---------|
| IntentManager | `0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7` |
| AgentRegistry | `0x47f4917805C577a168d411b4531F2A49fBeF311e` |
| PaymentEscrow | `0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892` |
| ExecutionProxy | `0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E` |
| ChainlinkOracleAdapter | `0x603FD7639e33cAf15336E5BB52E06558122E4832` |
| ReputationToken | `0x5467EB13A408C48EB02811E92968F6e2A2556040` |

**View on Basescan:** https://sepolia.basescan.org

**Verification:** See `BASE_SEPOLIA_DEPLOYMENT.md` for manual verification instructions.

---

## 🔗 Cross-Chain Configuration

### LayerZero V2 Endpoint IDs (EIDs)

| Network | EID | Endpoint Address |
|---------|-----|------------------|
| Sepolia | 40161 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |
| Base Sepolia | 40245 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |
| Arbitrum Sepolia | 40231 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |
| Optimism Sepolia | 40232 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |

### Chainlink CCIP Chain Selectors

| Network | Chain Selector | Router Address |
|---------|----------------|----------------|
| Sepolia | 16015286601757825753 | `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59` |
| Base Sepolia | 10344971235874465080 | `0x80AF2F44ed0469018922c9F483dc5A909862fdc2` |
| Arbitrum Sepolia | 3478487238524512106 | `0x2a9C5afB0d0e4BAb2AdaDA92493B3D313c4C3b0C` |
| Optimism Sepolia | 5224473277236331295 | `0x114A20A10b43D4115e5aeef7345a1A9844850E4E` |

---

## 📁 Deployment Files

- **Sepolia:** `contracts/deployments/sepolia.json`
- **Base Sepolia:** `contracts/deployments/baseSepolia.json`
- **Backend Config:** `backend/.contract-addresses.json`

---

## 🚀 Next Steps

1. ✅ **Sepolia** - Deployed and verified
2. ✅ **Base Sepolia** - Deployed (verification pending)
3. ⏳ **Arbitrum Sepolia** - Ready to deploy
4. ⏳ **Optimism Sepolia** - Ready to deploy
5. 🔗 **Cross-Chain Setup** - Configure peers between networks
6. 💰 **Price Feeds** - Add Chainlink feeds to OracleAdapter
7. 🤖 **Agent Registration** - Register agents on each network

---

## 📚 Documentation

- **Technology Integration:** `TECHNOLOGY_INTEGRATION.md`
- **Integration Examples:** `INTEGRATION_EXAMPLES.md`
- **Base Sepolia Details:** `BASE_SEPOLIA_DEPLOYMENT.md`

