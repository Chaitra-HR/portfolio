import { useEffect, useRef } from 'react';
import s from './CustomCursor.module.css';

/*
 * Site-wide custom cursor, modelled on protasevich.com. Only for a mouse or
 * trackpad on screens wider than 800px; everyone else keeps the system cursor.
 *   - follows the pointer exactly; leans up to 60° toward the screen centre
 *   - presses down to 80% while the button is held
 *   - morphs into a dot over anything interactive
 *   - shows a pill label for elements with data-cursor-tooltip="…"
 */

const ARROW = [5.1109, 3.4082, 6.0349, 1.4727, 6.497, 0.505, 7.1294, 0.1993, 7.6794, -0.0664, 8.3206, -0.0664, 8.8706, 0.1993, 9.5031, 0.505, 9.9651, 1.4727, 10.8891, 3.4082, 11.8908, 5.5065, 12.8925, 7.6047, 13.8942, 9.703, 14.9967, 12.0123, 15.548, 13.167, 15.4931, 13.7222, 15.3851, 14.8163, 14.4146, 15.6183, 13.3197, 15.5182, 12.7641, 15.4674, 11.7341, 14.7084, 9.6739, 13.1903, 9.2086, 12.8475, 8.9759, 12.676, 8.7319, 12.5802, 8.2615, 12.3952, 7.7385, 12.3952, 7.268, 12.5802, 7.0241, 12.676, 6.7914, 12.8475, 6.3261, 13.1903, 4.266, 14.7084, 3.2359, 15.4674, 2.6803, 15.5182, 1.5854, 15.6183, 0.6149, 14.8163, 0.5069, 13.7222, 0.452, 13.167, 1.0033, 12.0123, 2.1058, 9.703, 3.1075, 7.6047, 4.1092, 5.5065, 5.1109, 3.4082];
/** A circle drawn with the arrow's exact command structure, so the two can be blended point by point. */
const DOT = [4.3531, 1.4464, 5.2398, 0.9529, 6.2175, 0.6446, 7.2269, 0.54, 7.7409, 0.4867, 8.2591, 0.4867, 8.7731, 0.54, 9.7825, 0.6446, 10.7602, 0.9529, 11.6469, 1.4464, 14.4652, 3.0147, 15.9653, 6.2092, 15.372, 9.3795, 15.1807, 10.4021, 14.7787, 11.3737, 14.1916, 12.2325, 13.7453, 12.8853, 13.1986, 13.4635, 12.5718, 13.9455, 11.9644, 14.4125, 11.2892, 14.7837, 10.5694, 15.0461, 10.175, 15.1899, 9.7693, 15.3004, 9.3565, 15.3763, 8.4597, 15.5412, 7.5403, 15.5412, 6.6435, 15.3763, 6.2307, 15.3004, 5.8249, 15.1899, 5.4306, 15.0461, 4.7108, 14.7837, 4.0356, 14.4125, 3.4282, 13.9455, 2.8014, 13.4635, 2.2547, 12.8853, 1.8084, 12.2325, 1.2213, 11.3737, 0.8193, 10.4021, 0.628, 9.3795, 0.0347, 6.2092, 1.5348, 3.0147, 4.3531, 1.4464];

const INTERACTIVE = 'a[href], button, [role="button"], summary, label, select, [tabindex]:not([tabindex="-1"])';
const MAX_LEAN = 60;
const LEAN_RATE = 9;
const PRESS_SCALE = 0.8;
const PRESS_MS = 50;
const MORPH_MS = 150;
/** Pill sits this far below the pointer (centre), and this far right. */
const TIP_Y = 36;
const TIP_X = 2;
/** The label keeps this far from the screen edges. */
const TIP_EDGE = 12;

function pathFor(t: number): string {
  const v = ARROW.map((a, i) => a + (DOT[i] - a) * t);
  let d = `M${v[0]} ${v[1]}`;
  for (let i = 2; i < v.length; i += 6) d += `C${v[i]} ${v[i + 1]} ${v[i + 2]} ${v[i + 3]} ${v[i + 4]} ${v[i + 5]}`;
  return `${d}Z`;
}
const easeOut2 = (t: number) => 1 - (1 - t) * (1 - t);

