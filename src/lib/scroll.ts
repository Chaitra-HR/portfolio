import Lenis from 'lenis';
import type { MouseEvent } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The page's smoothed wheel scrolling, when it's running. */
let lenis: Lenis | null = null;

/**
 * Eases wheel and trackpad scrolling the way fonts.ninja does (Lenis). Touch keeps the
 * phone's own scrolling, panels that scroll inside the page keep theirs, and nothing
 * runs for anyone who asks for reduced motion. While the intro holds the page still
 * (overflow hidden on <html>), the wheel is left alone so it can't move the page.
 * Returns the cleanup.
 */
export function startSmoothScroll() {
  if (prefersReducedMotion()) return () => {};
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
    prevent: () => document.documentElement.style.overflow === 'hidden',
  });
  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

/** A click the page should handle: the main button, no modifier keys, not already taken. */
const isPlainClick = (e: MouseEvent<HTMLAnchorElement>) =>
  !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/** Click handler for a link to the top of the current page: smooth-scrolls up instead of jumping. */
export function smoothScrollToTop(e: MouseEvent<HTMLAnchorElement>) {
  if (!isPlainClick(e)) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/**
 * Click handler for same-page anchors: smooth-scrolls to the target the way
 * the exports' `scroll-behavior: smooth` did, without making route changes
 * smooth-scroll too.
 */
export function smoothScrollTo(id: string) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el);
    else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
}
