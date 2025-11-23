# Smart Contracts Documentation

## Overview

The Omnichain Intent Settlement Layer consists of a set of interconnected smart contracts that enable AI agents to execute user intents across multiple blockchain networks using LayerZero for cross-chain messaging, Chainlink for price feeds, and a reputation-based agent registry system.

## Contract Architecture

```
┌─────────────────┐
│ IntentManager   │ ← Core intent lifecycle management
└────────┬────────┘
         │
         ├──→ AgentRegistry (agent verification & reputation)
         ├──→ ExecutionProxy (cross-chain execution)
         ├──→ PaymentEscrow (fund escrow)
         └──→ ChainlinkOracleAdapter (price feeds)
```

---

## 1. IntentManager

**Purpose**: Core contract managing the complete intent lifecycle from creation to execution, with LayerZero integration for cross-chain messaging.

**Inherits**: `OApp`, `ReentrancyGuard`, `Ownable`

### Data Structures

#### `IntentStatus` Enum
```solidity
enum IntentStatus {
    Open,        // Intent created, waiting for bidding
    Bidding,     // Agents can submit proposals
    Executing,   // Agent selected, execution in progress
    Completed,  // Intent successfully executed
    Disputed,    // Intent under dispute
    Cancelled    // Intent cancelled
}
```

#### `Intent` Struct
```solidity
struct Intent {
    uint256 intentId;           // Unique intent identifier
    address user;               // Intent creator
    string intentSpec;          // Natural language + JSON specification
    uint256 amount;             // Escrowed amount
    address token;              // Token address (address(0) for native)
    IntentStatus status;        // Current status
    uint256 deadline;          // Execution deadline
    uint256 selectedAgentId;   // ID of selected agent
    bytes32 filecoinCid;        // Filecoin CID of stored metadata
    uint256 createdAt;         // Creation timestamp
    uint256 executedAt;         // Execution timestamp
}
```

#### `AgentProposal` Struct
```solidity
struct AgentProposal {
    uint256 proposalId;         // Unique proposal ID
    uint256 intentId;          // Associated intent ID
    uint256 agentId;            // Agent ID from AgentRegistry
    string strategy;            // JSON strategy proposal
    uint256 expectedCost;       // Expected execution cost
    uint256 expectedAPY;        // Expected APY if applicable
    uint256 timeline;           // Execution timeline in seconds
    bytes signature;            // Agent signature
    bytes32 proofCid;           // Filecoin CID of agent proof
    bool selected;              // Whether proposal was selected
    uint256 submittedAt;        // Submission timestamp
}
```

### Functions

#### `constructor(address _endpoint, address _owner)`
- **Purpose**: Initialize IntentManager with LayerZero endpoint
- **Parameters**:
  - `_endpoint`: LayerZero endpoint address
  - `_owner`: Contract owner address
- **Access**: Public

#### `createIntent(...)`
- **Purpose**: Create a new intent with escrowed funds
- **Parameters**:
  - `_intentSpec`: Natural language + structured JSON specification
  - `_filecoinCid`: CID of intent metadata stored on Filecoin
  - `_deadline`: Deadline for intent execution (1 hour to 30 days)
  - `_token`: Token address (address(0) for native ETH)
  - `_amount`: Amount to escrow
- **Returns**: `uint256` - New intent ID
- **Access**: Public, payable, nonReentrant
- **Events**: `IntentCreated`
- **Validations**:
  - Deadline must be 1 hour to 30 days from now
  - Intent spec must not be empty
  - Must deposit funds > 0

#### `startBidding(uint256 _intentId)`
- **Purpose**: Transition intent from Open to Bidding status
- **Parameters**:
  - `_intentId`: Intent ID to start bidding for
- **Access**: Public
- **Validations**:
  - Intent must be in Open status
  - Caller must be intent owner

