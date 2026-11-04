import { useEffect, useRef, useState } from 'react';
import field from '../../assets/images/gather/field.webp';
import { cx } from '../../lib/cx';
import c from '../covers.module.css';
import { useFilmActive } from '../../hooks/useFilmActive';
import type { ArtProps } from '../types';
import { MoneyStage, WORTH, type StageState } from './stage/MoneyStage';

/** The stage's design width; it scales to the tile, and taller tiles simply show more of it. */
const W = 1000;
/** One pass, in seconds. The cursor undoes what it did and returns to where it began, so the loop has no seam. */
const LOOP = 11.8;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Where the cursor goes: [leave at, arrive at, target]. "rest" is its home, low on the right. */
const MOVES: [number, number, string][] = [
  [0.5, 1.4, 'property'],
  [3.9, 4.7, 'joint'],
  [5.2, 6.0, 'add'],
  [8.4, 9.3, 'remove'],
  [9.9, 10.9, 'rest'],
];
/** Presses: [time, what]. Each one is the cause of the change that follows it. */
const PRESSES: [number, string][] = [
  [1.5, 'property'],
  [4.8, 'joint'],
  [6.1, 'add'],
  [9.45, 'remove'],
];
const OPEN = 1.6;
const TYPE = 2.3;
const DIGIT = 0.1;
const JOINT = 4.9;
const ADDED = 6.25;
const REMOVED = 9.6;
const REST = { x: 870, y: 590 };

function stateAt(t: number): StageState {
  const added = t >= ADDED && t < REMOVED;
  const live = t >= OPEN && t < REMOVED;
  const press = PRESSES.find(([at]) => t >= at - 0.08 && t < at + 0.14)?.[1];
  return {
    open: live,
    typed: live ? Math.round(clamp((t - TYPE) / DIGIT, 0, WORTH.length)) : 0,
    joint: live && t >= JOINT,
    added,
    press,
  };
}

/**
 * MoneyWorks onboarding as a product demo over a green field, after benji.org/stageshow: the window pinned to the
 * top left and running off the tile, and one interaction told by a cursor. A client adds their home: Property,
 * the home's value, whose it is, Add to assets, and the total rolls to match. Then the cursor takes it out again.
 */
export function GatherCover({ className }: ArtProps) {
  const root = useRef<HTMLSpanElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(0);
  const [state, setState] = useState<StageState>(() => stateAt(0));
  const active = useFilmActive(root);
  /** Seconds into the loop, kept across pauses so the film picks up where it left off. */
  const clock = useRef(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const sized = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / W));
    sized.observe(el);
    return () => sized.disconnect();
  }, []);

  useEffect(() => {
    const host = stage.current;
    if (!host || !scale || !active) return;
    // a target's middle in stage units, unaffected by the stage's scale; re-measured at most five times a second
    const seen = new Map<string, { x: number; y: number; at: number }>([['rest', { ...REST, at: Infinity }]]);
    const find = (name: string, now: number) => {
      const was = seen.get(name);
      if (was && now - was.at < 200) return was;
      let el = host.querySelector<HTMLElement>(`[data-target="${name}"]`);
      if (el && el.offsetHeight) {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        let x = 0;
        let y = 0;
        while (el && el !== host) {
          x += el.offsetLeft;
          y += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        // aim a little left of centre on wide controls, like a hand would
        seen.set(name, { x: x + Math.min(w / 2, 70), y: y + h / 2, at: now });
      }
      return seen.get(name) ?? REST;
    };
    let frame = 0;
    const start = performance.now() - clock.current * 1000;

    const tick = (now: number) => {
      clock.current = (now - start) / 1000;
      const t = clock.current % LOOP;
      const next = stateAt(t);
      setState((was) => (JSON.stringify(was) === JSON.stringify(next) ? was : next));

      // the cursor travels on a gentle arc between targets, and rests on each until it moves on
      let from = REST;
      let pos = REST;
      for (const [leave, arrive, name] of MOVES) {
        const to = find(name, now);
        if (t < leave) {
          pos = from;
          break;
        }
        if (t < arrive) {
          const k = ease((t - leave) / (arrive - leave));
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const d = Math.hypot(dx, dy) || 1;
          const lift = Math.sin(Math.PI * k) * d * 0.12;
          pos = { x: from.x + dx * k + (dy / d) * lift, y: from.y + dy * k - (dx / d) * lift };
          break;
        }
        pos = to;
        from = to;
      }
      const p = pointer.current;
      if (p) {
        p.style.translate = `${pos.x}px ${pos.y}px`;
        p.style.scale = next.press ? '.84' : '1';
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scale, active]);

  return (
    <span ref={root} className={cx(c.cover, c.filmScene, className)} style={{ background: '#1F3A14' }}>
      <img className={c.filmGround} src={field} alt="" decoding="async" fetchPriority="high" />
      <div ref={stage} className={c.stageHost} style={{ scale: String(scale || 0.001) }} inert>
        <MoneyStage {...state} />
        <svg ref={pointer} className={c.stageCursor} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 3.5 19 11l-6.2 1.6L9.6 18.6 5 3.5Z" />
        </svg>
      </div>
    </span>
  );
}
