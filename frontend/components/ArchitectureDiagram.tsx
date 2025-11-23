'use client';

import { motion } from 'framer-motion';
import { User, Brain, Network, Zap, Shield, Database } from 'lucide-react';
import { ThemeAwareLogo } from './ThemeAwareLogo';
import Image from 'next/image';

interface Node {
  id: string;
  label: string;
  icon: any;
  position: { x: number; y: number };
  color: string;
  connections: string[];
  logo?: string | null;
}

export function ArchitectureDiagram() {
  const nodes: Node[] = [
    {
      id: 'user',
      label: 'User',
      icon: User,
      position: { x: 20, y: 25 },
      color: 'from-blue-500 to-cyan-500',
      connections: ['agents'],
      logo: null,
    },
    {
      id: 'agents',
      label: 'AI Agents',
      icon: Brain,
      position: { x: 50, y: 15 },
      color: 'from-purple-500 to-pink-500',
      connections: ['execution', 'chainlink', 'filecoin'],
      logo: null,
    },
    {
      id: 'execution',
      label: 'Execution',
      icon: Zap,
      position: { x: 80, y: 25 },
      color: 'from-green-500 to-emerald-500',
      connections: [],
      logo: null,
    },
    {
      id: 'layerzero',
      label: 'LayerZero',
      icon: Network,
      position: { x: 80, y: 55 },
      color: 'from-indigo-500 to-purple-500',
      connections: ['execution'],
      logo: 'layerzero',
    },
    {
      id: 'chainlink',
      label: 'Chainlink',
      icon: Shield,
      position: { x: 50, y: 80 },
      color: 'from-orange-500 to-red-500',
      connections: ['agents', 'execution'],
      logo: 'chainlink',
    },
    {
      id: 'filecoin',
      label: 'Filecoin',
      icon: Database,
      position: { x: 20, y: 80 },
      color: 'from-yellow-500 to-orange-500',
      connections: ['agents'],
      logo: 'filecoin',
    },
  ];

  const getConnectionPath = (from: Node, to: Node) => {
    // Convert percentage positions to actual SVG coordinates
    // The SVG viewBox should match the container dimensions
    // Assuming container is 100% width/height, percentages map directly
    
    const fromX = from.position.x;
    const fromY = from.position.y;
    const toX = to.position.x;
    const toY = to.position.y;
    
    // Calculate distance for better curve control
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Create curved path with dynamic control point
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    
    // Perpendicular offset for smoother curves (adjust based on distance)
    const curveIntensity = Math.min(distance * 0.15, 8); // Max 8% offset
    const offsetX = -dy * (curveIntensity / distance);
    const offsetY = dx * (curveIntensity / distance);
    
    const controlX = midX + offsetX;
    const controlY = midY + offsetY;
    
    // Use percentage-based path (SVG will scale to viewBox)
    return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl" style={{ overflow: 'visible' }}>
      <svg 
        className="absolute inset-0 w-full h-full" 
        style={{ overflow: 'visible', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Different gradients for different connection types - more opaque for visibility */}
          <linearGradient id="connection-gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="connection-gradient-oracle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="connection-gradient-storage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="connection-gradient-crosschain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
          </linearGradient>
          
          {/* Radial gradients for glowing beams */}
          <radialGradient id="beam-gradient-primary" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="beam-gradient-oracle" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="beam-gradient-storage" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="beam-gradient-crosschain" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </radialGradient>
          
          <marker
            id="arrowhead-primary"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#6366f1" />
          </marker>
          <marker
            id="arrowhead-oracle"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#f97316" />
          </marker>
          <marker
            id="arrowhead-storage"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#eab308" />
          </marker>
          <marker
            id="arrowhead-crosschain"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#6366f1" />
          </marker>
        </defs>

        {/* Connections with different styles based on connection type */}
        {nodes.map((node) =>
          node.connections.map((targetId) => {
            const target = nodes.find((n) => n.id === targetId);
            if (!target) return null;
            
            // Determine connection type and styling
            let gradientId = 'connection-gradient-primary';
            let beamGradientId = 'beam-gradient-primary';
            let markerId = 'arrowhead-primary';
            let strokeWidth = 1.5;
            
            if (node.id === 'chainlink' || target.id === 'chainlink') {
              gradientId = 'connection-gradient-oracle';
              beamGradientId = 'beam-gradient-oracle';
              markerId = 'arrowhead-oracle';
            } else if (node.id === 'filecoin' || target.id === 'filecoin') {
              gradientId = 'connection-gradient-storage';
              beamGradientId = 'beam-gradient-storage';
              markerId = 'arrowhead-storage';
            } else if (node.id === 'layerzero' || target.id === 'layerzero') {
              gradientId = 'connection-gradient-crosschain';
              beamGradientId = 'beam-gradient-crosschain';
              markerId = 'arrowhead-crosschain';
              strokeWidth = 2;
            }
            
            const pathId = `path-${node.id}-${targetId}`;
            const delay = Math.random() * 1.5;
            
            return (
              <g key={`${node.id}-${targetId}`}>
                {/* Base connection line - thicker and more visible */}
                <motion.path
                  id={pathId}
                  d={getConnectionPath(node, target)}
                  stroke={`url(#${gradientId})`}
                  strokeWidth={strokeWidth}
                  fill="none"
                  markerEnd={`url(#${markerId})`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { duration: 2.5, delay: 0.5, ease: "easeInOut" },
                    opacity: { duration: 1, delay: 0.5 },
                  }}
                  style={{ 
                    filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.6))',
                    strokeLinecap: 'round'
                  }}
                />
                
                {/* Animated beam/particle traveling along the path - forward */}
                <circle
                  r="3"
                  fill={`url(#${beamGradientId})`}
                  opacity={1}
                  style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
                >
                  <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
                
                {/* Second beam - reverse direction */}
                <circle
                  r="2.5"
                  fill={`url(#${beamGradientId})`}
                  opacity={0.9}
                  style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
                >
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    begin={`${delay + 1.2}s`}
                    keyPoints="1;0"
                    keyTimes="0;1"
                    calcMode="linear"
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
                
                {/* Glowing trail effect - forward */}
                <circle
                  r="5"
                  fill={`url(#${beamGradientId})`}
                  opacity={0.4}
                >
                  <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                  >
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
                
                {/* Additional smaller particles */}
                {[0, 1, 2].map((i) => (
                  <circle
                    key={i}
                    r="1.5"
                    fill={`url(#${beamGradientId})`}
                    opacity={0.6}
                  >
                    <animateMotion
                      dur={`${2.5 + i * 0.5}s`}
                      repeatCount="indefinite"
                      begin={`${delay + i * 0.8}s`}
                    >
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                ))}
              </g>
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
              zIndex: 10,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1, z: 50 }}
              className={`
                relative w-20 h-20 rounded-2xl bg-gradient-to-br ${node.color}
                shadow-lg flex flex-col items-center justify-center text-white
                cursor-pointer group
              `}
            >
              {node.logo && typeof node.logo === 'string' && ['layerzero', 'chainlink', 'filecoin'].includes(node.logo) ? (
                <div className="mb-1 relative w-10 h-10 flex items-center justify-center">
                  <ThemeAwareLogo
                    name={node.logo as 'layerzero' | 'chainlink' | 'filecoin'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : node.logo ? (
                <div className="mb-1 relative w-10 h-10">
                  <Image
                    src={node.logo}
                    alt={node.label}
                    fill
                    className="object-contain filter brightness-0 invert"
                  />
                </div>
              ) : (
                <Icon className="h-8 w-8 mb-1" />
              )}
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
