/**
 * Community — Cohorts, leaderboard, challenges, peer learning
 */
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';

const LEADERBOARD = [
  { rank: 1, name: 'Operative_Kyla', bootcamp: 'AI Engineering', pts: 9420, tier: 'Architect III', streak: 22 },
  { rank: 2, name: 'J_Vance_Sys', bootcamp: 'Backend Engineering', pts: 8890, tier: 'Architect II', streak: 18 },
  { rank: 3, name: 'Priya_Neural', bootcamp: 'Data Science', pts: 8240, tier: 'Architect II', streak: 15 },
  { rank: 4, name: 'MarcusX', bootcamp: 'AI Engineering', pts: 7680, tier: 'Architect I', streak: 12 },
  { rank: 5, name: 'Zara_Dev', bootcamp: 'Frontend Engineering', pts: 7120, tier: 'Architect I', streak: 10 },
  { rank: 14, name: 'You', bootcamp: 'AI Engineering', pts: 4150, tier: 'Architect II', streak: 7, isYou: true },
];

const CHALLENGES = [
  { id: 1, title: 'Weekly Neural Challenge', desc: 'Implement a transformer attention mechanism from scratch', difficulty: 'Hard', participants: 234, reward: '+200 pts', deadline: '2 days', color: '#7c3aed' },
  { id: 2, title: 'Speed Coding Sprint', desc: 'Solve 5 algorithmic problems in under 30 minutes', difficulty: 'Medium', participants: 412, reward: '+150 pts', deadline: '5 days', color: '#06b6d4' },
  { id: 3, title: 'Case Study Analysis', desc: 'Analyze the OpenAI GPT-4 architecture paper and present key findings', difficulty: 'Medium', participants: 156, reward: '+120 pts', deadline: '1 week', color: '#10b981' },
];

const DISCUSSIONS = [
  { user: 'Operative_Kyla', time: '2h ago', msg: 'Anyone else finding the LoRA fine-tuning section particularly dense? Happy to break it down.', replies: 8, likes: 24 },
  { user: 'MarcusX', time: '4h ago', msg: 'Just passed Day 15 milestone with 89%! The oral validation with Vishesh was intense but fair.', replies: 15, likes: 42 },
  { user: 'Zara_Dev', time: '6h ago', msg: 'Vishesh caught something in my code that I\'d been missing for 3 days. The AI evaluation is genuinely impressive.', replies: 6, likes: 31 },
];

