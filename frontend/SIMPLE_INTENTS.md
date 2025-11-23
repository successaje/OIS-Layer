# Simple Intents That Work

These are simple, tested intents that will successfully create transactions on the IntentManager contract.

## ✅ Basic Intent Examples

### 1. Simple Yield Intent (Minimal)
```
Get best yield for 0.01 ETH
```
**Parameters:**
- Amount: 0.01 ETH
- Token: Native ETH (0x0)
- Deadline: 24 hours
- Minimal complexity

### 2. Stablecoin Yield
```
Find best stablecoin yield for $100 USDC
```
**Parameters:**
- Amount: 0.0001 ETH (minimal for gas)
- Token: Native ETH (0x0)
- Deadline: 48 hours
- Simple, clear objective

### 3. Token Swap Intent
```
Swap 0.01 ETH to USDC with lowest slippage
```
**Parameters:**
- Amount: 0.01 ETH
- Token: Native ETH (0x0)
- Deadline: 12 hours
- Single action intent

### 4. Cross-Chain Transfer
```
Move 0.01 ETH from Ethereum to Base
```
**Parameters:**
- Amount: 0.01 ETH
- Token: Native ETH (0x0)
- Deadline: 24 hours
- Simple cross-chain operation

### 5. Yield Optimization
```
Maximize yield on 0.01 ETH across any chain
```
**Parameters:**
- Amount: 0.01 ETH
- Token: Native ETH (0x0)
- Deadline: 7 days
- Flexible, high deadline

## ⚠️ Important Notes

1. **Minimum Amount**: Always send at least 0.01 ETH to cover gas and escrow
2. **Deadline**: Must be at least 1 hour from now, max 30 days
3. **Token Address**: Use `0x0000000000000000000000000000000000000000` for native ETH
4. **Network**: Ensure you're on Sepolia or Base Sepolia (where contracts are deployed)

## 🔧 Contract Requirements

Before creating intents, ensure:
- ✅ Wallet is connected
- ✅ Correct network (Sepolia: 11155111, Base Sepolia: 84532)
- ✅ Sufficient ETH balance (for gas + deposit)
- ✅ Contract is deployed and verified on the network

## 📝 Intent Format

The contract accepts:
- `_intentSpec`: Natural language string (any text)
- `_filecoinCid`: bytes32 (can be zero: `0x0000...0000`)
- `_deadline`: Unix timestamp (must be 1 hour to 30 days from now)
- `_token`: Token address (use `0x0` for native ETH)
- `_amount`: Amount in wei (for ERC20, 0 for native)

For native ETH deposits, the `value` field in the transaction is used.

