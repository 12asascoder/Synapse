import { useEffect, useState, useRef } from 'react';
import NeuralSphere from '../components/NeuralSphere';
import ThemeContainer from '../components/ThemeContainer';
import { useApp } from '../context/AppContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LOADING_MESSAGES = [
  'Preparing your learning environment...',
  'Analyzing curriculum...',
  'Loading resources...',
  'Setting up workspace...',
  'Almost ready...',
];

export default function LoadingScreen() {
  const { state, navigate } = useApp();
  const { isAuthenticated, user, token } = state;
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeMsg, setFadeMsg] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    let dead = false;

    const msgInterval = setInterval(() => {
      setFadeMsg(false);
      setTimeout(() => {
        setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
        setFadeMsg(true);
      }, 300);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 10, 100));
    }, 250);

    if (isAuthenticated && user && token) {
      doneRef.current = true;
      const target = user?.onboardingComplete === false ? 'profile-setup'
        : user?.role === 'SUPER_ADMIN' ? 'admin-dashboard'
        : state.selectedBootcamp ? 'dashboard' : 'hub';
      const t = setTimeout(() => { if (!dead) navigate(target); }, 400);
      return () => { dead = true; clearInterval(msgInterval); clearInterval(progressInterval); clearTimeout(t); };
    }

    const run = async () => {
      try {
        await fetch(`${API.replace('/api', '')}/health`, { signal: AbortSignal.timeout(3000) });
      } catch {
        // Backend not reachable — still let user through to landing
      }

      if (!dead) {
        await new Promise((r) => setTimeout(r, 800));
        if (!dead) {
          doneRef.current = true;
          navigate('landing');
        }
      }
    };

    run();

    const navFallback = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        navigate('landing');
      }
    }, 5000);

    return () => {
      dead = true;
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      clearTimeout(navFallback);
    };
  }, [isAuthenticated, user, token]);

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
        <div style={{ position: 'relative' }}>
          <div className="animate-float">
            <NeuralSphere size={200} speed={0.4} />
          </div>
        </div>

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
