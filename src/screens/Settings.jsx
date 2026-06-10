import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';

export default function Settings() {
  const { state, dispatch } = useApp();

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-area">
        <div style={{ padding: '32px', maxWidth: '800px' }}>

          <div style={{ marginBottom: '32px', animation: 'fadeInUp 0.3s ease' }}>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 900 }}>System Configuration</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              Manage your neural link and Vishesh AI parameters
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* AI Engine Settings */}
            <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px', animation: 'fadeInUp 0.4s ease 0.1s both' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--violet-400)' }}>🧠</span> Vishesh Engine
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(10,10,18,0.5)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.1)', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>AI Provider Status</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TruGen AI connection state</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-400)', boxShadow: '0 0 8px var(--emerald-400)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>ONLINE</span>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(10,10,18,0.5)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.1)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>Neural Model</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  TruGen AI · Cloud Inference
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
                  Configured via TRUGEN_MODEL environment variable
                </div>
              </div>
            </div>

            {/* Neural Interface */}
            <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px', animation: 'fadeInUp 0.4s ease 0.2s both' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--cyan-400)' }}>⚡</span> Neural Interface
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { id: 'animations', label: 'Holographic Animations', desc: 'Enable advanced particle effects and rendering', checked: true },
                  { id: 'sound', label: 'Haptic Audio', desc: 'Interface sounds and AI voice modulation', checked: false },
                  { id: 'streaming', label: 'Real-time Streaming', desc: 'Stream Vishesh responses token-by-token', checked: true },
                ].map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(10,10,18,0.5)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.05)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{s.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.desc}</div>
                    </div>
                    <div style={{ width: 40, height: 22, background: s.checked ? 'var(--violet-500)' : 'rgba(255,255,255,0.1)', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      <div style={{ position: 'absolute', top: 2, left: s.checked ? 20 : 2, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: 'all 0.2s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Account Settings */}
            <div style={{ background: 'rgba(12,12,22,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '24px', animation: 'fadeInUp 0.4s ease 0.3s both' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--emerald-400)' }}>👤</span> Operative Profile
              </div>
              <button 
                onClick={() => dispatch({ type: 'LOGOUT' })}
                style={{ padding: '10px 16px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: 'var(--rose-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
              >
                Terminate Session
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
