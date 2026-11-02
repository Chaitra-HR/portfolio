import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AsteriskGlyph } from '../../../components/ui/Asterisk';
import { cx } from '../../../lib/cx';
import s from './kit.module.css';

type EvidenceStatus = 'verified' | 'measured' | 'estimate' | 'unconfirmed';

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  verified: 'Verified',
  measured: 'Measured in testing',
  estimate: 'Estimate',
  unconfirmed: 'To confirm',
};

interface EvidenceProps {
  /** The claim itself, e.g. "47 questions". */
  children: ReactNode;
  /** Where the number comes from: source, method, period. */
  note: ReactNode;
  status?: EvidenceStatus;
}

/**
 * A number with its footnote. The asterisk opens a note on where the figure
 * comes from and how sure it is, so every claim can be checked in place.
 */
export function Evidence({ children, note, status = 'unconfirmed' }: EvidenceProps) {
  const [open, setOpen] = useState(false);
  const [dx, setDx] = useState(0);
  const root = useRef<HTMLSpanElement>(null);
  const pop = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();

  // keep the note inside the screen, 16px from either edge
  useLayoutEffect(() => {
    if (!open || !pop.current) return;
    const r = pop.current.getBoundingClientRect();
    const left = r.left - dx;
    const right = r.right - dx;
    const max = document.documentElement.clientWidth - 16;
    setDx(right > max ? Math.max(16 - left, max - right) : left < 16 ? 16 - left : 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span className={s.ev} ref={root}>
      {children}
      <button
        ref={button}
        type="button"
        className={s.evMark}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Source · ${STATUS_LABEL[status]}`}
        data-cursor-tooltip={open ? undefined : 'Source'}
        onClick={() => setOpen((v) => !v)}
      >
        <AsteriskGlyph />
      </button>
      {open && (
        <span id={id} ref={pop} className={s.evPop} style={{ '--dx': `${dx}px` }}>
          <span className={cx(s.evStatus, (status === 'estimate' || status === 'unconfirmed') && s.evOpen)}>{STATUS_LABEL[status]}</span>
          <span className={s.evNote}>{note}</span>
        </span>
      )}
    </span>
  );
}
