import { useEffect, useRef, useState } from 'react';
import finscribe from '../../assets/images/logos/finscribe.svg';
import chatgpt from '../../assets/images/logos/market/chatgpt.svg';
import claude from '../../assets/images/logos/market/claude.svg';
import fmg from '../../assets/images/logos/market/fmg-suite.png';
import grammarly from '../../assets/images/logos/market/grammarly.svg';
import jasper from '../../assets/images/logos/market/jasper.png';
import leadPilot from '../../assets/images/logos/market/lead-pilot.png';
import notion from '../../assets/images/logos/market/notion.svg';
import snappy from '../../assets/images/logos/market/snappy-kraken.svg';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';
import m from './Market.module.css';

/**
 * Where each tool sits, in percent: `x` from freeform, where you bring the idea, to guided, where
 * it brings you one, and `y` from built for anyone to built for advisors. `tile` is the colour
 * behind a mark that needs one. The note is what hover, focus or a tap reveals.
 */
const TOOLS = [
  { name: 'ChatGPT', logo: chatgpt, tile: '#10A37F', x: 10, y: 20, note: 'Fast and flexible, with memory and an editor. You still bring the idea.' },
  { name: 'Claude', logo: claude, tile: '#FAF9F5', x: 22, y: 34, note: 'A strong general writer. You still bring the idea and the context.' },
  { name: 'Notion AI', logo: notion, tile: '#FFFFFF', x: 30, y: 14, note: 'Draws on your workspace, once you know what you want to write.' },
  { name: 'Grammarly', logo: grammarly, tile: '#15C39A', x: 42, y: 30, note: 'Improves what you’ve already written, with brand tones.' },
  { name: 'Jasper', logo: jasper, x: 58, y: 18, note: 'Brand voice and company knowledge, built for marketing teams.' },
  { name: 'FMG Suite', logo: fmg, x: 12, y: 80, note: 'Built for advisors. Muse drafts and Overwatch flags language.' },
  { name: 'Snappy Kraken', logo: snappy, tile: '#FFFFFF', x: 30, y: 66, note: 'Advisor campaigns, with AI that helps draft and guide them.' },
  { name: 'Lead Pilot', logo: leadPilot, x: 62, y: 62, note: 'Turnkey advisor content, from Twenty Over Ten.' },
];

const edge = (x: number) => (x < 26 ? m.fromLeft : x > 74 ? m.fromRight : undefined);

/** One tool on the map: its mark, and why it sits there. */
function Tool({ name, logo, tile, x, y, note, on, onTap }: (typeof TOOLS)[number] & { on: boolean; onTap: () => void }) {
  return (
    <button type="button" className={cx(m.tool, y > 70 && m.below, edge(x), on && m.open)} aria-expanded={on} onClick={onTap} style={{ left: `${x}%`, bottom: `${y}%` }} aria-label={`${name}. ${note}`}>
      <span className={m.mark} style={{ background: tile }}>
        <img src={logo} alt="" className={tile ? m.inset : undefined} loading="lazy" />
      </span>
      <span className={m.note} aria-hidden="true">
        <b>{name}</b>
        {note}
      </span>
    </button>
  );
}

/** Who brings the idea, against who the tool is built for. Hover, focus or tap a mark for why it sits there. */
export function PositioningMatrix() {
  const [open, setOpen] = useState<string | null>(null);
  const tap = (name: string) => setOpen((now) => (now === name ? null : name));

  return (
    <div className={m.matrix}>
      <span className={cx(m.axis, m.top)}>Built for advisors</span>
      <span className={cx(m.axis, m.bottom)}>Built for anyone</span>
      <span className={cx(m.axis, m.left)}>Freeform</span>
      <span className={cx(m.axis, m.right)}>Guided</span>
      <div className={m.plot}>
        <i className={m.h} />
        <i className={m.v} />
        {TOOLS.map((tool) => (
          <Tool key={tool.name} {...tool} on={open === tool.name} onTap={() => tap(tool.name)} />
        ))}
        <button type="button" className={cx(m.tool, m.us, m.below, m.fromRight, open === 'FinScribe' && m.open)} style={{ left: '84%', bottom: '86%' }} aria-expanded={open === 'FinScribe'} onClick={() => tap('FinScribe')} aria-label="FinScribe. Built for advisors, and it starts from what’s worth saying.">
          <span className={m.mark}>
            <img src={finscribe} alt="" loading="lazy" />
          </span>
          <strong>FinScribe</strong>
          <span className={m.note} aria-hidden="true">
            <b>FinScribe</b>
            Built for advisors, and it starts from what’s worth saying.
          </span>
        </button>
      </div>
    </div>
  );
}

type Level = 'yes' | 'part' | 'no';

const COLUMNS = ['ChatGPT', 'Jasper', 'Grammarly', 'Notion AI', 'FMG Suite', 'FinScribe'];

const ROWS: { label: string; levels: Level[] }[] = [
  { label: 'Suggests what to say', levels: ['no', 'no', 'no', 'no', 'part', 'yes'] },
  { label: 'Knows your business without being told', levels: ['part', 'yes', 'part', 'part', 'part', 'yes'] },
  { label: 'Writes in your voice', levels: ['part', 'yes', 'part', 'no', 'part', 'yes'] },
  { label: 'Edit without writing another prompt', levels: ['yes', 'yes', 'yes', 'yes', 'part', 'yes'] },
  { label: 'Flags risky financial wording', levels: ['no', 'no', 'no', 'no', 'yes', 'yes'] },
  { label: 'Built for financial advisors', levels: ['no', 'no', 'no', 'no', 'yes', 'yes'] },
];

