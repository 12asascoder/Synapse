import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const CHECKS = [
  { id: 'cam', label: 'Video Feed', icon: '📷', desc: 'Face visibility and environment' },
  { id: 'mic', label: 'Audio Input', icon: '🎙', desc: 'Background noise levels' },
  { id: 'screen', label: 'Screen Share', icon: '💻', desc: 'Primary display capture' },
  { id: 'browser', label: 'Browser Lock', icon: '🔒', desc: 'Tab and window restrictions' },
];

export default function ProctoringSetup() {
  const { navigate } = useApp();
  const [statuses, setStatuses] = useState({});
  const [allReady, setAllReady] = useState(false);
  const [errors, setErrors] = useState([]);
  const [tabViolations, setTabViolations] = useState(0);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const updateStatus = (id, result) => {
    setStatuses((prev) => ({ ...prev, [id]: result }));
  };

  const runChecks = async () => {
    const errs = [];

    // Camera
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = videoStream;
      if (videoRef.current) videoRef.current.srcObject = videoStream;
      updateStatus('cam', { ok: true, msg: 'Verified & Locked' });
    } catch (e) {
      updateStatus('cam', { ok: false, msg: 'Camera access denied' });
      errs.push('Camera permission required for proctoring');
    }

    // Mic
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current = audioStream;
      // Let it run briefly then stop
      setTimeout(() => { audioStream.getTracks().forEach(t => t.stop()); }, 500);
      updateStatus('mic', { ok: true, msg: 'Verified & Locked' });
    } catch (e) {
      updateStatus('mic', { ok: false, msg: 'Mic access denied' });
      errs.push('Microphone permission required for proctoring');
    }

    // Screen share (just check API availability, don't start capture)
    if (navigator.mediaDevices?.getDisplayMedia) {
      updateStatus('screen', { ok: true, msg: 'API Available' });
    } else {
      updateStatus('screen', { ok: false, msg: 'Not supported on this browser' });
      errs.push('Screen share not supported in this browser');
    }

    // Browser lock — listen for tab switches
    updateStatus('browser', { ok: true, msg: 'Monitoring Active' });

    setErrors(errs);
    const ok = errs.length === 0;
    setAllReady(ok);
  };

  useEffect(() => {
    runChecks();

    // Tab focus monitoring
    const handleVisibility = () => {
      if (document.hidden) {
        setTabViolations((v) => v + 1);
        setErrors((prev) => [...new Set([...prev, 'Tab switch detected — maintain focus during validation'])]);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      streamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#FDFCFC', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '880px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeInUp 0.5s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', background: '#F5F3F1',
            border: '1px solid #E8E6E3', borderRadius: '8px',
            marginBottom: '20px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#000' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#000', textTransform: 'uppercase' }}>
              System Integrity Checks
            </span>
          </div>
          <h1 style={{ fontSize: '48px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px', color: '#000', letterSpacing: '-0.02em' }}>
            Milestone Validation
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: '16px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
            Establishing secure perimeter for your oral validation. Please maintain focus within the camera frame.
          </p>
          {tabViolations > 0 && (
            <div style={{ marginTop: '12px', padding: '8px 16px', background: '#FEF3C7', borderRadius: '8px', color: '#92400E', fontSize: '13px', fontWeight: 600 }}>
              ⚠ {tabViolations} tab switch{tabViolations > 1 ? 'es' : ''} detected
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Live Camera Feed */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column',
            animation: 'fadeInLeft 0.5s ease 0.1s both',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              flex: 1, minHeight: '320px', borderRadius: '16px',
              background: '#000',
              border: '1px solid #000',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', transform: 'scaleX(-1)' }}
              />
              <div style={{
                position: 'absolute', inset: '15%', border: '1px dashed rgba(255,255,255,0.3)',
                borderRadius: '50% 50% 30% 30%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  FACE ALIGNMENT
                </div>
              </div>
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '8px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statuses.cam?.ok ? '#10B981' : '#EF4444' }} />
                <span style={{ fontSize: '11px', color: '#000', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {statuses.cam ? (statuses.cam.ok ? 'FEED ACTIVE' : 'BLOCKED') : 'INITIALIZING...'}
                </span>
              </div>
            </div>
          </div>

          {/* Checks */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '36px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            animation: 'fadeInRight 0.5s ease 0.2s both',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#A59F97', letterSpacing: '0.05em', marginBottom: '24px', textTransform: 'uppercase' }}>
              Verification Status
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {CHECKS.map((check) => {
                const status = statuses[check.id];
                const isActive = status !== undefined;
                const ok = status?.ok;
                return (
                  <div key={check.id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px 20px', borderRadius: '16px',
                    background: isActive ? '#F5F3F1' : '#FFFFFF',
                    border: `1px solid ${ok ? '#000' : isActive ? '#EF4444' : '#E8E6E3'}`,
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '8px',
                      background: isActive ? (ok ? '#000' : '#EF4444') : '#F5F3F1',
                      color: isActive ? '#FFF' : '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700
                    }}>
                      {isActive ? (ok ? '✓' : '✗') : '⟳'}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#000', marginBottom: '2px' }}>
                        {check.label}
                      </div>
                      <div style={{ fontSize: '13px', color: isActive ? (ok ? '#6B6B6B' : '#EF4444') : '#6B6B6B' }}>
                        {isActive ? status.msg : check.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.length > 0 && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: '#FEF2F2', borderRadius: '12px', fontSize: '13px', color: '#991B1B' }}>
                {errors.map((e, i) => <div key={i} style={{ marginBottom: i < errors.length - 1 ? '8px' : 0 }}>• {e}</div>)}
              </div>
            )}

            <button
              onClick={() => navigate('interview')}
              disabled={!allReady}
              className="btn btn-primary"
              style={{
                marginTop: '36px', width: '100%', justifyContent: 'center',
                background: allReady ? '#000' : '#E8E6E3',
                color: allReady ? '#FFF' : '#A59F97',
                border: 'none',
                padding: '16px', borderRadius: '12px',
                cursor: allReady ? 'pointer' : 'not-allowed', fontSize: '15px', fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              {allReady ? 'Enter Secure Sandbox →' : 'Awaiting Verification...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
