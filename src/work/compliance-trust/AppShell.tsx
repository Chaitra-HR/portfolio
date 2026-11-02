import { useState, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import d from './Dashboard.module.css';

const ICONS: Record<string, ReactNode> = {
  plus: <path d="M8 3v10M3 8h10" />,
  search: <path d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10Zm3.6-1.4L14 14" />,
  home: <path d="M2.5 7.5 8 3l5.5 4.5M4 6.5V13h3V9.5h2V13h3V6.5" />,
  ideas: <path d="M6 12h4M6.5 14h3M5 9.5a4 4 0 1 1 6 0c-.6.6-1 1.1-1 1.5H6c0-.4-.4-.9-1-1.5Z" />,
  content: <path d="M4 2h5.5L12 4.5V14H4V2Zm2.5 6h3m-3 2.5h3" />,
  approvals: <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM5.5 8l2 2 3-3.5" />,
  plan: <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Zm2.5-8.5L9 9 5.5 10.5 7 7l3.5-1.5Z" />,
  firm: <path d="M5 2.5h8V11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1h7v1M5 10V2.5M7 5.5h3.5M7 7.5h3.5" />,
  brand: <path d="M8 14A6 6 0 1 1 14 8c0 1.5-1.5 2-2.5 2H10a1 1 0 0 0-.8 1.6c.4.7 0 2.4-1.2 2.4ZM5 8h.01M6.5 5h.01M9.5 5h.01" />,
  voice: <path d="M3 8.5h3V5H3v3.5Zm0 0c0 1.5-.3 2.5-1 3.5M9.5 8.5h3V5h-3v3.5Zm0 0c0 1.5-.3 2.5-1 3.5" />,
  settings: <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0-8 1 1.8 2-.5.8 1.9 1.9.8-.5 2L14 8l-1.8 1 .5 2-1.9.8-.8 1.9-2-.5L8 14l-1-1.8-2 .5-.8-1.9-1.9-.8.5-2L2 8l1.8-1-.5-2 1.9-.8.8-1.9 2 .5L8 2Z" />,
  help: <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM6.3 6.3C6.5 5.5 7.2 5 8 5c1 0 1.8.7 1.8 1.6 0 1.4-1.8 1.4-1.8 2.7M8 11.2h.01" />,
  chevron: <path d="m6 4 4 4-4 4" />,
  send: <path d="M2.5 8 13.5 3l-3 10.5L7.5 9 2.5 8Zm5 1 6-6" />,
  flag: <path d="M4 14V2.5h8l-1.8 3 1.8 3H4" />,
};

export function Icon({ name }: { name: string }) {
  return (
    <svg className={d.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

interface NavEntry {
  id: string;
  label: string;
  icon: string;
  note?: string;
  children?: string[];
}

const MAIN: NavEntry[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'ideas', label: 'Ideas', icon: 'ideas' },
  { id: 'content', label: 'Content', icon: 'content', children: ['Drafts', 'With your licensee', 'Approved'] },
  { id: 'approvals', label: 'Approvals', icon: 'approvals', note: '2', children: ['Queue', 'Record'] },
  { id: 'plan', label: 'Plan', icon: 'plan', note: 'EOFY', children: ['Standing plan', 'Live campaigns', 'Past campaigns'] },
];

const PROFILE: NavEntry[] = [
  { id: 'firm', label: 'Firm details', icon: 'firm' },
  { id: 'brand', label: 'Brand kit', icon: 'brand' },
  { id: 'voice', label: 'Voice', icon: 'voice' },
];

function NavItem({ entry, open, here, onOpen }: { entry: NavEntry; open: boolean; here?: string; onOpen: () => void }) {
  return (
    <li>
      <button type="button" className={cx(d.navItem, open && d.navOpen)} aria-expanded={entry.children ? open : undefined} onClick={onOpen}>
        <Icon name={entry.icon} />
        {entry.label}
        {entry.note && <span>{entry.note}</span>}
      </button>
      {open && entry.children && (
        <ul className={d.subNav}>
          {entry.children.map((child) => (
            <li key={child} className={cx(child === here && d.subOn)}>
              {child}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

interface AppShellProps {
  /** The section open in the navigation, and the page within it. */
  section: string;
  page: string;
  /** The path shown at the top, last part first in weight. */
  crumb: string[];
  actions?: ReactNode;
  children: ReactNode;
}

/** FinScribe's frame at full width: the app's navigation and the top bar. Illustrative. */
export function AppShell({ section, page, crumb, actions, children }: AppShellProps) {
  const [open, setOpen] = useState(section);
  const toggle = (id: string) => setOpen((now) => (now === id ? '' : id));

  return (
    <div className={d.frame}>
      <div className={d.app}>
        <aside className={d.side}>
          <p className={d.firm}>
            <span>JH</span>
            Hale Wealth
          </p>
          <p className={d.create}>
            <Icon name="plus" />
            Create
          </p>
          <p className={d.search}>
            <Icon name="search" />
            Search
          </p>
          <ul className={d.nav}>
            {MAIN.map((entry) => (
              <NavItem key={entry.id} entry={entry} open={open === entry.id} here={page} onOpen={() => toggle(entry.id)} />
            ))}
          </ul>
          <p className={d.navHead}>Practice profile</p>
          <ul className={d.nav}>
            {PROFILE.map((entry) => (
              <NavItem key={entry.id} entry={entry} open={open === entry.id} onOpen={() => toggle(entry.id)} />
            ))}
          </ul>
          <ul className={cx(d.nav, d.navFoot)}>
            <NavItem entry={{ id: 'settings', label: 'Settings', icon: 'settings' }} open={false} onOpen={() => {}} />
            <NavItem entry={{ id: 'help', label: 'Help', icon: 'help' }} open={false} onOpen={() => {}} />
          </ul>
        </aside>

        <div className={d.main}>
          <header className={d.top}>
            <p className={d.crumb}>
              {crumb.map((part, i) =>
                i === crumb.length - 1 ? (
                  <b key={part}>{part}</b>
                ) : (
                  <span key={part} className={d.crumbPart}>
                    {part}
                    <Icon name="chevron" />
                  </span>
                ),
              )}
            </p>
            {actions}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
