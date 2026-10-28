import { useRef } from 'react';
import { Link } from 'react-router';
import { ReadWords } from '../../components/interactions/ReadWords';
import { caseStudyPath, type CaseStudyProject } from '../../data/projects';
import { useReadAlong } from '../../hooks/useReadAlong';
import { cx } from '../../lib/cx';
import { workArt } from '../../work';
import { usePerched } from './perch';
import s from './Home.module.css';

interface WorkTileProps {
  project: CaseStudyProject;
  /** CSS aspect-ratio of the art field on tablet and desktop (phones use 1/1). */
  aspect: string;
  on: boolean;
  onHover: (slug: string) => void;
  onLeave: () => void;
}

export function WorkTile({ project, aspect, on, onHover, onLeave }: WorkTileProps) {
  const Cover = workArt[project.slug]?.Cover;
  const hover = () => onHover(project.slug);
  const bubble = useRef<HTMLSpanElement>(null);
  const ball = useRef<HTMLSpanElement>(null);
  // phones: the travelling mascot is perched here, reading the gist out
  const reading = usePerched(project.slug);
  useReadAlong(bubble, ball, reading);

  return (
    <Link className={cx(s.tile, on && s.on)} to={caseStudyPath(project.slug)} onMouseEnter={hover} onFocus={hover} onMouseLeave={onLeave} onBlur={onLeave} data-cursor-tooltip="View">
      <span className={s.img} style={{ background: project.color, '--aspect': aspect }} aria-hidden="true">
        {Cover && <Cover className={s.in} />}
      </span>
      <span className={s.meta}>
        <span>
          <span className={s.t}>{project.cardTitle ?? project.title}</span>
          <span className={s.s}>{project.summary}</span>
          <span className={s.why}>{project.proves}</span>
        </span>
        <span className={s.p}>{project.status}</span>
      </span>
      {/* phones: the gist, told by the travelling mascot perched on the seat */}
      <span className={cx(s.tell, reading && s.reading)}>
        <span className={s.seat} data-seat={project.slug} />
        <span ref={bubble} className={s.bubble}>
          <span ref={ball} className={s.raBall} />
          <span className={s.bk}>The problem</span>
          <span className={s.bv}>
            <ReadWords text={project.gist.problem} />
          </span>
          <span className={s.bk}>Key decision</span>
          <span className={s.bv}>
            <ReadWords text={project.gist.decision} />
          </span>
          <span className={s.bk}>Outcome</span>
          <span className={cx(s.bv, s.strong)}>
            <ReadWords text={project.gist.outcome} />
          </span>
        </span>
      </span>
    </Link>
  );
}
