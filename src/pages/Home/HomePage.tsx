import { useEffect, useReducer, useRef } from 'react';
import { TravelGuide } from '../../components/interactions/TravelGuide';
import { BentoFooter } from '../../components/layout/BentoFooter';
import { usePageMeta } from '../../components/layout/usePageMeta';
import { caseStudies, sideProjects, type CaseStudyProject } from '../../data/projects';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { DESKTOP_QUERY } from '../../lib/intro';
import { SideProjectCard } from './SideProjectCard';
import { Sidebar } from './Sidebar';
import { PhoneGuide } from './PhoneGuide';
import { Testimonials } from './Testimonials';
import { WorkTile } from './WorkTile';
import s from './Home.module.css';

/**
 * The two work columns: [slug, aspect-ratio], top to bottom. Each column pairs
 * a near-square card with a shorter landscape one, so the columns end level.
 */
const COLUMNS: Array<Array<[slug: string, aspect: string]>> = [
  [
    ['finscribe', '24/25'],
    ['website-revamp', '6/5'],
  ],
  [
    ['gather', '6/5'],
    ['compliance-trust', '24/25'],
  ],
];

/** Matches the phone breakpoint in Home.module.css. */
const PHONE = '(max-width: 809.98px)';
/** ms after leaving a project before the gist panel returns to rest. */
const LEAVE_DELAY = 150;

const bySlug = new Map(caseStudies.map((p) => [p.slug, p] as const));

export default function HomePage() {
  // `hot` is the project under the cursor (or focus); null shows the panel's
  // resting state. `hops` counts new projects so the mascot's hop can restart.
  const [{ hot, hops }, setHot] = useReducer(
    (state: { hot: string | null; hops: number }, slug: string | null) =>
      state.hot === slug ? state : { hot: slug, hops: slug ? state.hops + 1 : state.hops },
    { hot: null, hops: 0 },
  );
  // Leaving clears after a beat, so gliding across the gap to the next card doesn't flash the resting state.
  const leaveTimer = useRef(0);
  const hover = (slug: string) => {
    clearTimeout(leaveTimer.current);
    setHot(slug);
  };
  const leave = () => {
    clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHot(null), LEAVE_DELAY);
  };
  useEffect(() => () => clearTimeout(leaveTimer.current), []);
  // phones: a travelling mascot tells each case study's gist
  const phone = useMediaQuery(PHONE);
  // desktop: one mascot, moving between the sidebar and the footer
  const desktop = useMediaQuery(DESKTOP_QUERY);

  usePageMeta(
    'Chaitra Rao — Product designer',
    'Product designer for high-trust financial products — onboarding, compliance and advisory tools for regulated firms. Six years running Capital Design Studio, now building FinScribe.',
  );

  return (
    <div className={s.pg}>
      <div className={s.top}>
        <Sidebar hot={hot} hops={hops} />
        <main id="main" tabIndex={-1} className={s.main} aria-label="Work">
          <section id="work" className={s.sec} aria-labelledby="work-h">
            {/* the grid's heading, for screen readers and the outline (the tiles carry their own titles) */}
            <h2 id="work-h" className="sr-only">
              Case studies
            </h2>
            <div className={s.mas}>
              {COLUMNS.map((column, i) => (
                <div key={i} className={s.mcol}>
                  {column.map(([slug, aspect]) => {
                    const project = bySlug.get(slug) as CaseStudyProject;
                    return <WorkTile key={slug} project={project} aspect={aspect} on={hot === slug} onHover={hover} onLeave={leave} />;
                  })}
                </div>
              ))}
            </div>
          </section>

          <section id="side" className={s.sec} aria-label="Side projects">
            <div className={s.sh}>
              <h2>Side projects</h2>
              <span className="mut">Outside client work</span>
            </div>
            <div className={s.sp}>
              {sideProjects.map((p) => (
                <SideProjectCard key={p.slug} project={p} on={hot === p.slug} onHover={hover} onLeave={leave} />
              ))}
            </div>
          </section>

          <Testimonials />
        </main>
      </div>
      <BentoFooter
        className={s.footer}
        heading={
          <>
            You’ve made it this far.
            <br />
            {/* non-breaking space keeps "hello." from being left alone on phones */}
            Might as well say{' '}hello.
          </>
        }
        body="Whether you’re building a team or something new, I’d love to be part of the conversation."
      />
      {phone && <PhoneGuide />}
      {desktop && <TravelGuide from="gist" />}
    </div>
  );
}
