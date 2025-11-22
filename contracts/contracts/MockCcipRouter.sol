// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @notice Mock Chainlink CCIP Router for testing
 */
contract MockCcipRouter {
    function ccipSend(
        uint64 destinationChainSelector,
        bytes memory message
    ) external payable returns (bytes32 messageId) {
        // Mock implementation
        messageId = keccak256(abi.encodePacked(destinationChainSelector, message, block.timestamp));
        return messageId;
    }
}

