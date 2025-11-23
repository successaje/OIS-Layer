# Next Steps After Deployment

## 🎯 Overview

After deploying contracts to Sepolia and Base Sepolia, here's your roadmap to get the Omnichain Intent Settlement Layer fully operational.

---

## ✅ Phase 1: Complete Verification (Priority: High)

### Current Status
- ✅ **Sepolia**: All contracts verified
- ⏳ **Base Sepolia**: Verification pending (API key issues)

### Action Items

1. **Verify Base Sepolia Contracts**
   - Option A: Wait 5-10 minutes and retry automated verification
   ```bash
   cd contracts
   ./scripts/verify-base-sepolia.sh
   ```
   - Option B: Manual verification via Basescan UI (see `BASE_SEPOLIA_DEPLOYMENT.md`)

2. **Verify on Additional Networks** (if deploying to more chains)
   - Arbitrum Sepolia
   - Optimism Sepolia

---

## 🔗 Phase 2: Cross-Chain Configuration (Priority: High)

### 2.1 LayerZero Peer Setup

Configure peers between networks so contracts can communicate cross-chain.

**Script:** `contracts/scripts/setup-cross-chain.ts`

```bash
# Run cross-chain setup
cd contracts
npx hardhat run scripts/setup-cross-chain.ts --network sepolia
npx hardhat run scripts/setup-cross-chain.ts --network baseSepolia
```

**Manual Setup (if script doesn't work):**

```typescript
// On Sepolia IntentManager
const sepoliaIntentManager = "0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3";
const baseSepoliaIntentManager = "0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7";

// Set peer on Sepolia → Base Sepolia (EID: 40245)
await intentManager.setPeer(40245, baseSepoliaIntentManager);

// Set peer on Base Sepolia → Sepolia (EID: 40161)
await intentManager.setPeer(40161, sepoliaIntentManager);
```

**Required Peers:**
- Sepolia ↔ Base Sepolia
- Sepolia ↔ Arbitrum Sepolia (if deployed)
- Base Sepolia ↔ Arbitrum Sepolia (if deployed)

### 2.2 Chainlink CCIP Chain Selectors

Add supported chain selectors for CCIP messaging.

```typescript
// On Sepolia IntentManager
await intentManager.addChainSelector(10344971235874465080n); // Base Sepolia
await intentManager.addChainSelector(3478487238524512106n);  // Arbitrum Sepolia

// On Base Sepolia IntentManager
await intentManager.addChainSelector(16015286601757825753n); // Sepolia
await intentManager.addChainSelector(3478487238524512106n);  // Arbitrum Sepolia
```

**Chain Selectors:**
- Sepolia: `16015286601757825753`
- Base Sepolia: `10344971235874465080`
- Arbitrum Sepolia: `3478487238524512106`
- Optimism Sepolia: `5224473277236331295`

---

## 💰 Phase 3: Configure Price Feeds (Priority: High)

### 3.1 Add Chainlink Price Feeds

Add price feeds for tokens you'll support in swaps.

**Sepolia Price Feed Addresses:**
- USDC/USD: `0xA2F78ab2355fe2f984D808B5E183E47E7360732D`
- DAI/USD: `0x14866185B1962B63C3E9E9F47B8F1B0A2A5a5F5e`
- ETH/USD: `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- WETH/USD: `0x4aDC67696bA383F43DD60A171e9278f74A5fB1f7`

**Base Sepolia Price Feed Addresses:**
- USDC/USD: Check Chainlink docs for Base Sepolia feeds
- ETH/USD: Check Chainlink docs

**Add Price Feeds:**

```typescript
// On Sepolia
const oracleAdapter = "0x857a55F93d14a348003356A373D2fCc926b18A7E";
const usdcAddress = "0x..."; // USDC token address
const usdcPriceFeed = "0xA2F78ab2355fe2f984D808B5E183E47E7360732D";
const stalenessThreshold = 3600; // 1 hour

await oracleAdapter.addPriceFeed(
  usdcAddress,
  usdcPriceFeed,
  stalenessThreshold
);
```

**Script to Add Price Feeds:**

Create `contracts/scripts/setup-price-feeds.ts`:

```typescript
import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  
  const oracleAdapter = await ethers.getContractAt(
    "ChainlinkOracleAdapter",
    "0x857a55F93d14a348003356A373D2fCc926b18A7E" // Sepolia
  );
  
  // Add USDC price feed
  await oracleAdapter.addPriceFeed(
    "0x...", // USDC token address
    "0xA2F78ab2355fe2f984D808B5E183E47E7360732D", // Price feed
    3600 // Staleness threshold (1 hour)
  );
  
  console.log("Price feeds configured!");
}

