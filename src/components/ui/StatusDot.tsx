import { cx } from '../../lib/cx';
import s from './StatusDot.module.css';

/** Green "available / shipped" dot. Home's sidebar version pulses; elsewhere it has a soft ring. */
export function StatusDot({ pulse = false }: { pulse?: boolean }) {
  return <span className={cx(s.dot, pulse ? s.pulse : s.ring)} aria-hidden="true" />;
}
