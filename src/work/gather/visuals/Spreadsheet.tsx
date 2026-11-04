import { useState } from 'react';
import { cx } from '../../../lib/cx';
import { DOCUMENTS, FRICTION, QUESTIONS, SHEET, type Friction, type Question } from '../content';
import { study } from '../../../pages/CaseStudy/kit';
import g from '../Gather.module.css';
import st from './Sticky.module.css';
import s from './Spreadsheet.module.css';

const FRICTIONS: Friction[] = ['relevance', 'effort', 'trust'];
const TILT = [-.4, .3, -.3];

/** The first row of each kind carries the numbered pin that its note refers to. */
const PINNED: Record<number, Friction> = { 12: 'relevance', 23: 'effort', 34: 'trust' };

function Pin({ type, className }: { type: Friction; className?: string }) {
  return <span className={cx(study.pin, g[type], className)}>{FRICTION[type].n}</span>;
}

function Row({ q, pin }: { q: Question; pin?: boolean }) {
  return (
    <div className={cx(s.row, q.friction && s.flagged, q.friction && g[q.friction])} data-friction={q.friction}>
      <span className={s.n}>{q.n}</span>
      <span>{q.text}</span>
      <span className={s.a}>
        {q.answer}
        {pin && PINNED[q.n] && <Pin type={PINNED[q.n]} className={s.rowPin} />}
      </span>
    </div>
  );
}

/** A few rows of the old sheet, for the "before" side of a solution. */
export function SheetSlice({ rows, label }: { rows: number[]; label: string }) {
  return (
    <div className={s.slice}>
      <p className={s.sliceLabel}>{label}</p>
      <div className={s.sheet}>
        <div className={s.title}>
          <i aria-hidden="true" />
          <span>MoneyWorks_Client_Information_v6.xlsx</span>
        </div>
        {QUESTIONS.filter((q) => rows.includes(q.n)).map((q) => (
          <Row key={q.n} q={q} />
        ))}
      </div>
    </div>
  );
}

/** All 47 rows on purpose: the length is the point. Notes stay in view while it scrolls past. */
export function Spreadsheet() {
  const [focus, setFocus] = useState<Friction | null>(null);

  return (
    <div className={s.layout}>
      <div className={s.sheet} data-focus={focus ?? undefined} role="group" aria-label="Reconstruction of the 47-question client spreadsheet">
        <div className={s.title}>
          <i aria-hidden="true" />
          <span>MoneyWorks_Client_Information_v6.xlsx</span>
        </div>
        <div className={s.formula} aria-hidden="true">
          <span>B34</span>
          <i>fx</i>
          <span>Why is this needed?</span>
        </div>
        <div className={cx(s.row, s.cols)} aria-hidden="true">
          <span />
          <span>A</span>
          <span>B</span>
        </div>
        <div className={s.notice}>Please complete every section and return with the documents listed.</div>

        {SHEET.map((section) => (
          <div key={section.name}>
            <div className={s.section}>
              <span>{section.name}</span>
              <span>{section.questions.length} questions</span>
            </div>
            {section.questions.map((q) => (
              <Row key={q.n} q={q} pin />
            ))}
          </div>
        ))}

        <div className={s.tabs} aria-hidden="true">
          <span className={s.tabOn}>Client information</span>
          <span>Document checklist</span>
          <span className={s.tally}>47 questions · 1 file · 1 submission</span>
          <span className={s.flaggedOnly}>Flagged rows only</span>
        </div>
      </div>

      <aside className={s.rail}>
        <div className={s.docs}>
          <p className={s.docsTitle}>
            Document checklist <span>Tab 2</span>
          </p>
          <ul>
            {DOCUMENTS.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </div>

        <div className={s.notes}>
          {FRICTIONS.map((type, i) => (
            <button
              key={type}
              type="button"
              className={cx(s.note, st.sticky, g[type], focus === type && s.noteOn)}
              style={{ '--tilt': `${TILT[i]}deg` }}
              aria-pressed={focus === type}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setFocus(type)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && setFocus(null)}
              onFocus={() => setFocus(type)}
              onBlur={() => setFocus(null)}
              onClick={() => setFocus((v) => (v === type ? null : type))}
            >
              <span className={cx(st.paper, s.notePaper)}>
                <Pin type={type} />
                <span>
                  <b>{FRICTION[type].title}</b>
                  {FRICTION[type].note}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
