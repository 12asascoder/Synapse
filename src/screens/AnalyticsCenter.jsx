/**
 * AnalyticsCenter — Advanced growth dashboard with all metrics
 * Clean ElevenLabs aesthetic
 */
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E3', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ color: '#6B6B6B', marginBottom: '8px', fontWeight: 600 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600, marginBottom: '4px' }}>{p.name}: {Math.round(p.value)}</div>
      ))}
    </div>
  );
};

function MetricCard({ label, value, sub, color, delta }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E8E6E3',
      borderRadius: '20px', padding: '24px',
      animation: 'fadeInUp 0.4s ease both',
      boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 700, color, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{value}</div>
      {sub && <div style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: 500 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 600, color: delta >= 0 ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{delta >= 0 ? '↑' : '↓'}</span> {Math.abs(delta)}% this week
        </div>
      )}
    </div>
  );
}

export default function AnalyticsCenter() {
  const { state } = useApp();
  const { scores, currentDay, streak, progressHistory } = state;

  const radarData = [
    { skill: 'Technical', value: scores.technical || 10 },
    { skill: 'Communication', value: scores.communication || 10 },
    { skill: 'Problem Solving', value: scores.problemSolving || 10 },
    { skill: 'Retention', value: scores.retention || 10 },
    { skill: 'Velocity', value: scores.velocity || 10 },
    { skill: 'Consistency', value: scores.consistency || 10 },
  ];

  const chartHistory = progressHistory?.length > 0 ? progressHistory : [{ day: 1, score: 0 }];

  const weeklyData = chartHistory.map(p => ({
    day: `Day ${p.day}`,
    score: p.score,
    velocity: scores.velocity || 0,
    retention: scores.retention || 0,
  }));

  const growthData = chartHistory.map(p => ({
    day: p.day,
    growth: p.score,
    consistency: scores.consistency || 0,
  }));

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#FDFCFC', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-area">
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '40px', animation: 'fadeInUp 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 16px', background: '#F5F3F1',
                  border: '1px solid #E8E6E3', borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#000' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#000', textTransform: 'uppercase' }}>
                    Analytics Center
                  </span>
                </div>
                <h1 style={{ fontSize: '40px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#000', letterSpacing: '-0.02em', marginBottom: '8px' }}>Growth Intelligence</h1>
                <p style={{ color: '#6B6B6B', fontSize: '15px' }}>Day {currentDay} of 30 · Real-time neural analysis</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', background: '#F5F3F1', padding: '4px', borderRadius: '10px', border: '1px solid #E8E6E3' }}>
                {['Weekly', 'Monthly', 'All Time'].map((t, i) => (
                  <button key={t} style={{
                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                    background: i === 0 ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    color: i === 0 ? '#000' : '#6B6B6B',
                    fontSize: '13px', fontWeight: i === 0 ? 600 : 500,
                    transition: 'all 0.15s ease',
                    boxShadow: i === 0 ? '0 2px 4px rgba(0,0,0,0.02)' : 'none'
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Top metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <MetricCard label="GROWTH SCORE" value={`${state.growthScore || 0}%`} color="#000" delta={state.growthScore > 0 ? 8 : 0} />
            <MetricCard label="LEARNING VELOCITY" value={`${scores.velocity || 0}`} sub="pts/day" color="#44403B" delta={scores.velocity > 0 ? 5 : 0} />
            <MetricCard label="CONSISTENCY" value={`${scores.consistency || scores.accuracy || 0}%`} color="#000" delta={scores.consistency > 0 ? 3 : 0} />
            <MetricCard label="STREAK" value={`${streak}🔥`} sub="days active" color="#000" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

            {/* Weekly performance chart */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E3', borderRadius: '24px', padding: '32px', animation: 'fadeInUp 0.4s ease 0.1s both', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              <div style={{ fontWeight: 700, fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: '#000' }}>Weekly Performance</div>
              <div style={{ fontSize: '13px', color: '#6B6B6B', marginBottom: '32px' }}>Score · Velocity · Retention</div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} domain={[40, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#000" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="velocity" stroke="var(--text-secondary)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="retention" stroke="#DCDCDC" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
                {[['Score', '#000'], ['Velocity', 'var(--text-secondary)'], ['Retention', '#DCDCDC']].map(([l, c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 16, height: 3, background: c, borderRadius: '1.5px' }} />
                    <span style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: 500 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly growth */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E3', borderRadius: '24px', padding: '32px', animation: 'fadeInUp 0.4s ease 0.15s both', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              <div style={{ fontWeight: 700, fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: '#000' }}>30-Day Growth Arc</div>
              <div style={{ fontSize: '13px', color: '#6B6B6B', marginBottom: '32px' }}>Knowledge accumulation over time</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#000" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="consistGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--text-secondary)" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="var(--text-secondary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="growth" stroke="#000" fill="url(#growthGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="consistency" stroke="var(--text-secondary)" fill="url(#consistGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' }}>

            {/* Radar */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E3', borderRadius: '24px', padding: '32px', animation: 'fadeInUp 0.4s ease 0.2s both', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              <div style={{ fontWeight: 700, fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '24px', color: '#000' }}>Skill Radar</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E8E6E3" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#6B6B6B', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#000" fill="#000" fillOpacity={0.05} strokeWidth={2} dot={{ fill: '#000', strokeWidth: 0, r: 4 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score breakdown bars */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E6E3', borderRadius: '24px', padding: '32px', animation: 'fadeInUp 0.4s ease 0.25s both', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              <div style={{ fontWeight: 700, fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '24px', color: '#000' }}>Score Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Technical', val: scores.technical || 72 },
                  { label: 'Communication', val: scores.communication || 81 },
                  { label: 'Problem Solving', val: scores.problemSolving || 68 },
                  { label: 'Knowledge', val: scores.knowledge || 75 },
                  { label: 'Confidence', val: scores.confidence || 78 },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: 500 }}>{s.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#000' }}>{s.val}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#F5F3F1', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.val}%`, background: '#000', borderRadius: '3px', transition: 'width 1.2s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vishesh AI analysis */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E8E6E3', borderRadius: '24px', padding: '32px',
              animation: 'fadeInUp 0.4s ease 0.3s both',
              display: 'flex', flexDirection: 'column', gap: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>V</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#000', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Vishesh Analysis</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Real-time intelligence</div>
                </div>
              </div>
              <div style={{ borderLeft: '3px solid #E8E6E3', paddingLeft: '16px' }}>
                <p style={{ fontSize: '14px', color: '#44403B', lineHeight: 1.6 }}>
                  Your consistency score is exceptional. Problem-solving depth needs attention — I've adjusted tomorrow's curriculum to include harder algorithmic challenges.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Strength', val: 'Consistency & Communication', icon: '↑' },
                  { label: 'Focus Area', val: 'Problem Solving Depth', icon: '→' },
                  { label: 'Trajectory', val: 'On track for Tier III', icon: '★' },
                ].map((i) => (
                  <div key={i.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#F5F3F1', borderRadius: '12px' }}>
                    <span style={{ color: '#000', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>{i.icon}</span>
                    <div>
                      <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>{i.label}</div>
                      <div style={{ fontSize: '13px', color: '#000', fontWeight: 600 }}>{i.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
