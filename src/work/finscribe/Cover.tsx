import { AsteriskGlyph } from '../../components/ui/Asterisk';
import { cx } from '../../lib/cx';
import c from '../covers.module.css';
import type { ArtProps } from '../types';

export function FinScribeCover({ className }: ArtProps) {
  return (
    <span className={cx(c.cover, className)}>
      <AsteriskGlyph className={c.fsMark} />
    </span>
  );
}
