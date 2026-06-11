/**
 * SkillPassport — Professional verified profile with skill graph,
 * achievements, recruiter view, and public share link
 * Hackorizon Dark Aesthetic Design
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ICON_MAP = { Footprints: '🔥', Flame: '⚡', Trophy: '🎯', Flag: '🧠', GraduationCap: '🏆', Zap: '★', Star: '✦', MessageCircle: '💬' };

export default function SkillPassport() {
  const { state } = useApp();
  const { user, selectedBootcamp, scores, totalPoints, currentDay } = state;
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const shareUrl = `synapse.ai/passport/${user?.name?.toLowerCase().replace(/\s/g, '-') || 'operative'}`;

  useEffect(() => {
    fetch(`${API}/achievements`)
      .then((r) => r.json())
      .then((data) => setAchievements(data))
      .catch(() => {});
    if (user?.id) {
      fetch(`${API}/achievements/user/${user.id}`)
        .then((r) => r.json())
        .then((data) => setUserAchievements(data.map((ua) => ua.achievementId)))
        .catch(() => {});
    }
  }, [user?.id]);

  const verifiedSkills = [
    { skill: 'Technical', level: scores.technical > 70 ? 'Advanced' : scores.technical > 40 ? 'Intermediate' : 'Beginner', verified: scores.technical > 0, score: scores.technical || 0 },
    { skill: 'Problem Solving', level: scores.problemSolving > 70 ? 'Advanced' : scores.problemSolving > 40 ? 'Intermediate' : 'Beginner', verified: scores.problemSolving > 0, score: scores.problemSolving || 0 },
    { skill: 'Communication', level: scores.communication > 70 ? 'Advanced' : scores.communication > 40 ? 'Intermediate' : 'Beginner', verified: scores.communication > 0, score: scores.communication || 0 },
    { skill: 'Consistency', level: scores.consistency > 70 ? 'Advanced' : scores.consistency > 40 ? 'Intermediate' : 'Beginner', verified: scores.consistency > 0, score: scores.consistency || 0 },
    { skill: 'Retention', level: scores.retention > 70 ? 'Advanced' : scores.retention > 40 ? 'Intermediate' : 'Beginner', verified: scores.retention > 0, score: scores.retention || 0 },
    { skill: 'Velocity', level: scores.velocity > 70 ? 'Advanced' : scores.velocity > 40 ? 'Intermediate' : 'Beginner', verified: scores.velocity > 0, score: scores.velocity || 0 },
  ].filter((s) => s.score > 0);

  const radarData = [
    { skill: 'System Arch', value: scores.technical || 0 },
    { skill: 'Algorithms', value: scores.problemSolving || 0 },
    { skill: 'Data Structs', value: scores.consistency || 0 },
    { skill: 'Security', value: scores.retention || 0 },
    { skill: 'DevOps', value: scores.velocity || 0 },
    { skill: 'AI/ML', value: scores.communication || 0 },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'transparent', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-area">
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '40px', animation: 'fadeInUp 0.4s ease' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', background: 'rgba(207,255,0,0.08)',
              border: '1px solid var(--border-subtle)', borderRadius: '8px',
              marginBottom: '16px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border-active)' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-accent)', textTransform: 'uppercase' }}>
                Verified Skill Passport
              </span>
            </div>
            <h1 style={{ fontSize: '40px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {user?.name || 'Operative'}'s Passport
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              AI-verified competency record · Updated in real-time
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '32px' }}>

            {/* LEFT — Profile card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Profile */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '24px', padding: '32px', textAlign: 'center',
                animation: 'fadeInUp 0.4s ease 0.1s both',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '20px', margin: '0 auto 20px',
                  background: 'var(--border-active)', color: '#010203',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', fontWeight: 800,
                }}>
                  {(user?.name || 'O')[0].toUpperCase()}
                </div>
                <div style={{ fontWeight: 800, fontSize: '24px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {user?.name || 'Operative'}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '24px' }}>
                  Architect Tier II
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
                  {[
                    { label: 'Points', val: totalPoints || 4150 },
                    { label: 'Day', val: currentDay },
                    { label: 'Score', val: `${scores.knowledge || 72}%` },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '4px' }}>{s.val}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  padding: '12px 16px', background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)', borderRadius: '12px',
                  fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500,
                  wordBreak: 'break-all',
                }}>
                  🔗 {shareUrl}
                </div>
              </div>

              {/* Achievements */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '24px', padding: '32px',
                animation: 'fadeInUp 0.4s ease 0.2s both',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '20px', textTransform: 'uppercase' }}>
                  Achievements
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {achievements.map((a) => {
                    const earned = userAchievements.includes(a.id);
                    return (
                      <div key={a.id} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        padding: '16px 8px',
                        background: earned ? 'rgba(207,255,0,0.08)' : 'var(--bg-card)',
                        border: `1px solid ${earned ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                        borderRadius: '12px', cursor: 'default', opacity: earned ? 1 : 0.4,
                        transition: 'all 0.2s ease',
                      }}
                      >
                        <span style={{ fontSize: '24px' }}>{ICON_MAP[a.icon] || '✦'}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: earned ? 'var(--text-accent)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{a.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Share buttons */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '24px', padding: '32px',
                animation: 'fadeInUp 0.4s ease 0.3s both',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '20px', textTransform: 'uppercase' }}>
                  Share Passport
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Share to LinkedIn', icon: 'in' },
                    { label: 'Add to Portfolio', icon: '⊞' },
                    { label: 'Download PDF', icon: '↓' },
                  ].map((btn) => (
                    <button key={btn.label} className="btn" style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', borderRadius: '12px',
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                      cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                    >
                      <span style={{ fontWeight: 700, width: '20px', textAlign: 'center', color: 'var(--text-accent)' }}>{btn.icon}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Skills + Radar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Radar */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '24px', padding: '36px',
                animation: 'fadeInUp 0.4s ease 0.1s both',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontWeight: 800, fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--text-primary)' }}>Competency Matrix</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>AI-verified skill radar</div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border-subtle)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <Radar name="Skills" dataKey="value" stroke="#CFFF00" fill="#CFFF00" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#CFFF00', strokeWidth: 0, r: 4 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Verified Skills */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '24px', padding: '36px',
                animation: 'fadeInUp 0.4s ease 0.2s both',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontWeight: 800, fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--text-primary)' }}>Verified Skills</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {verifiedSkills.length === 0
                    ? <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Complete assessments to build your verified skills.</div>
                    : verifiedSkills.map((sk) => (
                      <div key={sk.skill} style={{
                        padding: '20px 24px', borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: `1px solid ${sk.verified ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifySpace: 'between', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {sk.verified && <span style={{ fontSize: '14px', color: 'var(--text-accent)', fontWeight: 700 }}>✓</span>}
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{sk.skill}</span>
                            <span style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>{sk.level}</span>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{sk.score}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(243,242,238,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${sk.score}%`,
                            background: 'var(--border-active)',
                            borderRadius: '3px',
                            transition: 'width 1s ease',
                          }} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Bootcamp history */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '24px', padding: '36px',
                animation: 'fadeInUp 0.4s ease 0.3s both',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontWeight: 800, fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--text-primary)' }}>Bootcamp History</div>
                <div style={{
                  padding: '24px', borderRadius: '16px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', gap: '20px',
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {selectedBootcamp?.icon || '🧠'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedBootcamp?.name || 'AI Engineering'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Day {currentDay} of 30 · In Progress
                    </div>
                    <div style={{ height: '6px', background: 'rgba(243,242,238,0.1)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${(currentDay / 30) * 100}%`, background: 'var(--border-active)', borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-accent)' }}>
                    {Math.round((currentDay / 30) * 100)}%
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
