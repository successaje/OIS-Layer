"use client";

import { useAccount, useChainId, useWriteContract, useContractRead, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { getContractAddress } from "@/src/config/contracts";
import { parseIntentWithLlama } from "@/src/lib/ollama";

/**
 * IntentManager ABI (minimal for createIntent)
 */
const INTENT_MANAGER_ABI = [
  {
    name: "createIntent",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_intentSpec", type: "string" },
      { name: "_filecoinCid", type: "bytes32" },
      { name: "_deadline", type: "uint256" },
      { name: "_token", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "intents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_intentId", type: "uint256" }],
    outputs: [
      { name: "intentId", type: "uint256" },
      { name: "user", type: "address" },
      { name: "intentSpec", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "token", type: "address" },
      { name: "status", type: "uint8" },
      { name: "deadline", type: "uint256" },
      { name: "selectedAgentId", type: "uint256" },
      { name: "filecoinCid", type: "bytes32" },
      { name: "createdAt", type: "uint256" },
      { name: "executedAt", type: "uint256" },
    ],
  },
  {
    name: "nextIntentId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getUserIntents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "IntentCreated",
    type: "event",
    inputs: [
      { name: "intentId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "intentSpec", type: "string", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "filecoinCid", type: "bytes32", indexed: false },
    ],
  },                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
] as const;

export interface CreateIntentParams {
  intentSpec: string;
  amount?: string; // Amount in ETH (will be converted to wei)
  token?: string; // Token address (0x0 for native ETH)
  deadline?: number; // Unix timestamp
  filecoinCid?: string; // IPFS/Filecoin CID (optional)
}

export interface Intent {
  intentId: bigint;
  user: string;
  intentSpec: string;
  amount: bigint;
  token: string;
  status: number;
  deadline: bigint;
  selectedAgentId: bigint;
  filecoinCid: string;
  createdAt: bigint;
  executedAt: bigint;
}

/**
 * Hook for interacting with IntentManager contract
 */
export function useIntent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const intentManagerAddress = getContractAddress(chainId, "intentManager");
  
  // Validate address - must be a valid non-zero address
  const isValidAddress = intentManagerAddress && 
    intentManagerAddress !== "0x0000000000000000000000000000000000000000" &&
    intentManagerAddress.startsWith("0x") &&
    intentManagerAddress.length === 42;
  
  const contractAddress = isValidAddress ? (intentManagerAddress as `0x${string}`) : undefined;

  // Get next intent ID (to track new intents)
  const { data: nextIntentId } = useContractRead({
    address: contractAddress,
    abi: INTENT_MANAGER_ABI,
    functionName: "nextIntentId",
    query: {
      enabled: isConnected && !!contractAddress,
    },
  });

  // Get user's intents
  const { data: userIntentIds, refetch: refetchUserIntents } = useContractRead({
    address: contractAddress,
    abi: INTENT_MANAGER_ABI,
    functionName: "getUserIntents",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!contractAddress,
    },
  });

  // Create intent function
  const {
    writeContractAsync: createIntentWriteAsync,
    data: createIntentData,
    isPending: isCreating,
    error: createError,
  } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        // Transaction submitted successfully
        console.log("[useIntent] Transaction hash from writeContract:", hash);
      },
      onError: (error) => {
        console.error("Intent creation error:", error);
      },
    },
  });

  // Wait for transaction
  const {
    isLoading: isWaiting,
    isSuccess: isCreateSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: createIntentData,
  });

  /**
   * Create a new intent
   */
  const createIntent = async (params: CreateIntentParams) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }

    if (!contractAddress) {
      const networkName = chainId === 11155111 ? "Sepolia" : chainId === 84532 ? "Base Sepolia" : `Chain ${chainId}`;
      throw new Error(`IntentManager contract not deployed on ${networkName} (Chain ID: ${chainId}). Please switch to Sepolia (11155111) or Base Sepolia (84532).`);
    }

    // Parse intent with Llama 3.2
    let parsedIntent;
    try {
      parsedIntent = await parseIntentWithLlama(params.intentSpec);
    } catch (error) {
      console.warn("Failed to parse intent with Llama, using raw text:", error);
      parsedIntent = {
        objective: params.intentSpec,
        constraints: [],
        riskProfile: "Medium" as const,
        chainsAllowed: [],
        assetsAllowed: [],
      };
    }

    // Prepare parameters
    const filecoinCid = params.filecoinCid 
      ? `0x${params.filecoinCid.replace(/^0x/, "")}` as `0x${string}`
      : `0x${"0".repeat(64)}` as `0x${string}`; // Zero bytes32 if not provided

    // Deadline must be at least 1 hour from now (MIN_DEADLINE = 1 hours)
    // and max 30 days (MAX_DEADLINE = 30 days)
    const minDeadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const maxDeadline = Math.floor(Date.now() / 1000) + (30 * 24 * 3600); // 30 days from now
    const requestedDeadline = params.deadline || Math.floor(Date.now() / 1000) + 86400; // Default: 24 hours
    
    // Clamp deadline to valid range
    const deadline = Math.max(minDeadline, Math.min(requestedDeadline, maxDeadline));
    
    const token = (params.token || "0x0000000000000000000000000000000000000000") as `0x${string}`;
    
    // Calculate value (amount in wei)
    // Extract numeric value from amount string (e.g., "$1000 USDC" -> "1000")
    let amountValue = "0.01"; // Default minimum
    if (params.amount) {
      // Remove currency symbols, commas, and extract number
      const numericMatch = params.amount.replace(/[$,]/g, '').match(/(\d+\.?\d*)/);
      if (numericMatch) {
        amountValue = numericMatch[1];
      }
    }
    const value = parseEther(amountValue);
    
    // For native ETH, the amount parameter should be 0 (value is sent via msg.value)
    // For ERC20 tokens, the amount parameter should be the token amount
    const amountParam = token === "0x0000000000000000000000000000000000000000" ? BigInt(0) : value;

    // Validate contract address
    if (!intentManagerAddress || intentManagerAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(`IntentManager contract not deployed on chain ${chainId}. Please switch to Sepolia (11155111) or Base Sepolia (84532).`);
    }

        // Call contract - use writeContractAsync for better error handling
        if (!createIntentWriteAsync) {
          throw new Error("Contract write function not available. Please check your wallet connection and ensure you're on Sepolia or Base Sepolia network.");
        }

        // Note: createIntent signature: (string, bytes32, uint256, address, uint256)
        // For native ETH: amountParam = 0, value = ETH amount in wei
        // For ERC20: amountParam = token amount, value = 0
        const txHash = await createIntentWriteAsync({
          address: contractAddress!,
          abi: INTENT_MANAGER_ABI,
          functionName: "createIntent",
          args: [params.intentSpec, filecoinCid, BigInt(deadline), token, amountParam],
          value: value, // For native ETH deposits (msg.value)
        });
        
        console.log("[useIntent] Transaction hash returned from writeContractAsync:", txHash);
        return txHash;
  };

  /**
   * Get intent details
   */
  const getIntent = async (intentId: bigint): Promise<Intent | null> => {
    // This would need to be implemented with a contract read
    // For now, return null
    return null;
  };

  return {
    // State
    isConnected,
    address,
    intentManagerAddress,
    nextIntentId,
    userIntentIds,
    
    // Actions
    createIntent,
    getIntent,
    refetchUserIntents,
    
    // Transaction state
    isCreating,
    isWaiting,
    isCreateSuccess,
    createError,
    receipt,
    transactionHash: createIntentData,
  };
}

