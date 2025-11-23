'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertTriangle, Zap, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { IntentInputBox } from '@/components/IntentInputBox';
import { AgentCard } from '@/components/AgentCard';
import { AgentProfileModal } from '@/components/AgentProfileModal';
import { AgentSlider } from '@/components/AgentSlider';
import { AgentCompetitionLoader } from '@/components/AgentCompetitionLoader';
import { GlowingButton } from '@/components/GlowingButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChainPill } from '@/components/ChainPill';
import { Button } from '@/components/ui/Button';
import { useIntent, CreateIntentParams } from '@/src/hooks/useIntent';
import { parseIntentWithLlama, type IntentParseResult } from '@/src/lib/ollama';
import { getExplorerUrl, formatTxHash } from '@/lib/utils';
import { useChainId } from 'wagmi';
import { FilecoinUpload } from '@/components/FilecoinUpload';
import { FilecoinCidDisplay } from '@/components/FilecoinCidDisplay';

export default function IntentComposerPage() {
  const router = useRouter();
  const [intent, setIntent] = useState('');
  const [parsedIntent, setParsedIntent] = useState<IntentParseResult | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [viewingAgent, setViewingAgent] = useState<any | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showCompetition, setShowCompetition] = useState(false);
  const [competingAgents, setCompetingAgents] = useState<any[]>([]);
  const [amount, setAmount] = useState('0.01');
  const [deadline, setDeadline] = useState(24); // hours
  const [filecoinCid, setFilecoinCid] = useState<string | null>(null);

  const chainId = useChainId();
  const { createIntent, isCreating, isWaiting, isCreateSuccess, createError, transactionHash } = useIntent();

  // Handle intent parsing with Llama
  const handleSubmit = async (input: string) => {
    setIntent(input);
    setIsParsing(true);
    
    try {
      const parsed = await parseIntentWithLlama(input);
      setParsedIntent(parsed);
      
      // Extract amount if specified
      if (parsed.amount) {
        setAmount(parsed.amount);
      }
      
      // Extract deadline if specified
      if (parsed.deadline) {
        setDeadline(parsed.deadline);
      }
    } catch (error) {
      console.error("Error parsing intent:", error);
      // Fallback to basic parsing
      setParsedIntent({
        objective: input,
        constraints: [],
        riskProfile: 'Medium',
        chainsAllowed: ['Ethereum'],
        assetsAllowed: [],
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Handle successful intent creation - show agent competition
  useEffect(() => {
    if (isCreateSuccess && transactionHash) {
      // Show agent competition loader
      setShowCompetition(true);
      
      // Simulate agents competing (in real app, this would come from contract events)
      setTimeout(() => {
        setCompetingAgents([
          { id: '1', ensName: 'yield-master.solver.eth', apy: 7.2, proposal: 'Aave + Compound strategy', rank: 1 },
          { id: '2', ensName: 'defi-expert.solver.eth', apy: 6.8, proposal: 'Yearn vault optimization', rank: 2 },
          { id: '3', ensName: 'cross-chain-pro.solver.eth', apy: 7.5, proposal: 'Multi-chain yield farming', rank: 3 },
        ]);
      }, 2000);

      // After showing competition, redirect to auction page
      setTimeout(() => {
        // Extract intent ID from transaction (would need to parse events)
        // For now, use a mock ID
        const intentId = '1'; // In real app, extract from transaction receipt
        router.push(`/intent/${intentId}/agents`);
      }, 8000);
    }
  }, [isCreateSuccess, transactionHash, router]);

  const agents = [
    { id: '1', ensName: 'yield-master.solver.eth', reputation: 1250, stake: '10.5', specialization: 'Yield Optimization', completedIntents: 45, avgRating: 4.8, successRate: 98, tags: ['best-apy', 'fastest'], apy: 7.2, rank: 1 },
    { id: '2', ensName: 'defi-expert.solver.eth', reputation: 980, stake: '8.2', specialization: 'DeFi Strategy', completedIntents: 32, avgRating: 4.6, successRate: 95, tags: ['cross-chain'], apy: 6.8, rank: 2 },
    { id: '3', ensName: 'cross-chain-pro.solver.eth', reputation: 1500, stake: '15.0', specialization: 'Cross-Chain', completedIntents: 58, avgRating: 4.9, successRate: 99, tags: ['cross-chain', 'best-apy'], apy: 7.5, rank: 3 },
    { id: '4', ensName: 'stable-yield.solver.eth', reputation: 1100, stake: '12.0', specialization: 'Stablecoin Focus', completedIntents: 38, avgRating: 4.7, successRate: 96, tags: ['stablecoins'], apy: 6.5, rank: 4 },
    { id: '5', ensName: 'risk-optimizer.solver.eth', reputation: 920, stake: '9.5', specialization: 'Low Risk', completedIntents: 28, avgRating: 4.5, successRate: 94, tags: ['low-risk'], apy: 6.2, rank: 5 },
  ];

  const handleFinalSubmit = async () => {
    if (!intent.trim()) {
      alert("Please enter an intent description");
      return;
    }

    try {
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 3600);
      
      const params: CreateIntentParams = {
        intentSpec: intent,
        amount: amount,
        token: "0x0000000000000000000000000000000000000000", // Native ETH
        deadline: deadlineTimestamp,
        filecoinCid: filecoinCid || undefined, // Include Filecoin CID if available
      };

      await createIntent(params);
    } catch (error: any) {
      console.error("Error creating intent:", error);
      alert(`Failed to create intent: ${error.message}`);
    }
  };

  return (
    <>
      {(isCreating || isWaiting) && (
        <LoadingScreen
          message={isCreating ? "Creating Intent..." : "Waiting for confirmation..."}
          subMessage="Please approve the transaction in your wallet"
        />
      )}
      
      {showCompetition && (
        <AgentCompetitionLoader
          agents={competingAgents}
          isLoading={competingAgents.length === 0}
        />
      )}
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
          <Card className="mb-8 border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Natural Language Input</CardTitle>
              <CardDescription>Describe what you want to achieve</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <IntentInputBox
                onSubmit={handleSubmit}
                isLoading={isParsing}
                placeholder="Describe what you want: 'Find me best stablecoin yield across all chains'"
              />
              
              {isParsing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing intent with Llama 3.2...
                </motion.div>
              )}
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
                <Card className="border-2 border-indigo-200 dark:border-indigo-800">
                  <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      AI Interpretation Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
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
              <Card className="border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
                  <CardTitle>Select Agent (Optional)</CardTitle>
                  <CardDescription>Choose a preferred agent or let them compete. Top agent is pre-selected.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <AgentSlider
                    agents={agents}
                    selectedAgentId={selectedAgent}
                    onSelectAgent={(agentId) => {
                      setSelectedAgent(agentId);
                      if (agentId) {
                        const agent = agents.find(a => a.id === agentId);
                        if (agent) {
                          setViewingAgent(agent);
                        }
                      }
                    }}
                    autoSelectFirst={true}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Agent Profile Modal */}
          {viewingAgent && (
            <AgentProfileModal
              agent={viewingAgent}
              isOpen={!!viewingAgent}
              onClose={() => setViewingAgent(null)}
              onCompete={() => {
                setSelectedAgent(viewingAgent.id);
                setViewingAgent(null);
              }}
            />
          )}

          {/* Filecoin Storage (Optional) */}
          {parsedIntent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <FilecoinUpload
                onCidChange={setFilecoinCid}
                label="Store Intent Metadata on Filecoin (Optional)"
                description="Upload files or store metadata on decentralized Filecoin storage for verifiable proof"
              />
            </motion.div>
          )}

          {/* Execution Preview */}
          {parsedIntent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
                  <CardTitle>Execution Preview</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
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
              <GlowingButton 
                onClick={handleFinalSubmit}
                disabled={!intent.trim() || isCreating || isWaiting}
                className="w-full max-w-md mx-auto"
              >
                {isCreating || isWaiting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreating ? 'Creating Intent...' : 'Waiting for confirmation...'}
                  </>
                ) : isCreateSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Intent Created!
                  </>
                ) : (
                  'Create Intent'
                )}
              </GlowingButton>
              
              {createError && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Error: {createError.message}
                  </p>
                </div>
              )}
              
              {isCreateSuccess && transactionHash && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-4 max-w-md mx-auto"
                >
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          Intent created successfully!
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                          {formatTxHash(transactionHash)}
                        </p>
                      </div>
                      <a
                        href={getExplorerUrl(chainId, transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </a>
                    </div>
                  </div>
                  {filecoinCid && (
                    <FilecoinCidDisplay
                      cid={filecoinCid}
                      label="Stored on Filecoin"
                      showVerify={true}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

        </motion.div>
        </div>
      </div>
    </>
  );
}

