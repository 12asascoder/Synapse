/**
 * LoadingScreen — Clean white loading state
 */
import { useEffect, useState } from 'react';
import NeuralSphere from '../components/NeuralSphere';
import ThemeContainer from '../components/ThemeContainer';
import { useApp } from '../context/AppContext';

const LOADING_MESSAGES = [
  'Preparing your learning environment...',
  'Analyzing curriculum...',
  'Loading resources...',
  'Setting up workspace...',
  'Almost ready...',
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
    }, 1200);

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 10, 100));
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
    <ThemeContainer>
      <div style={{
        minHeight: '100vh',
        background: '#010203',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.5s ease',
      }}>
        {/* Neural sphere */}
        <div style={{ position: 'relative' }}>
          <div className="animate-float">
            <NeuralSphere size={200} speed={0.4} />
          </div>
        </div>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            color: '#CFFF00',
            marginBottom: '12px',
            fontWeight: 700,
          }}>
            Synapse
          </div>
          <div style={{
            fontSize: '14px',
            color: '#A59F97',
            transition: 'opacity 0.3s ease',
            opacity: fadeMsg ? 1 : 0,
            minWidth: '260px',
            textAlign: 'center',
          }}>
            {LOADING_MESSAGES[msgIdx]}
          </div>
        </div>

        {/* Progress */}
        <div style={{ width: '240px' }}>
          <div className="progress-bar" style={{ height: '3px', background: '#0A0A0A' }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%`, background: '#CFFF00' }}
            />
          </div>
        </div>
      </div>
    </ThemeContainer>
  );
}
