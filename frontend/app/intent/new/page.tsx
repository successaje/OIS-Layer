'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { IntentInputBox } from '@/components/IntentInputBox';
import { AgentCard } from '@/components/AgentCard';
import { GlowingButton } from '@/components/GlowingButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChainPill } from '@/components/ChainPill';

export default function IntentComposerPage() {
  const router = useRouter();
  const [intent, setIntent] = useState('');
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (input: string) => {
    setIntent(input);
    // Mock AI interpretation
    setParsedIntent({
      objective: 'Maximize yield on stablecoins',
      constraints: ['Low risk', 'Auto-rebalance'],
      riskProfile: 'Medium',
      chainsAllowed: ['Ethereum', 'Arbitrum', 'Base'],
      assetsAllowed: ['USDC', 'USDT'],
    });
  };

  const agents = [
    { id: '1', ensName: 'yield-master.solver.eth', reputation: 1250, stake: '10.5 ETH', specialization: 'Yield Optimization' },
    { id: '2', ensName: 'defi-expert.solver.eth', reputation: 980, stake: '8.2 ETH', specialization: 'DeFi Strategy' },
    { id: '3', ensName: 'cross-chain-pro.solver.eth', reputation: 1500, stake: '15.0 ETH', specialization: 'Cross-Chain' },
  ];

  const handleFinalSubmit = () => {
    if (selectedAgent) {
      router.push(`/intent/1/agents`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Compose Intent
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Describe your goal in natural language. AI will interpret and agents will compete to fulfill it.
          </p>

          {/* Natural Language Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Natural Language Input</CardTitle>
              <CardDescription>Describe what you want to achieve</CardDescription>
            </CardHeader>
            <CardContent>
              <IntentInputBox
                onSubmit={handleSubmit}
                isLoading={false}
              />
            </CardContent>
          </Card>

          {/* AI Interpretation Preview */}
          <AnimatePresence>
            {parsedIntent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      AI Interpretation Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Objective</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{parsedIntent.objective}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Profile</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{parsedIntent.riskProfile}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Constraints</p>
                        <div className="flex flex-wrap gap-2">
                          {parsedIntent.constraints.map((c: string, i: number) => (
                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chains Allowed</p>
                        <div className="flex flex-wrap gap-2">
                          {parsedIntent.chainsAllowed.map((chain: string) => (
                            <ChainPill key={chain} chain={chain} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Agent Selection */}
          {parsedIntent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Select Agent (Optional)</CardTitle>
                  <CardDescription>Choose a preferred agent or let them compete</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {agents.map((agent) => (
                      <motion.div
                        key={agent.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedAgent(agent.id)}
                      >
                        <AgentCard
                          agentId={agent.id}
                          ensName={agent.ensName}
                          specialization={agent.specialization}
                          reputation={agent.reputation}
                          stake={agent.stake}
                          completedIntents={45}
                          avgRating={4.8}
                          onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Execution Preview */}
          {parsedIntent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Execution Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estimated Gas</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">~0.05 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cross-chain Hops</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">2-3 chains</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Expected Slippage</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">&lt;0.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">Medium</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Submit Button */}
          {parsedIntent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <GlowingButton onClick={() => setShowConfirm(true)}>
                Submit Intent
              </GlowingButton>
            </motion.div>
          )}

          {/* Confirmation Modal */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
                >
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Confirm Intent Submission
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This will create your intent and start the agent competition. Are you sure?
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFinalSubmit}
                      className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

