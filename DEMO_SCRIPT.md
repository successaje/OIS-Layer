# Demo Script

2-minute demo flow for Omnichain Intent Settlement Layer.

## Prerequisites

1. Start local Hardhat node: `cd contracts && npm run node`
2. Start backend: `cd backend && npm run start:dev`
3. Start frontend: `cd frontend && npm run dev`
4. Ensure Llama 3.2 API is running on `http://localhost:8000`

## Demo Flow

### 1. Landing Page (10 seconds)
- Show hero section with 3-step flow
- Highlight cross-chain, AI agents, Chainlink, and Filecoin integrations
- Click "Get Started"

### 2. Wallet Connection (15 seconds)
- Connect wallet (MetaMask or WalletConnect)
- Show ENS name resolution
- Display connected chains and balances

### 3. Compose Intent (30 seconds)
- Navigate to Compose Intent page
- Enter intent: "Get me 5% yield on stablecoins across any chain; rebalance if rates change"
- Set parameters:
  - Amount: 10,000 USDC
  - Slippage: 1%
  - Deadline: 7 days
  - Chains: Ethereum, Arbitrum, Base
- Click "Create Intent"
- Show Filecoin CID for stored intent metadata

### 4. Agent Auction (30 seconds)
- Navigate to auction page
- Show 5 agents competing:
  - Agent 1: 5.2% APY, Cost: 0.01 ETH
  - Agent 2: 4.8% APY, Cost: 0.009 ETH
  - Agent 3: 5.5% APY, Cost: 0.012 ETH
  - Agent 4: 4.9% APY, Cost: 0.008 ETH
  - Agent 5: 5.3% APY, Cost: 0.01 ETH
- Show animated bidding with agent cards sliding in
- Display confidence scores and Filecoin proof CIDs

### 5. Select Winner (15 seconds)
- Select Agent 3 (highest APY: 5.5%)
- Show signed strategy proposal
- Display Filecoin CID for agent proof
- Click "Execute Intent"

### 6. Cross-Chain Execution (30 seconds)
- Show LayerZero message being sent
- Display cross-chain timeline animation:
  - Source: Ethereum
  - Message: LayerZero protocol
  - Destination: Arbitrum
- Show execution events:
  - Intent executed on Arbitrum
  - Funds settled atomically
  - Agent reputation updated

### 7. View Results (20 seconds)
- Navigate to Intent History
- Show completed intent with:
  - Execution proof (LayerZero transaction hash)
  - Agent strategy details
  - Filecoin CIDs for metadata and proofs
  - Final APY achieved: 5.4%
  - Cross-chain transaction details

## Console Demonstrations

During demo, show in terminal:

1. **Backend logs**:
   - Intent created and stored to Filecoin
   - Agent proposals generated via Llama 3.2
   - Chainlink price feeds queried
   - LayerZero fee estimation

2. **Hardhat test run**:
   ```bash
   cd contracts && npm run test
   ```
   - Show passing tests for IntentManager
   - Show AgentRegistry tests
   - Show cross-chain simulation tests

3. **CRE workflow simulation** (if available):
   - Show Chainlink CRE workflow run
   - Display workflow logs

## Key Features to Highlight

1. **LayerZero Integration**
   - Cross-chain messaging
   - Atomic settlement
   - Intent-anchored execution

2. **Chainlink Integration**
   - Price feeds for validation
   - CRE workflows for orchestration
   - On-chain price checks

3. **Filecoin Storage**
   - Intent metadata stored
   - Agent proofs stored
   - Verifiable audit trail

4. **Llama 3.2 AI**
   - Strategy generation
   - Market analysis
   - Risk assessment

5. **User Experience**
   - One-click intent creation
   - Transparent agent competition
   - Real-time auction updates
   - Cross-chain timeline visualization

## Expected Demo Time: ~2 minutes

## Troubleshooting

If Llama API is unavailable:
- Demo uses fallback strategy generation
- Show mock responses with confidence scores

If LayerZero endpoint unavailable:
- Use local mock endpoint
- Show simulated cross-chain messages

If Filecoin unavailable:
- Use mock CIDs for demo
- Show UI integration with Filecoin

