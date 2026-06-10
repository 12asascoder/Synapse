/**
 * LessonAnalytics — "Skill Level Up" results screen
 * Exact match to reference: radar chart, Skill Passport card, Next Objective, Sector Alpha peers
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LessonAnalytics() {
  const { state, navigate } = useApp();
  const { scores, currentDay } = state;
  const [peers, setPeers] = useState([]);
  const [nextTopic, setNextTopic] = useState('');

  useEffect(() => {
    fetch(`${API}/community/leaderboard`)
      .then((r) => r.json())
      .then((data) => setPeers(data.slice(0, 3)))
      .catch(() => {});
    if (state.user?.id) {
      fetch(`${API}/curriculum/${state.user.id}`)
        .then((r) => r.json())
        .then((data) => {
          const next = Array.isArray(data) ? data.find((d) => d.day === currentDay + 1) : null;
          if (next) setNextTopic(next.topic);
        })
        .catch(() => setNextTopic('Distributed Systems'));
    }
  }, [currentDay, state.user?.id]);

  const radarData = [
    { skill: 'Technical', current: scores.technical || 0 },
    { skill: 'Problem\nSolving', current: scores.problemSolving || 0 },
    { skill: 'Communication', current: scores.communication || 0 },
    { skill: 'Consistency', current: scores.consistency || 0 },
    { skill: 'Retention', current: scores.retention || 0 },
    { skill: 'Velocity', current: scores.velocity || 0 },
  ];

  const peersList = peers.length > 0 ? peers.map((p, i) => ({ rank: p.rank || i + 1, name: p.name, tier: p.tier || 'Operative', pts: p.points || 0, highlight: false })) : [];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.25, pointerEvents: 'none' }} />
      <div className="orb orb-violet" style={{ width: 600, height: 600, top: -200, left: '50%', transform: 'translateX(-50%)', opacity: 0.2 }} />

      <div style={{ width: '100%', maxWidth: '920px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInUp 0.5s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 18px', background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px',
            marginBottom: '20px',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-400)', boxShadow: '0 0 8px var(--emerald-400)' }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--emerald-400)' }}>
              SYNAPSE VALIDATION COMPLETE
            </span>
          </div>

          <h1 style={{ fontSize: '52px', fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: '12px' }}>
            Skill Level Up
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
            Neural pathways optimized. Your competency matrix has been successfully updated based on recent assessment vectors.
          </p>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', marginBottom: '20px' }}>

          {/* Competency Radar */}
          <div style={{
            background: 'rgba(12,12,22,0.9)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '16px', padding: '28px',
            animation: 'fadeInUp 0.5s ease 0.1s both',
          }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-display)' }}>Competency Matrix</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>Current assessment state</div>
                </div>
              </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(139,92,246,0.12)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b6b88', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Radar name="Current" dataKey="current" stroke="#22d3ee" fill="rgba(34,211,238,0.15)" strokeWidth={2} dot={{ fill: '#22d3ee', strokeWidth: 0, r: 4 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Passport Verified */}
          <div style={{
            background: 'rgba(12,12,22,0.9)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '16px', padding: '28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '16px', textAlign: 'center',
            animation: 'fadeInUp 0.5s ease 0.2s both',
          }}>
            <div style={{
              fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700,
              letterSpacing: '0.12em', color: 'var(--text-muted)',
            }}>SKILL PASSPORT VERIFIED</div>

            {/* Badge */}
            <div style={{
              width: 100, height: 100, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'float 4s ease-in-out infinite',
            }}>
              {/* Hexagon shape */}
              <svg width="100" height="100" viewBox="0 0 100 100">
                <polygon
                  points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
                  fill="rgba(124,58,237,0.2)" stroke="rgba(124,58,237,0.5)" strokeWidth="1.5"
                />
                <polygon
                  points="50,15 83,32.5 83,67.5 50,85 17,67.5 17,32.5"
                  fill="rgba(124,58,237,0.1)" stroke="rgba(139,92,246,0.3)" strokeWidth="1"
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '4px',
              }}>
                <span style={{ fontSize: '24px' }}>🏆</span>
                <span style={{ fontSize: '14px' }}>★</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                Architect Tier II
              </div>
              <div style={{ fontSize: '12px', color: 'var(--violet-400)', fontFamily: 'var(--font-mono)' }}>
                +500 SYNAPSE Points
              </div>
            </div>

            <button
              onClick={() => navigate('skill-passport')}
              id="analytics-view-matrix-btn"
              style={{
                width: '100%', padding: '12px',
                background: 'transparent',
                border: '1px solid var(--border-active)',
                borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >View Full Matrix</button>
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Next Objective */}
          <div style={{
            background: 'rgba(12,12,22,0.9)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '16px', padding: '28px', position: 'relative', overflow: 'hidden',
            animation: 'fadeInUp 0.5s ease 0.3s both',
          }}>
            <div style={{
              position: 'absolute', bottom: '-20px', right: '-10px',
              fontSize: '120px', fontWeight: 900, color: 'rgba(124,58,237,0.06)',
              fontFamily: 'var(--font-display)', lineHeight: 1, pointerEvents: 'none',
              userSelect: 'none',
            }}>02</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>🚀</span>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--violet-400)', letterSpacing: '0.12em' }}>
                NEXT OBJECTIVE INITIATED
              </div>
            </div>

            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '12px' }}>
              {nextTopic || 'Loading...'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Prepare for tomorrow's session. Focus on the key concepts and review any weak areas from today's assessment.
            </p>

            <button
              onClick={() => navigate('lesson')}
              id="analytics-acknowledge-btn"
              style={{
                padding: '12px 20px',
                background: 'rgba(6,182,212,0.15)',
                border: '1px solid rgba(6,182,212,0.4)',
                borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
                color: 'var(--cyan-400)', letterSpacing: '0.04em',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.25)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(6,182,212,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Acknowledge Directive →
            </button>
          </div>

          {/* Sector Alpha Top Peers */}
          <div style={{
            background: 'rgba(12,12,22,0.9)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '16px', padding: '28px',
            animation: 'fadeInUp 0.5s ease 0.4s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                SECTOR ALPHA TOP PEERS
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px' }}>👥</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {peersList.length === 0 ? <div key="empty" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No peer data available</div> : peersList.map((peer) => (
                <div key={peer.rank || peer.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '10px',
                  background: peer.highlight ? 'rgba(124,58,237,0.12)' : 'rgba(14,14,22,0.5)',
                  border: `1px solid ${peer.highlight ? 'rgba(124,58,237,0.3)' : 'rgba(139,92,246,0.08)'}`,
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: peer.rank === 1 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : peer.highlight ? 'linear-gradient(135deg, var(--violet-700), var(--violet-500))' : 'rgba(139,92,246,0.15)',
                    border: `1px solid ${peer.rank === 1 ? '#f59e0b' : peer.highlight ? 'rgba(124,58,237,0.4)' : 'rgba(139,92,246,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: peer.rank <= 3 ? '14px' : '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                    position: 'relative',
                  }}>
                    {peer.rank <= 3 ? ['🥇', '🥈', '🥉'][peer.rank - 1] : '👤'}
                    <div style={{
                      position: 'absolute', top: -4, left: -4,
                      width: 14, height: 14, borderRadius: '50%',
                      background: 'var(--bg-void)', border: '1px solid var(--border-default)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '8px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                    }}>{peer.rank}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)', color: peer.highlight ? 'var(--violet-300)' : 'var(--text-primary)' }}>
                      {peer.name}
                    </div>
                    <div style={{ fontSize: '11px', color: peer.highlight ? 'var(--violet-400)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{peer.tier}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-mono)', color: peer.highlight ? 'var(--violet-300)' : 'var(--text-secondary)' }}>
                    {peer.pts.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
