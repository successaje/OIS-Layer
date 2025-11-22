// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockLayerZeroEndpoint
 * @notice Mock LayerZero Endpoint V2 for testing
 */
contract MockLayerZeroEndpoint {
    struct MessagingParams {
        uint32 dstEid;
        bytes32 receiver;
        bytes message;
        bytes options;
        bool payInLzToken;
    }

    mapping(bytes32 => MessagingParams) public messages;
    mapping(uint32 => address) public peers;
    
    uint256 public nextNonce;
    
    event MessageSent(
        bytes32 indexed guid,
        uint32 dstEid,
        bytes32 receiver,
        bytes message
    );

    function setPeer(uint32 _eid, address _peer) external {
        peers[_eid] = _peer;
    }

    function send(
        MessagingParams calldata _params,
        address /*_refundTo*/
    ) external payable returns (MessagingReceipt memory) {
        bytes32 guid = keccak256(abi.encodePacked(block.timestamp, nextNonce++, msg.sender));
        messages[guid] = _params;
        
        emit MessageSent(guid, _params.dstEid, _params.receiver, _params.message);
        
        return MessagingReceipt({
            guid: guid,
            fee: MessagingFee({
                nativeFee: msg.value,
                lzTokenFee: 0
            })
        });
    }

    function quote(
        MessagingParams calldata /*_params*/,
        address /*_sender*/
    ) external pure returns (MessagingFee memory) {
        // Mock fee calculation
        uint256 fee = 1000000; // 0.001 ETH
        return MessagingFee({
            nativeFee: fee,
            lzTokenFee: 0
        });
    }

    function lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata _extraData
    ) external {
        // This would be called by the receiving contract
        // For testing, we'll simulate it
    }
}

struct MessagingReceipt {
    bytes32 guid;
    MessagingFee fee;
}

struct MessagingFee {
    uint256 nativeFee;
    uint256 lzTokenFee;
}

struct Origin {
    uint32 srcEid;
    bytes32 sender;
    uint64 nonce;
}

