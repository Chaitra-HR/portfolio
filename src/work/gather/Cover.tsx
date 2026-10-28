import { cx } from '../../lib/cx';
import c from '../covers.module.css';
import type { ArtProps } from '../types';

export function GatherCover({ className }: ArtProps) {
  return (
    <span className={cx(c.cover, className)}>
      <span className={c.gaStack}>
        <span className={cx(c.gaPill, c.gaOld)}>One long, fixed intake</span>
        <span className={cx(c.gaPill, c.gaNow)}>Only what applies</span>
        <span className={cx(c.gaPill, c.gaDone)}>Plan-ready ✓</span>
      </span>
    </span>
  );
}
