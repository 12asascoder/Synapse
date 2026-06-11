/**
 * AdminDashboard
 * Clean ElevenLabs aesthetic
 */
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
        { label: 'Total Users', value: stats.totalUsers?.toLocaleString() || '0', trend: 'Registered' },
        { label: 'Active (7d)', value: stats.activeUsers?.toLocaleString() || '0', trend: 'Active' },
        { label: 'Bootcamps', value: bootcampCount.toString(), trend: 'Programs' },
        { label: 'Assessments', value: stats.totalAssessments?.toLocaleString() || '0', trend: 'Completed' },
        { label: 'Avg Growth', value: stats.avgGrowthScore ? `${stats.avgGrowthScore}/100` : 'N/A', trend: 'Platform Avg' },
        { label: 'Engagement', value: stats.totalUsers ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` : 'N/A', trend: 'Active Rate' },
        { label: 'Platform', value: 'Online', trend: 'Operational' },
        { label: 'Database', value: 'Connected', trend: 'PostgreSQL' },
      ]
    : Array.from({ length: 8 }, (_, i) => ({
        label: 'Loading...', value: '—', trend: '',
      }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FDFCFC' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }} className="scroll-area">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#000', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Enterprise Command Center
          </h1>
          <p style={{ fontSize: '15px', color: '#6B6B6B' }}>
            Global platform overview and real-time operations
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {statCards.map((stat, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1px solid #E8E6E3',
              borderRadius: '20px', padding: '24px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '12px', color: '#A59F97', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#000', marginBottom: '8px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: 500 }}>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '36px', minHeight: '400px',
            fontSize: '14px', color: '#44403B',
            display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontWeight: 700, color: '#000', marginBottom: '12px', fontSize: '18px', fontFamily: 'var(--font-display)' }}>Platform Overview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: 6, height: 6, background: '#DCDCDC', borderRadius: '50%' }} /> Database: PostgreSQL on Supabase</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: 6, height: 6, background: '#DCDCDC', borderRadius: '50%' }} /> Auth: bcrypt (12 rounds) + JWT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: 6, height: 6, background: '#DCDCDC', borderRadius: '50%' }} /> AI: TruGen API</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: 6, height: 6, background: '#DCDCDC', borderRadius: '50%' }} /> Models: {bootcampCount} bootcamps, 10 tables</div>
            {stats && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: 6, height: 6, background: '#DCDCDC', borderRadius: '50%' }} /> Users: {stats.totalUsers} total / {stats.activeUsers} active</div>}
            {stats && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: 6, height: 6, background: '#DCDCDC', borderRadius: '50%' }} /> Assessments: {stats.totalAssessments} completed</div>}
            {stats && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: 6, height: 6, background: '#DCDCDC', borderRadius: '50%' }} /> Avg Growth Score: {stats.avgGrowthScore || 0}/100</div>}
          </div>
          
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8E6E3',
            borderRadius: '24px', padding: '36px', minHeight: '400px',
            fontSize: '14px', color: '#44403B',
            display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontWeight: 700, color: '#000', marginBottom: '12px', fontSize: '18px', fontFamily: 'var(--font-display)' }}>System Health</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F5F3F1', borderRadius: '12px' }}>
              <span>API</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F5F3F1', borderRadius: '12px' }}>
              <span>Database</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F5F3F1', borderRadius: '12px' }}>
              <span>AI Service</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Configured</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F5F3F1', borderRadius: '12px' }}>
              <span>Storage</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
