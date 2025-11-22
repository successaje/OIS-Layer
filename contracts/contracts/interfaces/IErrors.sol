// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IErrors
 * @notice Custom errors for Omnichain Intent Settlement Layer
 */
interface IErrors {
    // IntentManager Errors
    error IntentNotFound(uint256 intentId);
    error IntentNotInBidding(uint256 intentId);
    error IntentNotExecuting(uint256 intentId);
    error IntentDeadlinePassed(uint256 intentId);
    error InvalidDeadline(uint256 deadline);
    error EmptyIntentSpec();
    error InsufficientDeposit();
    error NotIntentOwner(address user);
    error ProposalAlreadySelected(uint256 proposalId);
    error InvalidProposal(uint256 proposalId);
    error InvalidAgent(uint256 agentId);
    error CrossChainIntentNotFound(bytes32 crossChainId);
    error InvalidChainSelector(uint64 chainSelector);
    error InvalidExecutor(address executor);
    error InsufficientFee(uint256 required, uint256 provided);
    error SlippageExceeded(uint256 expected, uint256 actual);
    error StalePrice(address token, uint256 timestamp);
    
    // AgentRegistry Errors
    error AgentAlreadyRegistered(address agent);
    error StakeBelowMinimum(uint256 provided, uint256 required);
    error EmptyENSName();
    error NotAgentOwner(address caller, address agent);
    error AgentInactive(uint256 agentId);
    error WouldGoBelowMinStake(uint256 current, uint256 withdrawal);
    error InvalidChainId(uint64 chainId);
    error CrossChainRegistrationFailed(uint64 chainId);
    
    // ExecutionProxy Errors
    error InvalidAmount();
    error InvalidToken(address token);
    error SwapNotExecuted(uint256 swapId);
    error PriceFeedNotFound(address token);
    error InvalidPrice(int256 price);
    
    // PaymentEscrow Errors
    error EscrowNotFound(uint256 escrowId);
    error NotBeneficiary(address caller, address beneficiary);
    error AlreadyReleased(uint256 escrowId);
    error InvalidBeneficiary();
    error CrossChainReleaseFailed(bytes32 intentId, uint64 srcChain);
    
    // ChainlinkOracleAdapter Errors
    error NoPriceFeed(address token);
    error RoundNotComplete();
    error PriceDataStale(uint256 timestamp, uint256 threshold);
    error StaleRound(uint80 roundId, uint80 answeredInRound);
    error InvalidPriceValue(int256 price);
}

