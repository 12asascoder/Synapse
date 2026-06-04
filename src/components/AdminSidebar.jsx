/**
 * AdminSidebar — Enterprise AI Operations Center Navigation
 * Specialized sidebar for SUPER_ADMIN role.
 */
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'admin-dashboard', label: 'Command Center', icon: '⌘' },
  { id: 'admin-users', label: 'User Management', icon: '👥' },
  { id: 'admin-bootcamps', label: 'Bootcamps', icon: '◧' },
  { id: 'admin-curriculum', label: 'Curriculum', icon: '◈' },
  { id: 'admin-assessments', label: 'Assessments', icon: '◎' },
  { id: 'admin-certificates', label: 'Certificates', icon: '◇' },
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
      background: 'rgba(10, 15, 25, 0.98)',
      borderRight: '1px solid rgba(56, 189, 248, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Admin Header */}
      <div style={{
        padding: '24px 20px 16px',
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--cyan-600), var(--cyan-400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 0 16px rgba(6,182,212,0.5)',
            flexShrink: 0, color: '#fff'
          }}>✦</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-display)', lineHeight: 1.2, color: 'var(--cyan-50)' }}>
              SYNAPSE<br />ENTERPRISE
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '10px', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)',
          marginTop: '6px', letterSpacing: '0.1em', fontWeight: 600,
        }}>
          SUPER ADMIN LEVEL
        </div>
      </div>

      {/* Nav items */}
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
                border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                color: isActive ? 'var(--cyan-300)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                marginBottom: '4px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(56, 189, 248, 0.2)' }}>
        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '8px',
              border: currentScreen === item.id ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
              background: currentScreen === item.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              color: currentScreen === item.id ? 'var(--cyan-300)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer',
              transition: 'all 0.15s ease', marginBottom: '2px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = currentScreen === item.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent'; e.currentTarget.style.color = currentScreen === item.id ? 'var(--cyan-300)' : 'var(--text-muted)'; }}
          >
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
