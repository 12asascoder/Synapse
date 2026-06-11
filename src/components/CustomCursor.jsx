import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef(null);
  const animationFrame = () => {
    const { current: dot } = dotRef;
    const { current: ring } = ringRef;
    if (!dot || !ring) return;
    const diffX = pos.current.x - ring.x;
    const diffY = pos.current.y - ring.y;
    ring.x += diffX * 0.25;
    ring.y += diffY * 0.25;
    dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    ring.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
    raf.current = requestAnimationFrame(animationFrame);
  };
  const mouseMove = (e) => {
    pos.current = { x: e.clientX, y: e.clientY };
  };
  useEffect(() => {
    document.addEventListener('mousemove', mouseMove);
    raf.current = requestAnimationFrame(animationFrame);
    return () => {
      document.removeEventListener('mousemove', mouseMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);
  const dotStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#CFFF00',
    pointerEvents: 'none',
    zIndex: 9999,
    transform: 'translate(-50%, -50%)',
  };
  const ringStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '32px',
    height: '32px',
    border: '2px solid #CFFF00',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 9998,
    transform: 'translate(-50%, -50%)',
  };
  return (
    <>
      <div ref={dotRef} style={dotStyle} />
      <div ref={ringRef} style={ringStyle} />
    </>
  );
}
