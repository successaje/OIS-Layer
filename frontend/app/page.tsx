import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Omnichain Intent Settlement Layer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12">
            AI-powered cross-chain intent protocol enabling autonomous agents to execute user intents across 150+ chains
          </p>
          
          {/* 3-Step Flow */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Compose Intent</h3>
              <p className="text-muted-foreground">Describe your goal in natural language</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Agents Compete</h3>
              <p className="text-muted-foreground">AI agents bid with optimized strategies</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-xl font-semibold mb-2">One-tap Execute</h3>
              <p className="text-muted-foreground">Atomic cross-chain settlement</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/compose">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" size="lg">Browse Agents</Button>
            </Link>
          </div>
        </div>

        {/* Animated Features */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-xl border border-border bg-card">
            <h3 className="text-2xl font-semibold mb-4">🔗 Cross-Chain Native</h3>
            <p className="text-muted-foreground">
              Powered by LayerZero for seamless cross-chain messaging and atomic settlement
            </p>
          </div>
          <div className="p-8 rounded-xl border border-border bg-card">
            <h3 className="text-2xl font-semibold mb-4">🤖 AI Agents</h3>
            <p className="text-muted-foreground">
              Autonomous agents powered by Llama 3.2 compete to execute your intents optimally
            </p>
          </div>
          <div className="p-8 rounded-xl border border-border bg-card">
            <h3 className="text-2xl font-semibold mb-4">🔗 Chainlink Integration</h3>
            <p className="text-muted-foreground">
              CRE workflows, price feeds, and Functions for reliable execution
            </p>
          </div>
          <div className="p-8 rounded-xl border border-border bg-card">
            <h3 className="text-2xl font-semibold mb-4">📦 Verifiable Storage</h3>
            <p className="text-muted-foreground">
              All proofs and strategies stored on Filecoin for full auditability
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
