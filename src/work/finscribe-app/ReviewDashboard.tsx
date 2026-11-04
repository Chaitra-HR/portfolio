import { useState } from 'react';
import { cx } from '../../lib/cx';
import { AppShell } from './AppShell';
import d from './Dashboard.module.css';

type Kind = 'all' | 'wording' | 'disclosure';

const FINDINGS = [
  {
    id: 'promise',
    kind: 'wording',
    label: 'Sounds like a promise',
    phrase: 'is guaranteed to beat inflation',
    why: 'Investment outcomes aren’t certain, so wording like this can read as a promise. It may need softening under ASIC’s requirements.',
    suggestion: 'is designed to outpace inflation over the long term, though returns aren’t guaranteed',
  },
  {
    id: 'performance',
    kind: 'wording',
    label: 'Performance claim',
    phrase: 'returned 14% last year',
    why: 'A performance figure may need evidence behind it, and context such as the period it covers.',
    suggestion: 'returned 14% last year, though past performance isn’t a reliable guide to future returns',
  },
  {
    id: 'disclosure',
    kind: 'disclosure',
    label: 'Missing disclosure',
    phrase: 'Book a call and we’ll talk it through.',
    why: 'Nothing here says past performance isn’t a reliable guide. It may be worth adding before you send this on.',
    suggestion: 'Add a short general advice warning at the end of the post',
  },
];

const FILTERS: { id: Kind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'wording', label: 'Wording' },
  { id: 'disclosure', label: 'Disclosure' },
];

/** A draft under review: the post on the left, what may need attention beside it. Pick a finding and its words light up. Illustrative, with sample copy. */
export function ReviewDashboard({ pick }: { /** Drives the open finding from outside, as the home cover's film does. */ pick?: string } = {}) {
  const [filter, setFilter] = useState<Kind>('all');
  const [chosen, setPicked] = useState('promise');
  const picked = pick ?? chosen;
  const shown = FINDINGS.filter((finding) => filter === 'all' || finding.kind === filter);
  const on = (id: string) => (id === picked ? d.markOn : undefined);

  return (
    <AppShell
      section="content"
      page="Drafts"
      crumb={['Content', 'Drafts', 'When markets get noisy']}
      actions={
        <>
          <span className={d.saved}>Saved</span>
          <span className={d.ghost}>Save draft</span>
          <span className={d.primary}>Send to licensee</span>
        </>
      }
    >
      <div className={d.work}>
        <div className={d.editor}>
          <ul className={d.formats}>
            <li className={d.formatOn}>LinkedIn post</li>
            <li>Carousel</li>
            <li>Newsletter</li>
          </ul>
          <div className={d.docHead}>
            <div>
              <h4>When markets get noisy</h4>
              <p>Last saved 4 minutes ago by James Hale</p>
            </div>
            <span>v2</span>
          </div>
          <article className={d.doc}>
            <p>
              Markets have been noisy this year, but our growth portfolio <mark className={on('promise')}>is guaranteed to beat inflation</mark>. It <mark className={on('performance')}>returned 14% last year</mark>.
            </p>
            <p>If the headlines have you second-guessing your plan, you’re not alone. Three things worth doing this quarter:</p>
            <ul>
              <li>Check your mix still matches your goals</li>
              <li>Keep three to six months of expenses on hand</li>
              <li>Review your plan before the end of financial year</li>
            </ul>
            <p>
              <mark className={on('disclosure')}>Book a call and we’ll talk it through.</mark>
            </p>
          </article>
        </div>

        <aside className={d.review} data-findings>
          <div className={d.reviewHead}>
            <h5>Review</h5>
            <span>Australia, ASIC</span>
          </div>
          <div className={d.filters} role="group" aria-label="Filter findings">
            {FILTERS.map(({ id, label }) => (
              <button key={id} type="button" aria-pressed={filter === id} className={cx(filter === id && d.filterOn)} onClick={() => setFilter(id)}>
                {label}
                <span>{FINDINGS.filter((finding) => id === 'all' || finding.kind === id).length}</span>
              </button>
            ))}
          </div>
          {shown.map((finding) => (
            <button key={finding.id} type="button" aria-expanded={finding.id === picked} className={cx(d.finding, finding.id === picked && d.findingOn)} onClick={() => setPicked(finding.id)}>
              <b>{finding.label}</b>
              {finding.id === picked ? (
                <>
                  <span>{finding.why}</span>
                  <small>Suggested change</small>
                  <span>{finding.suggestion}</span>
                  <span className={d.choices}>
                    <i>Rewrite it myself</i>
                    <i>Use the suggestion</i>
                  </span>
                </>
              ) : (
                <span className={d.findingWords}>{finding.phrase}</span>
              )}
            </button>
          ))}
        </aside>
      </div>
    </AppShell>
  );
}
