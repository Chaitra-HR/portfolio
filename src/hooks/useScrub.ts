import { useLayoutEffect, type RefObject } from 'react';
import { introDone } from '../lib/intro';
import { prefersReducedMotion } from '../lib/scroll';

/*
 * Entrances in the style of together.agency/about.
 *
 * Scroll-linked (tied to the scroll, so they rewind when you scroll back, and
 * smoothed so they trail it softly):
 *   data-scrub="rise"   the element rises DIST px and fades in
 *   data-scrub="fade"   fades only (for inline text, which can't be moved)
 *   data-scrub="lines"  each line of its <ScrubText> words rises in turn
 *   data-scrub="grow"   a photo opens from an inset, rounded window while the
 *                       image inside settles from a slight zoom
 *
 * Time-based, for the opening screen:
 *   data-scrub="intro"  each line (of <ScrubText>, or the element itself)
 *                       rises INTRO_DIST px and fades in, one after another
 *                       across every intro element in page order
 *
 *   data-delay="ms"     hold before entering on page load
 *   data-stagger="n"    enter a little later than its neighbours (n steps)
 *   data-dist="px"      rise distance
 */

const DIST = 50;
/** Scroll progress runs from the element's top at the viewport bottom (0) to the viewport top (1). */
const RANGE = 1;
/** Opacity is full by this much progress; the rise continues after. */
const FADE = 0.3;
const LINE_STAGGER = 0.04;
const STEP_STAGGER = 0.05;
/** Smoothing time constant (s). */
const SMOOTHING = 0.14;

const INTRO_DIST = 20;
const INTRO_START = 120;
const INTRO_STEP = 90;
const INTRO_DURATION = 900;

/** grow: fully open once the photo's top is this share of the viewport above the bottom. */
const GROW_RANGE = 0.35;
const GROW_INSET = 17; // %
const GROW_RADIUS: [number, number] = [40, 6]; // px, from → to
const GROW_ZOOM = 0.12;
const GROW_DRIFT = 24; // px

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;

interface Unit {
  els: HTMLElement[];
  kind: string;
  dist: number;
  delay: number;
  offset: number;
  /** untransformed top in the viewport */
  top: () => number;
  cur: number;
  /** intro: start time (ms after mount) */
  at?: number;
}

/** Group a node's <ScrubText> words into lines by layout position (transforms don't affect offsetTop). */
function linesOf(node: HTMLElement): HTMLElement[][] {
  const byLine = new Map<number, HTMLElement[]>();
  node.querySelectorAll<HTMLElement>('[data-w]').forEach((w) => {
    const key = Math.round(w.offsetTop / 4);
    byLine.set(key, [...(byLine.get(key) ?? []), w]);
  });
  return [...byLine.entries()].sort((a, b) => a[0] - b[0]).map(([, words]) => words);
}

