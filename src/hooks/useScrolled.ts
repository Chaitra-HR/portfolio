import { useSyncExternalStore } from 'react';

/** Whether the page has scrolled past `offset` pixels, kept in sync as it scrolls. */
export function useScrolled(offset = 8): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('scroll', onChange, { passive: true });
      return () => window.removeEventListener('scroll', onChange);
    },
    () => window.scrollY > offset,
    () => false,
  );
}
