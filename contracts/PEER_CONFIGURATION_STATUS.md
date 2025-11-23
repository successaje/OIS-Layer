# LayerZero Peer Configuration Status

## ✅ Configuration Complete

Both Sepolia and Base Sepolia IntentManager contracts have been configured with LayerZero peers for cross-chain communication.

---

## 🔗 Peer Configuration

### Sepolia → Base Sepolia

**Network:** Sepolia  
**IntentManager:** `0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3`  
**Peer EID:** `40245` (Base Sepolia)  
**Peer Address:** `0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7`  
**Status:** ✅ Configured  
**Transaction:** `0xe56881ce9328adad718cfefcaf1be023633f5cc0c0b82d382d52424992fa5977`  
**Block:** `9685477`

### Base Sepolia → Sepolia

**Network:** Base Sepolia  
**IntentManager:** `0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7`  
**Peer EID:** `40161` (Sepolia)  
**Peer Address:** `0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3`  
**Status:** ✅ Configured  
**Transaction:** `0xa5fbdf6a87eedad27eb688b9ad059216f881e607719bcd7560a9977905a369f6`  
**Block:** `34039814`

---

## 📊 LayerZero Endpoint IDs (EIDs)

| Network | EID | Endpoint Address |
|---------|-----|------------------|
| Sepolia | 40161 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |
| Base Sepolia | 40245 | `0x6EDCE65403992e310A62460808c4b910D972f10f` |

---

## ✅ Verification

Both peers have been verified:

1. **Sepolia IntentManager** can now send messages to Base Sepolia
2. **Base Sepolia IntentManager** can now send messages to Sepolia
3. Bidirectional communication is enabled

---

## 🧪 Testing Cross-Chain Communication

To test cross-chain messaging:

```typescript
// On Sepolia
const intentManager = await ethers.getContractAt(
  "IntentManager",
  "0xd0fC2c0271d8215EcB7Eeb0bdaFf8B1bef7c04A3"
);

// Send intent to Base Sepolia
const dstEid = 40245; // Base Sepolia EID
const payload = abi.encode(...); // Your payload

const receipt = await intentManager.sendIntentToChain(
  intentId,
  dstEid,
  payload,
  "0x", // Options
  { value: fee } // LayerZero messaging fee
);
```

---

## 📝 Next Steps

1. ✅ **Peers Configured** - Cross-chain communication enabled
2. ⏳ **Test Cross-Chain Flow** - Send test messages between chains
3. ⏳ **Monitor Messages** - Track message delivery via LayerZero
4. ⏳ **Add More Networks** - Configure peers for additional chains if needed

---

## 🔍 View on Block Explorers

- **Sepolia Transaction:** https://sepolia.etherscan.io/tx/0xe56881ce9328adad718cfefcaf1be023633f5cc0c0b82d382d52424992fa5977
- **Base Sepolia Transaction:** https://sepolia.basescan.org/tx/0xa5fbdf6a87eedad27eb688b9ad059216f881e607719bcd7560a9977905a369f6

---

## 📚 Documentation

- **LayerZero V2 Docs:** https://docs.layerzero.network/v2
- **OApp Configuration:** https://docs.layerzero.network/v2/developers/evm/technical-reference/oapp
- **Peer Setup:** See `NEXT_STEPS.md` for more details

---

**Status:** ✅ **FULLY CONFIGURED** - Ready for cross-chain intent settlement!

