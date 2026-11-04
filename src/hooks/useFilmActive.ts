import { useEffect, useState, type RefObject } from 'react';
import { introDone } from '../lib/intro';

/**
 * Whether a looping cover film should be running: once the loading intro has revealed the page, and only while the
 * film is on (or just about on) screen. Off screen or under the intro it would spend the phone's main thread on
 * frames nobody sees.
 */
export function useFilmActive(ref: RefObject<Element | null>): boolean {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    let live = true;
    void introDone.then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting), { rootMargin: '10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return ready && seen;
}
