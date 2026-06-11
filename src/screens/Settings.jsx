/**
 * Settings — System Configuration
 * Hackorizon Dark Aesthetic Design
 */
import { useApp } from '../context/AppContext';
import ThemeContainer from '../components/ThemeContainer';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const { state, dispatch } = useApp();

  return (
    <ThemeContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
        <Sidebar />
        
        <div style={{ flex: 1, padding: '24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px', animation: 'fadeInUp 0.4s ease 0.1s both', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>🧠</span> System Integration
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>AI Provider Status</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>TruGen AI connection state</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>ONLINE</span>
                </div>
              </div>

              <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>Neural Model</div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  TruGen AI · Cloud Inference
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Configured via TRUGEN_MODEL environment variable
                </div>
              </div>
            </div>

            {/* Neural Interface */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px', animation: 'fadeInUp 0.4s ease 0.2s both', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>⚡</span> Interface Settings
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { id: 'animations', label: 'Micro-Animations', desc: 'Enable subtle transitions and state changes', checked: true },
                  { id: 'sound', label: 'Haptic Audio', desc: 'Interface sounds and AI voice modulation', checked: false },
                  { id: 'streaming', label: 'Real-time Streaming', desc: 'Stream Vishesh responses token-by-token', checked: true },
                ].map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{s.label}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.desc}</div>
                    </div>
                    <div style={{ width: 44, height: 24, background: s.checked ? 'var(--border-active)' : 'var(--border-subtle)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      <div style={{ position: 'absolute', top: 2, left: s.checked ? 22 : 2, width: 20, height: 20, background: '#010203', borderRadius: '50%', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Account Settings */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px', animation: 'fadeInUp 0.4s ease 0.3s both', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>👤</span> Account Actions
              </div>
              <button 
                onClick={() => dispatch({ type: 'LOGOUT' })}
                className="btn"
                style={{ padding: '12px 24px', background: 'var(--border-active)', border: '1px solid var(--border-active)', borderRadius: '10px', color: '#010203', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              >
                Sign Out
              </button>
            </div>

          </div>
        </div>
      </div>
    </ThemeContainer>
  );
}
