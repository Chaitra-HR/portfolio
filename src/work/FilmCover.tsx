import { useEffect, useRef } from 'react';
import { cx } from '../lib/cx';
import c from './covers.module.css';

/** A product film for a work tile. It plays from the start and keeps looping, whatever the motion setting. */
export function FilmCover({ film, poster, className }: { film: string; poster: string; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    // React doesn't always carry `muted` onto the element, and browsers only autoplay muted video.
    el.muted = true;
    // A browser that blocks autoplay outright still lets the film start on the visitor's first click or key.
    const retry = () => void el.play().catch(() => {});
    el.play().catch(() => {
      document.addEventListener('pointerdown', retry, { once: true });
      document.addEventListener('keydown', retry, { once: true });
    });
    return () => {
      document.removeEventListener('pointerdown', retry);
      document.removeEventListener('keydown', retry);
    };
  }, []);

  return (
    <span className={cx(c.cover, className)}>
      <video ref={video} className={c.film} src={film} poster={poster} autoPlay muted loop playsInline />
    </span>
  );
}
