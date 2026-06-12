/**
 * Community — Cohorts, leaderboard, challenges, peer learning
 * Clean ElevenLabs aesthetic
 */
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import ThemeContainer from '../components/ThemeContainer';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

const tabs = ['leaderboard', 'challenges', 'discussions', 'cohorts'];

export default function Community() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/community/leaderboard`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/community/discussions`).then((r) => r.json()).catch(() => []),
    ]).then(([lb, ds]) => {
      setLeaderboard(lb);
      setDiscussions(ds);
    }).finally(() => setLoading(false));

    const socket = io(WS_URL);
    socket.on('new-discussion', (d) => {
      setDiscussions((prev) => [d, ...prev]);
    });
    return () => { socket.disconnect(); };
  }, []);

  const userRank = leaderboard.findIndex((u) => u.isYou) + 1;
  const totalOperatives = leaderboard.length;
  const tierMap = ['Novice', 'Apprentice', 'Architect I', 'Architect II', 'Architect III', 'Master'];
  const userTier = tierMap[Math.min(Math.floor((state.totalPoints || 0) / 1000), tierMap.length - 1)];

  const submitPost = async () => {
    if (!newPost.trim()) return;
    try {
      const res = await fetch(`${API}/community/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}` },
        body: JSON.stringify({ title: newPost.trim(), content: newPost.trim() }),
      });
      if (res.ok) {
        setDiscussions((prev) => [{ id: Date.now(), title: newPost.trim(), content: newPost.trim(), User: { name: state.user?.name }, createdAt: new Date().toISOString(), replies: 0, likes: 0 }, ...prev]);
        setNewPost('');
      }
    } catch {}
  };

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
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                  <div style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
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
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px', fontWeight: 600 }}>pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Side stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '24px', padding: '32px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase' }}>Your Ranking</div>
                    <div style={{ fontSize: '64px', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#000', lineHeight: 1 }}>{userRank > 0 ? `#${userRank}` : '—'}</div>
                    <div style={{ fontSize: '14px', color: '#6B6B6B', marginTop: '12px' }}>{totalOperatives > 0 ? `of ${totalOperatives} operatives` : 'No data'}</div>
                  </div>
                  {[{ label: 'Points', val: (state.totalPoints || 0).toLocaleString() }, { label: 'Tier', val: userTier }, { label: 'Streak', val: `${state.streak || 0}🔥` }].map((s) => (
                    <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
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
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(d.createdAt).toLocaleDateString()}</span>
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
                  <div style={{ display: 'flex', gap: '16px', padding: '20px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                      {(state.user?.name || 'Y')[0]}
                    </div>
                    <input
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitPost(); } }}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: '#000', fontSize: '15px', outline: 'none' }}
                      placeholder="Share an insight with your cohort..."
                    />
                    <button
                      onClick={submitPost}
                      disabled={!newPost.trim()}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: newPost.trim() ? '#000' : '#ccc', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: newPost.trim() ? 'pointer' : 'not-allowed' }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COHORTS */}
          {activeTab === 'cohorts' && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6B6B6B', fontSize: '15px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>📚</div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Cohorts feature coming soon</div>
              <div style={{ fontSize: '13px' }}>Learning cohorts with peer groups will be available in the next release.</div>
            </div>
          )}
        </div>
          </div>
        </div>

    </ThemeContainer>
  );
}
