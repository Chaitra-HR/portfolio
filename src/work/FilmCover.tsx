import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { cx } from '../lib/cx';
import c from './covers.module.css';

/** A product film for a work tile. It plays while it's on screen; reduced motion gets its poster. */
export function FilmCover({ film, poster, className }: { film: string; poster: string; className?: string }) {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (still || !el) return;
    const seen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void el.play().catch(() => {});
      else el.pause();
    });
    seen.observe(el);
    return () => seen.disconnect();
  }, [still]);

  return (
    <span className={cx(c.cover, className)}>
      {still ? <img className={c.film} src={poster} alt="" /> : <video ref={video} className={c.film} src={film} poster={poster} muted loop playsInline preload="metadata" />}
    </span>
  );
}
