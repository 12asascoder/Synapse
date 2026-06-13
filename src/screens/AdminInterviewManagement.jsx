import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet } from '../lib/api';

const STYLES = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' },
  subtitle: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },
  card: {
    background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', marginBottom: '12px',
    border: '1px solid var(--border-subtle)',
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '11px',
    fontWeight: 600, textTransform: 'uppercase',
  },
  statValue: { fontSize: '24px', fontWeight: 700, color: 'var(--border-active)', margin: '0 0 4px' },
  statLabel: { fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' },
};

const statusColors = {
  active: { bg: 'rgba(16,185,129,0.1)', color: '#6ee7b7' },
  completed: { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd' },
  expired: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' },
  archived: { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' },
};

export default function AdminInterviewManagement() {
  const { state } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet('/admin/interview-stats', state.token);
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [state.token]);

  if (loading) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>
        Loading interview management...
      </div>
    );
  }

  return (
    <div style={STYLES.container}>
      <div style={STYLES.header}>
        <h1 style={STYLES.title}>Interview Management</h1>
        <p style={STYLES.subtitle}>Overview of all user interview preparation sessions</p>
      </div>

      {stats && (
        <>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {[
              { label: 'Total Preps', value: stats.totalPreps },
              { label: 'Active', value: stats.activePreps },
              { label: 'Completed', value: stats.completedPreps },
              { label: 'Total Answers', value: stats.totalAnswers },
              { label: 'Avg Score', value: stats.avgScore },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, minWidth: '120px', background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <p style={STYLES.statValue}>{s.value}</p>
                <p style={STYLES.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px' }}>Recent Preps</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Summary</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Answers</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Score</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentPreps || []).map(p => {
                  const sc = statusColors[p.status] || statusColors.archived;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{p.User?.name || p.User?.email || 'Unknown'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.jdSummary || 'N/A'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ ...STYLES.badge, background: sc.bg, color: sc.color }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.answers?.length || 0}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.readinessScore || 0}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
                {(!stats.recentPreps || stats.recentPreps.length === 0) && (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No interview preps yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
