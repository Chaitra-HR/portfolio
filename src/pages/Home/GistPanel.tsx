import { useRef } from 'react';
import { ReadWords } from '../../components/interactions/ReadWords';
import { caseStudies, sideProjects, type Project } from '../../data/projects';
import { useReadAlong } from '../../hooks/useReadAlong';
import { cx } from '../../lib/cx';
import { GistBuddy } from './GistBuddy';
import s from './Home.module.css';

const ALL: Project[] = [...caseStudies, ...sideProjects];

interface GistPanelProps {
  hot: string | null;
  hops: number;
}

/** "Let me save you a few clicks" — shows the summary of the project under the cursor (or focus), and its resting state otherwise. */
export function GistPanel({ hot, hops }: GistPanelProps) {
  return (
    <section className={cx(s.fn, 'rv')} style={{ '--i': 3 }} aria-live="polite" aria-label="The gist">
      <GistBuddy hot={hot !== null} hops={hops} />
      <div className={cx(s.layer, s.empty, hot === null && s.on)}>
        <p className={s.gistHello}>Let me save you a few clicks.</p>
        <p className={cx('mut', s.gistHint)}>Hover over a project. I’ll give you the gist.</p>
      </div>
      {ALL.map((p) => (
        <GistArticle key={p.slug} project={p} on={hot === p.slug} />
      ))}
    </section>
  );
}

/** One project's gist. While shown, it reads itself out word by word, a small ball hopping along. */
function GistArticle({ project: p, on }: { project: Project; on: boolean }) {
  const root = useRef<HTMLElement>(null);
  const ball = useRef<HTMLSpanElement>(null);
  useReadAlong(root, ball, on);

  return (
    <article ref={root} className={cx(s.layer, on && s.on)} aria-hidden={!on}>
      <span ref={ball} className={s.raBall} aria-hidden="true" />
      <p className={cx('lbl', s.lblPad)}>
        {p.kind === 'case' ? `Case study ${p.number}` : 'Side project'} · {p.status}
      </p>
      <h2 className={s.gistTitle}>
        <ReadWords text={p.title} />
      </h2>
      {p.kind === 'case' ? (
        <>
          <div className={s.ga}>
            <span className={s.k}>The problem</span>
            <p className={s.v}>
              <ReadWords text={p.gist.problem} />
            </p>
          </div>
          <div className={s.ga}>
            <span className={s.k}>Key decision</span>
            <p className={s.v}>
              <ReadWords text={p.gist.decision} />
            </p>
          </div>
          <div className={s.ga}>
            <span className={s.k}>Outcome</span>
            <p className={cx(s.v, s.strong)}>
              <ReadWords text={p.gist.outcome} />
            </p>
          </div>
        </>
      ) : (
        <div className={s.ga}>
          <span className={s.k}>In short</span>
          <p className={s.v}>
            <ReadWords text={p.gist} />
          </p>
        </div>
      )}
    </article>
  );
}
