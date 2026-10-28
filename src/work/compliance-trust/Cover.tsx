import { cx } from '../../lib/cx';
import c from '../covers.module.css';
import type { ArtProps } from '../types';

export function ComplianceCover({ className }: ArtProps) {
  return (
    <span className={cx(c.cover, className)}>
      <span className={c.cp}>
        <span className={c.cpBack} />
        <span className={c.cpFront}>
          <span className={cx(c.cpTag, c.cpFlag)}>Flagged</span>
          <span className={c.cpRow}>
            <span className={cx(c.cpTag, c.cpWhy)}>Why</span>
            <span className={c.cpTag}>+ Fix</span>
          </span>
        </span>
      </span>
    </span>
  );
}
