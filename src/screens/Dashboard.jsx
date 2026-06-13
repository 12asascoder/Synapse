import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ScoreRing({ value, label, color = '#0D6EFD', size = 80 }) {
  const radius = (size - 10) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border-subtle)" strokeWidth="6" fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth="6" fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)'
        }}>{value}</div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { state, navigate } = useApp();
  const { currentDay, streak, scores, progressHistory } = state;
  const [visheshInsight, setVisheshInsight] = useState('');

  useEffect(() => {
    if (!state.user?.id) return;
    fetch(`${API}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Brief insight for Day ${currentDay} student, one sentence.`, contextHistory: [] }),
    })
      .then((r) => r.json())
      .then((data) => setVisheshInsight(data.response))
      .catch(() => {});
  }, [state.user?.id, currentDay]);

  const radarData = [
    { skill: 'Technical', value: scores.technical || 0, full: 100 },
    { skill: 'Problem\nSolving', value: scores.problemSolving || 0, full: 100 },
    { skill: 'Communication', value: scores.communication || 0, full: 100 },
    { skill: 'Consistency', value: scores.consistency || 0, full: 100 },
    { skill: 'Retention', value: scores.retention || 0, full: 100 },
    { skill: 'Velocity', value: scores.velocity || 0, full: 100 },
  ];

  const progressData = progressHistory?.length > 0 ? progressHistory : [{ day: 1, score: 0 }];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', color: 'var(--text-primary)' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          height: '64px', background: 'rgba(10,10,12,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', padding: '0 32px',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>SYNAPSE</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => navigate('hub')} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: '#f3f2ee', cursor: 'pointer',
                fontSize: '14px', fontWeight: 500,
                padding: '8px 16px', borderRadius: '8px',
              }}>Hub</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('lesson')}
              className="btn btn-primary"
              style={{
                padding: '8px 20px', fontSize: '14px',
                background: 'var(--border-active)', color: 'var(--bg-base)',
                border: 'none', fontWeight: 700, borderRadius: '8px', cursor: 'pointer'
              }}
            >
              Launch Session
            </button>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', color: 'var(--text-primary)' }}>👤</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="scroll-area">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-active)', borderRadius: '20px', padding: '32px',
                  boxShadow: '0 8px 24px rgba(207,255,0,0.03)'
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-accent)', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>TODAY'S MISSION</div>
                    <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Day {currentDay}
                    </h2>
                  </div>
                  <div style={{ textAlign: 'right', background: 'rgba(207,255,0,0.08)', padding: '12px 16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-accent)', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase' }}>STREAK</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>🔥 {streak}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: 'Current Day', value: currentDay },
                    { label: 'Lessons Done', value: state.completedLessons.length },
                    { label: 'Growth Score', value: `${state.growthScore}%` },
                  ].map((s) => (
                    <div key={s.label} style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.value}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('lesson')}
                  className="btn btn-primary"
                  id="dashboard-continue-btn"
                  style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '15px', borderRadius: '10px', background: 'var(--border-active)', color: 'var(--bg-base)', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Continue Day {currentDay} →
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '32px' }}>
                <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '24px' }}>Growth Trajectory</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0D6EFD" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#0D6EFD" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-primary)' }} />
                    <Area type="monotone" dataKey="score" stroke="#0D6EFD" fill="url(#scoreGrad)" strokeWidth={2} dot={{ fill: '#0D6EFD', strokeWidth: 0, r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '20px', padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--border-active)', color: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>V</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>VISHESH INSIGHTS</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Analysis</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, borderLeft: '3px solid var(--border-active)', paddingLeft: '16px' }}>
                  {visheshInsight || 'Analyzing your progress and calibrating next steps...'}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '24px', textTransform: 'uppercase' }}>Skill Matrix</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', justifyItems: 'center' }}>
                  <ScoreRing value={scores.technical || 72} label="Technical" color="#0D6EFD" size={72} />
                  <ScoreRing value={scores.communication || 81} label="Comms" color="#22d3ee" size={72} />
                  <ScoreRing value={scores.problemSolving || 68} label="Problem" color="#a78bfa" size={72} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '20px', textTransform: 'uppercase' }}>Competency Radar</div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border-subtle)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <Radar name="Score" dataKey="value" stroke="#0D6EFD" fill="#0D6EFD" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#0D6EFD', strokeWidth: 0, r: 4 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' }}>Career Readiness</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
                    {Math.min(90, 40 + currentDay * 1.8 + (scores.technical || 72) * 0.3) | 0}%
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>On Track</div>
                    <div className="progress-bar" style={{ height: '6px', background: 'rgba(243,242,238,0.1)' }}>
                      <div style={{ height: '100%', background: 'var(--border-active)', borderRadius: '3px', width: `${Math.min(90, 40 + currentDay * 1.8) | 0}%`, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
