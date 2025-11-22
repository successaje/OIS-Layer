// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OApp, MessagingFee, MessagingReceipt, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IErrors.sol";
import "./interfaces/ICrossChainIntent.sol";
import "./interfaces/ICCIPReceiver.sol";
import "./libraries/CrossChainMessageLib.sol";

/**
 * @title IntentManager
 * @notice Core contract for managing user intents with LayerZero V2 and Chainlink CCIP cross-chain messaging
 * @dev Extends OApp for LayerZero V2 and implements CCIPReceiver for Chainlink CCIP
 */
contract IntentManager is OApp, ReentrancyGuard, AccessControl, ICCIPReceiver {
    using CrossChainMessageLib for ICrossChainIntent.CrossChainMessage;
    
    // Role definitions
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    enum IntentStatus {
        Open,
        Bidding,
        Executing,
        Completed,
        Disputed,
        Cancelled
    }

    struct Intent {
        uint256 intentId;
        address user;
        string intentSpec; // Natural language + structured JSON
        uint256 amount; // Escrowed amount
        address token; // Token address (address(0) for native)
        IntentStatus status;
        uint256 deadline;
        uint256 selectedAgentId;
        bytes32 filecoinCid; // CID of stored intent metadata
        uint256 createdAt;
        uint256 executedAt;
    }

    struct AgentProposal {
        uint256 proposalId;
        uint256 intentId;
        uint256 agentId;
        string strategy; // JSON strategy
        uint256 expectedCost;
        uint256 expectedAPY;
        uint256 timeline; // In seconds
        bytes signature;
        bytes32 proofCid; // Filecoin CID of agent proof
        bool selected;
        uint256 submittedAt;
    }

    // Chainlink CCIP Router address
    address public ccipRouter;
    
    // Chain selector mappings (CCIP uses uint64 chain selectors)
    mapping(uint64 => bool) public supportedChainSelectors;
    mapping(uint64 => address) public chainSelectorToLZEndpoint; // For LayerZero endpoint mapping
    
    // Cross-chain intent tracking
    mapping(bytes32 => ICrossChainIntent.CrossChainIntentData) public crossChainIntents;
    mapping(uint256 => bytes32[]) public intentToCrossChainIds; // Intent ID to cross-chain IDs
    
    // Executor and oracle validation
    mapping(address => bool) public validExecutors;
    mapping(address => bool) public validOracles;
    
    // State variables
    mapping(uint256 => Intent) public intents;
    mapping(uint256 => AgentProposal[]) public intentProposals;
    mapping(uint256 => uint256) public intentProposalCount;
    mapping(address => uint256[]) public userIntents;

    uint256 public nextIntentId;
    uint256 public constant MIN_DEADLINE = 1 hours;
    uint256 public constant MAX_DEADLINE = 30 days;
    
    // Current chain ID (set in constructor)
    uint64 public immutable currentChainId;

    // Events
    event IntentCreated(
        uint256 indexed intentId,
        address indexed user,
        string intentSpec,
        uint256 amount,
        bytes32 filecoinCid
    );
    event ProposalSubmitted(
        uint256 indexed intentId,
        uint256 indexed proposalId,
        uint256 indexed agentId,
        bytes32 proofCid
    );
    event AgentSelected(
        uint256 indexed intentId,
        uint256 indexed agentId,
        uint256 indexed proposalId
    );
    event IntentExecuted(uint256 indexed intentId, bytes executionPayload);
    event CrossChainMessageSent(
        uint256 indexed intentId,
        uint32 dstEid,
        bytes32 messageId,
        bytes32 crossChainId
    );
    event CrossChainMessageReceived(
        uint256 indexed intentId,
        uint32 srcEid,
        bytes payload,
        bytes32 crossChainId
    );
    event IntentSentViaCCIP(
        uint256 indexed intentId,
        uint64 dstChainSelector,
        bytes32 messageId,
        bytes32 crossChainId
    );
    event IntentReceivedViaCCIP(
        uint256 indexed intentId,
        uint64 srcChainSelector,
        bytes32 crossChainId
    );
    event ChainSelectorAdded(uint64 chainSelector);
    event ChainSelectorRemoved(uint64 chainSelector);
    event ExecutorAdded(address executor);
    event ExecutorRemoved(address executor);
    event OracleAdded(address oracle);
    event OracleRemoved(address oracle);

    constructor(
        address _endpoint,
        address _ccipRouter,
        address _owner,
        uint64 _chainId
    ) OApp(_endpoint, _owner) Ownable(_owner) {
        ccipRouter = _ccipRouter;
        currentChainId = _chainId;
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(EXECUTOR_ROLE, _owner);
        _grantRole(ORACLE_ROLE, _owner);
    }

    /**
     * @notice Create a new intent
     * @param _intentSpec Natural language + structured JSON specification
     * @param _filecoinCid CID of intent metadata stored on Filecoin
     * @param _deadline Deadline for intent execution
     */
    function createIntent(
        string calldata _intentSpec,
        bytes32 _filecoinCid,
        uint256 _deadline,
        address _token,
        uint256 _amount
    ) external payable nonReentrant returns (uint256) {
        if (_deadline < block.timestamp + MIN_DEADLINE) {
            revert IErrors.InvalidDeadline(_deadline);
        }
        if (_deadline > block.timestamp + MAX_DEADLINE) {
            revert IErrors.InvalidDeadline(_deadline);
        }
        if (bytes(_intentSpec).length == 0) {
            revert IErrors.EmptyIntentSpec();
        }

        uint256 intentId = nextIntentId++;
        uint256 depositAmount = _token == address(0) ? msg.value : _amount;

        if (depositAmount == 0) {
            revert IErrors.InsufficientDeposit();
        }

        if (_token != address(0) && _amount > 0) {
            // Transfer ERC20 tokens (requires approval)
            // Implementation would use IERC20(_token).transferFrom(msg.sender, address(this), _amount)
        }

        intents[intentId] = Intent({
            intentId: intentId,
            user: msg.sender,
            intentSpec: _intentSpec,
            amount: depositAmount,
            token: _token,
            status: IntentStatus.Open,
            deadline: _deadline,
            selectedAgentId: 0,
            filecoinCid: _filecoinCid,
            createdAt: block.timestamp,
            executedAt: 0
        });

        userIntents[msg.sender].push(intentId);

        emit IntentCreated(intentId, msg.sender, _intentSpec, depositAmount, _filecoinCid);
        return intentId;
    }

    /**
     * @notice Start bidding phase for an intent
     */
    function startBidding(uint256 _intentId) external {
        Intent storage intent = intents[_intentId];
        if (intent.intentId != _intentId) {
            revert IErrors.IntentNotFound(_intentId);
        }
        if (intent.status != IntentStatus.Open) {
            revert IErrors.IntentNotInBidding(_intentId);
        }
        if (msg.sender != intent.user) {
            revert IErrors.NotIntentOwner(msg.sender);
        }
        intent.status = IntentStatus.Bidding;
    }

    /**
     * @notice Submit agent proposal
     */
    function submitProposal(
        uint256 _intentId,
        uint256 _agentId,
        string calldata _strategy,
        uint256 _expectedCost,
        uint256 _expectedAPY,
        uint256 _timeline,
        bytes calldata _signature,
        bytes32 _proofCid
    ) external returns (uint256) {
        Intent storage intent = intents[_intentId];
        if (intent.intentId != _intentId) {
            revert IErrors.IntentNotFound(_intentId);
        }
        if (intent.status != IntentStatus.Bidding) {
            revert IErrors.IntentNotInBidding(_intentId);
        }
        if (block.timestamp >= intent.deadline) {
            revert IErrors.IntentDeadlinePassed(_intentId);
        }

        uint256 proposalId = intentProposalCount[_intentId]++;
        intentProposals[_intentId].push(
            AgentProposal({
                proposalId: proposalId,
                intentId: _intentId,
                agentId: _agentId,
                strategy: _strategy,
                expectedCost: _expectedCost,
                expectedAPY: _expectedAPY,
                timeline: _timeline,
                signature: _signature,
                proofCid: _proofCid,
                selected: false,
                submittedAt: block.timestamp
            })
        );

        emit ProposalSubmitted(_intentId, proposalId, _agentId, _proofCid);
        return proposalId;
    }

    /**
     * @notice Select winning agent proposal
     */
    function selectAgent(
        uint256 _intentId,
        uint256 _proposalId
    ) external {
        Intent storage intent = intents[_intentId];
        if (intent.intentId != _intentId) {
            revert IErrors.IntentNotFound(_intentId);
        }
        if (msg.sender != intent.user) {
            revert IErrors.NotIntentOwner(msg.sender);
        }
        if (intent.status != IntentStatus.Bidding) {
            revert IErrors.IntentNotInBidding(_intentId);
        }
        if (_proposalId >= intentProposals[_intentId].length) {
            revert IErrors.InvalidProposal(_proposalId);
        }

        AgentProposal storage proposal = intentProposals[_intentId][_proposalId];
        if (proposal.selected) {
            revert IErrors.ProposalAlreadySelected(_proposalId);
        }

        intent.selectedAgentId = proposal.agentId;
        intent.status = IntentStatus.Executing;
        proposal.selected = true;

        emit AgentSelected(_intentId, proposal.agentId, _proposalId);
    }

    /**
     * @notice Execute intent (can be called by agent or user after approval)
     */
    function executeIntent(
        uint256 _intentId,
        bytes calldata _executionPayload
    ) external nonReentrant {
        Intent storage intent = intents[_intentId];
        if (intent.intentId != _intentId) {
            revert IErrors.IntentNotFound(_intentId);
        }
        if (intent.status != IntentStatus.Executing) {
            revert IErrors.IntentNotExecuting(_intentId);
        }
        if (block.timestamp >= intent.deadline) {
            revert IErrors.IntentDeadlinePassed(_intentId);
        }

        intent.status = IntentStatus.Completed;
        intent.executedAt = block.timestamp;

        emit IntentExecuted(_intentId, _executionPayload);
    }

    /**
     * @notice Send intent to another chain via LayerZero V2
     * @param _intentId The intent ID
     * @param _dstEid Destination endpoint ID
     * @param _payload Execution payload
     * @param _options LayerZero options (for gas limits, etc.)
     */
    function sendIntentToChain(
        uint256 _intentId,
        uint32 _dstEid,
        bytes calldata _payload,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        Intent storage intent = intents[_intentId];
        if (intent.intentId != _intentId) {
            revert IErrors.IntentNotFound(_intentId);
        }
        if (intent.status != IntentStatus.Executing) {
            revert IErrors.IntentNotExecuting(_intentId);
        }

        // Generate cross-chain ID
        uint64 dstChainId = _getChainIdFromEid(_dstEid);
        bytes32 crossChainId = CrossChainMessageLib.generateCrossChainId(
            _intentId,
            currentChainId,
            dstChainId
        );

        // Build cross-chain message with domain separation
        ICrossChainIntent.CrossChainMessage memory message = ICrossChainIntent.CrossChainMessage({
            crossChainId: crossChainId,
            intentId: _intentId,
            srcChainId: currentChainId,
            user: intent.user,
            payload: _payload,
            filecoinCid: intent.filecoinCid
        });

        bytes memory encodedMessage = CrossChainMessageLib.encodeMessage(message);

        // Store cross-chain intent data
        crossChainIntents[crossChainId] = ICrossChainIntent.CrossChainIntentData({
            crossChainId: crossChainId,
            intentId: _intentId,
            srcChainId: currentChainId,
            dstChainId: dstChainId,
            user: intent.user,
            filecoinCid: intent.filecoinCid,
            amount: intent.amount,
            token: intent.token,
            deadline: intent.deadline,
            selectedAgentId: intent.selectedAgentId,
            executionPayload: _payload,
            executed: false
        });

        intentToCrossChainIds[_intentId].push(crossChainId);

        // Quote and send via LayerZero
        MessagingFee memory fee = _quote(_dstEid, encodedMessage, _options, false);
        if (msg.value < fee.nativeFee) {
            revert IErrors.InsufficientFee(fee.nativeFee, msg.value);
        }

        receipt = _lzSend(
            _dstEid,
            encodedMessage,
            _options,
            fee,
            payable(msg.sender)
        );

        emit CrossChainMessageSent(_intentId, _dstEid, receipt.guid, crossChainId);
        return receipt;
    }

    /**
     * @notice Handle received LayerZero V2 message
     * @dev Extends OApp _lzReceive with intent verification and executor validation
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address _executor,
        bytes calldata /*_extraData*/
    ) internal override {
        // Validate executor if executor validation is enabled
        if (!hasRole(EXECUTOR_ROLE, _executor) && !validExecutors[_executor]) {
            revert IErrors.InvalidExecutor(_executor);
        }

        // Decode message with domain separation
        ICrossChainIntent.CrossChainMessage memory message = CrossChainMessageLib.decodeMessage(_message);
        
        // Verify message integrity
        if (!CrossChainMessageLib.verifyMessage(message)) {
            revert("Invalid message");
        }

        // Verify cross-chain intent exists
        bytes32 crossChainId = message.crossChainId;
        ICrossChainIntent.CrossChainIntentData storage crossChainIntent = crossChainIntents[crossChainId];
        
        if (crossChainIntent.crossChainId == bytes32(0)) {
            revert IErrors.CrossChainIntentNotFound(crossChainId);
        }

        // Process cross-chain execution
        // This would integrate with ExecutionProxy for actual settlement
        
        emit CrossChainMessageReceived(
            message.intentId,
            _origin.srcEid,
            message.payload,
            crossChainId
        );
    }

    /**
     * @notice Send intent via Chainlink CCIP
     * @param _intentId The intent ID
     * @param _dstChainSelector Destination chain selector
     * @param _payload Execution payload
     */
    function sendViaCCIP(
        uint256 _intentId,
        uint64 _dstChainSelector,
        bytes calldata _payload
    ) external payable returns (bytes32 messageId) {
        if (!supportedChainSelectors[_dstChainSelector]) {
            revert IErrors.InvalidChainSelector(_dstChainSelector);
        }

        Intent storage intent = intents[_intentId];
        if (intent.intentId != _intentId) {
            revert IErrors.IntentNotFound(_intentId);
        }
        if (intent.status != IntentStatus.Executing) {
            revert IErrors.IntentNotExecuting(_intentId);
        }

        // Generate cross-chain ID
        bytes32 crossChainId = CrossChainMessageLib.generateCrossChainId(
            _intentId,
            currentChainId,
            _dstChainSelector
        );

        // Build CCIP message
        ICrossChainIntent.CrossChainMessage memory message = ICrossChainIntent.CrossChainMessage({
            crossChainId: crossChainId,
            intentId: _intentId,
            srcChainId: currentChainId,
            user: intent.user,
            payload: _payload,
            filecoinCid: intent.filecoinCid
        });

        bytes memory encodedMessage = CrossChainMessageLib.encodeMessage(message);

        // Store cross-chain intent data
        crossChainIntents[crossChainId] = ICrossChainIntent.CrossChainIntentData({
            crossChainId: crossChainId,
            intentId: _intentId,
            srcChainId: currentChainId,
            dstChainId: _dstChainSelector,
            user: intent.user,
            filecoinCid: intent.filecoinCid,
            amount: intent.amount,
            token: intent.token,
            deadline: intent.deadline,
            selectedAgentId: intent.selectedAgentId,
            executionPayload: _payload,
            executed: false
        });

        intentToCrossChainIds[_intentId].push(crossChainId);

        // In production, this would call CCIP Router's ccipSend
        // For now, we emit an event
        messageId = keccak256(abi.encodePacked(_intentId, _dstChainSelector, block.timestamp));
        
        emit IntentSentViaCCIP(_intentId, _dstChainSelector, messageId, crossChainId);
    }

    /**
     * @notice Handle received CCIP message
     * @dev Implements ICCIPReceiver interface
     */
    function ccipReceive(
        ICCIPReceiver.Any2EVMMessage calldata _message
    ) external {
        // Verify sender is CCIP Router
        require(msg.sender == ccipRouter, "Invalid sender");
        
        // Verify chain selector is supported
        if (!supportedChainSelectors[_message.sourceChainSelector]) {
            revert IErrors.InvalidChainSelector(_message.sourceChainSelector);
        }

        // Decode message
        ICrossChainIntent.CrossChainMessage memory message = CrossChainMessageLib.decodeMessage(_message.data);
        
        // Verify message integrity
        if (!CrossChainMessageLib.verifyMessage(message)) {
            revert("Invalid message");
        }

        // Verify sender address matches expected
        address sender = abi.decode(_message.sender, (address));
        // In production, verify sender is the IntentManager on source chain

        bytes32 crossChainId = message.crossChainId;
        
        emit IntentReceivedViaCCIP(
            message.intentId,
            _message.sourceChainSelector,
            crossChainId
        );
    }

    /**
     * @notice Quote LayerZero messaging fee
     */
    function quoteCrossChainFee(
        uint32 _dstEid,
        bytes calldata _message,
        bytes calldata _options,
        bool _payInLzToken
    ) external view returns (MessagingFee memory fee) {
        return _quote(_dstEid, _message, _options, _payInLzToken);
    }

    // Admin functions

    /**
     * @notice Add supported chain selector (CCIP)
     */
    function addChainSelector(uint64 _chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChainSelectors[_chainSelector] = true;
        emit ChainSelectorAdded(_chainSelector);
    }

    /**
     * @notice Remove supported chain selector
     */
    function removeChainSelector(uint64 _chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChainSelectors[_chainSelector] = false;
        emit ChainSelectorRemoved(_chainSelector);
    }

    /**
     * @notice Add executor address
     */
    function addExecutor(address _executor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validExecutors[_executor] = true;
        _grantRole(EXECUTOR_ROLE, _executor);
        emit ExecutorAdded(_executor);
    }

    /**
     * @notice Remove executor address
     */
    function removeExecutor(address _executor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validExecutors[_executor] = false;
        _revokeRole(EXECUTOR_ROLE, _executor);
        emit ExecutorRemoved(_executor);
    }

    /**
     * @notice Add oracle address
     */
    function addOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validOracles[_oracle] = true;
        _grantRole(ORACLE_ROLE, _oracle);
        emit OracleAdded(_oracle);
    }

    /**
     * @notice Remove oracle address
     */
    function removeOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validOracles[_oracle] = false;
        _revokeRole(ORACLE_ROLE, _oracle);
        emit OracleRemoved(_oracle);
    }

    // View functions
    function getIntent(uint256 _intentId) external view returns (Intent memory) {
        return intents[_intentId];
    }

    function getIntentProposals(
        uint256 _intentId
    ) external view returns (AgentProposal[] memory) {
        return intentProposals[_intentId];
    }

    function getUserIntents(
        address _user
    ) external view returns (uint256[] memory) {
        return userIntents[_user];
    }

    function getCrossChainIntent(
        bytes32 _crossChainId
    ) external view returns (ICrossChainIntent.CrossChainIntentData memory) {
        return crossChainIntents[_crossChainId];
    }

    function getIntentCrossChainIds(
        uint256 _intentId
    ) external view returns (bytes32[] memory) {
        return intentToCrossChainIds[_intentId];
    }

    // Internal helper functions
    function _getChainIdFromEid(uint32 _eid) internal pure returns (uint64) {
        // Mapping from LayerZero endpoint ID to chain ID
        // This would be populated based on LayerZero's endpoint registry
        // For now, return a placeholder
        return uint64(_eid);
    }
}