#### `submitProposal(...)`
- **Purpose**: Submit an agent proposal for an intent
- **Parameters**:
  - `_intentId`: The intent ID
  - `_agentId`: Agent ID from AgentRegistry
  - `_strategy`: JSON strategy proposal
  - `_expectedCost`: Expected execution cost
  - `_expectedAPY`: Expected APY if applicable
  - `_timeline`: Execution timeline in seconds
  - `_signature`: Agent signature
  - `_proofCid`: Filecoin CID of agent proof
- **Returns**: `uint256` - Proposal ID
- **Access**: Public
- **Events**: `ProposalSubmitted`
- **Validations**:
  - Intent must be in Bidding status
  - Deadline must not have passed

#### `selectAgent(uint256 _intentId, uint256 _proposalId)`
- **Purpose**: Select winning agent proposal
- **Parameters**:
  - `_intentId`: Intent ID
  - `_proposalId`: Proposal ID to select
- **Access**: Public
- **Events**: `AgentSelected`
- **Validations**:
  - Caller must be intent owner
  - Intent must be in Bidding status
  - Proposal must exist and not already selected

#### `executeIntent(uint256 _intentId, bytes calldata _executionPayload)`
- **Purpose**: Execute intent after agent selection
- **Parameters**:
  - `_intentId`: Intent ID to execute
  - `_executionPayload`: Execution data
- **Access**: Public, nonReentrant
- **Events**: `IntentExecuted`
- **Validations**:
  - Intent must be in Executing status
  - Deadline must not have passed

#### `sendCrossChainExecution(...)`
- **Purpose**: Send cross-chain message for intent execution via LayerZero
- **Parameters**:
  - `_intentId`: Intent ID
  - `_dstEid`: Destination endpoint ID
  - `_payload`: Execution payload
  - `_options`: LayerZero options
- **Returns**: `MessagingReceipt` - LayerZero receipt
- **Access**: Public, payable
- **Events**: `CrossChainMessageSent`
- **Validations**:
  - Intent must be in Executing status
  - Must provide sufficient fee

#### `_lzReceive(...)`
- **Purpose**: Handle received cross-chain messages (LayerZero callback)
- **Parameters**:
  - `_origin`: Origin information
  - `_guid`: Message GUID
  - `_message`: Decoded message
  - `_executor`: Executor address
  - `_extraData`: Extra data
- **Access**: Internal (LayerZero callback)
- **Events**: `CrossChainMessageReceived`
- **Validations**:
  - Intent must exist
  - Intent must be in Executing status

#### `quoteCrossChainFee(...)`
- **Purpose**: Quote messaging fee for cross-chain execution
- **Parameters**:
  - `_dstEid`: Destination endpoint ID
  - `_message`: Message to send
  - `_options`: LayerZero options
  - `_payInLzToken`: Whether to pay in LZ token
- **Returns**: `MessagingFee` - Fee structure
- **Access**: Public, view

#### View Functions

- `getIntent(uint256 _intentId)`: Returns intent details
- `getIntentProposals(uint256 _intentId)`: Returns all proposals for an intent
- `getUserIntents(address _user)`: Returns all intent IDs for a user

### Events

- `IntentCreated(uint256 indexed intentId, address indexed user, string intentSpec, uint256 amount, bytes32 filecoinCid)`
- `ProposalSubmitted(uint256 indexed intentId, uint256 indexed proposalId, uint256 indexed agentId, bytes32 proofCid)`
- `AgentSelected(uint256 indexed intentId, uint256 indexed agentId, uint256 indexed proposalId)`
- `IntentExecuted(uint256 indexed intentId, bytes executionPayload)`
- `CrossChainMessageSent(uint256 indexed intentId, uint32 dstEid, bytes32 messageId)`
- `CrossChainMessageReceived(uint256 indexed intentId, uint32 srcEid, bytes payload)`

---

## 2. AgentRegistry

**Purpose**: Registry for AI agents with ENS verification, reputation staking, and slashing mechanisms.

**Inherits**: `Ownable`, `ReentrancyGuard`

### Data Structures