const SAYS: Record<Level, string> = { yes: 'Yes', part: 'Partly', no: 'No' };

/** What each tool does for the job, one row to a capability. */
export function CompetitorTable() {
  return (
    <div className={m.scroll}>
      <table className={m.table}>
        <caption className="sr-only">How FinScribe compares with AI and writing tools</caption>
        <thead>
          <tr>
            <td />
            {COLUMNS.map((name) => (
              <th key={name} scope="col" className={cx(name === 'FinScribe' && m.ours)}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.levels.map((level, i) => (
                <td key={COLUMNS[i]} className={cx(i === COLUMNS.length - 1 && m.ours)}>
                  <span className={cx(m.dot, m[level])} role="img" aria-label={SAYS[level]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className={m.key}>
        <li>
          <span className={cx(m.dot, m.yes)} /> Yes
        </li>
        <li>
          <span className={cx(m.dot, m.part)} /> Partly
        </li>
        <li>
          <span className={cx(m.dot, m.no)} /> No
        </li>
      </ul>
    </div>
  );
}

type Message = { from: 'advisor' | 'ai'; text: string };

/** How the conversation goes once something finally gets sent. */
const TURNS: Message[][] = [
  [
    { from: 'advisor', text: 'Write a post about retirement for my clients' },
    { from: 'ai', text: 'Retirement is a journey, not a destination. Here are five tips to help you plan for your future with confidence.' },
  ],
  [
    { from: 'advisor', text: 'Can you make it sound more like me?' },
    { from: 'ai', text: 'Of course! Could you tell me about your style, your audience and your business?' },
  ],
  [
    { from: 'advisor', text: 'Am I allowed to say this?' },
    { from: 'ai', text: 'I can’t confirm that. It’s best to check with your compliance team.' },
  ],
];

/** The false starts: typed, thought better of, and deleted. */
const FALSE_STARTS = ['Write a post about', 'Something for my clients on'];

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * The blank box as it's lived, in a plain chat window. An advisor starts, deletes and starts again,
 * then gets a generic answer that raises every other job: explaining themselves and checking what
 * they can say. Runs only while on screen, can be paused, and shows the whole exchange for reduced motion.
 */
export function BlankComposer() {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const root = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const watch = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting), { threshold: 0.5 });
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  useEffect(() => {
    if (still || paused || !seen) return;
    let live = true;
    const wait = async (ms: number) => {
      await sleep(ms);
      if (!live) throw new Error('stopped');
    };
    const type = async (text: string) => {
      for (let i = 1; i <= text.length; i++) {
        setDraft(text.slice(0, i));
        await wait(38 + Math.random() * 42);
      }
    };
    const erase = async (text: string) => {
      for (let i = text.length - 1; i >= 0; i--) {
        setDraft(text.slice(0, i));
        await wait(20);
      }
    };
    const reply = async (message: Message, sent: Message[]) => {
      const words = message.text.split(' ');
      for (let i = 1; i <= words.length; i++) {
        setMessages([...sent, { ...message, text: words.slice(0, i).join(' ') }]);
        await wait(70);
      }
    };
    const play = async () => {
      while (live) {
        setDraft('');
        setMessages([]);
        await wait(1100);
        for (const start of FALSE_STARTS) {
          await type(start);
          await wait(1000);
          await erase(start);
          await wait(650);
        }
        let sent: Message[] = [];
        for (const [question, answer] of TURNS) {
          await type(question.text);
          await wait(450);
          setDraft('');
          sent = [...sent, question];
          setMessages(sent);
          await wait(650);
          await reply(answer, sent);
          sent = [...sent, answer];
          await wait(1500);
        }
        await wait(2200);
      }
    };
    play().catch(() => {});
    return () => {
      live = false;
    };
  }, [still, paused, seen]);

  const shown = still ? TURNS.flat() : messages;

  return (
    <div ref={root} className={m.chat}>
      <p className="sr-only">An advisor starts a prompt, deletes it and starts again, then asks an AI tool to sound like them and whether they’re allowed to say what it wrote.</p>
      {!still && (
        <button type="button" className={m.chatPause} aria-label={paused ? 'Play' : 'Pause'} onClick={() => setPaused((now) => !now)}>
          <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M3 1.5h2v9H3zm4 0h2v9H7z" />}
          </svg>
        </button>
      )}
      <div className={m.thread} aria-hidden="true">
        {shown.length ? (
          shown.map((message, i) => (
            <p key={i} className={message.from === 'advisor' ? m.mine : m.theirs}>
              {message.text}
            </p>
          ))
        ) : (
          <p className={m.ask}>What would you like to write about?</p>
        )}
      </div>
      <div className={m.input} aria-hidden="true">
        <span className={m.plus}>+</span>
        <p className={cx(!draft && m.hint)}>
          {draft || (still ? '' : 'Ask anything')}
          {!still && <i />}
        </p>
        <span className={cx(m.sendKey, draft && m.sendReady)}>↑</span>
      </div>
    </div>
  );
}
