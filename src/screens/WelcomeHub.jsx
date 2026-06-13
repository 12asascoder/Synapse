import { useApp } from '../context/AppContext';

export default function WelcomeHub() {
  const { navigate } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(1,2,3,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: '64px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 28, height: 28, background: 'var(--border-active)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#010203', fontWeight: 800 }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>SYNAPSE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-active)' }} />
          System Ready
        </div>
      </nav>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: '64px', minHeight: '100vh',
      }}>
        <div style={{ maxWidth: '800px', textAlign: 'center', padding: '40px' }}>
          <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '16px', background: 'var(--border-active)', color: '#010203',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
              margin: '0 auto 32px', fontWeight: 800
            }}>
              ✦
            </div>
            <h1 style={{
              fontSize: '44px',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}>
              Welcome to Synapse.
            </h1>
            <p style={{
              fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6,
              marginBottom: '48px',
            }}>
              Start learning or prepare for your next interview.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '640px', margin: '0 auto' }}>
              <button onClick={() => navigate('dashboard')} style={{
                padding: '36px 24px', borderRadius: '16px', border: '1px solid rgba(243,242,238,0.2)',
                background: 'rgba(10,10,12,0.8)', cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#CFFF00'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(207,255,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(243,242,238,0.2)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
              >
                <div style={{ fontSize: '40px' }}>📚</div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#f3f2ee' }}>My Dashboard</div>
                <div style={{ fontSize: '14px', color: '#A59F97', lineHeight: 1.5 }}>
                  Continue your learning journey with daily lessons, assessments, and growth tracking.
                </div>
                <div style={{ marginTop: '8px', padding: '8px 20px', borderRadius: '8px', background: '#CFFF00', color: '#010203', fontWeight: 700, fontSize: '14px' }}>
                  Go to Dashboard →
                </div>
              </button>

              <button onClick={() => navigate('interview-prep')} style={{
                padding: '36px 24px', borderRadius: '16px', border: '1px solid rgba(243,242,238,0.2)',
                background: 'rgba(10,10,12,0.8)', cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#CFFF00'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(207,255,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(243,242,238,0.2)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
              >
                <div style={{ fontSize: '40px' }}>🎯</div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#f3f2ee' }}>Interview Preparation</div>
                <div style={{ fontSize: '14px', color: '#A59F97', lineHeight: 1.5 }}>
                  Set up company-specific interview prep with mock interviews, DSA practice, and performance tracking.
                </div>
                <div style={{ marginTop: '8px', padding: '8px 20px', borderRadius: '8px', background: '#CFFF00', color: '#010203', fontWeight: 700, fontSize: '14px' }}>
                  Start Prep →
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
