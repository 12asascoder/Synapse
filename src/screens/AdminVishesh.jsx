import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';

import { useApp } from '../context/AppContext';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CARD = { background: 'rgba(10, 15, 25, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '16px' };
const INPUT = { background: 'rgba(10, 15, 25, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '10px 14px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none', width: '100%' };

export default function AdminVishesh() {
  const { state } = useApp();
  const token = state.token;
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState('');

  const handleTest = async () => {
    if (!testPrompt.trim()) return;
    setTesting(true); setTestResponse(''); setTestError('');
    try {
      const res = await fetch(`${API}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: testPrompt, contextHistory: [] }),
      });
      const data = await res.json();
      if (data.error) { setTestError(data.error); }
      else { setTestResponse(data.response || 'No response received'); }
    } catch (err) {
      setTestError('Failed to connect to Vishesh AI service');
    }
    setTesting(false);
  };

  const apiUrl = import.meta.env.VITE_TRUGEN_API_URL || 'https://api.openai.com/v1';
  const model = import.meta.env.VITE_TRUGEN_MODEL || 'gpt-4o-mini';
  const fallback = import.meta.env.VITE_AI_FALLBACK || import.meta.env.VITE_AI_FALLBACK_ON_ERROR || 'false';

  const configItems = [
    { label: 'API Provider', value: 'TruGen AI (OpenAI-compatible)', color: 'var(--cyan-400)', icon: '🤖' },
    { label: 'API URL', value: apiUrl, color: 'var(--violet-400)', icon: '🔗' },
    { label: 'Model', value: model, color: 'var(--amber-400)', icon: '🧠' },
    { label: 'Fallback Mode', value: fallback === 'true' ? 'Enabled' : 'Disabled', color: fallback === 'true' ? 'var(--emerald-400)' : 'var(--rose-400)', icon: '🔄' },
  ];

  const systemPrompt = 'You are Vishesh, an elite AI mentor specializing in software engineering, data structures, algorithms, and career guidance. Respond concisely and accurately.';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--cyan-50)', marginBottom: '8px' }}>Vishesh Control Center</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>Configure and monitor the AI intelligence layer</p>
        </header>

        {/* Status Banner */}
        <div style={{ ...CARD, padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, var(--emerald-400), var(--cyan-400), var(--violet-400))' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, var(--cyan-600), var(--violet-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 0 24px rgba(6,182,212,0.4)' }}>✦</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-display)', color: 'white' }}>VISHESH AI ENGINE</div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)', marginTop: '2px' }}>Growth Intelligence Mentor v1.0</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 14px', borderRadius: '20px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-400)', boxShadow: '0 0 8px var(--emerald-400)', animation: 'pulse 2s infinite' }} />
              <span style={{ color: 'var(--emerald-400)', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>ONLINE</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Configuration */}
          <div style={{ ...CARD, padding: '24px' }}>
            <div style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Configuration</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {configItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', color: item.color, fontFamily: 'var(--font-mono)', fontWeight: 600, lineHeight: 1.4 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div style={{ ...CARD, padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Prompt</div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.1)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {systemPrompt}
            </div>

            <div style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capabilities</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['Lesson Delivery', 'Code Review', 'Assessment Grading', 'Interview Simulation', 'Concept Explanation', 'Career Guidance', 'Exercise Generation', 'Progress Analysis'].map((cap, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--emerald-400)', fontSize: '12px' }}>✓</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Panel */}
        <div style={{ ...CARD, padding: '24px' }}>
          <div style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test Vishesh AI</div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              id="test-prompt-input"
              style={{ ...INPUT, flex: 1 }}
              placeholder="Enter a test prompt for Vishesh..."
              value={testPrompt}
              onChange={e => setTestPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !testing) handleTest(); }}
            />
            <button
              id="btn-test-vishesh"
              onClick={handleTest}
              disabled={testing || !testPrompt.trim()}
              style={{
                background: testing ? 'rgba(56,189,248,0.2)' : 'linear-gradient(135deg, var(--cyan-600), var(--cyan-400))',
                border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px',
                fontFamily: 'var(--font-mono)', fontSize: '13px', cursor: testing ? 'wait' : 'pointer',
                fontWeight: 700, opacity: (!testPrompt.trim() || testing) ? 0.5 : 1, whiteSpace: 'nowrap',
              }}
            >
              {testing ? '⟳ Processing...' : '▶ Send Test'}
            </button>
          </div>

          {testError && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', padding: '16px', color: 'var(--rose-400)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.5 }}>
              <strong>Error:</strong> {testError}
            </div>
          )}

          {testResponse && (
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '10px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, var(--cyan-400), var(--violet-400))' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px' }}>✦</span>
                <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Vishesh Response</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {testResponse}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
