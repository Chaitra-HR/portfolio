import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import r from './Cover.module.css';

/** The phone's screen in iOS points (iPhone Pro: 402 × 874); the frame adds 13 on each side. */
const SCREEN = 402;
const FRAME = SCREEN + 26;
/**
 * How much of the phone, in points from its top edge, must always be in view: status bar, title, composer and the
 * opened answer. The phone is scaled so that much fits the card's height (and never wider than SHARE of it).
 */
const VIEW = 470;
const SHARE = 0.74;

const THOUGHT = 'I’m falling behind at work';
const PERSPECTIVE = 'One slow stretch isn’t the whole story. You’ve grown this year, just more quietly.';
const WORDS = PERSPECTIVE.split(' ');

/** One pass, in seconds: type the thought, tap Reframe, take one breath, read the answer, tap Done, which clears it. */
const LOOP = 11.8;
const TYPE = 0.5;
const CHAR = 0.05;
const REFRAME = 2.7;
/** One guided breath between the tap and the answer: in, then out. */
const BREATH = 2.85;
const EXHALE = 3.95;
const ANSWER = 5.05;
const STREAM = 5.4;
const WORD = 0.085;
const DONE = 9.5;
/** Where the finger goes: [leave, arrive, target]. Between taps it is lifted (hidden), low on the screen. */
const MOVES: [number, number, string][] = [
  [1.95, 2.6, 'reframe'],
  [8.75, 9.4, 'done'],
  [9.75, 10.6, 'rest'],
];
const REST = { x: 300, y: 420 };




const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

interface State {
  typed: number;
  open: boolean;
  breath?: 'in' | 'out';
  words: number;
  press?: string;
}

function stateAt(t: number): State {
  const cleared = t >= DONE + 0.1;
  const press = t >= REFRAME - 0.06 && t < REFRAME + 0.16 ? 'reframe' : t >= DONE - 0.06 && t < DONE + 0.16 ? 'done' : undefined;
  return {
    typed: cleared ? 0 : Math.round(clamp((t - TYPE) / CHAR, 0, THOUGHT.length)),
    open: t >= ANSWER && !cleared,
    breath: t >= BREATH && t < ANSWER ? (t < EXHALE ? 'in' : 'out') : undefined,
    words: cleared ? WORDS.length : Math.round(clamp((t - STREAM) / WORD, 0, WORDS.length)),
    press,
  };
}

/** The iOS status bar: time, signal, Wi-Fi and battery either side of the Dynamic Island. */
function StatusBar() {
  return (
    <span className={r.status}>
      <b>9:41</b>
      <span className={r.island} />
      <span className={r.sys}>
        <svg viewBox="0 0 18 12" aria-hidden="true">
          <rect x="0" y="7.5" width="3" height="4.5" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" aria-hidden="true">
          <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0L8 11.5Zm-4.3-4.4a6.1 6.1 0 0 1 8.6 0l1.4-1.4a8.1 8.1 0 0 0-11.4 0l1.4 1.4ZM.8 4.2a10.2 10.2 0 0 1 14.4 0l1.4-1.4a12.2 12.2 0 0 0-17.2 0L.8 4.2Z" />
        </svg>
        <i className={r.battery}>
          <i />
        </i>
      </span>
    </span>
  );
}

/**
 * Reframe, a calm iOS app for catching a spiralling thought, as one iPhone pinned from the top of the card and
 * running off its foot, in the manner of benji.org/stageshow's phone demos. Everything inside the screen is laid
 * out in true iOS points and the phone is scaled as a whole, so type keeps its real sizes and shapes. A finger
 * drives the loop: the thought is typed, Reframe is tapped, a gentler perspective writes itself in and carries
 * the earlier entries down, then Done clears it, which is where it began. Placeholder rows are filler.
 */
