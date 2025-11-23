# Complete Roadmap: Contracts, Frontend & Integration

## 🎯 Overview

This document outlines the complete roadmap for finishing the Omnichain Intent Settlement Layer, covering smart contracts, frontend UI, and full-stack integration.

---

## 📋 Part 1: Smart Contract Enhancements

### 1.1 Missing Core Functions

#### IntentManager.sol
- [ ] **`executeIntent()`** - Complete intent execution logic
  - Validate agent proposal
  - Execute on-chain actions
  - Release escrow
  - Update intent status
  
- [ ] **`cancelIntent()`** - Allow users to cancel intents
  - Refund escrowed funds
  - Update status
  - Emit cancellation event

- [ ] **`disputeIntent()`** - Dispute resolution mechanism
  - Create dispute
  - Escalate to arbitration
  - Slash agent stake if malicious

- [ ] **`updateIntentDeadline()`** - Extend deadline if needed
  - Validate caller is intent creator
  - Update deadline
  - Emit event

#### AgentRegistry.sol
- [ ] **`updateAgentReputation()`** - Update reputation after intent completion
  - Increase/decrease based on performance
  - Update success rate
  - Calculate new reputation score

- [ ] **`slashAgent()`** - Slash agent stake for malicious behavior
  - Validate slashing conditions
  - Transfer stake to treasury
  - Update agent status

- [ ] **`withdrawStake()`** - Allow agents to withdraw unstaked tokens
  - Validate withdrawal period
  - Check minimum stake requirements
  - Transfer tokens

#### ExecutionProxy.sol
- [ ] **`executeSwap()`** - Complete swap execution logic
  - Integrate with DEX (Uniswap, etc.)
  - Handle slippage
  - Transfer tokens
  - Emit execution proof

- [ ] **`batchExecute()`** - Execute multiple intents in one transaction
  - Validate all intents
  - Execute sequentially
  - Handle partial failures

#### PaymentEscrow.sol
- [ ] **`releaseEscrow()`** - Complete escrow release logic
  - Validate release conditions
  - Transfer funds
  - Update escrow status

- [ ] **`refundEscrow()`** - Refund escrow on cancellation
  - Validate refund conditions
  - Transfer back to user
  - Update status

### 1.2 Integration Functions

- [ ] **DEX Integration** - Connect to Uniswap V3/V2, Curve, etc.
  ```solidity
  interface IDEXRouter {
    function swapExactTokensForTokens(...) external returns (uint[] memory);
  }
  ```

- [ ] **ENS Integration** - Resolve ENS names for agents
  ```solidity
  interface IENS {
    function resolve(bytes32 node) external view returns (address);
  }
  ```

- [ ] **Filecoin/IPFS Integration** - Store and retrieve metadata
  ```solidity
  function storeToFilecoin(bytes32 cid) external;
  function retrieveFromFilecoin(bytes32 cid) external view returns (bytes memory);
  ```

### 1.3 Security Enhancements

- [ ] **Rate Limiting** - Prevent spam/abuse
- [ ] **Pausable** - Emergency pause functionality
- [ ] **Timelock** - For critical admin functions
- [ ] **Multi-sig** - For treasury/important operations

---

## 🎨 Part 2: Frontend Development

### 2.1 Core Pages (Priority: High)

#### Landing Page (`/`)
- [x] Hero section with animated background
- [x] Features grid
- [x] Architecture diagram
- [ ] **Add:** Live stats (intents created, agents active, cross-chain volume)
- [ ] **Add:** Demo video/recording
- [ ] **Add:** Testimonials/social proof

#### Dashboard (`/dashboard`)
- [ ] **Connect Wallet** - Wagmi/RainbowKit integration
- [ ] **Portfolio Overview**
  - Total intents created
  - Active intents count
  - Total value locked
  - Cross-chain activity
  
- [ ] **Quick Actions**
  - Create new intent button
  - View active intents
  - Agent marketplace link

#### Intent Composer (`/intent/new`)
- [ ] **Natural Language Input**
  - Text area with suggestions
  - AI interpretation preview
  - Real-time parsing feedback
  
- [ ] **Intent Configuration**
  - Token selection (with balance display)
  - Amount input
  - Deadline picker
  - Slippage tolerance slider
  
- [ ] **Chain Selection**
  - Multi-chain selector
  - Show LayerZero fees
  - Estimated gas costs
  
- [ ] **Preview & Submit**
  - Review intent details
  - Show estimated costs
  - Submit transaction
  - Loading states

#### Intent Detail Page (`/intent/:id`)
- [ ] **Intent Status Display**
  - Current status badge
  - Timeline visualization
  - Progress indicators
  
- [ ] **Agent Proposals**
  - List all proposals
  - Sort by APY, reputation, timeline
  - Select agent button
  
- [ ] **Execution Details**
  - Transaction hashes
  - Cross-chain message status
  - LayerZero message tracking
  
- [ ] **Actions**
  - Cancel intent (if allowed)
  - Dispute intent
  - View on block explorer

#### Agent Marketplace (`/agents`)
- [ ] **Agent List**
  - Grid/list view toggle
  - Filter by specialization
  - Sort by reputation, stake, success rate
  
