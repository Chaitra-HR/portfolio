/// <reference types="vite/client" />
import 'react';

declare module 'react' {
  interface CSSProperties {
    /** Allow CSS custom properties in style objects, e.g. { '--i': 2 }. */
    [key: `--${string}`]: string | number | undefined;
  }
}
