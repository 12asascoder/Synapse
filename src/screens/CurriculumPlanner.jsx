import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet, apiPost } from '../lib/api';
import ThemeContainer from '../components/ThemeContainer';

const STYLES = {
  container: { maxWidth: 900, margin: '0 auto', padding: '96px 20px 40px' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' },
  subtitle: { fontSize: 14, color: '#94a3b8', margin: 0 },
  statsRow: { display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: 150, background: 'rgba(30,30,50,0.6)', borderRadius: 12,
    padding: '16px 20px', border: '1px solid rgba(99,102,241,0.15)',
  },
  statValue: { fontSize: 28, fontWeight: 700, color: '#a5b4fc', margin: '0 0 4px' },
  statLabel: { fontSize: 12, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
  moduleCard: {
    background: 'rgba(30,30,50,0.6)', borderRadius: 12, padding: 20, marginBottom: 12,
    border: '1px solid rgba(99,102,241,0.15)',
  },
  moduleTitle: { fontSize: 16, fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px' },
  progressBar: { height: 8, borderRadius: 4, background: 'rgba(99,102,241,0.15)', marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  button: {
    padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  buttonPrimary: { background: '#6366f1', color: '#fff' },
  buttonSecondary: { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11,
    fontWeight: 600, textTransform: 'uppercase',
  },
};

export default function CurriculumPlanner() {
  const { state } = useApp();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchPlan = useCallback(async () => {
    try {
      const data = await apiGet(`/curriculum/plan/${state.user.id}`, state.token);
      if (data && !data.noActivePlan) setPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [state.user?.id, state.token]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await apiPost('/curriculum/generate', {}, state.token);
      setPlan(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <ThemeContainer>
        <div style={STYLES.container}>
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading...</p>
        </div>
      </ThemeContainer>
    );
  }

  if (!plan) {
    return (
      <ThemeContainer>
        <div style={STYLES.container}>
          <div style={STYLES.header}>
            <h1 style={STYLES.title}>Curriculum Planner</h1>
            <p style={STYLES.subtitle}>Generate a personalized learning path to 92% mastery</p>
          </div>
          {error && <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button onClick={handleGenerate} disabled={generating} style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '14px 40px', fontSize: 16 }}>
            {generating ? 'Generating...' : 'Generate My Curriculum'}
          </button>
        </div>
      </ThemeContainer>
    );
  }

  const modules = plan.modules || [];
  const progress = plan.progress || {};
  const masteryBreakdown = plan.masteryBreakdown || {};
  const completedModules = progress.scores?.length || 0;
  const totalDays = plan.totalDays || 30;

  return (
    <ThemeContainer>
      <div style={STYLES.container}>
        <div style={STYLES.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={STYLES.title}>Learning Path</h1>
              <p style={STYLES.subtitle}>{plan.targetRole || 'Curriculum'} · Target: {plan.targetMastery || 92}% mastery</p>
            </div>
            <span style={{ ...STYLES.badge, background: 'rgba(16,185,129,0.1)', color: '#6ee7b7' }}>{plan.status}</span>
          </div>
        </div>

        <div style={STYLES.statsRow}>
          <div style={STYLES.statCard}>
            <p style={STYLES.statValue}>{completedModules}/{modules.length}</p>
            <p style={STYLES.statLabel}>Modules</p>
          </div>
          <div style={STYLES.statCard}>
            <p style={STYLES.statValue}>{totalDays}</p>
            <p style={STYLES.statLabel}>Total Days</p>
          </div>
          <div style={STYLES.statCard}>
            <p style={STYLES.statValue}>{plan.targetMastery}%</p>
            <p style={STYLES.statLabel}>Target</p>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, color: '#e2e8f0', marginBottom: 12 }}>Mastery Breakdown</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Quiz: {Math.round((masteryBreakdown.quizWeight || 0.4) * 100)}%</span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Exercise: {Math.round((masteryBreakdown.exerciseWeight || 0.3) * 100)}%</span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Efficiency: {Math.round((masteryBreakdown.efficiencyWeight || 0.15) * 100)}%</span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Consistency: {Math.round((masteryBreakdown.consistencyWeight || 0.15) * 100)}%</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 16, color: '#e2e8f0', marginBottom: 12 }}>Modules</h3>
          {modules.map((mod, i) => {
            const modProgress = progress.currentModule > i ? 100 : progress.currentModule === i ? 50 : 0;
            const isComplete = progress.currentModule > i;
            return (
              <div key={mod.id || i} style={{ ...STYLES.moduleCard, opacity: modProgress === 0 ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={STYLES.moduleTitle}>
                      {isComplete && <span style={{ color: '#6ee7b7', marginRight: 8 }}>✓</span>}
                      {mod.title}
                    </p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      <span>{mod.days} days</span>
                      <span>{mod.exercises || 0} exercises</span>
                      <span>{mod.assessments || 0} assessments</span>
                      <span>Target: {mod.masteryThreshold || 80}%</span>
                    </div>
                  </div>
                  {isComplete && <span style={{ ...STYLES.badge, background: 'rgba(16,185,129,0.1)', color: '#6ee7b7' }}>COMPLETE</span>}
                </div>
                <div style={STYLES.progressBar}>
                  <div style={{ ...STYLES.progressFill, width: `${modProgress}%`, background: modProgress >= 80 ? '#6ee7b7' : '#6366f1' }} />
                </div>
                {mod.competencies?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {mod.competencies.map((c, j) => (
                      <span key={j} style={{ ...STYLES.badge, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', textTransform: 'none' }}>{c}</span>
                    ))}
                  </div>
                )}
                {modProgress > 0 && modProgress < 100 && (
                  <div style={{ marginTop: 12 }}>
                    <button style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 16px' }}>Continue Module</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {plan.skillGap?.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 16, color: '#e2e8f0', marginBottom: 12 }}>Skill Gap Analysis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.skillGap.map((gap, i) => (
                <div key={i} style={{ ...STYLES.statCard, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#e2e8f0', fontSize: 14 }}>{gap.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>
                      Current: {gap.current || '?'} → Target: {gap.target || '?'}
                    </span>
                  </div>
                  <div style={STYLES.progressBar}>
                    <div style={{ ...STYLES.progressFill, width: `${((gap.current || 0) / (gap.target || 5)) * 100}%`, background: '#fcd34d' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ThemeContainer>
  );
}
