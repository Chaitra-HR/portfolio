import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { CustomCursor } from '../components/interactions/CustomCursor';
import { Intro } from '../components/interactions/Intro';
import { SvgDefs } from '../components/ui/SvgDefs';
import { startSmoothScroll } from '../lib/scroll';

/** Wraps every route: skip link, shared SVG defs, the loading intro, custom cursor and scroll handling. */
export function RootLayout() {
  useEffect(startSmoothScroll, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SvgDefs />
      <Outlet />
      <Intro />
      <CustomCursor />
      {/* New pages start at the top (or at #hash); back/forward restores position. */}
      <ScrollRestoration />
    </>
  );
}
