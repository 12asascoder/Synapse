/**
 * Sidebar — Left navigation matching reference design exactly
 * Shows "Neural Progress" avatar, day counter, nav items with icons
 */
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Core Feed', icon: '⊕' },
  { id: 'lesson', label: 'Learning Session', icon: '◈' },
  { id: 'assessment', label: 'Assessments', icon: '◎' },
  { id: 'analytics', label: 'Analytics', icon: '▦' },
  { id: 'community', label: 'Network', icon: '⌘' },
  { id: 'skill-passport', label: 'Skill Passport', icon: '◆' },
  { id: 'certificates', label: 'Certificates', icon: '◇' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'support', label: 'Support', icon: '?' },
];

export default function Sidebar() {
  const { state, navigate } = useApp();
  const { selectedBootcamp, currentDay, currentScreen, scores, streak } = state;

  return (
    <div style={{
      width: '200px',
      minHeight: '100vh',
      background: 'rgba(8,8,14,0.98)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Neural Progress header */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 0 14px rgba(124,58,237,0.4)',
            flexShrink: 0,
          }}>◈</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
              Neural<br />Progress
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
          marginTop: '6px', letterSpacing: '0.05em',
        }}>
          Day {currentDay} of 30
        </div>

        {/* Day progress bar */}
        <div style={{ marginTop: '8px' }}>
          <div className="progress-bar" style={{ height: '2px' }}>
            <div className="progress-fill" style={{ width: `${(currentDay / 30) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentScreen === item.id;
          const isMilestone15 = item.label === 'Assessments';

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
                border: isActive ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: isActive ? 'var(--violet-300)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                marginBottom: '2px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
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
              <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'assessment' && currentDay >= 14 && currentDay < 16 && (
                <span style={{
                  fontSize: '9px', fontWeight: 700, padding: '2px 6px',
                  background: 'rgba(245,158,11,0.2)', color: 'var(--amber-400)',
                  border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                }}>IN 1 DAY</span>
              )}
            </button>
          );
        })}

        {/* Milestone markers */}
        <div style={{ margin: '12px 0', padding: '0 4px' }}>
          <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '12px' }} />
          {[
            { label: 'Milestone 15', day: 15, status: currentDay >= 15 ? 'complete' : currentDay >= 14 ? 'soon' : 'locked' },
            { label: 'Milestone 30', day: 30, status: currentDay >= 30 ? 'complete' : 'locked' },
          ].map((m) => (
            <button
              key={m.label}
              onClick={() => navigate(m.day === 15 ? 'milestone' : 'results')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', borderRadius: '8px', border: '1px solid transparent',
                background: 'transparent', cursor: 'pointer', marginBottom: '2px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '12px', color: m.status === 'soon' ? 'var(--amber-400)' : 'var(--text-muted)' }}>◎</span>
              <span style={{ fontSize: '12px', color: m.status === 'soon' ? 'var(--amber-400)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</span>
              {m.status === 'soon' && (
                <span style={{ marginLeft: 'auto', fontSize: '9px', color: 'var(--amber-400)', fontFamily: 'var(--font-mono)' }}>SOON</span>
              )}
              {m.status === 'locked' && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>🔒</span>
              )}
            </button>
          ))}

          <button style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', borderRadius: '8px', border: '1px solid transparent',
            background: 'transparent', cursor: 'pointer', marginBottom: '2px',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>▤</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Archived Data</span>
          </button>
          <button style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', borderRadius: '8px', border: '1px solid transparent',
            background: 'transparent', cursor: 'pointer',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>▧</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>System Logs</span>
          </button>
        </div>
      </nav>

      {/* Bottom items */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            id={`sidebar-bottom-${item.id}`}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px',
              border: currentScreen === item.id ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
              background: currentScreen === item.id ? 'rgba(124,58,237,0.1)' : 'transparent',
              color: currentScreen === item.id ? 'var(--violet-300)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer',
              transition: 'all 0.15s ease', marginBottom: '2px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = currentScreen === item.id ? 'rgba(124,58,237,0.1)' : 'transparent'; e.currentTarget.style.color = currentScreen === item.id ? 'var(--violet-300)' : 'var(--text-muted)'; }}
          >
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* Streak indicator */}
        <div style={{
          margin: '8px 4px 0',
          padding: '10px 12px',
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>STREAK</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>🔥</span>
            <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--amber-400)' }}>{state.streak}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
