/**
 * LandingPage — Hackorizon Dark Aesthetic
 * Deep black · Neon yellow accent · Cinematic typography
 * Enhanced: Giant outline text hero, particle constellation,
 *           wireframe polyhedra, custom cursor
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ─────────────────────────────────────────────
   SOUND ENGINE (Web Audio API Synthesizer)
───────────────────────────────────────────── */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.drones = [];
    this.isMuted = true;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.startDrone();
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.masterGain) {
      const targetVol = muted ? 0 : 0.18;
      this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.15);
    }
  }

  startDrone() {
    if (!this.ctx) return;
    const freqs = [73.42, 98.00, 146.83, 196.00];
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.connect(this.masterGain);

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(filter);
      osc.start();

      this.drones.push({ osc, gain });
    });
  }

  playHover() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn(e);
    }
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.linearRampToValueAtTime(120, now + 0.12);
      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.14);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(660, now + 0.08);
      gain2.gain.setValueAtTime(0.02, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now);
      osc2.stop(now + 0.1);
    } catch (e) {
      console.warn(e);
    }
  }

  destroy() {
    this.drones.forEach(d => {
      try { d.osc.stop(); } catch(e){}
    });
    if (this.ctx) {
      try { this.ctx.close(); } catch(e){}
    }
  }
}

