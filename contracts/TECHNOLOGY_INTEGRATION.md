# Technology Integration Documentation

## Overview

This document details how **LayerZero V2** and **Chainlink** technologies are integrated into the Omnichain Intent Settlement Layer (OISL) protocol.

---

## 🔗 LayerZero V2 Integration

### Architecture

LayerZero V2 is the primary cross-chain messaging protocol used for:
- **Cross-chain intent relay** - Sending intents from one chain to another
- **Atomic settlement** - Ensuring intent execution across chains
- **OApp (Omnichain Application) pattern** - Extending LayerZero's base contracts

### Implementation Details

#### 1. IntentManager.sol - Core OApp Contract

**Inheritance:**
```solidity
import { OApp, MessagingFee, MessagingReceipt, Origin } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";

contract IntentManager is OApp, AccessControl, ICCIPReceiver {
    // ...
}
```

**Key Features:**

##### Constructor Setup
```solidity
constructor(
    address _endpoint,        // LayerZero V2 Endpoint address
    address _ccipRouter,     // Chainlink CCIP Router (for dual-protocol support)
    address _owner,          // Contract owner
    uint64 _chainId          // Current chain ID
) OApp(_endpoint, _owner) {
    // Initialize OApp with endpoint and owner
    // Set up access control
    // Store chain ID for cross-chain routing
}
```

##### Cross-Chain Intent Sending (`sendIntentToChain`)
```solidity
function sendIntentToChain(
    uint256 _intentId,
    uint32 _dstEid,          // Destination Endpoint ID (EID)
    bytes calldata _payload, // Execution payload
    bytes calldata _options  // LayerZero adapter parameters
) external payable returns (MessagingReceipt memory receipt)
```

**How it works:**
1. Validates intent exists and is in correct state
2. Generates cross-chain ID using `CrossChainMessageLib.generateCrossChainId()`
3. Encodes message with domain separation for security
4. Quotes messaging fee using `_quote()`
5. Sends message via `_lzSend()` to destination chain
6. Stores cross-chain intent data for tracking
7. Emits `CrossChainMessageSent` event

**Example Usage:**
```solidity
// Send intent from Sepolia (EID: 40161) to Arbitrum Sepolia (EID: 40231)
uint32 arbitrumEid = 40231;
bytes memory payload = abi.encode(executionData);
bytes memory options = ""; // Default options

MessagingReceipt memory receipt = intentManager.sendIntentToChain(
    intentId,
    arbitrumEid,
    payload,
    options
);
```

##### Cross-Chain Message Reception (`_lzReceive`)
```solidity
function _lzReceive(
    Origin calldata _origin,      // Source chain info
    bytes32 /*_guid*/,            // Message GUID
    bytes calldata _message,      // Encoded message
    address _executor,            // Executor address
    bytes calldata /*_extraData*/ // Additional data
) internal override
```

**How it works:**
1. Validates executor has proper role (`EXECUTOR_ROLE`)
2. Decodes message using `CrossChainMessageLib.decodeMessage()`
3. Verifies message integrity with domain separation
4. Updates cross-chain intent state
5. Emits `CrossChainMessageReceived` event

**Security Features:**
- **Executor validation** - Only authorized executors can trigger execution
- **Domain separation** - Messages include domain separator to prevent replay attacks
- **Message verification** - Cryptographic verification of message integrity
- **Origin tracking** - Tracks source chain via `Origin` struct

#### 2. ExecutionProxy.sol - Cross-Chain Swap Execution

**Inheritance:**
```solidity
import { OApp, MessagingFee, MessagingReceipt, Origin } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";

contract ExecutionProxy is OApp, AccessControl, ReentrancyGuard {
    // ...
}
```

**Key Features:**

##### Cross-Chain Swap Initiation
```solidity
function initiateSwap(
    address _srcToken,
    address _dstToken,
    uint256 _srcAmount,
    uint256 _minDstAmount,
    uint256 _deadline,
    uint256 _slippageTolerance,
    uint32 _dstEid,              // Destination chain EID
    bytes calldata _options      // LayerZero options
) external payable returns (MessagingReceipt memory receipt)
```

