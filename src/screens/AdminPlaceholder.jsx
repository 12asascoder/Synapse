import AdminSidebar from '../components/AdminSidebar';

export default function AdminPlaceholder({ title, description }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '28px',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: 'var(--cyan-50)',
            marginBottom: '8px'
          }}>
            {title}
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--cyan-400)',
            letterSpacing: '0.05em'
          }}>
            {description}
          </p>
        </header>

        <div style={{
          background: 'rgba(10, 15, 25, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          borderRadius: '16px',
          padding: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--cyan-400)',
          fontFamily: 'var(--font-mono)',
          minHeight: '400px',
          textAlign: 'center',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ fontSize: '32px' }}>🚧</div>
          <div>This module is currently under development for the Enterprise AI Operations Center.</div>
        </div>
      </div>
    </div>
  );
}
