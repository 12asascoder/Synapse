/**
 * WelcomeHub — "Begin Your Neural Bootcamp Journey"
 * Reference: Robot mascot left, headline right, sync bar at bottom
 * Exact match to provided design reference
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const BOOTCAMPS = [
  { id: 'ai-eng', name: 'AI Engineering', icon: '🧠', duration: '30 Days', level: 'Advanced', color: '#7c3aed', outcomes: ['LLM Fine-tuning', 'RAG Systems', 'MLOps'], cert: 'AI Engineer Certified' },
  { id: 'frontend', name: 'Frontend Engineering', icon: '⚡', duration: '30 Days', level: 'Intermediate', color: '#06b6d4', outcomes: ['React Mastery', 'System Design', 'Performance'], cert: 'Frontend Pro Certified' },
  { id: 'backend', name: 'Backend Engineering', icon: '⚙', duration: '30 Days', level: 'Advanced', color: '#10b981', outcomes: ['Distributed Systems', 'APIs', 'Databases'], cert: 'Backend Architect Certified' },
  { id: 'product', name: 'Product Management', icon: '🎯', duration: '30 Days', level: 'Intermediate', color: '#f59e0b', outcomes: ['Strategy', 'Roadmapping', 'GTM'], cert: 'PM Leader Certified' },
  { id: 'sales', name: 'Sales Excellence', icon: '📈', duration: '30 Days', level: 'Beginner', color: '#f43f5e', outcomes: ['Consultative Sales', 'CRM Mastery', 'Closing'], cert: 'Sales Pro Certified' },
  { id: 'data', name: 'Data Science', icon: '📊', duration: '30 Days', level: 'Advanced', color: '#8b5cf6', outcomes: ['ML Models', 'Data Pipelines', 'Analytics'], cert: 'Data Scientist Certified' },
  { id: 'cyber', name: 'Cybersecurity', icon: '🛡', duration: '30 Days', level: 'Advanced', color: '#06b6d4', outcomes: ['Penetration Testing', 'SIEM', 'Zero Trust'], cert: 'Security Analyst Certified' },
  { id: 'devops', name: 'DevOps Engineering', icon: '🚀', duration: '30 Days', level: 'Advanced', color: '#10b981', outcomes: ['Kubernetes', 'CI/CD', 'Observability'], cert: 'DevOps Engineer Certified' },
  { id: 'uiux', name: 'UI/UX Design', icon: '✦', duration: '30 Days', level: 'Intermediate', color: '#f59e0b', outcomes: ['Design Systems', 'Prototyping', 'User Research'], cert: 'UX Designer Certified' },
  { id: 'cloud', name: 'Cloud Engineering', icon: '☁', duration: '30 Days', level: 'Advanced', color: '#7c3aed', outcomes: ['AWS/GCP/Azure', 'Serverless', 'FinOps'], cert: 'Cloud Architect Certified' },
];

function BootcampCard({ bootcamp, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const isActive = selected?.id === bootcamp.id;

  return (
    <button
      onClick={() => onSelect(bootcamp)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      id={`bootcamp-${bootcamp.id}`}
      style={{
        background: isActive
          ? `rgba(${bootcamp.color === '#7c3aed' ? '124,58,237' : bootcamp.color === '#06b6d4' ? '6,182,212' : bootcamp.color === '#10b981' ? '16,185,129' : bootcamp.color === '#f59e0b' ? '245,158,11' : bootcamp.color === '#f43f5e' ? '244,63,94' : bootcamp.color === '#8b5cf6' ? '139,92,246' : '124,58,237'}, 0.18)`
          : hovered ? 'rgba(139,92,246,0.08)' : 'var(--bg-card)',
        border: `1px solid ${isActive ? bootcamp.color + '66' : hovered ? 'rgba(139,92,246,0.3)' : 'var(--border-subtle)'}`,
        borderRadius: '14px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        transform: isActive ? 'scale(1.02)' : hovered ? 'translateY(-2px)' : 'none',
        boxShadow: isActive ? `0 0 24px ${bootcamp.color}33` : 'none',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
          background: `${bootcamp.color}22`,
          border: `1px solid ${bootcamp.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>{bootcamp.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: isActive ? bootcamp.color : 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
            {bootcamp.name}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{bootcamp.duration}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{bootcamp.level}</span>
          </div>
          {isActive && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {bootcamp.outcomes.map((o) => (
                <span key={o} style={{
                  fontSize: '10px', padding: '2px 8px',
                  background: `${bootcamp.color}22`, color: bootcamp.color,
                  border: `1px solid ${bootcamp.color}33`, borderRadius: '4px', fontFamily: 'var(--font-mono)',
                }}>{o}</span>
              ))}
            </div>
          )}
        </div>
        {isActive && (
          <div style={{ color: bootcamp.color, fontSize: '16px', flexShrink: 0 }}>✓</div>
        )}
      </div>
    </button>
  );
}

export default function WelcomeHub() {
  const { state, dispatch, navigate } = useApp();
  const [selected, setSelected] = useState(null);
  const [syncProgress] = useState(98);
  const [phase, setPhase] = useState('select'); // select | confirm
  const [robotFloatY, setRobotFloatY] = useState(0);

  // Float animation for robot
  useEffect(() => {
    let frame;
    let t = 0;
    const animate = () => {
      t += 0.02;
      setRobotFloatY(Math.sin(t) * 10);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
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
        background: 'var(--bg-void)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Grid BG */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

        {/* Purple glow behind robot */}
        <div style={{
          position: 'absolute', left: 0, top: '20%',
          width: '480px', height: '480px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 65%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        {/* Top Nav */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          height: '56px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 40px',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.02em' }}>
            SYNAPSE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan-400)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan-400)', boxShadow: '0 0 8px var(--cyan-400)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            NEURAL LINK ACTIVE
          </div>
        </nav>

        {/* Main split layout */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          paddingTop: '56px', minHeight: '100vh',
        }}>
          {/* LEFT — Robot mascot */}
          <div style={{
            width: '48%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px',
          }}>
            <div style={{
              width: '100%', maxWidth: '440px', aspectRatio: '1',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(10,10,20,0.4) 100%)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Inner glow */}
              <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '70%', height: '40%',
                background: 'radial-gradient(ellipse, rgba(124,58,237,0.35) 0%, transparent 70%)',
              }} />
              <img
                src="/vishesh-mascot.png"
                alt="Vishesh AI Mascot"
                style={{
                  width: '85%', height: '85%', objectFit: 'contain',
                  transform: `translateY(${robotFloatY}px)`,
                  filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.5))',
                  position: 'relative', zIndex: 1,
                }}
              />
            </div>
          </div>

          {/* RIGHT — Content */}
          <div style={{ width: '52%', padding: '60px 60px 60px 20px' }}>
            <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
              <h1 style={{
                fontSize: 'clamp(40px, 4.5vw, 64px)',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '24px',
              }}>
                Begin Your<br />
                <span style={{ color: 'var(--violet-300)' }}>Neural</span>{' '}
                <span style={{
                  background: 'linear-gradient(90deg, var(--violet-300), var(--cyan-400))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Bootcamp</span><br />
                <span style={{ color: 'var(--cyan-400)' }}>Journey.</span>
              </h1>

              <p style={{
                fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7,
                marginBottom: '40px', maxWidth: '440px',
              }}>
                Your neural interface is optimized for the AI Engineering Bootcamp. Access advanced curriculum modules and immersive laboratory environments now.
              </p>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => setPhase('catalog')}
                style={{
                  marginBottom: '24px', gap: '12px', fontSize: '14px',
                  background: 'linear-gradient(135deg, var(--violet-600), var(--violet-500))',
                  boxShadow: '0 6px 32px rgba(124,58,237,0.4)',
                  minWidth: '280px', justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
                }}
                id="hub-continue-btn"
              >
                Continue to Learning Path <span style={{ fontSize: '18px' }}>→</span>
              </button>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>⚙</span> Kernel v2.4.0
                </div>
                <span style={{ color: 'var(--border-default)' }}>·</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>◎</span> Pro Tier
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom sync bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(5,5,8,0.95)', borderTop: '1px solid var(--border-subtle)',
          padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>SYNC STATUS</div>
            <div style={{ width: '120px', height: '2px', background: 'rgba(124,58,237,0.2)', borderRadius: '1px' }}>
              <div style={{ width: `${syncProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--violet-500), var(--cyan-400))', borderRadius: '1px', transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{syncProgress}%</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px',
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '20px',
            fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: 'var(--violet-300)', letterSpacing: '0.12em',
          }}>
            <div className="dot-live" style={{ width: 6, height: 6 }} />
            AWAITING COMMAND
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            © 2026 SYNAPSE NEURAL LEARNING SYSTEMS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    );
  }

  // Bootcamp catalog selection
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', paddingTop: '56px' }}>
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>SYNAPSE</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan-400)' }}>
          <div className="dot-live" style={{ width: 7, height: 7 }} /> NEURAL LINK ACTIVE
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 40px 120px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeInUp 0.5s ease' }}>
          <div className="badge badge-violet" style={{ marginBottom: '16px' }}>✦ Select Your Path</div>
          <h1 style={{ fontSize: '48px', fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: '16px' }}>
            Choose Your <span style={{ background: 'linear-gradient(90deg, var(--violet-300), var(--cyan-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Neural Path</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Vishesh will generate your personalized 30-day learning journey once you select a bootcamp.
          </p>
        </div>

        {/* Bootcamp grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '14px',
          marginBottom: '48px',
        }}>
          {BOOTCAMPS.map((b, i) => (
            <div key={b.id} style={{ animation: `fadeInUp 0.4s ease ${i * 60}ms both` }}>
              <BootcampCard bootcamp={b} selected={selected} onSelect={setSelected} />
            </div>
          ))}
        </div>

        {/* Selected confirmation */}
        {selected && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'rgba(5,5,8,0.97)', backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(124,58,237,0.3)',
            padding: '20px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'fadeInUp 0.3s ease',
            zIndex: 200,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '10px',
                background: `${selected.color}22`, border: `1px solid ${selected.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>{selected.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)' }}>{selected.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>30 Days · {selected.cert}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Change Selection</button>
              <button
                className="btn btn-primary"
                onClick={handleBegin}
                id="hub-start-btn"
                style={{ gap: '10px', minWidth: '220px', justifyContent: 'center', boxShadow: `0 6px 28px ${selected.color}44` }}
              >
                Initialize Bootcamp →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
