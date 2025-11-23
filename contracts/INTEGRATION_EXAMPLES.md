# Integration Examples

## Quick Start Examples

### Example 1: Create and Send Cross-Chain Intent via LayerZero

```solidity
// 1. Create intent on source chain (Sepolia)
string memory intentSpec = "Swap 1000 USDC for DAI on Arbitrum";
bytes32 filecoinCid = bytes32(0x...); // IPFS CID
uint256 deadline = block.timestamp + 86400; // 1 day

uint256 intentId = intentManager.createIntent(
    intentSpec,
    filecoinCid,
    deadline,
    address(0), // No payment token
    { value: ethers.parseEther("0.01") } // Intent fee
);

// 2. Send intent to destination chain (Arbitrum Sepolia)
uint32 arbitrumEid = 40231; // Arbitrum Sepolia EID
bytes memory payload = abi.encode(
    swapData,
    tokenAddresses,
    amounts
);

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

### Example 2: Create and Send Cross-Chain Intent via CCIP

```solidity
// 1. Create intent
uint256 intentId = intentManager.createIntent(...);

// 2. Send via CCIP
uint64 arbitrumSelector = 3478487238524512106; // Arbitrum Sepolia
bytes memory payload = abi.encode(executionData);

// Get fee
IRouterClient router = IRouterClient(ccipRouter);
ClientEVM.EVM2AnyMessage memory message = ClientEVM.EVM2AnyMessage({
    receiver: abi.encode(arbitrumIntentManager),
    data: payload,
    tokenAmounts: new ClientEVM.EVMTokenAmount[](0),
    extraArgs: "",
    feeToken: address(0)
});

uint256 fee = router.getFee(arbitrumSelector, message);

// Send
bytes32 messageId = intentManager.sendViaCCIP(
    intentId,
    arbitrumSelector,
    payload,
    address(0)
);
```

### Example 3: Execute Swap with Price Feed Validation

```solidity
// Setup price feeds
oracleAdapter.addPriceFeed(
    USDC_ADDRESS,
    CHAINLINK_USDC_FEED,
    3600 // 1 hour staleness threshold
);

oracleAdapter.addPriceFeed(
    DAI_ADDRESS,
    CHAINLINK_DAI_FEED,
    3600
);

// Execute swap
executionProxy.initiateSwap(
    USDC_ADDRESS,           // Source token
    DAI_ADDRESS,            // Destination token
    1000 * 1e6,            // 1000 USDC (6 decimals)
    950 * 1e18,            // Min 950 DAI (18 decimals)
    block.timestamp + 3600, // 1 hour deadline
    500,                    // 5% slippage tolerance (basis points)
    40231,                  // Arbitrum Sepolia EID
    ""                      // Default options
);
```

### Example 4: Cross-Chain Agent Registration

```solidity
// Register agent on source chain
uint256 agentId = agentRegistry.registerAgent(
    "agent.eth",
    "yield-farming",
    ethers.parseEther("10") // 10 REP stake
);

// Sync registration to destination chain
uint64 dstChainId = 421614; // Arbitrum Sepolia
bytes memory options = "";

MessagingReceipt memory receipt = agentRegistry.syncCrossChainRegistration(
    agentId,
    dstChainId,
    options
);
```

### Example 5: Cross-Chain Escrow Release

```solidity
// Create escrow on source chain
uint256 escrowId = paymentEscrow.createEscrow(
    beneficiary,
    amount,
    address(0) // Native token
);

// Release escrow from cross-chain message
// This is called by IntentManager or ExecutionProxy
// after successful cross-chain execution
paymentEscrow.releaseCrossChainEscrow(
    escrowId,
    crossChainId,
    srcChainId
);
```

---

## Frontend Integration Examples

### React/TypeScript Example

```typescript
import { ethers } from 'ethers';
import { IntentManager__factory } from './typechain-types';

// Connect to IntentManager
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const signer = await provider.getSigner();
const intentManager = IntentManager__factory.connect(
  INTENT_MANAGER_ADDRESS,
  signer
);

