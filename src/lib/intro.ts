import { prefersReducedMotion } from './scroll';

/*
 * The loading intro (components/interactions/Intro.tsx) plays on every full
 * page load (not on in-app navigation). Page entrances wait for it to start
 * revealing the page (`introDone`). The other 3D mascots wait for
 * `othersMayBoot`: on desktop that is as soon as the intro's own mascot is
 * ready (Home's sidebar mascot has to be ready to take over from it); on
 * phones and tablets, after the intro has gone, so nothing competes with it.
 */

/** Decided once, at startup: every load, unless reduced motion is on. */
export const introPlays = typeof window !== 'undefined' && !prefersReducedMotion();

/** The intro hands over to Home's sidebar at this size (and lets the others boot early). */
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
  // start fetching the 3D straight away, in parallel with the page
  void import('../components/interactions/glass/glassAsterisk');
}

export function finishIntro() {
  document.documentElement.classList.remove('intro-active');
  finish();
}

export function allowOthersToBoot() {
  allow();
}
