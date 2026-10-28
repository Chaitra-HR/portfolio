import { Link } from 'react-router';
import { site } from '../../data/site';
import { cx } from '../../lib/cx';
import { smoothScrollTo } from '../../lib/scroll';
import { Pill } from '../ui/Pill';
import { SmartLink } from '../ui/SmartLink';
import { StatusDot } from '../ui/StatusDot';
import s from './SiteHeader.module.css';

interface SiteHeaderProps {
  current?: 'work' | 'about';
  /** Matches the page's content column: About is 1020px, case studies 1180px. */
  width?: 'narrow' | 'wide';
  /** Home's nav card instead (Work, About, LinkedIn), a little wider than Home's. */
  card?: boolean;
}

/** Top navigation for About, case studies and fallback pages. Home has its own sidebar. */
export function SiteHeader({ current, width = 'narrow', card = false }: SiteHeaderProps) {
  const link = (key: SiteHeaderProps['current']) =>
    current === key ? { className: s.on, 'aria-current': 'page' as const } : {};
  const pill = (key: SiteHeaderProps['current']) =>
    current === key ? { className: cx(s.cl, s.con), 'aria-current': 'page' as const } : { className: s.cl };

  if (card) {
    return (
      <header className={s.cardWrap}>
        <nav className={s.cardNav} aria-label="Primary">
          <Link to="/" {...pill('work')}>
            Work
          </Link>
          <Link to="/about" {...pill('about')}>
            About
          </Link>
          <Pill fill="none" className={s.cext} href={site.linkedin} aria-label="LinkedIn (opens in a new tab)">
            <span className={s.li} aria-hidden="true">
              in
            </span>
            LinkedIn
          </Pill>
        </nav>
      </header>
    );
  }

  return (
    <header className={cx(s.nav, s[width])}>
      <Link className={s.brand} to="/">
        {site.name}
      </Link>
      <nav className={s.links} aria-label="Primary">
        <Link to="/" {...link('work')}>
          Work
        </Link>
        <Link to="/about" {...link('about')}>
          About
        </Link>
        <SmartLink href={site.linkedin}>LinkedIn</SmartLink>
      </nav>
      <a className={s.talk} href="#contact" onClick={smoothScrollTo('contact')}>
        <StatusDot />
        Let’s talk<span className={s.note}>· open to roles</span>
      </a>
    </header>
  );
}
