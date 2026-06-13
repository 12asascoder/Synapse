import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STYLES = {
  container: { maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  header: { marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' },
  subtitle: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },
  card: { background: 'var(--bg-card)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)' },
  statValue: { fontSize: '28px', fontWeight: 700, color: 'var(--border-active)', margin: '0 0 4px' },
  statLabel: { fontSize: '12px', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' },
  tab: { padding: '10px 20px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', borderBottom: '2px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' },
  tabActive: { color: 'var(--text-primary)', borderBottom: '2px solid var(--border-active)' },
  button: { padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' },
  buttonPrimary: { background: 'var(--border-active)', color: '#010203' },
  buttonSecondary: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', marginTop: '8px', boxSizing: 'border-box' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' },
  scoreBar: { height: '6px', borderRadius: '3px', background: 'var(--bg-card)', marginTop: '8px', overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' },
};

const outerStyle = { minHeight: '100vh', background: '#010203', display: 'flex', color: '#f3f2ee' };
const rightColStyle = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' };

const difficultyColors = { Easy: { bg: 'rgba(16,185,129,0.1)', color: '#6ee7b7' }, Medium: { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d' }, Hard: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' } };
const frequencyColors = { 'Most Asked': { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5' }, 'Frequently Asked': { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d' }, 'Occasionally Asked': { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' } };

function apiGet(path, token) {
  return fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
}
function apiPost(path, body, token) {
  return fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }).then(r => r.json());
}

// ─── Setup Screen ────────────────────────────────────────────────────────────

function SetupView({ onCreated }) {
  const { state } = useApp();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!company || !interviewDate) { setError('Company and interview date are required'); return; }
    setLoading(true); setError('');
    try {
      const prep = await apiPost('/interview/setup', { company, role, interviewDate, resumeText, jdText }, state.token);
      onCreated(prep);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ ...STYLES.card, marginBottom: '24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>🎯</span> Interview Setup
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company *</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" style={STYLES.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Role</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer" style={STYLES.input} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interview Date & Time *</label>
            <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} style={{ ...STYLES.input, maxWidth: 300 }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resume (Paste text)</label>
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume content here..." rows={5} style={STYLES.textarea} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Description</label>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the job description here..." rows={5} style={STYLES.textarea} />
          </div>
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSubmit} disabled={loading} style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '12px 32px', opacity: loading ? 0.5 : 1 }}>
          {loading ? 'Creating Plan...' : 'Create Preparation Plan →'}
        </button>
      </div>
    </div>
  );
}

// ─── Timeline View ───────────────────────────────────────────────────────────

