/**
 * NeuralSphere — Animated 3D neural network sphere using Canvas
 * Restyled for clean white ElevenLabs aesthetic
 */
import { useEffect, useRef } from 'react';

export default function NeuralSphere({ size = 200, color1 = '#000000', color2 = '#495057', speed = 0.3 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    let t = 0;

    // Generate nodes on sphere surface using fibonacci lattice
    const nodeCount = 60;
    const nodes = [];
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = golden * i;
      nodes.push({
        ox: Math.cos(theta) * rad,
        oy: y,
        oz: Math.sin(theta) * rad,
      });
    }

    // Edges: connect nodes within angular distance threshold
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dot = nodes[i].ox * nodes[j].ox + nodes[i].oy * nodes[j].oy + nodes[i].oz * nodes[j].oz;
        if (dot > 0.82) edges.push([i, j]);
      }
    }

    function project(nx, ny, nz, rotX, rotY) {
      // Rotate Y
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      let x = nx * cosY - nz * sinY;
      let z = nx * sinY + nz * cosY;
      // Rotate X
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      let y = ny * cosX - z * sinX;
      return { x: cx + x * r, y: cy + y * r, z };
    }

    function draw() {
      ctx.clearRect(0, 0, size, size);
      t += 0.008 * speed;

      const rotY = t;
      const rotX = Math.sin(t * 0.4) * 0.3;

      // Project nodes
      const projected = nodes.map((n) => project(n.ox, n.oy, n.oz, rotX, rotY));

      // Draw edges
      for (const [i, j] of edges) {
        const a = projected[i];
        const b = projected[j];
        const avgZ = (a.z + b.z) / 2;
        const alpha = Math.max(0, (avgZ + 1) / 2) * 0.35;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, `${color1}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, `${color2}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw nodes
      for (const p of projected) {
        const visible = (p.z + 1) / 2;
        if (visible < 0.1) continue;
        const alpha = Math.pow(visible, 1.5);
        const nodeR = visible * 2.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);

        // Solid fill
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.9})`;
        ctx.fill();

        // Subtle glow / outline
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4 * visible;
        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 159, 151, ${alpha * 0.8})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [size, color1, color2, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: 'block' }}
      aria-label="Vishesh Neural Sphere"
    />
  );
}
