# Quick Verification Guide

## Issue
The `@nomicfoundation/hardhat-verify` plugin has module resolution issues with Hardhat 2.x in this workspace setup.

## Solution: Manual Verification (Recommended)

### Step 1: Go to Contract on Etherscan

Visit each contract:
- [IntentManager](https://sepolia.etherscan.io/address/0xCBe713F7Bca59b2AEb473981195bb119596DFBbA#code)
- [AgentRegistry](https://sepolia.etherscan.io/address/0xe56124b9F8FF7c38Ce922149be22Efe227A7b5B0#code)
- [PaymentEscrow](https://sepolia.etherscan.io/address/0x78f4EF05bbb3104583c440eA60a77608358463e0#code)
- [ExecutionProxy](https://sepolia.etherscan.io/address/0x8cD5f0B422062DF481664CD462eA56D01DF15E69#code)
- [ChainlinkOracleAdapter](https://sepolia.etherscan.io/address/0xdF42386772C73DdcA678067CE9b84bCCE7AfB273#code)
- [ReputationToken](https://sepolia.etherscan.io/address/0xA6b5682Bb10ED3E59b834102639B80FDf7b449AD#code)

### Step 2: Click "Contract" → "Verify and Publish"

### Step 3: Select Settings
- **Compiler Version**: `0.8.24`
- **License**: `MIT`
- **Optimization**: `Yes` (200 runs)
- **Via-IR**: `Yes`

### Step 4: Enter Constructor Arguments

#### MockERC20
```
Reputation Token, REP
```

#### AgentRegistry
```
0xA6b5682Bb10ED3E59b834102639B80FDf7b449AD, 1000000000000000000, 0x60eF148485C2a5119fa52CA13c52E9fd98F28e87, 11155111
```

#### PaymentEscrow
```
0x60eF148485C2a5119fa52CA13c52E9fd98F28e87
```

#### IntentManager
```
0x6EDCE65403992e310A62460808c4b910D972f10f, 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59, 0x60eF148485C2a5119fa52CA13c52E9fd98F28e87, 11155111
```

#### ExecutionProxy
```
0x6EDCE65403992e310A62460808c4b910D972f10f, 0x60eF148485C2a5119fa52CA13c52E9fd98F28e87, 0xCBe713F7Bca59b2AEb473981195bb119596DFBbA, 0x78f4EF05bbb3104583c440eA60a77608358463e0
```

#### ChainlinkOracleAdapter
```
0x60eF148485C2a5119fa52CA13c52E9fd98F28e87
```

### Step 5: Upload Source Code

Copy the contract source from:
- `contracts/contracts/MockERC20.sol`
- `contracts/contracts/AgentRegistry.sol`
- `contracts/contracts/PaymentEscrow.sol`
- `contracts/contracts/IntentManager.sol`
- `contracts/contracts/ExecutionProxy.sol`
- `contracts/contracts/ChainlinkOracleAdapter.sol`

**Important**: For contracts with imports (IntentManager, ExecutionProxy, etc.), use "Solidity (Standard JSON Input)" format and upload the JSON from `artifacts/build-info/`.

### Step 6: Click "Verify and Publish"

## Alternative: Try CLI Verification

If the plugin works in your environment:

```bash
cd contracts
npx hardhat verify --network sepolia 0xA6b5682Bb10ED3E59b834102639B80FDf7b449AD "Reputation Token" "REP"
```

## Files Created

- ✅ `hardhat.config.ts` - Updated to CommonJS format
- ✅ `scripts/verify-sepolia.js` - Verify all Sepolia contracts
- ✅ `scripts/verify-all.js` - Verify on all networks
- ✅ `scripts/verify-single.js` - Verify single contract
- ✅ `scripts/verify-cli.sh` - Bash script for CLI verification
- ✅ `scripts/verify-direct.js` - Direct exec verification
- ✅ `VERIFICATION_README.md` - Complete guide
- ✅ `QUICK_VERIFY.md` - This file

All verification scripts are ready. Manual verification via Etherscan UI is the most reliable method.

