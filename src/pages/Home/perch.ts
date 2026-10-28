import { useSyncExternalStore } from 'react';

/*
 * Which case study the phone guide is perched on. Kept outside React state so
 * a hop only re-renders the two cards involved, not the whole Home page (a
 * full re-render mid-hop is a visible stall on phones).
 */
let perched: string | null = null;
const listeners = new Set<() => void>();

export function setPerch(slug: string | null) {
  if (slug === perched) return;
  perched = slug;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Whether the guide is perched on this case study. */
export function usePerched(slug: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => perched === slug,
    () => false,
  );
}
