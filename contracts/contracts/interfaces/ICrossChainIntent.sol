// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICrossChainIntent
 * @notice Interface for cross-chain intent data structures
 */
interface ICrossChainIntent {
    struct CrossChainIntentData {
        bytes32 crossChainId;        // Unique cross-chain identifier
        uint256 intentId;            // Original intent ID on source chain
        uint64 srcChainId;           // Source chain ID
        uint64 dstChainId;           // Destination chain ID
        address user;                 // User address
        bytes32 filecoinCid;         // Filecoin CID
        uint256 amount;               // Amount
        address token;                // Token address
        uint256 deadline;             // Deadline
        uint256 selectedAgentId;      // Selected agent ID
        bytes executionPayload;       // Execution payload
        bool executed;               // Execution status
    }
    
    struct CrossChainMessage {
        bytes32 crossChainId;
        uint256 intentId;
        uint64 srcChainId;
        address user;
        bytes payload;
        bytes32 filecoinCid;
    }
}

