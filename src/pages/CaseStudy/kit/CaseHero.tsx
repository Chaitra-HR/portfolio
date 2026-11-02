import type { ReactNode } from 'react';
import engineer from '../../../assets/images/team/engineer.png';
import founderA from '../../../assets/images/team/founder-a.png';
import founderB from '../../../assets/images/team/founder-b.png';
import me from '../../../assets/images/team/me.png';
import teammate from '../../../assets/images/team/teammate.png';
import s from './kit.module.css';

const AVATARS = { engineer, founderA, founderB, me, teammate };

interface MetaRow {
  term: string;
  value: ReactNode;
}

interface CaseHeroProps {
  /** Goes first under the image, on its own row. */
  summary: ReactNode;
  meta: MetaRow[];
  /** The hero image, at the top of the column. */
  media?: ReactNode;
}

interface Member {
  avatar: keyof typeof AVATARS;
  /** Shown above their portrait on hover, focus or tap. */
  title: string;
}

/** The people on a study: grey portraits that come into colour with their title. */
export function TeamStack({ members, label }: { members: Member[]; label: string }) {
  return (
    <>
      <span className="sr-only">{label}</span>
      <ul className={s.team}>
        {members.map(({ avatar, title }, i) => (
          <li key={i}>
            <span className={s.member} tabIndex={0} role="img" aria-label={title}>
              <img src={AVATARS[avatar]} alt="" width="32" height="32" />
            </span>
            <span className={s.tip} aria-hidden="true">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Case-study opener: the hero image, then the overview and the facts. The title lives in `CaseBody`. */
export function CaseHero({ summary, meta, media }: CaseHeroProps) {
  return (
    <section id="cs-overview" className={s.hero}>
      {media}
      <dl className={`${s.meta} rv`} style={{ '--i': 3 }}>
        <div className={s.overview}>
          <dt>Overview</dt>
          <dd>{summary}</dd>
        </div>
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
