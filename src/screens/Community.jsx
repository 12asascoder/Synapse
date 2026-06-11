/**
 * Community — Cohorts, leaderboard, challenges, peer learning
 * Clean ElevenLabs aesthetic
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
    <ThemeContainer>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-area">
          <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '40px', animation: 'fadeInUp 0.3s ease' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', background: '#F5F3F1',
              border: '1px solid #E8E6E3', borderRadius: '8px',
              marginBottom: '16px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#000' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#000', textTransform: 'uppercase' }}>
                Neural Network
              </span>
            </div>
            <h1 style={{ fontSize: '40px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#000', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Sector Alpha Community
            </h1>
            <p style={{ color: '#6B6B6B', fontSize: '15px' }}>
              2,847 operatives active · 14 cohorts running
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: '#F5F3F1', border: '1px solid #E8E6E3', borderRadius: '12px', padding: '6px', width: 'fit-content' }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
                background: activeTab === t ? '#FFFFFF' : 'transparent',
                border: 'none',
                color: activeTab === t ? '#000' : '#6B6B6B',
                fontSize: '13px', fontWeight: activeTab === t ? 600 : 500,
                textTransform: 'capitalize', transition: 'all 0.15s ease',
                boxShadow: activeTab === t ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
              }}>{t}</button>
            ))}
          </div>

          {/* LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
                <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                  <div style={{ background: '#010203', borderBottom: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', fontFamily: 'var(--font-display)', color: '#000' }}>Sector Alpha Rankings</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', background: '#F5F3F1', borderRadius: '6px', color: '#000', letterSpacing: '0.05em' }}>LIVE</span>
                  </div>
                  {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#6B6B6B', fontSize: '14px' }}>Loading leaderboard...</div> : leaderboard.map((op, i) => (
                    <div key={op.rank || i} style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '20px 24px',
                      background: op.isYou ? '#F5F3F1' : i % 2 === 0 ? '#FDFCFC' : '#FFFFFF',
                      borderBottom: i < leaderboard.length - 1 ? '1px solid #E8E6E3' : 'none',
                      borderLeft: op.isYou ? '4px solid #000' : '4px solid transparent',
                      transition: 'background 0.15s ease',
                      animation: `fadeInUp 0.3s ease ${i * 60}ms both`,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                        background: op.rank === 1 ? '#FFFBEB' : op.isYou ? '#000' : '#F5F3F1',
                        border: `1px solid ${op.rank === 1 ? '#FDE68A' : op.isYou ? '#000' : '#E8E6E3'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '14px',
                        color: op.rank === 1 ? '#D97706' : op.isYou ? '#FFFFFF' : '#6B6B6B',
                      }}>{op.rank}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#000', marginBottom: '2px' }}>
                          {op.name} {op.isYou && <span style={{ fontSize: '11px', color: '#6B6B6B', fontWeight: 500 }}>(you)</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B6B6B' }}>
                          {op.tier}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#000' }}>
                          {op.points?.toLocaleString() || 0}
                          <span style={{ fontSize: '11px', color: '#A59F97', marginLeft: '4px', fontWeight: 600 }}>pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Side stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', padding: '32px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#A59F97', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' }}>Your Ranking</div>
                    <div style={{ fontSize: '64px', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#000', lineHeight: 1 }}>#14</div>
                    <div style={{ fontSize: '14px', color: '#6B6B6B', marginTop: '12px' }}>of 2,847 operatives</div>
                    <div style={{ marginTop: '24px', padding: '12px', background: '#F5F3F1', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#000', fontWeight: 600 }}>+2,730 to reach #12</div>
                    </div>
                  </div>
                  {[{ label: 'Points', val: '4,150' }, { label: 'Tier', val: 'Architect II' }, { label: 'Streak', val: `${state.streak}🔥` }].map((s) => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                      <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: 500 }}>{s.label}</span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHALLENGES */}
          {activeTab === 'challenges' && (
            <div style={{ padding: '80px', textAlign: 'center', color: '#6B6B6B', fontSize: '15px', background: '#FFFFFF', border: '1px solid #E8E6E3', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              Challenges coming soon — powered by real community data.
            </div>
          )}

          {/* DISCUSSIONS */}
          {activeTab === 'discussions' && (
            <div style={{ maxWidth: '800px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#6B6B6B', fontSize: '14px' }}>Loading discussions...</div> : discussions.map((d, i) => (
                  <div key={d.id || i} style={{
                    background: '#FFFFFF', border: '1px solid #E8E6E3',
                    borderRadius: '24px', padding: '24px',
                    animation: `fadeInUp 0.3s ease ${i * 80}ms both`,
                    transition: 'border-color 0.15s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E6E3'; }}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '16px', background: '#F5F3F1', border: '1px solid #DCDCDC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, flexShrink: 0, color: '#000' }}>
                        {(d.User?.name || d.title || '?')[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: '#000' }}>{d.User?.name || 'Anonymous'}</span>
                          <span style={{ fontSize: '12px', color: '#A59F97' }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '15px', color: '#44403B', lineHeight: 1.6, marginBottom: '20px' }}>{d.content || d.title}</p>
                        <div style={{ display: 'flex', gap: '24px' }}>
                          <span style={{ color: '#6B6B6B', fontSize: '13px', fontWeight: 500 }}>💬 {d.replies || 0} replies</span>
                          <span style={{ color: '#6B6B6B', fontSize: '13px', fontWeight: 500 }}>♡ {d.likes || 0} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', padding: '20px 24px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                      {(state.user?.name || 'Y')[0]}
                    </div>
                    <input style={{ flex: 1, background: 'transparent', border: 'none', color: '#f3f2ee', fontSize: '15px', outline: 'none' }} placeholder="Share an insight with your cohort..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COHORTS */}
          {activeTab === 'cohorts' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
              {['AI Engineering · Cohort 7', 'Backend Engineering · Cohort 3', 'Data Science · Cohort 5', 'Product Management · Cohort 2'].map((c, i) => (
                <div key={c} style={{ background: '#FFFFFF', border: '1px solid #E8E6E3', borderRadius: '24px', padding: '32px', animation: `fadeInUp 0.4s ease ${i * 80}ms both`, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8E6E3'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: '16px', background: '#F5F3F1', border: '1px solid #E8E6E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '20px' }}>
                    {['🧠', '⚙', '📊', '🎯'][i]}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: '#000' }}>{c}</div>
                  <div style={{ fontSize: '13px', color: '#6B6B6B', marginBottom: '24px' }}>{[24, 18, 31, 12][i]} members · Active</div>
                  <button className="btn" style={{ width: '100%', padding: '12px', background: '#FDFCFC', border: '1px solid #E8E6E3', borderRadius: '10px', cursor: 'pointer', color: '#000', fontSize: '14px', fontWeight: 600, transition: 'all 0.15s ease' }}>
                    View Cohort →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        </div>

    </ThemeContainer>
  );
}
