'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, TrendingUp, Clock, CheckCircle2, Copy, RefreshCw, BarChart3, History } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingButton } from '@/components/GlowingButton';
import { Navigation } from '@/components/Navigation';
import { useState } from 'react';

export default function DashboardPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeIntents = [
    { id: '1', description: 'Best yield for $1000 USDC', status: 'processing', apy: 7.2 },
    { id: '2', description: 'Swap 1 ETH to USDC', status: 'completed', apy: 0 },
  ];

  const intentHistory = [
    {
      id: '1',
      description: 'Get 5% yield on stablecoins',
      winnerAgent: 'yield-master.solver.eth',
      executionTime: '2m 34s',
      fees: '0.05 ETH',
      chainsUsed: ['Sepolia', 'Base Sepolia'],
      status: 'completed',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      description: 'Swap 1 ETH to USDC',
      winnerAgent: 'defi-expert.solver.eth',
      executionTime: '1m 12s',
      fees: '0.03 ETH',
      chainsUsed: ['Sepolia'],
      status: 'completed',
      completedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '3',
      description: 'Cross-chain yield farming',
      winnerAgent: 'cross-chain-pro.solver.eth',
      executionTime: '3m 45s',
      fees: '0.08 ETH',
      chainsUsed: ['Sepolia', 'Base Sepolia', 'Arbitrum'],
      status: 'completed',
      completedAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  const analytics = {
    agentWinRates: [
      { agent: 'yield-master.solver.eth', wins: 12, rate: 48 },
      { agent: 'defi-expert.solver.eth', wins: 8, rate: 32 },
      { agent: 'cross-chain-pro.solver.eth', wins: 5, rate: 20 },
    ],
    avgExecutionCost: '0.052 ETH',
    crossChainPerformance: {
      totalCrossChain: 15,
      successRate: 96.7,
      avgTime: '2m 18s',
    },
  };

  const copyIntentId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const forkIntent = (intent: typeof intentHistory[0]) => {
    // Navigate to intent creation with pre-filled data
    window.location.href = `/intent/new?fork=${intent.id}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">

      <div className="container mx-auto px-4 py-12">
        {/* Portfolio Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Your cross-chain assets and intents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <MetricCard
                  title="Total Value"
                  value="$12,450"
                  change="+12.5%"
                  icon={TrendingUp}
                  trend="up"
                />
                <MetricCard
                  title="Active Intents"
                  value={activeIntents.length}
                  icon={Clock}
                />
                <MetricCard
                  title="Completed"
                  value="24"
                  change="+3 this week"
                  icon={CheckCircle2}
                  trend="up"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Start New Intent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Ready to create a new intent?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Let AI agents compete to fulfill your cross-chain goals
              </p>
              <Link href="/intent/new">
                <GlowingButton>
                  <Plus className="h-5 w-5 mr-2" />
                  Start New Intent
                </GlowingButton>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Intents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle>Active Intents</CardTitle>
              <CardDescription>Your ongoing intent executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeIntents.map((intent) => (
                  <motion.div
                    key={intent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {intent.description}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Status: {intent.status}
                        </p>
                      </div>
                      <div className="text-right">
                        {intent.apy > 0 && (
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {intent.apy}% APY
                          </p>
                        )}
                        <Link
                          href={`/intent/${intent.id}/execution`}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Intent History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                📚 Intent History
              </CardTitle>
              <CardDescription>Your completed intent executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intentHistory.map((intent) => (
                  <motion.div
                    key={intent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {intent.description}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Winner Agent: </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{intent.winnerAgent}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Execution Time: </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{intent.executionTime}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Fees: </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{intent.fees}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Chains: </span>
                            <div className="inline-flex gap-1">
                              {intent.chainsUsed.map((chain) => (
                                <span key={chain} className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                  {chain}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => copyIntentId(intent.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Copy Intent ID"
                        >
                          <Copy className={`h-4 w-4 ${copiedId === intent.id ? 'text-green-500' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => forkIntent(intent)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Fork Intent"
                        >
                          <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </button>
                        <Link
                          href={`/intent/${intent.id}/result`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="View Result"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b-2 border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                📊 Analytics
              </CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Agent Win Rates */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Agent Win Rates</h4>
                  <div className="space-y-3">
                    {analytics.agentWinRates.map((agent) => (
                      <div key={agent.agent}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400 truncate">{agent.agent}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{agent.rate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${agent.rate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Average Execution Cost */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Average Execution Cost</h4>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                      {analytics.avgExecutionCost}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Across all intents
                    </p>
                  </div>
                </div>

                {/* Cross-chain Performance */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Cross-chain Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Cross-chain:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{analytics.crossChainPerformance.totalCrossChain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {analytics.crossChainPerformance.successRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Time:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {analytics.crossChainPerformance.avgTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