- [ ] **Agent Cards**
  - ENS name/avatar
  - Reputation score
  - Staked amount
  - Success rate
  - Specializations
  - "Hire Agent" button
  
- [ ] **Agent Detail Modal**
  - Full profile
  - Historical performance
  - Past intents fulfilled
  - Reviews/ratings

#### Agent Battle Room (`/intent/:id/agents`)
- [ ] **Real-time Agent Race**
  - Animated agent avatars
  - Live proposal updates
  - APY comparison chart
  - Timer countdown
  
- [ ] **Proposal Details**
  - Strategy breakdown
  - Expected costs
  - Timeline
  - Risk assessment
  
- [ ] **Selection Interface**
  - Compare proposals side-by-side
  - Select winner
  - Confirm selection

#### Execution Visualizer (`/intent/:id/execution`)
- [ ] **Cross-Chain Flow Diagram**
  - Animated chain connections
  - Token flow visualization
  - Step-by-step progress
  
- [ ] **Transaction List**
  - All transactions in flow
  - Status indicators
  - Links to block explorers
  
- [ ] **LayerZero Message Tracking**
  - Message GUID
  - Source/destination chains
  - Delivery status
  - Fee breakdown

### 2.2 Components Library

#### Wallet Components
- [ ] **WalletConnectButton** - Connect/disconnect wallet
- [ ] **ENSName** - Display ENS name or address
- [ ] **ChainSelector** - Switch between networks
- [ ] **BalanceDisplay** - Show token balances

#### Intent Components
- [ ] **IntentCard** - Display intent summary
- [ ] **IntentStatusBadge** - Status indicator
- [ ] **IntentTimeline** - Visual timeline
- [ ] **AgentProposalCard** - Agent proposal display

#### Agent Components
- [ ] **AgentCard** - Agent profile card
- [ ] **ReputationBadge** - Reputation score display
- [ ] **StakeDisplay** - Staked amount with formatting
- [ ] **SpecializationTags** - Agent specializations

#### Execution Components
- [ ] **ExecutionFlowGraph** - Cross-chain flow visualization
- [ ] **TransactionList** - List of transactions
- [ ] **MessageTracker** - LayerZero message status
- [ ] **PriceFeedDisplay** - Chainlink price data

#### UI Components
- [ ] **LoadingSpinner** - Loading states
- [ ] **ErrorBoundary** - Error handling
- [ ] **ToastNotifications** - Success/error toasts
- [ ] **Modal** - Reusable modal
- [ ] **Tooltip** - Helpful tooltips

### 2.3 State Management

- [ ] **Web3 Context** - Wallet connection state
- [ ] **Intent Context** - Intent data and operations
- [ ] **Agent Context** - Agent data and filtering
- [ ] **Chain Context** - Multi-chain state
- [ ] **Notification Context** - Toast notifications

### 2.4 Hooks

- [ ] **`useIntent()`** - Intent operations
  ```typescript
  const { createIntent, getIntent, intents } = useIntent();
  ```

- [ ] **`useAgent()`** - Agent operations
  ```typescript
  const { agents, registerAgent, getAgent } = useAgent();
  ```

- [ ] **`useCrossChain()`** - Cross-chain operations
  ```typescript
  const { sendCrossChain, trackMessage } = useCrossChain();
  ```

- [ ] **`usePriceFeed()`** - Price data
  ```typescript
  const { getPrice, prices } = usePriceFeed();
  ```

---

## 🔌 Part 3: Backend Integration

### 3.1 API Endpoints

#### Intent Endpoints
```
POST   /api/intents              - Create intent
GET    /api/intents              - List intents
GET    /api/intents/:id          - Get intent details
POST   /api/intents/:id/cancel   - Cancel intent
POST   /api/intents/:id/dispute  - Create dispute
```

#### Agent Endpoints
```
GET    /api/agents               - List agents
GET    /api/agents/:id           - Get agent details
POST   /api/agents/register      - Register agent
GET    /api/agents/:id/proposals - Get agent proposals
```

#### Execution Endpoints
```
POST   /api/execution/execute    - Execute intent
GET    /api/execution/:id        - Get execution status
GET    /api/execution/:id/txns   - Get transaction list
```

#### Cross-Chain Endpoints
```
POST   /api/cross-chain/send     - Send cross-chain message
GET    /api/cross-chain/:guid    - Track message status
GET    /api/cross-chain/fee      - Get messaging fee quote
```

### 3.2 Event Listeners

- [ ] **Intent Events**
  - `IntentCreated` - Store in database
  - `IntentExecuted` - Update status
  - `IntentCancelled` - Process refund
  
- [ ] **Agent Events**
  - `AgentRegistered` - Add to database
  - `ProposalSubmitted` - Notify user
  - `AgentSelected` - Update intent
  
- [ ] **Cross-Chain Events**
  - `CrossChainMessageSent` - Track message
  - `CrossChainMessageReceived` - Update status
  - `SwapExecuted` - Complete intent

### 3.3 Services

