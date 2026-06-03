/**
 * BootcampInit — Vishesh generates personalized learning path
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const STEPS = [
  { label: 'Analyzing your background...', delay: 0 },
  { label: 'Mapping skill graph...', delay: 800 },
  { label: 'Building personalized curriculum...', delay: 1600 },
  { label: 'Setting milestone checkpoints...', delay: 2400 },
  { label: 'Calibrating difficulty parameters...', delay: 3200 },
  { label: 'Neural path initialized.', delay: 4000 },
];

export default function BootcampInit() {
  const { state, navigate } = useApp();
  const { selectedBootcamp } = state;
  const [doneSteps, setDoneSteps] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setDoneSteps((p) => [...p, i]);
        if (i === STEPS.length - 1) setTimeout(() => setReady(true), 600);
      }, step.delay);
    });
  }, []);

  const OBJECTIVES = [
    { day: '1-7', title: 'Foundation Layer', desc: 'Core concepts, mental models, and vocabulary' },
    { day: '8-14', title: 'Depth Expansion', desc: 'Advanced techniques and hands-on application' },
    { day: '15', title: '★ Phase 1 Milestone', desc: 'Proctored validation — AI Interview + Technical Assessment', milestone: true },
    { day: '16-22', title: 'Adaptive Phase', desc: 'Vishesh personalizes based on your Day 15 performance' },
    { day: '23-29', title: 'Mastery Sprint', desc: 'Real-world projects and case study simulations' },
    { day: '30', title: '🎓 Final Certification', desc: 'Full proctored validation + career readiness report', milestone: true },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', overflow: 'hidden',
    }}>
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
      <div className="orb orb-violet" style={{ width: 500, height: 500, top: -100, left: '50%', transform: 'translateX(-50%)', opacity: 0.2 }} />

      <div style={{ width: '100%', maxWidth: '720px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInUp 0.5s ease' }}>
          <div className="vishesh-avatar" style={{ width: 56, height: 56, fontSize: 20, margin: '0 auto 16px' }}>V</div>
          <div className="badge badge-violet" style={{ marginBottom: '12px' }}>✦ Vishesh is building your path</div>
          <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: '8px' }}>
            {selectedBootcamp?.name || 'AI Engineering'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>30-Day Neural Bootcamp · Personal Learning Path</p>
        </div>

        {/* Initialization steps */}
        <div style={{
          background: 'rgba(12,12,20,0.9)', border: '1px solid var(--border-subtle)',
          borderRadius: '14px', padding: '24px', marginBottom: '28px',
        }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
            INITIALIZING NEURAL PATH
          </div>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '8px 0',
              opacity: doneSteps.includes(i) ? 1 : 0.2,
              transition: 'opacity 0.4s ease, transform 0.3s ease',
              transform: doneSteps.includes(i) ? 'translateX(0)' : 'translateX(-8px)',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: doneSteps.includes(i) ? (i === STEPS.length - 1 ? 'var(--emerald-500)' : 'var(--violet-500)') : 'rgba(139,92,246,0.1)',
                border: `1px solid ${doneSteps.includes(i) ? (i === STEPS.length - 1 ? 'var(--emerald-500)' : 'var(--violet-400)') : 'rgba(139,92,246,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                flexShrink: 0,
                boxShadow: doneSteps.includes(i) ? `0 0 8px ${i === STEPS.length - 1 ? 'var(--emerald-400)' : 'var(--violet-400)'}` : 'none',
              }}>
                {doneSteps.includes(i) ? '✓' : '○'}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: doneSteps.includes(i) ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Learning objectives */}
        {ready && (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
              LEARNING OBJECTIVES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              {OBJECTIVES.map((obj, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                  padding: '16px 20px', borderRadius: '10px',
                  background: obj.milestone ? 'rgba(124,58,237,0.1)' : 'rgba(14,14,22,0.6)',
                  border: `1px solid ${obj.milestone ? 'rgba(124,58,237,0.3)' : 'rgba(139,92,246,0.08)'}`,
                  animation: `fadeInUp 0.4s ease ${i * 80}ms both`,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                    color: obj.milestone ? 'var(--violet-400)' : 'var(--text-muted)',
                    minWidth: '50px', flexShrink: 0, paddingTop: '2px',
                  }}>
                    {obj.day.includes('-') ? `D${obj.day}` : `D${obj.day}`}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px', color: obj.milestone ? 'var(--violet-300)' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{obj.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{obj.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('dashboard')}
              className="btn btn-primary btn-lg"
              id="bootcamp-init-start-btn"
              style={{
                width: '100%', justifyContent: 'center', gap: '12px',
                fontSize: '15px', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em', boxShadow: '0 8px 36px rgba(124,58,237,0.45)',
              }}
            >
              Start Learning Journey →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
