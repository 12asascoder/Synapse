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

const emptyForm = { bootcampId: '', day: '', topic: '', sublabel: '', description: '', contentType: 'lesson' };

export default function AdminCurriculum() {
  const { state } = useApp();
  const token = state.token;
  const [days, setDays] = useState([]);
  const [bootcamps, setBootcamps] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = () => {
    const qs = filter ? `?bootcampId=${filter}` : '';
    fetch(`${API}/admin/curriculum${qs}`, { headers })
      .then(r => r.json())
      .then(data => { setDays(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`${API}/admin/bootcamps`, { headers })
      .then(r => r.json())
      .then(data => setBootcamps(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const url = editing ? `${API}/admin/curriculum/${editing}` : `${API}/admin/curriculum`;
    const method = editing ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Operation failed'); return; }
      setSuccess(editing ? 'Day updated' : 'Day created');
      setShowForm(false); setEditing(null); setForm({ ...emptyForm });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await fetch(`${API}/admin/curriculum/${id}`, { method: 'DELETE', headers });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setSuccess('Day deleted'); fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
  };

  const startEdit = (d) => {
    setEditing(d.id);
    setForm({ bootcampId: d.bootcampId, day: d.day, topic: d.topic, sublabel: d.sublabel || '', description: d.description || '', contentType: d.contentType || 'lesson' });
    setShowForm(true);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>Curriculum Management</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>Manage learning content and daily curriculum</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select id="filter-bootcamp" style={{ ...INPUT, width: '220px' }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">All Bootcamps</option>
              {bootcamps.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button id="btn-add-curriculum" style={BTN_PRIMARY} onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ ...emptyForm, bootcampId: filter || '' }); }}>
              {showForm ? '✕ Cancel' : '+ Add Day'}
            </button>
          </div>
        </header>

        {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--rose-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ ...CARD, padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase' }}>
              {editing ? 'EDIT CURRICULUM DAY' : 'ADD CURRICULUM DAY'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Bootcamp</label>
                <select style={INPUT} value={form.bootcampId} onChange={e => setForm({ ...form, bootcampId: e.target.value })} required>
                  <option value="">Select bootcamp...</option>
                  {bootcamps.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Day #</label>
                <input type="number" min="1" max="90" style={INPUT} value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Content Type</label>
                <select style={INPUT} value={form.contentType} onChange={e => setForm({ ...form, contentType: e.target.value })}>
                  <option value="lesson">Lesson</option>
                  <option value="assessment">Assessment</option>
                  <option value="project">Project</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Topic</label>
                <input style={INPUT} value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Sublabel</label>
                <input style={INPUT} value={form.sublabel} onChange={e => setForm({ ...form, sublabel: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Description</label>
              <textarea rows={2} style={{ ...INPUT, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <button type="submit" style={BTN_PRIMARY}>{editing ? 'Save Changes' : 'Add Day'}</button>
          </form>
        )}

        <div style={{ ...CARD, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'rgba(56, 189, 248, 0.05)', borderBottom: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <th style={TH}>Day</th>
                <th style={TH}>Topic</th>
                <th style={TH}>Sublabel</th>
                <th style={TH}>Bootcamp</th>
                <th style={TH}>Type</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : days.length === 0 ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>No curriculum days found.</td></tr>
              ) : days.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={TD}>
                    <span style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--cyan-400)', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                      {d.day}
                    </span>
                  </td>
                  <td style={{ ...TD, fontWeight: 600, color: 'white' }}>{d.topic}</td>
                  <td style={{ ...TD, color: 'var(--text-muted)' }}>{d.sublabel || '—'}</td>
                  <td style={TD}>
                    <span style={{ color: d.Bootcamp?.color || 'var(--cyan-400)', fontSize: '12px' }}>{d.Bootcamp?.name || '—'}</span>
                  </td>
                  <td style={TD}>
                    <span style={{ background: d.contentType === 'assessment' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', color: d.contentType === 'assessment' ? 'var(--rose-400)' : 'var(--emerald-400)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {d.contentType || 'lesson'}
                    </span>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(d)} style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--cyan-400)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Edit</button>
                      <button onClick={() => handleDelete(d.id)} style={BTN_DANGER}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
