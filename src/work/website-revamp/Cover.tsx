import { cx } from '../../lib/cx';
import c from '../covers.module.css';
import type { ArtProps } from '../types';

export function WebsiteCover({ className }: ArtProps) {
  return (
    <span className={cx(c.cover, c.ws, className)}>
      <span>
        <span className={c.wsK}>
          Asked before the redesign
        </span>
        <span className={c.wsH}>
          Who is this
          <br />
          site for?
        </span>
      </span>
    </span>
  );
}