#### `Agent` Struct
```solidity
struct Agent {
    uint256 agentId;            // Unique agent identifier
    address agentAddress;       // Agent's wallet address
    string ensName;             // ENS name (e.g., "agent.eth")
    string specialization;      // Agent specialization
    uint256 stake;              // Reputation stake amount
    uint256 reputation;         // Reputation score (0-10000)
    uint256 slashCount;         // Number of times slashed
    bool active;                // Whether agent is active
    uint256 registeredAt;       // Registration timestamp
    uint256 lastActivity;       // Last activity timestamp
}
```

#### `ReputationMetric` Struct
```solidity
struct ReputationMetric {
    uint256 completedIntents;   // Number of completed intents
    uint256 totalEarnings;      // Total earnings
    uint256 slashedAmount;       // Total slashed amount
    uint256 avgRating;           // Average rating
}
```

### Functions

#### `constructor(address _reputationToken, uint256 _minStake, address _owner)`
- **Purpose**: Initialize registry with reputation token and minimum stake
- **Parameters**:
  - `_reputationToken`: ERC20 token for staking
  - `_minStake`: Minimum stake required
  - `_owner`: Contract owner

#### `registerAgent(...)`
- **Purpose**: Register a new agent with initial stake
- **Parameters**:
  - `_ensName`: ENS name for the agent
  - `_specialization`: Agent specialization
  - `_stakeAmount`: Initial stake amount (must be >= minStake)
- **Returns**: `uint256` - New agent ID
- **Access**: Public, nonReentrant
- **Events**: `AgentRegistered`
- **Validations**:
  - Agent must not already be registered
  - Stake must be >= minimum stake
  - ENS name must not be empty
  - Transfers stake tokens from caller

#### `increaseStake(uint256 _agentId, uint256 _amount)`
- **Purpose**: Increase agent's stake
- **Parameters**:
  - `_agentId`: Agent ID
  - `_amount`: Amount to add to stake
- **Access**: Public, nonReentrant
- **Events**: `StakeIncreased`
- **Validations**:
  - Caller must be agent owner
  - Agent must be active
  - Transfers tokens from caller

#### `withdrawStake(uint256 _agentId, uint256 _amount)`
- **Purpose**: Withdraw stake (must maintain minimum)
- **Parameters**:
  - `_agentId`: Agent ID
  - `_amount`: Amount to withdraw
- **Access**: Public, nonReentrant
- **Validations**:
  - Caller must be agent owner
  - Agent must be active
  - Cannot withdraw below minimum stake
  - Transfers tokens to caller

#### `slashAgent(uint256 _agentId, string calldata _reason)`
- **Purpose**: Slash agent for misbehavior (owner only)
- **Parameters**:
  - `_agentId`: Agent ID to slash
  - `_reason`: Reason for slashing
- **Access**: Owner only
- **Events**: `AgentSlashed`, `AgentDeactivated`, `ReputationUpdated`
- **Actions**:
  - Slashes 10% of stake (default)
  - Decreases reputation by 100
  - Transfers slashed funds to owner
  - Deactivates agent if reputation < 200 or stake < minimum

#### `updateReputation(uint256 _agentId, uint256 _reputationDelta)`
- **Purpose**: Update agent reputation positively (owner only)
- **Parameters**:
  - `_agentId`: Agent ID
  - `_reputationDelta`: Reputation increase amount
- **Access**: Owner only
- **Events**: `ReputationUpdated`
- **Validations**:
  - Reputation capped at 10000
  - Updates lastActivity timestamp
  - Increments completedIntents metric

#### `verifyENS(address _agentAddress, bool _verified)`
- **Purpose**: Verify ENS name for an agent (owner only)
- **Parameters**:
  - `_agentAddress`: Agent address
  - `_verified`: Verification status
- **Access**: Owner only

#### View Functions

- `getAgent(uint256 _agentId)`: Returns agent details
- `getAgentMetrics(uint256 _agentId)`: Returns reputation metrics
- `isAgentActive(uint256 _agentId)`: Returns whether agent is active

