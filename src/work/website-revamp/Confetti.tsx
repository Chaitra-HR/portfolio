import { useEffect, useRef, useState } from 'react';

/** The site's lilac and the asterisk's colours. */
const COLORS = ['#D69FF9', '#F35BC2', '#9A6CF2', '#4F7BF7'];
const PIECES = 70;
const LIFE = 2800;

/** A short shower down the screen, each time `target` comes into view. Skipped for reduced motion. */
export function Confetti({ target }: { target: string }) {
  const [shower, setShower] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = document.getElementById(target);
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShower((n) => n + 1);
      },
      { threshold: 0.4 },
    );
    seen.observe(el);
    return () => seen.disconnect();
  }, [target]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!shower || !el || !ctx) return;
    const ratio = Math.min(devicePixelRatio, 2);
    const w = innerWidth;
    const h = innerHeight;
    el.width = w * ratio;
    el.height = h * ratio;
    ctx.scale(ratio, ratio);

    const pieces = Array.from({ length: PIECES }, (_, i) => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h * 0.5,
      vy: 3.2 + Math.random() * 2.6,
      sway: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.25,
      turn: Math.random() * Math.PI,
      size: 6 + Math.random() * 4,
      color: COLORS[i % COLORS.length],
    }));

    let frame = 0;
    let start = 0;
    const draw = (now: number) => {
      start ||= now;
      const age = now - start;
      if (age > LIFE) return setShower(0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.min(1, (LIFE - age) / 500);
      for (const p of pieces) {
        p.y += p.vy;
        p.turn += p.spin;
        p.sway += 0.04;
        ctx.save();
        ctx.translate(p.x + Math.sin(p.sway) * 24, p.y);
        ctx.rotate(p.turn);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [shower]);

  if (!shower) return null;
  return <canvas ref={canvas} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 50, width: '100vw', height: '100vh', pointerEvents: 'none' }} />;
}