- [ ] **IntentService** - Intent business logic
- [ ] **AgentService** - Agent management
- [ ] **ExecutionService** - Execution orchestration
- [ ] **LayerZeroService** - Cross-chain messaging
- [ ] **ChainlinkService** - Price feed integration
- [ ] **FilecoinService** - IPFS/Filecoin storage

### 3.4 Database Schema

```typescript
// Intent
interface Intent {
  id: string;
  userId: string;
  intentSpec: string;
  status: IntentStatus;
  amount: string;
  token: string;
  deadline: Date;
  filecoinCid: string;
  createdAt: Date;
  executedAt?: Date;
}

// Agent
interface Agent {
  id: string;
  address: string;
  ensName?: string;
  reputation: number;
  stake: string;
  specialization: string[];
  successRate: number;
}

// Proposal
interface Proposal {
  id: string;
  intentId: string;
  agentId: string;
  strategy: string;
  expectedCost: string;
  expectedAPY: number;
  timeline: number;
}
```

---

## 🔗 Part 4: Integration Points

### 4.1 Frontend ↔ Contracts

- [ ] **Contract Addresses** - Load from deployment files
- [ ] **ABI Loading** - Load contract ABIs
- [ ] **Read Operations** - Use wagmi hooks
- [ ] **Write Operations** - Transaction handling
- [ ] **Event Listening** - Real-time updates

### 4.2 Frontend ↔ Backend

- [ ] **API Client** - Axios/fetch wrapper
- [ ] **Authentication** - Wallet signature verification
- [ ] **Error Handling** - Consistent error messages
- [ ] **Loading States** - UX feedback

### 4.3 Backend ↔ Contracts

- [ ] **Web3 Provider** - Connect to RPC nodes
- [ ] **Contract Instances** - Create contract instances
- [ ] **Event Subscriptions** - Listen to events
- [ ] **Transaction Monitoring** - Track tx status

### 4.4 External Integrations

- [ ] **LayerZero SDK** - Cross-chain message tracking
- [ ] **Chainlink Data Feeds** - Price data
- [ ] **ENS Resolution** - Name resolution
- [ ] **IPFS/Filecoin** - Metadata storage
- [ ] **DEX Aggregators** - Swap execution

---

## 🚀 Part 5: Implementation Priority

### Phase 1: Core Functionality (Week 1-2)
1. Complete contract execution functions
2. Basic frontend pages (Dashboard, Intent Composer)
3. Wallet connection
4. Create intent flow

### Phase 2: Agent System (Week 3-4)
1. Agent marketplace page
2. Proposal submission
3. Agent selection
4. Reputation system

### Phase 3: Cross-Chain (Week 5-6)
1. Cross-chain intent sending
2. Execution visualizer
3. Message tracking
4. Multi-chain support

### Phase 4: Polish & Testing (Week 7-8)
1. UI/UX improvements
2. Error handling
3. Testing
4. Documentation

---

## 📝 Part 6: Specific Implementation Tasks

### Contract Tasks

```solidity
// 1. Complete executeIntent function
function executeIntent(uint256 _intentId) external {
    // Validate intent
    // Execute agent strategy
    // Release escrow
    // Update status
}

// 2. Add DEX integration
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

// 3. Add ENS resolution
import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
```

### Frontend Tasks

```typescript
// 1. Create useIntent hook
export function useIntent() {
  const { data: intents } = useContractRead({
    address: INTENT_MANAGER_ADDRESS,
    abi: intentManagerABI,
    functionName: 'getUserIntents',
    args: [address],
  });
  
  return { intents, createIntent, executeIntent };
}

// 2. Create IntentComposer component
export function IntentComposer() {
  const [intentSpec, setIntentSpec] = useState('');
  const { createIntent } = useIntent();
  
  // Implementation
}
```

### Backend Tasks

```typescript
// 1. Create IntentService
@Injectable()
export class IntentService {
  async createIntent(data: CreateIntentDto) {
    // Validate
    // Call contract
    // Store in DB
    // Emit event
  }
}

// 2. Event listener
@OnEvent('IntentCreated')
handleIntentCreated(event: IntentCreatedEvent) {
  // Store in database
  // Notify frontend
}
```

---

## ✅ Checklist Summary

### Contracts
- [ ] Complete execution functions
- [ ] Add DEX integration
- [ ] Add ENS support
- [ ] Security enhancements
- [ ] Gas optimization

### Frontend
- [ ] All pages implemented
- [ ] Components library complete
- [ ] State management setup
- [ ] Wallet integration
- [ ] Responsive design

### Backend
- [ ] API endpoints complete
- [ ] Event listeners working
- [ ] Database schema
- [ ] External integrations
- [ ] Error handling

### Integration
- [ ] Frontend ↔ Contracts
- [ ] Frontend ↔ Backend
- [ ] Backend ↔ Contracts
- [ ] External services

---

## 🎯 Next Immediate Steps

1. **Complete `executeIntent()` function** in IntentManager.sol
2. **Build Intent Composer page** in frontend
3. **Create API endpoints** for intent operations
4. **Set up event listeners** for real-time updates
5. **Test end-to-end flow** from intent creation to execution

---

**Ready to start? Let's begin with the highest priority items!**

