'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

interface AgentCardProps {
  agentId: string;
  ensName: string;
  specialization: string;
  reputation: number;
  stake: string;
  completedIntents: number;
  avgRating: number;
  onClick?: () => void;
}

export function AgentCard({
  agentId,
  ensName,
  specialization,
  reputation,
  stake,
  completedIntents,
  avgRating,
  onClick,
}: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-6 rounded-xl border border-border bg-card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{ensName}</h3>
          <p className="text-sm text-muted-foreground">{specialization}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{reputation}</div>
          <div className="text-xs text-muted-foreground">Reputation</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-muted-foreground">Stake</div>
          <div className="font-medium">{stake} ETH</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="font-medium">{completedIntents}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="text-sm">Rating:</div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          ))}
        </div>
        <div className="text-sm">({avgRating.toFixed(1)})</div>
      </div>

      {onClick && (
        <Button variant="outline" className="w-full">View Profile</Button>
      )}
    </motion.div>
  );
}