// Create intent
const intentSpec = "Swap 1000 USDC for DAI on Arbitrum";
const filecoinCid = ethers.id("ipfs-cid");
const deadline = Math.floor(Date.now() / 1000) + 86400;

const tx = await intentManager.createIntent(
  intentSpec,
  filecoinCid,
  deadline,
  ethers.ZeroAddress,
  { value: ethers.parseEther("0.01") }
);

await tx.wait();
const receipt = await provider.getTransactionReceipt(tx.hash);
const intentId = receipt.logs[0].topics[1]; // Extract from event

// Send to Arbitrum Sepolia
const arbitrumEid = 40231;
const payload = ethers.AbiCoder.defaultAbiCoder().encode(
  ['address', 'address', 'uint256'],
  [USDC_ADDRESS, DAI_ADDRESS, ethers.parseUnits("1000", 6)]
);

// Quote fee
const fee = await intentManager.quoteCrossChainFee(
  arbitrumEid,
  payload,
  "0x",
  false
);

// Send
const sendTx = await intentManager.sendIntentToChain(
  intentId,
  arbitrumEid,
  payload,
  "0x",
  { value: fee.nativeFee }
);

await sendTx.wait();
console.log("Intent sent! Receipt:", sendTx);
```

---

## Backend Integration Examples

### Node.js/TypeScript Example

```typescript
import { ethers } from 'ethers';
import { IntentManager__factory } from './typechain-types';

class IntentService {
  private intentManager: IntentManager;
  private provider: ethers.Provider;
  
  constructor(rpcUrl: string, contractAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.intentManager = IntentManager__factory.connect(
      contractAddress,
      this.provider
    );
  }
  
  async createIntent(
    intentSpec: string,
    filecoinCid: string,
    deadline: number
  ): Promise<bigint> {
    const tx = await this.intentManager.createIntent(
      intentSpec,
      filecoinCid,
      deadline,
      ethers.ZeroAddress,
      { value: ethers.parseEther("0.01") }
    );
    
    const receipt = await tx.wait();
    // Extract intentId from event
    const intentCreatedEvent = receipt.logs.find(
      log => log.topics[0] === INTENT_CREATED_TOPIC
    );
    return BigInt(intentCreatedEvent.topics[1]);
  }
  
  async sendCrossChainIntent(
    intentId: bigint,
    dstEid: number,
    payload: string
  ): Promise<string> {
    // Quote fee
    const fee = await this.intentManager.quoteCrossChainFee(
      dstEid,
      payload,
      "0x",
      false
    );
    
    // Send
    const tx = await this.intentManager.sendIntentToChain(
      intentId,
      dstEid,
      payload,
      "0x",
      { value: fee.nativeFee }
    );
    
    await tx.wait();
    return tx.hash;
  }
}
```

---

## Monitoring and Events

### Listen for Cross-Chain Events

```typescript
// LayerZero events
intentManager.on("CrossChainMessageSent", (intentId, dstEid, guid, crossChainId) => {
  console.log(`Intent ${intentId} sent to chain ${dstEid}`);
  console.log(`Message GUID: ${guid}`);
  console.log(`Cross-chain ID: ${crossChainId}`);
});

intentManager.on("CrossChainMessageReceived", (intentId, srcEid, payload, crossChainId) => {
  console.log(`Intent ${intentId} received from chain ${srcEid}`);
  console.log(`Executing with payload: ${payload}`);
});

// CCIP events
intentManager.on("CCIPMessageSent", (intentId, dstSelector, messageId) => {
  console.log(`CCIP message sent: ${messageId}`);
});

intentManager.on("CCIPMessageReceived", (intentId, srcSelector, payload) => {
  console.log(`CCIP message received from chain ${srcSelector}`);
});
```

---

## Error Handling

### Common Errors and Solutions

```solidity
// Insufficient funds for cross-chain fee
try {
    intentManager.sendIntentToChain(...);
} catch (error) {
    if (error.message.includes("InsufficientFunds")) {
        // Get quote and add more funds
        const fee = await intentManager.quoteCrossChainFee(...);
        // Retry with correct amount
    }
}

