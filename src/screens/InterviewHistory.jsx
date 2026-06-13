import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet } from '../lib/api';
import Sidebar from '../components/Sidebar';

const STYLES = {
  container: { maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' },
  subtitle: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: '150px', background: 'var(--bg-card)', borderRadius: '16px',
    padding: '20px', border: '1px solid var(--border-subtle)',
  },
  statValue: { fontSize: '28px', fontWeight: 700, color: 'var(--border-active)', margin: '0 0 4px' },
  statLabel: { fontSize: '12px', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
  card: {
    background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', marginBottom: '12px',
    border: '1px solid var(--border-subtle)', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cardTitle: { fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' },
  cardMeta: { fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '11px',
    fontWeight: 600, textTransform: 'uppercase',
  },
  button: {
    padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '14px',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  buttonPrimary: { background: 'var(--border-active)', color: '#010203', border: 'none' },
  buttonSecondary: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' },
  scoreBar: { height: '6px', borderRadius: '3px', background: 'var(--bg-card)', marginTop: '8px', overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
};

const statusColors = {
  active: { bg: 'rgba(16,185,129,0.1)', color: '#6ee7b7' },
  completed: { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd' },
  expired: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' },
  archived: { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' },
};

export default function InterviewHistory() {
  const { state, navigate } = useApp();
  const [preps, setPreps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await apiGet(`/interview/${state.user.id}/analytics`, state.token);
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  }, [state.user?.id, state.token]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchHistory();
      setLoading(false);
    })();
  }, [fetchHistory]);

  const outerStyle = { minHeight: '100vh', background: '#010203', display: 'flex', color: '#f3f2ee' };
  const rightColStyle = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' };

  if (loading) {
    return (
      <div style={outerStyle}>
        <Sidebar />
        <div style={rightColStyle}><div style={STYLES.container}><p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p></div></div>
      </div>
    );
  }

  return (
    <div style={outerStyle}>
      <Sidebar />
      <div style={rightColStyle}>
        <div style={STYLES.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={STYLES.title}>📋 Interview History</h1>
              <p style={STYLES.subtitle}>All your interview preparation sessions and performance</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('interview-prep')} style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 14px' }}>New Prep</button>
            </div>
          </div>

          {analytics && (
            <div style={STYLES.statsRow}>
              <div style={STYLES.statCard}>
                <p style={STYLES.statValue}>{analytics.overallAvgScore || 0}</p>
                <p style={STYLES.statLabel}>Avg Score</p>
              </div>
              <div style={STYLES.statCard}>
                <p style={STYLES.statValue}>{analytics.totalAnswers || 0}</p>
                <p style={STYLES.statLabel}>Answers</p>
              </div>
              <div style={STYLES.statCard}>
                <p style={STYLES.statValue}>{analytics.highestScore || 0}</p>
                <p style={STYLES.statLabel}>Highest Score</p>
              </div>
              <div style={STYLES.statCard}>
                <p style={STYLES.statValue}>{analytics.totalSessions || 0}</p>
                <p style={STYLES.statLabel}>Sessions</p>
              </div>
            </div>
          )}

          {analytics?.categoryAverages && Object.keys(analytics.categoryAverages).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>Score by Category</h3>
              {Object.entries(analytics.categoryAverages).map(([cat, score]) => (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                    <span>{score}/100</span>
                  </div>
                  <div style={STYLES.scoreBar}>
                    <div style={{ ...STYLES.scoreFill, width: `${score}%`, background: score >= 80 ? '#6ee7b7' : score >= 60 ? '#fcd34d' : '#fca5a5' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {analytics?.topStrengths?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, color: '#6ee7b7', marginBottom: 12 }}>Top Strengths</h3>
              {analytics.topStrengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, padding: '8px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: 8 }}>
                  <span>{s.name}</span>
                  <span style={{ color: '#6ee7b7' }}>x{s.count}</span>
                </div>
              ))}
            </div>
          )}

          {analytics?.topWeaknesses?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, color: '#fca5a5', marginBottom: 12 }}>Areas to Improve</h3>
              {analytics.topWeaknesses.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, padding: '8px 12px', background: 'rgba(239,68,68,0.05)', borderRadius: 8 }}>
                  <span>{w.name}</span>
                  <span style={{ color: '#fca5a5' }}>x{w.count}</span>
                </div>
              ))}
            </div>
          )}

          {analytics?.progressOverTime?.length > 1 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>Progress Over Time</h3>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120, padding: '12px 0' }}>
                {analytics.progressOverTime.map((p, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%', maxWidth: 40, height: `${p.avgScore}%`, minHeight: 4,
                      background: p.avgScore >= 80 ? '#6ee7b7' : p.avgScore >= 60 ? '#fcd34d' : '#fca5a5',
                      borderRadius: '4px 4px 0 0', transition: 'height 0.3s',
                    }} />
                    <span style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analytics && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No interview history yet</p>
              <p style={{ fontSize: 13 }}>Complete your first interview prep to see results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
