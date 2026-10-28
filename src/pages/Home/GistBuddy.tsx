import { GradientBuddy } from '../../components/interactions/GradientBuddy';
import { cx } from '../../lib/cx';
import s from './Home.module.css';

interface GistBuddyProps {
  /** A project is hovered: shrink into the corner and grin. */
  hot: boolean;
  /** Increments on every new hover so the hop animation restarts. */
  hops: number;
}

/** Home's gist-panel mascot: the same 3D glass asterisk as the footers, watching the cursor. */
export function GistBuddy({ hot, hops }: GistBuddyProps) {
  return (
    <div className={cx(s.bud, hot && s.hot, hops > 0 && (hops % 2 ? s.ha : s.hb))} aria-hidden="true">
      <GradientBuddy className={s.budBody} mouth={hot ? 'grin' : 'rest'} data-buddy="gist" />
    </div>
  );
}
