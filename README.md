# Omnichain Intent Settlement Layer (OIS Layer)

<div align="center">

**AI-Driven · Cross-Chain · Autonomous · Executable Intents**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1%2B-blue)](https://www.typescriptlang.org/)

</div>

## 🌟 Overview

**OIS Layer** is an omnichain intent settlement protocol that transforms how users interact with blockchains. Instead of executing transactions manually, users express **what they want**, and AI agents—powered by Chainlink, LayerZero, and Filecoin—figure out **how to make it happen** securely, trustlessly, and across multiple blockchains.

This project introduces a new interaction model for DeFi, gaming, NFTs, and autonomous smart contract workflows, where intent-based execution replaces traditional transaction-based interactions.

## ✨ What It Does

1. **User submits an intent** (e.g., "Get me 5% yield on stablecoins across any chain")
2. **AI agents compete** to produce the best execution plan using local Llama 3.2
3. **Chainlink validates** pricing, provides data feeds, and orchestrates workflows
4. **LayerZero executes** cross-chain actions via OApp messaging
5. **Filecoin stores** agent plans, metadata, and execution proofs
6. **System settles** autonomously with escrow-based payments

## 🔮 Why This Matters

We're entering a world where:
- **Users don't interact with blockchains**—they interact with intent interpreters
- **Cross-chain execution** becomes as simple as "Do X → get Y"
- **AI optimizes workflows** automatically
- **Chainlink ensures truth** through oracles and data validation
- **LayerZero handles** trustless cross-chain messaging
- **Filecoin persists** intent plans and proofs permanently

**OIS Layer brings this future today.**

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│              (Next.js + React + Wagmi)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Backend API                              │
│              (NestJS + TypeScript)                          │
└───────┬───────────────┬───────────────┬────────────────────┘
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  Intent      │ │   Agent     │ │  Filecoin   │
│  Manager     │ │  Registry   │ │   Service   │
└───────┬──────┘ └──────┬──────┘ └──────┬──────┘
        │               │               │
┌───────▼───────────────▼───────────────▼──────┐
│         Smart Contracts (Hardhat)             │
│  IntentManager · AgentRegistry · ExecutionProxy│
└───────┬───────────────┬───────────────┬──────┘
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ LayerZero    │ │  Chainlink   │ │  Filecoin   │
│   OApp v2    │ │ Price Feeds  │ │  Synapse    │
│              │ │  CCIP + CRE  │ │    SDK      │
└──────────────┘ └──────────────┘ └─────────────┘
```

## 🛠️ Tech Stack

### Core Infrastructure
- **Solidity** - Smart contract development
- **Hardhat 3** - Development environment & testing
- **NestJS** - Backend API framework
- **Next.js 14** - Frontend framework
- **TypeScript** - Type-safe development

### Integrations
- **LayerZero v2 OApp** - Cross-chain messaging
- **Chainlink** - Price Feeds, CCIP, CRE, Automation
- **Filecoin Synapse SDK** - Decentralized storage
- **Ollama Llama 3.2** - Local AI agent reasoning

### Frontend
- **React** - UI library
- **Wagmi** - Ethereum React hooks
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Ollama** with Llama 3.2 model (for AI agents)
- **Wallet** (MetaMask or compatible)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Omnichain-Intent-Settlement-Layer.git
cd Omnichain-Intent-Settlement-Layer

# Install root dependencies
npm install

# Install workspace dependencies
cd frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install
```

### Environment Setup

1. **Backend** - Create `backend/.env`:
```env
PORT=3001
FILECOIN_PRIVATE_KEY=0x...your_private_key
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
LLAMA_API_URL=http://localhost:11434
```

2. **Contracts** - Create `contracts/.env`:
```env
PRIVATE_KEY=0x...your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

3. **Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Running the Application

```bash
# Start all services (from root)
npm run dev

# Or individually:

# Frontend (http://localhost:3000)
cd frontend && npm run dev

# Backend (http://localhost:3001)
cd backend && npm run start:dev

# Contracts - Local node
cd contracts && npx hardhat node
```

## 📦 Project Structure

```
.
├── frontend/              # Next.js frontend application
│   ├── app/              # Pages and routes
│   ├── components/       # React components
│   ├── src/              # Source code
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and configs
│   │   └── contexts/     # React contexts
│   └── package.json
│
├── backend/              # NestJS backend API
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   │   ├── intents/ # Intent management
│   │   │   ├── agents/   # Agent orchestration
│   │   │   ├── filecoin/ # Filecoin integration
│   │   │   ├── chainlink/# Chainlink integration
│   │   │   └── layerzero/# LayerZero integration
│   │   └── main.ts       # Application entry
│   └── package.json
│
├── contracts/            # Hardhat smart contracts
│   ├── contracts/        # Solidity contracts
│   │   ├── IntentManager.sol
│   │   ├── AgentRegistry.sol
│   │   ├── ExecutionProxy.sol
│   │   ├── PaymentEscrow.sol
│   │   └── ChainlinkOracleAdapter.sol
│   ├── test/            # Contract tests
│   ├── scripts/          # Deployment scripts
│   └── hardhat.config.ts
│
└── README.md            # This file
```

## 🧩 Smart Contract Components

| Contract | Purpose |
|----------|---------|
| **IntentManager.sol** | Core intent lifecycle, LayerZero OApp integration |
| **AgentRegistry.sol** | Agent registration, staking, reputation |
| **ExecutionProxy.sol** | Cross-chain execution, route validation |
| **PaymentEscrow.sol** | Fund escrow, agent rewards |
| **ChainlinkOracleAdapter.sol** | Price feed validation, data oracles |

## 🔄 How It Works

### 1. Intent Creation
User submits an intent through the UI → Stored on-chain with Filecoin metadata CID

### 2. Agent Competition
- AI agents (Llama 3.2) analyze the intent
- Generate execution strategies
- Submit proposals with proofs stored on Filecoin
- Chainlink validates pricing and market data

### 3. Agent Selection
- IntentManager evaluates proposals
- Selects winning agent based on:
  - Expected APY/cost
  - Execution timeline
  - Agent reputation
  - Strategy confidence

### 4. Cross-Chain Execution
- ExecutionProxy routes via LayerZero OApp
- Validates execution on destination chain
- Chainlink oracles verify completion
- Escrow releases funds to agent

### 5. Finality Logging
- Complete execution result logged to Filecoin
- Permanent, verifiable record stored
- Includes all transaction hashes, proofs, and metrics

## 🧪 Testing

```bash
# Contract tests
cd contracts && npm run test

# Backend tests
cd backend && npm run test

# E2E tests
cd frontend && npm run test:e2e
```

## 📚 Documentation

- **[Backend README](./backend/README.md)** - API documentation, setup, and architecture
- **[Contracts README](./contracts/README.md)** - Smart contract deployment and testing
- **[Chainlink Routes](./CHAINLINK_ROUTES.md)** - Chainlink integration details
- **[LayerZero Routes](./LAYERZERO_ROUTES.md)** - LayerZero OApp configuration
- **[Filecoin Routes](./FILECOIN_ROUTES.md)** - Filecoin storage integration
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🎯 Demo Flow

1. **Landing Page** - Architecture showcase and value proposition
2. **Wallet Connection** - Connect wallet, display ENS name
3. **Intent Creation** - "Get me 5% yield on stablecoins across any chain"
4. **Agent Competition** - 5 AI agents compete with real-time updates
5. **Winner Selection** - Display winning agent's strategy and Filecoin proof
6. **Execution** - Show LayerZero cross-chain message and settlement
7. **Result Page** - Complete execution details with Filecoin finality log

See [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for detailed demo steps.

## 🥇 Hackathon Eligibility

### LayerZero Prize
OIS Layer extends OApp logic beyond templates by enabling autonomous cross-chain intent execution—a novel use case demonstrating advanced LayerZero v2 understanding.

### Chainlink Prize
Uses CCIP, Price Feeds, Automation, and CRE—embedding Chainlink deeply into risk mitigation, execution validation, off-chain compute, and secure data feeds.

### Filecoin Prize
Stores intents, reasoning metadata, proofs, and agent artifacts on decentralized storage—core to the system's transparency and verifiability.

## 🔥 Why This Project Stands Out

- ✅ **AI + Crypto + Cross-chain** = Huge ecosystem pull
- ✅ **Uses every partner technology** in a meaningful way
- ✅ **Built with real infrastructure** (not toy examples)
- ✅ **Demonstrates a new category** of dApps: Autonomous Execution Layers
- ✅ **Deployable today** on testnets
- ✅ **Extensible tomorrow** with more chains and features

## 🧠 Future Vision

- Public agent marketplace with reputation scoring
- On-chain AI reputation and staking mechanisms
- MPC-based secure execution
- Intent batch auctions
- DeFi, Gaming, NFT, and DAO extensions
- zk-proofs of agent reasoning
- Multi-chain agent networks

## 🤝 Contributing

This is a hackathon project. For questions or issues:

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review [FEEDBACK_FOR_LAYERZERO.md](./FEEDBACK_FOR_LAYERZERO.md)
- See individual READMEs in `backend/` and `contracts/`

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- **[LayerZero](https://layerzero.network)** - Cross-chain messaging infrastructure
- **[Chainlink](https://chain.link)** - Oracle networks and automation
- **[Filecoin](https://filecoin.io)** - Decentralized storage
- **[Ollama](https://ollama.ai)** - Local LLM inference
- **[Hardhat](https://hardhat.org)** - Ethereum development environment

## 👤 Author

**Success Aje (Finisher)**
- Blockchain Engineer
- DApp Architect
- AI x Web3 Innovator

---

<div align="center">

**Built for the future of intent-based blockchain interactions**

[Documentation](./README.md) · [Backend](./backend/README.md) · [Contracts](./contracts/README.md)

</div>
