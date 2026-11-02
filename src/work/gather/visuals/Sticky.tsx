import type { ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import s from './Sticky.module.css';

interface StickyProps {
  /** Its colour comes from `--note`, usually through a friction or journey class. */
  className?: string;
  /** Degrees. Real notes never go on straight. */
  tilt?: number;
  children: ReactNode;
}

/** A sticky note: square paper, adhesive along the top, the free end lifting off the wall. */
export function Sticky({ className, tilt = 0, children }: StickyProps) {
  return (
    <div className={cx(s.sticky, className)} style={{ '--tilt': `${tilt}deg` }}>
      <div className={s.paper}>{children}</div>
    </div>
  );
}
