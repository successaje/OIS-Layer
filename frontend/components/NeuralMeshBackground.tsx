'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function NeuralMeshBackground() {
  // Use useState to ensure consistent values between server and client
  const [nodes, setNodes] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    // Generate nodes only on client side to avoid hydration mismatch
    setNodes(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
    );
  }, []);

  // Don't render until nodes are generated (client-side only)
  if (nodes.length === 0) {
    return <div className="fixed inset-0 -z-10 overflow-hidden" />;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <svg className="w-full h-full opacity-20">
        <defs>
          <linearGradient id="mesh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {nodes.map((node, i) => (
          <g key={node.id}>
            {nodes.slice(i + 1).map((other) => {
              const distance = Math.sqrt(
                Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
              );
              if (distance < 30) {
                return (
                  <motion.line
                    key={`${node.id}-${other.id}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${other.x}%`}
                    y2={`${other.y}%`}
                    stroke="url(#mesh-gradient)"
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                );
              }
              return null;
            })}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="2"
              fill="url(#mesh-gradient)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

