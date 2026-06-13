import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet, apiPost } from '../lib/api';
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
  questionCard: {
    background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', marginBottom: '12px',
    border: '1px solid var(--border-subtle)',
  },
  questionTitle: { fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' },
  questionMeta: { fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '16px' },
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
  buttonDanger: { background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' },
  textarea: {
    width: '100%', minHeight: '150px', padding: '12px', borderRadius: '8px',
    border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)',
    color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit',
    resize: 'vertical', marginTop: '12px',
  },
  scoreBar: { height: '6px', borderRadius: '3px', background: 'var(--bg-card)', marginTop: '8px', overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modalContent: {
    background: 'var(--bg-surface)', borderRadius: '16px', padding: '32px', maxWidth: '640px', width: '100%',
    maxHeight: '80vh', overflow: 'auto', border: '1px solid var(--border-subtle)',
  },
};

function WeakTopicCard({ topic, selected, onToggle }) {
  const scoreColor = topic.score >= 70 ? '#6ee7b7' : topic.score >= 40 ? '#fcd34d' : '#fca5a5';
  return (
    <div
      onClick={() => onToggle(topic.topic)}
      style={{
        padding: '16px', borderRadius: '12px', border: `1px solid ${selected ? 'var(--border-active)' : 'var(--border-subtle)'}`,
        background: selected ? 'rgba(207,255,0,0.05)' : 'var(--bg-card)',
        cursor: 'pointer', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}
    >
      <div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>{topic.topic}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
          Score: <span style={{ color: scoreColor }}>{topic.score}/100</span> · {topic.attempts} attempts
        </p>
      </div>
      <div style={{
        width: 24, height: 24, borderRadius: '6px', border: `2px solid ${selected ? 'var(--border-active)' : 'var(--border-subtle)'}`,
        background: selected ? 'var(--border-active)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? '#010203' : 'transparent', fontSize: '14px', fontWeight: 700,
      }}>
        {selected ? '✓' : ''}
      </div>
    </div>
  );
}

export default function TargetedReInterview() {
  const { state } = useApp();
  const [prep, setPrep] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState('select'); // select | interview | feedback | complete

  const fetchData = useCallback(async () => {
    try {
      const data = await apiGet(`/interview/${state.user.id}`, state.token);
      if (data && !data.noActivePrep) {
        setPrep(data);
        const weak = await apiGet(`/interview/${state.user.id}/weak-topics`, state.token);
        setWeakTopics(weak || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [state.user?.id, state.token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const startReInterview = async () => {
    if (selectedTopics.length === 0) return;
    setSubmitting(true);
    try {
      const s = await apiPost(`/interview/${prep.id}/weak-reinterview`, { topics: selectedTopics }, state.token);
      setSession(s);
      setCurrentQ(s.questions[0]);
      setPhase('interview');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
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

  const finishSession = async () => {
    try {
      const scores = {};
      weakTopics.forEach(t => {
        scores[t.topic] = Math.min(100, t.score + 15);
      });
      await apiPost(`/interview/${prep.id}/weak-reinterview`, {
        topicsCovered: selectedTopics,
        scores,
      }, state.token);
      setPhase('complete');
    } catch (e) {
      console.error(e);
    }
  };

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

  if (phase === 'complete') {
    return (
      <div style={outerStyle}>
        <Sidebar />
        <div style={rightColStyle}>
          <div style={STYLES.container}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Re-Interview Complete!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
                Great work on your targeted re-interview. Your weak areas have been recorded and progress is being tracked.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => { setSession(null); setDone(false); setPhase('select'); setSelectedTopics([]); fetchData(); }}
                  style={{ ...STYLES.button, ...STYLES.buttonSecondary }}>Try Again</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'interview') {
    if (done) {
      return (
        <div style={outerStyle}>
          <Sidebar />
          <div style={rightColStyle}>
            <div style={STYLES.container}>
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Session Complete!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>All questions answered. Review your feedback or start a new session.</p>
                <button onClick={finishSession} style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '12px 32px', fontSize: 16 }}>
                  Finish & Save Results
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const progressVal = session ? ((session.questions.findIndex(q => q.id === currentQ?.id) + 1) / session.questions.length) * 100 : 0;

    return (
      <div style={outerStyle}>
        <Sidebar />
        <div style={rightColStyle}>
          <div style={STYLES.container}>
            <div style={STYLES.header}>
              <h1 style={STYLES.title}>🎯 Targeted Re-Interview</h1>
              <p style={STYLES.subtitle}>Focusing on: {selectedTopics.join(', ')}</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  Question {session.questions.findIndex(q => q.id === currentQ?.id) + 1} of {session.questions.length}
                </span>
                <span style={{ color: 'var(--border-active)', fontSize: 13 }}>{Math.round(progressVal)}%</span>
              </div>
              <div style={STYLES.scoreBar}>
                <div style={{ ...STYLES.scoreFill, width: `${progressVal}%`, background: 'var(--border-active)' }} />
              </div>
            </div>

            {feedback && (
              <div style={{ ...STYLES.statCard, marginBottom: 20, borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)' }}>
                <p style={{ color: 'var(--border-active)', fontWeight: 600, marginBottom: 8 }}>Score: {feedback.score}/100</p>
                {feedback.strengths?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 600, marginBottom: 4 }}>Strengths</p>
                    {feedback.strengths.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>• {s}</p>)}
                  </div>
                )}
                {feedback.weaknesses?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>Areas to Improve</p>
                    {feedback.weaknesses.map((w, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>• {w}</p>)}
                  </div>
                )}
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>Next question loading...</p>
              </div>
            )}

            {!feedback && currentQ && (
              <div style={STYLES.questionCard}>
                <p style={STYLES.questionTitle}>{currentQ.question}</p>
                <div style={STYLES.questionMeta}>
                  <span style={{ ...STYLES.badge, background: 'rgba(99,102,241,0.1)', color: 'var(--border-active)' }}>{currentQ.category}</span>
                  <span>{currentQ.difficulty}</span>
                </div>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                  placeholder="Answer focusing on improving your weak areas..." style={STYLES.textarea} />
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button onClick={handleSubmit} disabled={submitting || answer.length < 10}
                    style={{ ...STYLES.button, ...STYLES.buttonPrimary }}>
                    {submitting ? 'Evaluating...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={outerStyle}>
      <Sidebar />
      <div style={rightColStyle}>
        <div style={STYLES.container}>
          <div style={STYLES.header}>
            <h1 style={STYLES.title}>🎯 Targeted Re-Interview</h1>
            <p style={STYLES.subtitle}>Select weak topics to focus your re-interview session on</p>
          </div>

          {weakTopics.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No Weak Topics Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Complete some mock interviews first to identify areas for improvement.
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Weak topics are automatically identified from your mock interview performance.
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Select the topics you want to improve. The AI will generate targeted questions for each selected area.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {weakTopics.map(t => (
                  <WeakTopicCard
                    key={t.id}
                    topic={t}
                    selected={selectedTopics.includes(t.topic)}
                    onToggle={toggleTopic}
                  />
                ))}
              </div>

              {selectedTopics.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <button onClick={startReInterview} disabled={submitting}
                    style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '14px 40px', fontSize: 16 }}>
                    {submitting ? 'Starting...' : `Start Re-Interview (${selectedTopics.length} topics)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
