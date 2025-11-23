# Frontend-Contract Integration Guide

## ✅ What's Been Integrated

### 1. Contract Addresses Configuration
**File:** `frontend/src/config/contracts.ts`

- ✅ Sepolia contract addresses
- ✅ Base Sepolia contract addresses
- ✅ LayerZero EID mappings
- ✅ CCIP chain selectors
- ✅ Helper function to get addresses by chain ID

### 2. Ollama/Llama 3.2 Integration
**File:** `frontend/src/lib/ollama.ts`

- ✅ `parseIntentWithLlama()` - Parses natural language intents
- ✅ `generateStrategyWithLlama()` - Generates agent strategies
- ✅ `checkOllamaConnection()` - Verifies Ollama is running
- ✅ Connects to `http://localhost:11434` (default Ollama port)

### 3. Contract Interaction Hook
**File:** `frontend/src/hooks/useIntent.ts`

- ✅ `useIntent()` hook with wagmi integration
- ✅ `createIntent()` function
- ✅ Transaction state management
- ✅ Error handling
- ✅ Auto-parsing with Llama 3.2

### 4. Intent Composer Page
**File:** `frontend/app/intent/new/page.tsx`

- ✅ Connected to deployed contracts
- ✅ Real-time intent parsing with Llama 3.2
- ✅ Transaction submission
- ✅ Loading and error states
- ✅ Success feedback

---

## 🚀 How to Use

### 1. Start Ollama (if not running)

```bash
# Check if Ollama is running
docker ps | grep ollama

# If not running, start it
docker run -d -p 11434:11434 --name ollama ollama/ollama
docker exec -it ollama ollama pull llama3.2:latest
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select Sepolia network
4. Approve connection

### 4. Create an Intent

1. Navigate to `/intent/new`
2. Enter natural language intent (e.g., "Get me best yield for $1000 USDC across any chain")
3. Wait for Llama 3.2 to parse (shows "Parsing intent with Llama 3.2...")
4. Review AI interpretation
5. Click "Create Intent"
6. Approve transaction in wallet
7. Wait for confirmation

---

## 🔧 Configuration

### Environment Variables

Create `frontend/.env.local`:

```bash
# Ollama Configuration
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434

# Default Chain (optional)
NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111
```

### Contract Addresses

Addresses are automatically loaded from:
- `frontend/src/config/contracts.ts`

To update addresses after redeployment, edit this file.

---

## 📝 Example Flow

### User Journey

1. **User types intent:**
   ```
   "Get me best yield for $1000 USDC across any chain"
   ```

2. **Llama 3.2 parses:**
   ```json
   {
     "objective": "Maximize yield on stablecoins",
     "constraints": ["Low risk", "Auto-rebalance"],
     "riskProfile": "Medium",
     "chainsAllowed": ["Ethereum", "Arbitrum", "Base"],
     "assetsAllowed": ["USDC"],
     "amount": "1000"
   }
   ```

3. **Frontend displays:**
   - Parsed intent preview
   - Agent suggestions
   - Execution preview

4. **User clicks "Create Intent":**
   - Frontend calls `createIntent()` hook
   - Hook calls `IntentManager.createIntent()` on contract
   - Transaction submitted to Sepolia
   - User approves in wallet

5. **Transaction confirmed:**
   - Intent created on-chain
   - Event emitted: `IntentCreated`
   - User redirected to dashboard

---

## 🐛 Troubleshooting

### Ollama Connection Issues

**Error:** "Failed to parse intent with Llama"

**Solutions:**
1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Verify model is pulled: `docker exec ollama ollama list`
3. Check `NEXT_PUBLIC_OLLAMA_URL` in `.env.local`

### Contract Connection Issues

**Error:** "Contract not found" or "Invalid address"

**Solutions:**
1. Verify wallet is on Sepolia network
2. Check contract addresses in `frontend/src/config/contracts.ts`
3. Ensure contracts are deployed and verified

### Transaction Failures

**Error:** "Transaction reverted" or "Insufficient funds"

**Solutions:**
1. Check wallet has Sepolia ETH
2. Verify amount is sufficient (default: 0.01 ETH)
3. Check gas prices
4. Verify contract is not paused

---

## 🔗 Next Steps

1. **Test the integration:**
   - Create an intent
   - Verify it appears on-chain
   - Check transaction on Etherscan

2. **Add more features:**
   - Intent detail page
   - Agent marketplace integration
   - Cross-chain intent sending

3. **Backend integration:**
   - Event listeners
   - Database storage
   - API endpoints

---

## 📚 Files Reference

- **Contract Addresses:** `frontend/src/config/contracts.ts`
- **Ollama Integration:** `frontend/src/lib/ollama.ts`
- **Intent Hook:** `frontend/src/hooks/useIntent.ts`
- **Intent Composer:** `frontend/app/intent/new/page.tsx`
- **Toast Hook:** `frontend/src/hooks/use-toast.ts`

---

**Ready to test! Start the frontend and create your first intent! 🚀**

