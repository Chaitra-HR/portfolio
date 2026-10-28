import { useEffect, useState, type RefObject } from 'react';

/**
 * Scroll-spy for the case-study table of contents: the active section is the
 * last `[data-sec]` whose top has passed `offset` px from the viewport top.
 */
export function useActiveSection(container: RefObject<HTMLElement | null>, fallback: string, offset = 220): string {
  const [active, setActive] = useState(fallback);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const root = container.current;
      if (!root) return;
      let current = fallback;
      root.querySelectorAll<HTMLElement>('[data-sec]').forEach((el) => {
        if (el.getBoundingClientRect().top < offset) current = el.dataset.sec ?? current;
      });
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [container, fallback, offset]);

  return active;
}
