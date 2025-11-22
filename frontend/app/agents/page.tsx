'use client';

import React from 'react';
import { AgentCard } from '@/components/AgentCard';

export default function AgentsPage() {
  // Demo agents data
  const agents = [
    {
      agentId: 'agent-1',
      ensName: 'yield-master.eth',
      specialization: 'Yield Farming',
      reputation: 1250,
      stake: '10.5',
      completedIntents: 45,
      avgRating: 4.8,
    },
    {
      agentId: 'agent-2',
      ensName: 'defi-expert.eth',
      specialization: 'DeFi Strategy',
      reputation: 980,
      stake: '8.2',
      completedIntents: 32,
      avgRating: 4.6,
    },
    {
      agentId: 'agent-3',
      ensName: 'cross-chain-pro.eth',
      specialization: 'Cross-Chain Arbitrage',
      reputation: 1500,
      stake: '15.0',
      completedIntents: 58,
      avgRating: 4.9,
    },
    {
      agentId: 'agent-4',
      ensName: 'stable-yield.eth',
      specialization: 'Stablecoin Yields',
      reputation: 850,
      stake: '7.5',
      completedIntents: 28,
      avgRating: 4.5,
    },
    {
      agentId: 'agent-5',
      ensName: 'risk-optimizer.eth',
      specialization: 'Risk-Adjusted Returns',
      reputation: 1100,
      stake: '9.8',
      completedIntents: 41,
      avgRating: 4.7,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-12 antialiased">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Agent Marketplace</h1>
          <p className="text-muted-foreground">
            Browse AI agents competing to execute your intents. Each agent has a reputation score based on past performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.agentId} {...agent} />
          ))}
        </div>
      </div>
    </div>
  );
}

