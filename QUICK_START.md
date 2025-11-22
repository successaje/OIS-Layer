# Quick Start Guide

Get the Omnichain Intent Settlement Layer up and running in minutes.

## Prerequisites Checklist

- [ ] Node.js >= 18.0.0
- [ ] npm >= 9.0.0
- [ ] Git
- [ ] (Optional) Llama 3.2 API running on `http://localhost:8000`

## Installation

```bash
# Clone repository (if not already done)
git clone <repo-url>
cd Omnichain-Intent-Settlement-Layer

# Install all dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install contract dependencies
cd contracts && npm install --legacy-peer-deps && cd ..
```

## Start Services

### Terminal 1: Hardhat Node (Contracts)
```bash
cd contracts
npm run node
```
Keep this running. It starts a local blockchain on `http://localhost:8545`.

### Terminal 2: Deploy Contracts
```bash
cd contracts
npm run deploy:local
```
This deploys all contracts to the local Hardhat node and saves addresses to `backend/.contract-addresses.json`.

### Terminal 3: Backend
```bash
cd backend
npm run start:dev
```
Backend runs on `http://localhost:3001`.

### Terminal 4: Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`.

## Verify Installation

1. **Frontend**: Open http://localhost:3000 - should see landing page
2. **Backend**: Open http://localhost:3001/api/intents - should return `[]`
3. **Contracts**: Check Hardhat node logs for deployed contract addresses

## Run Tests

### Contract Tests
```bash
cd contracts
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

## Demo Flow

1. Open http://localhost:3000
2. Click "Get Started"
3. Compose an intent: "Get me 5% yield on stablecoins across any chain"
4. View agent auction
5. Select winning agent
6. Execute intent

See `DEMO_SCRIPT.md` for detailed demo steps.

## Troubleshooting

### Port Already in Use
- Frontend: Change port in `frontend/package.json` scripts
- Backend: Set `PORT` in `backend/.env`
- Hardhat: Change port in `contracts/hardhat.config.ts`

### Llama API Not Available
The system will use fallback responses. Ensure Llama 3.2 is running if you want AI-powered strategy generation.

### Contract Deployment Fails
- Ensure Hardhat node is running
- Check `.env` file in `contracts/` directory
- Verify network configuration in `hardhat.config.ts`

### Frontend Build Errors
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

## Next Steps

- Read `README.md` for architecture details
- Check `FEEDBACK_FOR_LAYERZERO.md` for LayerZero feedback
- Review `DEMO_SCRIPT.md` for demo flow
- See `BUILD_NOTES.md` (gitignored) for development notes

## Support

For issues or questions:
1. Check `BUILD_NOTES.md` (if available locally)
2. Review error logs in terminal
3. Check contract deployment logs
4. Verify environment variables

## Environment Variables

Create `.env` files as needed:

**backend/.env**
```env
PORT=3001
RPC_URL=http://localhost:8545
LLAMA_API_URL=http://localhost:8000
FILECOIN_SYNAPSE_URL=http://localhost:8080
```

**contracts/.env**
```env
PRIVATE_KEY=your_test_private_key_here
```

Enjoy building on the Omnichain Intent Settlement Layer! 🚀

