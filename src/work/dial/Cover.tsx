import { useEffect, useRef } from 'react';
import d from './Cover.module.css';

const MIN = 16;
const MAX = 28;
const STEPS = 24;
const SWEEP = 270;
const LABELS = [16, 20, 24, 28];

/**
 * Dial, an interaction study: a machined thermostat knob. It turns toward the pointer on a spring, settling
 * into each of 24 detents with a small overshoot; the light on the metal stays put while the grip turns
 * under it, and the readout and the room's glow follow the setting.
 */
export function DialCover() {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const turn = el.querySelector<HTMLElement>('[data-turn]')!;
    const face = el.querySelector<HTMLElement>('[data-face]')!;
    const value = el.querySelector<HTMLElement>('[data-value]')!;
    const ticks = [...el.querySelectorAll<HTMLElement>('[data-tick]')];
    const toAngle = (s: number) => -SWEEP / 2 + (s / STEPS) * SWEEP;
    let step = 10;
    let target = toAngle(step);
    let angle = target;
    let vel = 0;
    let frame = 0;
    const host = el.closest<HTMLElement>('a, [tabindex]') ?? el;
    const render = () => {
      value.textContent = (MIN + (step / STEPS) * (MAX - MIN)).toFixed(1);
      ticks.forEach((t, i) => t.toggleAttribute('data-on', i <= step));
      el.style.setProperty('--warm', (step / STEPS).toFixed(3));
    };
    const move = (e: PointerEvent) => {
      const r = face.getBoundingClientRect();
      const a = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
      const next = Math.round(((Math.max(-SWEEP / 2, Math.min(SWEEP / 2, a)) + SWEEP / 2) / SWEEP) * STEPS);
      if (next !== step) {
        step = next;
        target = toAngle(step);
        // each detent: the face gives a tiny press, like a click under the fingers
        face.animate([{ scale: '0.985' }, { scale: '1' }], { duration: 120, easing: 'ease-out' });
        render();
        if (!frame) frame = requestAnimationFrame(tick);
      }
    };
    const tick = () => {
      // an underdamped spring: the knob overshoots a hair and settles into the detent
      vel += (target - angle) * 0.18;
      vel *= 0.62;
      angle += vel;
      // once it has settled into the detent the loop stops, until the pointer turns it again
      if (Math.abs(target - angle) < 0.01 && Math.abs(vel) < 0.01) {
        angle = target;
        frame = 0;
      } else frame = requestAnimationFrame(tick);
      turn.style.transform = `rotate(${angle}deg)`;
    };
    render();
    turn.style.transform = `rotate(${angle}deg)`;
    host.addEventListener('pointermove', move);
    return () => {
      host.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={root} className={d.field}>
      <span className={d.plate}>
        {Array.from({ length: STEPS + 1 }, (_, i) => (
          <i key={i} data-tick className={i % 6 === 0 ? d.major : undefined} style={{ transform: `rotate(${-SWEEP / 2 + (i / STEPS) * SWEEP}deg)` }} />
        ))}
        {LABELS.map((n, i) => {
          const a = ((-SWEEP / 2 + (i / (LABELS.length - 1)) * SWEEP) * Math.PI) / 180;
          return (
            <em key={n} style={{ left: `${50 + Math.sin(a) * 47}%`, top: `${50 - Math.cos(a) * 47}%` }}>
              {n}
            </em>
          );
        })}
        <span className={d.well} />
        <span className={d.face} data-face>
          <span className={d.turn} data-turn>
            <span className={d.knurl} />
            <span className={d.cap} />
            <b className={d.notch} />
          </span>
          <span className={d.light} />
        </span>
      </span>
      <span className={d.read}>
        <span className={d.lcd}>
          <span data-value className={d.value} />
          <sup>°C</sup>
        </span>
        <small>LIVING ROOM</small>
      </span>
    </span>
  );
}