export function ReframeCover() {
  const field = useRef<HTMLSpanElement>(null);
  const screen = useRef<HTMLSpanElement>(null);
  const finger = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(0);
  const [state, setState] = useState<State>(() => stateAt(0));

  useEffect(() => {
    const el = field.current;
    if (!el) return;
    const fit = (w: number, h: number) => setScale(Math.min((w * SHARE) / FRAME, (h * 0.93) / VIEW));
    if (el.clientWidth) fit(el.clientWidth, el.clientHeight);
    const sized = new ResizeObserver(([entry]) => fit(entry.contentRect.width, entry.contentRect.height));
    sized.observe(el);
    return () => sized.disconnect();
  }, []);

  useEffect(() => {
    const host = screen.current;
    if (!host || !scale) return;
    // the finished frame stands in for the film when motion is reduced
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState(stateAt(5.5));
      return;
    }
    const seen = new Map<string, { x: number; y: number }>([['rest', REST]]);
    const find = (name: string) => {
      const el = host.querySelector(`[data-target="${name}"]`);
      if (el) {
        const h = host.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        if (b.height) seen.set(name, { x: (b.left - h.left + b.width / 2) / scale, y: (b.top - h.top + b.height / 2) / scale });
      }
      return seen.get(name) ?? REST;
    };
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ((now - start) / 1000) % LOOP;
      const next = stateAt(t);
      setState((was) => (JSON.stringify(was) === JSON.stringify(next) ? was : next));

      let from = REST;
      let pos = from;
      for (const [leave, arrive, name] of MOVES) {
        const to = find(name);
        if (t < leave) {
          pos = from;
          break;
        }
        if (t < arrive) {
          const k = ease((t - leave) / (arrive - leave));
          pos = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
          break;
        }
        pos = to;
        from = to;
      }
      const f = finger.current;
      if (f) {
        f.style.translate = `${pos.x}px ${pos.y}px`;
        if (next.press) f.dataset.down = '';
        else delete f.dataset.down;
        // a touch shows only while it reaches for something and taps it
        f.style.opacity = MOVES.slice(0, 2).some(([leave, arrive]) => t >= leave - 0.1 && t < arrive + 0.5) ? '1' : '0';
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scale]);

  const { typed, open, breath, words, press } = state;

  return (
    <span ref={field} className={r.field}>
      <span className={r.phone} style={{ scale: String(scale || 0.001) }}>
        <span ref={screen} className={r.screen} inert>
          <StatusBar />
          {/* the warm band: layered hills and Reframe's own character, who breathes during the pause */}
          <span className={r.band} aria-hidden="true">
            <svg className={r.hills} viewBox="0 0 402 170" preserveAspectRatio="none">
              <path d="M0 0h402v118c-60 28-120 30-201 6S50 96 0 120Z" fill="#FFB547" />
              <path d="M0 0h402v92c-70 30-140 24-210 4S60 70 0 96Z" fill="#FF8A3D" />
            </svg>
            <span className={r.pal} data-phase={breath}>
              {/* Reframe's companion: a little cloud, eyes closed, at ease */}
              <svg viewBox="0 0 120 80">
                <path d="M30 70h62a20 20 0 0 0 3-39.8A28 28 0 0 0 42 22a22 22 0 0 0-12 48Z" fill="#FFFFFF" />
                <path d="M30 70h62a20 20 0 0 0 9-1.6c-6 1-14-1-20-1H30a22 22 0 0 1-15-6A22 22 0 0 0 30 70Z" fill="#FFE6D3" />
                <path d="M47 47q5 5 10 0M67 47q5 5 10 0" stroke="#4A3428" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M56 56q6 4 12 0" stroke="#4A3428" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                <ellipse cx="42" cy="55" rx="5" ry="3.2" fill="#FF9F7A" opacity=".55" />
                <ellipse cx="82" cy="55" rx="5" ry="3.2" fill="#FF9F7A" opacity=".55" />
              </svg>
            </span>
            <span className={cx(r.close, press === 'done' && r.pressed)} data-target="done">
              <svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17" /></svg>
            </span>
          </span>
          <span className={r.app}>
            <span className={r.heading}>{breath === 'in' ? 'Breathe in…' : breath === 'out' ? 'And breathe out…' : open ? 'Here’s a gentler view' : 'What’s on your mind?'}</span>
            <span className={r.row}>
              <span className={cx(r.thought, !typed && r.placeholder, open && r.struck)}>
                {typed ? THOUGHT.slice(0, typed) : 'Type a thought'}
                {!open && typed < THOUGHT.length && <i className={r.caret} />}
              </span>
              <span className={cx(r.button, typed < THOUGHT.length && r.idle, (breath || open) && r.gone, press === 'reframe' && r.pressed)} data-target="reframe">
                Reframe
              </span>
              <span className={cx(r.trap, open && r.trapOn)}>Overgeneralizing</span>
            </span>
            <span className={cx(r.answer, open && r.answerOn)}>
              <span className={r.answerText}>
                {WORDS.map((w, i) => (
                  <span key={i} className={cx(r.word, i >= words && r.later)}>
                    {w}{' '}
                  </span>
                ))}
              </span>
            </span>
          </span>
          <i ref={finger} className={r.finger} />
        </span>
      </span>
    </span>
  );
}
