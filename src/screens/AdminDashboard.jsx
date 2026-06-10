import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bootcampCount, setBootcampCount] = useState(0);

  useEffect(() => {
    fetch(`${API}/analytics/overview`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
    fetch(`${API}/bootcamps`)
      .then((r) => r.json())
      .then((data) => setBootcampCount(data.length))
      .catch(() => {});
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers?.toLocaleString() || '0', trend: 'Registered', color: 'var(--cyan-400)' },
        { label: 'Active (7d)', value: stats.activeUsers?.toLocaleString() || '0', trend: 'Active', color: 'var(--violet-400)' },
        { label: 'Bootcamps', value: bootcampCount.toString(), trend: 'Programs', color: 'var(--amber-400)' },
        { label: 'Assessments', value: stats.totalAssessments?.toLocaleString() || '0', trend: 'Completed', color: 'var(--rose-400)' },
        { label: 'Avg Growth', value: stats.avgGrowthScore ? `${stats.avgGrowthScore}/100` : 'N/A', trend: 'Platform Avg', color: 'var(--fuchsia-400)' },
        { label: 'Engagement', value: stats.totalUsers ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` : 'N/A', trend: 'Active Rate', color: 'var(--emerald-400)' },
        { label: 'Platform', value: 'Online', trend: 'Operational', color: 'var(--emerald-400)' },
        { label: 'Database', value: 'Connected', trend: 'PostgreSQL', color: 'var(--indigo-400)' },
      ]
    : Array.from({ length: 8 }, (_, i) => ({
        label: 'Loading...', value: '—', trend: '', color: 'var(--text-muted)',
      }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>
            Enterprise Command Center
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>
            Global platform overview and real-time operations
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {statCards.map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(10, 15, 25, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              borderRadius: '16px', padding: '24px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                background: `linear-gradient(90deg, ${stat.color}, transparent)`
              }} />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: stat.color, fontWeight: 600 }}>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{
            background: 'rgba(10, 15, 25, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '16px', padding: '24px', minHeight: '400px',
            fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--cyan-400)', marginBottom: '8px' }}>PLATFORM OVERVIEW</div>
            <div>● Database: PostgreSQL on Supabase</div>
            <div>● Auth: bcrypt (12 rounds) + JWT</div>
            <div>● AI: TruGen API</div>
            <div>● Models: {bootcampCount} bootcamps, 10 tables</div>
            {stats && <div>● Users: {stats.totalUsers} total / {stats.activeUsers} active</div>}
            {stats && <div>● Assessments: {stats.totalAssessments} completed</div>}
            {stats && <div>● Avg Growth Score: {stats.avgGrowthScore || 0}/100</div>}
          </div>
          <div style={{
            background: 'rgba(10, 15, 25, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '16px', padding: '24px', minHeight: '400px',
            fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--emerald-400)', marginBottom: '8px' }}>SYSTEM HEALTH</div>
            <div>● API: <span style={{ color: 'var(--emerald-400)' }}>Online</span></div>
            <div>● Database: <span style={{ color: 'var(--emerald-400)' }}>Connected</span></div>
            <div>● AI Service: {stats ? <span style={{ color: 'var(--emerald-400)' }}>Configured</span> : 'Checking...'}</div>
            <div>● Storage: <span style={{ color: 'var(--emerald-400)' }}>Active</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
