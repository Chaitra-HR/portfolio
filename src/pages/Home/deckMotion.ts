/**
 * Spring physics for the testimonial deck. Runs on requestAnimationFrame and
 * writes transforms straight to the cards, so dragging and throwing never
 * re-render React. Velocity carries between phases — a flick keeps its
 * momentum into the throw, and the throw curves into the tuck without stopping.
 */

/** x px, y px, rotation deg, scale */
type Pose = [number, number, number, number];
export type Step = 1 | -1;

/** Resting poses by depth: the top card, then the two fanned behind it. */
const SLOTS: Pose[] = [
  [0, 0, 0, 1],
  [26, 10, 4.5, 0.95],
  [-24, 18, -5, 0.91],
];
/** Spring stiffness and damping (mass 1). Slightly under-damped: settles with a soft, lively landing. */
const STIFFNESS = 260;
const DAMPING = 27;
/** The throw ends (and the card tucks in behind) after this long, or once it is fully clear of the deck. */
const THROW_MAX_MS = 360;
const THROW_OUT = 1;
/** Rotation that follows horizontal travel while dragging or flying. */
const TILT_PER_PX = 0.03;
/** How far the next card rises toward the top while you drag (0–1 of the way). */
const RISE = 0.45;

const slot = (depth: number): Pose => [...SLOTS[Math.min(depth, SLOTS.length - 1)]] as Pose;
const lerp = (a: Pose, b: Pose, t: number): Pose => a.map((v, k) => v + (b[k] - v) * t) as Pose;

interface Thrown {
  card: number;
  step: Step;
  start: number;
  tucked: boolean;
}

export interface DeckMotion {
  /** Advance the deck by a button, key or trackpad swipe. */
  go(step: Step): void;
  /** While dragging: the top card follows the pointer 1:1 (px from rest). */
  drag(dx: number): void;
  /** Let go. With a `step` the card is thrown that way; without, it springs home. Velocity in px/s. */
  release(velocity: number, step?: Step): void;
  destroy(): void;
}

export function createDeckMotion(opts: {
  cards: (HTMLElement | null)[];
  deck: HTMLElement;
  index: number;
  reducedMotion: () => boolean;
}): DeckMotion {
  const { cards, deck } = opts;
  const n = cards.length;
  let index = opts.index;
  let dragX: number | null = null;
  let thrown: Thrown | null = null;
  let frame = 0;
  let last = 0;
  const pose: Pose[] = cards.map((_, i) => slot((i - index + n) % n));
  const vel: Pose[] = cards.map(() => [0, 0, 0, 0]);

  const depth = (i: number) => (i - index + n) % n;

  const target = (i: number): Pose => {
    const d = depth(i);
    if (thrown && thrown.card === i && !thrown.tucked) {
      const out = deck.offsetWidth * 1.15 * (thrown.step === 1 ? -1 : 1);
      return [out, 0, out * 0.012, 1];
    }
    if (dragX !== null && dragX !== 0) {
      // The card that would come forward rises a little as you pull.
      const coming = dragX < 0 ? 1 : n - 1;
      if (d === coming) return lerp(slot(d), SLOTS[0], RISE * Math.min(1, Math.abs(dragX) / (deck.offsetWidth * 0.8)));
    }
    return slot(d);
  };

  const paint = (i: number) => {
    const el = cards[i];
    if (!el) return;
    const [x, y, r, s] = pose[i];
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(4)})`;
    el.style.zIndex = String(thrown && thrown.card === i && !thrown.tucked ? n + 1 : n - depth(i));
  };

  const snap = () => {
    thrown = null;
    cards.forEach((_, i) => {
      pose[i] = target(i);
      vel[i] = [0, 0, 0, 0];
      paint(i);
    });
  };

  const tick = (now: number) => {
    const dt = Math.min(0.032, last ? (now - last) / 1000 : 1 / 60);
    last = now;

    if (thrown && !thrown.tucked) {
      const x = Math.abs(pose[thrown.card][0]);
      if (now - thrown.start > THROW_MAX_MS || x > deck.offsetWidth * THROW_OUT) thrown.tucked = true;
    }

    let busy = dragX !== null || (thrown !== null && !thrown.tucked);
    cards.forEach((_, i) => {
      if (dragX !== null && depth(i) === 0) {
        pose[i] = [dragX, 0, dragX * TILT_PER_PX, 1];
      } else {
        const t = target(i);
        // two half-steps of semi-implicit Euler keep the spring stable at low frame rates
        for (let step = 0; step < 2; step++) {
          const h = dt / 2;
          for (let k = 0; k < 4; k++) {
            const a = -STIFFNESS * (pose[i][k] - t[k]) - DAMPING * vel[i][k];
            vel[i][k] += a * h;
            pose[i][k] += vel[i][k] * h;
          }
        }
        // the flying card tilts with its travel
        if (thrown?.card === i && !thrown.tucked) pose[i][2] = pose[i][0] * TILT_PER_PX;
        const resting = pose[i].every((v, k) => Math.abs(v - t[k]) < (k === 3 ? 0.0005 : 0.05)) && vel[i].every((v, k) => Math.abs(v) < (k === 3 ? 0.005 : 0.5));
        if (resting) {
          pose[i] = t;
          vel[i] = [0, 0, 0, 0];
        } else busy = true;
      }
      paint(i);
    });

    if (thrown?.tucked && !busy) thrown = null;
    frame = busy ? requestAnimationFrame(tick) : 0;
    if (!frame) last = 0;
  };

  const wake = () => {
    if (opts.reducedMotion()) return snap();
    if (!frame) frame = requestAnimationFrame(tick);
  };

  cards.forEach((_, i) => paint(i));

  const throwCard = (step: Step, velocity: number) => {
    const card = index;
    index = (index + step + n) % n;
    if (opts.reducedMotion()) return snap();
    if (thrown && !thrown.tucked) thrown.tucked = true;
    thrown = { card, step, start: performance.now(), tucked: false };
    vel[card][0] = velocity;
    wake();
  };

  return {
    go: (step) => throwCard(step, 0),
    drag(dx) {
      dragX = dx;
      wake();
    },
    release(velocity, step) {
      const top = cards.findIndex((_, i) => depth(i) === 0);
      dragX = null;
      if (step) return throwCard(step, velocity);
      // no swipe: spring home, keeping the hand's speed
      if (top >= 0) vel[top] = [velocity, 0, velocity * TILT_PER_PX, 0];
      wake();
    },
    destroy() {
      cancelAnimationFrame(frame);
    },
  };
}
