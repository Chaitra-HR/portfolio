import { useEffect, useRef } from 'react';
import { GradientBuddy } from '../../components/interactions/GradientBuddy';
import { prefersReducedMotion } from '../../lib/scroll';
import { setPerch } from './perch';
import s from './Home.module.css';

/*
 * Phones only (hover means nothing there). In the style of adamperlis.com on
 * mobile, the mascot is a companion that stays on screen: it moves quickly to
 * the case study in view and perches beside its gist bubble (`[data-seat]`),
 * which then reads itself out. Once perched it is locked to its card (it rides
 * in the page, so scrolling carries it natively, with no lag). When its card
 * scrolls away it waits at the edge it is leaving from, then makes one hop to
 * the next card once that is properly in view — leaning into the direction it
 * travels and squashing as it lands. Side projects get no visit: it floats off the side. When the footer
 * arrives it glides in, growing to full size, and hands over to the footer's
 * own pokeable mascot (`[data-buddy="footer"]`); scrolling back up takes it back.
 */

/** Rendered at this size and scaled to fit a seat (or the footer), so the 3D never re-sizes mid-flight. */
const SIZE = 120;
/** A seat is a candidate once its centre is properly in view: inside this band (shares of the viewport height). */
const BAND: [number, number] = [0.2, 0.72];
/** Of the candidates, the one nearest this line wins. */
const FOCUS = 0.55;
/** The guide stays put while its own seat's centre is still inside this band… */
const KEEP: [number, number] = [0.1, 0.9];
/** …and, with no other seat near, waits at the screen edge until its seat is this far off. */
const WAIT: [number, number] = [-0.3, 1.3];
/** Kept this far inside the screen edges while it follows a seat. */
const EDGE = 12;
/** The footer takes over once its mascot's top is this far up the viewport. */
const FOOTER_AT = 0.8;
/** Away (side projects): parked just off the right edge, small. */
const AWAY_SIZE = 44;
/** Move spring: natural frequency (rad/s), critically damped — quick, no overshoot. */
const OMEGA = 17;
const ZETA = 1;
/** A hop between seats: an arc on top of the move. */
const HOP_MS = 440;
const HOP_MIN = 26;
const HOP_PER_PX = 0.07;
const HOP_MAX = 80;
/** Locked to the seat once within this many px of it… */
const SETTLED_PX = 4;
/** …but the bubble starts reading as soon as the guide is landing (this close, hop done). */
const READ_PX = 28;

interface Box {
  x: number;
  y: number;
  size: number;
}

interface Axis {
  x: number;
  v: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function follow(a: Axis, goal: number, dt: number) {
  // critically-ish damped spring, sub-stepped so a slow frame stays stable
  const steps = Math.ceil(dt / (1 / 120));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    a.v += (OMEGA * OMEGA * (goal - a.x) - 2 * ZETA * OMEGA * a.v) * h;
    a.x += a.v * h;
  }
}

