# Chainlink Integration Documentation

Complete documentation of all Chainlink integration routes, backend service methods, and smart contract methods in the Omnichain Intent Settlement Layer.

---

## 📍 Table of Contents

- [Overview](#overview)
- [Backend Service Methods](#backend-service-methods)
- [Smart Contract Methods](#smart-contract-methods)
- [Price Feed Configuration](#price-feed-configuration)
- [Environment Configuration](#environment-configuration)

---

## Overview

Chainlink integration provides:
- **Price Feeds**: Real-time token prices for on-chain validation
- **CRE Workflows**: Cross-Chain Resolver Engine for agent orchestration
- **Functions**: Off-chain data fetching for agent strategies
- **Oracle Validation**: Staleness checks and price validation

---

## Backend Service Methods

### ChainlinkService (`backend/src/modules/chainlink/chainlink.service.ts`)

The ChainlinkService provides methods used internally by other services (not exposed as direct API routes).

#### **1. `getPriceFeed(address: string): Promise<{ price: bigint; timestamp: number }>`**

Fetch latest price from Chainlink price feed.

- **Description**: Get real-time token price from Chainlink AggregatorV3Interface
- **Parameters**: 
  - `address`: Chainlink price feed contract address
- **Returns**: 
  - `price`: Latest price as bigint
  - `timestamp`: Last update timestamp
- **Contract**: Uses `AggregatorV3Interface.latestRoundData()` ABI
- **Fallback**: Returns mock data if RPC not configured
- **Usage**: Used by `AgentsService.fetchMarketData()` to get real-time token prices

**Example**:
```typescript
const { price, timestamp } = await chainlinkService.getPriceFeed(
  '0x694AA1769357215DE4FAC081bf1f309aDC325306' // ETH/USD Sepolia
);
```

#### **2. `triggerCREWorkflow(workflowId: string, input: any): Promise<string>`**

Trigger Chainlink Cross-Chain Resolver Engine (CRE) workflow.

- **Description**: Orchestrate agent workflows across chains
- **API Endpoint**: `POST ${CHAINLINK_CRE_API_URL}/workflows/${workflowId}/run`
- **Parameters**:
  - `workflowId`: CRE workflow identifier
  - `input`: Workflow input data
- **Returns**: `runId` string
- **Environment Variable**: `CHAINLINK_CRE_API_URL`
- **Fallback**: Returns simulated run ID if API not configured
- **Usage**: Orchestrate complex multi-chain agent workflows

**Example**:
```typescript
const runId = await chainlinkService.triggerCREWorkflow(
  'workflow-123',
  { intentId: '1', chains: ['ethereum', 'arbitrum'] }
);
```

#### **3. `getCREWorkflowStatus(workflowId: string, runId: string): Promise<any>`**

Get status of CRE workflow execution.

- **Description**: Check workflow execution status
- **API Endpoint**: `GET ${CHAINLINK_CRE_API_URL}/workflows/${workflowId}/runs/${runId}`
- **Parameters**:
  - `workflowId`: CRE workflow identifier
  - `runId`: Workflow run ID
- **Returns**: Workflow status object
- **Fallback**: Returns mock status if API not configured
- **Usage**: Monitor workflow execution progress

**Example**:
```typescript
const status = await chainlinkService.getCREWorkflowStatus(
  'workflow-123',
  'run-456'
);
```

#### **4. `callFunctions(source: string, args: string[]): Promise<string>`**

Call Chainlink Functions for off-chain data fetching.

- **Description**: Fetch external data via Chainlink Functions
- **API Endpoint**: `POST ${CHAINLINK_FUNCTIONS_API_URL}/functions/call`
- **Parameters**:
  - `source`: JavaScript source code for function
  - `args`: Array of string arguments
- **Returns**: Function execution result (JSON string)
- **Environment Variable**: `CHAINLINK_FUNCTIONS_API_URL`
- **Fallback**: Returns simulated result if API not configured
- **Usage**: Fetch external data (APIs, market data, etc.) for agent strategies

**Example**:
```typescript
const result = await chainlinkService.callFunctions(
  'return fetch("https://api.example.com/data").then(r => r.json())',
  ['arg1', 'arg2']
);
```

### Routes Using Chainlink

#### **AgentsService** (`backend/src/modules/agents/agents.service.ts`)

**Routes**:
- `POST /api/agents/:id/proposals`
- `POST /api/agents/auction/:intentId/proposals`

**Method**: `generateProposal()` → `fetchMarketData()`

**Chainlink Usage**:
- Fetches real-time price feeds via `ChainlinkService.getPriceFeed()`
- Gets market rates (Aave, Compound, Yearn APYs)
- Used to inform agent strategy generation

**Flow**:
1. Agent proposal generation triggered
2. `fetchMarketData()` called internally
3. Chainlink price feeds queried (or mock data returned)
4. Market data included in strategy generation
5. Proposal returned with market-informed strategy

---

## Smart Contract Methods

### ChainlinkOracleAdapter Contract (`contracts/contracts/ChainlinkOracleAdapter.sol`)

**Contract Address**: Deployed per network (see deployment files)  
**Inherits**: `Ownable` from OpenZeppelin

#### **1. `addPriceFeed()` - Configure Chainlink Price Feed**

```solidity
function addPriceFeed(
    address _token,
    address _feed,              // Chainlink AggregatorV3Interface address
    uint256 _staleThreshold     // Max staleness in seconds
) external onlyOwner
```

- **Access**: Owner only
- **Parameters**:
  - `_token`: Token address (address(0) for native ETH)
  - `_feed`: Chainlink price feed contract address
  - `_staleThreshold`: Maximum age of price data (seconds)
- **Events**: `PriceFeedAdded(token, feed)`
- **Usage**: Register Chainlink price feeds for tokens
- **Example**: Add ETH/USD feed for price validation

#### **2. `getLatestPrice()` - Get Current Price**

```solidity
function getLatestPrice(address _token) external view returns (int256 price, uint256 timestamp)
```

- **Parameters**: `_token` - Token address
- **Returns**: 
  - `price`: Latest price (int256, typically 8 decimals)
  - `timestamp`: Last update timestamp
- **Validations**:
  - Checks price feed exists
  - Validates round completeness (`updatedAt > 0`)
  - Checks staleness threshold (`block.timestamp - updatedAt <= staleThreshold`)
  - Validates round completeness (`answeredInRound >= roundId`)
- **Reverts**: If feed not found, stale data, or incomplete round
- **Usage**: Get real-time token prices for intent validation

#### **3. `getValidatedPrice()` - Get Validated Price**

```solidity
function getValidatedPrice(address _token) external view returns (int256 price, uint256 timestamp)
```

- **Parameters**: `_token` - Token address
- **Returns**: Validated price and timestamp
- **Validations**: 
  - All checks from `getLatestPrice()`
  - Additional check: `price > 0`
- **Reverts**: If price is invalid (<= 0)
- **Usage**: Get validated price for critical operations

#### **4. `comparePrices()` - Compare Two Token Prices**

```solidity
function comparePrices(
    address _tokenA,
    address _tokenB
) external view returns (uint256 ratio)
```

- **Parameters**: 
  - `_tokenA`: First token address
  - `_tokenB`: Second token address
- **Returns**: `ratio` - Price ratio (tokenA/tokenB) with 18 decimals
- **Calculation**: `(priceA * 1e18) / priceB`
- **Reverts**: If either price is invalid
- **Usage**: Calculate exchange rates between tokens
- **Example**: Compare ETH/USD vs USDC/USD for swap validation

### ExecutionProxy Contract (`contracts/contracts/ExecutionProxy.sol`)

**Contract Address**: Deployed per network (see deployment files)  
**Inherits**: `OApp` from LayerZero OApp v2

#### **1. `setPriceFeed()` - Configure Price Feed for Swap Validation**

```solidity
function setPriceFeed(
    address _token,
    address _feed              // Chainlink AggregatorV3Interface address
) external onlyOwner
```

- **Access**: Owner only
- **Parameters**:
  - `_token`: Token address
  - `_feed`: Chainlink price feed address
- **Events**: `PriceFeedUpdated(token, feed)`
- **Usage**: Configure price feeds for cross-chain swap validation

#### **2. `setPriceStalenessThreshold()` - Set Staleness Threshold**

```solidity
function setPriceStalenessThreshold(
    address _token,
    uint256 _threshold         // Max staleness in seconds
) external onlyOwner
```

- **Access**: Owner only
- **Parameters**:
  - `_token`: Token address
  - `_threshold`: Maximum staleness (seconds)
- **Events**: `PriceStalenessThresholdUpdated(token, threshold)`
- **Usage**: Configure how old price data can be before considered stale
- **Default**: 1 hour if not set

#### **3. `getExpectedAmount()` - Calculate Expected Swap Amount**

```solidity
function getExpectedAmount(
    address _srcToken,
    address _dstToken,
    uint256 _srcAmount
) external view returns (uint256)
```

- **Parameters**:
  - `_srcToken`: Source token address
  - `_dstToken`: Destination token address
  - `_srcAmount`: Source amount
- **Returns**: Expected destination amount (18 decimals)
- **Internal Logic**:
  - Fetches Chainlink prices for both tokens
  - Validates price staleness
  - Calculates exchange rate: `(srcPrice * srcAmount * 1e18) / (dstPrice * 1e18)`
- **Reverts**: If price feed not found, stale price, or invalid price
- **Usage**: Calculate expected output for cross-chain swaps

#### **4. `initiateSwap()` - Cross-Chain Swap with Price Validation**

```solidity
function initiateSwap(
    uint256 _intentId,
    address _srcToken,
    address _dstToken,
    uint256 _srcAmount,
    uint256 _minDstAmount,      // Minimum output (slippage protection)
    uint32 _dstEid,
    bytes calldata _options,
    uint256 _deadline
) external payable returns (uint256 swapId, MessagingReceipt memory)
```

- **Parameters**:
  - `_minDstAmount`: Minimum expected output (slippage protection)
- **Internal Validation**:
  - Calls `_getExpectedAmountWithValidation()` which uses Chainlink feeds
  - Validates expected amount >= minDstAmount
  - Checks price staleness
- **Events**: `SwapInitiated(swapId, intentId, user, srcToken, dstToken, srcAmount, dstEid, crossChainId)`
- **Usage**: Initiate cross-chain swap with Chainlink price validation

#### **5. `_getExpectedAmountWithValidation()` - Internal Price Calculation**

```solidity
function _getExpectedAmountWithValidation(
    address _srcToken,
    address _dstToken,
    uint256 _srcAmount
) internal view returns (uint256)
```

- **Internal Function**: Used by `initiateSwap()` and `_executeSwapWithValidation()`
- **Chainlink Integration**:
  - Fetches `AggregatorV3Interface.latestRoundData()` for both tokens
  - Validates prices > 0
  - Checks staleness thresholds
  - Validates round completeness
  - Calculates exchange rate: `(srcPrice * srcAmount * 1e18) / (dstPrice * 1e18)`
- **Reverts**: If price feed not found, stale price, or invalid price
- **Error Types**:
  - `PriceFeedNotFound`: Feed not configured for token
  - `InvalidPrice`: Price <= 0
  - `StalePrice`: Price data too old

---

## Price Feed Configuration

### Testnet Price Feed Addresses

#### **Sepolia Testnet**

| Token | Feed Address | Description |
|-------|-------------|-------------|
| ETH/USD | `0x694AA1769357215DE4FAC081bf1f309aDC325306` | Ethereum price feed |

**Source**: [Chainlink Sepolia Price Feeds](https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet)

#### **Base Sepolia Testnet**

| Token | Feed Address | Description |
|-------|-------------|-------------|
| ETH/USD | `0x4aDC67696bA383F43DD60A171e9278f74A5fB1f7` | Ethereum price feed |

**Source**: [Chainlink Base Sepolia Price Feeds](https://docs.chain.link/data-feeds/price-feeds/addresses?network=base&page=1#base-sepolia-testnet)

### Setup Script

Use `contracts/scripts/setup-price-feeds.ts` to configure price feeds:

```bash
cd contracts
npx hardhat run scripts/setup-price-feeds.ts --network sepolia
```

### Adding New Price Feeds

1. **Find Feed Address**: Check [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds/addresses)
2. **Update Script**: Add to `SEPOLIA_PRICE_FEEDS` or `BASE_SEPOLIA_PRICE_FEEDS`
3. **Run Setup**: Execute setup script
4. **Verify**: Call `getLatestPrice()` to verify

### Staleness Threshold

- **Default**: 3600 seconds (1 hour)
- **Configurable**: Per token via `addPriceFeed()` or `setPriceStalenessThreshold()`
- **Validation**: Prices older than threshold are considered stale and rejected

---

## Environment Configuration

### Required Environment Variables

```env
# RPC URL for Chainlink price feed queries
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Chainlink CRE API (optional)
CHAINLINK_CRE_API_URL=https://api.chain.link/cre

# Chainlink Functions API (optional)
CHAINLINK_FUNCTIONS_API_URL=https://api.chain.link/functions
```

### Configuration Details

- **RPC_URL**: 
  - Required for on-chain price feed queries
  - Used by `ChainlinkService.getPriceFeed()`
  - Must support `eth_call` for contract reads

- **CHAINLINK_CRE_API_URL**: 
  - Optional: For CRE workflow orchestration
  - Used by `triggerCREWorkflow()` and `getCREWorkflowStatus()`
  - Falls back to simulated responses if not configured

- **CHAINLINK_FUNCTIONS_API_URL**: 
  - Optional: For Chainlink Functions
  - Used by `callFunctions()`
  - Falls back to simulated responses if not configured

### ABI Used

The service uses the following Chainlink ABI:

```solidity
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}
```

---

## Usage Examples

### Backend: Fetch Price Feed

```typescript
import { ChainlinkService } from './chainlink.service';

const chainlinkService = new ChainlinkService(httpService, configService);

// Get ETH/USD price
const { price, timestamp } = await chainlinkService.getPriceFeed(
  '0x694AA1769357215DE4FAC081bf1f309aDC325306'
);

console.log(`ETH Price: $${Number(price) / 1e8}`);
```

### Smart Contract: Get Price

```solidity
// Get latest ETH price
(int256 price, uint256 timestamp) = oracleAdapter.getLatestPrice(
    0x0000000000000000000000000000000000000000 // Native ETH
);

// Get validated price (with additional checks)
(int256 validatedPrice, uint256 ts) = oracleAdapter.getValidatedPrice(
    0x0000000000000000000000000000000000000000
);
```

### Smart Contract: Compare Prices

```solidity
// Compare ETH and USDC prices
uint256 ratio = oracleAdapter.comparePrices(
    0x0000000000000000000000000000000000000000, // ETH
    0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  // USDC
);
// Returns: ETH price / USDC price (18 decimals)
```

### Smart Contract: Swap with Price Validation

```solidity
// Initiate swap with Chainlink price validation
(uint256 swapId, MessagingReceipt memory receipt) = executionProxy.initiateSwap(
    intentId,
    srcToken,
    dstToken,
    srcAmount,
    minDstAmount,  // Slippage protection
    dstEid,
    options,
    deadline
);
```

---

## Related Documentation

- [Chainlink Docs](https://docs.chain.link)
- [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds)
- [Chainlink CRE](https://docs.chain.link/cre)
- [Chainlink Functions](https://docs.chain.link/chainlink-functions)
- [Main Integration Routes](../INTEGRATION_ROUTES.md)