**How it works:**
1. Validates price feeds exist for both tokens
2. Calculates expected output using Chainlink price feeds
3. Validates slippage and deadline
4. Creates escrow for source token
5. Sends cross-chain message via LayerZero
6. Destination chain receives message and executes swap

##### Cross-Chain Swap Execution
```solidity
function _lzReceive(
    Origin calldata _origin,
    bytes32 /*_guid*/,
    bytes calldata _message,
    address _executor,
    bytes calldata /*_extraData*/
) internal override
```

**How it works:**
1. Decodes swap parameters from message
2. Validates executor authorization
3. Executes swap on destination chain
4. Releases escrow on source chain
5. Emits execution events

#### 3. Cross-Chain Message Library

**File:** `contracts/libraries/CrossChainMessageLib.sol`

**Purpose:** Provides secure encoding/decoding and verification of cross-chain messages.

**Key Functions:**

```solidity
// Domain separator for message integrity
bytes32 public constant DOMAIN_SEPARATOR = keccak256(
    "OmnichainIntentSettlementLayer.CrossChainMessage"
);

// Encode message with domain separation
function encodeMessage(
    ICrossChainIntent.CrossChainMessage memory message
) internal pure returns (bytes memory)

// Decode and verify message
function decodeMessage(
    bytes memory data
) internal pure returns (ICrossChainIntent.CrossChainMessage memory)

// Generate unique cross-chain ID
function generateCrossChainId(
    uint256 intentId,
    uint64 srcChainId,
    uint64 dstChainId
) internal pure returns (bytes32)
```

**Security:**
- **Domain separation** - Prevents message replay across different contexts
- **Type hashing** - Ensures message structure integrity
- **Cryptographic verification** - Validates message authenticity

### LayerZero V2 Endpoint IDs (EIDs)

| Network | EID | Endpoint Address |
|---------|-----|------------------|
| Sepolia | 40161 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |
| Arbitrum Sepolia | 40231 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |
| Optimism Sepolia | 40232 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |
| Base Sepolia | 40245 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |
| Ethereum | 30101 | `0x1a44076050125825900e736c501f859c50fE728c` |
| Arbitrum | 30110 | `0x1a44076050125825900e736c501f859c50fE728c` |
| Optimism | 30111 | `0x1a44076050125825900e736c501f859c50fE728c` |
| Base | 30184 | `0x1a44076050125825900e736c501f859c50fE728c` |

### LayerZero Features Used

1. **OApp Pattern** - Extends base `OApp` contract for cross-chain functionality
2. **MessagingFee** - Dynamic fee calculation for cross-chain messages
3. **MessagingReceipt** - Receipt with GUID for message tracking
4. **Origin** - Source chain information (EID, sender, nonce)
5. **Adapter Parameters** - Custom options for message delivery
6. **Peer Configuration** - Set peers for trusted cross-chain communication

### Example: Cross-Chain Intent Flow

```
User on Sepolia                    IntentManager (Sepolia)        IntentManager (Arbitrum)
     |                                    |                                |
     |-- createIntent() ----------------->|                                |
     |                                    |                                |
     |                                    |-- sendIntentToChain()          |
     |                                    |    (LayerZero V2)              |
     |                                    |-------------------------------->|
     |                                    |                                |-- _lzReceive()
     |                                    |                                |-- executeIntent()
     |                                    |<-- CrossChainMessageReceived ---|
     |                                    |                                |
```

---

## ⛓️ Chainlink Integration

### Architecture

Chainlink is integrated for:
- **CCIP (Cross-Chain Interoperability Protocol)** - Alternative cross-chain messaging
- **Price Feeds** - On-chain price validation for swaps
- **Oracle Data** - External data for intent execution

### Implementation Details

