import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet, apiPut } from '../lib/api';
import Sidebar from '../components/Sidebar';

const TOGGLES = [
  { id: 'animations', label: 'Micro-Animations', desc: 'Enable subtle transitions and state changes' },
  { id: 'sound', label: 'Haptic Audio', desc: 'Interface sounds and AI voice modulation' },
  { id: 'streaming', label: 'Real-time Streaming', desc: 'Stream AI responses token-by-token' },
];

export default function Settings() {
  const { state, dispatch } = useApp();
  const [preferences, setPreferences] = useState({ streaming: true, animations: true, sound: false });
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    apiGet('/users/me', state.token).then(data => {
      if (data?.preferences) setPreferences(data.preferences);
    }).catch(() => {});
  }, [state.token]);

  const toggle = async (id) => {
    const next = { ...preferences, [id]: !preferences[id] };
    setPreferences(next);
    setSaving(id);
    await apiPut('/users/me/preferences', { preferences: next }, state.token);
    setSaving(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#010203', display: 'flex', color: '#f3f2ee' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
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
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>TruGen AI &middot; Cloud Inference</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Configured via TRUGEN_MODEL environment variable</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>⚡</span> Interface Settings
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {TOGGLES.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.desc}</div>
                  </div>
                  <div
                    onClick={() => toggle(s.id)}
                    style={{ width: 44, height: 24, background: preferences[s.id] ? 'var(--border-active)' : 'var(--border-subtle)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease', opacity: saving === s.id ? 0.5 : 1 }}
                  >
                    <div style={{ position: 'absolute', top: 2, left: preferences[s.id] ? 22 : 2, width: 20, height: 20, background: '#010203', borderRadius: '50%', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Preferences saved to your account</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>👤</span> Account Actions
            </div>
            <button
              onClick={() => dispatch({ type: 'LOGOUT' })}
              style={{ padding: '12px 24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#fca5a5', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
