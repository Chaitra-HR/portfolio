import { useEffect, useRef } from 'react';
import { GradientBuddy } from './GradientBuddy';
import { prefersReducedMotion } from '../../lib/scroll';
import s from './TravelGuide.module.css';

/*
 * There is one mascot on screen at a time: it lives at its spot on the page
 * (`[data-buddy="<from>"]`, Home's gist panel) until the
 * footer comes into view, then jumps down into the footer, growing to full
 * size, and hands over to the footer's pokeable mascot (`[data-buddy="footer"]`).
 * Scrolling back up sends it home. Whichever copy isn't showing stops rendering.
 */

/** Rendered at the footer's size and scaled down for the sidebar, so the 3D never re-sizes mid-flight. */
const SIZE = 200;
/** The footer takes over once its mascot's top is this far up the viewport. */
const FOOTER_AT = 0.8;
/** Flight spring: natural frequency (rad/s), critically damped — quick, no overshoot. */
const OMEGA = 14;
/** The jump: an arc on top of the flight. */
const HOP_MS = 620;
const HOP_HEIGHT = 120;
/** Landed once within this many px (and the arc is done). */
const LANDED_PX = 2;

interface Axis {
  x: number;
  v: number;
}

function follow(a: Axis, goal: number, dt: number) {
  const steps = Math.ceil(dt / (1 / 120));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    a.v += (OMEGA * OMEGA * (goal - a.x) - 2 * OMEGA * a.v) * h;
    a.x += a.v * h;
  }
}

export function TravelGuide({ from }: { from: string }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const body = el?.firstElementChild as HTMLElement | null;
    const gist = document.querySelector<HTMLElement>(`[data-buddy="${from}"]`);
    const footer = document.querySelector<HTMLElement>('[data-buddy="footer"]');
    if (!el || !body || !gist || !footer) return;
    const still = prefersReducedMotion();

    const show = (who: HTMLElement | null) => {
      gist.style.visibility = who === gist ? '' : 'hidden';
      footer.style.visibility = who === footer ? '' : 'hidden';
      // the travelling copy renders (and shows) only in flight
      body.style.visibility = who ? 'hidden' : '';
      el.style.opacity = who ? '0' : '1';
    };
    show(gist);

    let home: HTMLElement = gist;
    let flying = false;
    let hopStart = 0;
    const X: Axis = { x: 0, v: 0 };
    const Y: Axis = { x: 0, v: 0 };
    const S: Axis = { x: 0, v: 0 };
    let last = 0;
    let frame = 0;

    // Runs only while it flies, or for a frame after a scroll or resize (to check whether
    // the footer has arrived); otherwise it sleeps, so a still page costs nothing.
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;

      const want = footer.getBoundingClientRect().top < window.innerHeight * FOOTER_AT ? footer : gist;
      if (want !== home) {
        // take off from wherever it is now (its home, or mid-flight)
        if (!flying) {
          const r = home.getBoundingClientRect();
          X.x = r.left;
          Y.x = r.top;
          S.x = r.width;
          X.v = Y.v = S.v = 0;
        }
        home = want;
        flying = true;
        hopStart = now;
        show(null);
      }
      if (!flying) {
        last = 0;
        return;
      }
      frame = requestAnimationFrame(tick);

      const to = home.getBoundingClientRect();
      let lift = 0;
      if (still) {
        X.x = to.left;
        Y.x = to.top;
        S.x = to.width;
      } else {
        follow(X, to.left, dt);
        follow(Y, to.top, dt);
        follow(S, to.width, dt);
        const p = (now - hopStart) / HOP_MS;
        if (p < 1) lift = Math.sin(Math.PI * p) * HOP_HEIGHT;
      }

      const k = S.x / SIZE;
      el.style.transform = `translate3d(${X.x.toFixed(2)}px, ${(Y.x - lift).toFixed(2)}px, 0) scale(${k.toFixed(4)})`;

      const landed = still || (lift === 0 && Math.hypot(to.left - X.x, to.top - Y.x) < LANDED_PX && Math.abs(to.width - S.x) < 1);
      if (landed) {
        flying = false;
        show(home);
      }
    };
    wake();
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
      gist.style.visibility = '';
      footer.style.visibility = '';
    };
  }, [from]);

  return (
    <div ref={wrap} className={s.guide} style={{ width: SIZE, height: SIZE }} aria-hidden="true">
      <GradientBuddy className={s.guideBody} />
    </div>
  );
}
