"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface PinJsonResponse {
  cid: string;
  success: boolean;
}

export interface PinFileResponse {
  cid: string;
  success: boolean;
  filename: string;
}

export interface GetByCidResponse {
  cid: string;
  data: any;
  success: boolean;
}

export interface VerifyCidResponse {
  cid: string;
  exists: boolean;
  success: boolean;
}

/**
 * Hook for interacting with Filecoin storage via backend API
 */
export function useFilecoin() {
  const [isPinning, setIsPinning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Pin JSON data to Filecoin
   */
  const pinJson = async (data: any): Promise<string> => {
    setIsPinning(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/filecoin/pin/json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to pin JSON to Filecoin");
      }

      const result: PinJsonResponse = await response.json();
      return result.cid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsPinning(false);
    }
  };

  /**
   * Pin a file to Filecoin
   */
  const pinFile = async (file: File): Promise<string> => {
    setIsPinning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/filecoin/pin/file`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to pin file to Filecoin");
      }

      const result: PinFileResponse = await response.json();
      return result.cid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsPinning(false);
    }
  };

  /**
   * Retrieve data from Filecoin by CID
   */
  const getByCid = async (cid: string): Promise<any> => {
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/filecoin/cat/${cid}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to retrieve data from Filecoin");
      }

      const result: GetByCidResponse = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Verify CID exists on Filecoin
   */
  const verifyCid = async (cid: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/filecoin/verify/${cid}`);

      if (!response.ok) {
        return false;
      }

      const result: VerifyCidResponse = await response.json();
      return result.exists;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Convert CID to bytes32 format for smart contracts
   */
  const cidToBytes32 = (cid: string): `0x${string}` => {
    // Remove any 0x prefix
    const cleanCid = cid.replace(/^0x/, "");
    
    // If CID is already 64 hex chars, pad or truncate to 64
    if (cleanCid.length === 64) {
      return `0x${cleanCid}` as `0x${string}`;
    }
    
    // If shorter, pad with zeros
    if (cleanCid.length < 64) {
      return `0x${cleanCid.padStart(64, "0")}` as `0x${string}`;
    }
    
    // If longer, truncate (shouldn't happen for standard CIDs)
    return `0x${cleanCid.substring(0, 64)}` as `0x${string}`;
  };

  /**
   * Get IPFS gateway URL for viewing CID
   */
  const getGatewayUrl = (cid: string, gateway: string = "https://ipfs.io/ipfs/"): string => {
    const cleanCid = cid.replace(/^0x/, "").replace(/^0+/, "") || "0";
    return `${gateway}${cleanCid}`;
  };

  return {
    // Actions
    pinJson,
    pinFile,
    getByCid,
    verifyCid,
    
    // Utilities
    cidToBytes32,
    getGatewayUrl,
    
    // State
    isPinning,
    isVerifying,
    error,
  };
}

