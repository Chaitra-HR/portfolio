import { useLayoutEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/scroll';

/*
 * The curved "band" entrance from together.agency: as the element rises into
 * view its top edge is an arch — edges lower than the centre — that flattens
 * out as you keep scrolling. Done with an elliptical clip-path; colours and
 * layout are untouched. Scroll-linked and smoothed; reduced motion skips it.
 */

/** Edge sag at the start, as a share of the element's width. */
const SAG = 0.06;
/** The arch's apex starts this far below the top edge, then rises to it. */
const LIFT = 70;
/**
 * Flat once the element's top has travelled this share of the viewport — or
 * once this share of the element is on screen, if that comes first. (A footer
 * shorter than the range would otherwise never open fully at the page bottom.)
 */
const RANGE = 0.6;
const VISIBLE = 0.75;
const SMOOTHING = 0.12;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function useBandReveal(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let cur = 0;
    let frame = 0;
    let last = 0;

    const paint = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const sag = Math.max(0.5, (1 - cur) * SAG * w);
      const lift = (1 - cur) * LIFT;
      if (cur > 0.999) {
        el.style.clipPath = '';
        return;
      }
      // a tall ellipse whose top passes through the apex and dips `sag` px at the edges
      const b = Math.max(h, w) * 4;
      const a = w / 2 / Math.sqrt(1 - (1 - sag / b) ** 2);
      el.style.clipPath = `ellipse(${a.toFixed(1)}px ${b.toFixed(1)}px at 50% ${(lift + b).toFixed(1)}px)`;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const vh = window.innerHeight;
      const range = Math.min(vh * RANGE, el.offsetHeight * VISIBLE);
      const target = clamp01((vh - el.getBoundingClientRect().top) / range);
      const delta = target - cur;
      cur = Math.abs(delta) < 0.0005 ? target : cur + delta * (1 - Math.exp(-dt / SMOOTHING));
      paint();
      frame = cur !== target ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    paint();
    wake();
    // never leave the footer clipped if frames don't run
    const failsafe = window.setTimeout(() => {
      if (last === 0 && frame) {
        cur = 1;
        paint();
      }
    }, 2500);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    return () => {
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
      cancelAnimationFrame(frame);
      clearTimeout(failsafe);
      el.style.clipPath = '';
    };
  }, [ref]);
}
