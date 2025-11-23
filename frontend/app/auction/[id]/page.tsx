'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FilecoinCidDisplay } from '@/components/FilecoinCidDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuctionPage() {
  const params = useParams();
  const id = params.id as string;
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [intentCid, setIntentCid] = useState<string | null>(null); // Would come from intent data

  useEffect(() => {
    if (!id) return;
    
    // Fetch proposals for intent
    const fetchProposals = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/agents/auction/${id}/proposals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intentSpec: 'Get me 5% yield on stablecoins across any chain',
            agentIds: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'],
          }),
        });

        const data = await response.json();
        setProposals(data);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        // Demo data
        setProposals([
          { proposalId: '1', agentId: 'agent-1', expectedAPY: 5.2, expectedCost: '0.01', confidence: 0.85 },
          { proposalId: '2', agentId: 'agent-2', expectedAPY: 4.8, expectedCost: '0.009', confidence: 0.80 },
          { proposalId: '3', agentId: 'agent-3', expectedAPY: 5.5, expectedCost: '0.012', confidence: 0.90 },
          { proposalId: '4', agentId: 'agent-4', expectedAPY: 4.9, expectedCost: '0.008', confidence: 0.75 },
          { proposalId: '5', agentId: 'agent-5', expectedAPY: 5.3, expectedCost: '0.01', confidence: 0.82 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [id]);

  const handleSelectAgent = (proposalId: string) => {
    setSelectedProposal(proposalId);
    // In production, this would call the contract to select the agent
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-12 antialiased">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Live Auction</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Agents are competing to execute your intent. Review proposals and select the winner.
          </p>
          {intentCid && (
            <div className="mb-4">
              <FilecoinCidDisplay cid={intentCid} label="Intent Metadata" compact={true} />
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading proposals...</div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {proposals.map((proposal, index) => (
                <motion.div
                  key={proposal.proposalId}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl border-2 ${
                    selectedProposal === proposal.proposalId
                      ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  } shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Agent {proposal.agentId}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Specialized in yield optimization</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{proposal.expectedAPY}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Expected APY</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cost</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{proposal.expectedCost} ETH</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{(proposal.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Timeline</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">~24 hours</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Confidence Score</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${proposal.confidence * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  <Button
                    variant={selectedProposal === proposal.proposalId ? 'default' : 'outline'}
                    onClick={() => handleSelectAgent(proposal.proposalId)}
                    className="w-full"
                  >
                    {selectedProposal === proposal.proposalId ? 'Selected' : 'Select Agent'}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedProposal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-4"
              >
                <Card className="border-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Ready to Execute</CardTitle>
                    <CardDescription>
                      Selected agent proposal includes signed strategy and Filecoin proof CID.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {intentCid && (
                      <FilecoinCidDisplay
                        cid={intentCid}
                        label="Intent Metadata on Filecoin"
                        showVerify={true}
                      />
                    )}
                    <Button size="lg" className="w-full">
                      Execute Intent
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

