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
  /** A list shows as chips, one per item. */
  value: ReactNode | string[];
}

interface CaseHeroProps {
  meta: MetaRow[];
  /** The hero image, at the top of the column. */
  media?: ReactNode;
}

interface Member {
  avatar: keyof typeof AVATARS;
  /** Shown above their portrait on hover, focus or tap. */
  title: string;
}

/** The people on a study, in colour: the one you point at lifts with its title and the rest go grey. */
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

/** Case-study opener under the title and subtitle: the facts in two columns, then the hero image. The title lives in `CaseBody`. */
export function CaseHero({ meta, media }: CaseHeroProps) {
  return (
    <>
      <div className={s.head}>
        <dl className={`${s.meta} rv`} style={{ '--i': 1 }}>
          {meta.map((row) => (
            <div key={row.term}>
              <dt>{row.term}</dt>
              <dd>
                {Array.isArray(row.value) ? (
                  <ul className={s.chips}>
                    {row.value.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {media && <div className={s.hero}>{media}</div>}
    </>
  );
}
