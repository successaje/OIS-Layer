'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Trophy, Zap, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { AgentRaceCard } from '@/components/AgentRaceCard';
import { LoadingAgentsAnimation } from '@/components/LoadingAgentsAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { GlowingButton } from '@/components/GlowingButton';
import { ExecutionProgressModal } from '@/components/ExecutionProgressModal';
import { getExplorerUrl } from '@/lib/utils';

export default function AgentBattleRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<any[]>([]);
  const [intentTxHash, setIntentTxHash] = useState<string | null>(null);

  useEffect(() => {
    // Get transaction hash from URL params (passed from intent creation)
    const txHashFromUrl = searchParams.get('txHash');
    if (txHashFromUrl) {
      setIntentTxHash(txHashFromUrl);
    }

    // Simulate agents competing
    setTimeout(() => {
      const mockAgents = [
        { id: '1', ensName: 'yield-master.solver.eth', apy: 7.2, proposal: 'Aave + Compound strategy', progress: 100, rank: 1 },
        { id: '2', ensName: 'defi-expert.solver.eth', apy: 6.8, proposal: 'Yearn vault optimization', progress: 85, rank: 2 },
        { id: '3', ensName: 'cross-chain-pro.solver.eth', apy: 7.5, proposal: 'Multi-chain yield farming', progress: 75, rank: 3 },
        { id: '4', ensName: 'stable-yield.solver.eth', apy: 6.5, proposal: 'Stablecoin focus', progress: 60, rank: 4 },
        { id: '5', ensName: 'risk-optimizer.solver.eth', apy: 6.2, proposal: 'Low-risk strategy', progress: 45, rank: 5 },
      ];
      setAgents(mockAgents);
      setLoading(false);
      setWinner('1');
    }, 2000);
  }, [searchParams]);

  const startExecution = () => {
    const steps = [
      {
        id: 'escrow',
        label: '⏳ Escrow Funding Locked',
        description: 'PaymentEscrow.sol - Funds secured in escrow contract',
        status: 'pending' as const,
        chain: 'Sepolia',
      },
      {
        id: 'crosschain',
        label: '🔄 Cross-chain Message Sent',
        description: 'LayerZero v2 / CCIP - Message routed to destination chain',
        status: 'pending' as const,
        chain: 'Base Sepolia',
      },
      {
        id: 'execution',
        label: '⚙️ Execution on Destination',
        description: 'Agent executing intent on destination chain',
        status: 'pending' as const,
        chain: 'Base Sepolia',
      },
      {
        id: 'oracle',
        label: '📡 Oracle Verification',
        description: 'CCIP / Chainlink OCR - Verifying execution completion',
        status: 'pending' as const,
      },
      {
        id: 'agent-verify',
        label: '📥 Off-chain Agent Verification',
        description: 'Agent verifying completion status',
        status: 'pending' as const,
      },
      {
        id: 'return',
        label: '🔁 Return Message Received',
        description: 'Message received back on source chain',
        status: 'pending' as const,
        chain: 'Sepolia',
      },
      {
        id: 'release',
        label: '🔓 Escrow Released',
        description: 'Funds released to agent upon successful execution',
        status: 'pending' as const,
        chain: 'Sepolia',
      },
      {
        id: 'filecoin',
        label: '📦 Filecoin Finality Logging',
        description: 'Complete execution result logged to Filecoin for permanent verification',
        status: 'pending' as const,
      },
    ];

    setExecutionSteps(steps);

    // Simulate step progression
    steps.forEach((step, index) => {
      setTimeout(() => {
        setExecutionSteps(prev => 
          prev.map(s => 
            s.id === step.id 
              ? { ...s, status: 'in-progress' as const }
              : s
          )
        );
        
        setTimeout(() => {
          setExecutionSteps(prev => 
            prev.map(s => 
              s.id === step.id 
                ? { ...s, status: 'completed' as const, txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('') }
                : s
            )
          );
          
          // If last step, redirect to result page
          if (index === steps.length - 1) {
            setTimeout(() => {
              router.push(`/intent/${params.id}/result`);
            }, 2000);
          }
        }, 2000);
      }, index * 3000);
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Agent Battle Room
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI agents are competing to fulfill your intent
          </p>
        </motion.div>

        {loading ? (
          <LoadingAgentsAnimation />
        ) : (
          <>
            {/* Winner Announcement */}
            {winner && !showConfirm && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="mb-8"
              >
                <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      Winner Selected!
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {agents.find(a => a.id === winner)?.ensName} has the best proposal
                    </p>
                    {intentTxHash && (
                      <a
                        href={getExplorerUrl(11155111, intentTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
                      >
                        View Intent on Explorer
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <GlowingButton onClick={() => setShowConfirm(true)}>
                      Confirm Execution
                    </GlowingButton>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Confirm Execution */}
            {showConfirm && !showExecution && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Card className="border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Confirm Execution
                    </h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Winner Agent:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {agents.find(a => a.id === winner)?.ensName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Expected APY:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {agents.find(a => a.id === winner)?.apy}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Strategy:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {agents.find(a => a.id === winner)?.proposal}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <GlowingButton
                        onClick={() => {
                          setShowExecution(true);
                          startExecution();
                        }}
                        className="flex-1"
                      >
                        Start Execution
                      </GlowingButton>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Agent Race Cards */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <AnimatePresence>
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AgentRaceCard
                      agentId={agent.id}
                      ensName={agent.ensName}
                      apy={agent.apy}
                      proposal={agent.proposal}
                      progress={agent.progress}
                      isWinner={agent.id === winner}
                      rank={agent.rank}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Real-time Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 max-w-4xl mx-auto"
            >
              <Card className="border-2 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Real-time Updates from Llama 3.2
                  </h3>
                  <div className="space-y-2 font-mono text-sm">
                    {[
                      'Agent yield-master.solver.eth: Analyzing market conditions...',
                      'Agent defi-expert.solver.eth: Calculating optimal APY...',
                      'Agent cross-chain-pro.solver.eth: Evaluating cross-chain routes...',
                      'Winner: yield-master.solver.eth with 7.2% APY',
                    ].map((log, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {log}
                      </motion.p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Execution Progress Modal */}
      <ExecutionProgressModal
        isOpen={showExecution}
        steps={executionSteps}
        onClose={() => setShowExecution(false)}
      />
    </div>
  );
}

