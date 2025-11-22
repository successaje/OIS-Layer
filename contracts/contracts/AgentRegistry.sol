// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IErrors.sol";

/**
 * @title AgentRegistry
 * @notice Registry for AI agents with ENS verification, reputation staking, and cross-chain identity
 * @dev Supports cross-chain agent registration synchronization
 */
contract AgentRegistry is Ownable, ReentrancyGuard, AccessControl {
    bytes32 public constant SYNC_ROLE = keccak256("SYNC_ROLE"); // Role for cross-chain sync
    
    struct Agent {
        uint256 agentId;
        address agentAddress;
        string ensName;
        string specialization;
        uint256 stake; // Reputation stake amount
        uint256 reputation; // Reputation score
        uint256 slashCount;
        bool active;
        uint256 registeredAt;
        uint256 lastActivity;
        uint64[] registeredChains; // Chain IDs where agent is registered
        bytes32 crossChainIdentity; // Unique cross-chain identity hash
    }

    struct ReputationMetric {
        uint256 completedIntents;
        uint256 totalEarnings;
        uint256 slashedAmount;
        uint256 avgRating;
    }

    struct CrossChainAgentData {
        uint256 agentId;
        address agentAddress;
        string ensName;
        string specialization;
        uint256 reputation;
        uint64 srcChainId;
        bytes32 crossChainIdentity;
    }

    IERC20 public reputationToken; // ERC20 token for staking
    uint256 public minStake;
    uint256 public slashPercentage; // % of stake to slash on misbehavior

    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public addressToAgentId;
    mapping(uint256 => ReputationMetric) public agentMetrics;
    mapping(address => bool) public ensVerified;
    
    // Cross-chain identity tracking
    mapping(bytes32 => uint256) public crossChainIdentityToAgentId; // crossChainIdentity => agentId
    mapping(uint256 => mapping(uint64 => bool)) public agentRegisteredOnChain; // agentId => chainId => registered
    mapping(uint64 => address) public chainRegistryAddress; // chainId => registry address on that chain

    uint256 public nextAgentId;
    uint64 public immutable currentChainId;

    // Events
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed agentAddress,
        string ensName,
        uint256 stake,
        bytes32 crossChainIdentity
    );
    event StakeIncreased(
        uint256 indexed agentId,
        uint256 amount,
        uint256 newTotal
    );
    event AgentSlashed(
        uint256 indexed agentId,
        uint256 amount,
        string reason
    );
    event AgentDeactivated(uint256 indexed agentId);
    event ReputationUpdated(uint256 indexed agentId, uint256 newReputation);
    event CrossChainRegistrationSynced(
        uint256 indexed agentId,
        uint64 srcChainId,
        bytes32 crossChainIdentity
    );
    event AgentVerifiedOnChain(
        uint256 indexed agentId,
        uint64 chainId,
        bool verified
    );
    event ChainRegistryAddressSet(uint64 chainId, address registryAddress);

    constructor(
        address _reputationToken,
        uint256 _minStake,
        address _owner,
        uint64 _chainId
    ) Ownable(_owner) {
        reputationToken = IERC20(_reputationToken);
        minStake = _minStake;
        slashPercentage = 10; // 10% default slash
        currentChainId = _chainId;
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(SYNC_ROLE, _owner);
    }

    /**
     * @notice Register a new agent
     * @param _ensName ENS name for the agent
     * @param _specialization Agent specialization
     * @param _stakeAmount Initial stake amount
     */
    function registerAgent(
        string calldata _ensName,
        string calldata _specialization,
        uint256 _stakeAmount
    ) external nonReentrant returns (uint256) {
        if (addressToAgentId[msg.sender] != 0) {
            revert IErrors.AgentAlreadyRegistered(msg.sender);
        }
        if (_stakeAmount < minStake) {
            revert IErrors.StakeBelowMinimum(_stakeAmount, minStake);
        }
        if (bytes(_ensName).length == 0) {
            revert IErrors.EmptyENSName();
        }

        // Transfer stake tokens
        if (!reputationToken.transferFrom(msg.sender, address(this), _stakeAmount)) {
            revert("Transfer failed");
        }

        uint256 agentId = nextAgentId++;
        
        // Generate cross-chain identity
        bytes32 crossChainIdentity = keccak256(
            abi.encodePacked(msg.sender, _ensName, currentChainId)
        );

        agents[agentId] = Agent({
            agentId: agentId,
            agentAddress: msg.sender,
            ensName: _ensName,
            specialization: _specialization,
            stake: _stakeAmount,
            reputation: 1000, // Initial reputation
            slashCount: 0,
            active: true,
            registeredAt: block.timestamp,
            lastActivity: block.timestamp,
            registeredChains: new uint64[](0),
            crossChainIdentity: crossChainIdentity
        });

        // Add current chain to registered chains
        agents[agentId].registeredChains.push(currentChainId);
        agentRegisteredOnChain[agentId][currentChainId] = true;
        addressToAgentId[msg.sender] = agentId;
        crossChainIdentityToAgentId[crossChainIdentity] = agentId;

        emit AgentRegistered(agentId, msg.sender, _ensName, _stakeAmount, crossChainIdentity);
        return agentId;
    }

    /**
     * @notice Sync cross-chain agent registration
     * @dev Called when an agent registered on another chain needs to be synced here
     * @param _agentData Cross-chain agent data from source chain
     */
    function syncCrossChainRegistration(
        CrossChainAgentData calldata _agentData
    ) external onlyRole(SYNC_ROLE) nonReentrant returns (uint256) {
        // Verify cross-chain identity
        bytes32 expectedIdentity = keccak256(
            abi.encodePacked(_agentData.agentAddress, _agentData.ensName, _agentData.srcChainId)
        );
        
        if (expectedIdentity != _agentData.crossChainIdentity) {
            revert("Invalid cross-chain identity");
        }

        // Check if agent already exists locally
        if (addressToAgentId[_agentData.agentAddress] != 0) {
            uint256 existingAgentId = addressToAgentId[_agentData.agentAddress];
            // Add chain to registered chains if not already added
            if (!agentRegisteredOnChain[existingAgentId][_agentData.srcChainId]) {
                agents[existingAgentId].registeredChains.push(_agentData.srcChainId);
                agentRegisteredOnChain[existingAgentId][_agentData.srcChainId] = true;
                emit CrossChainRegistrationSynced(
                    existingAgentId,
                    _agentData.srcChainId,
                    _agentData.crossChainIdentity
                );
            }
            return existingAgentId;
        }

        // Create new agent entry for cross-chain registration
        uint256 agentId = nextAgentId++;
        
        agents[agentId] = Agent({
            agentId: agentId,
            agentAddress: _agentData.agentAddress,
            ensName: _agentData.ensName,
            specialization: _agentData.specialization,
            stake: 0, // No stake on this chain (stake is on source chain)
            reputation: _agentData.reputation, // Sync reputation
            slashCount: 0,
            active: true,
            registeredAt: block.timestamp,
            lastActivity: block.timestamp,
            registeredChains: new uint64[](0),
            crossChainIdentity: _agentData.crossChainIdentity
        });

        agents[agentId].registeredChains.push(_agentData.srcChainId);
        agents[agentId].registeredChains.push(currentChainId);
        agentRegisteredOnChain[agentId][_agentData.srcChainId] = true;
        agentRegisteredOnChain[agentId][currentChainId] = true;
        addressToAgentId[_agentData.agentAddress] = agentId;
        crossChainIdentityToAgentId[_agentData.crossChainIdentity] = agentId;

        emit CrossChainRegistrationSynced(
            agentId,
            _agentData.srcChainId,
            _agentData.crossChainIdentity
        );

        return agentId;
    }

    /**
     * @notice Verify an agent was registered on another chain
     * @param _agentId Local agent ID
     * @param _chainId Chain ID to verify
     * @return verified Whether agent is verified on that chain
     */
    function verifyAgentOnChain(
        uint256 _agentId,
        uint64 _chainId
    ) external view returns (bool verified) {
        if (_agentId == 0 || agents[_agentId].agentId != _agentId) {
            revert IErrors.InvalidAgent(_agentId);
        }
        if (_chainId == 0) {
            revert IErrors.InvalidChainId(_chainId);
        }
        return agentRegisteredOnChain[_agentId][_chainId];
    }

    /**
     * @notice Set registry address on another chain (for cross-chain verification)
     */
    function setChainRegistryAddress(
        uint64 _chainId,
        address _registryAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_chainId == 0) {
            revert IErrors.InvalidChainId(_chainId);
        }
        chainRegistryAddress[_chainId] = _registryAddress;
        emit ChainRegistryAddressSet(_chainId, _registryAddress);
    }

    /**
     * @notice Increase stake
     */
    function increaseStake(
        uint256 _agentId,
        uint256 _amount
    ) external nonReentrant {
        Agent storage agent = agents[_agentId];
        if (agent.agentAddress != msg.sender) {
            revert IErrors.NotAgentOwner(msg.sender, agent.agentAddress);
        }
        if (!agent.active) {
            revert IErrors.AgentInactive(_agentId);
        }

        if (!reputationToken.transferFrom(msg.sender, address(this), _amount)) {
            revert("Transfer failed");
        }

        agent.stake += _amount;
        emit StakeIncreased(_agentId, _amount, agent.stake);
    }

    /**
     * @notice Withdraw stake (with cooldown period)
     */
    function withdrawStake(
        uint256 _agentId,
        uint256 _amount
    ) external nonReentrant {
        Agent storage agent = agents[_agentId];
        if (agent.agentAddress != msg.sender) {
            revert IErrors.NotAgentOwner(msg.sender, agent.agentAddress);
        }
        if (!agent.active) {
            revert IErrors.AgentInactive(_agentId);
        }
        if (_amount > agent.stake - minStake) {
            revert IErrors.WouldGoBelowMinStake(agent.stake, _amount);
        }

        agent.stake -= _amount;
        if (!reputationToken.transfer(msg.sender, _amount)) {
            revert("Transfer failed");
        }
    }

    /**
     * @notice Slash agent for misbehavior
     * @dev Can be called by IntentManager or dispute resolution contract
     */
    function slashAgent(
        uint256 _agentId,
        string calldata _reason
    ) external onlyOwner {
        Agent storage agent = agents[_agentId];
        if (!agent.active) {
            revert IErrors.AgentInactive(_agentId);
        }

        uint256 slashAmount = (agent.stake * slashPercentage) / 100;
        agent.stake -= slashAmount;
        agent.slashCount++;
        agent.reputation = agent.reputation > 100
            ? agent.reputation - 100
            : 0;

        // Transfer slashed funds to treasury (or burn)
        reputationToken.transfer(owner(), slashAmount);

        // Deactivate if reputation too low or stake below minimum
        if (agent.reputation < 200 || agent.stake < minStake) {
            agent.active = false;
            emit AgentDeactivated(_agentId);
        }

        emit AgentSlashed(_agentId, slashAmount, _reason);
        emit ReputationUpdated(_agentId, agent.reputation);
    }

    /**
     * @notice Update agent reputation (positive)
     */
    function updateReputation(
        uint256 _agentId,
        uint256 _reputationDelta
    ) external onlyOwner {
        Agent storage agent = agents[_agentId];
        agent.reputation += _reputationDelta;
        agent.lastActivity = block.timestamp;

        if (agent.reputation > 10000) {
            agent.reputation = 10000; // Cap at 10000
        }

        agentMetrics[_agentId].completedIntents++;
        emit ReputationUpdated(_agentId, agent.reputation);
    }

    /**
     * @notice Verify ENS name (external oracle or manual verification)
     */
    function verifyENS(
        address _agentAddress,
        bool _verified
    ) external onlyOwner {
        ensVerified[_agentAddress] = _verified;
    }

    // View functions
    function getAgent(
        uint256 _agentId
    ) external view returns (Agent memory) {
        return agents[_agentId];
    }

    function getAgentMetrics(
        uint256 _agentId
    ) external view returns (ReputationMetric memory) {
        return agentMetrics[_agentId];
    }

    function isAgentActive(uint256 _agentId) external view returns (bool) {
        return agents[_agentId].active;
    }

    function getAgentRegisteredChains(
        uint256 _agentId
    ) external view returns (uint64[] memory) {
        return agents[_agentId].registeredChains;
    }

    function getAgentByCrossChainIdentity(
        bytes32 _crossChainIdentity
    ) external view returns (Agent memory) {
        uint256 agentId = crossChainIdentityToAgentId[_crossChainIdentity];
        if (agentId == 0) {
            revert IErrors.InvalidAgent(0);
        }
        return agents[agentId];
    }
}
