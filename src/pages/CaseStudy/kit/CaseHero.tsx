import type { ReactNode } from 'react';
import { GradientBuddy } from '../../../components/interactions/GradientBuddy';
import { StatusDot } from '../../../components/ui/StatusDot';
import type { CaseStudyProject } from '../../../data/projects';
import s from './kit.module.css';

export interface MetaRow {
  term: string;
  value: ReactNode;
}

interface CaseHeroProps {
  project: CaseStudyProject;
  /** Wrap the closing phrase in <span className="g"> to grey it out. */
  title: ReactNode;
  summary: ReactNode;
  meta: MetaRow[];
}

/** Value for a "Status" meta row: the dot plus the project's status. */
export function StatusValue({ project }: { project: CaseStudyProject }) {
  return (
    <span className={s.status}>
      <StatusDot />
      {project.status}
    </span>
  );
}

/** Case-study opener: mascot, index + status, headline, summary and the facts list. */
export function CaseHero({ project, title, summary, meta }: CaseHeroProps) {
  return (
    <section className={s.hero}>
      <div>
        <GradientBuddy className={`${s.buddy} rv`} surface="#FFFFFF" aria-hidden="true" />
        <p className={`${s.idx} rv`} style={{ '--i': 1 }}>
          <b>Case study {project.number}</b>
          <StatusDot />
          {project.status}
        </p>
        <h1 className={`${s.h1} rv`} style={{ '--i': 2 }}>
          {title}
        </h1>
        <p className={`${s.sub} rv`} style={{ '--i': 3 }}>
          {summary}
        </p>
      </div>
      <dl className={`${s.meta} rv`} style={{ '--i': 4 }}>
        {meta.map((row) => (
          <div key={row.term}>
            <dt>{row.term}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
