import { useId, useState, type ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import s from './editorial.module.css';

/** The sentence a section turns on, a step up from the body. At most one per section. */
export function Lead({ children }: { children: ReactNode }) {
  return <p className={s.lead}>{children}</p>;
}

/** Short parallel points. Prose stays prose: this is for lists the writing already contains. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className={s.bullets}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** A finding or change of mind, pulled out of the prose. `<em>` carries the part to remember. */
export function KeyInsight({ label = 'Key insight', children }: { label?: string; children: ReactNode }) {
  return (
    <aside className={s.insight}>
      <p className={s.insightLabel}>{label}</p>
      <p className={s.insightText}>{children}</p>
    </aside>
  );
}

interface Finding {
  /** Stands in for the hairline over the finding. */
  visual?: ReactNode;
  title: ReactNode;
  body: ReactNode;
}

/** Research findings or parallel points, two or three across. */
export function Findings({ items, columns = 3, note }: { items: Finding[]; columns?: 2 | 3; note?: ReactNode }) {
  return (
    <>
      <ul className={cx(s.findings, columns === 2 && s.findingsTwo, items.some((item) => item.visual) && s.findingsVisual)}>
        {items.map((item, i) => (
          <li key={i}>
            {item.visual}
            <b>{item.title}</b>
            {item.body}
          </li>
        ))}
      </ul>
      {note && <p className={s.findingsNote}>{note}</p>}
    </>
  );
}

interface ReasoningProps {
  why?: ReactNode;
  tradeoff?: ReactNode;
  /** The second column's name, where "trade-off" isn't what the copy says it is. */
  tradeoffLabel?: string;
}

/** Why a decision was made and what it cost. Only ever filled from the study's own reasoning. */
export function Reasoning({ why, tradeoff, tradeoffLabel = 'Trade-off accepted' }: ReasoningProps) {
  return (
    <dl className={cx(s.reasoning, !(why && tradeoff) && s.reasoningOne)}>
      {why && (
        <div>
          <dt>Why</dt>
          <dd>{why}</dd>
        </div>
      )}
      {tradeoff && (
        <div>
          <dt>{tradeoffLabel}</dt>
          <dd>{tradeoff}</dd>
        </div>
      )}
    </dl>
  );
}

interface Alternative {
  /** A small label in the card's corner, e.g. the flow it implies. */
  label?: ReactNode;
  title: ReactNode;
  body: ReactNode;
  chosen?: boolean;
}

/** Approaches laid side by side, so the differences show before anything is read closely. */
export function Alternatives({ items }: { items: Alternative[] }) {
  return (
    <ul className={cx(s.alts, items.length === 2 && s.altsTwo)}>
      {items.map((item, i) => (
        <li key={i} className={cx(s.alt, item.chosen && s.altChosen)}>
          <p className={s.altHead}>{item.label}</p>
          <b>{item.title}</b>
          <p>{item.body}</p>
          {item.chosen && <p className={s.altPick}>Chosen</p>}
        </li>
      ))}
    </ul>
  );
}

/** How sure a result is. Each has its own card, so a reader can't take one for another. */
type OutcomeStatus = 'measured' | 'reported' | 'observed' | 'qualitative' | 'anticipated';

const OUTCOME_LABEL: Record<OutcomeStatus, string> = {
  measured: 'Measured in testing',
  reported: 'Reported, pending verification',
  observed: 'Observed in testing',
  qualitative: 'Qualitative outcome',
  anticipated: 'Still to test',
};

interface OutcomeCardData {
  status: OutcomeStatus;
  value: ReactNode;
  body: ReactNode;
}

function OutcomeCard({ status, value, body, lead }: OutcomeCardData & { lead?: boolean }) {
  return (
    <div className={cx(s.outcome, lead && s.outcomeLead, s[status])}>
      <p className={s.outcomeStatus}>{OUTCOME_LABEL[status]}</p>
      <p className={s.outcomeValue}>{value}</p>
      <p className={s.outcomeBody}>{body}</p>
    </div>
  );
}

/** The result that matters most, what backs it up, and anything less certain set apart below. */
export function OutcomeCards({ lead, items = [], apart }: { lead: OutcomeCardData; items?: OutcomeCardData[]; apart?: OutcomeCardData }) {
  return (
    <div className={cx(s.outcomes, !items.length && s.outcomesOne)} style={{ '--rows': items.length }}>
      <OutcomeCard {...lead} lead />
      {items.map((item, i) => (
        <OutcomeCard key={i} {...item} />
      ))}
      {apart && <OutcomeCard {...apart} />}
    </div>
  );
}

/** What the reader should take from a figure, sitting under it. */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className={s.notice}>
      <p>What to notice</p>
      <div>{children}</div>
    </div>
  );
}

/** Supporting detail a skimming reader can leave closed. Never for the story's reasoning. */
export function More({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={s.more}>
      <button type="button" className={s.moreToggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        {label}
        <svg className={cx(s.moreChev, open && s.moreChevOpen)} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </button>
      <div id={id} className={cx(s.morePanel, open && s.morePanelOpen)} inert={!open}>
        <div>{children}</div>
      </div>
    </div>
  );
}
