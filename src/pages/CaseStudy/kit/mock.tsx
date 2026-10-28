import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import s from './kit.module.css';

/** Primitives for drawing simple product mock-ups in HTML inside a MediaPanel. */
export function Mock({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className={cx(s.mock, className)} style={style}>
      {children}
    </div>
  );
}

export function MockLabel({ children }: { children: ReactNode }) {
  return <p className={s.mkH}>{children}</p>;
}

export function MockQuestion({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p className={s.mkQ} style={style}>
      {children}
    </p>
  );
}

export function MockOption({ children, selected }: { children: ReactNode; selected?: boolean }) {
  return <span className={cx(s.opt, selected && s.sel)}>{children}</span>;
}

/** Progress bar; `value` is 0–100 and fills with `color`. */
export function MockProgress({ value, color, style }: { value: number; color: string; style?: CSSProperties }) {
  return <span className={s.barr} style={{ background: `linear-gradient(90deg, ${color} ${value}%, #EEEEEE ${value}%)`, ...style }} />;
}

export function MockField({ width }: { width?: string }) {
  return <span className={s.fld} style={width ? { width } : undefined} />;
}

/** Struck-through question a client no longer has to answer. */
export function MockSkipped({ children }: { children: ReactNode }) {
  return <p className={s.skip}>{children}</p>;
}
