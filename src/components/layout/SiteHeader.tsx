import { Link } from 'react-router';
import avatar from '../../assets/images/about/avatar.jpg';
import avatarZoom from '../../assets/images/about/avatar-zoom.jpg';
import { site } from '../../data/site';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useScrolled } from '../../hooks/useScrolled';
import { cx } from '../../lib/cx';
import { ExternalArrow } from '../ui/ExternalArrow';
import { Pill } from '../ui/Pill';
import mail from './FooterParts.module.css';
import s from './SiteHeader.module.css';

interface SiteHeaderProps {
  current?: 'work' | 'about';
  className?: string;
}

/**
 * Top bar for About, the case studies and fallback pages (Home has its own sidebar): who, on the left, with the
 * photo from About; Work and About as pills, the current one filled; then a rule and the email, copied on click,
 * since there is no contact page. On phones it is Home's nav card instead (Work, About, LinkedIn), so the top of every
 * page matches Home there. Only one of the two is displayed at a time.
 */
export function SiteHeader({ current, className }: SiteHeaderProps) {
  const [copied, copy] = useCopyToClipboard();
  const scrolled = useScrolled();
  const link = (key: SiteHeaderProps['current']) => (current === key ? { className: cx(s.link, s.on), 'aria-current': 'page' as const } : { className: s.link });

  const pill = (key: SiteHeaderProps['current']) => (current === key ? { className: cx(s.pl, s.plOn), 'aria-current': 'page' as const } : { className: s.pl });

  return (
    <>
      <header className={cx(s.phone, className)}>
        <nav className={cx(s.card, scrolled && s.glass)} aria-label="Primary">
          <Link to="/" {...pill('work')}>
            Work
          </Link>
          <Link to="/about" {...pill('about')}>
            About
          </Link>
          <Pill fill="none" className={s.ext} href={site.linkedin} aria-label="LinkedIn (opens in a new tab)">
            LinkedIn
            <ExternalArrow />
          </Pill>
        </nav>
      </header>
      <header className={cx(s.bar, className)}>
        <Link className={s.me} to="/">
          {/* on hover a closer crop slides up over the photo, as on arisacoba.com */}
          <span className={s.face}>
            <img src={avatar} width={44} height={44} alt="" loading="lazy" />
            <img className={s.zoom} src={avatarZoom} width={44} height={44} alt="" loading="lazy" />
          </span>
          <span className={s.who}>
            <b>{site.name}</b>
            <span>Product designer</span>
          </span>
        </Link>
        <nav className={s.links} aria-label="Primary">
          <Link to="/" {...link('work')}>
            Work
          </Link>
          <Link to="/about" {...link('about')}>
            About
          </Link>
          <i className={s.rule} aria-hidden="true" />
          <button type="button" className={s.mail} onClick={() => copy(site.email)} aria-label={copied ? 'Email copied' : 'Copy email'} data-cursor-tooltip={copied ? 'Copied' : 'Copy email'}>
            {/* the same envelope as the footer's Copy email: its flap flips open once copied */}
            <svg className={cx(mail.mail, copied && mail.open)} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="8" width="18" height="12" rx="2.5" />
              <path className={mail.flap} d="M3.6 8.6 12 14.2l8.4-5.6" />
            </svg>
          </button>
          <span className={cx(s.copied, copied && s.copiedOn)} role="status">
            {copied ? 'Email copied' : ''}
          </span>
        </nav>
      </header>
    </>
  );
}
