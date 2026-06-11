import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

import { useApp } from '../context/AppContext';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CARD = {
  background: 'rgba(10, 15, 25, 0.7)',
  border: '1px solid rgba(56, 189, 248, 0.15)',
  borderRadius: '16px',
};
const INPUT = {
  background: 'rgba(10, 15, 25, 0.7)',
  border: '1px solid rgba(56, 189, 248, 0.2)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: 'white',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
};
const BTN_PRIMARY = {
  background: 'linear-gradient(135deg, var(--cyan-600), var(--cyan-400))',
  border: 'none',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '8px',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  cursor: 'pointer',
  fontWeight: 700,
};
const BTN_DANGER = {
  background: 'rgba(244, 63, 94, 0.1)',
  border: '1px solid rgba(244, 63, 94, 0.3)',
  color: 'var(--rose-400)',
  padding: '8px 16px',
  borderRadius: '6px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  cursor: 'pointer',
};
const TH = {
  padding: '16px 20px',
  fontSize: '11px',
  color: 'var(--cyan-400)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 600,
};
const TD = { padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)' };

const emptyForm = { name: '', slug: '', description: '', icon: 'Brain', duration: '30 Days', level: 'Beginner', color: '#6366f1' };

export default function AdminBootcamps() {
  const { state } = useApp();
  const token = state.token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBootcamps = () => {
    fetch(`${API}/admin/bootcamps`, { headers })
      .then(r => r.json())
      .then(data => { setBootcamps(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBootcamps(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const url = editing ? `${API}/admin/bootcamps/${editing}` : `${API}/admin/bootcamps`;
    const method = editing ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Operation failed'); return; }
      setSuccess(editing ? 'Bootcamp updated' : 'Bootcamp created');
      setShowForm(false); setEditing(null); setForm({ ...emptyForm });
      fetchBootcamps();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
  };

  const handleDelete = async (id) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API}/admin/bootcamps/${id}`, { method: 'DELETE', headers });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Delete failed'); return; }
      setSuccess('Bootcamp deleted');
      fetchBootcamps();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
  };

  const handleToggleActive = async (b) => {
    try {
      await fetch(`${API}/admin/bootcamps/${b.id}`, {
        method: 'PUT', headers, body: JSON.stringify({ isActive: !b.isActive }),
      });
      fetchBootcamps();
    } catch { /* silent */ }
  };

  const startEdit = (b) => {
    setEditing(b.id);
    setForm({ name: b.name, slug: b.slug, description: b.description || '', icon: b.icon, duration: b.duration, level: b.level, color: b.color || '#6366f1' });
    setShowForm(true);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>
              Bootcamp Management
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>
              Create and configure bootcamp programs
            </p>
          </div>
          <button id="btn-add-bootcamp" style={BTN_PRIMARY} onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ ...emptyForm }); }}>
            {showForm ? '✕ Cancel' : '+ New Bootcamp'}
          </button>
        </header>

        {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--rose-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ ...CARD, padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {editing ? 'EDIT BOOTCAMP' : 'CREATE NEW BOOTCAMP'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Name</label>
                <input id="input-bootcamp-name" style={INPUT} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Slug</label>
                <input id="input-bootcamp-slug" style={INPUT} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Icon</label>
                <input id="input-bootcamp-icon" style={INPUT} value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Duration</label>
                <input id="input-bootcamp-duration" style={INPUT} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Level</label>
                <select id="input-bootcamp-level" style={INPUT} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: '40px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  <input style={{ ...INPUT, flex: 1 }} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px', textTransform: 'uppercase' }}>Description</label>
              <textarea id="input-bootcamp-description" rows={3} style={{ ...INPUT, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <button type="submit" style={BTN_PRIMARY}>{editing ? 'Save Changes' : 'Create Bootcamp'}</button>
          </form>
        )}

        <div style={{ ...CARD, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'rgba(56, 189, 248, 0.05)', borderBottom: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <th style={TH}>Program</th>
                <th style={TH}>Slug</th>
                <th style={TH}>Duration</th>
                <th style={TH}>Level</th>
                <th style={TH}>Status</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>Loading bootcamps...</td></tr>
              ) : bootcamps.length === 0 ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>No bootcamps found. Create one above.</td></tr>
              ) : bootcamps.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${b.color}22`, border: `1px solid ${b.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: b.color, fontWeight: 700, flexShrink: 0 }}>
                        {b.icon?.charAt(0) || '◈'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>{b.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{b.description?.slice(0, 50)}{b.description?.length > 50 ? '…' : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...TD, color: 'var(--cyan-400)' }}>{b.slug}</td>
                  <td style={TD}>{b.duration}</td>
                  <td style={TD}>
                    <span style={{ background: `${b.color}18`, color: b.color, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{b.level}</span>
                  </td>
                  <td style={TD}>
                    <button onClick={() => handleToggleActive(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: b.isActive ? 'var(--emerald-400)' : 'var(--rose-400)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      ● {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(b)} style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--cyan-400)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>Edit</button>
                      <button onClick={() => handleDelete(b.id)} style={{ ...BTN_DANGER, padding: '5px 12px', fontSize: '11px' }}>Delete</button>
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
