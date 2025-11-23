# Filecoin Integration Documentation

Complete documentation of all Filecoin integration routes, API endpoints, and smart contract methods in the Omnichain Intent Settlement Layer.

---

## 📍 Table of Contents

- [Overview](#overview)
- [API Routes](#api-routes)
- [Backend Service Methods](#backend-service-methods)
- [Smart Contract Methods](#smart-contract-methods)
- [Frontend Integration](#frontend-integration)
- [Environment Configuration](#environment-configuration)

---

## Overview

Filecoin integration provides decentralized storage for:
- Intent metadata
- Agent proposal proofs
- Execution audit logs
- Cross-chain message verification

All data is stored on Filecoin network and referenced via Content IDs (CIDs) stored on-chain as `bytes32`.

---

## API Routes

All Filecoin routes are exposed via the `FilecoinController` at `/api/filecoin`:

### 1. **POST `/api/filecoin/pin/json`**

Pin JSON data to Filecoin storage.

- **Controller**: `FilecoinController.pinJson()`
- **Service**: `FilecoinService.pinJson()`
- **Request Body**: 
  ```json
  {
    "intentSpec": "string",
    "userAddress": "string",
    "amount": "string",
    "tokenAddress": "string",
    "deadline": "string",
    "createdAt": "date"
  }
  ```
- **Response**: 
  ```json
  {
    "cid": "string",
    "success": true
  }
  ```
- **Usage**: Stores intent metadata, agent proofs, and audit logs on Filecoin
- **Example**:
  ```bash
  curl -X POST http://localhost:3001/api/filecoin/pin/json \
    -H "Content-Type: application/json" \
    -d '{"intentSpec": "Get 5% yield", "userAddress": "0x..."}'
  ```

### 2. **POST `/api/filecoin/pin/file`**

Upload and pin files to Filecoin storage.

- **Controller**: `FilecoinController.pinFile()`
- **Service**: `FilecoinService.pinFile()`
- **Request**: Multipart form data with `file` field
- **Response**: 
  ```json
  {
    "cid": "string",
    "success": true,
    "filename": "string"
  }
  ```
- **Usage**: Upload files (documents, images, etc.) for intent execution proofs
- **Example**:
  ```bash
  curl -X POST http://localhost:3001/api/filecoin/pin/file \
    -F "file=@proof.pdf"
  ```

### 3. **GET `/api/filecoin/cat/:cid`**

Retrieve data from Filecoin by Content ID (CID).

- **Controller**: `FilecoinController.getByCid()`
- **Service**: `FilecoinService.getByCid()`
- **Parameters**: `cid` (path parameter)
- **Response**: 
  ```json
  {
    "cid": "string",
    "data": {},
    "success": true
  }
  ```
- **Usage**: Fetch stored intent metadata, agent strategies, or proof data
- **Example**:
  ```bash
  curl http://localhost:3001/api/filecoin/cat/QmXxxx...
  ```

### 4. **GET `/api/filecoin/verify/:cid`**

Verify if a CID exists on Filecoin network.

- **Controller**: `FilecoinController.verifyCid()`
- **Service**: `FilecoinService.verifyCid()`
- **Parameters**: `cid` (path parameter)
- **Response**: 
  ```json
  {
    "cid": "string",
    "exists": true,
    "success": true
  }
  ```
- **Usage**: Validate that stored data is accessible on Filecoin
- **Example**:
  ```bash
  curl http://localhost:3001/api/filecoin/verify/QmXxxx...
  ```

---

## Backend Service Methods

### FilecoinService (`backend/src/modules/filecoin/filecoin.service.ts`)

#### **`pinJson(data: any): Promise<string>`**
- **Description**: Pin JSON data to Filecoin and return CID
- **Parameters**: `data` - Any JSON-serializable object
- **Returns**: CID string
- **Internal**: Calls Synapse SDK `/api/v1/pin/json` endpoint
- **Fallback**: Returns mock CID if service unavailable

#### **`pinFile(file: Buffer, filename: string): Promise<string>`**
- **Description**: Pin file/blob to Filecoin
- **Parameters**: 
  - `file`: File buffer
  - `filename`: Original filename
- **Returns**: CID string
- **Internal**: Calls Synapse SDK `/api/v1/pin/file` endpoint with multipart form data

#### **`getByCid(cid: string): Promise<any>`**
- **Description**: Retrieve data from Filecoin by CID
- **Parameters**: `cid` - Content ID
- **Returns**: Decoded data object
- **Internal**: Calls Synapse SDK `/api/v1/cat/{cid}` endpoint

#### **`verifyCid(cid: string): Promise<boolean>`**
- **Description**: Verify CID exists on Filecoin
- **Parameters**: `cid` - Content ID
- **Returns**: `true` if CID exists, `false` otherwise
- **Internal**: Calls Synapse SDK `/api/v1/cat/{cid}` with HEAD request

### Internal Service Usage

#### **IntentsService** (`backend/src/modules/intents/intents.service.ts`)
- **Route**: `POST /api/intents` (via `IntentsController`)
- **Method**: `create()`
- **Filecoin Usage**: 
  - Automatically stores intent metadata to Filecoin when creating intents
  - Stores: `intentSpec`, `userAddress`, `amount`, `tokenAddress`, `deadline`, `createdAt`
  - Returns CID in `filecoinCid` field of Intent entity

#### **AgentsService** (`backend/src/modules/agents/agents.service.ts`)
- **Route**: `POST /api/agents/:id/proposals` and `POST /api/agents/auction/:intentId/proposals`
- **Method**: `generateProposal()`
- **Filecoin Usage**:
  - Stores agent proposal proofs on Filecoin
  - Stores: `intentId`, `agentId`, `strategy`, `marketData`, `generatedAt`, `llamaResponse`
  - CID included in proposal response as `proofCid`

---

## Smart Contract Methods

Filecoin CIDs are stored on-chain as `bytes32` values in the `IntentManager` contract.

### IntentManager Contract (`contracts/contracts/IntentManager.sol`)

**Contract Address**: Deployed per network (see deployment files)

#### **1. `createIntent()` - Store Filecoin CID with Intent**

```solidity
function createIntent(
    string calldata _intentSpec,
    bytes32 _filecoinCid,        // Filecoin CID stored as bytes32
    uint256 _deadline,
    address _token,
    uint256 _amount
) external payable returns (uint256)
```

- **Parameters**:
  - `_filecoinCid`: Filecoin CID (bytes32) - metadata stored on Filecoin
- **Returns**: `uint256` - Intent ID
- **Events**: `IntentCreated(intentId, user, intentSpec, amount, filecoinCid)`
- **Usage**: Creates intent and stores Filecoin CID for metadata verification
- **Storage**: CID stored in `Intent.filecoinCid` mapping

#### **2. `submitProposal()` - Store Agent Proof CID**

```solidity
function submitProposal(
    uint256 _intentId,
    uint256 _agentId,
    string calldata _strategy,
    uint256 _expectedCost,
    uint256 _expectedAPY,
    uint256 _timeline,
    bytes calldata _signature,
    bytes32 _proofCid              // Filecoin CID of agent proof
) external returns (uint256)
```

- **Parameters**:
  - `_proofCid`: Filecoin CID (bytes32) - agent's proof/strategy stored on Filecoin
- **Returns**: `uint256` - Proposal ID
- **Events**: `ProposalSubmitted(intentId, proposalId, agentId, proofCid)`
- **Usage**: Agents submit proposals with Filecoin-stored proof
- **Storage**: CID stored in `AgentProposal.proofCid` mapping

#### **3. View Functions - Access Filecoin CIDs**

```solidity
// Get intent with Filecoin CID
function getIntent(uint256 _intentId) external view returns (Intent memory)
// Returns: Intent struct containing filecoinCid field

// Get proposal with proof CID
function getIntentProposals(uint256 _intentId) external view returns (AgentProposal[] memory)
// Returns: Array of proposals, each containing proofCid field

// Get cross-chain intent data (includes Filecoin CID)
function getCrossChainIntent(bytes32 _crossChainId) external view returns (CrossChainIntentData memory)
// Returns: CrossChainIntentData containing filecoinCid
```

#### **4. Cross-Chain Message - Filecoin CID Transmission**

Filecoin CIDs are included in cross-chain messages via LayerZero and CCIP:

```solidity
// In sendIntentToChain() - LayerZero
ICrossChainIntent.CrossChainMessage memory message = ICrossChainIntent.CrossChainMessage({
    crossChainId: crossChainId,
    intentId: _intentId,
    srcChainId: currentChainId,
    user: intent.user,
    payload: _payload,
    filecoinCid: intent.filecoinCid  // CID transmitted across chains
});

// In sendViaCCIP() - Chainlink CCIP
ICrossChainIntent.CrossChainMessage memory message = ICrossChainIntent.CrossChainMessage({
    crossChainId: crossChainId,
    intentId: _intentId,
    srcChainId: currentChainId,
    user: intent.user,
    payload: _payload,
    filecoinCid: intent.filecoinCid  // CID transmitted via CCIP
});
```

### Data Structures

```solidity
struct Intent {
    uint256 intentId;
    address user;
    string intentSpec;
    uint256 amount;
    address token;
    IntentStatus status;
    uint256 deadline;
    uint256 selectedAgentId;
    bytes32 filecoinCid;  // Filecoin CID for metadata
    uint256 createdAt;
    uint256 executedAt;
}

struct AgentProposal {
    uint256 proposalId;
    uint256 intentId;
    uint256 agentId;
    string strategy;
    uint256 expectedCost;
    uint256 expectedAPY;
    uint256 timeline;
    bytes signature;
    bytes32 proofCid;     // Filecoin CID for agent proof
    bool selected;
    uint256 submittedAt;
}

struct CrossChainIntentData {
    bytes32 crossChainId;
    uint256 intentId;
    uint64 srcChainId;
    uint64 dstChainId;
    address user;
    bytes32 filecoinCid;  // CID included in cross-chain data
    uint256 amount;
    address token;
    uint256 deadline;
    uint256 selectedAgentId;
    bytes executionPayload;
    bool executed;
}
```

### CID Format

- **Storage**: Stored as `bytes32` (32 bytes) on-chain
- **Conversion**: Frontend converts string CID to bytes32 using `cidToBytes32()` helper
- **Viewing**: IPFS/Filecoin CIDs can be viewed via IPFS gateway using `getGatewayUrl()`
- **Example**: 
  - String CID: `QmXxxx...`
  - Bytes32: `0x...` (padded/truncated to 32 bytes)

---

## Frontend Integration

### useFilecoin Hook (`frontend/src/hooks/useFilecoin.ts`)

#### **`pinJson(data: any): Promise<string>`**
- Pin JSON data to Filecoin
- Returns CID string

#### **`pinFile(file: File): Promise<string>`**
- Upload files to Filecoin
- Returns CID string

#### **`getByCid(cid: string): Promise<any>`**
- Retrieve data from Filecoin by CID
- Returns decoded data

#### **`verifyCid(cid: string): Promise<boolean>`**
- Verify CID exists on Filecoin
- Returns boolean

#### **`cidToBytes32(cid: string): \`0x${string}\``**
- Convert CID to bytes32 format for smart contracts
- Handles padding/truncation

#### **`getGatewayUrl(cid: string, gateway?: string): string`**
- Get IPFS gateway URL for viewing CID
- Default gateway: `https://ipfs.io/ipfs/`

### Components

#### **FilecoinUpload** (`frontend/components/FilecoinUpload.tsx`)
- Drag-and-drop file upload
- JSON metadata upload option
- Progress indicators
- CID display after upload
- Props:
  - `onCidChange?: (cid: string | null) => void`
  - `label?: string`
  - `description?: string`
  - `accept?: string`
  - `maxSizeMB?: number`

#### **FilecoinCidDisplay** (`frontend/components/FilecoinCidDisplay.tsx`)
- Display CIDs with verification status
- Copy to clipboard functionality
- Link to IPFS gateway
- Compact and full display modes
- Props:
  - `cid: string`
  - `label?: string`
  - `showVerify?: boolean`
  - `compact?: boolean`

### Usage Example

```typescript
import { useFilecoin } from '@/src/hooks/useFilecoin';
import { FilecoinUpload } from '@/components/FilecoinUpload';

function IntentCreation() {
  const { pinJson, isPinning } = useFilecoin();
  const [cid, setCid] = useState<string | null>(null);

  const handleUpload = async () => {
    const metadata = {
      intentSpec: "Get 5% yield",
      timestamp: new Date().toISOString()
    };
    const filecoinCid = await pinJson(metadata);
    setCid(filecoinCid);
  };

  return (
    <FilecoinUpload
      onCidChange={setCid}
      label="Store Intent Metadata"
    />
  );
}
```

---

## Environment Configuration

### Required Environment Variables

```env
# Filecoin Synapse SDK Configuration
FILECOIN_SYNAPSE_URL=http://localhost:8080
FILECOIN_API_KEY=your_api_key_here
```

### Configuration Details

- **FILECOIN_SYNAPSE_URL**: 
  - Default: `http://localhost:8080`
  - Production: Your Synapse SDK endpoint URL
  - Testnet: Filecoin Calibration testnet endpoint

- **FILECOIN_API_KEY**: 
  - Optional: API key for authenticated requests
  - Required for production deployments
  - Format: Bearer token in Authorization header

### Synapse SDK Endpoints

The service uses the following Synapse SDK endpoints:
- `POST /api/v1/pin/json` - Pin JSON data
- `POST /api/v1/pin/file` - Pin files
- `GET /api/v1/cat/{cid}` - Retrieve data by CID
- `HEAD /api/v1/cat/{cid}` - Verify CID exists

### Local Development

For local development, you can use:
- Local Filecoin emulator
- IPFS node with Filecoin integration
- Mock responses (returns mock CIDs)

---

## Integration Flow Examples

### Intent Creation with Filecoin

1. **Frontend**: User creates intent
2. **Backend**: `IntentsService.create()` called
3. **Filecoin**: Metadata pinned via `FilecoinService.pinJson()`
4. **Database**: Intent saved with `filecoinCid`
5. **On-chain**: `createIntent()` called with CID as `bytes32`
6. **Result**: Intent created with verifiable Filecoin storage

### Agent Proposal with Proof

1. **Backend**: `AgentsService.generateProposal()` called
2. **Chainlink**: Market data fetched
3. **Llama**: Strategy generated
4. **Filecoin**: Proof stored via `FilecoinService.pinJson()`
5. **On-chain**: `submitProposal()` called with `proofCid`
6. **Result**: Proposal with verifiable proof on Filecoin

### Cross-Chain CID Transmission

1. **Source Chain**: Intent created with Filecoin CID
2. **LayerZero/CCIP**: CID included in cross-chain message
3. **Destination Chain**: CID received and stored
4. **Verification**: CID can be verified on Filecoin network
5. **Result**: Cross-chain intent with verifiable metadata

---

## Related Documentation

- [Filecoin Onchain Cloud Docs](https://docs.filecoin.cloud/)
- [Synapse SDK](https://github.com/FIL-Ozone/synapse-sdk)
- [IPFS Gateway](https://ipfs.io/)
- [Main Integration Routes](../INTEGRATION_ROUTES.md)

