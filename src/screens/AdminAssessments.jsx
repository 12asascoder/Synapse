import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

import { useApp } from '../context/AppContext';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CARD = { background: 'rgba(10, 15, 25, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '16px' };
const INPUT = { background: 'rgba(10, 15, 25, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none', width: '100%' };
const BTN_PRIMARY = { background: 'linear-gradient(135deg, var(--cyan-600), var(--cyan-400))', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '13px', cursor: 'pointer', fontWeight: 700 };
const BTN_DANGER = { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--rose-400)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' };
const TH = { padding: '16px 20px', fontSize: '11px', color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 };
const TD = { padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)' };
const TAB = (active) => ({
  padding: '10px 24px', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, border: 'none',
  background: active ? 'rgba(56,189,248,0.1)' : 'transparent',
  color: active ? 'var(--cyan-400)' : 'var(--text-muted)',
  borderBottom: active ? '2px solid var(--cyan-400)' : '2px solid transparent',
});

const emptyQ = { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', topic: 'general', difficulty: 'medium' };

export default function AdminAssessments() {
  const { state } = useApp();
  const token = state.token;
  const [tab, setTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyQ });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchQuestions = () => {
    fetch(`${API}/admin/assessments/questions`, { headers })
      .then(r => r.json())
      .then(data => { setQuestions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchSubmissions = () => {
    fetch(`${API}/admin/assessments/submissions`, { headers })
      .then(r => r.json())
      .then(data => setSubmissions(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => { fetchQuestions(); fetchSubmissions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const url = editing ? `${API}/admin/assessments/questions/${editing}` : `${API}/admin/assessments/questions`;
    const method = editing ? 'PUT' : 'POST';
    const body = { ...form, options: form.options.filter(o => o.trim()), correctAnswer: parseInt(form.correctAnswer) };
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Operation failed'); return; }
      setSuccess(editing ? 'Question updated' : 'Question created');
      setShowForm(false); setEditing(null); setForm({ ...emptyQ });
      fetchQuestions();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/admin/assessments/questions/${id}`, { method: 'DELETE', headers });
      if (res.ok) { setSuccess('Question deleted'); fetchQuestions(); setTimeout(() => setSuccess(''), 3000); }
    } catch { setError('Network error'); }
  };

  const startEdit = (q) => {
    setEditing(q.id);
    setForm({ question: q.question, options: [...(q.options || []), '', '', '', ''].slice(0, 4), correctAnswer: q.correctAnswer, explanation: q.explanation || '', topic: q.topic || 'general', difficulty: q.difficulty || 'medium' });
    setShowForm(true);
  };

  const updateOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  const diffColor = (d) => d === 'easy' ? 'var(--emerald-400)' : d === 'hard' ? 'var(--rose-400)' : 'var(--amber-400)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>Assessment Management</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>Question bank and student submission history</p>
        </header>

        {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--rose-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
          <button id="tab-questions" style={TAB(tab === 'questions')} onClick={() => setTab('questions')}>Question Bank ({questions.length})</button>
          <button id="tab-submissions" style={TAB(tab === 'submissions')} onClick={() => setTab('submissions')}>Submissions ({submissions.length})</button>
        </div>

        {tab === 'questions' && (
          <>
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <button id="btn-add-question" style={BTN_PRIMARY} onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ ...emptyQ }); }}>
                {showForm ? '✕ Cancel' : '+ Add Question'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} style={{ ...CARD, padding: '24px', marginBottom: '24px' }}>
                <div style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase' }}>
                  {editing ? 'EDIT QUESTION' : 'ADD NEW QUESTION'}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Question</label>
                  <textarea rows={3} style={{ ...INPUT, resize: 'vertical' }} value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i}>
                      <label style={{ display: 'block', fontSize: '11px', color: form.correctAnswer === i ? 'var(--emerald-400)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                        Option {i + 1} {form.correctAnswer === i && '✓ CORRECT'}
                      </label>
                      <input style={{ ...INPUT, borderColor: form.correctAnswer === i ? 'rgba(16,185,129,0.4)' : undefined }} value={form.options[i] || ''} onChange={e => updateOption(i, e.target.value)} required={i < 2} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Correct Answer</label>
                    <select style={INPUT} value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: parseInt(e.target.value) })}>
                      {[0, 1, 2, 3].map(i => <option key={i} value={i}>Option {i + 1}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Topic</label>
                    <input style={INPUT} value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Difficulty</label>
                    <select style={INPUT} value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Explanation</label>
                  <textarea rows={2} style={{ ...INPUT, resize: 'vertical' }} value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} />
                </div>
                <button type="submit" style={BTN_PRIMARY}>{editing ? 'Save Changes' : 'Add Question'}</button>
              </form>
            )}

            <div style={{ ...CARD, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr style={{ background: 'rgba(56,189,248,0.05)', borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
                    <th style={TH}>Question</th>
                    <th style={TH}>Topic</th>
                    <th style={TH}>Difficulty</th>
                    <th style={TH}>Answer</th>
                    <th style={TH}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                  ) : questions.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>No questions yet.</td></tr>
                  ) : questions.map(q => (
                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ ...TD, maxWidth: '400px' }}>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '13px', lineHeight: 1.4 }}>{q.question.length > 100 ? q.question.slice(0, 100) + '…' : q.question}</div>
                      </td>
                      <td style={TD}><span style={{ color: 'var(--cyan-400)', fontSize: '12px' }}>{q.topic}</span></td>
                      <td style={TD}>
                        <span style={{ color: diffColor(q.difficulty), fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{q.difficulty}</span>
                      </td>
                      <td style={TD}>
                        <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald-400)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>
                          Option {(q.correctAnswer || 0) + 1}
                        </span>
                      </td>
                      <td style={TD}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => startEdit(q)} style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--cyan-400)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Edit</button>
                          <button onClick={() => handleDelete(q.id)} style={BTN_DANGER}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'submissions' && (
          <div style={{ ...CARD, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'rgba(56,189,248,0.05)', borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
                  <th style={TH}>Student</th>
                  <th style={TH}>Day</th>
                  <th style={TH}>Completed</th>
                  <th style={TH}>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>No submissions yet.</td></tr>
                ) : submissions.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={TD}>
                      <div style={{ fontWeight: 600, color: 'white' }}>{s.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.userEmail}</div>
                    </td>
                    <td style={TD}>
                      <span style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--cyan-400)', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>Day {s.day || '—'}</span>
                    </td>
                    <td style={TD}>
                      <span style={{ color: s.completed ? 'var(--emerald-400)' : 'var(--rose-400)', fontSize: '12px' }}>● {s.completed ? 'Yes' : 'No'}</span>
                    </td>
                    <td style={{ ...TD, color: 'var(--text-muted)', fontSize: '12px' }}>
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
