import { useEffect, useRef, useState } from 'react';
import field from '../../assets/images/finscribe/field.webp';
import { cx } from '../../lib/cx';
import c from '../covers.module.css';
import { useFilmActive } from '../../hooks/useFilmActive';
import type { ArtProps } from '../types';
import { DRAFT_WORDS, THOUGHT, WriteStage, type WriteState } from './stage/WriteStage';

/** The app's layout size, the same as the Compliance cover's, so the two read at one type size. */
const W = 820;
const H = 540;
/** One pass, in seconds. It ends with Home pressed, opening the dashboard it began with. */
const LOOP = 15.2;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** When each press lands; the screen changes a beat after. */
const PROMPT = 1.3;
const TYPE = 1.6;
const CHAR = 0.034;
const SHAPE = 4.2;
const DRAFT = 4.95;
const WRITE = 5.25;
const WORD = 0.05;
const CAROUSEL = 9.2;
const THEME = 11.0;
const HOME = 14.7;
/** Where the cursor goes: [leave, arrive, target]. It starts and ends on Home. */
const MOVES: [number, number, string][] = [
  [0.45, 1.2, 'client'],
  [3.55, 4.1, 'shape'],
  [8.45, 9.1, 'carousel'],
  [10.3, 10.9, 'dark'],
  [13.85, 14.6, 'home'],
];
const PRESSES: [number, string][] = [
  [PROMPT, 'client'],
  [SHAPE, 'shape'],
  [CAROUSEL, 'carousel'],
  [THEME, 'dark'],
  [HOME, 'home'],
];

function stateAt(t: number): WriteState {
  const press = PRESSES.find(([at]) => t >= at - 0.08 && t < at + 0.14)?.[1];
  const on = (at: number) => t >= at + 0.08 && t < HOME + 0.1;
  return {
    screen: on(DRAFT) ? 'draft' : 'home',
    prompt: on(PROMPT),
    typed: Math.round(clamp((t - TYPE) / CHAR, 0, THOUGHT.length)),
    shaping: on(SHAPE),
    words: Math.round(clamp((t - WRITE) / WORD, 0, DRAFT_WORDS)),
    carousel: on(CAROUSEL),
    theme: on(THEME) ? 'dark' : 'light',
    press,
  };
}

/**
 * A film of FinScribe in the same app and window as the Compliance cover, over a field of flowers. On the
 * dashboard's weekly check-in the cursor picks Client question, a rough thought types itself and is shaped into
 * a topic; the draft writes itself in the advisor's voice; the cursor repurposes it as a carousel and edits it
 * (switching it to the brand kit's dark theme), then presses Home, which is where it began.
 */
export function FinScribeCover({ className }: ArtProps) {
  const pane = useRef<HTMLSpanElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const pointer = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(0);
  const [state, setState] = useState<WriteState>(() => stateAt(0));
  const active = useFilmActive(pane);
  /** Seconds into the loop, kept across pauses so the film picks up where it left off. */
  const clock = useRef(0);

  useEffect(() => {
    const el = pane.current;
    if (!el) return;
    if (el.clientWidth) setScale(el.clientWidth / W);
    const sized = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / W));
    sized.observe(el);
    return () => sized.disconnect();
  }, []);

  useEffect(() => {
    const host = screen.current;
    if (!host || !scale || !active) return;
    // a target's middle in the app's own pixels, re-measured at most five times a second (layout reads are costly)
    const seen = new Map<string, { x: number; y: number; at: number }>();
    const find = (name: string, now: number) => {
      const was = seen.get(name);
      if (was && now - was.at < 200) return was;
      const el = name === 'home' ? [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Home') : host.querySelector(`[data-target="${name}"]`);
      if (el) {
        const h = host.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        if (r.height) seen.set(name, { x: (r.left - h.left) / scale + Math.min(r.width / scale / 2, 50), y: (r.top - h.top + r.height / 2) / scale, at: now });
      }
      return seen.get(name) ?? { x: 100, y: 80 };
    };
    let frame = 0;
    const start = performance.now() - clock.current * 1000;

    const tick = (now: number) => {
      clock.current = (now - start) / 1000;
      const t = clock.current % LOOP;
      const next = stateAt(t);
      setState((was) => (JSON.stringify(was) === JSON.stringify(next) ? was : next));

      // the cursor rests on Home, travels on gentle arcs to what it presses, and comes back to Home
      let from = find('home', now);
      let pos = from;
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
          const dd = Math.hypot(dx, dy) || 1;
          const lift = Math.sin(Math.PI * k) * dd * 0.12;
          pos = { x: from.x + dx * k + (dy / dd) * lift, y: from.y + dy * k - (dx / dd) * lift };
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
    <span className={cx(c.cover, c.filmScene, className)}>
      <img className={c.filmGround} src={field} alt="" decoding="async" fetchPriority="high" />
      <span ref={pane} className={c.filmWindow} style={{ height: H * scale || undefined }}>
        <span className={c.filmView} style={{ width: W, height: H, scale: String(scale || 0.001) }}>
          <div ref={screen} className={c.filmScreen} inert>
            <WriteStage {...state} />
            <svg ref={pointer} className={c.cpCursor} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 3.5 19 11l-6.2 1.6L9.6 18.6 5 3.5Z" />
            </svg>
          </div>
        </span>
      </span>
    </span>
  );
}
