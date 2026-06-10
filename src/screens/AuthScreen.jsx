/**
 * AuthScreen — Glassmorphism login card matching reference image precisely
 * "Welcome to Vishesh" · dark glassmorphism · blurred orb background
 */
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthScreen() {
  const { dispatch, navigate } = useApp();
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // TODO(security): In production, replace with real auth (OAuth2/JWT via BFF).
  // Credentials must NEVER be sent in URL params.
  // Session tokens must be stored in HttpOnly, Secure, SameSite=Lax cookies only.
  // CSRF tokens must be implemented for all state-changing endpoints.
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    // Input validation
    if (!email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid identification string.');
      return;
    }
    if (password.length < 8) {
      setError('Access cipher must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login';
      const body = mode === 'signup' ? { name, email, password } : { email, password };
      
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      const user = {
        name: data.user.name,
        email: data.user.email.replace(/(.{2}).+(@.+)/, '$1***$2'), // Mask email for display
        role: data.user.role,
        joinedAt: new Date().toISOString(),
      };

      dispatch({ type: 'SET_USER', payload: user });
      setLoading(false);
      
      if (user.role === 'SUPER_ADMIN') {
        navigate('admin-dashboard');
      } else {
        navigate('hub');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Blurred orb background — exact match to reference */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '15%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
        filter: 'blur(60px)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '12%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
        filter: 'blur(70px)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Auth card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(16, 16, 28, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '20px',
        padding: '48px 40px',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.5s ease',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.08)',
      }}>
        {/* Synapse logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg, var(--violet-600), var(--violet-400))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 0 24px rgba(124,58,237,0.4)',
            }}>✦</div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'var(--violet-400)',
            marginBottom: '10px',
            fontWeight: 600,
          }}>SYNAPSE</div>
          <h1 style={{
            fontSize: '30px',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            marginBottom: '8px',
          }}>
            Welcome to Vishesh
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
            Authenticate to access the command center.
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(10,10,15,0.6)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '28px',
          padding: '3px',
        }}>
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease',
                background: mode === m ? 'rgba(124,58,237,0.3)' : 'transparent',
                color: mode === m ? 'var(--violet-300)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth} noValidate>
          {/* Name (signup only) */}
          {mode === 'signup' && (
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Operative Name</label>
              <div style={{ position: 'relative' }}>
                <span className="input-icon" style={{ top: '50%', transform: 'translateY(-50%)' }}>👤</span>
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  id="auth-name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label className="input-label">Identification String (Email)</label>
            <div style={{ position: 'relative' }}>
              <span className="input-icon" style={{ top: '50%', transform: 'translateY(-50%)' }}>✉</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@synapse.net"
                autoComplete="email"
                id="auth-email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label">Access Cipher (Password)</label>
              {mode === 'signin' && (
                <span style={{ fontSize: '11px', color: 'var(--cyan-400)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                  Decrypt Access?
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <span className="input-icon" style={{ top: '50%', transform: 'translateY(-50%)' }}>🔒</span>
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                id="auth-password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  padding: '4px',
                }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '10px 14px',
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--rose-400)',
              fontFamily: 'var(--font-mono)',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="auth-submit"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              background: loading
                ? 'rgba(124,58,237,0.4)'
                : 'linear-gradient(135deg, var(--violet-600), var(--violet-500))',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin-slow 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Authenticating...
              </span>
            ) : (
              `Initialize Session →`
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
        }}>
          By proceeding, you agree to the Synapse Neural Privacy Ledger and Terms of Operation.
        </p>
      </div>
    </div>
  );
}