export function PhoneGuide() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const body = el?.firstElementChild as HTMLElement | null;
    if (!el || !body) return;
    const still = prefersReducedMotion();
    const footerBuddy = document.querySelector<HTMLElement>('[data-buddy="footer"]');
    // the footer's own mascot waits (and stops rendering) until the guide hands over
    if (footerBuddy) footerBuddy.style.visibility = 'hidden';

    const boxOf = (t: Element): Box => {
      const r = t.getBoundingClientRect();
      return { x: r.left, y: r.top, size: r.width };
    };

    const seatGoal = (t: HTMLElement): Box => {
      const b = boxOf(t);
      // the footer is exact; a seat is followed, but never off the screen
      return t === footerBuddy ? b : { ...b, y: clamp(b.y, EDGE, window.innerHeight - b.size - EDGE) };
    };

    let target: HTMLElement | null = null;
    const X: Axis = { x: 0, v: 0 };
    const Y: Axis = { x: 0, v: 0 };
    const S: Axis = { x: SIZE, v: 0 };
    /** squash (+) / stretch (−) */
    const D: Axis = { x: 0, v: 0 };
    let placed = false;
    /** locked to its card: drawn in page coordinates, so native scrolling carries it */
    let locked = false;
    let hop: { start: number; height: number } | null = null;
    let perched: string | null = null;
    let handed = false;
    let last = 0;
    let frame = 0;

    const pick = (): HTMLElement | null => {
      const vh = window.innerHeight;
      if (footerBuddy && footerBuddy.getBoundingClientRect().top < vh * FOOTER_AT) return footerBuddy;
      const seats = [...document.querySelectorAll<HTMLElement>('[data-seat]')];
      // no needless hops: stay while the current seat is comfortably on screen
      if (target && target !== footerBuddy) {
        const r = target.getBoundingClientRect();
        const c = (r.top + r.height / 2) / vh;
        if (c > KEEP[0] && c < KEEP[1]) return target;
      }
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      for (const seat of seats) {
        if (seat === target) continue;
        const r = seat.getBoundingClientRect();
        const c = (r.top + r.height / 2) / vh;
        if (c < BAND[0] || c > BAND[1]) continue;
        const d = Math.abs(c - FOCUS);
        if (d < bestD) {
          bestD = d;
          best = seat;
        }
      }
      if (best) return best;
      // nothing else near: wait at the edge with the current seat, unless it is long gone
      if (target && target !== footerBuddy) {
        const r = target.getBoundingClientRect();
        const c = (r.top + r.height / 2) / vh;
        if (c > WAIT[0] && c < WAIT[1]) return target;
      }
      return null; // away (side projects, or above the work)
    };

    const handOver = (on: boolean) => {
      if (!footerBuddy || on === handed) return;
      handed = on;
      footerBuddy.style.visibility = on ? '' : 'hidden';
      // the guide's copy stops rendering while the footer's is showing
      body.style.visibility = on ? 'hidden' : '';
    };

    const perch = (slug: string | null) => {
      if (slug === perched) return;
      perched = slug;
      setPerch(slug);
    };

    // Runs while it moves, and for frames after a scroll or resize; once it rests on its
    // card (which then scrolls with the page by itself) it sleeps, so a still page costs nothing.
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const vw = window.innerWidth;

      const next = pick();
      if (next !== target) {
        locked = false;
        const wasSeat = !!target && target !== footerBuddy;
        handOver(false);
        perch(null);
        // seat to seat is a hop; arriving from away (or into the footer) is a glide
        if (wasSeat && next && next !== footerBuddy && placed && !still) {
          const to = seatGoal(next);
          hop = { start: now, height: clamp(HOP_MIN + Math.abs(to.y - Y.x) * HOP_PER_PX, HOP_MIN, HOP_MAX) };
        }
        target = next;
      }

      // where it wants to be this frame
      const goal: Box = target
        ? seatGoal(target)
        : { x: vw + 24, y: placed ? clamp(Y.x, 24, window.innerHeight - 120) : window.innerHeight * 0.4, size: AWAY_SIZE };
      if (!placed) {
        // first appearance: from just off the right edge
        X.x = vw + 24;
        Y.x = goal.y;
        S.x = AWAY_SIZE;
        placed = true;
      }

      if (still || locked) {
        X.x = goal.x;
        Y.x = goal.y;
        S.x = goal.size;
        X.v = Y.v = S.v = 0;
      } else {
        follow(X, goal.x, dt);
        follow(Y, goal.y, dt);
        follow(S, goal.size, dt);
      }

      let lift = 0;
      if (hop) {
        const p = (now - hop.start) / HOP_MS;
        if (p >= 1) {
          hop = null;
          D.v += 2.2; // a soft squash as it comes down
        } else lift = Math.sin(Math.PI * p) * hop.height;
      }

      // stretch with speed, lean into the direction of travel
      const speed = Math.hypot(X.v, Y.v);
      if (!still) {
        D.v += (-(D.x + clamp(speed / 5200, 0, 0.12)) * 420 - D.v * 22) * dt;
        D.x += D.v * dt;
      }
      const lean = still ? 0 : clamp(X.v / 3200, -0.22, 0.22);

      const near = Math.hypot(goal.x - X.x, goal.y - Y.x) < SETTLED_PX && Math.abs(goal.size - S.x) < 1 && !hop;
      if (target && near) locked = true;
      if (target === footerBuddy) {
        if (near) handOver(true);
      } else if (target && !hop && Math.hypot(goal.x - X.x, goal.y - Y.x) < READ_PX) perch(target.dataset.seat ?? null);

      // Locked onto a card that is on screen: draw in page coordinates (absolute), so the
      // browser scrolls it with the card itself. Otherwise (moving, or pinned at an edge
      // waiting) draw in screen coordinates (fixed).
      const pinned = !!target && target !== footerBuddy && Math.abs(goal.y - boxOf(target).y) > 0.5;
      const inPage = locked && !pinned;
      const pos = inPage ? 'absolute' : 'fixed';
      if (el.style.position !== pos) el.style.position = pos;
      const page = inPage ? (el.offsetParent ?? document.body).getBoundingClientRect() : null;

      // draw: centred rotation and squash, bottom kept on the seat
      const size = S.x;
      const sy = 1 - D.x;
      const sx = 1 + D.x * 0.8;
      const k = size / SIZE;
      const cx = X.x + size / 2 - (page?.left ?? 0);
      const cy = Y.x - lift + size / 2 + (size * (1 - sy)) / 2 - (page?.top ?? 0);
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) rotate(${lean.toFixed(4)}rad) scale(${(k * sx).toFixed(4)}, ${(k * sy).toFixed(4)}) translate(${-SIZE / 2}px, ${-SIZE / 2}px)`;
      el.style.opacity = '1';

      // resting: snapped onto its card (or parked away), squash settled
      const resting = near && Math.abs(goal.x - X.x) < 0.05 && Math.abs(goal.y - Y.x) < 0.05 && Math.abs(D.x) < 0.001 && Math.abs(D.v) < 0.01;
      if (resting) last = 0;
      else frame = requestAnimationFrame(tick);
    };
    wake();
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
      if (footerBuddy) footerBuddy.style.visibility = '';
      setPerch(null);
    };
  }, []);

  return (
    <div ref={wrap} className={s.guide} style={{ width: SIZE, height: SIZE }} aria-hidden="true">
      <GradientBuddy className={s.guideBody} surface="#FFFFFF" />
    </div>
  );
}
