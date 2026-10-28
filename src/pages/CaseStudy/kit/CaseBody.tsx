import { useRef, type ReactNode } from 'react';
import { useActiveSection } from '../../../hooks/useActiveSection';
import { smoothScrollTo } from '../../../lib/scroll';
import { AsteriskArms } from '../../../components/ui/Asterisk';
import s from './kit.module.css';

export interface TocEntry {
  /** Matches a `data-sec` value inside the body. Section ids are `cs-<id>`. */
  id: string;
  label: string;
}

/**
 * Sticky table of contents beside the article column. Any child carrying
 * `data-sec` takes part in the scroll-spy — CaseSection does this, and so
 * can a bespoke section.
 */
export function CaseBody({ toc, children }: { toc: TocEntry[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const active = useActiveSection(root, toc[0]?.id ?? '');

  return (
    <div className={s.body} ref={root}>
      <nav className={s.toc} aria-label="On this page">
        {toc.map((entry) => (
          <a
            key={entry.id}
            href={`#cs-${entry.id}`}
            className={active === entry.id ? s.on : undefined}
            aria-current={active === entry.id ? 'location' : undefined}
            onClick={smoothScrollTo(`cs-${entry.id}`)}
          >
            <svg className={s.mini} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
              <g fill="#9A6CF2">
                <AsteriskArms />
              </g>
            </svg>
            {entry.label}
          </a>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}
