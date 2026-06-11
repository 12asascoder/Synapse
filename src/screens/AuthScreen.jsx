/**
 * AuthScreen — Clean white minimalist login card
 */
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const isHover = useRef(false);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const onEnter = () => { isHover.current = true; };
    const onLeave = () => { isHover.current = false; };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseenter', onEnter, true);
    document.addEventListener('mouseleave', onLeave, true);
    const loop = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      ring.current.x += (pos.current.x - ring.current.x) * 0.1;
      ring.current.y += (pos.current.y - ring.current.y) * 0.1;
      if (ringRef.current) {
        const r = isHover.current ? 36 : 24;
        ringRef.current.style.transform = `translate(${ring.current.x - r}px, ${ring.current.y - r}px)`;
        ringRef.current.style.width = `${r * 2}px`;
        ringRef.current.style.height = `${r * 2}px`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter, true);
      document.removeEventListener('mouseleave', onLeave, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#CFFF00',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
        willChange: 'transform',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '1.5px solid rgba(207, 255, 0, 0.7)',
        pointerEvents: 'none',
        zIndex: 9998,
        mixBlendMode: 'difference',
        willChange: 'transform, width, height',
        transition: 'width 0.2s, height 0.2s',
      }} />
    </>
  );
}
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
      setError('Invalid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
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
        email: data.user.email.replace(/(.{2}).+(@.+)/, '$1***$2'),
        role: data.user.role,
        token: data.token,
      };

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: data.token });
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
      background: '#010203',
      color: '#f3f2ee',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      overflowX: 'hidden',
      position: 'relative',
      cursor: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <CustomCursor />
      {/* Auth card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '56px 48px',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.5s ease',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Synapse logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 48,
              height: 48,
              background: '#000',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: '#fff'
            }}>✦</div>
          </div>
          <h1 style={{
            fontSize: '32px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            marginBottom: '10px',
            letterSpacing: '-0.02em',
            color: '#fff'
          }}>
            Welcome to Synapse
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#A59F97',
          }}>
            Sign in to continue to your learning hub.
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '10px',
          marginBottom: '32px',
          padding: '4px',
        }}>
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                background: mode === m ? '#CFFF00' : 'transparent',
                color: mode === m ? '#010203' : '#6B6B6B',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth} noValidate>
          {/* Name (signup only) */}
          {mode === 'signup' && (
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label className="input-label" style={{ marginBottom: '6px' }}>Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  id="auth-name"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#f3f2ee', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '8px 12px' }}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label className="input-label" style={{ marginBottom: '6px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                id="auth-email"
                required
                style={{ background: 'rgba(255,255,255,0.05)', color: '#f3f2ee', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '8px 12px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label">Password</label>
              {mode === 'signin' && (
                <span style={{ fontSize: '12px', color: '#44403B', cursor: 'pointer', fontWeight: 500 }}>
                  Forgot password?
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
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
                style={{ background: 'rgba(255,255,255,0.05)', color: '#f3f2ee', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '8px 12px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#A59F97',
                  fontSize: '14px',
                  padding: '4px',
                }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px 16px',
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#DC2626',
            }}>
              {error}
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
              padding: '16px',
              fontSize: '15px',
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '12px'
            }}
          >
            {loading ? 'Authenticating...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '13px',
          color: '#A59F97',
          lineHeight: 1.6,
        }}>
          By continuing, you agree to Synapse's <br /> Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
