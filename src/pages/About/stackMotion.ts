import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '../../lib/scroll';

/*
 * Scroll motion for the "How I work" card stack, modelled on the cards on
 * together.agency/about (values sampled from the live page). Each card
 * wrapper is sticky; this drives the inner card:
 *   - entering, it rises from 100px below its slot;
 *   - its slot sits (100 / n)px lower than the card before, so the stack cascades;
 *   - when the next card lands on it, it steps back most of the way
 *     (3.25% smaller and 1.3% dimmer per card still to come);
 *   - as the whole stack scrolls away it settles at 5% / 3% per step.
 * Values are smoothed each frame, so the motion trails the scroll like a spring.
 */

const ENTER_OFFSET = 100;
/** Per card behind the top one: [when the next card lands, extra as the stack leaves]. */
const SCALE_STEP: [number, number] = [0.0325, 0.0175];
const DIM_STEP: [number, number] = [0.013, 0.017];
/** The stack's exit is measured over this share of the viewport (dimming finishes much sooner). */
const EXIT_SPAN = 0.5;
const DIM_EXIT_SPAN = 0.05;
/** Smoothing time constant (s); lower is snappier. */
const SMOOTHING = 0.09;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface StackGeometry {
  /** viewport height */
  vh: number;
  /** the wrappers' sticky `top`, px */
  stickyTop: number;
  /** list top relative to the viewport */
  listTop: number;
  heights: number[];
  gap: number;
}

/** Resting [translateY px, scale, brightness] for each card at this scroll position. */
export function stackTargets({ vh, stickyTop, listTop, heights, gap }: StackGeometry): number[][] {
  const n = heights.length;
  // where each wrapper would be if it weren't sticky → 0 below the viewport, 1 at its slot
  let natural = listTop;
  const enter = heights.map((h) => {
    const top = natural;
    natural += h + gap;
    return clamp01((vh - top) / Math.max(1, vh - stickyTop));
  });
  const listBottom = natural - gap;
  // 0 until the list's end reaches the sticky line, 1 once it is half a viewport past it
  const exit = clamp01((stickyTop - listBottom) / (vh * EXIT_SPAN));
  const dimExit = clamp01((stickyTop - listBottom) / (vh * DIM_EXIT_SPAN));
  return heights.map((_, i) => {
    const behind = n - 1 - i;
    const landed = i < n - 1 ? enter[i + 1] : 0;
    const y = ENTER_OFFSET + ((i * ENTER_OFFSET) / n - ENTER_OFFSET) * enter[i];
    const scale = 1 - behind * (SCALE_STEP[0] * landed + SCALE_STEP[1] * exit);
    const bright = 1 - behind * (DIM_STEP[0] * landed + DIM_STEP[1] * dimExit);
    return [y, scale, bright];
  });
}

export function useStackMotion(list: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const wrappers = [...root.children] as HTMLElement[];
    const cards = wrappers.map((w) => w.firstElementChild as HTMLElement);
    const n = cards.length;
    if (!n) return;

    if (prefersReducedMotion()) {
      cards.forEach((c) => (c.style.transform = 'none'));
      return;
    }

    // current [translateY, scale, brightness] per card
    const cur = cards.map(() => [ENTER_OFFSET, 1, 1]);
    let heights: number[] = [];
    let gap = 0;
    let frame = 0;
    let last = 0;

    const measure = () => {
      heights = cards.map((c) => c.offsetHeight);
      gap = parseFloat(getComputedStyle(root).rowGap) || 0;
    };

    const targets = () =>
      stackTargets({
        vh: window.innerHeight,
        stickyTop: parseFloat(getComputedStyle(wrappers[0]).top) || 0,
        listTop: root.getBoundingClientRect().top,
        heights,
        gap,
      });

    const paint = (i: number) => {
      const [y, s, b] = cur[i];
      cards[i].style.transform = `translateY(${y.toFixed(2)}px) scale(${s.toFixed(4)}) translateZ(0)`;
      cards[i].style.filter = b < 0.999 ? `brightness(${b.toFixed(3)})` : '';
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const k = 1 - Math.exp(-dt / SMOOTHING);
      const tgt = targets();
      let moving = false;
      cards.forEach((_, i) => {
        for (let p = 0; p < 3; p++) {
          const delta = tgt[i][p] - cur[i][p];
          if (Math.abs(delta) > (p === 0 ? 0.05 : 0.0002)) moving = true;
          cur[i][p] += delta * k;
        }
        paint(i);
      });
      frame = moving ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      wake();
    };

    measure();
    // start from the resting state for wherever the page opened
    targets().forEach((t, i) => {
      cur[i] = [...t];
      paint(i);
    });

    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    };
  }, [list]);
}
