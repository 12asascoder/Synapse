/**
 * LoadingScreen — Animated neural sphere with rotating status messages
 * Auto-transitions to landing after initialization
 */
import { useEffect, useState } from 'react';
import NeuralSphere from '../components/NeuralSphere';
import { useApp } from '../context/AppContext';

const LOADING_MESSAGES = [
  'Calibrating Vishesh...',
  'Synchronizing Neural Nodes...',
  'Building Learning Context...',
  'Preparing Intelligence Layer...',
  'Establishing Neural Link...',
  'Mapping Growth Vectors...',
  'Initializing Skill Matrix...',
];

export default function LoadingScreen() {
  const { navigate } = useApp();
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeMsg, setFadeMsg] = useState(true);

  useEffect(() => {

    // Cycle messages
    const msgInterval = setInterval(() => {
      setFadeMsg(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
        setFadeMsg(true);
      }, 300);
    }, 900);

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12, 100));
    }, 250);

    // Auto-navigate after ~3.5s
    const navTimer = setTimeout(() => {
      navigate('landing');
    }, 3500);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div className="orb orb-violet" style={{ width: 500, height: 500, top: -100, left: -100, opacity: 0.4 }} />
      <div className="orb orb-cyan" style={{ width: 400, height: 400, bottom: -80, right: -80, opacity: 0.3 }} />

      {/* Subtle grid */}
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      {/* Center content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.5s ease',
      }}>
        {/* Neural sphere */}
        <div style={{ position: 'relative' }}>
          <div className="animate-float">
            <NeuralSphere size={220} speed={0.6} />
          </div>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            animation: 'neural-pulse 3s ease-in-out infinite',
          }} />
        </div>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            letterSpacing: '0.4em',
            color: 'var(--violet-400)',
            marginBottom: '6px',
            fontWeight: 700,
          }}>
            SYNAPSE
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.15em',
            transition: 'opacity 0.3s ease',
            opacity: fadeMsg ? 1 : 0,
            minWidth: '260px',
            textAlign: 'center',
          }}>
            {LOADING_MESSAGES[msgIdx]}
          </div>
        </div>

        {/* Progress */}
        <div style={{ width: '200px' }}>
          <div className="progress-bar" style={{ height: '2px' }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Version tag */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
      }}>
        v1.0 · AI Growth Intelligence Layer
      </div>
    </div>
  );
}
