import { useEffect, useId, useRef, useState, type HTMLAttributes } from 'react';
import { introPlays, othersMayBoot } from '../../lib/intro';
import { prefersReducedMotion } from '../../lib/scroll';
import type { GlassAsterisk } from './glass/glassAsterisk';
import { useLookAt } from '../../hooks/useLookAt';
import { cx } from '../../lib/cx';
import { AsteriskArms } from '../ui/Asterisk';
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
 * flat SVG stand-in until it loads or without WebGL), clear in the middle with
 * deep violet, pink and blue rims and wet highlights; dark eyes follow the cursor;
 * it can wear an outfit and change expression. Size, shadow and click
 * behaviour come from the parent.
 */
export function GradientBuddy({ outfit = 'none', mouth = 'rest', spin = 0, spinMs = 760, surface = '#F5F5F5', eager = false, onReady, className, ...rest }: GradientBuddyProps) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const face = useRef<SVGSVGElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pupils = useRef<SVGGElement>(null);
  const glass = useRef<GlassAsterisk | null>(null);
  const [ready, setReady] = useState(false);
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

  // the flat sheen only animates while it's on screen
  useEffect(() => {
    const el = svg.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? el.unpauseAnimations() : el.pauseAnimations()));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className={cx(s.buddy, ready && s.ready, className)} data-ready={ready || undefined} {...rest}>
      <svg ref={svg} className={cx(s.layer, s.fallback)} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          <mask id={id('m')} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
            <g fill="#FFFFFF">
              <AsteriskArms />
            </g>
          </mask>
          {/* glass body: almost clear in the middle, a faint lavender cast */}
          <linearGradient id={id('body')} gradientUnits="userSpaceOnUse" x1="30" y1="20" x2="170" y2="185">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset=".45" stopColor="#F1EBFF" />
            <stop offset=".8" stopColor="#D3C6FF" />
            <stop offset="1" stopColor="#B3A1FA" />
          </linearGradient>
          {/* iridescence: violet → pink → lavender → sky blue → deep blue-violet, slowly turning */}
          <linearGradient id={id('iri')} gradientUnits="userSpaceOnUse" x1="20" y1="175" x2="180" y2="25" spreadMethod="reflect">
            <stop offset="0" stopColor="#6A4BF0" />
            <stop offset=".22" stopColor="#E77BE0" />
            <stop offset=".42" stopColor="#B9A4FF" />
            <stop offset=".62" stopColor="#7FB8FF" />
            <stop offset=".82" stopColor="#5A44E6" />
            <stop offset="1" stopColor="#C68BFF" />
            <animateTransform attributeName="gradientTransform" type="rotate" values="0 100 100;360 100 100" dur="18s" repeatCount="indefinite" />
          </linearGradient>
          {/* light bending through the liquid */}
          <filter id={id('flow')} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves={2} seed={11} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={42} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* where the glass is thick: a soft band inside every edge (white = band) */}
          <filter id={id('band')} x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="erode" radius={7} result="core" />
            <feGaussianBlur in="core" stdDeviation={5.5} result="soft" />
            <feComposite in="SourceAlpha" in2="soft" operator="out" result="band" />
            <feGaussianBlur in="band" stdDeviation={1.6} result="bandSoft" />
            <feFlood floodColor="#FFFFFF" />
            <feComposite in2="bandSoft" operator="in" result="white" />
            <feComposite in="white" in2="SourceAlpha" operator="in" />
          </filter>
          <mask id={id('rimMask')} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
            <g fill="#FFFFFF" filter={url('band')}>
              <AsteriskArms />
            </g>
          </mask>
          {/* refraction depth: a cool shadow pooled on the far side inside the glass */}
          <filter id={id('depth')} x="-10%" y="-10%" width="120%" height="120%">
            <feOffset in="SourceAlpha" dx={-7} dy={-9} result="shift" />
            <feGaussianBlur in="shift" stdDeviation={6} result="shiftSoft" />
            <feComposite in="SourceAlpha" in2="shiftSoft" operator="out" result="inner" />
            <feFlood floodColor="#5B6CFF" floodOpacity={0.42} />
            <feComposite in2="inner" operator="in" />
          </filter>
          {/* a fine dark edge where the glass turns away */}
          <filter id={id('edge')} x="-10%" y="-10%" width="120%" height="120%">
            <feMorphology in="SourceAlpha" operator="erode" radius={1.6} result="in" />
            <feComposite in="SourceAlpha" in2="in" operator="out" result="line" />
            <feGaussianBlur in="line" stdDeviation={0.6} result="lineSoft" />
            <feFlood floodColor="#3B22B8" floodOpacity={0.55} />
            <feComposite in2="lineSoft" operator="in" />
          </filter>
          {/* wet highlights: a broad soft sheen plus crisp streaks along the edges */}
          <filter id={id('spec')} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={6} result="bump" />
            <feSpecularLighting in="bump" surfaceScale={7} specularConstant={0.9} specularExponent={22} lightingColor="#FFFFFF" result="broad">
              <feDistantLight azimuth={235} elevation={50} />
            </feSpecularLighting>
            <feGaussianBlur in="SourceAlpha" stdDeviation={2.6} result="bumpSharp" />
            <feSpecularLighting in="bumpSharp" surfaceScale={10} specularConstant={1.3} specularExponent={55} lightingColor="#FFFFFF" result="crisp">
              <feDistantLight azimuth={225} elevation={38} />
            </feSpecularLighting>
            <feMerge result="both">
              <feMergeNode in="broad" />
              <feMergeNode in="crisp" />
            </feMerge>
            <feComposite in="both" in2="SourceAlpha" operator="in" />
          </filter>
        </defs>

        <g className={s.sway}>
          {/* clear body with a soft caustic of light through it */}
          <g mask={url('m')}>
            <rect x="0" y="0" width="200" height="200" fill={url('body')} opacity={0.62} />
            <path d="M -10 120 C 40 80 90 150 210 70 L 210 95 C 100 170 40 110 -10 145 Z" fill="#FFFFFF" opacity={0.45} filter={url('flow')} />
          </g>
          {/* iridescent colour gathered in the thick rims */}
          <g mask={url('rimMask')}>
            <rect x="-20" y="-20" width="240" height="240" fill={url('iri')} filter={url('flow')} />
          </g>
          <g filter={url('depth')}>
            <AsteriskArms />
          </g>
          <g filter={url('edge')}>
            <AsteriskArms />
          </g>
          <g filter={url('spec')} className={s.screen}>
            <AsteriskArms />
          </g>
        </g>

      </svg>

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
