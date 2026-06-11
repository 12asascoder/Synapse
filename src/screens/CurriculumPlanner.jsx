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
  buttonDanger: { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11,
    fontWeight: 600, textTransform: 'uppercase',
  },
  scoreBar: { height: 6, borderRadius: 3, background: 'rgba(99,102,241,0.15)', marginTop: 8, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
};

const difficultyColors = {
  advanced: { bg: 'rgba(139,92,246,0.1)', color: '#c4b5fd' },
  standard: { bg: 'rgba(16,185,129,0.1)', color: '#6ee7b7' },
  supported: { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d' },
  foundational: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' },
};

export default function CurriculumPlanner() {
  const { state, navigate } = useApp();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustmentResult, setAdjustmentResult] = useState(null);
  const [remedialResult, setRemedialResult] = useState(null);
  const [remedialLoading, setRemedialLoading] = useState(false);

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

  const handleAdvance = async (moduleId, score) => {
    if (!plan) return;
    try {
      await apiPost('/curriculum/advance', { planId: plan.id, score, moduleId }, state.token);
      fetchPlan();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckRemedial = async (moduleId, score) => {
    if (!plan) return;
    setRemedialLoading(true);
    setRemedialResult(null);
    try {
      const result = await apiPost('/curriculum/remedial', { planId: plan.id, moduleId, score }, state.token);
      setRemedialResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setRemedialLoading(false);
    }
  };

  const handleAdjustDifficulty = async () => {
    if (!plan) return;
    setAdjusting(true);
    try {
      const scores = (plan.progress?.scores || []).map(s => s.score).filter(s => s != null);
      const result = await apiPost('/curriculum/adjust-difficulty', { planId: plan.id, recentScores: scores.slice(-5) }, state.token);
      setAdjustmentResult(result);
      fetchPlan();
    } catch (e) {
      console.error(e);
    } finally {
      setAdjusting(false);
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
  const totalDays = modules.reduce((a, m) => a + (m.days || 5), 0);

  return (
    <ThemeContainer>
      <div style={STYLES.container}>
        <div style={STYLES.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={STYLES.title}>Learning Path</h1>
              <p style={STYLES.subtitle}>{plan.targetRole || 'Curriculum'} &middot; Target: {plan.targetMastery || 92}% mastery</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => navigate('hub')} style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 14px' }}>Hub</button>
              <button onClick={() => navigate('dashboard')} style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 14px' }}>Dashboard</button>
              <span style={{ ...STYLES.badge, background: 'rgba(16,185,129,0.1)', color: '#6ee7b7' }}>{plan.status}</span>
            </div>
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
          <div style={STYLES.statCard}>
            <p style={STYLES.statValue}>{progress.timeSpent || 0}h</p>
            <p style={STYLES.statLabel}>Time Spent</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button onClick={handleAdjustDifficulty} disabled={adjusting} style={{ ...STYLES.button, ...STYLES.buttonSecondary }}>
            {adjusting ? 'Adjusting...' : 'Adjust Difficulty'}
          </button>
        </div>

        {adjustmentResult && (
          <div style={{ ...STYLES.statCard, marginBottom: 20, background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.3)' }}>
            <p style={{ color: '#a5b4fc', fontWeight: 600, marginBottom: 8 }}>Difficulty Adjusted</p>
            {adjustmentResult.adjustments?.map((a, i) => {
              const dc = difficultyColors[a.difficulty] || difficultyColors.standard;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 4, padding: '4px 0' }}>
                  <span>{a.title}: <span style={{ ...STYLES.badge, background: dc.bg, color: dc.color }}>{a.difficulty}</span></span>
                  <span>{a.change} ({a.days} days)</span>
                </div>
              );
            })}
          </div>
        )}

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
            const dc = difficultyColors[mod.difficulty] || { bg: 'rgba(99,102,241,0.1)', color: '#a5b4fc' };
            const hasRemedial = mod.remedial;

            return (
              <div key={mod.id || i} style={{ ...STYLES.moduleCard, opacity: modProgress === 0 && !isComplete ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      {isComplete && <span style={{ color: '#6ee7b7' }}>&check;</span>}
                      <p style={STYLES.moduleTitle}>{mod.title}</p>
                      {mod.difficulty && <span style={{ ...STYLES.badge, background: dc.bg, color: dc.color }}>{mod.difficulty}</span>}
                      {hasRemedial && <span style={{ ...STYLES.badge, background: 'rgba(245,158,11,0.1)', color: '#fcd34d' }}>REMEDIAL</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b' }}>
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

                {hasRemedial && (
                  <div style={{ marginTop: 12, padding: 12, background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                    <p style={{ fontSize: 13, color: '#fcd34d', fontWeight: 600, marginBottom: 8 }}>Remedial Plan</p>
                    {mod.remedial.recommendedActions?.map((a, j) => (
                      <p key={j} style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 4px' }}>&bull; {a}</p>
                    ))}
                    {mod.remedial.resources?.map((r, j) => (
                      <div key={j} style={{ marginTop: 4, padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                        <p style={{ fontSize: 12, color: '#e2e8f0', margin: 0 }}>{r.topic}: {r.description}</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{r.estimatedTime}</p>
                      </div>
                    ))}
                    <button style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 16px', marginTop: 8 }}
                      onClick={() => handleAdvance(mod.id, 85)}>
                      Mark Remedial Complete
                    </button>
                  </div>
                )}

                {!isComplete && modProgress >= 0 && modProgress < 100 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 16px' }}
                      onClick={() => handleAdvance(mod.id, 75)}>
                      Complete Module (75%)
                    </button>
                    <button style={{ ...STYLES.button, ...STYLES.buttonDanger, fontSize: 12, padding: '6px 16px' }}
                      onClick={() => handleCheckRemedial(mod.id, 65)}>
                      {remedialLoading ? 'Checking...' : 'Score <80%? Check Remedial'}
                    </button>
                  </div>
                )}

                {isComplete && (
                  <div style={{ marginTop: 8 }}>
                    <button style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 16px' }}
                      onClick={() => handleAdvance(mod.id, 92)}>
                      Mark Mastered (92%)
                    </button>
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
                      Current: {gap.current || '?'} &rarr; Target: {gap.target || '?'}
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

        {remedialResult && (
          <div style={STYLES.modal} onClick={() => setRemedialResult(null)}>
            <div style={{ ...STYLES.statCard, maxWidth: 500, margin: 'auto' }} onClick={e => e.stopPropagation()}>
              <p style={{ color: remedialResult.needsRemedial ? '#fcd34d' : '#6ee7b7', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
                {remedialResult.needsRemedial ? 'Remedial Content Needed' : 'No Remedial Needed'}
              </p>
              {remedialResult.needsRemedial && (
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Score: {remedialResult.remedial.score}% (threshold: {remedialResult.remedial.threshold}%)</p>
                  {remedialResult.remedial.recommendedActions?.map((a, i) => (
                    <p key={i} style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 4px' }}>&bull; {a}</p>
                  ))}
                </div>
              )}
              <button onClick={() => setRemedialResult(null)} style={{ ...STYLES.button, ...STYLES.buttonSecondary, marginTop: 12 }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </ThemeContainer>
  );
}
