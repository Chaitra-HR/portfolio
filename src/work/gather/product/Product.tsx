import type { ReactNode } from 'react';
import { cx } from '../../../lib/cx';
import p from './Product.module.css';

/** The redesigned MoneyWorks product. Shared by every visual, so they read as one system. */

const paths = {
  check: 'M3 8.5l3.2 3.2L13 4.8',
  clock: 'M8 4.5V8l2.4 1.6M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z',
  doc: 'M9.5 2H4.5v12h8V5l-3-3Zm0 0v3h3',
  chat: 'M2.5 3.5h11v7.5H7l-3 2.5V11H2.5v-7.5Z',
  plus: 'M8 3.5v9M3.5 8h9',
  next: 'M2 8h12M9.5 3.5 14 8l-4.5 4.5',
  back: 'M14 8H2M6.5 3.5 2 8l4.5 4.5',
};

function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg className={p.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

type TabState = 'done' | 'now' | 'next' | 'open';
type Tab = [label: string, state: TabState];

const CLIENT_TABS = (now: string, open: string[] = []): Tab[] => {
  const all = ['Shared goals', 'Household', 'Income', 'Home and loans', 'Investments', 'Insurance'];
  const at = all.indexOf(now);
  return all.map((label, i) => [label, label === now ? 'now' : open.includes(label) ? 'open' : i < at ? 'done' : 'next']);
};

interface AppProps {
  tabs?: Tab[];
  user: string;
  /** The mint pill at the end of the tab row. */
  action?: ReactNode;
  children: ReactNode;
}

/** A desktop screen. Everything inside is in em, so it scales with its frame and reflows when narrow. */
function App({ tabs, user, action, children }: AppProps) {
  return (
    <div className={p.screen}>
      <div className={p.inner}>
        <div className={p.top}>
          <span className={p.brand}>
            <i aria-hidden="true" />
            MoneyWorks
          </span>
          <span className={p.user}>{user}</span>
        </div>
        {tabs && (
          <div className={p.tabs}>
            {tabs.map(([label, state]) => (
              <span key={label} className={p.tab} data-state={state}>
                {state === 'done' && <Icon name="check" />}
                {label}
              </span>
            ))}
            <i className={p.rule} aria-hidden="true" />
            {action && <span className={p.help}>{action}</span>}
          </div>
        )}
        <div className={p.body}>{children}</div>
      </div>
    </div>
  );
}

function Arrows() {
  return (
    <span className={p.arrows} aria-hidden="true">
      <i>
        <Icon name="back" />
      </i>
      <i className={p.arrowNext}>
        <Icon name="next" />
      </i>
    </span>
  );
}

function Stats({ items }: { items: [label: string, value: ReactNode][] }) {
  return (
    <div className={p.stats}>
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}

function Status({ tone = 'plain', children }: { tone?: 'ok' | 'wait' | 'ask' | 'plain'; children: ReactNode }) {
  return <span className={cx(p.status, tone !== 'plain' && p[tone])}>{children}</span>;
}

/** A hairline row, label on the left and value on the right. */
function Row({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className={p.row}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Item({ icon, title, meta, tone }: { icon: 'doc' | 'chat' | 'clock' | 'check'; title: ReactNode; meta?: ReactNode; tone?: 'ok' | 'wait' | 'ask' }) {
  return (
    <div className={p.item}>
      <i className={tone && p[tone]}>
        <Icon name={icon} />
      </i>
      <span>
        <b>{title}</b>
        {meta && <small>{meta}</small>}
      </span>
    </div>
  );
}

/** Line figures for the household choices: one person, two, a family, and a question. */
function Glyph({ kind }: { kind: 'one' | 'two' | 'family' | 'unsure' }) {
  const person = (x: number, y: number, r: number, fill: string) => (
    <g key={`${x}${y}`}>
      <circle cx={x} cy={y} r={r} fill={fill} />
      <path d={`M${x - r * 1.9} ${y + r * 4} c0 -${r * 2.6} ${r * 3.8} -${r * 2.6} ${r * 3.8} 0`} fill={fill} />
    </g>
  );
  return (
    <svg className={p.glyph} viewBox="0 0 96 72" aria-hidden="true" stroke="#0E2E24" strokeWidth="1.3" strokeLinejoin="round">
      {kind === 'one' && person(48, 24, 12, 'var(--sage)')}
      {kind === 'two' && [person(36, 26, 11, 'var(--sage)'), person(60, 22, 12, '#FFFFFF')]}
      {kind === 'family' && [person(30, 22, 10.5, 'var(--sage)'), person(66, 22, 10.5, '#FFFFFF'), person(48, 40, 6.5, '#FFFFFF')]}
      {kind === 'unsure' && (
        <>
          <circle cx="48" cy="34" r="24" fill="var(--sage)" />
          <path d="M40 28c0-11 17-11 17 0 0 7-9 6-9 13M48 47.5v.5" fill="none" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function Pick({ title, kind, on }: { title: string; kind: 'one' | 'two' | 'family' | 'unsure'; on?: boolean }) {
  return (
    <div className={cx(p.pick, on && p.pickOn)}>
      <b>{title}</b>
      <span className={p.pickDot}>{on && <Icon name="check" />}</span>
      <Glyph kind={kind} />
    </div>
  );
}

/** The second gateway question. */
export function GatewayScreen() {
  return (
    <App
      user="Meera Iyer"
      tabs={[
        ['Why you’re here', 'done'],
        ['Who’s involved', 'now'],
        ['How you earn', 'next'],
        ['Anything else', 'next'],
      ]}
    >
      <div className={p.gateway}>
        <div className={p.lead}>
          <p className={p.big}>Who are you planning with?</p>
          <p className={p.note}>(Your answer decides what we ask next)</p>
          <Arrows />
        </div>
        <div className={p.picks}>
          <Pick title="Just me" kind="one" />
          <Pick title="With my partner" kind="two" on />
          <Pick title="With my family" kind="family" />
          <Pick title="I’m not sure yet" kind="unsure" />
        </div>
      </div>
    </App>
  );
}

/** A section part-way: what the client knows is in, the rest waits on a list. */
export function InvestmentsScreen({ slim }: { slim?: boolean }) {
  return (
    <App user="Meera Iyer" tabs={CLIENT_TABS('Investments', ['Home and loans'])} action="Save for later">
      <div className={p.head}>
        <p className={p.big}>Investments</p>
        <Stats
          items={[
            ['Added so far', '₹32,75,000'],
            ['Still to add', '1 item'],
            ['Sections done', '3 of 6'],
          ]}
        />
      </div>
      <div className={p.two}>
        <div>
          <p className={p.h}>What you know today</p>
          <Row label="Mutual funds" value="₹24,60,000" />
          <Row label="PPF balance" value="₹8,15,000" />
          <Row label="Monthly SIPs" value="₹40,000" />
          <Row label="NPS balance" value={<Status tone="wait">Add later</Status>} />
        </div>
        <div className={cx(p.card, slim && p.wideOnly)}>
          <p className={p.h}>On your list for later</p>
          <Item icon="doc" tone="wait" title="NPS statement" meta="Investments" />
          <Item icon="doc" tone="wait" title="Home loan statement" meta="Home and loans" />
          <p className={p.cardNote}>Nothing here stops you moving on.</p>
        </div>
      </div>
      <div className={p.foot}>
        <span>Saved a moment ago</span>
        <Arrows />
      </div>
    </App>
  );
}

/** The client steps away. */
export function SavedScreen() {
  return (
    <App user="Meera Iyer">
      <p className={p.big}>Your progress is saved</p>
      <p className={p.note}>Come back when you have these. Your answers stay here.</p>
      <div className={p.list}>
        <Item icon="check" tone="ok" title="4 sections complete" meta="Goals, household, income, insurance" />
        <Item icon="doc" tone="wait" title="NPS statement" meta="Investments" />
        <Item icon="doc" tone="wait" title="Home loan statement" meta="Home and loans" />
        <Item icon="chat" tone="ask" title="Loan to a family member" meta="Sent to your advisor" />
      </div>
    </App>
  );
}

/** The client comes back, later, with one document. */
export function ReturnScreen() {
  return (
    <App user="Meera Iyer">
      <p className={p.big}>Hello again, Meera</p>
      <p className={p.note}>Pick up where you left off. Nothing to redo.</p>
      <div className={p.list}>
        <Item icon="check" tone="ok" title="NPS statement" meta="Added just now" />
        <Item icon="doc" tone="wait" title="Home loan statement" meta="Home and loans" />
        <Item icon="chat" tone="ask" title="Loan to a family member" meta="With your advisor" />
      </div>
      <div className={p.foot}>
        <span>5 of 6 sections complete</span>
        <Arrows />
      </div>
    </App>
  );
}

const RECEIVED: [string, ReactNode][] = [
  ['Shared goals', <Status tone="ok">Complete</Status>],
  ['Household', <Status tone="ok">Complete</Status>],
  ['Income', <Status tone="ok">Complete</Status>],
  ['Home and loans', <Status tone="wait">2 open</Status>],
  ['Investments', <Status tone="wait">2 open</Status>],
  ['Insurance', <Status tone="ok">Complete</Status>],
];

/** The advisor's overview of one client. */
export function AdvisorScreen({ slim }: { slim?: boolean }) {
  return (
    <App
      user="Nikhil Shah"
      tabs={[
        ['Overview', 'now'],
        ['Answers', 'next'],
        ['Documents', 'next'],
        ['Notes', 'next'],
      ]}
      action="Request documents"
    >
      <div className={p.head}>
        <div>
          <p className={p.big}>Meera and Rohan Iyer</p>
          <p className={p.note}>Joint plan · Two children · Home loan</p>
        </div>
        <Stats
          items={[
            ['Household income', '₹46.2L'],
            ['Investments', '₹41.8L'],
            ['Loans', '₹58.4L'],
          ]}
        />
      </div>
      <div className={p.two}>
        <div className={slim ? p.wideOnly : undefined}>
          <p className={p.h}>Information received · 4 of 6 complete</p>
          {RECEIVED.map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
        </div>
        <div>
          <p className={p.h}>Still needed</p>
          <Item icon="doc" tone="wait" title="NPS statement" meta="Missing document · Investments" />
          <Item icon="doc" tone="wait" title="Home loan statement" meta="Missing document · Home and loans" />
          <Item icon="chat" tone="ask" title="Loan to a family member" meta="Needs clarification · Client asked why" />
          <Item icon="clock" title="Rohan’s EPF balance" meta="Requested on Tuesday · Investments" />
        </div>
      </div>
      {!slim && (
        <div className={p.next}>
          <span>
            <small>Next step</small>
            Ask about the family loan on your call. Everything else is with the client.
          </span>
          <Arrows />
        </div>
      )}
    </App>
  );
}
