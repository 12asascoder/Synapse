import { useState } from 'react';

export default function SessionStartModal({ onJoin }) {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);

  const handleEnableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setCameraEnabled(true);
    } catch (err) {
      setCameraEnabled(false);
    }
  };

  const handleEnableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicEnabled(true);
    } catch (err) {
      setMicEnabled(false);
    }
  };

  const canJoin = cameraEnabled && micEnabled;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(14, 14, 22, 0.95)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: '16px',
        padding: '40px',
        width: '400px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(124, 58, 237, 0.15)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--violet-700), var(--cyan-500))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', margin: '0 auto 24px',
          boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)'
        }}>
          ◈
        </div>
        
        <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
          Join Learning Session
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Vishesh requires camera and microphone access to provide live feedback and interact during the session.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={handleEnableCamera}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: cameraEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${cameraEnabled ? 'var(--emerald-500)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: cameraEnabled ? 'var(--emerald-400)' : 'white',
              fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
              cursor: cameraEnabled ? 'default' : 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <span>📷 Enable Camera</span>
            {cameraEnabled && <span>✓</span>}
          </button>

          <button 
            onClick={handleEnableMic}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: micEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${micEnabled ? 'var(--emerald-500)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: micEnabled ? 'var(--emerald-400)' : 'white',
              fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
              cursor: micEnabled ? 'default' : 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🎙 Enable Microphone</span>
            {micEnabled && <span>✓</span>}
          </button>
        </div>

        <button 
          onClick={onJoin}
          disabled={!canJoin}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            background: canJoin ? 'linear-gradient(135deg, var(--violet-600), var(--violet-500))' : 'rgba(139, 92, 246, 0.2)',
            border: 'none',
            color: canJoin ? 'white' : 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700,
            cursor: canJoin ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: canJoin ? '0 0 16px rgba(124, 58, 237, 0.4)' : 'none'
          }}
        >
          Join Session
        </button>
      </div>
    </div>
  );
}
