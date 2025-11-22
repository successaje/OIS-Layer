'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Network, TrendingUp, FileText } from 'lucide-react';
import { GlowingButton } from '@/components/GlowingButton';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NeuralMeshBackground } from '@/components/NeuralMeshBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <ParticleBackground />
        <NeuralMeshBackground />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Omnichain Intent Settlement Layer
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12"
          >
            AI agents compete to fulfill your intents across 150+ chains
          </motion.p>

          {/* Animated Intent Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-12 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          >
            <div className="space-y-4">
              <div className="text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">User types:</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  "Get me best yield for $1000 USDC across any chain"
                </p>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: 1 }}
                className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
              <div className="text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Output:</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="text-lg font-bold text-green-600 dark:text-green-400"
                >
                  Intent Fulfilled – 7.2% APY auto-selected
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link href="/dashboard">
              <GlowingButton>Launch App</GlowingButton>
            </Link>
            <Link href="/docs">
              <GlowingButton>
                <FileText className="h-4 w-4 mr-2" />
                View Docs
              </GlowingButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100"
        >
          Powered by Next-Gen Infrastructure
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Network, title: 'Omnichain Execution', desc: 'LayerZero', color: 'from-blue-500 to-cyan-500' },
            { icon: Zap, title: 'AI Solvers', desc: 'Chainlink CRE', color: 'from-purple-500 to-pink-500' },
            { icon: Shield, title: 'Identity Layer', desc: 'ENS Subnames', color: 'from-green-500 to-emerald-500' },
            { icon: TrendingUp, title: 'Reputation & Slashing', desc: 'On-chain governance', color: 'from-orange-500 to-red-500' },
            { icon: Network, title: 'Atomic Settlement', desc: 'Cross-chain finality', color: 'from-indigo-500 to-purple-500' },
            { icon: Zap, title: 'MEV Rebate Engine', desc: 'Fair execution', color: 'from-yellow-500 to-orange-500' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100"
        >
          Architecture
        </motion.h2>
        
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12">
              <div className="grid grid-cols-3 gap-8">
                {['User', 'AI Agents', 'Execution'].map((node, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                      {node[0]}
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{node}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 flex justify-center gap-4">
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                    className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-gray-200 dark:border-gray-700 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Protocol</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/docs" className="hover:text-indigo-600 dark:hover:text-indigo-400">Documentation</Link></li>
                <li><Link href="/contracts" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contract Addresses</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Social</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Twitter</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Discord</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Built With</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>LayerZero</li>
                <li>Chainlink</li>
                <li>ENS</li>
                <li>Llama 3.2</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