/* ─────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────── */
function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const pos      = useRef({ x: -100, y: -100 });
  const ring     = useRef({ x: -100, y: -100 });
  const rafRef   = useRef(null);
  const isHover  = useRef(false);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const onEnter = () => { isHover.current = true; };
    const onLeave = () => { isHover.current = false; };

    window.addEventListener('mousemove', onMove);
    // detect hoverable elements
    document.addEventListener('mouseenter', onEnter, true);
    document.addEventListener('mouseleave', onLeave, true);

    const loop = () => {
      // dot snaps immediately
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      // ring lags behind with lerp
      ring.current.x += (pos.current.x - ring.current.x) * 0.1;
      ring.current.y += (pos.current.y - ring.current.y) * 0.1;
      if (ringRef.current) {
        const r = isHover.current ? 36 : 24;
        ringRef.current.style.transform = `translate(${ring.current.x - r}px, ${ring.current.y - r}px)`;
        ringRef.current.style.width  = `${r * 2}px`;
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
      {/* Small solid dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: '50%',
          background: '#CFFF00',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 48, height: 48,
          borderRadius: '50%',
          border: '1.5px solid rgba(207, 255, 0, 0.7)',
          pointerEvents: 'none',
          zIndex: 9998,
          mixBlendMode: 'difference',
          willChange: 'transform, width, height',
          transition: 'width 0.2s, height 0.2s',
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   HERO CANVAS — particles + polyhedra + grid + outline text
───────────────────────────────────────────── */
function HeroCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let gridOffset = 0;

    /* ── resize ── */
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();

    /* ── mouse ── */
    const onMouse = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.parentElement.addEventListener('mousemove', onMouse);

    /* ── particles ── */
    const NPTS = 90;
    const pts = Array.from({ length: NPTS }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.4,
    }));

    /* ── wireframe icosahedron helper ── */
    const icoFaces = (() => {
      const φ = (1 + Math.sqrt(5)) / 2;
      const verts = [
        [-1, φ, 0], [1, φ, 0], [-1, -φ, 0], [1, -φ, 0],
        [0, -1, φ], [0, 1, φ], [0, -1, -φ], [0, 1, -φ],
        [φ, 0, -1], [φ, 0, 1], [-φ, 0, -1], [-φ, 0, 1],
      ].map(([x, y, z]) => {
        const l = Math.hypot(x, y, z);
        return [x / l, y / l, z / l];
      });
      const edges = [
        [0,1],[0,5],[0,7],[0,10],[0,11],
        [1,5],[1,7],[1,8],[1,9],
        [2,3],[2,4],[2,6],[2,10],[2,11],
        [3,4],[3,6],[3,8],[3,9],
        [4,5],[4,9],[4,11],
        [5,9],[5,11],
        [6,7],[6,8],[6,10],
        [7,8],[7,10],
        [8,9],[10,11],
      ];
      return { verts, edges };
    })();

    function drawWireframe(cx, cy, radius, rotX, rotY, rotZ, alpha) {
      const cos = Math.cos, sin = Math.sin;
      const project = ([x, y, z]) => {
        // rotate X
        let y1 = y * cos(rotX) - z * sin(rotX);
        let z1 = y * sin(rotX) + z * cos(rotX);
        // rotate Y
        let x2 = x * cos(rotY) + z1 * sin(rotY);
        let z2 = -x * sin(rotY) + z1 * cos(rotY);
        // rotate Z
        let x3 = x2 * cos(rotZ) - y1 * sin(rotZ);
        let y3 = x2 * sin(rotZ) + y1 * cos(rotZ);
        return [cx + x3 * radius, cy + y3 * radius];
      };
      ctx.strokeStyle = `rgba(207, 255, 0, ${alpha})`;
      ctx.lineWidth = 0.7;
      for (const [a, b] of icoFaces.edges) {
        const [ax, ay] = project(icoFaces.verts[a]);
        const [bx, by] = project(icoFaces.verts[b]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      // draw vertex dots
      ctx.fillStyle = `rgba(207, 255, 0, ${alpha * 1.8})`;
      for (const v of icoFaces.verts) {
        const [px, py] = project(v);
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ── shapes ── */
    const shapes = [
      { bx: 0.62, by: 0.32, r: 72, spd: 0.0007, phase: 0    },
      { bx: 0.82, by: 0.65, r: 42, spd: 0.0011, phase: 1.2  },
      { bx: 0.45, by: 0.72, r: 34, spd: 0.0009, phase: 2.1  },
      { bx: 0.15, by: 0.55, r: 50, spd: 0.0006, phase: 3.5  },
      { bx: 0.75, by: 0.18, r: 28, spd: 0.0014, phase: 0.7  },
    ];

    /* ── perspective grid ── */
    const drawGrid = (t) => {
      const W = canvas.width, H = canvas.height;
      const horizon = H * 0.42;
      const cx = W / 2;
      const COLS = 20, ROWS = 14;

      // vertical lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i <= COLS; i++) {
        const xBase    = (W / COLS) * i;
        const xHorizon = cx + (xBase - cx) * 0.04;
        const alpha    = 0.05 + Math.abs((xBase / W) - 0.5) * 0.03;
        ctx.strokeStyle = `rgba(207,255,0,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(xBase, H);
        ctx.lineTo(xHorizon, horizon);
        ctx.stroke();
      }
      // horizontal lines moving
      gridOffset = (gridOffset + 0.5) % (H / ROWS);
      for (let i = 0; i < ROWS + 2; i++) {
        const progress = (i / ROWS + gridOffset / (H / ROWS)) % 1;
        const y = horizon + (H - horizon) * Math.pow(progress, 1.8);
        const a = progress * 0.14;
        ctx.strokeStyle = `rgba(207,255,0,${a})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    };

    /* ── main render ── */
    const render = (t) => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ① Perspective grid
      drawGrid(t);

      // ② Particles + connections
      const mx = mouseRef.current.x || W / 2;
      const my = mouseRef.current.y || H / 2;

      for (const p of pts) {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        // subtle mouse attraction
        const dx = mx - p.x, dy = my - p.y;
        const d  = Math.hypot(dx, dy);
        if (d < 160) { p.x += dx * 0.0005; p.y += dy * 0.0005; }
      }

      // draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            const a = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = `rgba(207,255,0,${a})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // draw dots
      for (const p of pts) {
        ctx.fillStyle = 'rgba(207,255,0,0.55)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ④ Wireframe polyhedra
      for (const s of shapes) {
        const cx = s.bx * W;
        const cy = s.by * H;
        const rot = t * s.spd + s.phase;
        drawWireframe(cx, cy, s.r, rot * 1.1, rot, rot * 0.7, 0.22);
      }

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      ro.disconnect();
      canvas.parentElement?.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const NAV_LINKS = ['ABOUT', 'BOOTCAMPS', 'SCHEDULE', 'COMMUNITY', 'FAQ'];

const STATS = [
  { label: 'BUILD TIME',      value: '∞'     },
  { label: 'AI-POWERED',      value: '100%'  },
  { label: 'ACTIVE LEARNERS', value: '8,450+'},
  { label: 'MISSION',         value: 'BUILD' },
];

const MARQUEE_ITEMS = [
  'AI & MACHINE LEARNING', 'FULL STACK ENGINEERING', 'SYSTEM DESIGN',
  'PRODUCT MANAGEMENT', 'UI/UX DESIGN', 'DATA SCIENCE', 'CLOUD ARCHITECTURE',
  'BLOCKCHAIN', 'CYBERSECURITY', '6 BOOTCAMPS',
];

const PHASES = [
  { phase:'PHASE 01', title:'Foundations',  date:'WEEK 1–2', desc:'Kickstart your bootcamp with curated lessons, video content and daily AI-assisted drills. Build your base before the sprint.' },
  { phase:'PHASE 02', title:'Deep Dives',   date:'WEEK 3–4', desc:'Work through advanced modules, peer reviews and live mentor sessions. The knowledge compounds daily.' },
  { phase:'PHASE 03', title:'Assessment',   date:'WEEK 5',   desc:'Proctored AI-graded assessments across knowledge and application. Every answer immutably logged.' },
  { phase:'PHASE 04', title:'Capstone',     date:'WEEK 6',   desc:'Ship your milestone project. Pass the milestone interview to earn your Skill Passport certification.' },
];

const FEATURES = [
  { id:'01', title:'Adaptive Curriculum',   desc:'AI-native bootcamps that dynamically evolve with your progress. No two sessions look exactly alike.' },
  { id:'02', title:'Proctored Validation',  desc:'Fair, consistent evaluations with immutable evidence your compliance team can review and trust.' },
  { id:'03', title:'Skill Passport',        desc:'Earn verifiable certificates for each bootcamp phase. A living credential that grows with you.' },
];

/* ─────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────── */
function Reveal({ children, delay = 0, direction = 'up' }) {
  const initial =
    direction === 'up'    ? { opacity:0, y: 40 } :
    direction === 'left'  ? { opacity:0, x:-40 } :
    direction === 'right' ? { opacity:0, x: 40 } :
                            { opacity:0 };
  const animate =
    direction === 'up'    ? { opacity:1, y:0 } :
    direction === 'left'  ? { opacity:1, x:0 } :
    direction === 'right' ? { opacity:1, x:0 } :
                            { opacity:1 };
  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once:true, margin:'-80px' }}
      transition={{ duration:0.65, delay, ease:[0.22,1,0.36,1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SHARED STYLES
───────────────────────────────────────────── */
const S = {
  page: {
    background: '#010203',
    minHeight: '100vh',
    color: '#f3f2ee',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    overflowX: 'hidden',
    position: 'relative',
    zIndex: 10,
    cursor: 'none',          // hide default cursor
  },
  nav: {
    position: 'fixed',
    top:0, left:0, right:0,
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    zIndex: 200,
    background: 'rgba(1,2,3,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(243,242,238,0.08)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    color: '#CFFF00',
    textTransform: 'uppercase',
    cursor: 'none',
  },
  navLink: {
    background: 'none',
    border: 'none',
    cursor: 'none',
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(243,242,238,0.5)',
    letterSpacing: '0.12em',
    fontFamily: 'inherit',
    transition: 'color 0.2s',
  },
  btnAccent: {
    background: '#CFFF00',
    color: '#010203',
    border: 'none',
    padding: '10px 22px',
    fontWeight: 800,
    fontSize: '12px',
    letterSpacing: '0.08em',
    cursor: 'none',
    fontFamily: 'inherit',
    textTransform: 'uppercase',
    transition: 'opacity 0.2s',
  },
};

/* ─────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────── */
function SectionLabel({ text }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
      <div style={{ width:'32px', height:'1px', background:'rgba(243,242,238,0.4)' }} />
      <span style={{ fontSize:'12px', fontWeight:600, color:'rgba(243,242,238,0.5)', letterSpacing:'0.12em' }}>
        {text}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function LandingPage() {
  const { navigate } = useApp();
  const [hoveredNav, setHoveredNav] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const soundEngineRef = useRef(null);
  const heroRef = useRef(null);

  // Scroll-driven hero animations
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Content moves from bottom-left to center as you scroll
  const heroContentY     = useTransform(heroProgress, [0, 1], ['0%',  '-18%']);
  const heroContentX     = useTransform(heroProgress, [0, 0.6], ['0%', '8%']);
  const heroHeadlineScale = useTransform(heroProgress, [0, 0.7], [1, 1.06]);
  const heroTagsOpacity  = useTransform(heroProgress, [0, 0.25], [1, 0]);
  const heroTagsY        = useTransform(heroProgress, [0, 0.3], ['0px', '-30px']);
  const heroBarOpacity   = useTransform(heroProgress, [0, 0.2], [1, 0]);
  const heroCardX        = useTransform(heroProgress, [0, 0.4], ['0px', '80px']);
  const heroCardOpacity  = useTransform(heroProgress, [0, 0.35], [1, 0]);
  const canvasParallaxY  = useTransform(heroProgress, [0, 1], ['0px', '-120px']);
  const heroDescOpacity  = useTransform(heroProgress, [0, 0.45], [1, 0]);
  const heroCtaOpacity   = useTransform(heroProgress, [0, 0.4], [1, 0]);

  useEffect(() => {
    soundEngineRef.current = new SoundEngine();
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (soundEngineRef.current) {
        soundEngineRef.current.destroy();
      }
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (soundEngineRef.current) {
      soundEngineRef.current.setMuted(nextMuted);
      soundEngineRef.current.playClick();
    }
  };

  const handleNavHover = () => {
    if (soundEngineRef.current) {
      soundEngineRef.current.playHover();
    }
  };

  const handleButtonClick = () => {
    if (soundEngineRef.current) {
      soundEngineRef.current.playClick();
    }
  };

  return (
    <div style={S.page}>
      {/* CSS Stylesheet injection for modern custom classes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          display: flex;
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
        .hover-underline {
          position: relative;
          background: none;
          border: none;
          cursor: none;
          font-size: 11px;
          font-weight: 500;
          color: rgba(244, 242, 237, 0.45);
          letter-spacing: 1.54px;
          text-transform: uppercase;
          font-family: inherit;
          transition: color 0.3s ease;
          padding: 6px 0;
          display: flex;
          align-items: center;
        }
        .hover-underline:hover {
          color: #F3F2EE;
        }
        .hover-underline::after {
          content: "";
          background: #CFFF00;
          transform-origin: 100%;
          width: 100%;
          height: 1.5px;
          transition: transform .4s cubic-bezier(.77,0,.18,1);
          position: absolute;
          bottom: -2px;
          left: 0;
          transform: scaleX(0);
        }
        .hover-underline:hover::after {
          transform-origin: 0;
          transform: scaleX(1);
        }
        .btn-fill-accent {
          position: relative;
          background: #CFFF00;
          color: #020306;
          border: none;
          padding: 10px 18px;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 1.6px;
          cursor: none;
          font-family: inherit;
          text-transform: uppercase;
          z-index: 1;
          overflow: hidden;
          transition: color 0.35s cubic-bezier(.77,0,.18,1);
          border-radius: 0px !important;
        }
        .btn-fill-accent::before {
          content: "";
          background: #F3F2EE;
          transform-origin: bottom;
          transition: transform .35s cubic-bezier(.77,0,.18,1);
          position: absolute;
          inset: 0;
          z-index: -1;
          transform: scaleY(0);
        }
        .btn-fill-accent:hover {
          color: #020306;
        }
        .btn-fill-accent:hover::before {
          transform: scaleY(1);
        }
        .sound-btn {
          background: none;
          border: none;
          color: rgba(244, 242, 237, 0.45);
          cursor: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          transition: color 0.2s ease;
        }
        .sound-btn:hover {
          color: #CFFF00;
        }
      `}</style>

      {/* Custom cursor (rendered first so it's always on top) */}
      <CustomCursor />

      {/* ── NAV ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(16px, 5vw, 48px)',
          zIndex: 200,
          background: 'rgba(2, 3, 6, 0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(242, 242, 242, 0.08)',
        }}
      >
        {/* Left: Logo and divider */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'none' }}
            onClick={handleButtonClick}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ width: '16px', height: '2.5px', background: '#CFFF00' }} />
              <div style={{ width: '16px', height: '2.5px', background: '#CFFF00' }} />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '0.14em',
                color: '#CFFF00',
                textTransform: 'uppercase',
              }}
            >
              SYNAPSE
            </span>
          </div>

          <div
            style={{
              width: '1px',
              height: '24px',
              background: 'rgba(242, 242, 242, 0.08)',
              margin: '0 24px',
            }}
          />
        </div>

        {/* Center: Nav links */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {NAV_LINKS.map(link => {
            const isCommunity = link === 'COMMUNITY';
            return (
              <button
                key={link}
                className="hover-underline"
                style={{
                  fontWeight: isCommunity ? 700 : 500,
                  color: isCommunity ? '#F3F2EE' : undefined,
                }}
                onMouseEnter={handleNavHover}
                onClick={handleButtonClick}
              >
                {isCommunity && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: '6px', display: 'inline-block' }}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                )}
                {link}
              </button>
            );
          })}
        </div>

        {/* Right: Sound toggle and login button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Sound Toggle */}
          <button
            className="sound-btn"
            onClick={toggleMute}
            onMouseEnter={handleNavHover}
            title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {isMuted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="22" y1="9" x2="16" y2="15" />
                <line x1="16" y1="9" x2="22" y2="15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>

          <button
            className="btn-fill-accent"
            onClick={() => {
              handleButtonClick();
              navigate('auth');
            }}
            onMouseEnter={handleNavHover}
          >
            LOGIN / REGISTER
          </button>
        </div>
      </nav>

      {/* Ticker Bar (under nav, slides down on scroll) */}
      <div
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          height: '24px',
          background: '#CFFF00',
          color: '#020306',
          zIndex: 199,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(2, 3, 6, 0.1)',
          transform: scrollY > 50 ? 'translateY(0)' : 'translateY(-100%)',
          opacity: scrollY > 50 ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s linear',
        }}
      >
        <div className="marquee-content">
          {Array.from({ length: 2 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                display: 'inline-block',
              }}
            >
              SYNAPSE AI ✦ ADAPTIVE CURRICULUM ✦ VERIFIABLE SKILLS ✦ NEXTMOVE ✦ 6 BOOTCAMPS ✦ LIVE DRILLS ✦ CHAT WITH TRUGEN ✦ 100% ONLINE ✦ SHIFT YOUR CAREER ✦&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          height: '100vh',
          background: '#010203',
        }}
      >
        {/* Sticky inner — stays fixed while scrolling through the 200vh */}
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '64px',
          paddingBottom: '24px',
        }}>
        {/* Animated canvas background — parallaxes on scroll */}
        <motion.div style={{ position: 'absolute', inset: 0, y: canvasParallaxY }}>
          <HeroCanvas />
        </motion.div>

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(1,2,3,0.1) 0%, rgba(1,2,3,0.0) 30%, rgba(1,2,3,0.6) 70%, rgba(1,2,3,0.96) 100%)',
        }} />

        {/* Neon glow blob right */}
        <div style={{
          position: 'absolute', top: '10%', right: '8%', width: '600px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(207,255,0,0.05) 0%, transparent 65%)',
          zIndex: 1, pointerEvents: 'none',
        }} />

        {/* ── Main hero content ── — moves toward center on scroll */}
        <motion.div style={{
          position: 'relative', zIndex: 3,
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '12px',
          padding: '0 48px',
          y: heroContentY,
          x: heroContentX,
        }}>

          {/* Top tags strip — fades out on scroll */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: 'flex', gap: '14px', alignItems: 'center', opacity: heroCtaOpacity, marginTop: '-40px', y: heroTagsY }}
          >
            {['◇ VIRTUAL', '◇ AI-POWERED', '◇ JUNE 2026'].map(tag => (
              <span key={tag} style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
                color: 'rgba(207,255,0,0.65)', textTransform: 'uppercase',
              }}>
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Center zone: PRESENTS + headline + desc + CTAs */}
          <div style={{ maxWidth: '780px' }}>

            {/* PRESENTS label */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ marginBottom: '18px' }}
            >
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#f3f2ee', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Synapse AI
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(243,242,238,0.38)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '4px' }}>
                PRESENTS
              </div>
            </motion.div>

            {/* Main headline — scales slightly as it moves to center */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(36px, 5.5vw, 80px)',
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
                color: '#f3f2ee',
                margin: '0 0 24px 0',
                textTransform: 'lowercase',
                scale: heroHeadlineScale,
                transformOrigin: 'left center',
              }}
            >
              finally an ai that{' '}
              <span style={{ fontStyle: 'italic', color: '#CFFF00' }}>takes bootcamps</span>
              <br />
              that actually{' '}
              <span style={{ fontStyle: 'italic', color: '#CFFF00' }}>makes an impact.</span>
            </motion.h1>

            {/* Description — fades on scroll */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontSize: '16px', color: 'rgba(243,242,238,0.5)',
                maxWidth: '480px', lineHeight: 1.65, fontWeight: 400,
                margin: '0 0 28px 0',
                opacity: heroDescOpacity,
              }}
            >
              India's most ambitious AI learning platform. A focused sprint for
              builders who want to ship something that survives the demo.
            </motion.p>

            {/* CTAs — fade on scroll */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '14px', alignItems: 'center', opacity: heroCtaOpacity, zIndex: 5 }}
              >
              <button
                onClick={() => navigate('auth')}
                style={{
                  background: '#CFFF00', color: '#010203', border: 'none',
                  padding: '14px 32px', fontSize: '12px', fontWeight: 800,
                  letterSpacing: '0.1em', cursor: 'none', fontFamily: 'inherit',
                  textTransform: 'uppercase', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(207,255,0,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                REGISTER NOW →
              </button>
              <button
                onClick={() => navigate('auth')}
                style={{
                  background: 'transparent', color: '#f3f2ee',
                  border: '1px solid rgba(243,242,238,0.2)',
                  padding: '13px 28px', fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.08em', cursor: 'none', fontFamily: 'inherit',
                  textTransform: 'uppercase', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(207,255,0,0.45)'; e.currentTarget.style.color = '#CFFF00'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(243,242,238,0.2)'; e.currentTarget.style.color = '#f3f2ee'; }}
              >
                ◯ JOIN COMMUNITY
              </button>
            </motion.div>
          </div>

          {/* Bottom bar — fades on scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid rgba(243,242,238,0.07)',
              paddingTop: '18px', paddingBottom: '20px',
              opacity: heroBarOpacity,
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(243,242,238,0.3)', letterSpacing: '0.14em' }}>
              24H BOOTCAMPS · VIRTUAL · FREE · ALL LEARNERS
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, fontStyle: 'italic', color: '#CFFF00', letterSpacing: '-0.01em' }}>
              Enroll Today 2026
            </span>
            <button
              onClick={() => navigate('auth')}
              style={{
                background: '#CFFF00', color: '#010203', border: 'none',
                padding: '10px 20px', fontSize: '10px', fontWeight: 800,
                letterSpacing: '0.1em', cursor: 'none', fontFamily: 'inherit',
                textTransform: 'uppercase', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              REGISTER NOW →
            </button>
          </motion.div>
        </motion.div>

        {/* Right-side info card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          style={{
            position: 'absolute', right: '48px', bottom: '72px',
            width: '252px', border: '1px solid rgba(207,255,0,0.14)',
            padding: '24px', background: 'rgba(1,2,3,0.88)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', zIndex: 4,
          }}
        >
          {/* info card content */}
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#CFFF00', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '16px' }}>
            6 TRACKS
          </div>
          {[
            { label: 'TRACKS', value: 'AI, Fullstack, DSA,\nProduct, Design, Cloud' },
            { label: 'ACCESS', value: 'Free for all learners' },
            { label: 'COMMUNITY', value: '◯ Synapse Builders Network' },
          ].map((row, i, arr) => (
            <div key={row.label}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(243,242,238,0.3)', letterSpacing: '0.16em', marginBottom: '5px' }}>
                {row.label}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f3f2ee', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                {row.value}
              </div>
              {i < arr.length - 1 && (
                <div style={{ height: '1px', background: 'rgba(243,242,238,0.07)', margin: '14px 0' }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '72px', left: '50%',
          transform: 'translateX(-50%)', textAlign: 'center', zIndex: 3,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(243,242,238,0.2)', letterSpacing: '0.24em' }}>
            SCROLL
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom, rgba(207,255,0,0.7), transparent)' }}
          />
        </div>
      </div>
      </section>


      {/* ── STATS BAR ── */}
      <div style={{ borderTop:'1px solid rgba(243,242,238,0.07)', borderBottom:'1px solid rgba(243,242,238,0.07)', background:'#010203' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
          {STATS.map((s,i) => (
            <Reveal key={s.label} delay={i*0.08}>
              <div style={{
                padding:'36px 40px',
                borderRight: i !== STATS.length-1 ? '1px solid rgba(243,242,238,0.07)' : 'none',
              }}>
                <div style={{ fontSize:'11px', fontWeight:600, color:'rgba(243,242,238,0.38)', letterSpacing:'0.12em', marginBottom:'8px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize:'48px', fontWeight:900, color:'#CFFF00', lineHeight:1, letterSpacing:'-0.02em' }}>
                  {s.value}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div style={{ background:'#CFFF00', padding:'14px 0', overflow:'hidden', whiteSpace:'nowrap' }}>
        <div style={{ display:'inline-flex', gap:'36px', animation:'marquee-lp 28s linear infinite' }}>
          {[...MARQUEE_ITEMS,...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((item,i) => (
            <span
              key={i}
              style={{
                fontSize:'12px', fontWeight:800, letterSpacing:'0.1em',
                color:'#010203', textTransform:'uppercase',
                display:'inline-flex', alignItems:'center', gap:'14px',
              }}
            >
              {item}
              {i < MARQUEE_ITEMS.length*3-1 && <span style={{ color:'rgba(1,2,3,0.35)' }}>✦</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section style={{ padding:'120px 40px', borderBottom:'1px solid rgba(243,242,238,0.07)' }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'start' }}>

          <Reveal direction="left">
            <SectionLabel text="WHAT IS THIS" />
            <h2 style={{ fontSize:'clamp(40px,4vw,64px)', fontWeight:900, lineHeight:1.0, letterSpacing:'-0.03em', color:'#f3f2ee' }}>
              The learning platform you&apos;ve been{' '}
              <span style={{ fontStyle:'italic', color:'#CFFF00' }}>waiting for.</span>
            </h2>
          </Reveal>

          <Reveal direction="right" delay={0.15}>
            <p style={{ fontSize:'18px', color:'rgba(243,242,238,0.58)', lineHeight:1.65, fontWeight:400, marginBottom:'32px' }}>
              Synapse isn't a platform you attend. It's one you survive — and emerge with something real.
              A verified skill. A co-builder. A story worth telling. Six weeks of uninterrupted learning,
              mentorship from people who've actually shipped, and problem sets that demand your absolute best.
            </p>

            <blockquote style={{ borderLeft:'2px solid #CFFF00', paddingLeft:'24px', fontSize:'20px', fontStyle:'italic', color:'#f3f2ee', lineHeight:1.5, fontWeight:600, marginBottom:'32px' }}>
              "We didn't want to build another course platform. We wanted to build the one people still talk about ten years from now."
            </blockquote>

            <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(243,242,238,0.38)', letterSpacing:'0.12em' }}>
              — ORGANISED BY <span style={{ color:'#f3f2ee' }}>SYNAPSE AI COMMUNITY</span>
            </div>

            <button
              onClick={() => navigate('auth')}
              style={{
                marginTop:'40px', background:'transparent',
                border:'1px solid rgba(243,242,238,0.18)',
                color:'#f3f2ee', padding:'14px 28px',
                fontSize:'13px', fontWeight:700,
                letterSpacing:'0.08em', cursor:'none',
                fontFamily:'inherit', textTransform:'uppercase',
                transition:'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background='#CFFF00';
                e.currentTarget.style.color='#010203';
                e.currentTarget.style.borderColor='#CFFF00';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background='transparent';
                e.currentTarget.style.color='#f3f2ee';
                e.currentTarget.style.borderColor='rgba(243,242,238,0.18)';
              }}
            >
              JOIN THE COMMUNITY ◯
            </button>
          </Reveal>

        </div>
      </section>

      {/* ── PHASE TIMELINE ── */}
      <section style={{ padding:'80px 0', borderBottom:'1px solid rgba(243,242,238,0.07)' }}>
        <div style={{ padding:'0 40px', marginBottom:'48px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <Reveal>
            <SectionLabel text="THE JOURNEY" />
            <h2 style={{ fontSize:'48px', fontWeight:900, color:'#f3f2ee', letterSpacing:'-0.02em', lineHeight:1 }}>
              HOW IT WORKS
            </h2>
          </Reveal>
          <div style={{ fontSize:'11px', color:'rgba(243,242,238,0.28)', letterSpacing:'0.1em', paddingBottom:'4px' }}>
            DRAG TO EXPLORE →
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid rgba(243,242,238,0.08)' }}>
          {PHASES.map((phase, i) => (
            <Reveal key={phase.phase} delay={i*0.1}>
              <div
                style={{
                  padding:'40px',
                  borderRight: i !== PHASES.length-1 ? '1px solid rgba(243,242,238,0.08)' : 'none',
                  minHeight:'220px',
                  display:'flex',
                  flexDirection:'column',
                  transition:'background 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(207,255,0,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <div style={{ fontSize:'11px', fontWeight:700, color:'#CFFF00', letterSpacing:'0.14em', marginBottom:'18px' }}>
                  {phase.phase}
                </div>
                <div style={{ fontSize:'22px', fontWeight:800, fontStyle:'italic', color:'#f3f2ee', marginBottom:'6px', lineHeight:1.2 }}>
                  {phase.title}
                </div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'rgba(243,242,238,0.3)', letterSpacing:'0.1em', marginBottom:'18px' }}>
                  {phase.date}
                </div>
                <p style={{ fontSize:'14px', color:'rgba(243,242,238,0.48)', lineHeight:1.65, fontWeight:400, flex:1 }}>
                  {phase.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section style={{ padding:'120px 40px', borderBottom:'1px solid rgba(243,242,238,0.07)' }}>
        <div style={{ maxWidth:'1400px', margin:'0 auto' }}>
          <Reveal>
            <SectionLabel text="CAPABILITIES" />
            <h2 style={{ fontSize:'48px', fontWeight:900, color:'#f3f2ee', letterSpacing:'-0.02em', lineHeight:1, marginBottom:'80px' }}>
              ENGINEERED FOR SCALE
            </h2>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'rgba(243,242,238,0.07)' }}>
            {FEATURES.map((f,i) => (
              <Reveal key={f.id} delay={i*0.1}>
                <div
                  style={{ background:'#010203', padding:'48px 40px', transition:'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#0d0c0b'}
                  onMouseLeave={e => e.currentTarget.style.background='#010203'}
                >
                  <div style={{ fontSize:'40px', fontWeight:900, color:'rgba(207,255,0,0.18)', fontFamily:'monospace', letterSpacing:'-0.02em', marginBottom:'28px', lineHeight:1 }}>
                    {f.id}
                  </div>
                  <h3 style={{ fontSize:'22px', fontWeight:800, color:'#f3f2ee', letterSpacing:'-0.01em', marginBottom:'16px', lineHeight:1.2 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize:'15px', color:'rgba(243,242,238,0.48)', lineHeight:1.65, fontWeight:400 }}>
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding:'140px 40px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:'700px', height:'350px',
          background:'radial-gradient(ellipse, rgba(207,255,0,0.05) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />
        <Reveal>
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'12px', marginBottom:'28px' }}>
            <div style={{ width:'32px', height:'1px', background:'rgba(243,242,238,0.35)' }} />
            <span style={{ fontSize:'11px', fontWeight:600, color:'rgba(243,242,238,0.45)', letterSpacing:'0.14em' }}>
              YOUR STORY STARTS HERE
            </span>
            <div style={{ width:'32px', height:'1px', background:'rgba(243,242,238,0.35)' }} />
          </div>
          <h2 style={{
            fontSize:'clamp(52px,7vw,96px)', fontWeight:900,
            letterSpacing:'-0.04em', lineHeight:0.95,
            color:'#f3f2ee', textTransform:'uppercase',
            marginBottom:'48px',
          }}>
            READY TO{' '}
            <span style={{ fontStyle:'italic', color:'#CFFF00' }}>BUILD?</span>
          </h2>
          <button
            onClick={() => navigate('auth')}
            style={{ ...S.btnAccent, padding:'18px 48px', fontSize:'14px', display:'inline-flex', alignItems:'center', gap:'12px' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >
            REGISTER NOW →
          </button>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop:'1px solid rgba(243,242,238,0.07)',
        background:'#0d0c0b',
        padding:'48px 40px',
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
      }}>
        <div style={{ fontSize:'18px', fontWeight:900, color:'#CFFF00', letterSpacing:'-0.01em' }}>SYNAPSE</div>
        <div style={{ fontSize:'11px', fontWeight:600, color:'rgba(243,242,238,0.28)', letterSpacing:'0.1em' }}>
          © 2026 SYNAPSE ENTERPRISE · ALL RIGHTS RESERVED
        </div>
        <button
          onClick={() => navigate('auth')}
          style={{ ...S.btnAccent, padding:'10px 20px', fontSize:'11px' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}
        >
          GET STARTED →
        </button>
      </footer>

      {/* ── Global CSS ── */}
      <style>{`
        @keyframes marquee-lp {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        * { cursor: none !important; }
      `}</style>
    </div>
  );
}
