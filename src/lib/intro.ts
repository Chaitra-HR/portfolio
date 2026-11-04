import { prefersReducedMotion } from './scroll';

/*
 * The loading intro (components/interactions/Intro.tsx) plays on every full
 * page load (not on in-app navigation). Page entrances wait for it to start
 * revealing the page (`introDone`); below the desktop layout it is quick (about a second). The other 3D mascots wait for
 * `othersMayBoot`: on desktop that is as soon as the intro's own mascot is
 * ready (Home's sidebar mascot has to be ready to take over from it); on
 * phones and tablets, after the intro has gone, so nothing competes with it.
 */

/** Decided once, at startup: every load, unless reduced motion is on. */
export const introPlays = typeof window !== 'undefined' && !prefersReducedMotion();

/** The desktop layout: Home's sticky sidebar, which the intro hands over to, and the case-study margin. */
export const DESKTOP_QUERY = '(min-width: 1200px)';

let finish: () => void = () => {};
/** Resolves when the intro starts revealing the page (at once if it doesn't play). */
export const introDone = new Promise<void>((resolve) => {
  finish = resolve;
});

let allow: () => void = () => {};
/** Resolves when the other mascots may boot their 3D (at once if the intro doesn't play). */
export const othersMayBoot = new Promise<void>((resolve) => {
  allow = resolve;
});

if (!introPlays) {
  finish();
  allow();
} else {
  // page entrances (.rv) hold until the intro reveals the page
  document.documentElement.classList.add('intro-active');
  // desktop: start fetching the 3D straight away, in parallel with the page (phones show the flat body in the
  // quick intro, and their mascots fetch the 3D after it, so nothing competes with the page's first paint)
  if (window.matchMedia(DESKTOP_QUERY).matches) void import('../components/interactions/glass/glassAsterisk');
}

export function finishIntro() {
  document.documentElement.classList.remove('intro-active');
  finish();
}

export function allowOthersToBoot() {
  allow();
}
