import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Pill } from '../../components/ui/Pill';
import { testimonials } from '../../data/testimonials';
import { cx } from '../../lib/cx';
import home from './Home.module.css';
import s from './Testimonials.module.css';

type Step = 1 | -1;

/** The live site marks sample quotes; the local view shows the layout as it will look. */
const TAG_SAMPLES = import.meta.env.PROD;

/** A drag counts as a swipe past this distance, or when flicked faster than this. */
const SWIPE_PX = 60;
const FLICK_PX_PER_S = 450;
/** Trackpad: horizontal wheel travel for one step, and the pause before the next. */
const WHEEL_PX = 50;
const WHEEL_LOCK_MS = 450;

interface Gesture {
  id: number;
  x: number;
  y: number;
  axis?: 'x' | 'y';
  /** recent [time ms, x] samples, for release velocity */
  samples: Array<[number, number]>;
}

/** px/s over the last ~80ms of movement. */
function releaseVelocity(samples: Array<[number, number]>): number {
  const end = samples[samples.length - 1];
  if (!end) return 0;
  const start = samples.find(([t]) => end[0] - t <= 80) ?? end;
  const dt = end[0] - start[0];
  return dt > 0 ? ((end[1] - start[1]) / dt) * 1000 : 0;
}

/**
 * "Kind words": one quote at a time on a calm panel, the person anchored at the bottom and the
 * arrows docked in the corner. Slides glide sideways — drag, flick, trackpad, arrows or arrow keys.
 */
export function Testimonials() {
  const n = testimonials.length;
  const [index, setIndex] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);

  const step = (dir: Step) => setIndex((i) => (i + dir + n) % n);

  // Two-finger horizontal swipes on a trackpad.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let travel = 0;
    let lockedUntil = 0;
    let idle = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      clearTimeout(idle);
      idle = window.setTimeout(() => (travel = 0), 160);
      const now = performance.now();
      if (now < lockedUntil) return;
      travel += e.deltaX;
      if (Math.abs(travel) >= WHEEL_PX) {
        const dir: Step = travel > 0 ? 1 : -1;
        travel = 0;
        lockedUntil = now + WHEEL_LOCK_MS;
        setIndex((i) => (i + dir + n) % n);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(idle);
    };
  }, [n]);

  // While dragging, the track follows the pointer 1:1 from where it rests.
  const follow = (dx: number) => {
    if (track.current) track.current.style.translate = dx ? `calc(${-index * 100}% + ${dx}px) 0` : '';
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, samples: [[e.timeStamp, e.clientX]] };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      // Decide once: horizontal drags move the slides, vertical ones scroll the page.
      g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (g.axis === 'x') {
        stage.current?.classList.add(s.dragging);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* synthetic events can't be captured */
        }
      }
    }
    if (g.axis !== 'x') return;
    g.samples.push([e.timeStamp, e.clientX]);
    if (g.samples.length > 8) g.samples.shift();
    follow(dx);
  };

  const endGesture = (e: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.axis !== 'x') return;
    stage.current?.classList.remove(s.dragging);
    follow(0);
    const dx = e.clientX - g.x;
    const v = cancelled ? 0 : releaseVelocity([...g.samples, [e.timeStamp, e.clientX]]);
    const flicked = Math.abs(v) > FLICK_PX_PER_S && Math.sign(v) === Math.sign(dx);
    if (!cancelled && (Math.abs(dx) > SWIPE_PX || flicked)) step((flicked ? v : dx) < 0 ? 1 : -1);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else return;
    e.preventDefault();
  };

  return (
    <section id="words" className={cx(home.sec, s.sec)} aria-label="Testimonials" aria-roledescription="carousel">
      <div className={home.sh}>
        <h2>Kind words</h2>
        <span className="mut">From clients and collaborators</span>
      </div>

      <div
        ref={stage}
        className={s.stage}
        tabIndex={0}
        aria-label="Testimonials — swipe, drag or use the arrow keys"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endGesture(e)}
        onPointerCancel={(e) => endGesture(e, true)}
        onKeyDown={onKeyDown}
      >
        <div ref={track} className={s.track} style={{ '--at': index }}>
          {testimonials.map((t, i) => (
            <figure key={i} className={s.slide} aria-hidden={i !== index} inert={i !== index} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
              {/* an opening quote: two chunky slabs leaning into the words, in the brand lilac */}
              <svg className={s.mark} viewBox="0 0 37 30" aria-hidden="true" focusable="false">
                <path d="M0 30V16.5C0 9.8 3.4 4 9.6 0H16c-3.7 3.6-5.6 7.6-6 12h6v18H0Zm21 0V16.5c0-6.7 3.4-12.5 9.6-16.5H37c-3.7 3.6-5.6 7.6-6 12h6v18H21Z" />
              </svg>
              <blockquote className={s.quote}>{t.quote}</blockquote>
              <figcaption className={s.who}>
                <span className={s.avatar} aria-hidden="true">
                  {t.photo && <img src={t.photo} alt="" loading="lazy" decoding="async" draggable={false} />}
                </span>
                <span>
                  <span className={s.name}>{t.name}</span>
                  <span className={s.role}>{t.role}</span>
                </span>
                {t.sample && TAG_SAMPLES && <span className={s.sample}>Sample</span>}
              </figcaption>
            </figure>
          ))}
        </div>

        <span className={s.count} aria-live="polite">
          {index + 1} / {n}
        </span>
        {/* on the attribution's line, bottom right */}
        <div className={s.controls}>
          <Pill className={s.btn} type="button" aria-label="Previous testimonial" onClick={() => step(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m14.5 6-6 6 6 6" />
            </svg>
          </Pill>
          <Pill className={s.btn} type="button" aria-label="Next testimonial" onClick={() => step(1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9.5 6 6 6-6 6" />
            </svg>
          </Pill>
        </div>
      </div>
    </section>
  );
}
