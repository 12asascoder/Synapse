import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊕' },
  { id: 'lesson', label: 'Learning Session', icon: '◈' },
  { id: 'assessment', label: 'Assessments', icon: '◎' },
  { id: 'analytics', label: 'Analytics', icon: '▦' },
  { id: 'community', label: 'Community', icon: '⌘' },
  { id: 'skill-passport', label: 'Skill Passport', icon: '◆' },
  { id: 'interview-prep', label: 'Interview Prep', icon: '🎯' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'support', label: 'Support', icon: '?' },
];

export default function Sidebar() {
  const { state, navigate } = useApp();
  const { currentDay, currentScreen } = state;

  return (
    <div style={{
      width: '220px',
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
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--border-active)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', color: 'var(--bg-base)',
            flexShrink: 0,
            fontWeight: 800,
          }}>✦</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-display)', lineHeight: 1.2, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              SYNAPSE
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
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
                gap: '10px',
                padding: '9px 12px',
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
                marginBottom: '2px',
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
              <span style={{ fontSize: '14px', flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            id={`sidebar-bottom-${item.id}`}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px',
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

        <div style={{
          margin: '8px 4px 0',
          padding: '10px 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '4px', fontWeight: 500 }}>STREAK</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>🔥</span>
            <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{state.streak}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
