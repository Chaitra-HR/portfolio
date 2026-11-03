import type { ReactNode } from 'react';
import s from './kit.module.css';

interface CaseSectionProps {
  /** Becomes the element id `cs-<id>`. */
  id: string;
  /** The section's name: its heading when there's no headline, otherwise for screen readers only. */
  label: string;
  /** The story's heading. */
  title?: ReactNode;
  children?: ReactNode;
}

/** A section of the case-study article, set off from the last by a rule. The headline is its heading; without one, the name is. */
export function CaseSection({ id, label, title, children }: CaseSectionProps) {
  return (
    <section id={`cs-${id}`} className={s.sec} aria-label={title ? label : undefined}>
      <h2 className={s.story}>{title ?? label}</h2>
      {children}
    </section>
  );
}

/** A titled step inside a section. Its id can be a nested contents entry. */
export function CaseSub({ id, kicker, title, children }: { id: string; kicker?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div id={`cs-${id}`} className={s.sub}>
      {kicker && <p className={s.kicker}>{kicker}</p>}
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/** Body paragraph. */
export function Text({ children }: { children: ReactNode }) {
  return <p className={s.t}>{children}</p>;
}