### Events

- `AgentRegistered(uint256 indexed agentId, address indexed agentAddress, string ensName, uint256 stake)`
- `StakeIncreased(uint256 indexed agentId, uint256 amount, uint256 newTotal)`
- `AgentSlashed(uint256 indexed agentId, uint256 amount, string reason)`
- `AgentDeactivated(uint256 indexed agentId)`
- `ReputationUpdated(uint256 indexed agentId, uint256 newReputation)`

---

## 3. ExecutionProxy

**Purpose**: Proxy contract for executing cross-chain swaps and intent settlements using LayerZero OApp.

**Inherits**: `OApp`, `ReentrancyGuard`, `Ownable`

### Data Structures

#### `CrossChainSwap` Struct
```solidity
struct CrossChainSwap {
    uint256 intentId;           // Associated intent ID
    address user;               // User address
    address srcToken;           // Source token address
    address dstToken;           // Destination token address
    uint256 srcAmount;          // Source amount
    uint256 minDstAmount;       // Minimum destination amount (slippage protection)
    uint32 dstEid;              // Destination endpoint ID
    bool executed;              // Whether swap was executed
    bytes executionProof;       // Execution proof
}
```

### Functions

#### `constructor(address _token, address _endpoint, address _owner, address _intentManager)`
- **Purpose**: Initialize ExecutionProxy
- **Parameters**:
  - `_token`: Token address (currently unused, kept for compatibility)
  - `_endpoint`: LayerZero endpoint address
  - `_owner`: Contract owner
  - `_intentManager`: IntentManager contract address

#### `initiateSwap(...)`
- **Purpose**: Initiate cross-chain swap with atomic settlement
- **Parameters**:
  - `_intentId`: Associated intent ID
  - `_srcToken`: Source token address (address(0) for native)
  - `_dstToken`: Destination token address
  - `_srcAmount`: Source amount
  - `_minDstAmount`: Minimum destination amount
  - `_dstEid`: Destination endpoint ID
  - `_options`: LayerZero options
- **Returns**: `(uint256 swapId, MessagingReceipt receipt)`
- **Access**: Public, payable, nonReentrant
- **Events**: `SwapInitiated`
- **Validations**:
  - Amount must be > 0
  - Transfers source tokens from caller
  - Validates slippage using Chainlink price feeds
  - Sends cross-chain message via LayerZero

#### `batchExecuteIntent(...)`
- **Purpose**: Batch execute multiple intents atomically
- **Parameters**:
  - `_intentIds`: Array of intent IDs
  - `_tokens`: Array of token addresses
  - `_amounts`: Array of amounts
  - `_dstEid`: Destination endpoint ID
  - `_options`: LayerZero options
- **Returns**: `MessagingReceipt` - LayerZero receipt
- **Access**: Public, payable, nonReentrant
- **Validations**:
  - Arrays must have matching lengths

#### `_lzReceive(...)`
- **Purpose**: Handle received cross-chain swap messages (LayerZero callback)
- **Parameters**:
  - `_origin`: Origin information
  - `_guid`: Message GUID
  - `_message`: Decoded swap message
  - `_executor`: Executor address
  - `_extraData`: Extra data
- **Access**: Internal (LayerZero callback)
- **Events**: `SwapExecuted`
- **Actions**:
  - Decodes swap parameters
  - Executes swap on destination chain
  - Transfers tokens to user
  - Records execution proof

#### `setPriceFeed(address _token, address _feed)`
- **Purpose**: Set Chainlink price feed for a token (owner only)
- **Parameters**:
  - `_token`: Token address
  - `_feed`: Chainlink price feed address
- **Access**: Owner only
- **Events**: `PriceFeedUpdated`

#### Internal Functions

- `_getExpectedAmount(...)`: Calculate expected destination amount using Chainlink price feeds
- `_executeSwap(...)`: Execute swap (simplified, would integrate with DEX in production)

### Events