export default function Community() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('leaderboard');

  const tabs = ['leaderboard', 'challenges', 'discussions', 'cohorts'];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-area">
        <div style={{ padding: '32px', maxWidth: '1100px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px', animation: 'fadeInUp 0.3s ease' }}>
            <div className="badge badge-violet" style={{ marginBottom: '10px' }}>⌘ Neural Network</div>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 900 }}>Sector Alpha Community</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              2,847 operatives active · 14 cohorts running
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'rgba(10,10,18,0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
                background: activeTab === t ? 'rgba(124,58,237,0.25)' : 'transparent',
                border: activeTab === t ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                color: activeTab === t ? 'var(--violet-300)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: activeTab === t ? 700 : 400,
                textTransform: 'capitalize', transition: 'all 0.15s ease',
              }}>{t}</button>
            ))}
          </div>

          {/* LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
                <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)' }}>Sector Alpha Rankings</div>
                    <span className="badge badge-violet">LIVE</span>
                  </div>
                  {LEADERBOARD.map((op, i) => (
                    <div key={op.rank} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 24px',
                      background: op.isYou ? 'rgba(124,58,237,0.1)' : i % 2 === 0 ? 'rgba(10,10,18,0.2)' : 'transparent',
                      borderBottom: i < LEADERBOARD.length - 1 ? '1px solid rgba(139,92,246,0.06)' : 'none',
                      borderLeft: op.isYou ? '3px solid var(--violet-500)' : '3px solid transparent',
                      transition: 'background 0.15s ease',
                      animation: `fadeInUp 0.3s ease ${i * 60}ms both`,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                        background: op.rank <= 3 ? ['linear-gradient(135deg,#f59e0b,#fbbf24)', 'linear-gradient(135deg,#94a3b8,#cbd5e1)', 'linear-gradient(135deg,#b45309,#d97706)'][op.rank - 1] : 'rgba(139,92,246,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)',
                        color: op.rank <= 3 ? 'white' : 'var(--text-muted)',
                      }}>{op.rank}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)', color: op.isYou ? 'var(--violet-300)' : 'var(--text-primary)' }}>
                          {op.name} {op.isYou && <span style={{ fontSize: '10px', color: 'var(--violet-400)' }}>(you)</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          {op.bootcamp} · {op.tier}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--amber-400)', fontFamily: 'var(--font-mono)' }}>🔥{op.streak}</div>
                        <div style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-mono)', color: op.isYou ? 'var(--violet-300)' : 'var(--text-secondary)' }}>
                          {op.pts.toLocaleString()}
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '3px' }}>pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Side stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>YOUR RANKING</div>
                    <div style={{ fontSize: '52px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--violet-400)', lineHeight: 1 }}>#14</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>of 2,847 operatives</div>
                    <div style={{ marginTop: '16px', padding: '10px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--violet-400)', fontFamily: 'var(--font-mono)' }}>+2,730 to reach #12</div>
                    </div>
                  </div>
                  {[{ label: 'Points', val: '4,150' }, { label: 'Tier', val: 'Architect II' }, { label: 'Streak', val: `${state.streak}🔥` }].map((s) => (
                    <div key={s.label} style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHALLENGES */}
          {activeTab === 'challenges' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
              {CHALLENGES.map((c, i) => (
                <div key={c.id} style={{
                  background: 'rgba(12,12,22,0.9)', border: `1px solid ${c.color}22`,
                  borderRadius: '14px', padding: '24px', animation: `fadeInUp 0.4s ease ${i * 80}ms both`,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${c.color}44`; e.currentTarget.style.boxShadow = `0 0 20px ${c.color}18`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${c.color}22`; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', padding: '3px 10px', background: `${c.color}18`, border: `1px solid ${c.color}33`, borderRadius: '4px', color: c.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.difficulty.toUpperCase()}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Ends in {c.deadline}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>{c.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>{c.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>👥 {c.participants} joined</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)' }}>{c.reward}</span>
                      <button style={{ padding: '7px 16px', background: `${c.color}18`, border: `1px solid ${c.color}44`, borderRadius: '7px', cursor: 'pointer', color: c.color, fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, transition: 'all 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${c.color}28`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = `${c.color}18`; }}
                      >Join →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DISCUSSIONS */}
          {activeTab === 'discussions' && (
            <div style={{ maxWidth: '720px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {DISCUSSIONS.map((d, i) => (
                  <div key={i} style={{
                    background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)',
                    borderRadius: '14px', padding: '20px',
                    animation: `fadeInUp 0.3s ease ${i * 80}ms both`,
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, border: '1px solid rgba(124,58,237,0.3)' }}>
                        {d.user[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--violet-300)' }}>{d.user}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.time}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>{d.msg}</p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>💬 {d.replies} replies</button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>♡ {d.likes}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', padding: '16px 20px', background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                      {(state.user?.name || 'Y')[0]}
                    </div>
                    <input style={{ flex: 1, background: 'rgba(14,14,22,0.6)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none' }} placeholder="Share an insight with your cohort..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COHORTS */}
          {activeTab === 'cohorts' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
              {['AI Engineering · Cohort 7', 'Backend Engineering · Cohort 3', 'Data Science · Cohort 5', 'Product Management · Cohort 2'].map((c, i) => (
                <div key={c} style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px', animation: `fadeInUp 0.4s ease ${i * 80}ms both`, cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '14px' }}>
                    {['🧠', '⚙', '📊', '🎯'][i]}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>{c}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>{[24, 18, 31, 12][i]} members · Active</div>
                  <button style={{ width: '100%', padding: '9px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '7px', cursor: 'pointer', color: 'var(--violet-300)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s ease' }}>
                    View Cohort →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
