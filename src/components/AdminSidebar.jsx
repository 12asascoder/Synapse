import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'admin-dashboard', label: 'Command Center', icon: '⌘' },
  { id: 'admin-users', label: 'User Management', icon: '👥' },
  { id: 'admin-assessments', label: 'Assessments', icon: '◎' },
  { id: 'admin-community', label: 'Community', icon: '⚄' },
  { id: 'admin-vishesh', label: 'Vishesh Control', icon: '✦' },
  { id: 'admin-analytics', label: 'Platform Analytics', icon: '▦' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'support', label: 'Support', icon: '?' },
];

export default function AdminSidebar() {
  const { state, navigate } = useApp();
  const { currentScreen } = state;

  return (
    <div style={{
      width: '240px',
      minHeight: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '24px 20px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'var(--border-active)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', color: '#010203',
            flexShrink: 0,
            fontWeight: 800,
          }}>✦</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-display)', lineHeight: 1.2, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              SYNAPSE<br />ENTERPRISE
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
          marginTop: '6px', letterSpacing: '0.05em', fontWeight: 500,
        }}>
          SUPER ADMIN LEVEL
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              id={`sidebar-${item.id}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(207,255,0,0.08)' : 'transparent',
                color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 450,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                marginBottom: '4px',
                borderLeft: isActive ? '2px solid var(--border-active)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(243,242,238,0.04)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0, opacity: isActive ? 1 : 0.5 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '8px',
              border: 'none',
              background: currentScreen === item.id ? 'rgba(207,255,0,0.08)' : 'transparent',
              color: currentScreen === item.id ? 'var(--text-accent)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.15s ease', marginBottom: '2px',
              fontWeight: currentScreen === item.id ? 600 : 450,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(243,242,238,0.04)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = currentScreen === item.id ? 'rgba(207,255,0,0.08)' : 'transparent'; e.currentTarget.style.color = currentScreen === item.id ? 'var(--text-accent)' : 'var(--text-secondary)'; }}
          >
            <span style={{ fontSize: '14px', opacity: 0.5 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
