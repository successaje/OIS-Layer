// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICCIPReceiver
 * @notice Interface for Chainlink CCIP receiver
 */
interface ICCIPReceiver {
    struct Any2EVMMessage {
        bytes32 messageId;
        uint64 sourceChainSelector;
        bytes sender;
        bytes data;
        address[] destTokenAmounts;
    }
    
    function ccipReceive(Any2EVMMessage calldata message) external;
}

