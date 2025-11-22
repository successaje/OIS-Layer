# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for all contracts in the Omnichain Intent Settlement Layer, including LayerZero V2 and Chainlink CCIP integration.

## Test Files

### 1. `IntentManager.test.ts`
Tests for the core IntentManager contract:
- ✅ Intent creation and validation
- ✅ Bidding phase management
- ✅ Agent proposal submission
- ✅ Agent selection
- ✅ LayerZero V2 cross-chain messaging
- ✅ Chainlink CCIP integration
- ✅ Access control (executors, oracles)
- ✅ Cross-chain intent tracking

### 2. `AgentRegistry.test.ts`
Tests for the AgentRegistry contract:
- ✅ Agent registration with staking
- ✅ Cross-chain identity synchronization
- ✅ Agent verification across chains
- ✅ Stake management (increase, withdraw)
- ✅ Slashing mechanism
- ✅ Reputation updates

### 3. `PaymentEscrow.test.ts`
Tests for the PaymentEscrow contract:
- ✅ Local escrow creation and release
- ✅ Cross-chain escrow creation
- ✅ Cross-chain escrow release
- ✅ Authorization checks
- ✅ Native and ERC20 token support

### 4. `ExecutionProxy.test.ts`
Tests for the ExecutionProxy contract:
- ✅ Price feed management
- ✅ Price staleness threshold configuration
- ✅ Slippage protection
- ✅ Swap operations

### 5. `Integration.test.ts`
End-to-end integration tests:
- ✅ Full intent lifecycle with cross-chain execution
- ✅ Agent registration → Intent creation → Bidding → Selection → Cross-chain execution
- ✅ Cross-chain agent identity synchronization
- ✅ Multi-contract interactions

### 6. `CrossChainIntentManager.test.ts`
Advanced cross-chain tests:
- ✅ LayerZero message sending and receiving
- ✅ CCIP message handling
- ✅ Cross-chain intent data tracking
- ✅ Executor and oracle validation

### 7. `CrossChainEscrow.test.ts`
Cross-chain escrow specific tests:
- ✅ Cross-chain escrow creation
- ✅ Cross-chain escrow release
- ✅ Authorization validation
- ✅ Multi-chain escrow tracking

### 8. `CrossChainAgentRegistry.test.ts`
Cross-chain agent identity tests:
- ✅ Cross-chain registration sync
- ✅ Agent verification on multiple chains
- ✅ Chain registry address management

### 9. `IntentRelay.test.ts`
Intent relay across chains:
- ✅ Full intent relay flow (Chain 1 → Chain 2)
- ✅ LayerZero relay
- ✅ CCIP relay

## Running Tests

### Run all tests:
```bash
cd contracts
npm test
```

### Run specific test file:
```bash
npm test -- IntentManager.test.ts
```

### Run tests with grep pattern:
```bash
npm test -- --grep "LayerZero"
```

### Run with coverage:
```bash
npm run test:coverage
```

## Test Fixtures

The `fixtures.ts` file provides reusable deployment functions:
- `deployIntentManagerFixture()` - Deploys IntentManager with mocks
- `deployAgentRegistryFixture()` - Deploys AgentRegistry with reputation token
- `deployPaymentEscrowFixture()` - Deploys PaymentEscrow with authorization
- `deployExecutionProxyFixture()` - Deploys ExecutionProxy with dependencies
- `deployFullSystemFixture()` - Deploys complete system for integration tests

## Mock Contracts

### `MockLayerZeroEndpoint.sol`
Mock implementation of LayerZero Endpoint V2:
- Simulates `send()` for cross-chain messaging
- Provides `quote()` for fee estimation
- Tracks messages for testing

### `MockCcipRouter.sol`
Mock Chainlink CCIP Router:
- Simulates `ccipSend()` for CCIP messaging
- Returns mock message IDs

### `MockERC20.sol`
Mock ERC20 token for testing:
- Used for reputation token in AgentRegistry tests
- Supports mint, transfer, approve

### `MockIntentManager.sol`
Minimal mock for PaymentEscrow authorization tests

## Test Coverage Goals

- ✅ Intent lifecycle (create → bid → select → execute)
- ✅ Cross-chain messaging (LayerZero V2)
- ✅ Cross-chain messaging (CCIP)
- ✅ Agent registration and management
- ✅ Escrow creation and release
- ✅ Cross-chain escrow settlement
- ✅ Access control and roles
- ✅ Error handling and edge cases
- ✅ Integration scenarios

## Notes

- Tests use Hardhat's `loadFixture` for efficient test execution
- All tests use proper error checking with custom errors
- Mock contracts simulate real protocol behavior
- Integration tests verify end-to-end flows

