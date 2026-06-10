/**
 * Community — Cohorts, leaderboard, challenges, peer learning
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const tabs = ['leaderboard', 'challenges', 'discussions', 'cohorts'];

export default function Community() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/community/leaderboard`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/community/discussions`).then((r) => r.json()).catch(() => []),
    ]).then(([lb, ds]) => {
      setLeaderboard(lb);
      setDiscussions(ds);
    }).finally(() => setLoading(false));
  }, []);

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
                  {loading ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading leaderboard...</div> : leaderboard.map((op, i) => (
                    <div key={op.rank || i} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 24px',
                      background: op.isYou ? 'rgba(124,58,237,0.1)' : i % 2 === 0 ? 'rgba(10,10,18,0.2)' : 'transparent',
                      borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(139,92,246,0.06)' : 'none',
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
                          {op.tier}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-mono)', color: op.isYou ? 'var(--violet-300)' : 'var(--text-secondary)' }}>
                          {op.points?.toLocaleString() || 0}
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
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '14px', background: 'rgba(12,12,22,0.6)', border: '1px solid var(--border-subtle)', borderRadius: '14px' }}>
              Challenges coming soon — powered by real community data.
            </div>
          )}

          {/* DISCUSSIONS */}
          {activeTab === 'discussions' && (
            <div style={{ maxWidth: '720px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {loading ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading discussions...</div> : discussions.map((d, i) => (
                  <div key={d.id || i} style={{
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
                        {(d.User?.name || d.title || '?')[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--violet-300)' }}>{d.User?.name || 'Anonymous'}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>{d.content || d.title}</p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>💬 {d.replies || 0} replies</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>♡ {d.likes || 0}</span>
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
