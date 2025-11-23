'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { File, ExternalLink, CheckCircle2, XCircle, Loader2, Copy } from 'lucide-react';
import { useFilecoin } from '@/src/hooks/useFilecoin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

interface FilecoinCidDisplayProps {
  cid: string;
  label?: string;
  showVerify?: boolean;
  compact?: boolean;
}

export function FilecoinCidDisplay({
  cid,
  label = "Filecoin CID",
  showVerify = true,
  compact = false,
}: FilecoinCidDisplayProps) {
  const { verifyCid, getGatewayUrl, isVerifying } = useFilecoin();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  // Clean CID (remove 0x prefix and leading zeros if it's a bytes32)
  const cleanCid = cid.replace(/^0x/, "").replace(/^0+/, "") || "0";

  useEffect(() => {
    if (showVerify && cleanCid && cleanCid !== "0") {
      verifyCid(cleanCid).then(setIsVerified);
    }
  }, [cid, showVerify, cleanCid, verifyCid]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <File className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="font-mono text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
          {cleanCid}
        </span>
        {showVerify && (
          <>
            {isVerifying ? (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            ) : isVerified ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : isVerified === false ? (
              <XCircle className="h-3 w-3 text-red-500" />
            ) : null}
          </>
        )}
        <Button
          onClick={() => window.open(getGatewayUrl(cleanCid), '_blank')}
          variant="ghost"
          size="sm"
          className="h-6 px-2"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-2 border-indigo-200 dark:border-indigo-800">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </span>
            </div>
            {showVerify && (
              <div className="flex items-center gap-2">
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Verifying...</span>
                  </>
                ) : isVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
                  </>
                ) : isVerified === false ? (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-600 dark:text-red-400">Not found</span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
              {cleanCid}
            </code>
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.open(getGatewayUrl(cleanCid), '_blank')}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on IPFS Gateway
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

