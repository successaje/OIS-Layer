'use client';

import { motion } from 'framer-motion';
import { User, Brain, Network, Zap, Shield, Database } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  icon: any;
  position: { x: number; y: number };
  color: string;
  connections: string[];
}

export function ArchitectureDiagram() {
  const nodes: Node[] = [
    {
      id: 'user',
      label: 'User',
      icon: User,
      position: { x: 20, y: 50 },
      color: 'from-blue-500 to-cyan-500',
      connections: ['agents'],
    },
    {
      id: 'agents',
      label: 'AI Agents',
      icon: Brain,
      position: { x: 50, y: 20 },
      color: 'from-purple-500 to-pink-500',
      connections: ['execution', 'layerzero'],
    },
    {
      id: 'execution',
      label: 'Execution',
      icon: Zap,
      position: { x: 80, y: 50 },
      color: 'from-green-500 to-emerald-500',
      connections: [],
    },
    {
      id: 'layerzero',
      label: 'LayerZero',
      icon: Network,
      position: { x: 50, y: 50 },
      color: 'from-indigo-500 to-purple-500',
      connections: ['execution'],
    },
    {
      id: 'chainlink',
      label: 'Chainlink',
      icon: Shield,
      position: { x: 50, y: 80 },
      color: 'from-orange-500 to-red-500',
      connections: ['agents'],
    },
    {
      id: 'filecoin',
      label: 'Filecoin',
      icon: Database,
      position: { x: 20, y: 80 },
      color: 'from-yellow-500 to-orange-500',
      connections: ['agents'],
    },
  ];

  const getConnectionPath = (from: Node, to: Node) => {
    const fromX = from.position.x;
    const fromY = from.position.y;
    const toX = to.position.x;
    const toY = to.position.y;
    
    // Create curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const controlX = midX + (toY - fromY) * 0.3;
    const controlY = midY - (toX - fromX) * 0.3;
    
    return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
          </marker>
        </defs>

        {/* Connections */}
        {nodes.map((node) =>
          node.connections.map((targetId) => {
            const target = nodes.find((n) => n.id === targetId);
            if (!target) return null;
            
            return (
              <motion.path
                key={`${node.id}-${targetId}`}
                d={getConnectionPath(node, target)}
                stroke="url(#connection-gradient)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{
                  pathLength: { duration: 2, delay: 0.5 },
                  opacity: { duration: 1, delay: 0.5 },
                }}
              />
            );
          })
        )}
      </svg>

      {/* Nodes */}
      {nodes.map((node, index) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2, type: 'spring', stiffness: 200 }}
            className="absolute"
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1, z: 50 }}
              className={`
                relative w-24 h-24 rounded-2xl bg-gradient-to-br ${node.color}
                shadow-lg flex flex-col items-center justify-center text-white
                cursor-pointer group
              `}
            >
              <Icon className="h-8 w-8 mb-1" />
              <span className="text-xs font-semibold text-center px-2">{node.label}</span>
              
              {/* Glow effect on hover */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${node.color} opacity-0 group-hover:opacity-50 blur-xl -z-10`}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Animated particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-indigo-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

