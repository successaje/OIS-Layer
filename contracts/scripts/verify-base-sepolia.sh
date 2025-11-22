#!/bin/bash

# CLI-based verification script for Base Sepolia contracts
# This uses hardhat verify command directly

NETWORK="baseSepolia"

echo "============================================================"
echo "Verifying contracts on BASE SEPOLIA using CLI"
echo "============================================================"
echo ""

cd "$(dirname "$0")/.."

# MockERC20
echo "1. Verifying MockERC20..."
npx hardhat verify --network $NETWORK \
  0x5467EB13A408C48EB02811E92968F6e2A2556040 \
  "Reputation Token" "REP" || echo "  Failed or already verified"
echo ""

# AgentRegistry
echo "2. Verifying AgentRegistry..."
npx hardhat verify --network $NETWORK \
  0x47f4917805C577a168d411b4531F2A49fBeF311e \
  0x5467EB13A408C48EB02811E92968F6e2A2556040 \
  1000000000000000000 \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 \
  84532 || echo "  Failed or already verified"
echo ""

# PaymentEscrow
echo "3. Verifying PaymentEscrow..."
npx hardhat verify --network $NETWORK \
  0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892 \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 || echo "  Failed or already verified"
echo ""

# IntentManager
echo "4. Verifying IntentManager..."
npx hardhat verify --network $NETWORK \
  0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7 \
  0x6EDCE65403992e310A62460808c4b910D972f10f \
  0x80AF2F44ed0469018922c9F483dc5A909862fdc2 \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 \
  84532 || echo "  Failed or already verified"
echo ""

# ExecutionProxy
echo "5. Verifying ExecutionProxy..."
npx hardhat verify --network $NETWORK \
  0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E \
  0x6EDCE65403992e310A62460808c4b910D972f10f \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 \
  0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7 \
  0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892 || echo "  Failed or already verified"
echo ""

# ChainlinkOracleAdapter
echo "6. Verifying ChainlinkOracleAdapter..."
npx hardhat verify --network $NETWORK \
  0x603FD7639e33cAf15336E5BB52E06558122E4832 \
  0x60eF148485C2a5119fa52CA13c52E9fd98F28e87 || echo "  Failed or already verified"
echo ""

echo "============================================================"
echo "Verification complete!"
echo "============================================================"
echo ""
echo "View contracts on Basescan:"
echo "IntentManager: https://sepolia.basescan.org/address/0x767FadD3b8A3414c51Bc5D584C07Ea763Db015D7"
echo "AgentRegistry: https://sepolia.basescan.org/address/0x47f4917805C577a168d411b4531F2A49fBeF311e"
echo "PaymentEscrow: https://sepolia.basescan.org/address/0x6eE71e2A4a3425B72e7337b7fcc7cd985B1c0892"
echo "ExecutionProxy: https://sepolia.basescan.org/address/0xDc3E972df436D0c9F9dAc41066DFfCcC60913e8E"
echo "ChainlinkOracleAdapter: https://sepolia.basescan.org/address/0x603FD7639e33cAf15336E5BB52E06558122E4832"
echo "ReputationToken: https://sepolia.basescan.org/address/0x5467EB13A408C48EB02811E92968F6e2A2556040"

