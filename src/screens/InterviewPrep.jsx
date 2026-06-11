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
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(99,102,241,0.15)', paddingBottom: 0, overflowX: 'auto' },
  tab: {
    padding: '10px 20px', border: 'none', background: 'transparent', color: '#64748b',
    cursor: 'pointer', fontSize: 14, borderBottom: '2px solid transparent',
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  },
  tabActive: { color: '#a5b4fc', borderBottom: '2px solid #6366f1' },
  questionCard: {
    background: 'rgba(30,30,50,0.6)', borderRadius: 12, padding: 20, marginBottom: 12,
    border: '1px solid rgba(99,102,241,0.15)', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  questionTitle: { fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px' },
  questionMeta: { fontSize: 12, color: '#64748b', display: 'flex', gap: 16 },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11,
    fontWeight: 600, textTransform: 'uppercase',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    background: '#1e1e2e', borderRadius: 16, padding: 32, maxWidth: 640, width: '100%',
    maxHeight: '80vh', overflow: 'auto', border: '1px solid rgba(99,102,241,0.2)',
  },
  textarea: {
    width: '100%', minHeight: 150, padding: 12, borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)',
    background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit',
    resize: 'vertical', marginTop: 12,
  },
  button: {
    padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  buttonPrimary: { background: '#6366f1', color: '#fff' },
  buttonSecondary: { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' },
  buttonDanger: { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' },
  scoreBar: { height: 6, borderRadius: 3, background: 'rgba(99,102,241,0.15)', marginTop: 8, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#64748b' },
};

const categoryStyle = {
  behavioral: { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd', label: 'BEHAVIORAL' },
  technical: { bg: 'rgba(139,92,246,0.1)', color: '#c4b5fd', label: 'TECHNICAL' },
  leadership: { bg: 'rgba(16,185,129,0.1)', color: '#6ee7b7', label: 'LEADERSHIP' },
  opinion: { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d', label: 'OPINION' },
  vision: { bg: 'rgba(236,72,153,0.1)', color: '#f9a8d4', label: 'VISION' },
  experience: { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd', label: 'EXPERIENCE' },
};

function StatusBadge({ status }) {
  const colors = {
    active: { bg: 'rgba(16,185,129,0.1)', color: '#6ee7b7' },
    completed: { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd' },
    expired: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' },
    archived: { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' },
  };
  const c = colors[status] || colors.archived;
  return <span style={{ ...STYLES.badge, background: c.bg, color: c.color }}>{status}</span>;
}

function StarterSetup({ onPlanCreated }) {
  const { state } = useApp();
  const [jdText, setJdText] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (jdText.length < 50) { setError('JD must be at least 50 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await apiPost('/interview/analyze-jd', { jdText }, state.token);
      setAnalysis(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (jdText.length < 50) { setError('JD must be at least 50 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const mode = deadline && new Date(deadline) - new Date() < 24 * 60 * 60 * 1000 ? 'crash' : 'structured';
      const prep = await apiPost('/interview/plan', {
        jdText, jdAnalysis: analysis, targetRole, targetCompany, deadline, mode,
      }, state.token);
      onPlanCreated(prep);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>Start Interview Prep</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Target Role</label>
        <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior ML Engineer" style={{ ...STYLES.textarea, minHeight: 40 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Target Company</label>
        <input value={targetCompany} onChange={e => setTargetCompany(e.target.value)} placeholder="e.g. Google" style={{ ...STYLES.textarea, minHeight: 40 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Job Description</label>
        <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the job description here..." style={STYLES.textarea} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Interview Deadline</label>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ ...STYLES.textarea, minHeight: 40, width: 240 }} />
      </div>
      {error && <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {analysis && (
        <div style={{ ...STYLES.statCard, marginBottom: 16 }}>
          <p style={{ color: '#a5b4fc', fontWeight: 600, marginBottom: 8 }}>Gap Score: {analysis.data?.gapScore}/100</p>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{analysis.data?.recommendedFocus?.join(', ')}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleAnalyze} disabled={loading} style={{ ...STYLES.button, ...STYLES.buttonSecondary }}>
          {loading ? 'Analyzing...' : 'Analyze JD'}
        </button>
        <button onClick={handleCreate} disabled={loading} style={{ ...STYLES.button, ...STYLES.buttonPrimary }}>
          {loading ? 'Creating...' : 'Create Prep Plan'}
        </button>
      </div>
    </div>
  );
}

function StarPractice({ prep, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer || answer.length < 10) return;
    setSubmitting(true);
    try {
      await onAnswer(prep.id, selected.id, selected.question, answer, 'star');
      setSelected(null);
      setAnswer('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const answered = new Set((prep.answers || []).map(a => a.questionId));

  return (
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
        {prep.starQuestions?.length || 0} questions &middot; {answered.size} completed
      </p>
      {(prep.starQuestions || []).map((q) => {
        const done = answered.has(q.id);
        const catStyle = categoryStyle[q.category] || categoryStyle.behavioral;
        return (
          <div key={q.id} style={STYLES.questionCard} onClick={() => setSelected(q)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={STYLES.questionTitle}>{q.question}</p>
                <div style={STYLES.questionMeta}>
                  <span style={{ ...STYLES.badge, background: catStyle.bg, color: catStyle.color }}>{catStyle.label}</span>
                  <span>{q.difficulty}</span>
                  <span>{q.targetedSkill}</span>
                </div>
              </div>
              {done && <span style={{ color: '#6ee7b7', fontSize: 20 }}>&check;</span>}
            </div>
          </div>
        );
      })}

      {selected && (
        <div style={STYLES.modal} onClick={() => setSelected(null)}>
          <div style={STYLES.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 8px', fontSize: 18 }}>STAR Practice</h3>
            <p style={{ color: '#a5b4fc', fontSize: 14, marginBottom: 16 }}>{selected.question}</p>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{selected.suggestedFramework}</p>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Write your STAR answer... (Situation, Task, Action, Result)" style={STYLES.textarea} />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={handleSubmit} disabled={submitting || answer.length < 10} style={{ ...STYLES.button, ...STYLES.buttonPrimary }}>
                {submitting ? 'Evaluating...' : 'Submit for Feedback'}
              </button>
              <button onClick={() => setSelected(null)} style={{ ...STYLES.button, ...STYLES.buttonSecondary }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OvePractice({ prep, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer || answer.length < 10) return;
    setSubmitting(true);
    try {
      await onAnswer(prep.id, selected.id, selected.question, answer, 'ove');
      setSelected(null);
      setAnswer('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Opinion &middot; Vision &middot; Experience &mdash; deep dive questions</p>
      {(prep.oveQuestions || []).map((q) => {
        const catStyle = categoryStyle[q.type] || categoryStyle.opinion;
        return (
          <div key={q.id} style={STYLES.questionCard} onClick={() => setSelected(q)}>
            <p style={STYLES.questionTitle}>{q.question}</p>
            <div style={STYLES.questionMeta}>
              <span style={{ ...STYLES.badge, background: catStyle.bg, color: catStyle.color }}>{q.type.toUpperCase()}</span>
              <span>{q.depth}</span>
            </div>
          </div>
        );
      })}

      {selected && (
        <div style={STYLES.modal} onClick={() => setSelected(null)}>
          <div style={STYLES.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 8px', fontSize: 18 }}>OVE Response</h3>
            <p style={{ color: '#a5b4fc', fontSize: 14, marginBottom: 16 }}>{selected.question}</p>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Share your thoughts..." style={STYLES.textarea} />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={handleSubmit} disabled={submitting || answer.length < 10} style={{ ...STYLES.button, ...STYLES.buttonPrimary }}>
                {submitting ? 'Evaluating...' : 'Submit'}
              </button>
              <button onClick={() => setSelected(null)} style={{ ...STYLES.button, ...STYLES.buttonSecondary }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackView({ prep }) {
  const answers = prep.answers || [];
  return (
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
        Readiness Score: {prep.readinessScore || 0}/100 &middot; {answers.length} answers submitted
      </p>
      {answers.length === 0 && (
        <div style={STYLES.emptyState}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No answers yet</p>
          <p style={{ fontSize: 13 }}>Start practicing STAR questions to get feedback</p>
        </div>
      )}
      {[...answers].reverse().map((a, i) => (
        <div key={i} style={STYLES.questionCard}>
          <p style={STYLES.questionTitle}>{a.question || a.questionId}</p>
          <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
            <span style={{ ...STYLES.badge, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>Score: {a.score}/100</span>
            <span style={{ ...STYLES.badge, background: 'rgba(100,116,139,0.1)', color: '#94a3b8' }}>{a.type}</span>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{a.answer?.slice(0, 300)}...</p>
          {a.strengths?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 600, marginBottom: 4 }}>Strengths</p>
              {a.strengths.map((s, j) => <p key={j} style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>&bull; {s}</p>)}
            </div>
          )}
          {a.weaknesses?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>Areas to Improve</p>
              {a.weaknesses.map((w, j) => <p key={j} style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>&bull; {w}</p>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MockInterview({ prep, onAnswer }) {
  const { state } = useApp();
  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);

  const startMock = async () => {
    try {
      const s = await apiPost('/interview/mock/start', { prepId: prep.id }, state.token);
      setSession(s);
      setCurrentQ(s.questions[0]);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSubmit = async () => {
    if (!answer || answer.length < 10) return;
    setSubmitting(true);
    try {
      const result = await apiPost('/interview/mock/respond', {
        prepId: prep.id, question: currentQ.question, answer, questionId: currentQ.id,
      }, state.token);
      setFeedback(result.feedback);

      const idx = session.questions.findIndex(q => q.id === currentQ.id);
      if (idx < session.questions.length - 1) {
        setTimeout(() => {
          setCurrentQ(session.questions[idx + 1]);
          setAnswer('');
          setFeedback(null);
        }, 2000);
      } else {
        setDone(true);
        setCurrentQ(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#127942;</div>
        <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>Mock Interview Complete!</h3>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>Great work completing the mock interview. Check the Feedback tab for detailed results.</p>
        <button onClick={() => { setSession(null); setDone(false); setFeedback(null); }}
          style={{ ...STYLES.button, ...STYLES.buttonPrimary }}>Start New Mock</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#127908;</div>
        <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>Mock Interview</h3>
        <p style={{ color: '#94a3b8', marginBottom: 8 }}>Simulate a real interview with timed questions and AI feedback.</p>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
          5 random unanswered questions &middot; timed responses &middot; instant scoring
        </p>
        <button onClick={startMock} style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '14px 40px', fontSize: 16 }}>
          Start Simulated Interview
        </button>
      </div>
    );
  }

  const progress = session.questions.findIndex(q => q.id === currentQ?.id) + 1;
  const total = session.questions.length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Question {progress} of {total}</span>
          <span style={{ color: '#a5b4fc', fontSize: 13 }}>{Math.round((progress / total) * 100)}%</span>
        </div>
        <div style={STYLES.scoreBar}>
          <div style={{ ...STYLES.scoreFill, width: `${(progress / total) * 100}%`, background: '#6366f1' }} />
        </div>
      </div>

      {feedback && (
        <div style={{ ...STYLES.statCard, marginBottom: 20, borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)' }}>
          <p style={{ color: '#a5b4fc', fontWeight: 600, marginBottom: 8 }}>Score: {feedback.score}/100</p>
          {feedback.strengths?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 600, marginBottom: 4 }}>Strengths</p>
              {feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>&bull; {s}</p>)}
            </div>
          )}
          {feedback.weaknesses?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>Areas to Improve</p>
              {feedback.weaknesses.map((w, i) => <p key={i} style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>&bull; {w}</p>)}
            </div>
          )}
          <p style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>
            Next question loading...
          </p>
        </div>
      )}

      {!feedback && currentQ && (
        <div style={STYLES.questionCard}>
          <p style={STYLES.questionTitle}>{currentQ.question}</p>
          <div style={STYLES.questionMeta}>
            <span style={{ ...STYLES.badge, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>{currentQ.category}</span>
            <span>{currentQ.difficulty}</span>
            <span>{currentQ.targetedSkill}</span>
          </div>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)}
            placeholder="Answer as you would in a real interview..." style={STYLES.textarea} />
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={handleSubmit} disabled={submitting || answer.length < 10}
              style={{ ...STYLES.button, ...STYLES.buttonPrimary }}>
              {submitting ? 'Evaluating...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsView({ userId, token }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    apiGet(`/interview/${userId}/analytics`, token).then(setAnalytics).catch(console.error).finally(() => setLoading(false));
  }, [userId, token]);

  if (loading) return <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading analytics...</p>;
  if (!analytics) return <div style={STYLES.emptyState}><p>No analytics data yet.</p></div>;

  return (
    <div>
      <div style={STYLES.statsRow}>
        <div style={STYLES.statCard}>
          <p style={STYLES.statValue}>{analytics.overallAvgScore || 0}</p>
          <p style={STYLES.statLabel}>Avg Score</p>
        </div>
        <div style={STYLES.statCard}>
          <p style={STYLES.statValue}>{analytics.totalAnswers}</p>
          <p style={STYLES.statLabel}>Answers</p>
        </div>
        <div style={STYLES.statCard}>
          <p style={STYLES.statValue}>{analytics.highestScore}</p>
          <p style={STYLES.statLabel}>Highest</p>
        </div>
        <div style={STYLES.statCard}>
          <p style={STYLES.statValue}>{analytics.totalSessions}</p>
          <p style={STYLES.statLabel}>Sessions</p>
        </div>
      </div>

      {Object.keys(analytics.categoryAverages || {}).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>Score by Category</h3>
          {Object.entries(analytics.categoryAverages).map(([cat, score]) => (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
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

      {analytics.topStrengths?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#6ee7b7', marginBottom: 12 }}>Top Strengths</h3>
          {analytics.topStrengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 4, padding: '8px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: 8 }}>
              <span>{s.name}</span>
              <span style={{ color: '#6ee7b7' }}>x{s.count}</span>
            </div>
          ))}
        </div>
      )}

      {analytics.topWeaknesses?.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, color: '#fca5a5', marginBottom: 12 }}>Areas to Improve</h3>
          {analytics.topWeaknesses.map((w, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 4, padding: '8px 12px', background: 'rgba(239,68,68,0.05)', borderRadius: 8 }}>
              <span>{w.name}</span>
              <span style={{ color: '#fca5a5' }}>x{w.count}</span>
            </div>
          ))}
        </div>
      )}

      {analytics.progressOverTime?.length > 1 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>Progress Over Time</h3>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120, padding: '12px 0' }}>
            {analytics.progressOverTime.map((p, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%', maxWidth: 40, height: `${p.avgScore}%`, minHeight: 4,
                  background: p.avgScore >= 80 ? '#6ee7b7' : p.avgScore >= 60 ? '#fcd34d' : '#fca5a5',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s',
                }} />
                <span style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>{new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PassportView({ passport }) {
  if (!passport) return null;
  const competencyProfile = passport.competencyProfile || [];
  const starHighlights = passport.starHighlights || [];
  const gapClosure = passport.gapClosure || [];

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
      <head><title>Skill Passport - ${passport.candidateName || 'Candidate'}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
        h2 { font-size: 18px; margin: 20px 0 12px; border-bottom: 2px solid #eee; padding-bottom: 4px; }
        .skill { margin-bottom: 8px; }
        .skill-name { font-weight: 600; }
        .bar { height: 8px; background: #e5e7eb; border-radius: 4px; margin: 4px 0 8px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 4px; background: #6366f1; }
        .highlight { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
        .highlight-score { color: #6366f1; font-weight: 600; }
        .gap { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
        .assessment { background: #f9fafb; padding: 16px; border-radius: 8px; font-style: italic; margin-top: 20px; }
        .footer { margin-top: 32px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
      </style>
      </head>
      <body>
        <h1>&#128483; Skill Passport</h1>
        <div class="meta">
          ${passport.candidateName ? `<p><strong>${passport.candidateName}</strong></p>` : ''}
          ${passport.targetRole ? `<p>Target: ${passport.targetRole}${passport.targetCompany ? ' @ ' + passport.targetCompany : ''}</p>` : ''}
          <p>Generated: ${new Date(passport.generatedAt).toLocaleDateString()} | Mode: ${passport.prepMode} | Readiness: ${passport.readinessScore}/100</p>
        </div>

        <h2>Competency Profile</h2>
        ${competencyProfile.map(c => `
          <div class="skill">
            <div class="skill-name">${c.skill} <span style="float:right">${c.score}/100${c.change !== '+0' ? ' (' + c.change + ')' : ''}</span></div>
            <div class="bar"><div class="bar-fill" style="width:${c.score}%"></div></div>
          </div>
        `).join('')}

        ${starHighlights.length > 0 ? `
        <h2>STAR Highlights</h2>
        ${starHighlights.map(h => `
          <div class="highlight">
            <div class="highlight-score">Score: ${h.score}/100</div>
            <p style="font-size:13px">"${h.excerpt || ''}"</p>
          </div>
        `).join('')}` : ''}

        ${gapClosure.length > 0 ? `
        <h2>Gap Closure</h2>
        ${gapClosure.map(g => `
          <div class="gap">
            <span>${g.skill}: ${g.before} &rarr; ${g.after}</span>
            <span style="color:#059669">${g.status}</span>
          </div>
        `).join('')}` : ''}

        ${passport.overallAssessment ? `
        <div class="assessment">${passport.overallAssessment}</div>` : ''}

        <div class="footer">Generated by Synapse AI &middot; Verify at synapse.ai/passport/verify</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 20, margin: 0 }}>Skill Passport</h3>
        <button onClick={handlePrint} style={{ ...STYLES.button, ...STYLES.buttonSecondary }}>
          &#128196; Download PDF
        </button>
      </div>
      <div style={{ ...STYLES.statCard, marginTop: 0 }}>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 20 }}>
          Generated {new Date(passport.generatedAt).toLocaleDateString()} &middot; Readiness: {passport.readinessScore}/100
        </p>
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ color: '#a5b4fc', fontSize: 14, marginBottom: 12 }}>Competency Profile</h4>
          {competencyProfile.map((c, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
                <span>{c.skill}</span>
                <span>{c.score}/100 {c.change !== '+0' && <span style={{ color: '#6ee7b7' }}>({c.change})</span>}</span>
              </div>
              <div style={STYLES.scoreBar}>
                <div style={{ ...STYLES.scoreFill, width: `${c.score}%`, background: c.score >= 80 ? '#6ee7b7' : c.score >= 60 ? '#fcd34d' : '#fca5a5' }} />
              </div>
            </div>
          ))}
        </div>
        {starHighlights.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#a5b4fc', fontSize: 14, marginBottom: 12 }}>STAR Highlights</h4>
            {starHighlights.map((h, i) => (
              <div key={i} style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 8 }}>
                <p style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>Score: {h.score}/100</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>"{h.excerpt}"</p>
              </div>
            ))}
          </div>
        )}
        {gapClosure.length > 0 && (
          <div>
            <h4 style={{ color: '#a5b4fc', fontSize: 14, marginBottom: 12 }}>Gap Closure</h4>
            {gapClosure.map((g, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
                <span>{g.skill}: {g.before} &rarr; {g.after}</span>
                <span style={{ color: '#6ee7b7' }}>{g.status}</span>
              </div>
            ))}
          </div>
        )}
        <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 20, fontStyle: 'italic' }}>{passport.overallAssessment}</p>
      </div>
    </div>
  );
}

export default function InterviewPrep() {
  const { state, navigate } = useApp();
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('setup');
  const [completing, setCompleting] = useState(false);

  const fetchPrep = useCallback(async () => {
    try {
      const data = await apiGet(`/interview/${state.user.id}`, state.token);
      if (data && !data.noActivePrep) {
        setPrep(data);
        if (data.status === 'completed' && data.passport) setTab('passport');
        else setTab('star');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [state.user?.id, state.token]);

  useEffect(() => { fetchPrep(); }, [fetchPrep]);

  const handlePlanCreated = (p) => {
    setPrep(p);
    setTab('star');
  };

  const handleAnswer = async (prepId, questionId, question, answer, type) => {
    await apiPost('/interview/answer', { prepId, questionId, question, answer, type }, state.token);
    fetchPrep();
  };

  const handleComplete = async () => {
    if (!prep) return;
    setCompleting(true);
    try {
      const result = await apiPost('/interview/complete', { prepId: prep.id }, state.token);
      setPrep({ ...prep, status: 'completed', passport: result.passport });
      setTab('passport');
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  const handleExtend = async () => {
    try {
      await apiPost(`/interview/${prep.id}/extend`, {}, state.token);
      fetchPrep();
    } catch (e) {
      console.error(e);
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

  if (!prep || tab === 'setup') {
    return (
      <ThemeContainer>
        <div style={STYLES.container}>
          <div style={STYLES.header}>
            <h1 style={STYLES.title}>Interview Preparation</h1>
            <p style={STYLES.subtitle}>Set up your interview prep plan in minutes</p>
          </div>
          <StarterSetup onPlanCreated={handlePlanCreated} />
        </div>
      </ThemeContainer>
    );
  }

  const progress = prep.prepProgress || {};
  const totalQs = (prep.starQuestions?.length || 0) + (prep.oveQuestions?.length || 0);
  const answeredCount = (prep.answers || []).length;

  const showTabs = ['star', 'ove', 'mock', 'feedback', 'analytics', 'passport'];

  return (
    <ThemeContainer>
      <div style={STYLES.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={STYLES.title}>Interview Prep</h1>
            <p style={STYLES.subtitle}>
              {prep.jdSummary || 'Interview Preparation'}
              {prep.mode && ` \u00B7 ${prep.mode === 'crash' ? '\uD83D\uDE80 Crash Mode' : '\uD83D\uDCC5 Structured Mode'}`}
            </p>
          </div>
          <StatusBadge status={prep.status} />
        </div>

        <div style={STYLES.statsRow}>
          <div style={STYLES.statCard}>
            <p style={STYLES.statValue}>{prep.readinessScore || 0}</p>
            <p style={STYLES.statLabel}>Readiness Score</p>
          </div>
          <div style={STYLES.statCard}>
            <p style={STYLES.statValue}>{answeredCount}/{totalQs}</p>
            <p style={STYLES.statLabel}>Questions Done</p>
          </div>
          <div style={STYLES.statCard}>
            <p style={STYLES.statValue}>{progress.avgScore || 0}</p>
            <p style={STYLES.statLabel}>Avg Score</p>
          </div>
        </div>

        {prep.expiresAt && (
          <div style={{ ...STYLES.statCard, marginBottom: 20, background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <p style={{ fontSize: 13, color: '#fcd34d', margin: 0 }}>
              {prep.mode === 'crash' ? '\uD83D\uDE80' : '\uD83D\uDCC5'} Expires: {new Date(prep.expiresAt).toLocaleDateString()}
              {new Date(prep.expiresAt) < new Date() && ' (EXPIRED)'}
            </p>
          </div>
        )}

        <div style={STYLES.tabs}>
          {showTabs.filter(t => {
            if (t === 'passport') return prep.status === 'completed' && prep.passport;
            if (t === 'analytics') return true;
            return true;
          }).map(t => (
            <button key={t} style={{ ...STYLES.tab, ...(tab === t ? STYLES.tabActive : {}) }} onClick={() => setTab(t)}>
              {t === 'star' ? 'STAR Practice' : t === 'ove' ? 'OVE' : t === 'mock' ? 'Mock Interview' : t === 'feedback' ? 'Feedback' : t === 'analytics' ? 'Analytics' : 'Passport'}
            </button>
          ))}
        </div>

        {prep.status === 'expired' && (
          <div style={{ padding: 20, background: 'rgba(239,68,68,0.1)', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ color: '#fca5a5', marginBottom: 12 }}>This prep session has expired.</p>
            <button onClick={handleExtend} style={{ ...STYLES.button, ...STYLES.buttonSecondary }}>Extend 7 Days</button>
          </div>
        )}

        {tab === 'star' && prep.status === 'active' && <StarPractice prep={prep} onAnswer={handleAnswer} />}
        {tab === 'star' && prep.status !== 'active' && (
          <div style={STYLES.emptyState}><p>This session is no longer active for practice.</p></div>
        )}
        {tab === 'ove' && <OvePractice prep={prep} onAnswer={handleAnswer} />}
        {tab === 'mock' && <MockInterview prep={prep} onAnswer={handleAnswer} />}
        {tab === 'feedback' && <FeedbackView prep={prep} />}
        {tab === 'analytics' && <AnalyticsView userId={state.user?.id} token={state.token} />}
        {tab === 'passport' && <PassportView passport={prep.passport} />}

        {prep.status === 'active' && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button onClick={handleComplete} disabled={completing} style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '12px 40px', fontSize: 16 }}>
              {completing ? 'Generating Passport...' : 'Complete Prep &amp; Generate Skill Passport'}
            </button>
          </div>
        )}
      </div>
    </ThemeContainer>
  );
}
