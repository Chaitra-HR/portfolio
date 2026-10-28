import { useEffect, useRef, useState } from 'react';
import { allowOthersToBoot, DESKTOP_QUERY, finishIntro, introPlays } from '../../lib/intro';
import { GradientBuddy } from './GradientBuddy';
import s from './Intro.module.css';

/*
 * The loading intro, on every full page load. The site's own mascot (the 3D
 * glass asterisk) loads first; once it is ready (so nothing sets up
 * mid-animation) it pops onto a clean screen and introduces itself, its line
 * lighting up word by word, while the page loads underneath. Then:
 *   - Home on desktop: the screen fades away and the mascot flies into the
 *     sidebar, handing over to the sidebar's mascot, so it reads as one mascot;
 *   - other desktop pages: it opens into an asterisk-shaped window that grows
 *     until the page shows through;
 *   - phones and tablets: a light fade and shrink (compositor-only, so smooth).
 * Click, tap or any key skips straight to the exit.
 */

const LINE = 'I’m the little asterisk. Just getting things ready for you.';
/** Wait at most this long for the 3D before popping on anyway (with the flat stand-in). */
const READY_WAIT_MS = 1500;
/** From the pop, the line takes about this long to light up; then a beat before the exit. */
const SAY_MS = 1900;
/** Never hold anyone up past this. */
const CAP_MS = 5500;
/** The sidebar's mascot gets this long to finish its 3D before the hand-over (it boots once ours has). */
const HANDOVER_WAIT_MS = 1500;
const FLY_MS = 820;
const REVEAL_MS = 900;
const FADE_MS = 520;

type Phase = 'wait' | 'hello' | 'fly' | 'reveal' | 'fade' | 'done';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** The flight into the sidebar as keyframes: an arc, shrinking (or growing) to the sidebar mascot's size. */
function flight(from: DOMRect, to: DOMRect): Keyframe[] {
  const frames: Keyframe[] = [];
  const steps = 40;
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const k = to.width / from.width;
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const e = easeInOutCubic(p);
    const lift = Math.sin(Math.PI * p) * 90;
    const scale = 1 + (k - 1) * e;
    frames.push({ transform: `translate(${(dx * e).toFixed(1)}px, ${(dy * e - lift).toFixed(1)}px) scale(${scale.toFixed(4)})`, offset: p });
  }
  return frames;
}

export function Intro() {
  const [phase, setPhase] = useState<Phase>(introPlays ? 'wait' : 'done');
  const body = useRef<HTMLDivElement>(null);
  const ready3d = useRef<() => void>(() => {});
  const exited = useRef(false);

  useEffect(() => {
    if (!introPlays) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    // A reload starts at the top (the browser and the router would otherwise restore
    // the old scroll position under the intro, so the page appeared part-way down).
    // Links to a section (#…) keep their target.
    const toTop = () => {
      if (!window.location.hash) window.scrollTo(0, 0);
    };
    toTop();
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const waitFor = (ms: number) => new Promise<void>((r) => later(r, ms));

    const desktop = window.matchMedia(DESKTOP_QUERY).matches;
    const mascot3d = new Promise<void>((r) => {
      ready3d.current = () => {
        // desktop: Home's sidebar mascot boots now, to be ready to take over
        if (desktop) allowOthersToBoot();
        r();
      };
    });

    const exit = async () => {
      if (exited.current) return;
      exited.current = true;
      toTop();
      root.style.overflow = '';
      // Home on desktop: fly into the sidebar's mascot (once it is ready to take over)
      const gist = document.querySelector<HTMLElement>('[data-buddy="gist"]');
      const from = body.current?.getBoundingClientRect();
      // phones and tablets: the others boot once the intro has gone
      if (!desktop) later(allowOthersToBoot, FADE_MS + 600);
      if (gist && from && gist.getBoundingClientRect().width > 0 && desktop) {
        // it boots once ours is ready; give it a moment so the hand-over is seamless
        allowOthersToBoot();
        await Promise.race([
          new Promise<void>((r) => {
            const check = () => (gist.dataset.ready ? r() : later(check, 60));
            check();
          }),
          waitFor(HANDOVER_WAIT_MS),
        ]);
        gist.style.visibility = 'hidden';
        setPhase('fly');
        finishIntro();
        // aim for where the sidebar mascot will rest: its card is still sliding into place (.rv)
        const to = gist.getBoundingClientRect();
        const card = gist.closest('.rv');
        const settle = card ? new DOMMatrix(getComputedStyle(card).transform).f : 0;
        const target = new DOMRect(to.left, to.top - settle, to.width, to.height);
        const anim = body.current?.animate(flight(from, target), { duration: FLY_MS, easing: 'linear', fill: 'forwards' });
        const land = () => {
          gist.style.visibility = '';
          setPhase('done');
        };
        if (anim) anim.onfinish = land;
        else land();
        return;
      }
      // other desktop pages: the asterisk opens into a window onto the page;
      // phones and tablets: a light fade (the window's repaint is heavy there)
      setPhase(desktop ? 'reveal' : 'fade');
      finishIntro();
      later(() => setPhase('done'), (desktop ? REVEAL_MS : FADE_MS) + 50);
    };

    // The page is ready once its route has rendered (images load lazily; no need to wait for them).
    const pageReady = new Promise<void>((r) => {
      const check = () => (document.getElementById('main') ? r() : later(check, 50));
      check();
    });
    // Pop on once the 3D is ready (or after a short wait), then say the line, then exit.
    void Promise.race([mascot3d, waitFor(READY_WAIT_MS)]).then(async () => {
      if (exited.current) return;
      setPhase('hello');
      await Promise.all([waitFor(SAY_MS), document.fonts?.ready ?? Promise.resolve(), pageReady]);
      void exit();
    });
    later(() => void exit(), CAP_MS);

    const skip = () => void exit();
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      root.style.overflow = '';
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`${s.intro} ${phase === 'wait' ? '' : s.go} ${phase === 'reveal' ? s.reveal : ''} ${phase === 'fly' ? s.fly : ''} ${phase === 'fade' ? s.fade : ''}`} role="status" aria-label="Loading">
      <div className={s.screen} aria-hidden="true" />
      <div className={s.stage} aria-hidden="true">
        <div ref={body} className={s.body}>
          <GradientBuddy className={s.buddy} surface="#FFFFFF" eager onReady={() => ready3d.current()} />
        </div>
        <p className={s.line}>
          {LINE.split(' ').map((w, i) => (
            <span key={i} style={{ '--w': i }}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
