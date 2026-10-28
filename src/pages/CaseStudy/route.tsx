import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { BentoFooter } from '../../components/layout/BentoFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { usePageMeta } from '../../components/layout/usePageMeta';
import { findCaseStudy } from '../../data/projects';
import { hiringPitch } from '../../data/site';
import { caseStudyPages } from '../../work';
import { NotFound } from '../NotFound/NotFound';
import { MoreCaseStudies } from './kit/MoreCaseStudies';
import s from './CaseStudy.module.css';

/** Resolves the slug and loads that study's chunk before the page renders. */
export async function loader({ params }: LoaderFunctionArgs) {
  const project = findCaseStudy(params.slug);
  const load = project && caseStudyPages[project.slug];
  const Study = load ? (await load()).default : null;
  return { project, Study };
}

export function Component() {
  const { project, Study } = useLoaderData<typeof loader>();
  if (!project) return <NotFound />;
  if (!Study) return <NotFound title={`${project.title} — case study`} message="This case study isn’t published yet." />;
  return <CaseStudyPage project={project} Study={Study} />;
}

type Loaded = Awaited<ReturnType<typeof loader>>;

function CaseStudyPage({ project, Study }: { project: NonNullable<Loaded['project']>; Study: NonNullable<Loaded['Study']> }) {
  usePageMeta(`${project.title} — ${project.summary} · Chaitra Rao`, `Case study ${project.number}: ${project.gist.problem} ${project.gist.decision}`);

  return (
    <div className={s.pg}>
      <SiteHeader current="work" width="wide" />
      <main id="main" tabIndex={-1} className={s.wrap} aria-label="Case study">
        {/* key: a fresh mount (and reveal) when moving between studies */}
        <Study key={project.slug} project={project} />
        <MoreCaseStudies current={project.slug} />
      </main>
      <BentoFooter
        className={s.footer}
        heading={hiringPitch.heading}
        body={hiringPitch.body}
      />
    </div>
  );
}
