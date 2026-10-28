import { useState } from 'react';
import { cx } from '../../lib/cx';
import s from './About.module.css';

interface PhotoProps {
  /** JPEG, the fallback for browsers without AVIF. */
  src: string;
  /** The same photo as AVIF (about 40% lighter), preferred when supported; if a browser
   *  can't decode it, the photo falls back to the JPEG instead of staying blank. */
  avif?: string;
  alt: string;
  caption: string;
  /** CSS object-position, to keep the subject in frame. */
  focus: string;
  className?: string;
  /** Enter this many steps after its neighbours. */
  stagger?: number;
  /** Hold this long (ms) before entering on page load. */
  delay?: number;
}

/**
 * A photo that opens into view as it scrolls in (useScrub "grow"), fades in once loaded and zooms on hover. With the custom cursor its caption
 * rides along under the pointer; otherwise (touch, keyboard focus) it shows in the corner.
 */
export function Photo({ src, avif, alt, caption, focus, className, stagger = 0, delay = 0 }: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  // <picture> picks a <source> by its type, not by whether it decodes: drop the AVIF on error
  const [avifFailed, setAvifFailed] = useState(false);
  return (
    <figure className={cx(s.ph, s.mo, className)} tabIndex={0} data-scrub="grow" data-stagger={stagger} data-delay={delay} data-cursor-tooltip={caption}>
      <picture>
        {avif && !avifFailed && <source srcSet={avif} type="image/avif" />}
        <img
          // cached images can finish before React attaches onLoad
          ref={(img) => {
            if (img?.complete && img.naturalWidth) setLoaded(true);
          }}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={loaded ? s.loaded : undefined}
          style={{ objectPosition: focus }}
          onLoad={() => setLoaded(true)}
          onError={() => avif && setAvifFailed(true)}
        />
      </picture>
      <figcaption className={s.moT}>{caption}</figcaption>
    </figure>
  );
}
