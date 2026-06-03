/**
 * AnalyticsCenter — Advanced growth dashboard with all metrics
 */
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

const weeklyData = [
  { day: 'Mon', score: 62, velocity: 55, retention: 70 },
  { day: 'Tue', score: 70, velocity: 68, retention: 74 },
  { day: 'Wed', score: 68, velocity: 72, retention: 76 },
  { day: 'Thu', score: 78, velocity: 78, retention: 80 },
  { day: 'Fri', score: 82, velocity: 75, retention: 85 },
  { day: 'Sat', score: 88, velocity: 82, retention: 87 },
  { day: 'Sun', score: 85, velocity: 80, retention: 89 },
];

const monthlyData = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  growth: 20 + i * 3.5 + Math.sin(i) * 4,
  consistency: 60 + i * 1.8,
}));

const radarData = [
  { skill: 'Technical', value: 72 }, { skill: 'Communication', value: 81 },
  { skill: 'Problem Solving', value: 68 }, { skill: 'Retention', value: 75 },
  { skill: 'Velocity', value: 78 }, { skill: 'Consistency', value: 90 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#12121d', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {Math.round(p.value)}</div>
      ))}
    </div>
  );
};

function MetricCard({ label, value, sub, color, delta }) {
  return (
    <div className="stat-card" style={{ animation: 'fadeInUp 0.4s ease both' }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {delta !== undefined && (
        <div style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: delta >= 0 ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% this week
        </div>
      )}
    </div>
  );
}

export default function AnalyticsCenter() {
  const { state } = useApp();
  const { scores, currentDay, streak } = state;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-area">
        <div style={{ padding: '32px', maxWidth: '1200px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px', animation: 'fadeInUp 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="badge badge-cyan" style={{ marginBottom: '10px' }}>▦ Analytics Center</div>
                <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 900 }}>Growth Intelligence</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>Day {currentDay} of 30 · Real-time neural analysis</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Weekly', 'Monthly', 'All Time'].map((t, i) => (
                  <button key={t} style={{
                    padding: '7px 16px', borderRadius: '6px', cursor: 'pointer',
                    background: i === 0 ? 'rgba(124,58,237,0.2)' : 'transparent',
                    border: `1px solid ${i === 0 ? 'rgba(124,58,237,0.4)' : 'var(--border-subtle)'}`,
                    color: i === 0 ? 'var(--violet-300)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: i === 0 ? 700 : 400,
                    transition: 'all 0.15s ease',
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Top metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
            <MetricCard label="GROWTH SCORE" value={`${state.growthScore || 72}%`} color="var(--violet-400)" delta={8} />
            <MetricCard label="LEARNING VELOCITY" value={`${scores.velocity || 78}`} sub="pts/day" color="var(--cyan-400)" delta={5} />
            <MetricCard label="CONSISTENCY" value={`${scores.accuracy || 90}%`} color="var(--emerald-400)" delta={3} />
            <MetricCard label="STREAK" value={`${streak}🔥`} sub="days active" color="var(--amber-400)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

            {/* Weekly performance chart */}
            <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px', animation: 'fadeInUp 0.4s ease 0.1s both' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>Weekly Performance</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>Score · Velocity · Retention</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fill: '#6b6b88', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b6b88', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} domain={[40, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="velocity" stroke="#22d3ee" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                {[['Score', '#7c3aed'], ['Velocity', '#22d3ee'], ['Retention', '#10b981']].map(([l, c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 12, height: 2, background: c, borderRadius: '1px' }} />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly growth */}
            <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px', animation: 'fadeInUp 0.4s ease 0.15s both' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>30-Day Growth Arc</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>Knowledge accumulation over time</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="consistGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#6b6b88', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b6b88', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="growth" stroke="#7c3aed" fill="url(#growthGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="consistency" stroke="#22d3ee" fill="url(#consistGrad)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>

            {/* Radar */}
            <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px', animation: 'fadeInUp 0.4s ease 0.2s both' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Skill Radar</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(139,92,246,0.12)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b6b88', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <Radar dataKey="value" stroke="#7c3aed" fill="rgba(124,58,237,0.2)" strokeWidth={1.5} dot={{ fill: '#22d3ee', strokeWidth: 0, r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score breakdown bars */}
            <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px', animation: 'fadeInUp 0.4s ease 0.25s both' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Score Breakdown</div>
              {[
                { label: 'Technical', val: scores.technical || 72, color: 'var(--violet-400)' },
                { label: 'Communication', val: scores.communication || 81, color: 'var(--cyan-400)' },
                { label: 'Problem Solving', val: scores.problemSolving || 68, color: 'var(--emerald-400)' },
                { label: 'Knowledge', val: scores.knowledge || 75, color: 'var(--amber-400)' },
                { label: 'Confidence', val: scores.confidence || 78, color: 'var(--violet-300)' },
              ].map((s) => (
                <div key={s.label} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.val}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(139,92,246,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.val}%`, background: s.color, borderRadius: '2px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Vishesh AI analysis */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
              border: '1px solid rgba(124,58,237,0.25)', borderRadius: '14px', padding: '24px',
              animation: 'fadeInUp 0.4s ease 0.3s both',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="vishesh-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>V</div>
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--violet-300)', letterSpacing: '0.08em' }}>VISHESH ANALYSIS</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Real-time intelligence</div>
                </div>
              </div>
              <div style={{ borderLeft: '2px solid var(--violet-500)', paddingLeft: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Your consistency score is exceptional. Problem-solving depth needs attention — I've adjusted tomorrow's curriculum to include harder algorithmic challenges.
                </p>
              </div>
              {[
                { label: 'Strength', val: 'Consistency & Communication', icon: '↑', color: 'var(--emerald-400)' },
                { label: 'Focus Area', val: 'Problem Solving Depth', icon: '→', color: 'var(--amber-400)' },
                { label: 'Trajectory', val: 'On track for Tier III', icon: '★', color: 'var(--cyan-400)' },
              ].map((i) => (
                <div key={i.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px', background: 'rgba(10,10,18,0.4)', borderRadius: '8px' }}>
                  <span style={{ color: i.color, fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>{i.icon}</span>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>{i.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{i.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career readiness */}
          <div style={{
            background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)',
            borderRadius: '14px', padding: '24px',
            animation: 'fadeInUp 0.4s ease 0.35s both',
          }}>
            <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>Career Readiness Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'AI Readiness', val: 74, color: 'var(--violet-400)' },
                { label: 'Career Readiness', val: 68, color: 'var(--cyan-400)' },
                { label: 'Interview Ready', val: 72, color: 'var(--emerald-400)' },
                { label: 'Portfolio Score', val: 65, color: 'var(--amber-400)' },
              ].map((m) => {
                const r = 28;
                const circ = 2 * Math.PI * r;
                const offset = circ - (m.val / 100) * circ;
                return (
                  <div key={m.label} style={{ textAlign: 'center', padding: '16px', background: 'rgba(10,10,18,0.5)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.08)' }}>
                    <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 10px' }}>
                      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="36" cy="36" r={r} stroke="rgba(139,92,246,0.1)" strokeWidth="5" fill="none" />
                        <circle cx="36" cy="36" r={r} stroke={m.color} strokeWidth="5" fill="none"
                          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 3px ${m.color})`, transition: 'stroke-dashoffset 1.5s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: m.color }}>{m.val}%</div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
