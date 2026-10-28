import type { SVGProps } from 'react';

const ANGLES = [0, 60, 120, 180, 240, 300];

/**
 * The six rounded arms of the asterisk, in a 200×200 viewBox.
 * `mascot` arms are centred by their own transform (use inside masks/clips);
 * `glyph` arms are slimmer and expect a parent `translate(100 100)`.
 */
export function AsteriskArms({ shape = 'mascot' }: { shape?: 'mascot' | 'glyph' }) {
  if (shape === 'glyph') {
    return ANGLES.map((a) => (
      <rect key={a} x="-19" y="-94" width="38" height="94" rx="19" transform={a ? `rotate(${a})` : undefined} />
    ));
  }
  return ANGLES.map((a) => (
    <rect key={a} x="-21" y="-88" width="42" height="88" rx="21" transform={`translate(100 100) rotate(${a})`} />
  ));
}

/** The small gradient asterisk used as an inline mark. */
export function AsteriskGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false" {...props}>
      <g fill="url(#ast-grad)" transform="translate(100 100)">
        <AsteriskArms shape="glyph" />
      </g>
    </svg>
  );
}
