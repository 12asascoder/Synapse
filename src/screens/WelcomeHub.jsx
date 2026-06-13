/**
 * WelcomeHub — "Begin Your Learning Journey"
 * Hackorizon Dark Aesthetic Design
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ICON_MAP = {
  Brain: '🧠', Monitor: '⚡', Server: '⚙', Rocket: '🎯',
  BarChart3: '📊', Shield: '🛡', Container: '🚀', Palette: '✦',
  Cloud: '☁', Handshake: '📈',
};

function BootcampCard({ bootcamp, selected, onSelect }) {
  const isActive = selected?.id === bootcamp.id;

  return (
    <button
      onClick={() => onSelect(bootcamp)}
      id={`bootcamp-${bootcamp.id}`}
      style={{
        background: isActive ? 'var(--bg-hover)' : 'var(--bg-card)',
        border: `1px solid ${isActive ? 'var(--border-active)' : 'var(--border-subtle)'}`,
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isActive ? 'translateY(-2px)' : 'none',
        boxShadow: isActive ? '0 12px 24px rgba(207,255,0,0.05)' : 'none',
        textAlign: 'left',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
        background: isActive ? 'var(--border-active)' : 'var(--bg-surface)',
        color: isActive ? 'var(--bg-base)' : 'var(--text-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
        transition: 'all 0.2s ease',
      }}>
        {ICON_MAP[bootcamp.icon] || '🧠'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>
          {bootcamp.name}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{bootcamp.duration}</span>
          <span style={{ fontSize: '12px', color: 'var(--border-subtle)' }}>·</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{bootcamp.level}</span>
        </div>
        {isActive && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(bootcamp.outcomes || []).map((o) => (
              <span key={o} style={{
                fontSize: '11px', padding: '4px 8px',
                background: 'var(--bg-surface)', color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)', borderRadius: '6px',
                fontWeight: 500,
              }}>{o}</span>
            ))}
          </div>
        )}
      </div>
      {isActive && (
        <div style={{ color: 'var(--text-accent)', fontSize: '18px', flexShrink: 0, fontWeight: 700 }}>✓</div>
      )}
    </button>
  );
}

export default function WelcomeHub() {
  const { state, dispatch, navigate } = useApp();
  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('select');

  useEffect(() => {
    fetch(`${API}/bootcamps`)
      .then((r) => r.json())
      .then((data) => setBootcamps(data))
      .catch(() => setBootcamps([]))
      .finally(() => setLoading(false));
  }, []);

  const handleBegin = () => {
    if (!selected) return;
    dispatch({ type: 'SELECT_BOOTCAMP', payload: selected });
    dispatch({ type: 'START_BOOTCAMP' });
    navigate('bootcamp-init');
  };

  if (phase === 'select') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Nav */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(1,2,3,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          height: '64px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 40px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 28, height: 28, background: 'var(--border-active)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--bg-base)', fontWeight: 800 }}>✦</div>
            <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>SYNAPSE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-active)' }} />
            System Ready
          </div>
        </nav>

        {/* Main layout */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingTop: '64px', minHeight: '100vh',
        }}>
          <div style={{ maxWidth: '800px', textAlign: 'center', padding: '40px' }}>
            <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '16px', background: 'var(--border-active)', color: 'var(--bg-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                margin: '0 auto 32px', fontWeight: 800
              }}>
                ✦
              </div>
              <h1 style={{
                fontSize: '44px',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '12px',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}>
                Choose Your Path.
              </h1>
              <p style={{
                fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6,
                marginBottom: '48px',
              }}>
                Pick a bootcamp curriculum or prepare for an interview.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '640px', margin: '0 auto' }}>
                <button onClick={() => setPhase('catalog')} style={{
                  padding: '36px 24px', borderRadius: '16px', border: '1px solid rgba(243,242,238,0.2)',
                  background: 'rgba(10,10,12,0.8)', cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D6EFD'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(207,255,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(243,242,238,0.2)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
                >
                  <div style={{ fontSize: '40px' }}>📚</div>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>Bootcamp Curriculum</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Follow a structured 30-day learning path with lessons, exercises, and assessments.
                  </div>
                  <div style={{ marginTop: '8px', padding: '8px 20px', borderRadius: '8px', background: '#0D6EFD', color: 'var(--bg-base)', fontWeight: 700, fontSize: '14px' }}>
                    Browse Bootcamps →
                  </div>
                </button>

                <button onClick={() => navigate('interview-prep')} style={{
                  padding: '36px 24px', borderRadius: '16px', border: '1px solid rgba(243,242,238,0.2)',
                  background: 'rgba(10,10,12,0.8)', cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D6EFD'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(207,255,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(243,242,238,0.2)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
                >
                  <div style={{ fontSize: '40px' }}>🎯</div>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>Interview Preparation</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Submit a job description, practice STAR questions, and get AI-powered feedback.
                  </div>
                  <div style={{ marginTop: '8px', padding: '8px 20px', borderRadius: '8px', background: '#0D6EFD', color: 'var(--bg-base)', fontWeight: 700, fontSize: '14px' }}>
                    Start Prep →
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bootcamp catalog selection
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', paddingTop: '64px' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(1,2,3,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: '64px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 28, height: 28, background: 'var(--border-active)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--bg-base)', fontWeight: 800 }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>SYNAPSE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-active)' }} /> System Ready
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 40px 120px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeInUp 0.5s ease' }}>
          <h1 style={{ fontSize: '40px', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Choose Your Path
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Select a bootcamp to generate your personalized learning journey.
          </p>
        </div>

        {/* Bootcamp grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '48px',
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>Loading bootcamps...</div>
          ) : bootcamps.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>No bootcamps available</div>
              <div style={{ fontSize: '13px', lineHeight: 1.6 }}>Make sure the backend server is running and has seeded bootcamp data.<br />Run <code style={{ background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>cd backend && node seed.js</code> to populate bootcamps.</div>
            </div>
          ) : bootcamps.map((b, i) => (
            <div key={b.id} style={{ animation: `fadeInUp 0.4s ease ${i * 60}ms both` }}>
              <BootcampCard bootcamp={b} selected={selected} onSelect={setSelected} />
            </div>
          ))}
        </div>

        {/* Selected confirmation */}
        {selected && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '24px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'fadeInUp 0.3s ease',
            zIndex: 200,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '12px',
                background: 'var(--border-active)', color: 'var(--bg-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>{ICON_MAP[selected.icon] || '🧠'}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>{selected.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{selected.duration} · {selected.cert ? 'Certified' : 'Certificate Not Available'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => setSelected(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleBegin}
                id="hub-start-btn"
                style={{ padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, background: 'var(--border-active)', color: 'var(--bg-base)', border: 'none', cursor: 'pointer' }}
              >
                Start Bootcamp →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
