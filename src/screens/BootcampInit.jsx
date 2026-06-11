/**
 * BootcampInit — Vishesh generates personalized learning path
 * Clean white aesthetic
 */
import { useState, useEffect } from 'react';
import ThemeContainer from '../components/ThemeContainer';
import { useApp } from '../context/AppContext';

const STEPS = [
  { label: 'Analyzing your background...', delay: 0 },
  { label: 'Mapping skill graph...', delay: 800 },
  { label: 'Building personalized curriculum...', delay: 1600 },
  { label: 'Setting milestone checkpoints...', delay: 2400 },
  { label: 'Calibrating difficulty parameters...', delay: 3200 },
  { label: 'Learning path ready.', delay: 4000 },
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
    { day: '1-7', title: 'Foundation', desc: 'Core concepts, mental models, and vocabulary' },
    { day: '8-14', title: 'Depth', desc: 'Advanced techniques and hands-on application' },
    { day: '15', title: 'Phase 1 Milestone', desc: 'Validation — AI Interview + Assessment', milestone: true },
    { day: '16-22', title: 'Adaptive Phase', desc: 'Personalized based on your performance' },
    { day: '23-29', title: 'Mastery Sprint', desc: 'Real-world projects and simulations' },
    { day: '30', title: 'Final Certification', desc: 'Full validation + career readiness report', milestone: true },
  ];

  return (
    <ThemeContainer>
      <div style={{
        minHeight: '100vh', background: 'transparent',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', overflow: 'hidden',
      }}>

      <div style={{ width: '100%', maxWidth: '640px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInUp 0.5s ease' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '12px', background: '#000', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            margin: '0 auto 16px'
          }}>V</div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px', color: '#000' }}>
            {selectedBootcamp?.name || 'AI Engineering'}
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: '14px' }}>30-Day Personalized Learning Path</p>
        </div>

        {/* Initialization steps */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E8E6E3',
          borderRadius: '16px', padding: '32px', marginBottom: '32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#A59F97', letterSpacing: '0.05em', marginBottom: '24px', textTransform: 'uppercase' }}>
            Setup Progress
          </div>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '8px 0',
              opacity: doneSteps.includes(i) ? 1 : 0.3,
              transition: 'opacity 0.4s ease, transform 0.3s ease',
              transform: doneSteps.includes(i) ? 'translateX(0)' : 'translateX(-8px)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: doneSteps.includes(i) ? '#000' : '#F5F3F1',
                border: `1px solid ${doneSteps.includes(i) ? '#000' : '#E8E6E3'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                color: doneSteps.includes(i) ? '#fff' : 'transparent',
                flexShrink: 0,
              }}>
                ✓
              </div>
              <span style={{ fontSize: '14px', color: doneSteps.includes(i) ? '#000' : '#6B6B6B', fontWeight: doneSteps.includes(i) ? 500 : 400 }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Learning objectives */}
        {ready && (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#A59F97', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' }}>
              Curriculum Outline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              {OBJECTIVES.map((obj, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '20px', alignItems: 'flex-start',
                  padding: '20px 24px', borderRadius: '12px',
                  background: obj.milestone ? '#F9F8F7' : '#FFFFFF',
                  border: `1px solid ${obj.milestone ? '#000' : '#E8E6E3'}`,
                  animation: `fadeInUp 0.4s ease ${i * 80}ms both`,
                }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 700,
                    color: obj.milestone ? '#000' : '#A59F97',
                    minWidth: '40px', flexShrink: 0, paddingTop: '2px',
                  }}>
                    {obj.day.includes('-') ? `D${obj.day}` : `D${obj.day}`}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px', color: '#000' }}>
                      {obj.milestone && '★ '}{obj.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B6B6B' }}>{obj.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('dashboard')}
              className="btn btn-primary"
              id="bootcamp-init-start-btn"
              style={{
                width: '100%', justifyContent: 'center',
                padding: '16px', fontSize: '15px', fontWeight: 600,
                borderRadius: '12px'
              }}
            >
              Start Learning →
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
    </ThemeContainer>
  );
}
