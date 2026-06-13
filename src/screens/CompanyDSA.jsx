import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet, apiPost } from '../lib/api';
import Sidebar from '../components/Sidebar';

const STYLES = {
  container: { maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
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
    border: '1px solid var(--border-subtle)', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  questionTitle: { fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' },
  questionMeta: { fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' },
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
  textarea: {
    width: '100%', minHeight: '200px', padding: '16px', borderRadius: '8px',
    border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)',
    color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)',
    resize: 'vertical', marginTop: '12px', lineHeight: 1.6,
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modalContent: {
    background: 'var(--bg-surface)', borderRadius: '16px', padding: '32px', maxWidth: '800px', width: '100%',
    maxHeight: '85vh', overflow: 'auto', border: '1px solid var(--border-subtle)',
  },
  filterBar: {
    display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center',
  },
  select: {
    padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
    background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit',
  },
  input: {
    padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
    background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit',
    flex: 1, minWidth: '200px',
  },
};

const diffColors = {
  easy: { bg: 'rgba(16,185,129,0.1)', color: '#6ee7b7' },
  medium: { bg: 'rgba(245,158,11,0.1)', color: '#fcd34d' },
  hard: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' },
};

const freqColors = {
  'most-asked': { bg: 'rgba(139,92,246,0.1)', color: '#c4b5fd' },
  'frequently-asked': { bg: 'rgba(59,130,246,0.1)', color: '#93c5fd' },
  'occasionally-asked': { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' },
};

function CodingWorkspace({ question, prepId, onClose, onSolved }) {
  const { state } = useApp();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [hints, setHints] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const defaultCodes = {
    javascript: 'function solution() {\n  // Write your code here\n  \n}',
    python: 'def solution():\n    # Write your code here\n    pass',
    java: 'class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
  };

  useEffect(() => {
    setCode(defaultCodes[language] || defaultCodes.javascript);
  }, [language]);

  const handleSubmit = async (solved) => {
    setSubmitting(true);
    try {
      await apiPost(`/dsa/questions/${prepId}/attempt`, {
        questionId: question.id,
        title: question.title,
        topic: question.topic,
        difficulty: question.difficulty,
        frequency: question.frequency,
        code,
        language,
        isSolved: solved,
        timeTaken: 0,
      }, state.token);
      if (onSolved) onSolved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const getHint = () => {
    const hintsList = [
      `Think about the problem constraints. What data structure would be most efficient for this problem?`,
      `Consider edge cases — empty input, single element, duplicates.`,
      `Try breaking the problem into smaller subproblems and solve each one.`,
    ];
    if (hintIndex < hintsList.length) {
      setHints([...hints, hintsList[hintIndex]]);
      setHintIndex(hintIndex + 1);
    }
  };

  return (
    <div style={STYLES.modal} onClick={onClose}>
      <div style={STYLES.modalContent} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: 20 }}>{question.title}</h3>
            <div style={STYLES.questionMeta}>
              <span style={{ ...STYLES.badge, ...diffColors[question.difficulty] }}>{question.difficulty}</span>
              <span style={{ ...STYLES.badge, ...freqColors[question.frequency] }}>{question.frequency}</span>
              <span>{question.topic}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={STYLES.select}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button onClick={getHint} style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '8px 16px' }}>💡 Hint</button>
          </div>
        </div>

        <div style={{ marginBottom: 16, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{question.description}</p>
          {question.examples?.map((ex, i) => (
            <div key={i} style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
              <div>Input: {ex.input}</div>
              <div>Output: {ex.output}</div>
            </div>
          ))}
        </div>

        {hints.length > 0 && showHints !== false && (
          <div style={{ marginBottom: 16, padding: 12, background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
            <p style={{ fontSize: 12, color: '#fcd34d', fontWeight: 600, marginBottom: 8 }}>Hints</p>
            {hints.map((h, i) => (
              <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{i + 1}. {h}</p>
            ))}
          </div>
        )}

        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          style={STYLES.textarea}
          spellCheck={false}
        />

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={() => handleSubmit(false)} disabled={submitting}
            style={{ ...STYLES.button, ...STYLES.buttonSecondary }}>
            {submitting ? 'Saving...' : 'Mark Unsolved'}
          </button>
          <button onClick={() => handleSubmit(true)} disabled={submitting}
            style={{ ...STYLES.button, ...STYLES.buttonPrimary }}>
            {submitting ? 'Saving...' : '✓ Mark Solved'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, label, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={STYLES.scoreBar}>
        <div style={{ ...STYLES.scoreFill, width: `${value}%`, background: color || 'var(--border-active)' }} />
      </div>
    </div>
  );
}

export default function CompanyDSA() {
  const { state, navigate } = useApp();
  const [prep, setPrep] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [freqFilter, setFreqFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [progress, setProgress] = useState(null);
  const [tab, setTab] = useState('questions');

  const fetchPrep = useCallback(async () => {
    try {
      const data = await apiGet(`/interview/${state.user.id}`, state.token);
      if (data && !data.noActivePrep) {
        setPrep(data);
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [state.user?.id, state.token]);

  const fetchQuestions = useCallback(async (prepId) => {
    try {
      const params = new URLSearchParams();
      if (topicFilter) params.set('topic', topicFilter);
      if (diffFilter) params.set('difficulty', diffFilter);
      if (freqFilter) params.set('frequency', freqFilter);
      if (searchQuery) params.set('search', searchQuery);
      const result = await apiGet(`/dsa/questions/${prepId}?${params.toString()}`, state.token);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [state.token, topicFilter, diffFilter, freqFilter, searchQuery]);

  const fetchProgress = useCallback(async (prepId) => {
    try {
      const p = await apiGet(`/dsa/progress/${prepId}`, state.token);
      setProgress(p);
    } catch (e) {
      console.error(e);
    }
  }, [state.token]);

  useEffect(() => {
    (async () => {
      const p = await fetchPrep();
      if (p) {
        fetchQuestions(p.id);
        fetchProgress(p.id);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (prep) {
      fetchQuestions(prep.id);
    }
  }, [topicFilter, diffFilter, freqFilter, searchQuery]);

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

  if (!prep) {
    return (
      <div style={outerStyle}>
        <Sidebar />
        <div style={rightColStyle}>
          <div style={STYLES.container}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No Active Interview Prep</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Create an interview prep plan first to access company-specific DSA questions.</p>
              <button onClick={() => navigate('interview-prep')} style={{ ...STYLES.button, ...STYLES.buttonPrimary, padding: '12px 24px' }}>
                Go to Interview Prep
              </button>
            </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={STYLES.title}>📚 DSA Question Bank</h1>
              <p style={STYLES.subtitle}>
                {prep.jdSummary || 'Interview Prep'} · Practice company-specific coding questions
              </p>
            </div>
            <button onClick={() => navigate('interview-prep')} style={{ ...STYLES.button, ...STYLES.buttonSecondary, fontSize: 12, padding: '6px 14px' }}>Back to Prep</button>
          </div>

          {progress && (
            <div style={STYLES.statsRow}>
              <div style={STYLES.statCard}>
                <p style={STYLES.statValue}>{progress.solved}/{progress.total}</p>
                <p style={STYLES.statLabel}>Solved</p>
              </div>
              <div style={STYLES.statCard}>
                <p style={STYLES.statValue}>{Math.round((progress.solved / Math.max(progress.total, 1)) * 100)}%</p>
                <p style={STYLES.statLabel}>Completion</p>
              </div>
              <div style={STYLES.statCard}>
                <p style={STYLES.statValue}>{progress.remaining}</p>
                <p style={STYLES.statLabel}>Remaining</p>
              </div>
            </div>
          )}

          <div style={STYLES.tabs || { display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
            {['questions', 'progress'].map(t => (
              <button key={t} style={{
                padding: '10px 20px', border: 'none', background: 'transparent',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '14px',
                borderBottom: tab === t ? '2px solid var(--border-active)' : '2px solid transparent',
              }} onClick={() => setTab(t)}>
                {t === 'questions' ? 'Questions' : 'Progress'}
              </button>
            ))}
          </div>

          {tab === 'questions' && (
            <>
              <div style={STYLES.filterBar}>
                <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search questions..." style={STYLES.input}
                />
                <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} style={STYLES.select}>
                  <option value="">All Topics</option>
                  {(data?.topics || []).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={STYLES.select}>
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select value={freqFilter} onChange={e => setFreqFilter(e.target.value)} style={STYLES.select}>
                  <option value="">All Frequencies</option>
                  <option value="most-asked">Most Asked</option>
                  <option value="frequently-asked">Frequently Asked</option>
                  <option value="occasionally-asked">Occasionally Asked</option>
                </select>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {data?.questions?.length || 0} questions
                </span>
              </div>

              {data?.questions?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                  <p>No questions match your filters.</p>
                </div>
              ) : (data?.questions || []).map((q) => {
                const dc = diffColors[q.difficulty] || diffColors.medium;
                const fc = freqColors[q.frequency] || freqColors['frequently-asked'];
                return (
                  <div key={q.id} style={{ ...STYLES.questionCard, opacity: q.solved ? 0.6 : 1 }}
                    onClick={() => setActiveQuestion(q)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={STYLES.questionTitle}>
                          {q.solved && <span style={{ color: '#6ee7b7', marginRight: 8 }}>✓</span>}
                          {q.title}
                        </p>
                        <div style={STYLES.questionMeta}>
                          <span style={{ ...STYLES.badge, background: dc.bg, color: dc.color }}>{q.difficulty}</span>
                          <span style={{ ...STYLES.badge, background: fc.bg, color: fc.color }}>{q.frequency}</span>
                          <span>{q.topic}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {tab === 'progress' && progress && (
            <div>
              <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>Progress by Topic</h3>
              {progress.byTopic?.map(t => (
                <ProgressBar
                  key={t.topic}
                  label={t.topic}
                  value={t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0}
                  color={t.total > 0 && t.solved === t.total ? '#6ee7b7' : 'var(--border-active)'}
                />
              ))}
              <h3 style={{ fontSize: 16, color: 'var(--text-primary)', margin: '24px 0 16px' }}>Progress by Difficulty</h3>
              {Object.entries(progress.byDifficulty || {}).map(([diff, data]) => (
                <ProgressBar
                  key={diff}
                  label={diff.charAt(0).toUpperCase() + diff.slice(1)}
                  value={data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0}
                  color={diff === 'easy' ? '#6ee7b7' : diff === 'medium' ? '#fcd34d' : '#fca5a5'}
                />
              ))}
            </div>
          )}

          {activeQuestion && (
            <CodingWorkspace
              question={activeQuestion}
              prepId={prep.id}
              onClose={() => setActiveQuestion(null)}
              onSolved={() => { fetchQuestions(prep.id); fetchProgress(prep.id); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