function TimelineView({ prep }) {
  const { interviewDate, timeline, skillGapAnalysis } = prep;
  const timeLeft = interviewDate ? new Date(interviewDate) - new Date() : 0;
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60)));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={STYLES.card}>
          <p style={STYLES.statValue}>{daysLeft}d</p>
          <p style={STYLES.statLabel}>Days Until Interview</p>
        </div>
        <div style={STYLES.card}>
          <p style={STYLES.statValue}>{hoursLeft}h</p>
          <p style={STYLES.statLabel}>Hours Remaining</p>
        </div>
        <div style={STYLES.card}>
          <p style={STYLES.statValue}>{skillGapAnalysis?.gapScore || '?'}/100</p>
          <p style={STYLES.statLabel}>Skill Gap Score</p>
        </div>
      </div>

      {skillGapAnalysis && (
        <div style={{ ...STYLES.card, marginBottom: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>Skill Gap Analysis</div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Recommended Focus</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(skillGapAnalysis.recommendedFocus || []).map((f, i) => (
                <span key={i} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: 'var(--border-active)', fontSize: '12px', fontWeight: 500 }}>{f}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#6ee7b7', marginBottom: '6px', fontWeight: 600 }}>Matched Skills</div>
              {(skillGapAnalysis.matchedSkills || []).slice(0, 8).map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '2px 0' }}>✓ {s}</div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '6px', fontWeight: 600 }}>Missing Skills</div>
              {(skillGapAnalysis.missingSkills || []).slice(0, 8).map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '2px 0' }}>✗ {s}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px' }}>Preparation Timeline</div>
      {(!timeline || timeline.length === 0) ? (
        <div style={STYLES.emptyState}><p>Timeline being generated...</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {timeline.map((item, i) => {
            const typeColors = { concept: { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd', label: 'Concept' }, practice: { bg: 'rgba(139,92,246,0.1)', color: '#c4b5fd', label: 'Practice' }, mock: { bg: 'rgba(16,185,129,0.1)', color: '#6ee7b7', label: 'Mock' }, revision: { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d', label: 'Revision' } };
            const tc = typeColors[item.type] || typeColors.concept;
            return (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: tc.bg, color: tc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>{item.day}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{item.focus}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ ...STYLES.badge, background: tc.bg, color: tc.color }}>{tc.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.duration}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mock Interview ──────────────────────────────────────────────────────────

function MockInterviewView({ prep, onRefresh }) {
  const { state } = useApp();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [round, setRound] = useState('technical');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`/interview/${state.user.id}`, state.token).then(data => {
      if (Array.isArray(data)) {
        const preps = data;
        if (preps.length > 0) {
          apiGet(`/interview/mock/history/${preps[0].id}`, state.token).then(h => setSessions(h || [])).catch(() => {});
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [state.user?.id, state.token]);

  const startMock = async () => {
    const activePreps = await apiGet(`/interview/active/${state.user.id}`, state.token);
    if (activePreps.noActivePrep) { alert('No active interview prep found. Set one up first.'); return; }
    try {
      const s = await apiPost('/interview/mock/start', { prepId: activePreps.id, round }, state.token);
      setActiveSession(s);
      setCurrentQ(s.questions[0]);
      setFeedback(null);
    } catch (e) { alert(e.message); }
  };

  const handleSubmit = async () => {
    if (!answer || answer.length < 10) return;
    setSubmitting(true);
    try {
      const result = await apiPost('/interview/mock/respond', { sessionId: activeSession.id, questionId: currentQ.id, question: currentQ.question, answer }, state.token);
      setFeedback(result.feedback);
      const idx = activeSession.questions.findIndex(q => q.id === currentQ.id);
      if (idx < activeSession.questions.length - 1) {
        setTimeout(() => { setCurrentQ(activeSession.questions[idx + 1]); setAnswer(''); setFeedback(null); }, 2000);
      } else {
        await apiPost('/interview/mock/complete', { sessionId: activeSession.id }, state.token);
        setActiveSession(null);
        setCurrentQ(null);
        setFeedback(null);
        onRefresh();
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  if (activeSession && currentQ) {
    const progress = activeSession.questions.findIndex(q => q.id === currentQ.id) + 1;
    const total = activeSession.questions.length;
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Question {progress} of {total}</span>
            <span style={{ color: 'var(--border-active)', fontSize: 13 }}>{Math.round((progress / total) * 100)}%</span>
          </div>
          <div style={STYLES.scoreBar}>
            <div style={{ ...STYLES.scoreFill, width: `${(progress / total) * 100}%`, background: 'var(--border-active)' }} />
          </div>
        </div>

        {feedback && (
          <div style={{ ...STYLES.card, marginBottom: 20, borderColor: 'rgba(99,102,241,0.3)' }}>
            <p style={{ color: 'var(--border-active)', fontWeight: 600, marginBottom: 8 }}>Score: {feedback.score}/100</p>
            {feedback.strengths?.length > 0 && <div style={{ marginBottom: 8 }}><p style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 600 }}>Strengths</p>{feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>• {s}</p>)}</div>}
            {feedback.weaknesses?.length > 0 && <div style={{ marginBottom: 8 }}><p style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600 }}>Areas to Improve</p>{feedback.weaknesses.map((w, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>• {w}</p>)}</div>}
            <p style={{ color: 'var(--text-secondary)', fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>Next question loading...</p>
          </div>
        )}

        {!feedback && (
          <div style={STYLES.card}>
            <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
              <span style={{ ...STYLES.badge, background: 'rgba(99,102,241,0.1)', color: 'var(--border-active)' }}>{currentQ.category}</span>
              <span style={{ ...STYLES.badge, background: 'rgba(100,116,139,0.1)', color: 'var(--text-secondary)' }}>{currentQ.difficulty}</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>{currentQ.question}</div>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer..." rows={5} style={STYLES.textarea} />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={handleSubmit} disabled={submitting || answer.length < 10} style={{ ...STYLES.button, ...STYLES.buttonPrimary, opacity: submitting || answer.length < 10 ? 0.5 : 1 }}>
                {submitting ? 'Evaluating...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <select value={round} onChange={e => setRound(e.target.value)} style={{ ...STYLES.input, maxWidth: '200px' }}>
          <option value="technical">Technical</option>
          <option value="behavioral">Behavioral</option>
          <option value="system-design">System Design</option>
          <option value="problem-solving">Problem Solving</option>
        </select>
        <button onClick={startMock} style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '12px 24px' }}>Start Mock Interview</button>
      </div>

      {sessions.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>Past Sessions</div>
          {sessions.map((s, i) => (
            <div key={s.id || i} style={{ ...STYLES.card, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{s.round} · Score: {s.overallScore}/100</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.questions?.length || 0} questions · {new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              <span style={{ ...STYLES.badge, background: s.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: s.status === 'completed' ? '#6ee7b7' : '#fcd34d' }}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Weak Topics & Analysis ──────────────────────────────────────────────────

function WeakTopicsView({ prep, onRefresh }) {
  const { state } = useApp();
  const [weakTopics, setWeakTopics] = useState([]);
  const [showReinterview, setShowReinterview] = useState(false);
  const [reinterviewSession, setReinterviewSession] = useState(null);
  const [reinterviewQ, setReinterviewQ] = useState(null);
  const [reinterviewAnswer, setReinterviewAnswer] = useState('');
  const [reinterviewFeedback, setReinterviewFeedback] = useState(null);
  const [reinterviewSubmitting, setReinterviewSubmitting] = useState(false);

  useEffect(() => {
    if (prep?.id) {
      apiGet(`/interview/${prep.id}/weak-topics`, state.token).then(setWeakTopics).catch(() => {});
    }
  }, [prep?.id, state.token]);

  const handleStartReinterview = async () => {
    try {
      const result = await apiPost(`/interview/${prep.id}/weak-reinterview`, { topics: weakTopics.filter(w => !w.mastered).map(w => w.topic) }, state.token);
      setReinterviewSession(result.session);
      setReinterviewQ(result.session.questions[0]);
      setShowReinterview(true);
    } catch (e) { alert(e.message); }
  };

  const handleReinterviewSubmit = async () => {
    if (!reinterviewAnswer || reinterviewAnswer.length < 10) return;
    setReinterviewSubmitting(true);
    try {
      const result = await apiPost('/interview/mock/respond', { sessionId: reinterviewSession.id, questionId: reinterviewQ.id, question: reinterviewQ.question, answer: reinterviewAnswer }, state.token);
      setReinterviewFeedback(result.feedback);
      const idx = reinterviewSession.questions.findIndex(q => q.id === reinterviewQ.id);
      if (idx < reinterviewSession.questions.length - 1) {
        setTimeout(() => { setReinterviewQ(reinterviewSession.questions[idx + 1]); setReinterviewAnswer(''); setReinterviewFeedback(null); }, 2000);
      } else {
        await apiPost('/interview/mock/complete', { sessionId: reinterviewSession.id }, state.token);
        setShowReinterview(false);
        setReinterviewSession(null);
        setReinterviewFeedback(null);
        onRefresh();
      }
    } catch (e) { console.error(e); } finally { setReinterviewSubmitting(false); }
  };

  const handleMarkMastered = async (topic) => {
    await apiPost('/interview/weak-topics/master', { prepId: prep.id, topic }, state.token);
    setWeakTopics(prev => prev.map(w => w.topic === topic ? { ...w, mastered: true } : w));
  };

  if (showReinterview && reinterviewQ) {
    return (
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Targeted Re-Interview</div>
          <button onClick={() => { setShowReinterview(false); setReinterviewSession(null); }} style={{ ...STYLES.button, ...STYLES.buttonSecondary, padding: '6px 14px', fontSize: 12 }}>Cancel</button>
        </div>
        {reinterviewFeedback && (
          <div style={{ ...STYLES.card, marginBottom: 20, borderColor: 'rgba(99,102,241,0.3)' }}>
            <p style={{ color: 'var(--border-active)', fontWeight: 600, marginBottom: 8 }}>Score: {reinterviewFeedback.score}/100</p>
            {reinterviewFeedback.strengths?.length > 0 && <div><p style={{ fontSize: 12, color: '#6ee7b7' }}>Strengths</p>{reinterviewFeedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>• {s}</p>)}</div>}
            {reinterviewFeedback.weaknesses?.length > 0 && <div><p style={{ fontSize: 12, color: '#fca5a5' }}>Areas to Improve</p>{reinterviewFeedback.weaknesses.map((w, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>• {w}</p>)}</div>}
          </div>
        )}
        {!reinterviewFeedback && (
          <div style={STYLES.card}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>{reinterviewQ.question}</div>
            <textarea value={reinterviewAnswer} onChange={e => setReinterviewAnswer(e.target.value)} placeholder="Type your answer..." rows={5} style={STYLES.textarea} />
            <button onClick={handleReinterviewSubmit} disabled={reinterviewSubmitting || reinterviewAnswer.length < 10} style={{ ...STYLES.button, ...STYLES.buttonPrimary, marginTop: 12 }}>
              {reinterviewSubmitting ? 'Evaluating...' : 'Submit'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px' }}>
        Weak Topics {weakTopics.filter(w => !w.mastered).length > 0 && <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>({weakTopics.filter(w => !w.mastered).length} remaining)</span>}
      </div>

      {weakTopics.length === 0 ? (
        <div style={STYLES.emptyState}>
          <p>No weak topics identified yet. Complete a mock interview first.</p>
        </div>
      ) : (
        weakTopics.map((wt, i) => (
          <div key={i} style={{ ...STYLES.card, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{wt.topic}</span>
                <span style={{ ...STYLES.badge, background: wt.score >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: wt.score >= 70 ? '#6ee7b7' : '#fca5a5' }}>{wt.score}/100</span>
                {wt.mastered && <span style={{ ...STYLES.badge, background: 'rgba(16,185,129,0.1)', color: '#6ee7b7' }}>MASTERED</span>}
              </div>
              {wt.recommendation && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{wt.recommendation}</div>}
            </div>
            {!wt.mastered && (
              <button onClick={() => handleMarkMastered(wt.topic)} style={{ ...STYLES.button, ...STYLES.buttonSecondary, padding: '6px 14px', fontSize: 12, marginLeft: 12 }}>Mark Mastered</button>
            )}
          </div>
        ))
      )}

      {weakTopics.filter(w => !w.mastered).length > 0 && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button onClick={handleStartReinterview} style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '12px 32px' }}>
            Practice Weak Topics
          </button>
        </div>
      )}

      {prep && prep.status === 'active' && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ ...STYLES.card, borderColor: 'rgba(245,158,11,0.3)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fcd34d', marginBottom: '8px' }}>Had your real interview?</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Mark it as completed and get a detailed weak topics analysis.</p>
            <MarkComplete prep={prep} onDone={onRefresh} />
          </div>
        </div>
      )}
    </div>
  );
}

function MarkComplete({ prep, onDone }) {
  const { state } = useApp();
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await apiPost(`/interview/${prep.id}/complete`, { feedback }, state.token);
      onDone();
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  return (
    <div>
      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="How did it go? What topics came up? How do you feel you performed?" rows={3} style={STYLES.textarea} />
      <button onClick={handleComplete} disabled={submitting} style={{ ...STYLES.button, ...STYLES.buttonPrimary, marginTop: '8px' }}>
        {submitting ? 'Analyzing...' : 'Complete & Analyze'}
      </button>
    </div>
  );
}

// ─── DSA Questions ───────────────────────────────────────────────────────────

function DSAQuestionsView({ prep }) {
  const { state } = useApp();
  const [questions, setQuestions] = useState([]);
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prep?.id) return;
    apiGet(`/interview/${prep.id}/dsa-questions`, state.token).then(data => { setQuestions(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));
  }, [prep?.id, state.token]);

  const handleToggleSolved = async (q) => {
    const newSolved = !q.solved;
    await apiPost('/interview/dsa/attempt', { company: prep.company, questionTitle: q.title, topic: q.topic, difficulty: q.difficulty, frequency: q.frequency, solved: newSolved }, state.token);
    setQuestions(prev => prev.map(item => item.title === q.title ? { ...item, solved: newSolved } : item));
  };

  const topics = [...new Set(questions.map(q => q.topic).filter(Boolean))];
  const filtered = questions.filter(q => {
    if (filterTopic !== 'all' && q.topic !== filterTopic) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    return true;
  });

  const solvedCount = questions.filter(q => q.solved).length;

  if (loading) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading DSA questions...</p>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={STYLES.card}>
          <p style={STYLES.statValue}>{questions.length}</p>
          <p style={STYLES.statLabel}>Total Questions</p>
        </div>
        <div style={STYLES.card}>
          <p style={STYLES.statValue}>{solvedCount}</p>
          <p style={STYLES.statLabel}>Solved</p>
        </div>
        <div style={STYLES.card}>
          <p style={STYLES.statValue}>{questions.length - solvedCount}</p>
          <p style={STYLES.statLabel}>Remaining</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} style={{ ...STYLES.input, maxWidth: '200px' }}>
          <option value="all">All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} style={{ ...STYLES.input, maxWidth: '160px' }}>
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={STYLES.emptyState}><p>No questions match your filters.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((q, i) => {
            const dc = difficultyColors[q.difficulty] || difficultyColors.Medium;
            const fc = frequencyColors[q.frequency] || frequencyColors['Occasionally Asked'];
            return (
              <div key={i} style={{ ...STYLES.card, display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer', opacity: q.solved ? 0.6 : 1 }} onClick={() => handleToggleSolved(q)}>
                <div style={{ fontSize: '18px', color: q.solved ? '#6ee7b7' : 'var(--text-muted)' }}>{q.solved ? '✓' : '○'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{q.title}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ ...STYLES.badge, background: dc.bg, color: dc.color }}>{q.difficulty}</span>
                    <span style={{ ...STYLES.badge, background: 'rgba(99,102,241,0.1)', color: 'var(--border-active)' }}>{q.topic}</span>
                    <span style={{ ...STYLES.badge, background: fc.bg, color: fc.color }}>{q.frequency}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InterviewPrep() {
  const { state, navigate } = useApp();
  const [preps, setPreps] = useState([]);
  const [activePrep, setActivePrep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('setup');
  const [error, setError] = useState('');

  const fetchPreps = useCallback(async () => {
    try {
      const data = await apiGet(`/interview/${state.user.id}`, state.token);
      if (Array.isArray(data) && data.length > 0) {
        setPreps(data);
        const active = data.find(p => p.status === 'active') || data[0];
        setActivePrep(active);
        setTab('timeline');
      }
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [state.user?.id, state.token]);

  useEffect(() => { fetchPreps(); }, [fetchPreps]);

  const handlePrepCreated = (prep) => {
    setActivePrep(prep);
    setPreps(prev => [prep, ...prev]);
    setTab('timeline');
  };

  if (loading) {
    return (
      <div style={outerStyle}>
        <Sidebar />
        <div style={rightColStyle}>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = activePrep ? ['timeline', 'mock', 'weak', 'dsa'] : ['setup'];
  const tabLabels = { setup: 'Setup', timeline: 'Timeline', mock: 'Mock Interview', weak: 'Weak Topics', dsa: 'DSA Questions' };

  return (
    <div style={outerStyle}>
      <Sidebar />
      <div style={rightColStyle}>
        <div style={STYLES.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={STYLES.header}>
              <h1 style={STYLES.title}>Interview Preparation</h1>
              <p style={STYLES.subtitle}>
                {activePrep ? `${activePrep.company}${activePrep.role ? ` — ${activePrep.role}` : ''}` : 'Set up your interview prep'}
              </p>
            </div>
            {activePrep && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => { setActivePrep(null); setPreps([]); setTab('setup'); }} style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 14px' }}>New Prep</button>
                <span style={{ ...STYLES.badge, background: activePrep.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: activePrep.status === 'active' ? '#6ee7b7' : '#94a3b8' }}>{activePrep.status}</span>
              </div>
            )}
          </div>

          {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          {preps.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', padding: '4px 0' }}>
              {preps.map(p => (
                <button key={p.id} onClick={() => { setActivePrep(p); }} style={{
                  padding: '6px 14px', borderRadius: '8px', border: '1px solid', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: activePrep?.id === p.id ? 'rgba(207,255,0,0.1)' : 'transparent',
                  borderColor: activePrep?.id === p.id ? 'var(--border-active)' : 'var(--border-subtle)',
                  color: activePrep?.id === p.id ? 'var(--text-accent)' : 'var(--text-secondary)',
                  fontWeight: activePrep?.id === p.id ? 700 : 400,
                }}>{p.company} ({p.status})</button>
              ))}
            </div>
          )}

          <div style={STYLES.tabs}>
            {tabs.map(t => (
              <button key={t} style={{ ...STYLES.tab, ...(tab === t ? STYLES.tabActive : {}) }} onClick={() => setTab(t)}>{tabLabels[t]}</button>
            ))}
          </div>

          {tab === 'setup' && <SetupView onCreated={handlePrepCreated} />}
          {tab === 'timeline' && activePrep && <TimelineView prep={activePrep} />}
          {tab === 'mock' && activePrep && <MockInterviewView prep={activePrep} onRefresh={fetchPreps} />}
          {tab === 'weak' && activePrep && <WeakTopicsView prep={activePrep} onRefresh={fetchPreps} />}
          {tab === 'dsa' && activePrep && <DSAQuestionsView prep={activePrep} />}
        </div>
      </div>
    </div>
  );
}
