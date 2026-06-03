/**
 * LandingPage — Hero, platform overview, testimonials, universities
 * Dark futuristic AI command center aesthetic
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import NeuralSphere from '../components/NeuralSphere';

const NAV_LINKS = ['Intelligence', 'Bootcamps', 'Skill Passport', 'Analytics', 'Community', 'Documentation'];

const BOOTCAMP_PREVIEWS = [
  { name: 'Forward Deployed\nEngineer', icon: '⚡', color: '#7c3aed' },
  { name: 'AI Engineer', icon: '🧠', color: '#06b6d4' },
  { name: 'Sales Representative', icon: '📈', color: '#10b981' },
  { name: 'Product Manager', icon: '🎯', color: '#f59e0b' },
];

const FEATURES = [
  {
    icon: '🧠',
    title: 'Built for next-gen roles',
    desc: 'From Sales and Support to Product and Engineering, configure bootcamps that match how your teams actually work today.',
    tag: 'ADAPTIVE',
  },
  {
    icon: '⚡',
    title: 'Get Started Quickly',
    desc: 'Start with a curriculum or from scratch. Configure and deploy your bootcamp in minutes, with a simple, chat-based setup.',
    tag: 'RAPID',
  },
  {
    icon: '🛡️',
    title: 'Consistent by Design',
    desc: "Stays on the curriculum, doesn't veer off track, and evaluates in a fair, consistent manner with evidence your team can review.",
    tag: 'PROCTORED',
  },
  {
    icon: '📊',
    title: 'Flags Misbehavior',
    desc: 'Flags suspicious behavior during the learning session and surfaces integrity signals in the report, so you can verify skill acquisition with confidence.',
    tag: 'INTEGRITY',
  },
];

const UNIVERSITIES = ['OXFORD', 'MIT', 'STANFORD', 'HARVARD', 'BERKELEY', 'IIT', 'NUS', 'ETH'];

const TESTIMONIALS = [
  {
    name: 'Aria Chen',
    role: 'AI Engineer @ DeepMind',
    text: 'Vishesh pushed me harder than any bootcamp I\'ve done. The oral validations are what set it apart — you can\'t fake understanding.',
    avatar: 'AC',
  },
  {
    name: 'Marcus Webb',
    role: 'Senior PM @ Stripe',
    text: 'The adaptive curriculum noticed my weaknesses before I did. By Day 30 my system design skills were unrecognizable.',
    avatar: 'MW',
  },
  {
    name: 'Priya Nair',
    role: 'DevOps Lead @ Cloudflare',
    text: 'I\'ve done Coursera, I\'ve done Udemy. Synapse is the first platform that actually made me career-ready.',
    avatar: 'PN',
  },
];

export default function LandingPage() {
  const { navigate } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredBootcamp, setHoveredBootcamp] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(10,10,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
        padding: '0 40px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 28,
            height: 28,
            background: 'linear-gradient(135deg, var(--violet-600), var(--cyan-500))',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}>✦</div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '0.12em',
            color: 'var(--text-primary)',
          }}>SYNAPSE</span>
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {NAV_LINKS.map((link) => (
            <button key={link} className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 14px' }}>
              {link}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('auth')}>
            Sign In
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('auth')}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            Launch Console
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 40px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
        <div className="orb orb-violet" style={{ width: 700, height: 700, top: -200, left: '50%', transform: 'translateX(-50%)', opacity: 0.25 }} />
        <div className="orb orb-cyan" style={{ width: 400, height: 400, bottom: 0, right: '15%', opacity: 0.15 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          {/* Pill badge */}
          <div style={{ marginBottom: '28px', animation: 'fadeInUp 0.5s ease' }}>
            <span className="badge badge-violet" style={{ fontSize: '11px', padding: '5px 14px' }}>
              ✦ AI Growth Intelligence Layer
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(42px, 6vw, 76px)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '24px',
            animation: 'fadeInUp 0.6s ease 0.1s both',
          }}>
            Finally, an AI which takes{' '}
            <span style={{
              background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              bootcamps that actually matter
            </span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto 48px',
            lineHeight: 1.7,
            animation: 'fadeInUp 0.6s ease 0.2s both',
          }}>
            Synapse is an AI-powered learning environment that runs bootcamps like your best instructors, adapting in real time, probing for understanding, and delivering verified skill growth you can trust.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            animation: 'fadeInUp 0.6s ease 0.3s both',
          }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('auth')}
              style={{ gap: '10px' }}
              id="hero-begin-journey"
            >
              Begin Journey <span>→</span>
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('auth')}
              id="hero-explore-bootcamps"
            >
              Explore Bootcamps
            </button>
          </div>
        </div>

        {/* Demo card */}
        <div style={{
          marginTop: '80px',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.7s ease 0.4s both',
          width: '100%',
          maxWidth: '640px',
        }}>
          <div className="glass" style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 0 60px rgba(139,92,246,0.15)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}>
              <div style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'white',
                boxShadow: '0 0 12px rgba(139,92,246,0.4)',
              }}>V</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--violet-300)' }}>
                  Synapse · AI Bootcamp
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Neural Network · Active
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div className="dot-live" />
              </div>
            </div>

            <div style={{
              background: 'rgba(10,10,15,0.8)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              textAlign: 'center',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[0.5,0.8,1,0.7,0.9,0.6,1,0.8,0.5,0.7,0.9,0.6].map((h,i) => (
                  <div key={i} style={{
                    width: '3px',
                    height: '24px',
                    background: 'linear-gradient(180deg, var(--cyan-400), var(--violet-500))',
                    borderRadius: '2px',
                    transform: `scaleY(${h})`,
                    animation: 'waveform 1.4s ease-in-out infinite',
                    animationDelay: `${i * 100}ms`,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                The Synapse Experience
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('auth')}
                style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, fontSize: '20px' }}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLE CARDS ── */}
      <section style={{ padding: '80px 40px', position: 'relative' }}>
        <div className="container">
          <div style={{ marginBottom: '48px', animation: 'fadeInUp 0.5s ease' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
              {[
                { title: 'Backend Developer II', time: 'Created 31 minutes ago' },
                { title: 'Lead Product Designer', time: 'Created 3 hours ago' },
              ].map((r) => (
                <div key={r.title} className="card" style={{ flex: '1', minWidth: '180px', padding: '16px 20px' }}>
                  <div style={{ width: 28, height: 28, background: 'var(--bg-panel)', borderRadius: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                    {r.title.includes('Backend') ? '⚙' : '🎨'}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{r.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.time}</div>
                </div>
              ))}
              <div className="card" style={{
                flex: '1.5',
                minWidth: '200px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '16px 20px',
              }}>
                <input
                  className="input"
                  style={{ flex: 1, paddingLeft: '16px' }}
                  placeholder="Paste the curriculum or describe the role..."
                  readOnly
                />
                <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  Create bootcamp
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ padding: '32px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span className={`badge badge-violet`}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRY SYNAPSE ── */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>
            Try Synapse for yourself
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            Select any of the paths below to quickly preview the bootcamp curriculum.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {BOOTCAMP_PREVIEWS.map((b, i) => (
              <button
                key={b.name}
                onClick={() => navigate('auth')}
                onMouseEnter={() => setHoveredBootcamp(i)}
                onMouseLeave={() => setHoveredBootcamp(null)}
                style={{
                  background: hoveredBootcamp === i
                    ? `rgba(${b.color === '#7c3aed' ? '124,58,237' : b.color === '#06b6d4' ? '6,182,212' : b.color === '#10b981' ? '16,185,129' : '245,158,11'}, 0.12)`
                    : 'var(--bg-card)',
                  border: `1px solid ${hoveredBootcamp === i ? b.color + '44' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-xl)',
                  padding: '48px 24px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  transform: hoveredBootcamp === i ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredBootcamp === i ? `0 8px 32px ${b.color}22` : 'none',
                  textAlign: 'left',
                }}>
                <div style={{ fontSize: '28px', marginBottom: '40px' }}>{b.icon}</div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: hoveredBootcamp === i ? b.color : 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.3,
                }}>
                  {b.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 40px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '48px', fontFamily: 'var(--font-display)' }}>
            Operators who leveled up
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--violet-700), var(--violet-500))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.role}</div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIVERSITIES ── */}
      <section style={{ padding: '60px 40px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            letterSpacing: '0.2em',
            marginBottom: '32px',
            textTransform: 'uppercase',
          }}>
            Integrated Network Nodes
          </div>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {UNIVERSITIES.map((u) => (
              <div key={u} style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                transition: 'color 0.2s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {u}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '40px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-void)',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, var(--violet-600), var(--cyan-500))', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✦</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.1em' }}>SYNAPSE</span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Neural Security', 'Privacy Ledger', 'System Status', 'Contact Node'].map((l) => (
              <span key={l} style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            © 2026 SYNAPSE Neural Systems
          </div>
        </div>
      </footer>
    </div>
  );
}
