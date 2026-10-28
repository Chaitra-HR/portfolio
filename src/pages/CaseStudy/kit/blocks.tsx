import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import s from './kit.module.css';

interface CaseSectionProps {
  /** Becomes the element id `cs-<id>` and the scroll-spy key. */
  id: string;
  label: string;
  title: ReactNode;
  /** Let content run the full article width (headings stay at 720px). */
  wide?: boolean;
  /** Tighter bottom spacing for the final section. */
  last?: boolean;
  /** Grey the heading out as a placeholder. */
  placeholderTitle?: boolean;
  children?: ReactNode;
}

/** A labelled section of the case-study article. */
export function CaseSection({ id, label, title, wide, last, placeholderTitle, children }: CaseSectionProps) {
  return (
    <section id={`cs-${id}`} data-sec={id} className={cx(s.sec, wide && s.wide, last && s.last)}>
      <p className="lbl">{label}</p>
      <h2 className={placeholderTitle ? s.ph : undefined}>{title}</h2>
      {children}
    </section>
  );
}

/** Body paragraph. `placeholder` greys the whole paragraph. */
export function Text({ children, placeholder }: { children: ReactNode; placeholder?: boolean }) {
  return <p className={cx(s.t, placeholder && s.ph)}>{children}</p>;
}

/** Inline note still to be written — rendered grey so it can't be mistaken for final copy. */
export function Placeholder({ children }: { children: ReactNode }) {
  return <span className={s.ph}>{children}</span>;
}

export function Chips({ children }: { children: ReactNode }) {
  return <div className={s.chips}>{children}</div>;
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className={s.chip}>{children}</span>;
}

/** Yellow "to confirm" flag for any number not yet verified. */
export function ToConfirm({ children = 'to confirm', style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <span className={cx(s.chip, s.tc)} style={style}>
      {children}
    </span>
  );
}

interface MediaPanelProps {
  /** Field colour behind the art. */
  background?: string;
  /** CSS aspect-ratio, e.g. "16/7". `aspectSm` applies on phones. */
  aspect?: string;
  aspectSm?: string;
  caption?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** A rounded media field, optionally captioned. Put screens, video or a mock inside. */
export function MediaPanel({ background, aspect, aspectSm, caption, className, style, children }: MediaPanelProps) {
  return (
    <>
      <div className={cx(s.panel, className)} style={{ background, '--aspect': aspect, '--aspect-sm': aspectSm, ...style }}>
        {children}
      </div>
      {caption && <p className={s.cap}>{caption}</p>}
    </>
  );
}

/** Two tagged panels side by side (stacked on phones). */
export function BeforeAfter({ before, after, caption }: { before: ReactNode; after: ReactNode; caption?: ReactNode }) {
  return (
    <>
      <div className={s.ba}>
        <div className={s.panel}>
          <span className={s.tag}>Before</span>
          {before}
        </div>
        <div className={s.panel}>
          <span className={s.tag}>After</span>
          {after}
        </div>
      </div>
      {caption && <p className={s.cap}>{caption}</p>}
    </>
  );
}

export interface Decision {
  title: ReactNode;
  body: ReactNode;
  /** Body still to be written (rendered as a grey note). */
  placeholder?: boolean;
}

/** Numbered decisions and trade-offs. */
export function DecisionList({ items }: { items: Decision[] }) {
  return (
    <div className={s.dec}>
      {items.map((item, i) => (
        <div key={i}>
          <span>{String(i + 1).padStart(2, '0')}</span>
          <p>
            <b>{item.title}</b>{' '}
            {item.placeholder ? <Placeholder>{item.body}</Placeholder> : item.body}
          </p>
        </div>
      ))}
    </div>
  );
}

export interface Stat {
  value: ReactNode;
  body: ReactNode;
}

/** Big-number outcome cards. */
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className={s.stats}>
      {stats.map((stat, i) => (
        <div key={i} className={`card ${s.st}`}>
          <b>{stat.value}</b>
          <p>{stat.body}</p>
        </div>
      ))}
    </div>
  );
}
