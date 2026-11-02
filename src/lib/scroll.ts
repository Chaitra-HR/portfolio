import type { MouseEvent } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A click the page should handle: the main button, no modifier keys, not already taken. */
const isPlainClick = (e: MouseEvent<HTMLAnchorElement>) =>
  !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/** Click handler for a link to the top of the current page: smooth-scrolls up instead of jumping. */
export function smoothScrollToTop(e: MouseEvent<HTMLAnchorElement>) {
  if (!isPlainClick(e)) return;
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
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
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
}
