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
      className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{ensName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{specialization}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reputation}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Reputation</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Stake</div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{stake} ETH</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{completedIntents}</div>
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