main().catch(console.error);
```

---

## 🤖 Phase 4: Agent Registration (Priority: Medium)

### 4.1 Register Initial Agents

Register agents that will fulfill intents.

```typescript
// On Sepolia
const agentRegistry = "0x3500C12Fbc16CB9beC23362b7524306ccac5018B";
const reputationToken = "0xc7024823429a8224d32e076e637413CC4eF4E26B";

// Approve tokens
await reputationToken.approve(agentRegistry, ethers.parseEther("10"));

// Register agent
await agentRegistry.registerAgent(
  "agent001.solver.eth", // ENS name (optional)
  "yield-farming",       // Specialization
  ethers.parseEther("10") // Stake amount
);
```

**Agent Specializations:**
- `yield-farming` - Best yield optimization
- `cross-chain-swap` - Cross-chain token swaps
- `liquidity-provision` - Liquidity management
- `arbitrage` - Arbitrage opportunities
- `defi-strategies` - Complex DeFi strategies

### 4.2 Cross-Chain Agent Sync

Sync agent registrations across chains.

```typescript
// On Sepolia, sync to Base Sepolia
await agentRegistry.syncCrossChainRegistration(
  agentId,
  84532, // Base Sepolia chain ID
  "0x" // LayerZero options
);
```

---

## 🧪 Phase 5: Testing (Priority: High)

### 5.1 Local Testing

Run test suite to ensure everything works:

```bash
cd contracts
npx hardhat test
```

### 5.2 Cross-Chain Integration Tests

Test cross-chain intent flows:

1. **Create Intent on Sepolia**
2. **Send to Base Sepolia via LayerZero**
3. **Execute on Base Sepolia**
4. **Verify completion**

**Test Script:**

Create `contracts/scripts/test-cross-chain.ts`:

```typescript
import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const [user] = await ethers.getSigners();
  
  // Connect to Sepolia IntentManager
  const intentManager = await ethers.getContractAt(
    "IntentManager",
    "0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3"
  );
  
  // Create intent
  const intentSpec = "Swap 1000 USDC for DAI on Base Sepolia";
  const filecoinCid = ethers.id("test-cid");
  const deadline = Math.floor(Date.now() / 1000) + 86400;
  
  const tx = await intentManager.createIntent(
    intentSpec,
    filecoinCid,
    deadline,
    ethers.ZeroAddress,
    { value: ethers.parseEther("0.01") }
  );
  
  const receipt = await tx.wait();
  console.log("Intent created:", receipt.hash);
  
  // Continue with cross-chain flow...
}

main().catch(console.error);
```

### 5.3 End-to-End Flow Test

1. ✅ Create intent
2. ✅ Agents submit proposals
3. ✅ User selects agent
4. ✅ Send cross-chain message
5. ✅ Execute on destination chain
6. ✅ Verify completion

---

## 🔌 Phase 6: Backend Integration (Priority: High)

### 6.1 Update Backend Configuration

The deployment script already saved addresses to `backend/.contract-addresses.json`. Update your backend to use these addresses.

**Backend Integration Points:**

1. **Intent API** - Connect to IntentManager
2. **Agent Service** - Connect to AgentRegistry
3. **Oracle Service** - Connect to ChainlinkOracleAdapter
4. **Execution Service** - Connect to ExecutionProxy

**Example Backend Config:**

```typescript
// backend/src/config/contracts.ts
export const CONTRACTS = {
  sepolia: {
    intentManager: "0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3",
    agentRegistry: "0x3500C12Fbc16CB9beC23362b7524306ccac5018B",
    executionProxy: "0xcA834417fb31B46Db5544e0ddF000b3a822aD9dA",
    oracleAdapter: "0x857a55F93d14a348003356A373D2fCc926b18A7E",
  },
  baseSepolia: {
    intentManager: "0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7",
    agentRegistry: "0x47f4917805C577a168d411b4531F2A49fBeF311e",
    executionProxy: "0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E",
    oracleAdapter: "0x603FD7639e33cAf15336E5BB52E06558122E4832",
  },
};
```

### 6.2 Event Listeners

Set up event listeners for contract events:

```typescript
// Listen for intent creation
intentManager.on("IntentCreated", (intentId, user, intentSpec) => {
  // Store in database
  // Notify agents
});

// Listen for cross-chain messages
intentManager.on("CrossChainMessageSent", (intentId, dstEid, guid) => {
  // Track cross-chain status
});

