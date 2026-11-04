import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import c from '../covers.module.css';
import type { ArtProps } from '../types';
import { ReviewDashboard } from '../finscribe-app/ReviewDashboard';

/** The findings the film opens, in turn. */
const SCRIPT = ['promise', 'performance', 'disclosure'];
/** The width the dashboard is laid out at before it's scaled into the window. */
const DESIGN = 820;

interface Cursor {
  x: number;
  y: number;
  press: boolean;
}

/**
 * A film of the review, played in code: the dashboard in a window on a warm wash, a cursor
 * opening each finding in turn. It loops from the start, whatever the motion setting.
 */
export function ComplianceCover({ className }: ArtProps) {
  const pane = useRef<HTMLSpanElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [tall, setTall] = useState(0);
  const [step, setStep] = useState(0);
  const [cursor, setCursor] = useState<Cursor>({ x: 300, y: 380, press: false });

  useEffect(() => {
    const el = pane.current;
    if (!el) return;
    const sized = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / DESIGN));
    sized.observe(el);
    // the window is as tall as the dashboard inside it, so no blank paper shows below
    const content = new ResizeObserver(([entry]) => setTall(entry.contentRect.height));
    if (screen.current) content.observe(screen.current);
    return () => {
      sized.disconnect();
      content.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = screen.current;
    if (!el || !scale) return;
    const timers: number[] = [];
    let at = 0;
    const later = (ms: number, then: () => void) => timers.push(window.setTimeout(then, ms));
    // where a finding's title sits, in the dashboard's own unscaled pixels
    const target = (i: number) => {
      const card = el.querySelectorAll<HTMLElement>('[data-findings] [aria-expanded]')[i];
      if (!card) return null;
      const box = el.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      return { x: (r.left - box.left) / scale + 90, y: (r.top - box.top) / scale + 16 };
    };
    const beat = () => {
      const next = (at + 1) % SCRIPT.length;
      const to = target(next);
      if (to) setCursor({ ...to, press: false });
      later(1100, () => setCursor((v) => ({ ...v, press: true })));
      later(1300, () => {
        at = next;
        setStep(next);
        setCursor((v) => ({ ...v, press: false }));
      });
      // the card above folds shut as this one opens, so the hand follows its title up
      later(1500, () => {
        const moved = target(next);
        if (moved) setCursor({ ...moved, press: false });
      });
      later(3800, beat);
    };
    later(1600, beat);
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [scale]);

  return (
    <span className={cx(c.cover, c.cpWash, className)}>
      <span ref={pane} className={c.cpWindow} style={{ height: tall * scale || undefined }}>
        <div ref={screen} className={c.cpScreen} style={{ width: DESIGN, scale: String(scale || 0.001) }} inert>
          <ReviewDashboard pick={SCRIPT[step]} />
          <svg className={cx(c.cpCursor, cursor.press && c.cpPress)} style={{ translate: `${cursor.x}px ${cursor.y}px` }} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 3.5 19 11l-6.2 1.6L9.6 18.6 5 3.5Z" />
          </svg>
        </div>
      </span>
    </span>
  );
}
