import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/scroll';

interface LookAtOptions {
  /** Max travel in px along each axis. */
  x: number;
  y: number;
  /** Distance in px at which the eyes reach full travel. */
  range: number;
  /** A fixed transform that wins while set (Home: the mascot's "hot" pose). */
  override?: string;
  /** When the cursor rests (or there is none), glance around now and then. */
  wander?: boolean;
}

/** Idle glances start this long after the cursor last moved (ms). */
const WANDER_AFTER = 2200;

/**
 * Points a mascot's eyes at the cursor. Writes the transform straight onto
 * `target` once per frame instead of re-rendering React on every mousemove.
 */
export function useLookAt(
  anchor: RefObject<Element | null>,
  target: RefObject<SVGElement | null>,
  options: LookAtOptions,
): void {
  const opts = useRef(options);
  opts.current = options;
  const resting = useRef('translate(0px, 0px)');

  useEffect(() => {
    let frame = 0;
    let last: MouseEvent | null = null;

    const apply = () => {
      frame = 0;
      const a = anchor.current;
      const t = target.current;
      if (!a || !t || !last) return;
      const { x, y, range, override } = opts.current;
      const r = a.getBoundingClientRect();
      const dx = last.clientX - (r.left + r.width / 2);
      const dy = last.clientY - (r.top + r.height / 2);
      const d = Math.max(1, Math.hypot(dx, dy));
      const k = Math.min(1, d / range);
      resting.current = `translate(${Math.round((dx / d) * x * k)}px, ${Math.round((dy / d) * y * k)}px)`;
      t.style.transform = override ?? resting.current;
    };

    let movedAt = 0;
    const onMove = (e: MouseEvent) => {
      last = e;
      movedAt = performance.now();
      if (!frame) frame = requestAnimationFrame(apply);
    };

    // idle glances: a quick look somewhere, a pause, sometimes back to the cursor
    let glance = 0;
    const wander = () => {
      glance = window.setTimeout(wander, 1200 + Math.random() * 2600);
      const t = target.current;
      const { x, y, override } = opts.current;
      if (!t || override || performance.now() - movedAt < WANDER_AFTER || document.hidden) return;
      if (last && Math.random() < 0.35) {
        apply();
        return;
      }
      const a = Math.random() * Math.PI * 2;
      const k = Math.random() < 0.25 ? 0 : 0.5 + Math.random() * 0.5;
      t.style.transform = `translate(${(Math.cos(a) * x * k).toFixed(1)}px, ${(Math.sin(a) * y * k * 0.8).toFixed(1)}px)`;
    };
    if (opts.current.wander && !prefersReducedMotion()) glance = window.setTimeout(wander, WANDER_AFTER);

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(frame);
      clearTimeout(glance);
    };
  }, [anchor, target]);

  useLayoutEffect(() => {
    const t = target.current;
    if (t) t.style.transform = options.override ?? resting.current;
  }, [target, options.override]);
}