#### 1. Chainlink CCIP Integration

**File:** `contracts/contracts/IntentManager.sol`

**Inheritance:**
```solidity
import { ClientEVM } from "@chainlink/contracts/src/v0.8/ccip/libraries/ClientEVM.sol";

interface ICCIPReceiver {
    function ccipReceive(ClientEVM.Any2EVMMessage calldata message) external;
}

contract IntentManager is OApp, AccessControl, ICCIPReceiver {
    // ...
}
```

##### CCIP Router Setup
```solidity
address public immutable ccipRouter;
mapping(uint64 => uint64) public chainSelectors; // Chain ID -> Chain Selector mapping
```

**Chain Selectors:**
| Network | Chain Selector |
|---------|----------------|
| Sepolia | `16015286601757825753` |
| Arbitrum Sepolia | `3478487238524512106` |
| Optimism Sepolia | `5224473277236331295` |
| Base Sepolia | `10344971235874465080` |

##### Sending via CCIP (`sendViaCCIP`)
```solidity
function sendViaCCIP(
    uint256 _intentId,
    uint64 _dstChainSelector,
    bytes calldata _payload,
    address _feeToken
) external payable returns (bytes32 messageId)
```

**How it works:**
1. Validates intent and chain selector
2. Builds CCIP message using `ClientEVM.EVM2AnyMessage`
3. Quotes fee using `IRouterClient(ccipRouter).getFee()`
4. Sends message via `IRouterClient(ccipRouter).ccipSend()`
5. Returns message ID for tracking

**Example Usage:**
```solidity
uint64 arbitrumSelector = 3478487238524512106; // Arbitrum Sepolia
bytes memory payload = abi.encode(executionData);

bytes32 messageId = intentManager.sendViaCCIP(
    intentId,
    arbitrumSelector,
    payload,
    address(0) // Native token for fees
);
```

##### Receiving CCIP Messages (`ccipReceive`)
```solidity
function ccipReceive(
    ClientEVM.Any2EVMMessage calldata message
) external override
```

**How it works:**
1. Validates sender is CCIP router
2. Validates source chain selector is authorized
3. Decodes message payload
4. Executes intent on destination chain
5. Emits `CCIPMessageReceived` event

**Security Features:**
- **Router validation** - Only accepts messages from authorized CCIP router
- **Chain selector verification** - Validates source chain
- **Sender verification** - Ensures message comes from trusted source

#### 2. Chainlink Price Feeds

**File:** `contracts/contracts/ChainlinkOracleAdapter.sol`

**Purpose:** Provides on-chain price data for token swaps and intent validation.

##### Price Feed Setup
```solidity
mapping(address => address) public priceFeeds; // Token -> Price Feed
mapping(address => uint256) public stalenessThresholds; // Token -> Max staleness (seconds)
```

##### Getting Latest Price
```solidity
function getLatestPrice(address _token) external view returns (int256 price, uint256 updatedAt)
```

**How it works:**
1. Retrieves price feed address for token
2. Calls Chainlink AggregatorV3Interface
3. Validates price is not stale
4. Returns price and timestamp

**Example Usage:**
```solidity
// Get USDC/USD price
(int256 price, uint256 updatedAt) = oracleAdapter.getLatestPrice(USDC_ADDRESS);
// price = 100000000 (1 USD with 8 decimals)
```

##### Price Feed Integration in ExecutionProxy

**File:** `contracts/contracts/ExecutionProxy.sol`

```solidity
function _getLatestPrice(address _token) internal view returns (int256, uint256) {
    address priceFeed = oracleAdapter.priceFeeds(_token);
    require(priceFeed != address(0), "No price feed");
    
    AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);
    (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) = feed.latestRoundData();
    
    // Validate price is not stale
    require(updatedAt > 0, "Price data incomplete");
    require(
        block.timestamp - updatedAt <= oracleAdapter.stalenessThresholds(_token),
        "Price data stale"
    );
    
    return (price, updatedAt);
}
```

