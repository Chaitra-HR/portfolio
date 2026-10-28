import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/scroll';

/*
 * Read-along, in the style of adamperlis.com: while `active`, the words in
 * `root` (spans marked data-ra, from <ReadWords>) light up one at a time, in
 * reading order, and a small ball hops from word to word as each one lands.
 * Words not yet read are faint (data-ra="f"), the current one is "n", read
 * ones are "r". After the last word the ball hops off and fades away.
 * Deactivating resets, so the next hover reads from the start.
 */

/** Hold before the first word: just enough for the text to start fading in (ms). */
const START = 120;
/** Time on each word: a base plus a little per letter, longer after punctuation (ms). */
const PER_WORD = 70;
const PER_CHAR = 11;
const PAUSE_COMMA = 110;
const PAUSE_STOP = 220;
/** A hop never takes longer than this, so long pauses rest on the word (ms). */
const HOP_MAX = 240;
/** Arc height: a base plus a share of the distance travelled, capped (px). */
const ARC_MIN = 7;
const ARC_PER_PX = 0.12;
const ARC_MAX = 26;
/** After the last word: a beat on it, then a hop off (up, over and down) as it fades. */
const EXIT_HOLD = 260;
const EXIT_MS = 520;
const EXIT_X = 22;
const EXIT_UP = 18;
const EXIT_DOWN = 26;

interface Spot {
  x: number;
  y: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function useReadAlong(root: RefObject<HTMLElement | null>, ball: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = root.current;
    const b = ball.current;
    if (!el || !b) return;
    const words = [...el.querySelectorAll<HTMLElement>('[data-ra]')];
    const mark = (state: string) => words.forEach((w) => (w.dataset.ra = state));

    if (!active) {
      mark('f');
      b.classList.remove('show');
      b.style.opacity = '';
      return;
    }
    if (prefersReducedMotion() || !words.length) {
      mark('r');
      return;
    }
    mark('f');

    // when each word lights, and where the ball lands on it (centred, resting on its top)
    const at: number[] = [];
    let clock = START;
    for (const w of words) {
      at.push(clock);
      const text = w.textContent ?? '';
      clock += PER_WORD + PER_CHAR * text.length;
      if (/[.!?]$/.test(text)) clock += PAUSE_STOP;
      else if (/[,;:—–]$/.test(text)) clock += PAUSE_COMMA;
    }
    // Where the ball lands on a word: centred, resting on top of its letters. Measured as
    // the ball sets off for it, since the rows are still settling in when reading starts.
    const spots: Spot[] = [];
    const spot = (i: number): Spot => {
      if (!spots[i]) {
        const box = el.getBoundingClientRect();
        const r = words[i].getBoundingClientRect();
        const size = b.offsetWidth;
        spots[i] = { x: r.left - box.left + r.width / 2 - size / 2, y: r.top - box.top + el.scrollTop - size + 2 };
      }
      return spots[i];
    };
    const measure = () => (spots.length = 0);

    const place = (x: number, y: number, sx = 1, sy = 1) => {
      b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    };

    const t0 = performance.now();
    let current = -1;
    let frame = 0;
    let ticked = false;
    const tick = (now: number) => {
      ticked = true;
      const t = now - t0;
      let i = current;
      while (i + 1 < words.length && t >= at[i + 1]) i++;
      if (i !== current) {
        for (let k = Math.max(current, 0); k <= i; k++) words[k].dataset.ra = 'r';
        if (i >= 0) words[i].dataset.ra = 'n';
        if (current === -1 && i >= 0) b.classList.add('show');
        current = i;
      }

      if (current >= 0) {
        const to = spot(current);
        const from = current > 0 ? spot(current - 1) : { x: to.x, y: to.y - ARC_MIN * 2 };
        const dur = Math.min(HOP_MAX, (at[current + 1] ?? at[current] + HOP_MAX) - at[current]);
        const p = Math.min((t - at[current]) / dur, 1);
        const e = easeInOut(p);
        const dist = Math.hypot(to.x - from.x, to.y - from.y);
        const arc = Math.min(ARC_MAX, ARC_MIN + dist * ARC_PER_PX);
        const x = from.x + (to.x - from.x) * e;
        const y = from.y + (to.y - from.y) * e - Math.sin(Math.PI * p) * arc;
        // stretch in flight, a little squash as it lands
        const land = p > 0.85 ? Math.sin(((p - 0.85) / 0.15) * Math.PI) : 0;
        const fly = Math.sin(Math.PI * p);
        place(x, y + land * 1.5, 1 - fly * 0.12 + land * 0.22, 1 + fly * 0.16 - land * 0.22);
      } else {
        b.classList.remove('show');
      }

      // read to the end: rest a beat on the last word, then hop off and fade out
      const last = words.length - 1;
      const landed = at[last] + HOP_MAX;
      if (current === last && t > landed) {
        words[last].dataset.ra = 'r';
        const q = (t - landed - EXIT_HOLD) / EXIT_MS;
        if (q > 0) {
          const from = spot(last);
          const e = Math.min(q, 1);
          // a little parabola: up, then down past where it started
          const y = from.y - 4 * e * (1 - e) * EXIT_UP + e * e * EXIT_DOWN;
          const k = 1 - e * 0.55;
          b.style.opacity = (1 - e * e).toFixed(3);
          place(from.x + EXIT_X * e, y, k, k);
          if (q >= 1) {
            b.classList.remove('show');
            b.style.opacity = '';
            return;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Failsafe: if frames never run (background tab), show the words read.
    const failsafe = window.setTimeout(() => {
      if (!ticked) mark('r');
    }, 1500);

    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(failsafe);
      b.style.opacity = '';
      window.removeEventListener('resize', measure);
    };
  }, [root, ball, active]);
}
