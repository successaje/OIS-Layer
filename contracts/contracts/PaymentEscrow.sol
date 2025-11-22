// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IErrors.sol";

/**
 * @title PaymentEscrow
 * @notice Escrow contract for holding funds during intent execution with cross-chain settlement support
 * @dev Supports both local and cross-chain escrow release via LayerZero/CCIP messages
 */
contract PaymentEscrow is ReentrancyGuard, Ownable {
    struct Escrow {
        uint256 escrowId;
        address depositor;
        address beneficiary;
        address token; // address(0) for native
        uint256 amount;
        bool released;
        uint256 createdAt;
        uint256 releasedAt;
        bytes32 intentId; // Associated intent ID
        uint64 srcChainId; // Source chain ID for cross-chain escrows
    }

    // Cross-chain escrow tracking
    mapping(bytes32 => Escrow) public crossChainEscrows; // crossChainId => Escrow
    mapping(uint256 => Escrow) public escrows;
    
    // Authorized contracts that can release escrows (IntentManager, ExecutionProxy)
    mapping(address => bool) public authorizedReleasers;
    
    uint256 public nextEscrowId;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed depositor,
        address indexed beneficiary,
        address token,
        uint256 amount,
        bytes32 intentId
    );
    event EscrowReleased(uint256 indexed escrowId, address indexed beneficiary);
    event CrossChainEscrowReleased(
        bytes32 indexed intentId,
        uint64 srcChain,
        address indexed beneficiary,
        uint256 amount
    );
    event AuthorizedReleaserAdded(address indexed releaser);
    event AuthorizedReleaserRemoved(address indexed releaser);

    constructor(address _owner) Ownable(_owner) {}

    /**
     * @notice Create escrow for native tokens
     */
    function createEscrow(
        address _beneficiary,
        bytes32 _intentId
    ) external payable nonReentrant returns (uint256) {
        if (msg.value == 0) {
            revert IErrors.InsufficientDeposit();
        }
        if (_beneficiary == address(0)) {
            revert IErrors.InvalidBeneficiary();
        }

        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            depositor: msg.sender,
            beneficiary: _beneficiary,
            token: address(0),
            amount: msg.value,
            released: false,
            createdAt: block.timestamp,
            releasedAt: 0,
            intentId: _intentId,
            srcChainId: 0
        });

        emit EscrowCreated(
            escrowId,
            msg.sender,
            _beneficiary,
            address(0),
            msg.value,
            _intentId
        );
        return escrowId;
    }

    /**
     * @notice Create escrow for ERC20 tokens
     */
    function createEscrowERC20(
        address _token,
        address _beneficiary,
        uint256 _amount,
        bytes32 _intentId
    ) external nonReentrant returns (uint256) {
        if (_amount == 0) {
            revert IErrors.InsufficientDeposit();
        }
        if (_beneficiary == address(0)) {
            revert IErrors.InvalidBeneficiary();
        }

        IERC20 token = IERC20(_token);
        if (!token.transferFrom(msg.sender, address(this), _amount)) {
            revert("Transfer failed");
        }

        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            depositor: msg.sender,
            beneficiary: _beneficiary,
            token: _token,
            amount: _amount,
            released: false,
            createdAt: block.timestamp,
            releasedAt: 0,
            intentId: _intentId,
            srcChainId: 0
        });

        emit EscrowCreated(escrowId, msg.sender, _beneficiary, _token, _amount, _intentId);
        return escrowId;
    }

    /**
     * @notice Create cross-chain escrow (called by authorized contracts)
     */
    function createCrossChainEscrow(
        bytes32 _crossChainId,
        address _beneficiary,
        address _token,
        uint256 _amount,
        bytes32 _intentId,
        uint64 _srcChainId
    ) external payable nonReentrant returns (bool) {
        if (!authorizedReleasers[msg.sender]) {
            revert("Not authorized");
        }
        if (_beneficiary == address(0)) {
            revert IErrors.InvalidBeneficiary();
        }

        // For native tokens, amount should be sent with the call
        if (_token == address(0)) {
            if (msg.value < _amount) {
                revert IErrors.InsufficientDeposit();
            }
        } else {
            IERC20 token = IERC20(_token);
            if (!token.transferFrom(msg.sender, address(this), _amount)) {
                revert("Transfer failed");
            }
        }

        crossChainEscrows[_crossChainId] = Escrow({
            escrowId: 0, // Not used for cross-chain escrows
            depositor: msg.sender,
            beneficiary: _beneficiary,
            token: _token,
            amount: _amount,
            released: false,
            createdAt: block.timestamp,
            releasedAt: 0,
            intentId: _intentId,
            srcChainId: _srcChainId
        });

        emit EscrowCreated(0, msg.sender, _beneficiary, _token, _amount, _intentId);
        return true;
    }

    /**
     * @notice Release escrowed funds (local escrow)
     */
    function releaseEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        if (escrow.escrowId != _escrowId) {
            revert IErrors.EscrowNotFound(_escrowId);
        }
        if (msg.sender != escrow.beneficiary && !authorizedReleasers[msg.sender]) {
            revert IErrors.NotBeneficiary(msg.sender, escrow.beneficiary);
        }
        if (escrow.released) {
            revert IErrors.AlreadyReleased(_escrowId);
        }

        escrow.released = true;
        escrow.releasedAt = block.timestamp;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.beneficiary.call{value: escrow.amount}("");
            if (!success) {
                revert("Transfer failed");
            }
        } else {
            IERC20 token = IERC20(escrow.token);
            if (!token.transfer(escrow.beneficiary, escrow.amount)) {
                revert("Transfer failed");
            }
        }

        emit EscrowReleased(_escrowId, escrow.beneficiary);
    }

    /**
     * @notice Release cross-chain escrow (only callable by LayerZero/CCIP messages)
     * @dev This function should only be called by authorized contracts (IntentManager, ExecutionProxy)
     *      after receiving a valid cross-chain message
     */
    function releaseCrossChainEscrow(
        bytes32 _crossChainId,
        bytes32 _intentId,
        uint64 _srcChainId,
        address _beneficiary
    ) external nonReentrant {
        // Only authorized releasers (IntentManager, ExecutionProxy) can call this
        if (!authorizedReleasers[msg.sender]) {
            revert("Not authorized");
        }

        Escrow storage escrow = crossChainEscrows[_crossChainId];
        if (escrow.intentId != _intentId) {
            revert IErrors.EscrowNotFound(0);
        }
        if (escrow.srcChainId != _srcChainId) {
            revert("Invalid source chain");
        }
        if (escrow.beneficiary != _beneficiary) {
            revert IErrors.NotBeneficiary(msg.sender, escrow.beneficiary);
        }
        if (escrow.released) {
            revert IErrors.AlreadyReleased(0);
        }

        escrow.released = true;
        escrow.releasedAt = block.timestamp;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.beneficiary.call{value: escrow.amount}("");
            if (!success) {
                revert IErrors.CrossChainReleaseFailed(_intentId, _srcChainId);
            }
        } else {
            IERC20 token = IERC20(escrow.token);
            if (!token.transfer(escrow.beneficiary, escrow.amount)) {
                revert IErrors.CrossChainReleaseFailed(_intentId, _srcChainId);
            }
        }

        emit CrossChainEscrowReleased(_intentId, _srcChainId, _beneficiary, escrow.amount);
    }

    /**
     * @notice Add authorized releaser (IntentManager, ExecutionProxy)
     */
    function addAuthorizedReleaser(address _releaser) external onlyOwner {
        authorizedReleasers[_releaser] = true;
        emit AuthorizedReleaserAdded(_releaser);
    }

    /**
     * @notice Remove authorized releaser
     */
    function removeAuthorizedReleaser(address _releaser) external onlyOwner {
        authorizedReleasers[_releaser] = false;
        emit AuthorizedReleaserRemoved(_releaser);
    }

    // View functions
    function getEscrow(uint256 _escrowId) external view returns (Escrow memory) {
        return escrows[_escrowId];
    }

    function getCrossChainEscrow(bytes32 _crossChainId) external view returns (Escrow memory) {
        return crossChainEscrows[_crossChainId];
    }
}
