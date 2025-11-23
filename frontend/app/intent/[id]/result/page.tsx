'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, Download, ArrowLeft, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingButton } from '@/components/GlowingButton';
import { getExplorerUrl } from '@/lib/utils';
import { useState } from 'react';

export default function ExecutionResultPage() {
  const params = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  // Mock data - in production, fetch from contract/backend
  const result = {
    success: true,
    intentId: params.id,
    sourceTxHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    destTxHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    layerZeroProof: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    ccipMessageId: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    agentOutput: {
      strategy: 'Aave + Compound strategy',
      apy: 7.2,
      executionData: {
        chains: ['Sepolia', 'Base Sepolia'],
        totalGas: '0.05 ETH',
        slippage: '0.3%',
        executionTime: '2m 34s',
      },
    },
    escrowSettlement: {
      amount: '1.0 ETH',
      released: true,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    },
    winnerAgent: 'yield-master.solver.eth',
    executionTime: new Date().toISOString(),
    fees: '0.05 ETH',
    chainsUsed: ['Sepolia', 'Base Sepolia'],
    filecoinFinality: {
      cid: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      loggedAt: new Date().toISOString(),
      status: 'verified',
    },
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadResult = () => {
    // Include Filecoin finality in the download
    const fullResult = {
      ...result,
      filecoinFinality: {
        ...result.filecoinFinality,
        fullCid: result.filecoinFinality.cid,
        note: 'Complete execution result stored on Filecoin for permanent verification',
      },
    };
    const dataStr = JSON.stringify(fullResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `intent-${params.id}-result.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="container mx-auto px-4 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            🎉 Intent Successfully Executed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your intent has been completed across multiple chains
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Transaction Hashes */}
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Transaction Hashes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Source Chain (Sepolia)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded truncate">
                    {result.sourceTxHash}
                  </code>
                  <button
                    onClick={() => copyToClipboard(result.sourceTxHash, 'source')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <Copy className={`h-4 w-4 ${copied === 'source' ? 'text-green-500' : 'text-gray-400'}`} />
                  </button>
                  <a
                    href={getExplorerUrl(11155111, result.sourceTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Destination Chain (Base Sepolia)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded truncate">
                    {result.destTxHash}
                  </code>
                  <button
                    onClick={() => copyToClipboard(result.destTxHash, 'dest')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <Copy className={`h-4 w-4 ${copied === 'dest' ? 'text-green-500' : 'text-gray-400'}`} />
                  </button>
                  <a
                    href={getExplorerUrl(84532, result.destTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Details */}
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Execution Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Winner Agent:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{result.winnerAgent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Execution Time:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{result.agentOutput.executionData.executionTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Gas:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{result.agentOutput.executionData.totalGas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Slippage:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{result.agentOutput.executionData.slippage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Chains Used:</span>
                <div className="flex gap-2">
                  {result.chainsUsed.map((chain) => (
                    <span key={chain} className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      {chain}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LayerZero & CCIP Proofs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle>🔗 LayerZero Message Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded truncate">
                  {result.layerZeroProof}
                </code>
                <button
                  onClick={() => copyToClipboard(result.layerZeroProof, 'layerzero')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <Copy className={`h-4 w-4 ${copied === 'layerzero' ? 'text-green-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle>⛓️ CCIP Message Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded truncate">
                  {result.ccipMessageId}
                </code>
                <button
                  onClick={() => copyToClipboard(result.ccipMessageId, 'ccip')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <Copy className={`h-4 w-4 ${copied === 'ccip' ? 'text-green-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Output & Escrow */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>🧠 Agent Output</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Strategy:</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{result.agentOutput.strategy}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">APY Achieved:</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.agentOutput.apy}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle>🔐 Escrow Settlement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{result.escrowSettlement.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {result.escrowSettlement.released ? 'Released ✓' : 'Locked'}
                  </span>
                </div>
                {result.escrowSettlement.txHash && (
                  <div className="flex items-center gap-2 pt-2">
                    <code className="flex-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded truncate">
                      {result.escrowSettlement.txHash}
                    </code>
                    <a
                      href={getExplorerUrl(11155111, result.escrowSettlement.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filecoin Finality Logging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                Filecoin Finality Logging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Execution Finality Record
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Complete execution result logged to Filecoin for permanent verification
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        {result.filecoinFinality.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Filecoin CID:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {result.filecoinFinality.cid.substring(0, 16)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.filecoinFinality.cid, 'filecoin')}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Copy className={`h-3 w-3 ${copied === 'filecoin' ? 'text-green-500' : 'text-gray-400'}`} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Logged At:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date(result.filecoinFinality.loggedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                      What's Stored:
                    </p>
                    <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1 list-disc list-inside">
                      <li>Complete execution result data</li>
                      <li>All transaction hashes (source + destination)</li>
                      <li>LayerZero & CCIP message proofs</li>
                      <li>Agent output and strategy details</li>
                      <li>Escrow settlement information</li>
                      <li>Execution timestamps and metrics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <GlowingButton onClick={downloadResult} className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Result (JSON)
          </GlowingButton>
          <button
            onClick={() => router.push('/intent/new')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            Execute Another Intent
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}

