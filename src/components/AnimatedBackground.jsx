import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 0, // Behind all content
      overflow: 'hidden',
      background: 'var(--bg-base)' // Deep black Hackorizon bg
    }}>
      
      {/* Slow moving ambient blob 1 - neon yellow aura */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -40, 80, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(207,255,0,0.04) 0%, rgba(1,2,3,0) 70%)',
          filter: 'blur(80px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Slow moving ambient blob 2 - subtle cyan glow */}
      <motion.div
        animate={{
          x: [0, -80, 40, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '70%',
          right: '5%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,240,255,0.03) 0%, rgba(1,2,3,0) 70%)',
          filter: 'blur(90px)',
          transform: 'translate(50%, -50%)',
        }}
      />
      
      {/* Subtle grid overlay to give structure */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(243, 242, 238, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 242, 238, 0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        opacity: 0.9,
        maskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)'
      }} />
    </div>
  );
}
