/**
 * SkillPassport — Professional verified profile with skill graph,
 * achievements, recruiter view, and public share link
 */
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const radarData = [
  { skill: 'System Arch', value: 80 },
  { skill: 'Algorithms', value: 72 },
  { skill: 'Data Structs', value: 68 },
  { skill: 'Security', value: 65 },
  { skill: 'DevOps', value: 70 },
  { skill: 'AI/ML', value: 85 },
];

const ACHIEVEMENTS = [
  { icon: '🔥', label: '7-Day Streak', color: '#f59e0b' },
  { icon: '⚡', label: 'Speed Learner', color: '#06b6d4' },
  { icon: '🎯', label: 'Perfect Score', color: '#10b981' },
  { icon: '🧠', label: 'Deep Thinker', color: '#7c3aed' },
  { icon: '🏆', label: 'Architect II', color: '#a78bfa' },
  { icon: '★', label: 'Milestone Pass', color: '#22d3ee' },
];

const VERIFIED_SKILLS = [
  { skill: 'Large Language Models', level: 'Advanced', verified: true, score: 88 },
  { skill: 'LoRA Fine-tuning', level: 'Intermediate', verified: true, score: 76 },
  { skill: 'RAG Architecture', level: 'Advanced', verified: true, score: 82 },
  { skill: 'Distributed Systems', level: 'Intermediate', verified: false, score: 65 },
  { skill: 'MLOps Pipelines', level: 'Beginner', verified: false, score: 55 },
];

export default function SkillPassport() {
  const { state } = useApp();
  const { user, selectedBootcamp, scores, totalPoints, currentDay } = state;
  const shareUrl = `synapse.ai/passport/${user?.name?.toLowerCase().replace(/\s/g, '-') || 'operative'}`;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-area">
        <div style={{ padding: '32px', maxWidth: '1100px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px', animation: 'fadeInUp 0.4s ease' }}>
            <div className="badge badge-violet" style={{ marginBottom: '12px' }}>◆ Verified Skill Passport</div>
            <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 900 }}>
              {user?.name || 'Operative'}'s Passport
            </h1>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px' }}>
              AI-verified competency record · Updated in real-time
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>

            {/* LEFT — Profile card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Profile */}
              <div style={{
                background: 'rgba(14,14,24,0.95)', border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: '16px', padding: '28px', textAlign: 'center',
                animation: 'fadeInUp 0.4s ease 0.1s both',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))',
                  border: '3px solid rgba(124,58,237,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: 800,
                  boxShadow: '0 0 24px rgba(124,58,237,0.4)',
                }}>
                  {(user?.name || 'O')[0].toUpperCase()}
                </div>
                <div style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                  {user?.name || 'Operative'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--violet-400)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                  Architect Tier II
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                  {[
                    { label: 'Points', val: totalPoints || 4150 },
                    { label: 'Day', val: currentDay },
                    { label: 'Score', val: `${scores.knowledge || 72}%` },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--violet-300)' }}>{s.val}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  padding: '10px 14px', background: 'rgba(10,10,18,0.8)',
                  border: '1px solid var(--border-subtle)', borderRadius: '8px',
                  fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                  wordBreak: 'break-all',
                }}>
                  🔗 {shareUrl}
                </div>
              </div>

              {/* Achievements */}
              <div style={{
                background: 'rgba(14,14,24,0.95)', border: '1px solid var(--border-subtle)',
                borderRadius: '14px', padding: '20px',
                animation: 'fadeInUp 0.4s ease 0.2s both',
              }}>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '14px' }}>
                  ACHIEVEMENTS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {ACHIEVEMENTS.map((a) => (
                    <div key={a.label} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                      padding: '12px 8px',
                      background: `${a.color}12`, border: `1px solid ${a.color}22`,
                      borderRadius: '10px', cursor: 'default',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 0 12px ${a.color}22`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <span style={{ fontSize: '20px' }}>{a.icon}</span>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share buttons */}
              <div style={{
                background: 'rgba(14,14,24,0.95)', border: '1px solid var(--border-subtle)',
                borderRadius: '14px', padding: '20px',
                animation: 'fadeInUp 0.4s ease 0.3s both',
              }}>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>
                  SHARE PASSPORT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Share to LinkedIn', icon: 'in', color: '#0077b5' },
                    { label: 'Add to Portfolio', icon: '⊡', color: 'var(--violet-400)' },
                    { label: 'Download PDF', icon: '↓', color: 'var(--cyan-400)' },
                  ].map((btn) => (
                    <button key={btn.label} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '8px',
                      background: 'rgba(10,10,18,0.8)', border: '1px solid var(--border-subtle)',
                      cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <span style={{ color: btn.color, fontWeight: 700, width: '16px', textAlign: 'center' }}>{btn.icon}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Skills + Radar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Radar */}
              <div style={{
                background: 'rgba(14,14,24,0.95)', border: '1px solid var(--border-subtle)',
                borderRadius: '14px', padding: '24px',
                animation: 'fadeInUp 0.4s ease 0.1s both',
              }}>
                <div style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>Competency Matrix</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>AI-verified skill radar</div>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(139,92,246,0.12)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b6b88', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    <Radar name="Skills" dataKey="value" stroke="#22d3ee" fill="rgba(34,211,238,0.15)" strokeWidth={2} dot={{ fill: '#22d3ee', strokeWidth: 0, r: 4 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Verified Skills */}
              <div style={{
                background: 'rgba(14,14,24,0.95)', border: '1px solid var(--border-subtle)',
                borderRadius: '14px', padding: '24px',
                animation: 'fadeInUp 0.4s ease 0.2s both',
              }}>
                <div style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Verified Skills</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {VERIFIED_SKILLS.map((sk) => (
                    <div key={sk.skill} style={{
                      padding: '14px 16px', borderRadius: '10px',
                      background: 'rgba(10,10,18,0.5)',
                      border: `1px solid ${sk.verified ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.08)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {sk.verified && <span style={{ fontSize: '12px', color: 'var(--emerald-400)' }}>✓</span>}
                          <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{sk.skill}</span>
                          <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '4px', color: 'var(--violet-300)', fontFamily: 'var(--font-mono)' }}>{sk.level}</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-mono)', color: sk.verified ? 'var(--emerald-400)' : 'var(--text-muted)' }}>{sk.score}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(139,92,246,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${sk.score}%`,
                          background: sk.verified ? 'linear-gradient(90deg, var(--emerald-500), var(--cyan-400))' : 'linear-gradient(90deg, var(--violet-600), var(--violet-400))',
                          borderRadius: '2px',
                          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bootcamp history */}
              <div style={{
                background: 'rgba(14,14,24,0.95)', border: '1px solid var(--border-subtle)',
                borderRadius: '14px', padding: '24px',
                animation: 'fadeInUp 0.4s ease 0.3s both',
              }}>
                <div style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Bootcamp History</div>
                <div style={{
                  padding: '16px', borderRadius: '10px',
                  background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {selectedBootcamp?.icon || '🧠'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-display)' }}>{selectedBootcamp?.name || 'AI Engineering'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      Day {currentDay} of 30 · In Progress
                    </div>
                    <div style={{ marginTop: '6px', height: '3px', background: 'rgba(124,58,237,0.15)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${(currentDay / 30) * 100}%`, background: 'linear-gradient(90deg, var(--violet-500), var(--cyan-400))', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--violet-400)' }}>
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
