import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CARD = { background: 'rgba(10, 15, 25, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '16px' };
const INPUT = { background: 'rgba(10, 15, 25, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none', width: '220px' };
const BTN_DANGER = { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--rose-400)', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' };
const TH = { padding: '16px 20px', fontSize: '11px', color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 };
const TD = { padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)' };

function getToken() {
  try { const s = sessionStorage.getItem('synapse_session_v1'); return s ? (JSON.parse(s).token || '') : ''; }
  catch { return ''; }
}

export default function AdminCommunity() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchDiscussions = () => {
    fetch(`${API}/admin/community/discussions`, { headers })
      .then(r => r.json())
      .then(data => { setDiscussions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDiscussions(); }, []);

  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await fetch(`${API}/admin/community/discussions/${id}`, { method: 'DELETE', headers });
      if (res.ok) { setSuccess('Discussion removed'); fetchDiscussions(); setTimeout(() => setSuccess(''), 3000); }
      else { const d = await res.json(); setError(d.error || 'Delete failed'); }
    } catch { setError('Network error'); }
  };

  const categories = [...new Set(discussions.map(d => d.category || 'general'))];

  const filtered = discussions.filter(d => {
    const matchSearch = !search ||
      (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.User?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || (d.category || 'general') === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>Community Management</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>Moderate discussions and manage community content</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
              <input
                id="search-community"
                type="text"
                placeholder="Search discussions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...INPUT, paddingLeft: '36px', width: '240px' }}
              />
            </div>
            <select id="filter-category" style={INPUT} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </header>

        {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--rose-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '12px 16px', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Posts', value: discussions.length, color: 'var(--cyan-400)' },
            { label: 'Categories', value: categories.length, color: 'var(--violet-400)' },
            { label: 'Total Replies', value: discussions.reduce((s, d) => s + (d.replies || 0), 0), color: 'var(--emerald-400)' },
            { label: 'Total Likes', value: discussions.reduce((s, d) => s + (d.likes || 0), 0), color: 'var(--amber-400)' },
          ].map((stat, i) => (
            <div key={i} style={{ ...CARD, padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ ...CARD, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'rgba(56,189,248,0.05)', borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
                <th style={TH}>Author</th>
                <th style={TH}>Discussion</th>
                <th style={TH}>Category</th>
                <th style={TH}>Engagement</th>
                <th style={TH}>Date</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)', padding: '48px 20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                  <div>No discussions found.</div>
                </td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, var(--cyan-600), var(--cyan-800))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                        {(d.User?.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>{d.User?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{d.User?.tier || 'User'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...TD, maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '13px', marginBottom: '2px' }}>{d.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.4 }}>{(d.content || '').slice(0, 80)}{(d.content || '').length > 80 ? '…' : ''}</div>
                  </td>
                  <td style={TD}>
                    <span style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--violet-400)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{d.category || 'general'}</span>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--cyan-400)' }}>💬 {d.replies || 0}</span>
                      <span style={{ color: 'var(--rose-400)' }}>❤ {d.likes || 0}</span>
                    </div>
                  </td>
                  <td style={{ ...TD, color: 'var(--text-muted)', fontSize: '12px' }}>
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={TD}>
                    <button onClick={() => handleDelete(d.id)} style={BTN_DANGER}>Remove</button>
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