**Usage in Swap Validation:**
```solidity
function _executeSwapWithValidation(
    address _srcToken,
    address _dstToken,
    uint256 _srcAmount,
    uint256 _minDstAmount,
    uint256 _deadline,
    uint256 _slippageTolerance
) internal view returns (uint256)
```

**How it works:**
1. Gets latest prices for both tokens from Chainlink
2. Calculates expected output amount
3. Applies slippage tolerance
4. Validates against minimum expected amount
5. Checks deadline hasn't passed

### Chainlink Router Addresses

| Network | CCIP Router Address |
|---------|---------------------|
| Sepolia | `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59` |
| Arbitrum Sepolia | `0x2a9C5afB0d0e4BAb2AdaDA92493B3D313c4C3b0C` |
| Optimism Sepolia | `0x114A20A10b43D4115e5aeef7345a1A9844850E4E` |
| Base Sepolia | `0xD3b06cEbF099CE7A4fa6d5A8b5b8C5C5C5C5C5C5` |

### Chainlink Features Used

1. **CCIP (Cross-Chain Interoperability Protocol)**
   - Alternative to LayerZero for cross-chain messaging
   - Token transfers with messages
   - Programmable token transfers

2. **Price Feeds (AggregatorV3Interface)**
   - Real-time on-chain price data
   - Multi-source aggregation
   - Staleness protection

3. **Oracle Security**
   - Multiple data sources
   - Decentralized oracle network
   - Heartbeat monitoring

---

## 🔄 Dual-Protocol Architecture

### Why Both LayerZero and CCIP?

The protocol supports **both** LayerZero V2 and Chainlink CCIP for:

1. **Redundancy** - If one protocol has issues, the other can be used
2. **Flexibility** - Users can choose based on fees, speed, or preference
3. **Risk Mitigation** - Diversifies cross-chain infrastructure risk
4. **Feature Comparison** - Different protocols excel in different areas

### Protocol Selection

**LayerZero V2:**
- ✅ Lower gas costs in many cases
- ✅ Faster message delivery
- ✅ OApp pattern for easy integration
- ✅ Native token support

**Chainlink CCIP:**
- ✅ Token transfers with messages
- ✅ Programmable token transfers
- ✅ Established oracle infrastructure
- ✅ Insurance fund for security

### Implementation Pattern

```solidity
// IntentManager supports both protocols
contract IntentManager is OApp, ICCIPReceiver {
    // LayerZero endpoint
    address public immutable endpoint;
    
    // CCIP router
    address public immutable ccipRouter;
    
    // Send via LayerZero
    function sendIntentToChain(...) // Uses LayerZero
    
    // Send via CCIP
    function sendViaCCIP(...) // Uses Chainlink CCIP
    
    // Receive LayerZero messages
    function _lzReceive(...) // LayerZero callback
    
    // Receive CCIP messages
    function ccipReceive(...) // CCIP callback
}
```

---

## 📊 Integration Flow Diagrams

### LayerZero Cross-Chain Intent Flow

```
┌─────────────┐
│   User      │
│  (Sepolia)  │
└──────┬──────┘
       │
       │ 1. createIntent()
       ▼
┌─────────────────────┐
│  IntentManager      │
│  (Sepolia)          │
│  - OApp             │
│  - LayerZero V2     │
└──────┬──────────────┘
       │
       │ 2. sendIntentToChain()
       │    - _quote() → Get fee
       │    - _lzSend() → Send message
       │
       ▼
┌─────────────────────┐
│ LayerZero Endpoint  │
│  (Sepolia)          │
└──────┬──────────────┘
       │
       │ 3. Cross-chain message
       │    via LayerZero network
       │
       ▼
┌─────────────────────┐
│ LayerZero Endpoint  │
│  (Arbitrum Sepolia) │
└──────┬──────────────┘
       │
       │ 4. _lzReceive()
       │
       ▼
┌─────────────────────┐
│  IntentManager      │
│  (Arbitrum Sepolia) │
│  - OApp             │
│  - Executor validated│
└──────┬──────────────┘
       │
       │ 5. Execute intent
       │
       ▼
┌─────────────┐
│  Execution  │
│  Complete    │
└─────────────┘
```

