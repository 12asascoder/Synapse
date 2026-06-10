import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useApp } from '../context/AppContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminUsers() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/users`, {
      headers: { Authorization: `Bearer ${state.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setLoading(false);
      });
  }, [state.token]);

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>
              User Management
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>
              View, edit, and moderate all platform operatives
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'rgba(10, 15, 25, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 16px 10px 40px',
                  color: 'white',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  width: '280px',
                  outline: 'none',
                }}
              />
            </div>
            <button style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: 'var(--cyan-400)',
              padding: '10px 20px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 600
            }}>
              Filter Options ⚙
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '24px' }}>
          {/* User Table */}
          <div style={{
            flex: selectedUser ? 2 : 1,
            background: 'rgba(10, 15, 25, 0.7)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'rgba(56, 189, 248, 0.05)', borderBottom: '1px solid rgba(56, 189, 248, 0.15)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '11px', color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operative</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bootcamp</th>
                  <th style={{ padding: '16px 24px', fontSize: '11px', color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr 
                    key={u.id} 
                    onClick={() => setSelectedUser(u)}
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: selectedUser?.id === u.id ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'white', fontSize: '14px', marginBottom: '4px' }}>{u.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        background: u.role === 'SUPER_ADMIN' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                        color: u.role === 'SUPER_ADMIN' ? 'var(--rose-400)' : 'var(--cyan-400)',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {u.bootcamp}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        color: u.status === 'Active' ? 'var(--emerald-400)' : 'var(--rose-400)',
                        fontSize: '12px'
                      }}>
                        ● {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Detail Panel */}
          {selectedUser && (
            <div style={{
              flex: 1,
              background: 'rgba(10, 15, 25, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              position: 'sticky',
              top: '40px',
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white' }}>
                  Operative Profile
                </h3>
                <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--cyan-600), var(--cyan-800))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white', marginBottom: '16px', boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}>
                  {selectedUser.name.charAt(0)}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'white' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>{selectedUser.email}</div>
              </div>

              <div style={{ display: 'grid', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '32px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>User ID</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{selectedUser.id}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Role</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>{selectedUser.role || 'USER'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '10px', fontSize: '12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: 'var(--cyan-400)' }}>View Full Assessment History</button>
                <button className="btn btn-secondary" style={{ padding: '10px', fontSize: '12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose-400)' }}>
                  {selectedUser.status === 'Active' ? 'Suspend User' : 'Restore User'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
