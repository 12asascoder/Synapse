/**
 * LessonAnalytics — "Skill Level Up" results screen
 * Clean ElevenLabs aesthetic
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
      minHeight: '100vh', background: '#FDFCFC', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>

      <div style={{ width: '100%', maxWidth: '1000px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeInUp 0.5s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 20px', background: '#FFFFFF',
            border: '1px solid #E8E6E3', borderRadius: '24px',
            marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#000' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: '#000', textTransform: 'uppercase' }}>
              Validation Complete
            </span>
          </div>

          <h1 style={{ fontSize: '56px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px', color: '#000', letterSpacing: '-0.02em' }}>
            Skill Level Up
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Your competency matrix has been successfully updated based on recent assessment vectors.
          </p>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginBottom: '24px' }}>

          {/* Competency Radar */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '36px',
            animation: 'fadeInUp 0.5s ease 0.1s both',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '20px', color: '#000' }}>Competency Matrix</div>
                  <div style={{ fontSize: '13px', color: '#6B6B6B', marginTop: '4px' }}>Current assessment state</div>
                </div>
              </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E8E6E3" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#6B6B6B', fontSize: 12 }} />
                <Radar name="Current" dataKey="current" stroke="#000" fill="#000" fillOpacity={0.05} strokeWidth={2} dot={{ fill: '#000', strokeWidth: 0, r: 4 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Passport Verified */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '36px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '24px', textAlign: 'center',
            animation: 'fadeInUp 0.5s ease 0.2s both',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.05em', color: '#A59F97', textTransform: 'uppercase'
            }}>Skill Passport Verified</div>

            {/* Badge */}
            <div style={{
              width: 120, height: 120, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'float 4s ease-in-out infinite',
              background: '#FDFCFC', border: '1px solid #E8E6E3', borderRadius: '50%',
              boxShadow: '0 12px 32px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                position: 'absolute', inset: 8, borderRadius: '50%', background: '#F5F3F1',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '32px' }}>🏆</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>
                Architect Tier II
              </div>
              <div style={{ fontSize: '14px', color: '#000', fontWeight: 600, padding: '6px 16px', background: '#F5F3F1', borderRadius: '20px', display: 'inline-block' }}>
                +500 Points
              </div>
            </div>

            <button
              onClick={() => navigate('skill-passport')}
              id="analytics-view-matrix-btn"
              className="btn"
              style={{
                width: '100%', padding: '14px',
                background: '#FDFCFC',
                border: '1px solid #E8E6E3',
                borderRadius: '12px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 600,
                color: '#000',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F3F1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FDFCFC'; }}
            >View Full Matrix</button>
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Next Objective */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '36px', position: 'relative', overflow: 'hidden',
            animation: 'fadeInUp 0.5s ease 0.3s both',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              position: 'absolute', bottom: '-10px', right: '10px',
              fontSize: '140px', fontWeight: 700, color: '#F5F3F1',
              fontFamily: 'var(--font-display)', lineHeight: 1, pointerEvents: 'none',
              userSelect: 'none', zIndex: 0
            }}>02</div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '20px' }}>🚀</span>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#A59F97', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Next Objective Initiated
                </div>
              </div>

              <h3 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px', color: '#000' }}>
                {nextTopic || 'Loading...'}
              </h3>
              <p style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: 1.6, marginBottom: '32px', maxWidth: '80%' }}>
                Prepare for tomorrow's session. Focus on the key concepts and review any weak areas from today's assessment.
              </p>

              <button
                onClick={() => navigate('lesson')}
                id="analytics-acknowledge-btn"
                className="btn btn-primary"
                style={{
                  padding: '14px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}
              >
                Acknowledge Directive →
              </button>
            </div>
          </div>

          {/* Sector Alpha Top Peers */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '36px',
            animation: 'fadeInUp 0.5s ease 0.4s both',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: '#A59F97', textTransform: 'uppercase' }}>
                Top Peers
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', fontSize: '20px' }}>👥</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {peersList.length === 0 ? <div key="empty" style={{ padding: '20px', textAlign: 'center', color: '#6B6B6B', fontSize: '14px' }}>No peer data available</div> : peersList.map((peer) => (
                <div key={peer.rank || peer.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px', borderRadius: '12px',
                  background: peer.highlight ? '#F5F3F1' : '#FDFCFC',
                  border: `1px solid ${peer.highlight ? '#000' : '#E8E6E3'}`,
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: peer.rank === 1 ? '#FFFBEB' : peer.highlight ? '#000' : '#F5F3F1',
                    border: `1px solid ${peer.rank === 1 ? '#FDE68A' : peer.highlight ? '#000' : '#E8E6E3'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: peer.rank <= 3 ? '16px' : '12px', fontWeight: 700,
                    position: 'relative',
                  }}>
                    {peer.rank <= 3 ? ['🥇', '🥈', '🥉'][peer.rank - 1] : '👤'}
                    <div style={{
                      position: 'absolute', top: -4, left: -4,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#FFFFFF', border: '1px solid #E8E6E3',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', fontWeight: 700, color: '#6B6B6B',
                    }}>{peer.rank}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#000', marginBottom: '2px' }}>
                      {peer.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{peer.tier}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#000' }}>
                    {peer.pts.toLocaleString()} <span style={{ fontSize: '11px', color: '#A59F97', fontWeight: 600 }}>PTS</span>
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
