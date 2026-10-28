/** The asterisk gradient, defined once for every SVG on the page (`url(#ast-grad)`). */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ast-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--ast-1)' }} />
          <stop offset=".5" style={{ stopColor: 'var(--ast-2)' }} />
          <stop offset="1" style={{ stopColor: 'var(--ast-3)' }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
