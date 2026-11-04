import { Link } from 'react-router';
import { CopyEmailButton } from '../../components/layout/FooterParts';
import { ExternalArrow } from '../../components/ui/ExternalArrow';
import { Pill } from '../../components/ui/Pill';
import { useScrolled } from '../../hooks/useScrolled';
import { StatusDot } from '../../components/ui/StatusDot';
import { caseStudyPath } from '../../data/projects';
import { site } from '../../data/site';
import { useMelbourneTime } from '../../hooks/useMelbourneTime';
import { cx } from '../../lib/cx';
import { smoothScrollToTop } from '../../lib/scroll';
import { GistPanel } from './GistPanel';
import s from './Home.module.css';

interface SidebarProps {
  hot: string | null;
  hops: number;
}

export function Sidebar({ hot, hops }: SidebarProps) {
  const { hm, ap } = useMelbourneTime(15000);
  /* on phones the nav is pinned, and turns to glass once the page moves under it */
  const scrolled = useScrolled();

  return (
    <aside className={s.sb} aria-label="Chaitra Rao">
      <nav className={cx(s.card, s.nav, scrolled && s.glass, 'rv')} aria-label="Primary">
        {/* Work: the top of Home (on phones the case studies sit below the intro) */}
        <a className={cx(s.nl, s.on)} href="/" aria-current="true" onClick={smoothScrollToTop}>
          Work
        </a>
        <Link className={s.nl} to="/about">
          About
        </Link>
        <Pill fill="none" className={s.ext} href={site.linkedin} aria-label="LinkedIn (opens in a new tab)">
          LinkedIn
          <ExternalArrow />
        </Pill>
      </nav>

      <header className={cx(s.card, s.intro, 'rv')} style={{ '--i': 1 }}>
        <h1 className={s.name}>{site.name}</h1>
        <p className={s.pitch}>Product &amp; Web Designer with 6+ years of experience designing digital products and websites.</p>
        <p className={s.pitch}>
          Currently running{' '}
          <Link className={s.inl} to="/about">
            Capital Design Studio
          </Link>{' '}
          and building{' '}
          <Link className={s.inl} to={caseStudyPath('finscribe')}>
            FinScribe
          </Link>
          , an AI marketing companion for financial advisors.
        </p>
        <div className={s.ctas}>
          <CopyEmailButton />
          <Pill fill="lilac" href={site.resume}>
            Resume
          </Pill>
        </div>
      </header>

      <section className={cx(s.card, s.clock, 'rv')} style={{ '--i': 2 }} aria-label="Local time and availability">
        <p>
          {hm} {ap}
          <span className="mut"> / Melbourne</span>
        </p>
        <span className={s.st}>
          <StatusDot pulse />
          Open to roles
        </span>
      </section>

      <div id="home-gist" className={s.more}>
        <GistPanel hot={hot} hops={hops} />
      </div>
    </aside>
  );
}
