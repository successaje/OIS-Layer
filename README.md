# Omnichain Intent Settlement Layer

AI-powered cross-chain intent protocol enabling autonomous agents to execute user intents across 150+ chains.

## 📚 Documentation Links

- **Chainlink Docs**: https://docs.chain.link
- **Chainlink CRE**: https://docs.chain.link/cre
- **LayerZero v2 Docs**: https://docs.layerzero.network/v2
- **Filecoin Onchain Cloud / Synapse SDK**: https://docs.filecoin.cloud/ and https://github.com/FIL-Ozone/synapse-sdk
- **Hardhat 3 Docs**: https://hardhat.org/docs

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js + TypeScript + Tailwind + Framer Motion
│   (Next.js)     │  WalletConnect + ENS + Dark/Light Mode
└────────┬────────┘
         │
┌────────▼────────┐
│   Backend       │  NestJS + TypeScript
│   (NestJS)      │  PostgreSQL/SQLite + Redis + REST/GraphQL
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬────────────┐
    │         │              │            │
┌───▼───┐ ┌──▼──┐    ┌──────▼──────┐ ┌──▼──────┐
│LayerZero│ │Chainlink│  │  Filecoin   │ │ Llama  │
│ OApp    │ │ CRE     │  │ Synapse SDK │ │ 3.2    │
└────────┘ └─────────┘  └─────────────┘ └────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Hardhat 3
- Local Llama 3.2 API (running on http://localhost:8000)

### Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Install contract dependencies
cd ../contracts && npm install
```

### Development

```bash
# Start all services
npm run dev

# Or individually:

# Frontend (http://localhost:3000)
cd frontend && npm run dev

# Backend (http://localhost:3001)
cd backend && npm run start:dev

# Contracts - local node
cd contracts && npm run node
```

## 📦 Project Structure

```
.
├── frontend/          # Next.js frontend
│   ├── app/          # Pages and routes
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── contexts/    # React contexts
│   │   └── lib/         # Utilities
│   └── package.json
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── modules/    # Feature modules
│   │   │   ├── intents/
│   │   │   ├── agents/
│   │   │   ├── filecoin/
│   │   │   ├── llama/
│   │   │   ├── chainlink/
│   │   │   └── layerzero/
│   │   └── main.ts
│   └── package.json
├── contracts/        # Hardhat 3 smart contracts
│   ├── contracts/    # Solidity contracts
│   │   ├── IntentManager.sol
│   │   ├── AgentRegistry.sol
│   │   ├── ExecutionProxy.sol
│   │   ├── PaymentEscrow.sol
│   │   └── ChainlinkOracleAdapter.sol
│   ├── test/         # Hardhat tests
│   └── hardhat.config.ts
├── BUILD_NOTES.md    # Development notes (gitignored)
└── FEEDBACK_FOR_LAYERZERO.md  # LayerZero feedback
```

## 🧪 Testing

### Contract Tests

```bash
cd contracts
npm run test
npm run test:coverage
```

### Backend Tests

```bash
cd backend
npm run test
npm run test:e2e
```

### E2E Tests (Frontend)

```bash
cd frontend
npm run test:e2e
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each directory:

**backend/.env**
```env
PORT=3001
RPC_URL=http://localhost:8545
LLAMA_API_URL=http://localhost:8000
FILECOIN_SYNAPSE_URL=http://localhost:8080
CHAINLINK_CRE_API_URL=
INTENT_MANAGER_ADDRESS=
EXECUTION_PROXY_ADDRESS=
```

**contracts/.env**
```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

## 📝 Smart Contracts

### Core Contracts

1. **IntentManager** - Core intent lifecycle management with LayerZero OApp extension
2. **AgentRegistry** - Agent registration with ENS verification and reputation staking
3. **ExecutionProxy** - Cross-chain settlement proxy extending LayerZero OFT
4. **PaymentEscrow** - Escrow contract for holding funds during intent execution
5. **ChainlinkOracleAdapter** - Chainlink price feed adapter

### Deployment

```bash
cd contracts
npm run deploy:local    # Local Hardhat network
npm run deploy:sepolia  # Sepolia testnet
```

## 🤖 Agent Runner

Agents use Llama 3.2 for reasoning and strategy generation:

1. Fetch market data via Chainlink price feeds
2. Generate strategy using Llama 3.2 API
3. Store proof on Filecoin
4. Sign and submit proposal to IntentManager

### Local Llama 3.2 Setup

```bash
# Start Llama 3.2 API server
# Example using llama.cpp
./llama-server -m models/llama-3.2.q4_0.gguf --port 8000
```

## 🔗 Integrations

### LayerZero

- **Cross-chain messaging** via OApp extension
- **Atomic settlement** using intent-anchored OFT transfers
- **Batch execution** for multiple intents

### Chainlink

- **Price Feeds** for on-chain price validation
- **CRE Workflows** for agent orchestration
- **Functions** for off-chain data fetching
- **Automation** for scheduled rebalances

### Filecoin

- **Synapse SDK** for storing intent metadata
- **Proof storage** for agent strategies
- **Audit logs** with IPFS CIDs

## 🎯 Demo Flow

1. **Landing**: Show hero & 3-step flow
2. **Sign In**: Connect wallet + show ENS name
3. **Compose Intent**: "Get me 5% yield on stablecoins across any chain"
4. **Auction**: 5 Llama agents compete with bids
5. **Select Winner**: Show signed plan + CID saved to Filecoin
6. **Execute**: Show LayerZero cross-chain message + settlement event

See `DEMO_SCRIPT.md` for detailed demo steps.

## 📋 Commit History

Project follows incremental commits:

- ✅ commit 001: project skeleton
- ✅ commit 010: wallet + ENS connect + compose intent page
- ⏳ commit 020: Chainlink CRE workflow skeleton
- ⏳ commit 030: LayerZero contract + test
- ⏳ commit 040: Filecoin Synapse SDK integration
- ⏳ commit 050: Agent runner with Llama 3.2
- ⏳ commit 060: Agent registry + staking
- ⏳ commit 070: End-to-end demo
- ⏳ commit 080: Full test suite
- ⏳ commit 090: UI polish
- ⏳ commit 100: Documentation

## 🐛 Troubleshooting

### Contracts won't compile
- Check Solidity version (0.8.24)
- Verify LayerZero package versions
- Run `npm install --legacy-peer-deps` in contracts/

### Backend won't start
- Check database path exists: `backend/data/`
- Verify environment variables
- Check Llama API is running

### Frontend build errors
- Run `npm install` in frontend/
- Check TypeScript config
- Verify Tailwind CSS setup

## 📄 License

MIT

## 🤝 Contributing

This is a hackathon project. For questions or issues, please check:
- `BUILD_NOTES.md` (ignored in git)
- `FEEDBACK_FOR_LAYERZERO.md`

## 🙏 Acknowledgments

Built with:
- **LayerZero** for cross-chain messaging
- **Chainlink** for oracles and workflows
- **Filecoin** for verifiable storage
- **Llama 3.2** for AI agent reasoning