- `SwapInitiated(uint256 indexed swapId, uint256 indexed intentId, address indexed user, address srcToken, address dstToken, uint256 srcAmount, uint32 dstEid)`
- `SwapExecuted(uint256 indexed swapId, uint256 dstAmount, bytes executionProof)`
- `PriceFeedUpdated(address indexed token, address indexed feed)`

---

## 4. ChainlinkOracleAdapter

**Purpose**: Adapter for Chainlink price feeds with staleness checks and price validation.

**Inherits**: `Ownable`

### Functions

#### `constructor(address _owner)`
- **Purpose**: Initialize adapter
- **Parameters**:
  - `_owner`: Contract owner

#### `addPriceFeed(address _token, address _feed, uint256 _staleThreshold)`
- **Purpose**: Add Chainlink price feed for a token (owner only)
- **Parameters**:
  - `_token`: Token address
  - `_feed`: Chainlink price feed address
  - `_staleThreshold`: Maximum staleness in seconds
- **Access**: Owner only
- **Events**: `PriceFeedAdded`

#### `getLatestPrice(address _token)`
- **Purpose**: Get latest price for a token with staleness validation
- **Parameters**:
  - `_token`: Token address
- **Returns**: `(int256 price, uint256 timestamp)`
- **Access**: Public, view
- **Validations**:
  - Price feed must exist
  - Round must be complete
  - Price must not be stale
  - Answered round must be >= round ID

#### `getValidatedPrice(address _token)`
- **Purpose**: Get validated price (must be > 0)
- **Parameters**:
  - `_token`: Token address
- **Returns**: `(int256 price, uint256 timestamp)`
- **Access**: Public, view
- **Validations**:
  - Price must be > 0

#### `comparePrices(address _tokenA, address _tokenB)`
- **Purpose**: Compare two token prices and return ratio
- **Parameters**:
  - `_tokenA`: First token address
  - `_tokenB`: Second token address
- **Returns**: `uint256` - Price ratio with 18 decimals
- **Access**: Public, view
- **Validations**:
  - Both prices must be > 0

### Events

- `PriceFeedAdded(address indexed token, address indexed feed)`
- `PriceUpdated(address indexed token, int256 price, uint256 timestamp)`

---

## 5. PaymentEscrow

**Purpose**: Escrow contract for holding funds during intent execution.

**Inherits**: `ReentrancyGuard`

### Data Structures

#### `Escrow` Struct
```solidity
struct Escrow {
    uint256 escrowId;           // Unique escrow identifier
    address depositor;          // Address that deposited funds
    address beneficiary;        // Address that will receive funds
    address token;              // Token address (address(0) for native)
    uint256 amount;            // Escrowed amount
    bool released;             // Whether funds were released
    uint256 createdAt;          // Creation timestamp
    uint256 releasedAt;        // Release timestamp
}
```

### Functions

#### `createEscrow(address _beneficiary)`
- **Purpose**: Create escrow for native tokens
- **Parameters**:
  - `_beneficiary`: Address that will receive funds
- **Returns**: `uint256` - Escrow ID
- **Access**: Public, payable, nonReentrant
- **Events**: `EscrowCreated`
- **Validations**:
  - Must send native tokens > 0
  - Beneficiary must not be zero address

#### `createEscrowERC20(address _token, address _beneficiary, uint256 _amount)`
- **Purpose**: Create escrow for ERC20 tokens
- **Parameters**:
  - `_token`: ERC20 token address
  - `_beneficiary`: Address that will receive funds
  - `_amount`: Amount to escrow
- **Returns**: `uint256` - Escrow ID
- **Access**: Public, nonReentrant
- **Events**: `EscrowCreated`
- **Validations**:
  - Amount must be > 0
  - Beneficiary must not be zero address
  - Transfers tokens from caller

#### `releaseEscrow(uint256 _escrowId)`
- **Purpose**: Release escrowed funds to beneficiary
- **Parameters**:
  - `_escrowId`: Escrow ID to release
