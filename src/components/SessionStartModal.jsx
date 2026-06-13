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
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E6E3',
        borderRadius: '20px',
        padding: '40px',
        width: '400px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.1), 0 0 0 0.5px rgba(0,0,0,0.06)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '14px',
          background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', margin: '0 auto 24px',
          color: '#fff',
        }}>
          ◈
        </div>
        
        <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#000', marginBottom: '8px' }}>
          Join Learning Session
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Vishesh requires camera and microphone access to provide live feedback during the session.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={handleEnableCamera}
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: cameraEnabled ? '#ECFDF5' : '#F5F3F1',
              border: `1px solid ${cameraEnabled ? '#D1FAE5' : '#E8E6E3'}`,
              color: cameraEnabled ? '#059669' : '#44403B',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500,
              cursor: cameraEnabled ? 'default' : 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <span>📷 Enable Camera</span>
            {cameraEnabled && <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>}
          </button>

          <button 
            onClick={handleEnableMic}
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: micEnabled ? '#ECFDF5' : '#F5F3F1',
              border: `1px solid ${micEnabled ? '#D1FAE5' : '#E8E6E3'}`,
              color: micEnabled ? '#059669' : '#44403B',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500,
              cursor: micEnabled ? 'default' : 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🎙 Enable Microphone</span>
            {micEnabled && <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>}
          </button>
        </div>

        <button 
          onClick={onJoin}
          disabled={!canJoin}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '15px', fontWeight: 600,
            opacity: canJoin ? 1 : 0.3,
            cursor: canJoin ? 'pointer' : 'not-allowed',
          }}
        >
          Join Session
        </button>
      </div>
    </div>
  );
}
