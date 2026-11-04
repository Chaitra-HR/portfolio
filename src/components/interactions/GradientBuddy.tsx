import { useEffect, useId, useRef, useState, type HTMLAttributes } from 'react';
import glassStill from '../../assets/images/mascot/glass.webp';
import { introPlays, othersMayBoot } from '../../lib/intro';
import { prefersReducedMotion } from '../../lib/scroll';
import type { GlassAsterisk } from './glass/glassAsterisk';
import { useLookAt } from '../../hooks/useLookAt';
import { cx } from '../../lib/cx';
import s from './GradientBuddy.module.css';

export type Outfit = 'none' | 'specs' | 'cool' | 'blush';
export type Mouth = 'rest' | 'grin' | 'smirk' | 'o' | 'cat' | 'smile';

/** Phones: a mascot boots its 3D no sooner than this after it mounts, so the page's entrance plays first. */
const PHONE_SETTLE_MS = 1200;

// Small, light face proportions; the mark's mouth sits just below the eyes.
const MOUTHS: Record<Mouth, string> = {
  rest: 'M -6 13 Q 0 18 6 13',
  grin: 'M -8 12 Q 0 22 8 12',
  smirk: 'M -6 14.5 Q 2 18 8 11.5',
  o: 'M -3 15.5 a 3 3.4 0 1 0 6 0 a 3 3.4 0 1 0 -6 0',
  cat: 'M -8 13 Q -4 18 0 14 Q 4 18 8 13',
  smile: 'M -8 12 Q 0 13.5 8 12 Q 6.5 22 0 22 Q -6.5 22 -8 12 Z',
};
/** Mouths drawn as a filled shape rather than a line. */
const FILLED: Mouth[] = ['o', 'smile'];
/** A deep, soft ink (not pure black) for the eyes, mouth and specs. */
const INK = '#2A2250';

interface GradientBuddyProps extends HTMLAttributes<HTMLDivElement> {
  outfit?: Outfit;
  mouth?: Mouth;
  /** Increment to make it spin once (the 3D body turns; the face turns with it). */
  spin?: number;
  spinMs?: number;
  /** Colour of the surface behind it. */
  surface?: string;
  /** Boot the 3D at once, ahead of everything (the loading intro's mascot). */
  eager?: boolean;
  /** Called once the 3D body is showing. */
  onReady?: () => void;
}

