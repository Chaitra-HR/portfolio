import { Link } from 'react-router';
import { site } from '../../data/site';
import { cx } from '../../lib/cx';
import { smoothScrollTo } from '../../lib/scroll';
import { ExternalArrow } from '../ui/ExternalArrow';
import { Pill } from '../ui/Pill';
import { SmartLink } from '../ui/SmartLink';
import { StatusDot } from '../ui/StatusDot';
import s from './SiteHeader.module.css';

interface SiteHeaderProps {
  current?: 'work' | 'about';
  /** Home's nav card instead (Work, About, LinkedIn), a little wider than Home's. */
  card?: boolean;
}

/** Top navigation for About, case studies and fallback pages. Home has its own sidebar. */
export function SiteHeader({ current, card = false }: SiteHeaderProps) {
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
            LinkedIn
            <ExternalArrow />
          </Pill>
        </nav>
      </header>
    );
  }

  return (
    <header className={cx(s.nav, s.narrow)}>
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
