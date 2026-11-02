import { useState } from 'react';
import { cx } from '../../lib/cx';
import { AppShell, Icon } from './AppShell';
import d from './Dashboard.module.css';

type Event = 'Approval' | 'Sent' | 'Edit' | 'Flag' | 'Draft';

const EVENTS: { kind: Event; who: string; initials: string; when: string; version: string; note: string; icon: string }[] = [
  { kind: 'Approval', who: 'Priya Nair, licensee', initials: 'PN', when: '16 Jun, 2:30 pm', version: 'v4', note: 'Approved for LinkedIn.', icon: 'approvals' },
  { kind: 'Sent', who: 'James Hale', initials: 'JH', when: '16 Jun, 9:42 am', version: 'v4', note: 'Sent to the licensee for approval.', icon: 'send' },
  { kind: 'Edit', who: 'James Hale', initials: 'JH', when: '16 Jun, 9:16 am', version: 'v4', note: 'Rewrote “returned 14% last year” by hand.', icon: 'content' },
  { kind: 'Edit', who: 'James Hale', initials: 'JH', when: '16 Jun, 9:14 am', version: 'v3', note: 'Used the suggestion on “is guaranteed to beat inflation”.', icon: 'content' },
  { kind: 'Flag', who: 'FinScribe', initials: 'F', when: '16 Jun, 9:11 am', version: 'v2', note: 'Marked 2 phrases that may need attention under ASIC’s requirements.', icon: 'flag' },
  { kind: 'Draft', who: 'James Hale', initials: 'JH', when: '15 Jun, 4:05 pm', version: 'v1', note: 'Started the draft from an idea in EOFY.', icon: 'ideas' },
];

const VERSIONS = [
  { id: 'v4', when: '16 Jun, 9:16 am', current: true },
  { id: 'v3', when: '16 Jun, 9:14 am' },
  { id: 'v2', when: '16 Jun, 9:11 am' },
  { id: 'v1', when: '15 Jun, 4:05 pm' },
];

const FILTERS: (Event | 'All events')[] = ['All events', 'Flag', 'Edit', 'Approval'];

/** Record: everything that happened to a piece, by whom and when. Filter it, switch views, or pick a version. Illustrative, with sample copy. */
export function AuditTrail() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All events');
  const [view, setView] = useState<'Timeline' | 'Table'>('Timeline');
  const [version, setVersion] = useState<string | null>(null);
  const rows = EVENTS.filter((event) => (filter === 'All events' || event.kind === filter) && (!version || event.version === version));

  return (
    <AppShell section="approvals" page="Record" crumb={['Approvals', 'Record', 'When markets get noisy']}>
      <div className={d.tools}>
        <p className={d.logSearch}>
          <Icon name="search" />
          Search the record
        </p>
        <div className={d.filters} role="group" aria-label="Filter events">
          {FILTERS.map((option) => (
            <button key={option} type="button" aria-pressed={filter === option} className={cx(filter === option && d.filterOn)} onClick={() => setFilter(option)}>
              {option}
            </button>
          ))}
        </div>
        <div className={d.views} role="group" aria-label="View">
          {(['Timeline', 'Table'] as const).map((option) => (
            <button key={option} type="button" aria-pressed={view === option} className={cx(view === option && d.viewOn)} onClick={() => setView(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className={d.logWork}>
        <div className={d.log}>
          {!rows.length && <p className={d.empty}>Nothing of this kind on {version}.</p>}
          {view === 'Timeline' ? (
            <ol className={d.timeline}>
              {rows.map((event) => (
                <li key={event.when}>
                  <span className={cx(d.dot, event.kind === 'Approval' && d.dotDone, event.kind === 'Flag' && d.dotFlag)}>
                    <Icon name={event.icon} />
                  </span>
                  <div>
                    <p className={d.logHead}>
                      <b>{event.who}</b>
                      <em>{event.kind}</em>
                      <time>{event.when}</time>
                      <span>{event.version}</span>
                    </p>
                    <p className={d.logCard}>{event.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <table className={d.table}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>What</th>
                  <th>Version</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((event) => (
                  <tr key={event.when}>
                    <td>{event.when}</td>
                    <td>{event.who}</td>
                    <td>{event.note}</td>
                    <td>{event.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className={d.versions}>
          <h5>Version history</h5>
          <p>When markets get noisy</p>
          <ul>
            {VERSIONS.map((entry) => (
              <li key={entry.id}>
                <button type="button" aria-pressed={version === entry.id} className={cx(version === entry.id && d.versionOn)} onClick={() => setVersion((now) => (now === entry.id ? null : entry.id))}>
                  <b>
                    {entry.id}
                    {entry.current && <span>Current</span>}
                  </b>
                  <small>{entry.when}</small>
                </button>
              </li>
            ))}
          </ul>
          <p className={d.notice}>This record supports your review. It doesn’t replace your licensee’s approval or your firm’s own recordkeeping.</p>
        </aside>
      </div>
    </AppShell>
  );
}
