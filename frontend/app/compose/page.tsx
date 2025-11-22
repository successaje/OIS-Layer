'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ComposeIntentPage() {
  const [intentSpec, setIntentSpec] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create intent via backend API
      const response = await fetch('http://localhost:3001/api/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentSpec,
          amount,
          tokenAddress: tokenAddress || null,
          deadline: new Date(deadline).toISOString(),
        }),
      });

      const intent = await response.json();
      console.log('Intent created:', intent);
      // Redirect to auction page
      window.location.href = `/auction/${intent.id}`;
    } catch (error) {
      console.error('Error creating intent:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Compose Intent</h1>
          <p className="text-muted-foreground">
            Describe your goal in natural language. AI agents will compete to execute it optimally.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium mb-2">
              Intent Description
            </label>
            <textarea
              value={intentSpec}
              onChange={(e) => setIntentSpec(e.target.value)}
              placeholder="e.g., Get me 5% yield on stablecoins across any chain; rebalance if rates change"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-4"
          >
            <Input
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              required
            />
            <Input
              label="Token Address (optional)"
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x... or leave empty for native"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Input
              label="Deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Creating Intent...' : 'Create Intent'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

