import { useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Notice } from '../../pages/CaseStudy/kit';
import g from './Gather.module.css';

interface FigureProps {
  /** Most visuals sit straight on the page; `field` is for screens that need a surface. */
  tone?: 'plain' | 'field';
  caption?: ReactNode;
  /** What the reader should take from it, under the caption. */
  notice?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** A visual on its field, with a short caption. */
export function Figure({ tone = 'plain', caption, notice, className, style, children }: FigureProps) {
  return (
    <figure className={cx(g.fig, className)} style={style}>
      <div className={g[tone]}>{children}</div>
      {caption && <figcaption className={g.cap}>{caption}</figcaption>}
      {notice && <Notice>{notice}</Notice>}
    </figure>
  );
}

/** One solution's old and new, one tap apart. Opens on the new design. */
export function BeforeAfter({ before, after, caption }: { before: ReactNode; after: ReactNode; caption?: ReactNode }) {
  const [view, setView] = useState<'before' | 'after'>('after');
  const [touched, setTouched] = useState(false);
  return (
    <figure className={g.fig}>
      <div className={g.field}>
        <div className={g.toggle} role="group" aria-label="Compare before and after">
          {(['before', 'after'] as const).map((option) => (
            <button key={option} type="button" className={view === option ? g.toggleOn : undefined} aria-pressed={view === option} onClick={() => { setTouched(true); setView(option); }}>
              {option === 'before' ? 'Before' : 'After'}
            </button>
          ))}
        </div>
        <div key={view} className={touched ? g.swap : undefined}>
          {view === 'before' ? before : after}
        </div>
      </div>
      {caption && <figcaption className={g.cap}>{caption}</figcaption>}
    </figure>
  );
}

/** What changed, in plain "instead of" lines. */
export function Benefits({ items }: { items: ReactNode[] }) {
  return (
    <>
      <p className={g.noticeHead}>What to notice</p>
      <ol className={g.benefits}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    </>
  );
}

/** A label next to a figure that hasn't been verified yet. */
export function Reported({ children }: { children: ReactNode }) {
  return <span className={g.reported}>{children}</span>;
}

/** A visual or passage that hasn't been supplied yet. */
export function ToAdd({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <figure className={cx(g.fig, className)}>
      <div className={g.todo}>
        <Reported>To add</Reported>
        {children}
      </div>
    </figure>
  );
}
