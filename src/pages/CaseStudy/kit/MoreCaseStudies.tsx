import { Link } from 'react-router';
import { caseStudyPath, neighbours, type CaseStudyProject } from '../../../data/projects';
import { cx } from '../../../lib/cx';
import { workArt } from '../../../work';
import s from './MoreCaseStudies.module.css';

function Thumb({ project }: { project: CaseStudyProject }) {
  const Art = workArt[project.slug]?.Cover;
  return (
    <span className={s.th} style={{ background: project.color }} aria-hidden="true">
      {Art && <Art className={s.art} />}
    </span>
  );
}

/** Previous / next case-study cards, wrapping around the project list. */
export function MoreCaseStudies({ current }: { current: string }) {
  const pair = neighbours(current);
  if (!pair) return null;
  const { previous, next } = pair;

  return (
    <nav className={s.list} aria-label="More case studies">
      <Link className={cx('card', s.card)} to={caseStudyPath(previous.slug)}>
        <Thumb project={previous} />
        <span className={s.text}>
          <span className="lbl">← Previous · Case study {previous.number}</span>
          <span className={s.title}>{previous.title}</span>
          <span className={s.summary}>{previous.summary}</span>
        </span>
      </Link>
      <Link className={cx('card', s.card, s.next)} to={caseStudyPath(next.slug)}>
        <span className={s.text}>
          <span className="lbl">Next · Case study {next.number} →</span>
          <span className={s.title}>{next.title}</span>
          <span className={s.summary}>{next.summary}</span>
        </span>
        <Thumb project={next} />
      </Link>
    </nav>
  );
}
