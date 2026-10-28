import { AsteriskGlyph } from '../../components/ui/Asterisk';
import m from '../wordmark.module.css';

export function ReframeCover() {
  return (
    <span className={m.wordmark} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFFFFF' }}>
      Reframe
      <AsteriskGlyph width={20} height={20} />
    </span>
  );
}
