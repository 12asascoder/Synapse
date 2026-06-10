/**
 * Dashboard — Core Feed / Main Dashboard
 * Today's mission, progress, Vishesh insights panel
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ScoreRing({ value, label, color = 'var(--violet-400)', size = 80 }) {
  const radius = (size - 10) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(139,92,246,0.1)" strokeWidth="6" fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth="6" fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px',
        }}>{value}</div>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { state, navigate } = useApp();
  const { selectedBootcamp, currentDay, streak, scores, totalPoints, progressHistory } = state;
  const [milestones, setMilestones] = useState([]);
  const [visheshInsight, setVisheshInsight] = useState('');

  useEffect(() => {
    if (!state.user?.id) return;
    fetch(`${API}/curriculum/${state.user.id}`)
      .then((r) => r.json())
      .then((data) => {
        const keyMilestones = data.filter((d) => d.day % 7 === 1 || d.day === 15 || d.day === 30 || d.contentType === 'assessment');
        setMilestones(keyMilestones.slice(0, 6));
      })
      .catch(() => {});
    fetch(`${API}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Brief insight for Day ${currentDay} student, one sentence.`, contextHistory: [] }),
    })
      .then((r) => r.json())
      .then((data) => setVisheshInsight(data.response))
      .catch(() => setVisheshInsight('Your consistency is exceptional. Keep pushing forward.'));
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
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: '52px', background: 'rgba(5,5,8,0.95)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', padding: '0 28px',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.02em' }}>SYNAPSE</div>
            {['Curriculum', 'Network', 'Simulations'].map((item, i) => (
              <button key={item} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '13px',
                color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '0 14px', height: '52px',
                borderBottom: i === 0 ? '2px solid var(--violet-500)' : '2px solid transparent',
              }}>{item}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('lesson')} className="btn btn-primary btn-sm" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              Launch Neural Link
            </button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer' }}>👤</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }} className="scroll-area">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', maxWidth: '1200px' }}>

            {/* LEFT — Main content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Today's Mission */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
                border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px',
                animation: 'fadeInUp 0.4s ease both',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--violet-400)', letterSpacing: '0.1em', marginBottom: '4px' }}>TODAY'S MISSION</div>
                    <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                      Day {currentDay} — {selectedBootcamp?.name || 'AI Engineering'}
                    </h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>STREAK</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--amber-400)' }}>🔥 {streak}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'Current Day', value: `${currentDay}/30`, color: 'var(--violet-400)' },
                    { label: 'Lessons Done', value: state.completedLessons.length, color: 'var(--cyan-400)' },
                    { label: 'Growth Score', value: `${state.growthScore}%`, color: 'var(--emerald-400)' },
                  ].map((s) => (
                    <div key={s.label} style={{ background: 'rgba(10,10,20,0.5)', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Journey Progress</span>
                    <span style={{ fontSize: '11px', color: 'var(--violet-300)', fontFamily: 'var(--font-mono)' }}>{Math.round((currentDay / 30) * 100)}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${(currentDay / 30) * 100}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => navigate('lesson')}
                  className="btn btn-primary"
                  id="dashboard-continue-btn"
                  style={{ gap: '10px', boxShadow: '0 6px 28px rgba(124,58,237,0.4)', fontFamily: 'var(--font-mono)' }}
                >
                  Continue Day {currentDay} →
                </button>
              </div>

              {/* Learning Path Timeline */}
              <div className="card" style={{ animation: 'fadeInUp 0.5s ease 0.1s both' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Learning Path</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {(milestones.length > 0 ? milestones : []).map((item, i) => {
                    const day = item.day;
                    const isActive = day === currentDay;
                    const isDone = day < currentDay;
                    const isMilestone = item.contentType === 'assessment';
                    return (
                      <div key={day} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '20px', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: isDone ? 'var(--emerald-500)' : isActive ? 'var(--violet-500)' : isMilestone ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.1)',
                            border: `2px solid ${isDone ? 'var(--emerald-500)' : isActive ? 'var(--violet-400)' : isMilestone ? 'var(--amber-400)' : 'var(--border-subtle)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, color: 'white',
                            boxShadow: isActive ? '0 0 12px rgba(124,58,237,0.5)' : 'none',
                          }}>
                            {isDone ? '✓' : isActive ? '▶' : isMilestone ? '★' : '○'}
                          </div>
                          {i < milestones.length - 1 && <div style={{ width: 2, flex: 1, minHeight: '20px', background: isDone ? 'var(--emerald-500)' : 'rgba(139,92,246,0.2)', marginTop: '4px' }} />}
                        </div>
                        <div style={{ paddingTop: '4px' }}>
                          <div style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            Day {day} — {item.topic}
                          </div>
                          {isActive && <div style={{ fontSize: '11px', color: 'var(--violet-400)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>● Currently Active</div>}
                          {isMilestone && <div style={{ fontSize: '11px', color: 'var(--amber-400)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>★ Major Validation</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Growth chart */}
              <div className="card" style={{ animation: 'fadeInUp 0.5s ease 0.2s both' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Growth Trajectory</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: '#6b6b88', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#6b6b88', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#12121d', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="score" stroke="#7c3aed" fill="url(#scoreGrad)" strokeWidth={2} dot={{ fill: '#7c3aed', strokeWidth: 0, r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT — Vishesh Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Vishesh panel */}
              <div style={{
                background: 'rgba(14,14,26,0.9)', border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '14px', padding: '20px',
                animation: 'fadeInUp 0.4s ease 0.1s both',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div className="vishesh-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>V</div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--violet-300)' }}>VISHESH INSIGHTS</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Real-time analysis</div>
                  </div>
                  <div className="dot-live" style={{ marginLeft: 'auto' }} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, borderLeft: '2px solid var(--violet-500)', paddingLeft: '12px' }}>
                  {visheshInsight || 'Analyzing your progress...'}
                </div>
              </div>

              {/* Score rings */}
              <div style={{ background: 'rgba(14,14,26,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px', animation: 'fadeInUp 0.4s ease 0.2s both' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>SKILL MATRIX</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', justifyItems: 'center' }}>
                  <ScoreRing value={scores.technical || 72} label="Technical" color="var(--violet-400)" size={72} />
                  <ScoreRing value={scores.communication || 81} label="Comms" color="var(--cyan-400)" size={72} />
                  <ScoreRing value={scores.problemSolving || 68} label="Problem\nSolving" color="var(--emerald-400)" size={72} />
                </div>
              </div>

              {/* Radar chart */}
              <div style={{ background: 'rgba(14,14,26,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px', animation: 'fadeInUp 0.4s ease 0.3s both' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>COMPETENCY RADAR</div>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(139,92,246,0.15)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b6b88', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                    <Radar name="Score" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={1.5} dot={{ fill: '#22d3ee', strokeWidth: 0, r: 3 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Current Readiness */}
              <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '14px', padding: '20px', animation: 'fadeInUp 0.4s ease 0.4s both' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px' }}>CAREER READINESS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--emerald-400)' }}>
                    {Math.min(90, 40 + currentDay * 1.8 + (scores.technical || 72) * 0.3) | 0}%
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>Growing Fast</div>
                    <div className="progress-bar" style={{ height: '4px' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--emerald-500), var(--cyan-400))', borderRadius: '2px', width: `${Math.min(90, 40 + currentDay * 1.8) | 0}%`, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
