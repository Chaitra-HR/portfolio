import type { ButtonHTMLAttributes, PointerEvent } from 'react';
import { cx } from '../../lib/cx';
import { SmartLink, type SmartLinkProps } from './SmartLink';
import s from './Pill.module.css';

type Fill = 'white' | 'lilac' | 'grey' | 'none';

type PillProps = { fill?: Fill } & (SmartLinkProps | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }));

/** Start the hover fill at the point where the pointer came in. */
function onEnter(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const fill = el.firstElementChild as HTMLElement | null;
  const r = el.getBoundingClientRect();
  // move the (still invisible) circle's centre without animating it, so only the radius grows
  if (fill) fill.style.transition = 'none';
  el.style.setProperty('--fx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  el.style.setProperty('--fy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  void fill?.offsetWidth;
  if (fill) fill.style.transition = '';
  el.classList.add(s.hot);
}
function onLeave(e: PointerEvent<HTMLElement>) {
  e.currentTarget.classList.remove(s.hot);
}

/** The rounded call-to-action used on every page. Renders a link when given `href`. */
export function Pill({ fill = 'white', className, children, ...rest }: PillProps) {
  const classes = cx(s.pill, s[fill], className);
  const inner = (
    <>
      <span className={s.fill} aria-hidden="true" />
      <span className={s.label}>{children}</span>
    </>
  );
  const motion = { onPointerEnter: onEnter, onPointerLeave: onLeave };
  if (typeof rest.href === 'string') {
    return (
      <SmartLink {...(rest as SmartLinkProps)} {...motion} className={classes}>
        {inner}
      </SmartLink>
    );
  }
  return (
    <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} {...motion} className={classes}>
      {inner}
    </button>
  );
}
