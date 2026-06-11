/**
 * AdminPlaceholder
 * Clean ElevenLabs aesthetic
 */
import AdminSidebar from '../components/AdminSidebar';

export default function AdminPlaceholder({ title, description }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FDFCFC' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '48px', overflowY: 'auto' }} className="scroll-area">
        <header style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '36px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: '#000',
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#6B6B6B'
          }}>
            {description}
          </p>
        </header>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8E6E3',
          borderRadius: '24px',
          padding: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B6B6B',
          minHeight: '400px',
          textAlign: 'center',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '40px' }}>🚧</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#000' }}>This module is currently under development</div>
          <div style={{ fontSize: '14px' }}>Check back later for updates to the Enterprise Operations Center.</div>
        </div>
      </div>
    </div>
  );
}
