/**
 * ProctoringSetup — Pre-assessment system integrity checks
 * Required before Day 15 / Day 30 validations
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const CHECKS = [
  { id: 'cam', label: 'Video Feed', icon: '📷', desc: 'Face visibility and environment' },
  { id: 'mic', label: 'Audio Input', icon: '🎙', desc: 'Background noise levels' },
  { id: 'screen', label: 'Screen Share', icon: '💻', desc: 'Primary display capture' },
  { id: 'browser', label: 'Browser Lock', icon: '🔒', desc: 'Tab and window restrictions' },
];

export default function ProctoringSetup() {
  const { navigate } = useApp();
  const [activeChecks, setActiveChecks] = useState([]);
  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    CHECKS.forEach((check, i) => {
      setTimeout(() => {
        setActiveChecks((prev) => [...prev, check.id]);
        if (i === CHECKS.length - 1) {
          setTimeout(() => setAllReady(true), 800);
        }
      }, (i + 1) * 1200);
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
      <div className="orb orb-cyan" style={{ width: 400, height: 400, top: -50, left: -50, opacity: 0.15 }} />

      <div style={{ width: '100%', maxWidth: '800px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInUp 0.5s ease' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '16px' }}>🛡 SYNAPSE PROCTORING ENGINE</div>
          <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: '8px' }}>
            Milestone Validation Integrity
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
            Establishing secure perimeter for Day 15 Oral Validation. Please maintain focus within the camera frame.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Camera Feed Mock */}
          <div style={{
            background: 'rgba(12,12,20,0.9)', border: '1px solid var(--border-subtle)',
            borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column',
            animation: 'fadeInLeft 0.5s ease 0.1s both',
          }}>
            <div style={{
              flex: 1, minHeight: '280px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '1px solid rgba(6,182,212,0.3)',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute', inset: '10%', border: '1px dashed rgba(6,182,212,0.4)',
                borderRadius: '50% 50% 20% 20%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', animation: 'pulse-dot 2s infinite' }}>
                  [ FACE ALIGNMENT ]
                </div>
              </div>
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(5,5,10,0.8)', padding: '4px 8px', borderRadius: '6px' }}>
                <div className="dot-live" style={{ width: 6, height: 6 }} />
                <span style={{ fontSize: '9px', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>FEED ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Checks */}
          <div style={{
            background: 'rgba(12,12,20,0.9)', border: '1px solid var(--border-subtle)',
            borderRadius: '16px', padding: '28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            animation: 'fadeInRight 0.5s ease 0.2s both',
          }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '24px' }}>
              SYSTEM INTEGRITY CHECKS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {CHECKS.map((check) => {
                const isActive = activeChecks.includes(check.id);
                return (
                  <div key={check.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 16px', borderRadius: '10px',
                    background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(14,14,22,0.6)',
                    border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.4s ease',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '6px',
                      background: isActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                    }}>
                      {isActive ? '✓' : '⟳'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isActive ? 'var(--emerald-400)' : 'var(--text-primary)' }}>
                        {check.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {isActive ? 'Verified & Locked' : check.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate('interview')}
              disabled={!allReady}
              className="btn btn-primary"
              style={{
                marginTop: '32px', width: '100%', justifyContent: 'center',
                background: allReady ? 'linear-gradient(135deg, var(--cyan-600), var(--cyan-500))' : 'rgba(6,182,212,0.2)',
                boxShadow: allReady ? '0 6px 28px rgba(6,182,212,0.4)' : 'none',
                cursor: allReady ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-mono)',
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
