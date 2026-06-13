import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

import { useApp } from '../context/AppContext';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CARD = { background: 'rgba(10, 15, 25, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '16px' };
const TH = { padding: '16px 20px', fontSize: '11px', color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 };
const TD = { padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)' };

export default function AdminCertificates() {
  const { state } = useApp();
  const token = state.token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const [graduates, setGraduates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/admin/certificates`, { headers })
      .then(r => r.json())
      .then(data => { setGraduates(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>Certificate Management</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>View and verify generated certificates for program graduates</p>
        </header>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Graduates', value: graduates.length, color: 'var(--emerald-400)', icon: '🎓' },
            { label: 'Avg Growth Score', value: graduates.length ? Math.round(graduates.reduce((s, g) => s + (g.growthScore || 0), 0) / graduates.length) : 0, color: 'var(--cyan-400)', icon: '📊' },
            { label: 'Total Points Earned', value: graduates.reduce((s, g) => s + (g.points || 0), 0).toLocaleString(), color: 'var(--violet-400)', icon: '⭐' },
          ].map((stat, i) => (
            <div key={i} style={{ ...CARD, padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '28px' }}>{stat.icon}</div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...CARD, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ background: 'rgba(56, 189, 248, 0.05)', borderBottom: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <th style={TH}>Graduate</th>
                <th style={TH}>Tier</th>
                <th style={TH}>Growth Score</th>
                <th style={TH}>Points</th>
                <th style={TH}>Day Reached</th>
                <th style={TH}>Completed</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)' }}>Loading certificates...</td></tr>
              ) : graduates.length === 0 ? (
                <tr><td colSpan={7} style={{ ...TD, textAlign: 'center', color: 'var(--text-muted)', padding: '48px 20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎓</div>
                  <div>No graduates yet. Users must complete Day 30 to earn a certificate.</div>
                </td></tr>
              ) : graduates.map((g, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #FFFFFF' }}>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, var(--cyan-600), var(--cyan-800))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                        {(g.userName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>{g.userName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{g.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td style={TD}>
                    <span style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--violet-400)', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{g.tier}</span>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 60, height: 6, borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ width: `${g.growthScore}%`, height: '100%', borderRadius: '3px', background: g.growthScore >= 80 ? 'var(--emerald-400)' : g.growthScore >= 50 ? 'var(--amber-400)' : 'var(--rose-400)' }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{g.growthScore}/100</span>
                    </div>
                  </td>
                  <td style={{ ...TD, fontWeight: 600, color: 'var(--amber-400)' }}>{(g.points || 0).toLocaleString()}</td>
                  <td style={TD}>
                    <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald-400)', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>Day {g.currentDay}</span>
                  </td>
                  <td style={{ ...TD, color: 'var(--text-muted)', fontSize: '12px' }}>
                    {g.completedAt ? new Date(g.completedAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 12px', borderRadius: '20px', width: 'fit-content' }}>
                      <span style={{ fontSize: '12px' }}>✓</span>
                      <span style={{ color: 'var(--emerald-400)', fontSize: '11px', fontWeight: 700 }}>VERIFIED</span>
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