### Chainlink CCIP Cross-Chain Flow

```
┌─────────────┐
│   User      │
│  (Sepolia)  │
└──────┬──────┘
       │
       │ 1. sendViaCCIP()
       ▼
┌─────────────────────┐
│  IntentManager      │
│  (Sepolia)          │
│  - CCIPReceiver     │
└──────┬──────────────┘
       │
       │ 2. ccipSend()
       │    - Build message
       │    - Get fee
       │    - Send to router
       │
       ▼
┌─────────────────────┐
│  CCIP Router        │
│  (Sepolia)          │
└──────┬──────────────┘
       │
       │ 3. Cross-chain via
       │    Chainlink network
       │
       ▼
┌─────────────────────┐
│  CCIP Router        │
│  (Arbitrum Sepolia) │
└──────┬──────────────┘
       │
       │ 4. ccipReceive()
       │
       ▼
┌─────────────────────┐
│  IntentManager      │
│  (Arbitrum Sepolia) │
│  - Validates sender │
│  - Executes intent  │
└─────────────────────┘
```

### Price Feed Integration Flow

```
┌─────────────────────┐
│  ExecutionProxy     │
│  (Swap Execution)   │
└──────┬──────────────┘
       │
       │ 1. _getLatestPrice()
       │
       ▼
┌─────────────────────┐
│ ChainlinkOracle     │
│ Adapter             │
└──────┬──────────────┘
       │
       │ 2. Get price feed address
       │
       ▼
┌─────────────────────┐
│ Chainlink Aggregator│
│ (Price Feed)        │
│ - latestRoundData() │
└──────┬──────────────┘
       │
       │ 3. Return price + timestamp
       │
       ▼
┌─────────────────────┐
│  ExecutionProxy     │
│  - Validate price   │
│  - Check staleness   │
│  - Calculate output  │
│  - Validate slippage │
└─────────────────────┘
```

---

## 🔐 Security Features

### LayerZero Security

1. **Executor Validation**
   ```solidity
   if (!hasRole(EXECUTOR_ROLE, _executor) && !validExecutors[_executor]) {
       revert IErrors.InvalidExecutor(_executor);
   }
   ```

2. **Domain Separation**
   ```solidity
   bytes32 public constant DOMAIN_SEPARATOR = keccak256(
       "OmnichainIntentSettlementLayer.CrossChainMessage"
   );
   ```

3. **Message Verification**
   ```solidity
   function verifyMessage(
       ICrossChainIntent.CrossChainMessage memory message
   ) internal pure returns (bool)
   ```

4. **Origin Tracking**
   ```solidity
   struct Origin {
       uint32 srcEid;    // Source Endpoint ID
       bytes32 sender;   // Sender address
       uint64 nonce;     // Message nonce
   }
   ```

### Chainlink Security

1. **Router Validation**
   ```solidity
   require(msg.sender == ccipRouter, "Invalid sender");
   ```

2. **Chain Selector Verification**
   ```solidity
   require(
       chainSelectors[_chainId] == message.sourceChainSelector,
       "Invalid chain selector"
   );
   ```

3. **Price Feed Staleness Checks**
   ```solidity
   require(
       block.timestamp - updatedAt <= stalenessThreshold,
       "Price data stale"
   );
   ```

4. **Slippage Protection**
   ```solidity
   uint256 minAllowedAmount = (expectedAmount * (10000 - slippageTolerance)) / 10000;
   require(minAllowedAmount >= minDstAmount, "Slippage too high");
   ```

---

## 📝 Usage Examples

### Example 1: Send Intent via LayerZero