- **Access**: Public, nonReentrant
- **Events**: `EscrowReleased`
- **Validations**:
  - Caller must be beneficiary
  - Escrow must not already be released
  - Transfers funds to beneficiary

### Events

- `EscrowCreated(uint256 indexed escrowId, address indexed depositor, address indexed beneficiary, address token, uint256 amount)`
- `EscrowReleased(uint256 indexed escrowId, address indexed beneficiary)`

---

## 6. Mock Contracts

### MockEndpoint
- **Purpose**: Mock LayerZero endpoint for testing
- **Function**: `sendMessage(uint32 _dstEid, bytes calldata _message)` - Mock implementation

### MockERC20
- **Purpose**: Mock ERC20 token for testing
- **Functions**:
  - `mint(address to, uint256 amount)`: Mint tokens
  - `transfer(address to, uint256 amount)`: Transfer tokens
  - `transferFrom(address from, address to, uint256 amount)`: Transfer from
  - `approve(address spender, uint256 amount)`: Approve spender

---

## Contract Communication Flow

### 1. Intent Creation & Execution Flow

```
User
  │
  ├─→ IntentManager.createIntent()
  │   ├─→ Stores intent with status = Open
  │   ├─→ Escrows funds (native or ERC20)
  │   └─→ Emits IntentCreated
  │
  ├─→ IntentManager.startBidding()
  │   └─→ Changes status to Bidding
  │
  ├─→ AgentRegistry.getAgent() [View]
  │   └─→ Agent checks agent details
  │
  ├─→ IntentManager.submitProposal()
  │   ├─→ Agent submits proposal
  │   └─→ Emits ProposalSubmitted
  │
  ├─→ IntentManager.selectAgent()
  │   ├─→ User selects winning proposal
  │   ├─→ Changes status to Executing
  │   └─→ Emits AgentSelected
  │
  ├─→ ExecutionProxy.initiateSwap()
  │   ├─→ Transfers tokens from user
  │   ├─→ ChainlinkOracleAdapter.getLatestPrice() [View]
  │   │   └─→ Validates slippage
  │   ├─→ Sends LayerZero message
  │   └─→ Emits SwapInitiated
  │
  └─→ ExecutionProxy._lzReceive() [Callback]
      ├─→ Receives cross-chain message
      ├─→ Executes swap on destination
      ├─→ Transfers tokens to user
      └─→ Emits SwapExecuted
```

### 2. Agent Registration & Reputation Flow

```
Agent
  │
  ├─→ AgentRegistry.registerAgent()
  │   ├─→ Transfers stake tokens
  │   ├─→ Creates agent record
  │   └─→ Emits AgentRegistered
  │
  ├─→ AgentRegistry.increaseStake()
  │   ├─→ Transfers additional tokens
  │   └─→ Emits StakeIncreased
  │
  └─→ IntentManager.executeIntent()
      │
      └─→ AgentRegistry.updateReputation() [Owner only]
          ├─→ Updates reputation score
          └─→ Emits ReputationUpdated
```

### 3. Slashing Flow

```
Owner/IntentManager
  │
  └─→ AgentRegistry.slashAgent()
      ├─→ Calculates slash amount (10% of stake)
      ├─→ Decreases reputation by 100
      ├─→ Transfers slashed funds to owner
      ├─→ Deactivates if reputation < 200 or stake < min
      └─→ Emits AgentSlashed, AgentDeactivated
```

### 4. Cross-Chain Execution Flow

```
Source Chain                    Destination Chain
     │                                 │
     ├─→ ExecutionProxy.initiateSwap()│
     │   ├─→ Builds message            │
     │   ├─→ Quotes fee                │
     │   └─→ _lzSend()                 │
     │                                 │
     │         [LayerZero Network]     │
     │                                 │
     │                                 ├─→ ExecutionProxy._lzReceive()
     │                                 │   ├─→ Decodes message
     │                                 │   ├─→ Executes swap
     │                                 │   └─→ Transfers to user
     │                                 │
     └─→ Receives receipt             └─→ Emits SwapExecuted
```

