# LayerZero Integration Documentation

Complete documentation of all LayerZero integration routes, backend service methods, and smart contract methods in the Omnichain Intent Settlement Layer.

---

## 📍 Table of Contents

- [Overview](#overview)
- [Backend Service Methods](#backend-service-methods)
- [Smart Contract Methods](#smart-contract-methods)
- [Endpoint Configuration](#endpoint-configuration)
- [Environment Configuration](#environment-configuration)

---

## Overview

LayerZero integration provides:
- **Cross-Chain Messaging**: Send intents and execute across chains
- **OApp Protocol**: Omnichain Application framework (v2)
- **Atomic Settlement**: Cross-chain token transfers via OFT
- **Batch Execution**: Execute multiple intents atomically
- **Fee Quoting**: Estimate cross-chain messaging costs

---

## Backend Service Methods

### LayerzeroService (`backend/src/modules/layerzero/layerzero.service.ts`)

The LayerzeroService provides methods used internally (not exposed as direct API routes).

#### **1. `sendCrossChainMessage(intentId, dstEid, payload, signer): Promise<string>`**

Send cross-chain message via LayerZero OApp.

- **Description**: Execute intents across different chains via LayerZero
- **Contract**: Calls `IntentManager.sendCrossChainExecution()`
- **Parameters**:
  - `intentId`: Intent ID to execute
  - `dstEid`: Destination endpoint ID (LayerZero chain ID)
  - `payload`: Encoded execution data
  - `signer`: Ethers signer for transaction
- **Returns**: Transaction hash
- **Usage**: Execute intents across different chains

**Example**:
```typescript
const txHash = await layerzeroService.sendCrossChainMessage(
  '1',
  30184, // Base endpoint ID
  '0x...', // Encoded payload
  signer
);
```

#### **2. `getEndpointId(chainId: number): number`**

Get LayerZero endpoint ID for a given chain ID.

- **Description**: Map chain ID to LayerZero endpoint ID
- **Parameters**: `chainId` - Standard chain ID
- **Returns**: LayerZero endpoint ID (eid)
- **Supported Chains**:
  - Ethereum (1): `301`
  - Arbitrum (42161): `30110`
  - Optimism (10): `30111`
  - Avalanche (43114): `30106`
  - Base (8453): `30184`
  - Polygon (137): `30109`

**Example**:
```typescript
const eid = layerzeroService.getEndpointId(8453); // Returns 30184 (Base)
```

#### **3. `quoteFee(intentId, dstEid, payload): Promise<bigint>`**

Quote cross-chain messaging fee.

- **Description**: Estimate gas costs for cross-chain execution
- **Contract**: Calls `IntentManager.quoteCrossChainFee()`
- **Parameters**:
  - `intentId`: Intent ID
  - `dstEid`: Destination endpoint ID
  - `payload`: Message payload
- **Returns**: Fee amount in native token (wei)
- **Fallback**: Returns `0.01 ETH` if contract not configured
- **Usage**: Estimate costs before sending cross-chain message

**Example**:
```typescript
const fee = await layerzeroService.quoteFee(
  '1',
  30184, // Base
  '0x...' // Payload
);
console.log(`Fee: ${ethers.formatEther(fee)} ETH`);
```

---

## Smart Contract Methods

### IntentManager Contract (`contracts/contracts/IntentManager.sol`)

**Contract Address**: Deployed per network (see deployment files)  
**Inherits**: `OApp` from LayerZero OApp v2

#### **1. `sendIntentToChain()` - Send Cross-Chain Message via LayerZero**

```solidity
function sendIntentToChain(
    uint256 _intentId,
    uint32 _dstEid,              // LayerZero destination endpoint ID
    bytes calldata _payload,     // Execution payload
    bytes calldata _options      // LayerZero options (gas limits, etc.)
) external payable returns (MessagingReceipt memory receipt)
```

- **Parameters**:
  - `_intentId`: Intent ID to execute cross-chain
  - `_dstEid`: LayerZero endpoint ID (see endpoint mapping below)
  - `_payload`: Encoded execution data
  - `_options`: LayerZero messaging options
- **Returns**: `MessagingReceipt` with `guid` and `fee`
- **Payable**: Must send native token for LayerZero messaging fee
- **Events**: `CrossChainMessageSent(intentId, dstEid, messageId, crossChainId)`
- **Usage**: Send intent execution to another chain via LayerZero
- **Internal**: Calls `_lzSend()` from OApp base contract
- **Validations**:
  - Intent must exist
  - Intent status must be `Executing`
  - Message fee must be sufficient

#### **2. `quoteCrossChainFee()` - Quote LayerZero Messaging Fee**

```solidity
function quoteCrossChainFee(
    uint32 _dstEid,
    bytes calldata _message,
    bytes calldata _options,
    bool _payInLzToken
) external view returns (MessagingFee memory fee)
```

- **Parameters**:
  - `_dstEid`: Destination endpoint ID
  - `_message`: Message payload
  - `_options`: LayerZero options
  - `_payInLzToken`: Whether to pay in LZ token
- **Returns**: `MessagingFee` with `nativeFee` and `lzTokenFee`
- **Usage**: Estimate gas costs before sending cross-chain message
- **Internal**: Calls `_quote()` from OApp base contract

#### **3. `_lzReceive()` - Handle Received LayerZero Message**

```solidity
function _lzReceive(
    Origin calldata _origin,     // Source endpoint info
    bytes32 _guid,               // Message GUID
    bytes calldata _message,     // Encoded message
    address _executor,           // Executor address
    bytes calldata _extraData    // Extra data
) internal override
```

- **Access**: Internal (called by LayerZero endpoint)
- **Validations**:
  - Validates executor has `EXECUTOR_ROLE` or is in `validExecutors`
  - Decodes message with domain separation
  - Verifies message integrity
  - Checks cross-chain intent exists
- **Events**: `CrossChainMessageReceived(intentId, srcEid, payload, crossChainId)`
- **Usage**: Process incoming cross-chain intent execution

#### **4. `sendViaCCIP()` - Send Intent via Chainlink CCIP (Alternative)**

```solidity
function sendViaCCIP(
    uint256 _intentId,
    uint64 _dstChainSelector,    // Chainlink CCIP chain selector
    bytes calldata _payload
) external payable returns (bytes32 messageId)
```

- **Parameters**:
  - `_intentId`: Intent ID
  - `_dstChainSelector`: CCIP chain selector (uint64)
  - `_payload`: Execution payload
- **Returns**: `messageId` - CCIP message ID
- **Validations**:
  - Checks chain selector is supported
  - Validates intent status
- **Events**: `IntentSentViaCCIP(intentId, dstChainSelector, messageId, crossChainId)`
- **Usage**: Alternative to LayerZero for cross-chain messaging

#### **5. `ccipReceive()` - Handle Received CCIP Message**

```solidity
function ccipReceive(
    ICCIPReceiver.Any2EVMMessage calldata _message
) external
```

- **Access**: External (called by CCIP Router)
- **Validations**:
  - Verifies sender is CCIP Router
  - Checks chain selector is supported
  - Decodes and verifies message
- **Events**: `IntentReceivedViaCCIP(intentId, srcChainSelector, crossChainId)`
- **Usage**: Process incoming CCIP messages

#### **6. Admin Functions - Chain Configuration**

```solidity
// Add supported CCIP chain selector
function addChainSelector(uint64 _chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE)

// Remove chain selector
function removeChainSelector(uint64 _chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE)

// Add executor for cross-chain execution
function addExecutor(address _executor) external onlyRole(DEFAULT_ADMIN_ROLE)

// Remove executor
function removeExecutor(address _executor) external onlyRole(DEFAULT_ADMIN_ROLE)

// Add oracle address
function addOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE)

// Remove oracle address
function removeOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE)
```

### ExecutionProxy Contract (`contracts/contracts/ExecutionProxy.sol`)

**Contract Address**: Deployed per network (see deployment files)  
**Inherits**: `OApp` from LayerZero OApp v2

#### **1. `initiateSwap()` - Cross-Chain Swap via LayerZero**

```solidity
function initiateSwap(
    uint256 _intentId,
    address _srcToken,
    address _dstToken,
    uint256 _srcAmount,
    uint256 _minDstAmount,
    uint32 _dstEid,              // LayerZero endpoint ID
    bytes calldata _options,
    uint256 _deadline
) external payable returns (uint256 swapId, MessagingReceipt memory receipt)
```

- **Parameters**:
  - `_dstEid`: LayerZero destination endpoint ID
  - `_options`: LayerZero messaging options
- **Returns**: `swapId` and `MessagingReceipt`
- **Payable**: Must send native token for LayerZero fee
- **Events**: `SwapInitiated(swapId, intentId, user, srcToken, dstToken, srcAmount, dstEid, crossChainId)`
- **Usage**: Initiate cross-chain token swap with LayerZero messaging
- **Validations**:
  - Validates amounts
  - Checks deadline
  - Validates price feeds (via Chainlink)
  - Ensures sufficient fee

#### **2. `batchExecuteIntent()` - Batch Cross-Chain Execution**

```solidity
function batchExecuteIntent(
    uint256[] calldata _intentIds,
    address[] calldata _tokens,
    uint256[] calldata _amounts,
    uint32 _dstEid,              // LayerZero endpoint ID
    bytes calldata _options
) external payable returns (MessagingReceipt memory)
```

- **Parameters**:
  - `_intentIds`: Array of intent IDs
  - `_tokens`: Array of token addresses
  - `_amounts`: Array of amounts
  - `_dstEid`: LayerZero endpoint ID
  - `_options`: LayerZero options
- **Returns**: `MessagingReceipt`
- **Validations**: Arrays must have same length
- **Usage**: Batch execute multiple intents atomically via LayerZero

#### **3. `_lzReceive()` - Handle Received Swap**

```solidity
function _lzReceive(
    Origin calldata _origin,
    bytes32 _guid,
    bytes calldata _message,
    address _executor,
    bytes calldata _extraData
) internal override
```

- **Access**: Internal (called by LayerZero endpoint)
- **Decodes**: Swap parameters from message
- **Validates**: Deadline, slippage
- **Executes**: Swap on destination chain
- **Events**: `SwapExecuted(swapId, dstAmount, executionProof)`
- **Usage**: Process incoming cross-chain swap execution

---

## Endpoint Configuration

### LayerZero Endpoint IDs

#### **Mainnets**

| Chain | Chain ID | Endpoint ID (eid) |
|-------|----------|-------------------|
| Ethereum | 1 | `301` |
| Arbitrum | 42161 | `30110` |
| Optimism | 10 | `30111` |
| Avalanche | 43114 | `30106` |
| Base | 8453 | `30184` |
| Polygon | 137 | `30109` |

#### **Testnets**

| Chain | Chain ID | Endpoint ID (eid) |
|-------|----------|-------------------|
| Sepolia | 11155111 | `40161` |
| Base Sepolia | 84532 | `40245` |
| Arbitrum Sepolia | 421614 | `40231` |
| Optimism Sepolia | 11155420 | `40232` |

### LayerZero Endpoint Addresses

#### **Mainnets**

All mainnet endpoints use the same address:
```
0x1a44076050125825900e736c501f859c50fE728c
```

**Networks**: Ethereum, Arbitrum, Optimism, Base, Polygon, BSC, Avalanche

#### **Testnets**

All testnet endpoints use the same address:
```
0x6EDCE65403992e310A62460808c4b910D972f10f
```

**Networks**: Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia, Polygon Mumbai, BSC Testnet, Fuji

### Chainlink CCIP Chain Selectors

#### **Mainnets**

| Chain | Chain Selector |
|-------|----------------|
| Ethereum | `5009297550715157269` |
| Arbitrum | `4949039107694359620` |
| Optimism | `5224473277236331295` |
| Base | `15971525489660198786` |
| Polygon | `4051577828743386545` |
| Avalanche | `6433500567565415381` |

#### **Testnets**

| Chain | Chain Selector |
|-------|----------------|
| Sepolia | `16015286601757825753` |
| Arbitrum Sepolia | `3478487238524512106` |
| Optimism Sepolia | `5224473277236331295` |
| Base Sepolia | `10344971235874465080` |
| Polygon Mumbai | `12532609583862916517` |
| Fuji | `14767482510784806043` |

### CCIP Router Addresses

#### **Mainnets**

| Chain | Router Address |
|-------|----------------|
| Ethereum | `0x80226fc0Ee2b096224EeAc085Bb9a8cba1146fDd` |
| Arbitrum | `0x88E492127709447A5AB7da8A1C130117fA4B3F40` |
| Optimism | `0x261c05167db67B2b619f9d9e3e8bF9539Ca04815` |
| Base | `0x80AF2F44ed0469018922c9F483dc5A909862fdc2` |
| Polygon | `0x3C3D92629A02a8D95D5CB9650fe49C3544f69B43` |
| Avalanche | `0xF694E193200268f9a4868e4Aa017A0118C9a8177` |

#### **Testnets**

| Chain | Router Address |
|-------|----------------|
| Sepolia | `0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59` |
| Arbitrum Sepolia | `0x2a9C5afB0d0e4BAb2AdaDA92493B3D313c4C3b0C` |
| Optimism Sepolia | `0x114A20A10b43D4115e5aeef7345a1A9844850E4E` |
| Base Sepolia | `0x80AF2F44ed0469018922c9F483dc5A909862fdc2` |
| Polygon Mumbai | `0x1035CabC275068e0F4b745A29CEDf38E13aF41b1` |
| Fuji | `0xF694E193200268f9a4868e4Aa017A0118C9a8177` |

---

## Environment Configuration

### Required Environment Variables

```env
# RPC URL for LayerZero contract interactions
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# IntentManager contract address
INTENT_MANAGER_ADDRESS=0x...

# ExecutionProxy contract address
EXECUTION_PROXY_ADDRESS=0x...
```

### Configuration Details

- **RPC_URL**: 
  - Required for contract interactions
  - Must support `eth_call` and `eth_sendTransaction`
  - Used by `LayerzeroService` for contract calls

- **INTENT_MANAGER_ADDRESS**: 
  - IntentManager contract address on current network
  - Used by `sendCrossChainMessage()` and `quoteFee()`

- **EXECUTION_PROXY_ADDRESS**: 
  - ExecutionProxy contract address on current network
  - Used for cross-chain swap execution

---

## Usage Examples

### Backend: Send Cross-Chain Message

```typescript
import { LayerzeroService } from './layerzero.service';

const layerzeroService = new LayerzeroService(configService);

// Get endpoint ID
const dstEid = layerzeroService.getEndpointId(8453); // Base

// Quote fee
const fee = await layerzeroService.quoteFee(
  '1',
  dstEid,
  '0x...' // Payload
);

// Send message
const txHash = await layerzeroService.sendCrossChainMessage(
  '1',
  dstEid,
  '0x...', // Payload
  signer
);
```

### Smart Contract: Send Intent Cross-Chain

```solidity
// Quote fee first
MessagingFee memory fee = intentManager.quoteCrossChainFee(
    30184,  // Base endpoint ID
    message,
    options,
    false   // Pay in native token
);

// Send intent to Base
MessagingReceipt memory receipt = intentManager.sendIntentToChain{value: fee.nativeFee}(
    intentId,
    30184,  // Base endpoint ID
    payload,
    options
);
```

### Smart Contract: Initiate Cross-Chain Swap

```solidity
// Initiate swap from Ethereum to Base
(uint256 swapId, MessagingReceipt memory receipt) = executionProxy.initiateSwap{value: fee}(
    intentId,
    srcToken,
    dstToken,
    srcAmount,
    minDstAmount,
    30184,  // Base endpoint ID
    options,
    deadline
);
```

### Smart Contract: Batch Execution

```solidity
// Batch execute multiple intents
MessagingReceipt memory receipt = executionProxy.batchExecuteIntent{value: fee}(
    intentIds,
    tokens,
    amounts,
    30184,  // Base endpoint ID
    options
);
```

---

## Message Structure

### Cross-Chain Message Format

```solidity
struct CrossChainMessage {
    bytes32 crossChainId;
    uint256 intentId;
    uint64 srcChainId;
    address user;
    bytes payload;
    bytes32 filecoinCid;  // Filecoin CID for verification
}
```

### Domain Separation

Messages use EIP-712 style domain separation:
- **Domain Separator**: `keccak256("OmnichainIntentSettlementLayer.CrossChainMessage")`
- **Message Type Hash**: `keccak256("CrossChainMessage(bytes32 crossChainId,uint256 intentId,uint64 srcChainId,address user,bytes payload,bytes32 filecoinCid)")`

### Encoding/Decoding

Messages are encoded/decoded using `CrossChainMessageLib`:
- `encodeMessage()`: Encodes message with domain separator
- `decodeMessage()`: Decodes and validates message
- `verifyMessage()`: Verifies message integrity

---

## Related Documentation

- [LayerZero v2 Docs](https://docs.layerzero.network/v2)
- [LayerZero OApp](https://docs.layerzero.network/v2/developers/evm/oapp)
- [LayerZero Endpoints](https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints)
- [Chainlink CCIP](https://docs.chain.link/ccip)
- [Main Integration Routes](../INTEGRATION_ROUTES.md)

