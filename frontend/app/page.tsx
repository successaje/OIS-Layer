'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Network, TrendingUp, FileText, Sparkles, Globe, Lock } from 'lucide-react';
import { GlowingButton } from '@/components/GlowingButton';
import { ParticleBackground } from '@/components/ParticleBackground';
import { NeuralMeshBackground } from '@/components/NeuralMeshBackground';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <ParticleBackground />
        <NeuralMeshBackground />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
              🚀 Next-Gen Cross-Chain Intent Engine
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Omnichain Intent
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Settlement Layer
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
          >
            AI agents compete to fulfill your intents across{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">150+ chains</span>
          </motion.p>

          {/* Animated Intent Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-12 max-w-4xl mx-auto"
          >
            <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-6">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Input</p>
                    </div>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                    >
                      "Get me best yield for $1000 USDC across any chain"
                    </motion.p>
                  </div>
                  
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, delay: 1.5 }}
                    className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                  />
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Processing</p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.5 }}
                      className="space-y-2"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Analyzing 150+ chains... Evaluating 50+ protocols... Optimizing strategy...
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, delay: 3 }}
                    className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Result</p>
                    </div>
                    <motion.p
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 3.5, type: 'spring' }}
                      className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                    >
                      ✅ Intent Fulfilled – 7.2% APY auto-selected
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 4 }}
                      className="text-sm text-gray-600 dark:text-gray-400 mt-2"
                    >
                      Executed across Ethereum → Arbitrum → Base in 12 seconds
                    </motion.p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link href="/dashboard">
              <GlowingButton>
                Launch App
                <ArrowRight className="h-5 w-5 ml-2" />
              </GlowingButton>
            </Link>
            <Link href="/docs">
              <GlowingButton>
                <FileText className="h-5 w-5 mr-2" />
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
          className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100"
        >
          Powered by Next-Gen Infrastructure
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg"
        >
          Built on the most advanced cross-chain and AI infrastructure
        </motion.p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Network, title: 'Omnichain Execution', desc: 'LayerZero v2', color: 'from-blue-500 to-cyan-500', badge: '150+ Chains' },
            { icon: Sparkles, title: 'AI Solvers', desc: 'Chainlink CRE', color: 'from-purple-500 to-pink-500', badge: 'Llama 3.2' },
            { icon: Shield, title: 'Identity Layer', desc: 'ENS Subnames', color: 'from-green-500 to-emerald-500', badge: 'Verified' },
            { icon: TrendingUp, title: 'Reputation & Slashing', desc: 'On-chain governance', color: 'from-orange-500 to-red-500', badge: 'Secure' },
            { icon: Lock, title: 'Atomic Settlement', desc: 'Cross-chain finality', color: 'from-indigo-500 to-purple-500', badge: 'Instant' },
            { icon: Zap, title: 'MEV Rebate Engine', desc: 'Fair execution', color: 'from-yellow-500 to-orange-500', badge: 'Optimized' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -8 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                      {feature.badge}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              System Architecture
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A sophisticated network of AI agents, cross-chain infrastructure, and verifiable storage
            </p>
          </div>
          
          <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <ArchitectureDiagram />
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            {[
              { label: 'User Intent', desc: 'Natural language input' },
              { label: 'AI Processing', desc: 'Llama 3.2 + Chainlink CRE' },
              { label: 'Cross-Chain', desc: 'LayerZero execution' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
              >
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">{item.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto"
        >
          {[
            { value: '150+', label: 'Supported Chains' },
            { value: '50+', label: 'AI Agents' },
            { value: '99.9%', label: 'Uptime' },
            { value: '<12s', label: 'Avg Execution' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2"
              >
                {stat.value}
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-gray-200 dark:border-gray-700 mt-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Protocol</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/docs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Documentation</Link></li>
                <li><Link href="/contracts" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contract Addresses</Link></li>
                <li><Link href="/agents" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Agent Marketplace</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Social</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Built With</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>LayerZero v2</li>
                <li>Chainlink CRE</li>
                <li>ENS Subnames</li>
                <li>Llama 3.2</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Resources</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Get Started</Link></li>
                <li><Link href="/intent/new" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Create Intent</Link></li>
                <li><Link href="/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Settings</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
            <p>© 2024 Omnichain Intent Settlement Layer. Built for the future of cross-chain DeFi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