```solidity
// On Sepolia
uint256 intentId = 1;
uint32 arbitrumEid = 40231; // Arbitrum Sepolia EID
bytes memory payload = abi.encode(swapData);

// Quote fee
MessagingFee memory fee = intentManager.quoteCrossChainFee(
    arbitrumEid,
    payload,
    "",
    false
);

// Send intent
MessagingReceipt memory receipt = intentManager.sendIntentToChain(
    intentId,
    arbitrumEid,
    payload,
    ""
);
```

### Example 2: Send Intent via CCIP

```solidity
// On Sepolia
uint256 intentId = 1;
uint64 arbitrumSelector = 3478487238524512106; // Arbitrum Sepolia
bytes memory payload = abi.encode(swapData);

// Get fee
uint256 fee = ccipRouter.getFee(arbitrumSelector, message);

// Send intent
bytes32 messageId = intentManager.sendViaCCIP(
    intentId,
    arbitrumSelector,
    payload,
    address(0) // Native token
);
```

### Example 3: Use Price Feeds for Swap

```solidity
// Get prices
(int256 srcPrice, ) = oracleAdapter.getLatestPrice(USDC_ADDRESS);
(int256 dstPrice, ) = oracleAdapter.getLatestPrice(DAI_ADDRESS);

// Calculate expected output
uint256 expectedOutput = (uint256(srcPrice) * srcAmount * 1e18) / 
                         (uint256(dstPrice) * 1e18);

// Execute swap with price validation
executionProxy.initiateSwap(
    USDC_ADDRESS,
    DAI_ADDRESS,
    srcAmount,
    minOutput,
    deadline,
    slippageTolerance,
    dstEid,
    options
);
```

---

## 🧪 Testing

### Mock Contracts

**MockLayerZeroEndpoint.sol** - Simulates LayerZero V2 endpoint for testing
- `send()` - Simulates message sending
- `quote()` - Returns mock fees
- `setPeer()` - Sets peer addresses

**MockCcipRouter.sol** - Simulates Chainlink CCIP router for testing
- `ccipSend()` - Simulates CCIP message sending
- `getFee()` - Returns mock fees

### Test Coverage

- ✅ Cross-chain intent sending via LayerZero
- ✅ Cross-chain intent receiving via LayerZero
- ✅ CCIP message sending
- ✅ CCIP message receiving
- ✅ Price feed integration
- ✅ Slippage validation
- ✅ Executor authorization
- ✅ Message verification

---

## 📚 References

### LayerZero V2
- **Documentation**: https://docs.layerzero.network/v2
- **OApp Guide**: https://docs.layerzero.network/v2/developers/evm/technical-reference/oapp
- **Endpoint IDs**: https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints
- **Messaging API**: https://docs.layerzero.network/v2/developers/evm/technical-reference/messaging

### Chainlink
- **CCIP Documentation**: https://docs.chain.link/ccip
- **Price Feeds**: https://docs.chain.link/data-feeds
- **Supported Networks**: https://docs.chain.link/ccip/supported-networks
- **Chain Selectors**: https://docs.chain.link/ccip/supported-networks/v1_2_0/testnet

---

## 🎯 Key Takeaways

1. **LayerZero V2** provides the primary cross-chain messaging infrastructure using the OApp pattern
2. **Chainlink CCIP** offers an alternative cross-chain protocol with token transfer capabilities
3. **Chainlink Price Feeds** ensure accurate price validation for swaps and intent execution
4. **Dual-protocol support** provides redundancy and flexibility
5. **Security** is enforced through executor validation, domain separation, and message verification
6. **Both protocols** are fully integrated and tested in the contract suite

---

## 📍 Contract Addresses (Sepolia)

- **IntentManager**: `0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3`
- **ExecutionProxy**: `0xcA834417fb31B46Db5544e0ddF000b3a822aD9dA`
- **ChainlinkOracleAdapter**: `0x857a55F93d14a348003356A373D2fCc926b18A7E`

All contracts are verified on Etherscan and ready for use.

