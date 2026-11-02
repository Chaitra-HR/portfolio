import { Link } from 'react-router';
import { caseStudyPath, neighbours, type CaseStudyProject } from '../../../data/projects';
import { workArt } from '../../../work';
import s from './MoreCaseStudies.module.css';

function Tile({ project }: { project: CaseStudyProject }) {
  const Art = workArt[project.slug]?.Cover;
  return (
    <Link className={s.tile} to={caseStudyPath(project.slug)} data-cursor-tooltip="View">
      <span className={s.th} style={{ background: project.color }} aria-hidden="true">
        {Art && <Art className={s.art} />}
      </span>
      <span className={s.title}>
        {project.title}
        <span className={s.go} aria-hidden="true">
          →
        </span>
      </span>
      <span className={s.summary}>{project.summary}</span>
    </Link>
  );
}

/** The next two studies as Home's tiles in small: cover first, title below. */
export function MoreCaseStudies({ current }: { current: string }) {
  const pair = neighbours(current);
  if (!pair) return null;

  return (
    <nav className={s.more} aria-labelledby="more-studies">
      <h2 id="more-studies" className={s.head}>
        More case studies
      </h2>
      <div className={s.list}>
        <Tile project={pair.next} />
        <Tile project={pair.previous} />
      </div>
    </nav>
  );
}
