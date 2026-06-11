/**
 * AdminUsers
 * Clean ElevenLabs aesthetic
 */
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FDFCFC' }}>
      <AdminSidebar />
      
      <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }} className="scroll-area">
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#000', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              User Management
            </h1>
            <p style={{ fontSize: '15px', color: '#6B6B6B' }}>
              View, edit, and moderate all platform operatives
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8E6E3',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 44px',
                  color: '#000',
                  fontSize: '14px',
                  width: '320px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
                onFocusCapture={(e) => { e.currentTarget.style.borderColor = '#000'; }}
                onBlurCapture={(e) => { e.currentTarget.style.borderColor = '#E8E6E3'; }}
              />
            </div>
            <button className="btn" style={{
              background: '#FDFCFC',
              border: '1px solid #E8E6E3',
              color: '#000',
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F3F1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FDFCFC'; }}
            >
              Filter Options ⚙
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '32px' }}>
          {/* User Table */}
          <div style={{
            flex: selectedUser ? 2 : 1,
            background: '#FFFFFF',
            border: '1px solid #E8E6E3',
            borderRadius: '24px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F5F3F1', borderBottom: '1px solid #E8E6E3' }}>
                  <th style={{ padding: '20px 24px', fontSize: '12px', color: '#6B6B6B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operative</th>
                  <th style={{ padding: '20px 24px', fontSize: '12px', color: '#6B6B6B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '20px 24px', fontSize: '12px', color: '#6B6B6B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bootcamp</th>
                  <th style={{ padding: '20px 24px', fontSize: '12px', color: '#6B6B6B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr 
                    key={u.id} 
                    onClick={() => setSelectedUser(u)}
                    style={{ 
                      borderBottom: '1px solid #E8E6E3',
                      background: selectedUser?.id === u.id ? '#F5F3F1' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = '#FDFCFC'; }}
                    onMouseLeave={(e) => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 700, color: '#000', fontSize: '15px', marginBottom: '4px' }}>{u.name}</div>
                      <div style={{ color: '#6B6B6B', fontSize: '13px' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        background: u.role === 'SUPER_ADMIN' ? '#FFF0F0' : '#F5F3F1',
                        color: u.role === 'SUPER_ADMIN' ? '#DC2626' : '#000',
                        border: `1px solid ${u.role === 'SUPER_ADMIN' ? '#FECACA' : '#E8E6E3'}`,
                        padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '14px', color: '#44403B', fontWeight: 500 }}>
                      {u.bootcamp}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        color: u.status === 'Active' ? '#10B981' : '#DC2626',
                        fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.status === 'Active' ? '#10B981' : '#DC2626' }} />
                        {u.status}
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
              background: '#FFFFFF',
              border: '1px solid #E8E6E3',
              borderRadius: '24px',
              padding: '32px',
              position: 'sticky',
              top: '48px',
              height: 'fit-content',
              boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#000' }}>
                  Operative Profile
                </h3>
                <button onClick={() => setSelectedUser(null)} style={{ background: '#F5F3F1', border: 'none', color: '#000', cursor: 'pointer', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: '#000', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: 'white', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                  {selectedUser.name.charAt(0)}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#000', marginBottom: '8px' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '14px', color: '#6B6B6B' }}>{selectedUser.email}</div>
              </div>

              <div style={{ display: 'grid', gap: '20px', fontSize: '14px', marginBottom: '40px', padding: '24px', background: '#FDFCFC', borderRadius: '16px', border: '1px solid #E8E6E3' }}>
                <div>
                  <div style={{ color: '#A59F97', marginBottom: '6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>User ID</div>
                  <div style={{ color: '#000', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{selectedUser.id}</div>
                </div>
                <div>
                  <div style={{ color: '#A59F97', marginBottom: '6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Role</div>
                  <div style={{ color: '#000', fontWeight: 600 }}>{selectedUser.role || 'USER'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn" style={{ width: '100%', padding: '14px', fontSize: '14px', background: '#FDFCFC', border: '1px solid #000', color: '#000', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#FFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FDFCFC'; e.currentTarget.style.color = '#000'; }}
                >View Full Assessment History</button>
                
                <button className="btn" style={{ width: '100%', padding: '14px', fontSize: '14px', background: '#FFF0F0', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF0F0'; }}
                >
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