// Listen for execution
executionProxy.on("SwapExecuted", (swapId, dstAmount) => {
  // Update intent status
});
```

---

## 🎨 Phase 7: Frontend Integration (Priority: Medium)

### 7.1 Update Frontend Contract Addresses

Update frontend to use deployed contract addresses.

**Frontend Config:**

```typescript
// frontend/src/config/contracts.ts
export const CONTRACTS = {
  sepolia: {
    intentManager: "0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3",
    // ... other contracts
  },
  baseSepolia: {
    intentManager: "0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7",
    // ... other contracts
  },
};
```

### 7.2 Connect Wallet

Ensure wallet connection works with deployed contracts:

```typescript
import { useAccount, useContractRead } from 'wagmi';
import { intentManagerABI } from './abis';

function IntentComposer() {
  const { address } = useAccount();
  
  // Read from IntentManager
  const { data: intentCount } = useContractRead({
    address: CONTRACTS.sepolia.intentManager,
    abi: intentManagerABI,
    functionName: 'nextIntentId',
  });
  
  // Create intent
  const { write: createIntent } = useContractWrite({
    address: CONTRACTS.sepolia.intentManager,
    abi: intentManagerABI,
    functionName: 'createIntent',
  });
  
  // ...
}
```

---

## 📊 Phase 8: Monitoring & Analytics (Priority: Medium)

### 8.1 Set Up Monitoring

Monitor contract events and transactions:

1. **Event Monitoring** - Track all contract events
2. **Error Tracking** - Monitor failed transactions
3. **Gas Analytics** - Track gas usage
4. **Cross-Chain Status** - Monitor LayerZero/CCIP messages

### 8.2 Dashboard

Create admin dashboard to:
- View all intents
- Monitor agent performance
- Track cross-chain messages
- View price feed status

---

## 🔐 Phase 9: Security & Audits (Priority: High)

### 9.1 Security Checklist

- [ ] Review access control (roles and permissions)
- [ ] Verify reentrancy guards
- [ ] Check slippage protection
- [ ] Validate price feed staleness checks
- [ ] Review cross-chain message verification
- [ ] Test edge cases

### 9.2 Audit Preparation

Prepare for security audit:
- Complete test coverage
- Document all functions
- Create attack scenarios
- Review with team

---

## 📚 Phase 10: Documentation (Priority: Medium)

### 10.1 User Documentation

- [ ] User guide for creating intents
- [ ] Agent registration guide
- [ ] Cross-chain flow explanation
- [ ] FAQ

### 10.2 Developer Documentation

- [ ] API documentation
- [ ] Contract interaction examples
- [ ] Integration guides
- [ ] Troubleshooting guide

---

## 🚀 Quick Start Checklist

**Immediate Actions (Today):**

- [ ] Verify Base Sepolia contracts
- [ ] Set up LayerZero peers between Sepolia ↔ Base Sepolia
- [ ] Add CCIP chain selectors
- [ ] Add at least 2 price feeds (USDC, ETH)
- [ ] Register 1 test agent
- [ ] Test cross-chain intent flow

**This Week:**

- [ ] Complete backend integration
- [ ] Update frontend with contract addresses
- [ ] Set up event listeners
- [ ] Test end-to-end flow
- [ ] Deploy to additional networks (if needed)

**This Month:**

- [ ] Security review
- [ ] Performance optimization
- [ ] User documentation
- [ ] Monitoring dashboard
- [ ] Production deployment prep

---

## 🆘 Troubleshooting

### Common Issues

1. **Cross-chain messages not arriving**
   - Check LayerZero peers are set
   - Verify endpoint IDs are correct
   - Check message fees are sufficient

2. **Price feeds returning stale data**
   - Increase staleness threshold
   - Verify price feed addresses
   - Check Chainlink network status

3. **Agent proposals not appearing**
   - Verify agent is registered
   - Check agent has sufficient stake
   - Verify intent is in correct status

---

## 📞 Support Resources

- **LayerZero Docs:** https://docs.layerzero.network/v2
- **Chainlink Docs:** https://docs.chain.link
- **Base Docs:** https://docs.base.org
- **Project Docs:** See `TECHNOLOGY_INTEGRATION.md` and `INTEGRATION_EXAMPLES.md`

---

## 🎯 Success Metrics

Track these metrics to measure success:

- Number of intents created
- Cross-chain message success rate
- Agent participation rate
- Average intent fulfillment time
- Gas costs per operation
- Price feed accuracy

---

**Ready to proceed? Start with Phase 1 (Verification) and Phase 2 (Cross-Chain Setup) - these are critical for the system to function!**