export function useScrub(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const nodes = [...el.querySelectorAll<HTMLElement>('[data-scrub]')];
    if (prefersReducedMotion()) return;

    // time-based entrances count from when the loading intro reveals the page
    let start = performance.now();
    let waiting = true;
    let units: Unit[] = [];
    let introEnd = 0;

    const build = (keep: Map<HTMLElement, number>) => {
      units = [];
      let introLine = 0;
      for (const node of nodes) {
        const kind = node.dataset.scrub ?? 'rise';
        const delay = Number(node.dataset.delay ?? 0);
        const offset = Number(node.dataset.stagger ?? 0) * STEP_STAGGER;
        const dist = Number(node.dataset.dist ?? (kind === 'grow' ? GROW_DRIFT : DIST));

        if (kind === 'intro') {
          const lines = node.querySelector('[data-w]') ? linesOf(node) : [[node]];
          for (const els of lines) {
            const at = INTRO_START + introLine++ * INTRO_STEP;
            units.push({ els, kind, dist: INTRO_DIST, delay: 0, offset: 0, top: () => 0, cur: keep.get(els[0]) ?? 0, at });
            introEnd = at + INTRO_DURATION;
          }
        } else if (kind === 'lines') {
          const lines = linesOf(node);
          const first = lines[0]?.[0]?.offsetTop ?? 0;
          lines.forEach((words, i) => {
            const dy = words[0].offsetTop - first;
            units.push({ els: words, kind, dist, delay, offset: offset + i * LINE_STAGGER, top: () => node.getBoundingClientRect().top + dy, cur: keep.get(words[0]) ?? 0 });
          });
        } else {
          const unit: Unit = { els: [node], kind, dist, delay, offset, top: () => 0, cur: keep.get(node) ?? 0 };
          unit.top = () => node.getBoundingClientRect().top - (kind === 'fade' ? 0 : unit.dist * (1 - unit.cur));
          units.push(unit);
        }
      }
    };

    const paint = (u: Unit) => {
      if (u.kind === 'grow') {
        const node = u.els[0];
        const c = u.cur;
        const open = c > 0.999;
        node.style.opacity = clamp01(c / 0.15).toFixed(3);
        node.style.transform = `translate3d(0, ${(u.dist * (1 - c)).toFixed(2)}px, 0)`;
        // fully open: drop the clip so the photo keeps its own corner shapes
        node.style.clipPath = open
          ? ''
          : `inset(${(GROW_INSET * (1 - c)).toFixed(2)}% round ${(GROW_RADIUS[0] + (GROW_RADIUS[1] - GROW_RADIUS[0]) * c).toFixed(1)}px)`;
        const img = node.querySelector('img');
        if (img) img.style.transform = open ? '' : `scale(${(1 + GROW_ZOOM * (1 - c)).toFixed(4)})`;
        return;
      }
      const fade = u.kind === 'intro' ? 0.6 : FADE;
      const opacity = clamp01(u.cur / fade).toFixed(3);
      const transform = u.kind === 'fade' ? '' : `translate3d(0, ${(u.dist * (1 - u.cur)).toFixed(2)}px, 0)`;
      for (const e of u.els) {
        e.style.opacity = opacity;
        if (transform) e.style.transform = transform;
      }
    };

    let frame = 0;
    let last = 0;
    let ticked = false;
    const tick = (now: number) => {
      ticked = true;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const k = 1 - Math.exp(-dt / SMOOTHING);
      const vh = window.innerHeight;
      const elapsed = waiting ? -1e9 : now - start;
      let moving = false;
      for (const u of units) {
        if (u.kind === 'intro') {
          u.cur = easeOutQuart(clamp01((elapsed - (u.at ?? 0)) / INTRO_DURATION));
        } else {
          const range = u.kind === 'grow' ? vh * GROW_RANGE : vh * RANGE;
          const p = clamp01((vh - u.top()) / range);
          const target = elapsed < u.delay ? 0 : clamp01((p - u.offset) / (1 - u.offset));
          const delta = target - u.cur;
          if (Math.abs(delta) > 0.0005) {
            u.cur += delta * k;
            moving = true;
          } else u.cur = target;
        }
        paint(u);
      }
      // keep running through the opening sequence and any load delays
      if (elapsed < Math.max(2500, introEnd + 50)) moving = true;
      frame = moving ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const keep = new Map<HTMLElement, number>();
      for (const u of units) keep.set(u.els[0], u.cur);
      build(keep);
      wake();
    };

    build(new Map());
    units.forEach(paint); // hidden before first paint
    wake();
    let live = true;
    void introDone.then(() => {
      if (!live) return;
      waiting = false;
      start = performance.now();
      wake();
    });
    // Failsafe: if frames never run (background tab, screenshot tools), show everything.
    const failsafe = window.setTimeout(() => {
      if (ticked) return;
      for (const u of units) {
        u.cur = 1;
        paint(u);
      }
    }, 2000);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      live = false;
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
      clearTimeout(failsafe);
      for (const node of el.querySelectorAll<HTMLElement>('[data-scrub], [data-w], [data-scrub] img')) {
        node.style.opacity = '';
        node.style.transform = '';
        node.style.clipPath = '';
      }
    };
  }, [root]);
}
