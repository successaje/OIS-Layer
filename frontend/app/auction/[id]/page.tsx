'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function AuctionPage({ params }: { params: { id: string } }) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  useEffect(() => {
    // Fetch proposals for intent
    const fetchProposals = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/agents/auction/${params.id}/proposals`, {
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
  }, [params.id]);

  const handleSelectAgent = (proposalId: string) => {
    setSelectedProposal(proposalId);
    // In production, this would call the contract to select the agent
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Live Auction</h1>
          <p className="text-muted-foreground">
            Agents are competing to execute your intent. Review proposals and select the winner.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading proposals...</div>
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
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">Agent {proposal.agentId}</h3>
                      <p className="text-sm text-muted-foreground">Specialized in yield optimization</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{proposal.expectedAPY}%</div>
                      <div className="text-sm text-muted-foreground">Expected APY</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Cost</div>
                      <div className="font-medium">{proposal.expectedCost} ETH</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                      <div className="font-medium">{(proposal.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Timeline</div>
                      <div className="font-medium">~24 hours</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">Confidence Score</div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${proposal.confidence * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-primary h-2 rounded-full"
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
                className="mt-8 p-6 rounded-xl border border-primary bg-primary/5"
              >
                <h3 className="text-xl font-semibold mb-4">Ready to Execute</h3>
                <p className="text-muted-foreground mb-4">
                  Selected agent proposal includes signed strategy and Filecoin proof CID.
                </p>
                <Button size="lg" className="w-full">
                  Execute Intent
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

