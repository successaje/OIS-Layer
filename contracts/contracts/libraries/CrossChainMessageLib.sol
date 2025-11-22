// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/ICrossChainIntent.sol";

/**
 * @title CrossChainMessageLib
 * @notice Library for encoding/decoding cross-chain messages with domain separation
 */
library CrossChainMessageLib {
    // Domain separator for cross-chain messages
    bytes32 public constant DOMAIN_SEPARATOR = keccak256(
        "OmnichainIntentSettlementLayer.CrossChainMessage"
    );
    
    // Message type hash
    bytes32 public constant MESSAGE_TYPE_HASH = keccak256(
        "CrossChainMessage(bytes32 crossChainId,uint256 intentId,uint64 srcChainId,address user,bytes payload,bytes32 filecoinCid)"
    );
    
    /**
     * @notice Encode cross-chain message
     */
    function encodeMessage(
        ICrossChainIntent.CrossChainMessage memory message
    ) internal pure returns (bytes memory) {
        return abi.encode(
            DOMAIN_SEPARATOR,
            message.crossChainId,
            message.intentId,
            message.srcChainId,
            message.user,
            message.payload,
            message.filecoinCid
        );
    }
    
    /**
     * @notice Decode cross-chain message
     */
    function decodeMessage(
        bytes memory data
    ) internal pure returns (ICrossChainIntent.CrossChainMessage memory) {
        (
            bytes32 domain,
            bytes32 crossChainId,
            uint256 intentId,
            uint64 srcChainId,
            address user,
            bytes memory payload,
            bytes32 filecoinCid
        ) = abi.decode(data, (bytes32, bytes32, uint256, uint64, address, bytes, bytes32));
        
        require(domain == DOMAIN_SEPARATOR, "Invalid domain");
        
        return ICrossChainIntent.CrossChainMessage({
            crossChainId: crossChainId,
            intentId: intentId,
            srcChainId: srcChainId,
            user: user,
            payload: payload,
            filecoinCid: filecoinCid
        });
    }
    
    /**
     * @notice Generate cross-chain ID from intent ID and chain ID
     */
    function generateCrossChainId(
        uint256 intentId,
        uint64 srcChainId,
        uint64 dstChainId
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(intentId, srcChainId, dstChainId));
    }
    
    /**
     * @notice Verify message integrity
     */
    function verifyMessage(
        ICrossChainIntent.CrossChainMessage memory message
    ) internal pure returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encode(
                MESSAGE_TYPE_HASH,
                message.crossChainId,
                message.intentId,
                message.srcChainId,
                message.user,
                keccak256(message.payload),
                message.filecoinCid
            )
        );
        return messageHash != bytes32(0);
    }
}