/** What the asterisk is wearing. Drawn over the face, in the mascot's 200×200 space (centre 100,100). */
function Accessory({ outfit }: { outfit: Outfit }) {
  switch (outfit) {
    case 'specs':
      // fine round reading glasses
      return (
        <g fill="rgba(255,255,255,.12)" stroke={INK} strokeOpacity=".85" strokeWidth="2.2">
          <circle cx="85" cy="97" r="13.5" />
          <circle cx="115" cy="97" r="13.5" />
          <path d="M 98.5 95 Q 100 92.5 101.5 95" fill="none" />
        </g>
      );
    case 'cool':
      // shades and headphones
      return (
        <g>
          <path d="M 40 104 C 38 52 162 52 160 104" fill="none" stroke="#16121F" strokeWidth="7" strokeLinecap="round" />
          <rect x="27" y="90" width="20" height="34" rx="9" fill="#16121F" />
          <rect x="153" y="90" width="20" height="34" rx="9" fill="#16121F" />
          <rect x="31" y="96" width="5" height="22" rx="2.5" fill="rgba(255,255,255,.35)" />
          <path d="M 62 90 h 32 a 4 4 0 0 1 4 4 v 6 a 12 12 0 0 1 -12 12 h -12 a 12 12 0 0 1 -12 -12 v -6 a 4 4 0 0 1 4 -4 Z M 106 90 h 32 a 4 4 0 0 1 4 4 v 6 a 12 12 0 0 1 -12 12 h -12 a 12 12 0 0 1 -12 -12 v -6 a 4 4 0 0 1 4 -4 Z" fill="#16121F" />
          <path d="M 98 95 h 8" stroke="#16121F" strokeWidth="4" />
          <path d="M 68 95 l 8 0" stroke="rgba(255,255,255,.55)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 112 95 l 8 0" stroke="rgba(255,255,255,.55)" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * The asterisk mascot in iridescent liquid glass: a 3D body (three.js, with a
 * still of the same render standing in until it loads or without WebGL), clear in the middle with
 * deep violet, pink and blue rims and wet highlights; dark eyes follow the cursor;
 * it can wear an outfit and change expression. Size, shadow and click
 * behaviour come from the parent.
 */
export function GradientBuddy({ outfit = 'none', mouth = 'rest', spin = 0, spinMs = 760, surface = '#F5F5F5', eager = false, onReady, className, ...rest }: GradientBuddyProps) {
  const root = useRef<HTMLDivElement>(null);
  const face = useRef<SVGSVGElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pupils = useRef<SVGGElement>(null);
  const glass = useRef<GlassAsterisk | null>(null);
  const [ready, setReady] = useState(false);
  // the face waits for a body to sit on: the still (or the live 3D)
  const [body, setBody] = useState(false);
  const still = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (still.current?.complete && still.current.naturalWidth) setBody(true);
  }, []);
  const readyCb = useRef(onReady);
  readyCb.current = onReady;
  const uid = useId();
  const id = (name: string) => `${uid}${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  useLookAt(root, pupils, { x: 4.4, y: 5.2, range: 260, wander: true });

  // The flat SVG body shows instantly; the 3D glass body loads as it nears the screen.
  useEffect(() => {
    const el = root.current, cv = canvas.current;
    if (!el || !cv) return;
    let cancelled = false;
    let cleanup = () => {};

    const boot = async () => {
      try {
        const { createGlassAsterisk } = await import('./glass/glassAsterisk');
        if (cancelled) return;
        let half = el.offsetWidth / 2;
        const api = createGlassAsterisk(cv, {
          background: surface,
          reducedMotion: prefersReducedMotion(),
          // touch devices: a lighter render, so scrolling and hops stay smooth
          lite: window.matchMedia('(pointer: coarse)').matches,
          onFrame: ({ rx, ry, spin: turn, roll, squash, lift }) => {
            const f = face.current;
            if (!f) return;
            // the 2D face rides on the 3D body: shift with its tilt and hop, roll and
            // squash with it, narrow as it turns away
            const cos = Math.cos(turn);
            const x = Math.sin(ry + turn) * half * 0.32;
            const y = rx * half * 0.32 - lift * half * 2;
            f.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${roll.toFixed(4)}rad) scale(${(Math.max(cos, 0) * (1 + squash)).toFixed(3)}, ${(1 - squash).toFixed(3)})`;
            f.style.opacity = cos > 0.05 ? '1' : '0';
          },
        });
        glass.current = api;
        const size = () => {
          half = el.offsetWidth / 2;
          api.resize(cv.clientWidth);
        };
        size();
        setReady(true);
        readyCb.current?.();

        const ro = new ResizeObserver(size);
        ro.observe(cv);
        // render only while on screen and not hidden (the phone guide hides the copy it isn't using)
        let inView = true;
        const run = () => api.setRunning(inView && el.style.visibility !== 'hidden');
        const vis = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          run();
        });
        vis.observe(el);
        const shown = new MutationObserver(run);
        shown.observe(el, { attributes: true, attributeFilter: ['style'] });
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - (r.left + r.width / 2)) / 600;
          const ny = (e.clientY - (r.top + r.height / 2)) / 600;
          api.tilt(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)));
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        cleanup = () => {
          ro.disconnect();
          vis.disconnect();
          shown.disconnect();
          window.removeEventListener('mousemove', onMove);
          api.destroy();
          glass.current = null;
        };
      } catch {
        // no WebGL: keep the SVG body
      }
    };

    // Load when it comes within reach of the viewport, or earlier in idle time after the
    // page settles, so a mascot never compiles its 3D mid-scroll (a visible stall on phones).
    // ...but after the loading intro's own mascot (which boots first, `eager`; see lib/intro)
    let booted = false;
    let clear = eager || !introPlays;
    let asked = false;
    let after = 0;
    void othersMayBoot.then(() => {
      after = window.setTimeout(() => {
        clear = true;
        if (!asked) return;
        // each waiting mascot takes its own idle moment, so their setups don't pile into one stall
        const idleNow = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
        if (idleNow) idleNow(start, { timeout: 2000 });
        else start();
      }, introPlays ? 150 : 0);
    });
    // phones: let the page's entrance play first (a 3D setup would stall it)
    let settled = eager || !window.matchMedia('(pointer: coarse)').matches;
    const settle = window.setTimeout(() => {
      settled = true;
      if (asked && clear) start();
    }, PHONE_SETTLE_MS);
    const start = () => {
      if (booted) return;
      if (!clear || !settled) {
        asked = true;
        return;
      }
      booted = true;
      near.disconnect();
      cancelIdle();
      void boot();
    };
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && start(), { rootMargin: '400px' });
    near.observe(el);
    // (Safari has no requestIdleCallback: fall back to a plain delay)
    const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
    const onIdle = () => {
      // not laid out (e.g. Home's gist panel, hidden on phones): wait until it is
      if (el.getClientRects().length) start();
    };
    const idle = ric ? ric(onIdle, { timeout: 4000 }) : window.setTimeout(onIdle, 1500);
    const cancelIdle = () => (ric ? window.cancelIdleCallback(idle) : clearTimeout(idle));
    if (eager) start();
    return () => {
      cancelled = true;
      clearTimeout(after);
      clearTimeout(settle);
      near.disconnect();
      cancelIdle();
      cleanup();
    };
  }, [surface]);

  // spin: the 3D body turns once; without WebGL the whole mascot flips flat
  const lastSpin = useRef(spin);
  useEffect(() => {
    if (spin === lastSpin.current) return;
    lastSpin.current = spin;
    if (glass.current) glass.current.spin(spinMs);
    else if (!prefersReducedMotion())
      root.current?.animate(
        [
          { transform: 'perspective(700px) rotateY(0deg) scale(1)' },
          { transform: 'perspective(700px) rotateY(180deg) scale(1.08)', offset: 0.5 },
          { transform: 'perspective(700px) rotateY(360deg) scale(1)' },
        ],
        { duration: spinMs, easing: 'cubic-bezier(.45, .05, .25, 1)' },
      );
  }, [spin, spinMs]);

  return (
    <div ref={root} className={cx(s.buddy, ready && s.ready, !(body || ready) && s.bare, className)} data-ready={ready || undefined} {...rest}>
      {/* the glass body as a still, rendered from the 3D: shows at once, and the live 3D fades in over it (it is
          also all a phone shows during the loading intro, and the whole body without WebGL) */}
      <img ref={still} className={cx(s.still, s.fallback)} src={glassStill} alt="" decoding="async" draggable={false} onLoad={() => setBody(true)} />

      <canvas ref={canvas} className={s.canvas} aria-hidden="true" />

      <svg ref={face} className={cx(s.layer, s.face)} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          {/* small dark eyes with a soft sheen and two catchlights */}
          {/* eyeballs: a soft lid shade on the white, a violet iris that roams inside */}
          <linearGradient id={id('sclera')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E4DCFA" />
            <stop offset=".4" stopColor="#FFFFFF" />
          </linearGradient>
          <radialGradient id={id('iris')} cx=".4" cy=".34" r=".72">
            <stop offset="0" stopColor="#8A72F0" />
            <stop offset=".6" stopColor="#4A35B0" />
            <stop offset="1" stopColor={INK} />
          </radialGradient>
          <clipPath id={id('eyeball')}>
            <ellipse cx="-14.5" cy="-3" rx="10.5" ry="13" />
            <ellipse cx="14.5" cy="-3" rx="10.5" ry="13" />
          </clipPath>
          <radialGradient id={id('blush')}>
            <stop offset="0" stopColor="#FF7FB0" stopOpacity=".85" />
            <stop offset="1" stopColor="#FF7FB0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform="translate(100 100)">
          {outfit === 'blush' && (
            <g fill={url('blush')}>
              <ellipse cx="-29" cy="9" rx="10" ry="6" />
              <ellipse cx="29" cy="9" rx="10" ry="6" />
            </g>
          )}
          <g className={s.lids} visibility={outfit === 'cool' ? 'hidden' : undefined}>
            <g fill={url('sclera')} stroke="rgba(42,34,80,.22)" strokeWidth="1">
              <ellipse cx="-14.5" cy="-3" rx="10.5" ry="13" />
              <ellipse cx="14.5" cy="-3" rx="10.5" ry="13" />
            </g>
            <g clipPath={url('eyeball')}>
              <g ref={pupils} className={s.pupils}>
                <ellipse cx="-14.5" cy="-2" rx="6.2" ry="7.6" fill={url('iris')} />
                <ellipse cx="14.5" cy="-2" rx="6.2" ry="7.6" fill={url('iris')} />
                <ellipse cx="-14.5" cy="-1.6" rx="2.9" ry="3.6" fill="#140E33" />
                <ellipse cx="14.5" cy="-1.6" rx="2.9" ry="3.6" fill="#140E33" />
                <circle cx="-12.2" cy="-5" r="2" fill="#FFFFFF" />
                <circle cx="16.8" cy="-5" r="2" fill="#FFFFFF" />
                <circle cx="-16.4" cy="1.6" r=".9" fill="rgba(255,255,255,.75)" />
                <circle cx="12.6" cy="1.6" r=".9" fill="rgba(255,255,255,.75)" />
              </g>
            </g>
          </g>
          {FILLED.includes(mouth) ? (
            <path d={MOUTHS[mouth]} fill={INK} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          ) : (
            <path d={MOUTHS[mouth]} fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {mouth === 'smile' && <path d="M -3.6 19.6 Q 0 16.2 3.6 19.6 Q 0 21.6 -3.6 19.6 Z" fill="#FF8DB4" />}
        </g>

        <Accessory outfit={outfit} />
      </svg>
    </div>
  );
}