### 5. Price Feed Integration

```
ExecutionProxy
  │
  ├─→ ChainlinkOracleAdapter.getLatestPrice()
  │   ├─→ Fetches from Chainlink feed
  │   ├─→ Validates staleness
  │   └─→ Returns price & timestamp
  │
  └─→ Uses price for slippage validation
```

---

## Key Interactions

### IntentManager ↔ AgentRegistry
- **Purpose**: Verify agent status before proposal submission
- **Method**: View calls to `AgentRegistry.isAgentActive()` and `AgentRegistry.getAgent()`
- **When**: Before `IntentManager.submitProposal()`

### IntentManager ↔ ExecutionProxy
- **Purpose**: Coordinate cross-chain intent execution
- **Method**: `ExecutionProxy` stores `intentManager` address
- **When**: During `ExecutionProxy.initiateSwap()` and `_lzReceive()`

### ExecutionProxy ↔ ChainlinkOracleAdapter
- **Purpose**: Validate prices and slippage
- **Method**: View calls to `ChainlinkOracleAdapter.getLatestPrice()`
- **When**: During `ExecutionProxy.initiateSwap()` for slippage checks

### IntentManager ↔ PaymentEscrow
- **Purpose**: Escrow funds during intent execution
- **Method**: IntentManager stores funds, PaymentEscrow can be used for complex escrow scenarios
- **When**: During `IntentManager.createIntent()` and `executeIntent()`

---

## Security Considerations

1. **Reentrancy Protection**: All state-changing functions use `nonReentrant` modifier
2. **Access Control**: Owner-only functions for critical operations (slashing, reputation updates)
3. **Input Validation**: All functions validate inputs (deadlines, amounts, addresses)
4. **Slippage Protection**: ExecutionProxy validates minimum amounts using Chainlink feeds
5. **Staleness Checks**: ChainlinkOracleAdapter validates price freshness
6. **Status Transitions**: IntentManager enforces valid state transitions

---

## Events Summary

### IntentManager Events
- `IntentCreated`: New intent created
- `ProposalSubmitted`: Agent submitted proposal
- `AgentSelected`: User selected agent
- `IntentExecuted`: Intent execution completed
- `CrossChainMessageSent`: Cross-chain message sent
- `CrossChainMessageReceived`: Cross-chain message received

### AgentRegistry Events
- `AgentRegistered`: New agent registered
- `StakeIncreased`: Agent increased stake
- `AgentSlashed`: Agent slashed for misbehavior
- `AgentDeactivated`: Agent deactivated
- `ReputationUpdated`: Agent reputation updated

### ExecutionProxy Events
- `SwapInitiated`: Cross-chain swap initiated
- `SwapExecuted`: Swap executed on destination
- `PriceFeedUpdated`: Price feed updated

### ChainlinkOracleAdapter Events
- `PriceFeedAdded`: New price feed added
- `PriceUpdated`: Price updated (emitted on reads)

### PaymentEscrow Events
- `EscrowCreated`: New escrow created
- `EscrowReleased`: Escrow released to beneficiary

---

## Constants

### IntentManager
- `MIN_DEADLINE`: 1 hour
- `MAX_DEADLINE`: 30 days

### AgentRegistry
- `slashPercentage`: 10% (default)
- `initialReputation`: 1000
- `maxReputation`: 10000
- `deactivationThreshold`: 200 reputation or below minimum stake

---

## Future Integration Points

1. **DEX Integration**: `ExecutionProxy._executeSwap()` currently simplified - would integrate with DEX aggregators
2. **Dispute Resolution**: IntentManager has `Disputed` status but no dispute contract yet
3. **ENS Verification**: `AgentRegistry.verifyENS()` exists but needs oracle integration
4. **PaymentEscrow Integration**: IntentManager currently handles escrow internally, could delegate to PaymentEscrow
5. **Filecoin Integration**: Filecoin CIDs stored but retrieval not implemented on-chain