// Invalid executor
try {
    // Execute intent
} catch (error) {
    if (error.message.includes("InvalidExecutor")) {
        // Grant EXECUTOR_ROLE to address
        intentManager.grantRole(EXECUTOR_ROLE, executorAddress);
    }
}

// Price data stale
try {
    executionProxy.initiateSwap(...);
} catch (error) {
    if (error.message.includes("Price data stale")) {
        // Wait for price feed update or use different token
    }
}

// Slippage too high
try {
    executionProxy.initiateSwap(...);
} catch (error) {
    if (error.message.includes("SlippageTooHigh")) {
        // Increase slippage tolerance or reduce amount
    }
}
```

---

## Best Practices

### 1. Always Quote Fees Before Sending

```typescript
const fee = await intentManager.quoteCrossChainFee(
  dstEid,
  payload,
  options,
  false
);

// Add 10% buffer for safety
const feeWithBuffer = fee.nativeFee * 110n / 100n;

await intentManager.sendIntentToChain(
  intentId,
  dstEid,
  payload,
  options,
  { value: feeWithBuffer }
);
```

### 2. Validate Price Feeds Before Swaps

```typescript
// Check price feed exists
const priceFeed = await oracleAdapter.priceFeeds(tokenAddress);
if (priceFeed === ethers.ZeroAddress) {
  throw new Error("Price feed not configured");
}

// Check price is fresh
const [price, updatedAt] = await oracleAdapter.getLatestPrice(tokenAddress);
const staleness = block.timestamp - updatedAt;
if (staleness > 3600) {
  throw new Error("Price data too stale");
}
```

### 3. Use Appropriate Slippage Tolerance

```typescript
// For stablecoins: 0.5% (50 basis points)
const stablecoinSlippage = 50;

// For volatile tokens: 2-5% (200-500 basis points)
const volatileSlippage = 300;

// For cross-chain: Higher tolerance due to delays
const crossChainSlippage = 500;
```

### 4. Set Realistic Deadlines

```typescript
// Local swap: 1 hour
const localDeadline = block.timestamp + 3600;

// Cross-chain swap: 24 hours (account for message delays)
const crossChainDeadline = block.timestamp + 86400;
```

---

## Testing Locally

### Setup Local Testing Environment

```bash
# Start local Hardhat node
npx hardhat node

# Deploy contracts locally
npx hardhat run scripts/deploy.ts --network localhost

# Run tests
npx hardhat test
```

### Mock LayerZero Endpoint

```typescript
// In tests, use MockLayerZeroEndpoint
const mockEndpoint = await deployMockEndpoint();
const intentManager = await deployIntentManager(mockEndpoint.address);

// Set peer for testing
await mockEndpoint.setPeer(40231, arbitrumIntentManager.address);

// Simulate cross-chain message
await mockEndpoint.lzReceive(
  origin,
  guid,
  message,
  executor,
  extraData
);
```

---

## Production Checklist

- [ ] Verify all contracts on block explorers
- [ ] Configure LayerZero peers between chains
- [ ] Set up CCIP chain selectors
- [ ] Add price feeds for all tokens
- [ ] Set appropriate staleness thresholds
- [ ] Configure executor roles
- [ ] Set minimum stake amounts
- [ ] Test cross-chain flows end-to-end
- [ ] Monitor gas costs and optimize
- [ ] Set up event monitoring
- [ ] Document all contract addresses
- [ ] Create runbooks for operations

---

## Support and Resources

- **LayerZero Discord**: https://discord.gg/layerzero
- **Chainlink Discord**: https://discord.gg/chainlink
- **Documentation**: See TECHNOLOGY_INTEGRATION.md
- **Contract Addresses**: See deployments/sepolia.json

