import { useEffect, useRef, useState } from 'react';
import { cx } from '../lib/cx';
import c from './covers.module.css';

interface FilmCoverProps {
  film: string;
  /** The film's first frame, shown until the film is ready, so the swap is invisible. */
  poster: string;
  /** An HEVC copy of the film: sharper for its size where the browser can play it (Safari, most Chrome). */
  hevc?: string;
  /** Arrive like together.agency's work tiles: unclip from the edges and settle from a slight zoom once in view. */
  arrive?: boolean;
  className?: string;
}

/** A product film for a work tile. It plays from the start and keeps looping, whatever the motion setting. */
export function FilmCover({ film, poster, hevc, arrive, className }: FilmCoverProps) {
  const root = useRef<HTMLSpanElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(!arrive);
  // the film downloads only once its tile is within a screen of view; until then the poster stands in
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setNear(true);
      io.disconnect();
    }, { rootMargin: '100% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // an arriving film waits, buffered, and starts from its first frame (the poster) as it's revealed
  useEffect(() => {
    const el = video.current;
    if (!el || !shown || !near) return;
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
  }, [shown, near]);

  // arrive once the poster is decoded and the tile is in view, so the reveal never shows an empty frame
  useEffect(() => {
    const el = root.current;
    if (!arrive || !el) return;
    const img = el.querySelector('img');
    let seen = false;
    let decoded = false;
    const go = () => seen && decoded && setShown(true);
    img?.decode().catch(() => {}).finally(() => { decoded = true; go(); });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      seen = true;
      go();
      io.disconnect();
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [arrive]);

  return (
    <span ref={root} className={cx(c.cover, arrive && c.arrive, shown && c.shown, className)}>
      <span className={c.media}>
        <img className={cx(c.film, ready && c.hidden)} src={poster} alt="" loading="lazy" decoding="async" />
        {near && (
          <video ref={video} className={c.film} autoPlay={!arrive} muted loop playsInline preload="auto" onPlaying={() => setReady(true)}>
            {hevc && <source src={hevc} type='video/mp4; codecs="hvc1"' />}
            <source src={film} type="video/mp4" />
          </video>
        )}
      </span>
    </span>
  );
}
