import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import AdminSidebar from '../components/AdminSidebar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

import { useApp } from '../context/AppContext';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CARD = { background: 'rgba(10, 15, 25, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '16px' };

export default function AdminAnalytics() {
  const { state } = useApp();
  const token = state.token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/admin/analytics/detailed`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
        <AdminSidebar />
        <div style={{ flex: 1, padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Operatives', value: stats.totalUsers.toLocaleString(), color: 'var(--cyan-400)', trend: '+12% this week' },
    { label: 'Active (7d)', value: stats.activeUsers.toLocaleString(), color: 'var(--violet-400)', trend: `${Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0}% engagement` },
    { label: 'Graduates', value: stats.graduates.toLocaleString(), color: 'var(--emerald-400)', trend: 'Completed Day 30+' },
    { label: 'Avg Growth Score', value: `${stats.avgGrowthScore}/100`, color: 'var(--amber-400)', trend: 'Platform average' },
    { label: 'Assessments Taken', value: stats.totalAssessments.toLocaleString(), color: 'var(--rose-400)', trend: 'Total completed' },
    { label: 'Community Posts', value: stats.totalDiscussions.toLocaleString(), color: 'var(--fuchsia-400)', trend: 'Active discussions' },
  ];

  const scoreDistData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [{
      label: 'User Growth Scores',
      data: [
        stats.scoreDistribution['0-20'],
        stats.scoreDistribution['21-40'],
        stats.scoreDistribution['41-60'],
        stats.scoreDistribution['61-80'],
        stats.scoreDistribution['81-100']
      ],
      backgroundColor: [
        'rgba(244,63,94,0.6)',   // rose (0-20)
        'rgba(245,158,11,0.6)',  // amber (21-40)
        'rgba(14,165,233,0.6)',  // sky (41-60)
        'rgba(56,189,248,0.6)',  // cyan (61-80)
        'rgba(16,185,129,0.6)'   // emerald (81-100)
      ],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#FFFFFF' }, ticks: { color: 'var(--text-muted)' } },
      x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>Platform Analytics</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>Comprehensive insights and performance metrics</p>
        </header>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          {statCards.map((stat, i) => (
            <div key={i} style={{ ...CARD, padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ ...CARD, padding: '24px' }}>
            <div style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth Score Distribution</div>
            <div style={{ height: '260px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={scoreDistData}
                options={{
                  plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-muted)', padding: 20, font: { family: 'monospace', size: 11 } } } },
                  cutout: '75%',
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
