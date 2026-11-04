import s from './ExternalArrow.module.css';

/** A fine ↗ after a link that leaves the site. It nudges out along its own diagonal when its link is hovered or focused. */
export function ExternalArrow() {
  return (
    <svg className={s.arrow} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
    </svg>
  );
}