export function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 801px) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;

    const st = {
      x: 0,
      y: 0,
      onScreen: false,
      lean: 0,
      press: { scale: 1, from: 1, to: 1, start: 0 },
      morph: { t: 0, from: 0, to: 0, start: 0 },
      tipTarget: null as Element | null,
      tipText: '',
      /** label width, so the pill can be kept on screen near the edges */
      tipW: 0,
    };
    let frame = 0;
    let last = 0;
    let enabled = false;

    const leanFor = (x: number) => {
      if (reduce.matches) return 0;
      const half = window.innerWidth / 2;
      const off = x - half;
      return half > 0 ? -Math.sign(off) * Math.min(Math.abs(off) / half, 1) * MAX_LEAN : 0;
    };

    const showTip = (text: string) => {
      const sh = shell.current, sf = surface.current, lb = label.current;
      if (!sh || !sf || !lb) return;
      lb.textContent = text;
      st.tipW = sf.offsetWidth;
      sh.style.width = `${st.tipW}px`;
      sh.style.height = `${sf.offsetHeight}px`;
    };
    const hideTip = () => {
      const sh = shell.current;
      if (!sh) return;
      sh.style.width = '0px';
      sh.style.height = '0px';
    };

    const setMorph = (toDot: boolean) => {
      const to = toDot ? 1 : 0;
      if (st.morph.to === to) return;
      if (reduce.matches) {
        st.morph = { t: to, from: to, to, start: 0 };
        path.current?.setAttribute('d', pathFor(to));
        return;
      }
      st.morph = { t: st.morph.t, from: st.morph.t, to, start: performance.now() };
    };

    const hitTest = () => {
      if (!st.onScreen) return;
      const el = document.elementFromPoint(st.x, st.y);
      setMorph(!!el?.closest(INTERACTIVE));
      const target = el?.closest('[data-cursor-tooltip]') ?? null;
      const text = target?.getAttribute('data-cursor-tooltip')?.trim() ?? '';
      if (target && text) {
        if (target !== st.tipTarget || text !== st.tipText) showTip(text);
      } else if (st.tipTarget) hideTip();
      st.tipTarget = target && text ? target : null;
      st.tipText = text;
    };

    const paint = () => {
      const c = cursor.current, t = tip.current;
      if (c) c.style.transform = `translate3d(${st.x - 8}px, ${st.y}px, 0) rotate(${st.lean.toFixed(2)}deg) scale(${st.press.scale.toFixed(3)})`;
      if (t) {
        // centred under the cursor, but never past the screen edge
        const half = st.tipW / 2 + TIP_EDGE;
        const x = Math.min(Math.max(st.x + TIP_X, half), window.innerWidth - half);
        t.style.transform = `translate3d(${x}px, ${st.y + TIP_Y}px, 0)`;
      }
    };

    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      let busy = false;

      const lean = leanFor(st.x);
      st.lean += (lean - st.lean) * (1 - Math.exp(-LEAN_RATE * dt));
      if (Math.abs(lean - st.lean) > 0.05) busy = true;
      else st.lean = lean;

      if (st.press.scale !== st.press.to) {
        const p = Math.min((now - st.press.start) / PRESS_MS, 1);
        st.press.scale = st.press.from + (st.press.to - st.press.from) * p;
        if (p < 1) busy = true;
      }

      if (st.morph.t !== st.morph.to) {
        const p = Math.min((now - st.morph.start) / MORPH_MS, 1);
        st.morph.t = st.morph.from + (st.morph.to - st.morph.from) * easeOut2(p);
        path.current?.setAttribute('d', pathFor(st.morph.t));
        if (p < 1) busy = true;
        else st.morph.t = st.morph.to;
      }

      paint();
      if (busy && st.onScreen) frame = requestAnimationFrame(tick);
      else last = 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const setOnScreen = (on: boolean) => {
      if (st.onScreen === on) return;
      st.onScreen = on;
      cursor.current?.classList.toggle(s.visible, on);
      if (!on) {
        hideTip();
        st.tipTarget = null;
        st.tipText = '';
        setMorph(false);
      }
    };

    const isMouse = (e: PointerEvent) => !e.pointerType || e.pointerType === 'mouse';
    const onMove = (e: PointerEvent) => {
      if (!isMouse(e)) return;
      st.x = e.clientX;
      st.y = e.clientY;
      if (!st.onScreen) st.lean = leanFor(st.x);
      setOnScreen(true);
      hitTest();
      wake();
    };
    const press = (down: boolean) => {
      if (reduce.matches) return;
      st.press = { scale: st.press.scale, from: st.press.scale, to: down ? PRESS_SCALE : 1, start: performance.now() };
      wake();
    };
    const onDown = (e: PointerEvent) => isMouse(e) && st.onScreen && press(true);
    const onUp = (e: PointerEvent) => isMouse(e) && press(false);
    const onLeave = () => {
      press(false);
      setOnScreen(false);
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) onLeave();
    };
    const onScroll = () => {
      hitTest();
      wake();
    };
    // a click can swap the page (route change) under a still pointer
    const onClick = () => requestAnimationFrame(onScroll);

    const enable = () => {
      if (enabled) return;
      enabled = true;
      root.classList.add('has-custom-cursor');
      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerdown', onDown, { passive: true });
      document.addEventListener('pointerup', onUp, { passive: true });
      document.addEventListener('pointercancel', onUp, { passive: true });
      document.addEventListener('mouseout', onOut);
      window.addEventListener('blur', onLeave);
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('click', onClick);
    };
    const disable = () => {
      if (!enabled) return;
      enabled = false;
      root.classList.remove('has-custom-cursor');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      document.removeEventListener('mouseout', onOut);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      setOnScreen(false);
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => (desktop.matches ? enable() : disable());

    sync();
    desktop.addEventListener('change', sync);
    return () => {
      desktop.removeEventListener('change', sync);
      disable();
    };
  }, []);

  return (
    <>
      <div ref={cursor} className={s.cursor} aria-hidden="true">
        <div className={s.inner}>
          <svg className={s.shape} width="16" height="16" viewBox="0 0 16 16" focusable="false">
            <path ref={path} d={pathFor(0)} />
          </svg>
        </div>
      </div>
      <div ref={tip} className={s.tip} aria-hidden="true">
        <div ref={shell} className={s.shell}>
          <div ref={surface} className={s.surface}>
            <span ref={label} className={s.label} />
          </div>
        </div>
      </div>
    </>
  );
}
