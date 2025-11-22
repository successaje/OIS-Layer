// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OApp, MessagingFee, MessagingReceipt, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./interfaces/IErrors.sol";
import "./interfaces/ICrossChainIntent.sol";
import "./libraries/CrossChainMessageLib.sol";

/**
 * @title ExecutionProxy
 * @notice Proxy for executing cross-chain intents with LayerZero V2 and enhanced oracle integration
 * @dev Extends OApp to enable atomic settlement of omnichain swaps with slippage protection
 */
contract ExecutionProxy is OApp, ReentrancyGuard {
    struct CrossChainSwap {
        uint256 intentId;
        address user;
        address srcToken;
        address dstToken;
        uint256 srcAmount;
        uint256 minDstAmount;
        uint32 dstEid;
        bool executed;
        bytes executionProof;
        uint256 deadline; // Slippage deadline
        bytes32 crossChainId; // Cross-chain intent ID
    }

    mapping(uint256 => CrossChainSwap) public swaps;
    mapping(address => AggregatorV3Interface) public priceFeeds; // Token to price feed
    mapping(address => uint256) public priceStalenessThreshold; // Max staleness per token

    uint256 public nextSwapId;
    address public intentManager;
    address public paymentEscrow;
    uint256 public defaultSlippageTolerance; // Basis points (e.g., 100 = 1%)

    event SwapInitiated(
        uint256 indexed swapId,
        uint256 indexed intentId,
        address indexed user,
        address srcToken,
        address dstToken,
        uint256 srcAmount,
        uint32 dstEid,
        bytes32 crossChainId
    );
    event SwapExecuted(
        uint256 indexed swapId,
        uint256 dstAmount,
        bytes executionProof
    );
    event PriceFeedUpdated(address indexed token, address indexed feed);
    event SlippageExceeded(uint256 indexed swapId, uint256 expected, uint256 actual);
    event PriceStalenessThresholdUpdated(address indexed token, uint256 threshold);

    constructor(
        address _endpoint,
        address _owner,
        address _intentManager,
        address _paymentEscrow
    ) OApp(_endpoint, _owner) Ownable(_owner) {
        intentManager = _intentManager;
        paymentEscrow = _paymentEscrow;
        defaultSlippageTolerance = 100; // 1% default
    }

    /**
     * @notice Initiate cross-chain swap with atomic settlement
     * @dev Includes enhanced slippage protection and oracle price checks
     */
    function initiateSwap(
        uint256 _intentId,
        address _srcToken,
        address _dstToken,
        uint256 _srcAmount,
        uint256 _minDstAmount,
        uint32 _dstEid,
        bytes calldata _options,
        uint256 _deadline
    ) external payable nonReentrant returns (uint256, MessagingReceipt memory) {
        if (_srcAmount == 0) {
            revert IErrors.InvalidAmount();
        }
        if (block.timestamp >= _deadline) {
            revert("Deadline passed");
        }

        // Transfer source tokens (or use native)
        if (_srcToken == address(0)) {
            if (msg.value < _srcAmount) {
                revert IErrors.InsufficientDeposit();
            }
        } else {
            if (!IERC20(_srcToken).transferFrom(msg.sender, address(this), _srcAmount)) {
                revert("Transfer failed");
            }
        }

        // Get price feed for slippage check with staleness validation
        uint256 expectedDstAmount = _getExpectedAmountWithValidation(
            _srcToken,
            _dstToken,
            _srcAmount
        );
        
        if (expectedDstAmount < _minDstAmount) {
            revert IErrors.SlippageExceeded(expectedDstAmount, _minDstAmount);
        }

        // Generate cross-chain ID
        bytes32 crossChainId = CrossChainMessageLib.generateCrossChainId(
            _intentId,
            uint64(block.chainid),
            uint64(_dstEid)
        );

        uint256 swapId = nextSwapId++;
        swaps[swapId] = CrossChainSwap({
            intentId: _intentId,
            user: msg.sender,
            srcToken: _srcToken,
            dstToken: _dstToken,
            srcAmount: _srcAmount,
            minDstAmount: _minDstAmount,
            dstEid: _dstEid,
            executed: false,
            executionProof: "",
            deadline: _deadline,
            crossChainId: crossChainId
        });

        // Build cross-chain message
        bytes memory message = abi.encode(
            swapId,
            _intentId,
            msg.sender,
            _srcToken,
            _dstToken,
            _srcAmount,
            _minDstAmount,
            crossChainId
        );

        MessagingFee memory fee = _quote(_dstEid, message, _options, false);
        if (msg.value < fee.nativeFee) {
            revert IErrors.InsufficientFee(fee.nativeFee, msg.value);
        }

        MessagingReceipt memory receipt = _lzSend(
            _dstEid,
            message,
            _options,
            fee,
            payable(msg.sender)
        );

        emit SwapInitiated(
            swapId,
            _intentId,
            msg.sender,
            _srcToken,
            _dstToken,
            _srcAmount,
            _dstEid,
            crossChainId
        );

        return (swapId, receipt);
    }

    /**
     * @notice Batch execute multiple intents atomically
     * @dev New extension - aggregates multiple OFT transfers
     */
    function batchExecuteIntent(
        uint256[] calldata _intentIds,
        address[] calldata _tokens,
        uint256[] calldata _amounts,
        uint32 _dstEid,
        bytes calldata _options
    ) external payable nonReentrant returns (MessagingReceipt memory) {
        if (_intentIds.length != _tokens.length || _tokens.length != _amounts.length) {
            revert("Mismatched arrays");
        }

        bytes memory message = abi.encode(_intentIds, _tokens, _amounts);

        MessagingFee memory fee = _quote(_dstEid, message, _options, false);
        if (msg.value < fee.nativeFee) {
            revert IErrors.InsufficientFee(fee.nativeFee, msg.value);
        }

        MessagingReceipt memory receipt = _lzSend(
            _dstEid,
            message,
            _options,
            fee,
            payable(msg.sender)
        );

        return receipt;
    }

    /**
     * @notice Handle received cross-chain swap
     * @dev Enhanced with deadline and slippage validation
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        (
            uint256 swapId,
            uint256 intentId,
            address user,
            address srcToken,
            address dstToken,
            uint256 srcAmount,
            uint256 minDstAmount,
            bytes32 crossChainId
        ) = abi.decode(_message, (uint256, uint256, address, address, address, uint256, uint256, bytes32));

        // Verify deadline
        if (block.timestamp >= swaps[swapId].deadline) {
            revert("Deadline passed");
        }

        // Execute swap on destination chain with oracle price validation
        uint256 dstAmount = _executeSwapWithValidation(
            srcToken,
            dstToken,
            srcAmount,
            minDstAmount
        );

        swaps[swapId].executed = true;
        swaps[swapId].executionProof = abi.encode(
            _origin.srcEid,
            dstAmount,
            block.timestamp,
            crossChainId
        );

        // Transfer tokens to user
        if (dstToken == address(0)) {
            (bool success, ) = payable(user).call{value: dstAmount}("");
            if (!success) {
                revert("Transfer failed");
            }
        } else {
            if (!IERC20(dstToken).transfer(user, dstAmount)) {
                revert("Transfer failed");
            }
        }

        emit SwapExecuted(swapId, dstAmount, swaps[swapId].executionProof);
    }

    /**
     * @notice Set Chainlink price feed for token
     */
    function setPriceFeed(
        address _token,
        address _feed
    ) external onlyOwner {
        if (_token == address(0)) {
            revert IErrors.InvalidToken(_token);
        }
        priceFeeds[_token] = AggregatorV3Interface(_feed);
        emit PriceFeedUpdated(_token, _feed);
    }

    /**
     * @notice Set price staleness threshold for token
     */
    function setPriceStalenessThreshold(
        address _token,
        uint256 _threshold
    ) external onlyOwner {
        priceStalenessThreshold[_token] = _threshold;
        emit PriceStalenessThresholdUpdated(_token, _threshold);
    }

    /**
     * @notice Get expected amount using Chainlink price feed with validation
     * @dev Includes staleness checks and price validation
     */
    function _getExpectedAmountWithValidation(
        address _srcToken,
        address _dstToken,
        uint256 _srcAmount
    ) internal view returns (uint256) {
        AggregatorV3Interface srcFeed = priceFeeds[_srcToken];
        AggregatorV3Interface dstFeed = priceFeeds[_dstToken];

        if (address(srcFeed) == address(0)) {
            revert IErrors.PriceFeedNotFound(_srcToken);
        }
        if (address(dstFeed) == address(0)) {
            revert IErrors.PriceFeedNotFound(_dstToken);
        }

        // Get latest round data with staleness check
        (
            uint80 roundId,
            int256 srcPrice,
            ,
            uint256 srcUpdatedAt,
            uint80 srcAnsweredInRound
        ) = srcFeed.latestRoundData();

        (
            ,
            int256 dstPrice,
            ,
            uint256 dstUpdatedAt,
            uint80 dstAnsweredInRound
        ) = dstFeed.latestRoundData();

        // Validate prices
        if (srcPrice <= 0 || dstPrice <= 0) {
            revert IErrors.InvalidPrice(srcPrice);
        }

        // Check staleness
        uint256 srcThreshold = priceStalenessThreshold[_srcToken] > 0 
            ? priceStalenessThreshold[_srcToken] 
            : 1 hours; // Default 1 hour
        
        uint256 dstThreshold = priceStalenessThreshold[_dstToken] > 0 
            ? priceStalenessThreshold[_dstToken] 
            : 1 hours;

        if (block.timestamp - srcUpdatedAt > srcThreshold) {
            revert IErrors.StalePrice(_srcToken, srcUpdatedAt);
        }
        if (block.timestamp - dstUpdatedAt > dstThreshold) {
            revert IErrors.StalePrice(_dstToken, dstUpdatedAt);
        }

        // Validate round completeness
        if (srcAnsweredInRound < roundId) {
            revert("Stale round");
        }

        // Calculate expected amount with 18 decimals
        return (uint256(srcPrice) * _srcAmount * 1e18) / (uint256(dstPrice) * 1e18);
    }

    /**
     * @notice Get expected amount (public view function)
     */
    function getExpectedAmount(
        address _srcToken,
        address _dstToken,
        uint256 _srcAmount
    ) external view returns (uint256) {
        return _getExpectedAmountWithValidation(_srcToken, _dstToken, _srcAmount);
    }

    /**
     * @notice Execute swap with validation (simplified - would integrate with DEX)
     * @dev Includes slippage protection and oracle validation
     */
    function _executeSwapWithValidation(
        address _srcToken,
        address _dstToken,
        uint256 _srcAmount,
        uint256 _minDstAmount
    ) internal returns (uint256) {
        // Get expected amount using oracle
        uint256 expectedDstAmount = _getExpectedAmountWithValidation(
            _srcToken,
            _dstToken,
            _srcAmount
        );

        // Apply slippage tolerance
        uint256 slippageAdjusted = expectedDstAmount * (10000 - defaultSlippageTolerance) / 10000;
        
        if (slippageAdjusted < _minDstAmount) {
            revert IErrors.SlippageExceeded(slippageAdjusted, _minDstAmount);
        }

        // In production, this would integrate with DEX aggregators
        // For now, return expected amount
        return slippageAdjusted;
    }

    /**
     * @notice Set default slippage tolerance
     */
    function setDefaultSlippageTolerance(uint256 _tolerance) external onlyOwner {
        require(_tolerance <= 1000, "Tolerance too high"); // Max 10%
        defaultSlippageTolerance = _tolerance;
    }

    // View functions
    function getSwap(uint256 _swapId) external view returns (CrossChainSwap memory) {
        return swaps[_swapId];
    }
}
