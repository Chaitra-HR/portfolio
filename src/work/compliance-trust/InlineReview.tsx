import { Fragment, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import sam from '../../assets/images/compliance/sam.jpg';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';
import { study } from '../../pages/CaseStudy/kit';
import c from './Compliance.module.css';

type Outcome = 'open' | 'accepted' | 'rewritten' | 'kept';

interface Flag {
  id: string;
  phrase: string;
  label: string;
  why: string;
  suggestion: string;
}

const FLAGS: Flag[] = [
  {
    id: 'promise',
    phrase: 'is guaranteed to beat inflation',
    label: 'Sounds like a promise',
    why: 'Investment outcomes aren’t certain, so wording like this can read as a promise. It may need softening under ASIC’s requirements.',
    suggestion: 'is designed to outpace inflation over the long term, though returns aren’t guaranteed',
  },
  {
    id: 'performance',
    phrase: 'returned 14% last year',
    label: 'Performance claim',
    why: 'A performance figure may need evidence behind it, and context such as the period it covers. It’s worth checking before you publish.',
    suggestion: 'returned 14% last year, though past performance isn’t a reliable guide to future returns',
  },
];

const POST: (string | number)[] = ['Markets have been noisy this year, but our growth portfolio ', 0, '. It ', 1, '. Book a call and we’ll talk it through.'];

interface HistoryRow {
  flagged: string;
  concern: string;
  action: string;
  when: string;
}

/** The sample post with its flagged phrases marked, read-only. */
function Post({ marked }: { marked?: boolean }) {
  return (
    <p className={c.post}>
      {POST.map((part, i) =>
        typeof part === 'string' ? <Fragment key={i}>{part}</Fragment> : marked ? <span key={i} className={c.markStill}>{FLAGS[part].phrase}</span> : <Fragment key={i}>{FLAGS[part].phrase}</Fragment>,
      )}
    </p>
  );
}

/** What was flagged and what the advisor did about it. */
function ReviewHistory({ rows, onReset }: { rows: HistoryRow[]; onReset?: () => void }) {
  return (
    <div className={c.history}>
      <p className={c.historyHead}>
        <b>Review history</b>
        {onReset && (
          <button type="button" onClick={onReset}>
            Start again
          </button>
        )}
      </p>
      <ul>
        {rows.map((row) => (
          <li key={row.flagged}>
            <span className={c.flagged}>…{row.flagged}…</span>
            <span>{row.concern}</span>
            <b>{row.action}</b>
            <span>{row.when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Whether a flag's wording is still a concern, so a small edit doesn't clear it but a real rewrite does. */
const STILL_FLAGGED: Record<string, (text: string, post: string) => boolean> = {
  promise: (text) => /guarantee/i.test(text) && !/(n[’']t|not)\s+guarantee/i.test(text),
  performance: (text, post) => /\d\s*%/.test(text) && !/past performance/i.test(post),
};

const ACTION: Record<Exclude<Outcome, 'open'>, string> = {
  accepted: 'Used the suggestion',
  rewritten: 'Rewrote it myself',
  kept: 'Left as written',
};

const RECHECK_MS = 700;

interface Card {
  id: string;
  x: number;
  y: number;
}

/**
 * The inline review as a working editor: the post is real text with its concerns marked. Hover or
 * click a mark for a card at the word, take the suggestion in place or rewrite it, and typing
 * rechecks as you go. Both ways forward carry the same weight, because the rewrite shouldn't be
 * the only obvious one. The text is left to the browser once it's written, so the caret survives.
 */
export function InlineReview() {
  const [open, setOpen] = useState(() => FLAGS.map((flag) => flag.id));
  const [card, setCard] = useState<Card | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const pinned = useRef(false);
  const moveFocus = useRef(false);
  const pause = useRef(0);
  const openNow = useRef(open);
  openNow.current = open;

  const mark = (id: string) => editor.current?.querySelector<HTMLElement>(`[data-flag="${id}"]`) ?? null;
  const flag = FLAGS.find((f) => f.id === card?.id);

  const write = () => {
    const el = editor.current;
    if (!el) return;
    el.textContent = '';
    POST.forEach((part) => {
      if (typeof part === 'string') return el.append(part);
      const span = document.createElement('span');
      span.className = c.mark;
      span.dataset.flag = FLAGS[part].id;
      span.textContent = FLAGS[part].phrase;
      el.append(span);
    });
  };

  useEffect(write, []);

  useEffect(() => {
    editor.current?.querySelectorAll<HTMLElement>('[data-flag]').forEach((el) => el.classList.toggle(c.markOn, el.dataset.flag === card?.id));
  }, [card, open]);

  useLayoutEffect(() => {
    if (!moveFocus.current || !card) return;
    moveFocus.current = false;
    pop.current?.querySelector('button')?.focus();
  }, [card]);

  const show = (id: string, pin: boolean) => {
    const el = mark(id);
    const box = wrap.current?.getBoundingClientRect();
    if (!el || !box) return;
    clearTimeout(timer.current);
    pinned.current = pin;
    const lines = el.getClientRects();
    const line = lines[lines.length - 1];
    const width = Math.min(340, box.width - 32);
    setCard({ id, x: Math.max(16, Math.min(line.left - box.left, box.width - width - 16)), y: line.bottom - box.top + 8 });
  };

  const hide = () => {
    clearTimeout(timer.current);
    pinned.current = false;
    setCard(null);
  };

  const hideSoon = () => {
    clearTimeout(timer.current);
    if (!pinned.current) timer.current = window.setTimeout(hide, 220);
  };

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) hide();
    };
    document.addEventListener('pointerdown', onDown);
    addEventListener('resize', hide);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      removeEventListener('resize', hide);
      clearTimeout(timer.current);
      clearTimeout(pause.current);
    };
  }, []);

  const settle = (ids: string[], outcome: Exclude<Outcome, 'open'>) => {
    if (!ids.length) return;
    const when = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const rows = FLAGS.filter((f) => ids.includes(f.id)).map((f) => ({ flagged: f.phrase, concern: f.label, action: ACTION[outcome], when }));
    setOpen((now) => now.filter((id) => !ids.includes(id)));
    setHistory((now) => [...now, ...rows]);
    hide();
  };

  /** The mark comes off but the span stays, so a caret inside it doesn't move. */
  const unmark = (el: HTMLElement | null) => {
    if (!el) return;
    delete el.dataset.flag;
    el.className = c.settled;
  };

  const useSuggestion = (target: Flag) => {
    const el = mark(target.id);
    if (!el) return;
    el.textContent = target.suggestion;
    unmark(el);
    el.classList.add(c.applied);
    settle([target.id], 'accepted');
  };

  const rewrite = (target: Flag) => {
    const el = mark(target.id);
    if (!el) return;
    hide();
    editor.current?.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const keep = (target: Flag) => {
    unmark(mark(target.id));
    settle([target.id], 'kept');
  };

  /** Checks once typing pauses, so the first letter of a rewrite doesn't count as the rewrite. */
  const recheck = () => {
    hide();
    clearTimeout(pause.current);
    pause.current = window.setTimeout(() => {
      const cleared = openNow.current.filter((id) => {
        const el = mark(id);
        if (el && STILL_FLAGGED[id](el.textContent ?? '', editor.current?.textContent ?? '')) return false;
        unmark(el);
        return true;
      });
      settle(cleared, 'rewritten');
    }, RECHECK_MS);
  };

  /** Typing over a whole marked phrase would take the mark with it, so the new words go inside it and get rechecked. */
  const typeOver = (e: FormEvent<HTMLDivElement>) => {
    const data = (e.nativeEvent as InputEvent).data;
    const selection = getSelection();
    const el = selection?.anchorNode?.parentElement?.closest<HTMLElement>('[data-flag]');
    if (!data || !selection || !el || selection.toString() !== el.textContent) return;
    e.preventDefault();
    el.textContent = data;
    selection.collapse(el, 1);
    recheck();
  };

  const next = () => {
    if (!open.length) return;
    moveFocus.current = true;
    show(open[0], true);
  };

  const reset = () => {
    hide();
    clearTimeout(pause.current);
    write();
    setOpen(FLAGS.map((f) => f.id));
    setHistory([]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Escape' || !card) return;
    const inCard = pop.current?.contains(document.activeElement);
    hide();
    if (inCard) count.current?.focus();
  };

  return (
    <div className={c.screen} onKeyDown={onKeyDown}>
      <div className={c.bar}>
        <span className={c.doc}>LinkedIn post · Australia, ASIC</span>
        <button ref={count} type="button" className={cx(c.count, !open.length && c.countDone)} aria-live="polite" disabled={!open.length} onClick={next}>
          {open.length ? `${open.length} may need attention` : 'Nothing left to review'}
        </button>
      </div>

      <div ref={wrap} className={c.editor}>
        <div
          ref={editor}
          className={cx(c.post, c.editable)}
          contentEditable="plaintext-only"
          suppressContentEditableWarning
          spellCheck={false}
          role="textbox"
          aria-multiline="true"
          aria-label="Sample LinkedIn post. Marked phrases may need attention."
          onBeforeInput={typeOver}
          onInput={recheck}
          onPointerOver={(e) => {
            const id = (e.target as Element).closest<HTMLElement>('[data-flag]')?.dataset.flag;
            if (!id || e.pointerType !== 'mouse' || pinned.current) return;
            clearTimeout(timer.current);
            timer.current = window.setTimeout(() => show(id, false), 140);
          }}
          onPointerOut={hideSoon}
          onClick={(e) => {
            const id = (e.target as Element).closest<HTMLElement>('[data-flag]')?.dataset.flag;
            if (id) show(id, true);
            else hide();
          }}
        />

        {flag && card && (
          <div ref={pop} className={c.pop} style={{ left: card.x, top: card.y }} onPointerEnter={() => clearTimeout(timer.current)} onPointerLeave={hideSoon}>
            <p className={c.tag}>{flag.label}</p>
            <p className={c.why}>{flag.why}</p>
            <p className={c.why}>
              <b>Suggested change</b>
              {flag.suggestion}
            </p>
            <div className={c.actions}>
              <button type="button" onClick={() => rewrite(flag)}>
                Rewrite it myself
              </button>
              <button type="button" onClick={() => useSuggestion(flag)}>
                Use the suggestion
              </button>
            </div>
            <button type="button" className={c.keep} onClick={() => keep(flag)}>
              Leave as written
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && <ReviewHistory rows={history} onReset={reset} />}
    </div>
  );
}

const POST_RISKS = [
  { title: 'Sounds like a promise', risk: 'No investment can guarantee returns. Wording like this could be treated as misleading, which can lead to regulator action and fines.' },
  { title: 'Performance claim without context', risk: 'A bare return figure may need evidence and its period. Without them it can read as a forecast, and the firm may have to correct it.' },
  { title: 'Missing disclosure', risk: 'Nothing says past performance isn’t a reliable guide. The omission can leave the advisor and the licensee exposed.' },
];

const LI_ACTIONS = [
  ['Like', 'M7 10v10H3V10zM7 20h10.500a2 2 0 0 0 2-1.600l1.3-6A2 2 0 0 0 18.9 10H14l.8-4a2 2 0 0 0-2-2.500L7 10'],
  ['Comment', 'M4 5h16v11H9l-5 4z'],
  ['Repost', 'M4 11V8a2 2 0 0 1 2-2h12l-3-3M20 13v3a2 2 0 0 1-2 2H6l3 3'],
  ['Send', 'M21 3 3 10.500l7 3 3 7.500zM10 13.5 21 3'],
];

/** A convincing AI post as it would appear on LinkedIn, with what each line could cost. */
export function AnnotatedPost() {
  return (
    <div className={c.linkedin}>
      <article className={c.li}>
        <header className={c.liHead}>
          <img src={sam} alt="" width="48" height="48" />
          <p>
            <b>
              Sam Mercer <i>• 2nd</i>
            </b>
            <span>Financial Adviser at Harbour Wealth</span>
            <span>
              2h • <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm4.9 6h-2a10 10 0 0 0-.8-3.3A5 5 0 0 1 12.9 7ZM8 3c.5.6 1.1 2 1.3 4H6.700C6.9 5 7.5 3.6 8 3ZM3.1 9h2c.1 1.2.4 2.4.8 3.300A5 5 0 0 1 3.1 9Zm2-2h-2a5 5 0 0 1 2.8-3.300A10 10 0 0 0 5.1 7ZM8 13c-.5-.6-1.1-2-1.3-4h2.600c-.2 2-.8 3.4-1.3 4Zm2.1-.7c.4-.9.7-2.1.8-3.300h2a5 5 0 0 1-2.8 3.300Z" /></svg>
            </span>
          </p>
          <span className={c.liFollow}>+ Follow</span>
        </header>
        <p className={c.liText}>
          Markets have been noisy this year, but our growth portfolio <span className={c.markStill}>is guaranteed to beat inflation</span> <span className={study.pin}>1</span>. It <span className={c.markStill}>returned 14% last year</span> <span className={study.pin}>2</span>.
          <br />
          <br />
          Book a call and we’ll talk it through. <span className={study.pin}>3</span>
        </p>
        <div className={c.liStats}>
          <span className={c.liReact}>
            <i className={c.liLike} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 7h3v7H2zM6 14V7l3-5c1 0 2 .8 1.7 2L10 6h3.200c.8 0 1.4.8 1.2 1.600l-1.2 5.200c-.2.7-.8 1.2-1.5 1.200z" /></svg>
            </i>
            <i className={c.liHeart} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 14S2 10.5 2 6.200A3.2 3.2 0 0 1 8 4.600a3.2 3.2 0 0 1 6 1.600C14 10.5 8 14 8 14Z" /></svg>
            </i>
            48
          </span>
          <span>6 comments • 2 reposts</span>
        </div>
        <div className={c.liActions} aria-hidden="true">
          {LI_ACTIONS.map(([label, path]) => (
            <span key={label}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d={path} /></svg>
              {label}
            </span>
          ))}
        </div>
      </article>
      <ol className={c.risks}>
        {POST_RISKS.map((item, i) => (
          <li key={item.title}>
            <span className={study.pin}>{i + 1}</span>
            <div>
              <b>{item.title}</b>
              {item.risk}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** One 10-second loop shared by both drawings, so the straight line lands long before the review does. */
const FLOW_DUR = '10s';
const LOOP_TOKEN = 'M36 62 H480 C480 2 258 2 258 62 H554';
const LOOP_POINTS = '0.0000;0.1483;0.1483;0.4449;0.4449;0.7034;0.9259;0.9259;1.0000;1.0000';
const LOOP_TIMES = '0;.08;.2;.33;.45;.6;.72;.82;.9;1';

const LOOP = [['Write'], ['Submit'], ['Wait'], ['Get', 'flagged'], ['Fix'], ['Resubmit'], ['Wait', 'again'], ['Publish', '(maybe)']];
const DIRECT = [['Write'], ['See flags', 'in real time'], ['Understand', 'why'], ['Fix in', 'context'], ['Publish with', 'confidence']];

function Label({ x, y, lines }: { x: number; y: number; lines: string[] }) {
  return (
    <text x={x} y={y} textAnchor="middle">
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i ? 15 : 0}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/** The existing review as a loop with stalls in it, beside the suggested one as a straight line. */
export function WorkflowCompare() {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const loopX = (i: number) => 36 + i * 74;
  const directX = (i: number) => 52 + i * 122;
  return (
    <div className={c.flows}>
      <div>
        <p className={c.flowName}>Existing workflow</p>
        <svg className={c.flowArt} viewBox="0 0 592 136" role="img" aria-label="Write, submit, wait, get flagged, fix, resubmit, wait again, publish maybe. The review can loop back to being flagged.">
          <path className={c.flowBack} d={`M${loopX(6)} 44 C${loopX(6)} 2 ${loopX(3)} 2 ${loopX(3)} 44`} />
          <path className={c.flowBackHead} d={`M${loopX(3) - 5} 37 L${loopX(3)} 45 L${loopX(3) + 5} 37`} />
          <text className={c.flowNote} x={(loopX(3) + loopX(6)) / 2} y={32} textAnchor="middle">Can repeat</text>
          <path className={c.flowLine} d={`M${loopX(0)} 62 H${loopX(7)}`} />
          {LOOP.map((lines, i) => {
            const wait = i === 2 || i === 6;
            return (
              <g key={lines.join()}>
                <circle className={wait ? c.nodeWait : i === 7 ? c.nodeUnsure : c.nodePlain} cx={loopX(i)} cy={62} r={wait ? 14 : 11}>
                  {wait && !still && <animate attributeName="r" dur={FLOW_DUR} repeatCount="indefinite" values="14;14;18;14;14" keyTimes={i === 2 ? '0;.08;.14;.2;1' : '0;.72;.77;.82;1'} />}
                </circle>
                {wait && <path className={c.clock} d={`M${loopX(i)} 54 V62 L${loopX(i) + 5} 66`} />}
                <Label x={loopX(i)} y={98} lines={lines} />
              </g>
            );
          })}
          {!still && (
            <circle className={c.token} r={5}>
              <animateMotion dur={FLOW_DUR} repeatCount="indefinite" path={LOOP_TOKEN} calcMode="linear" keyPoints={LOOP_POINTS} keyTimes={LOOP_TIMES} />
            </circle>
          )}
        </svg>
      </div>
      <div>
        <p className={c.flowName}>Suggested workflow</p>
        <svg className={c.flowArt} viewBox="0 0 592 112" role="img" aria-label="Write, see flags in real time, understand why, fix in context, publish with confidence, all in one straight line.">
          <rect className={c.flowZone} x={directX(0) - 40} y={8} width={directX(3) - directX(0) + 80} height={52} rx={26} />
          <text className={c.flowNote} x={(directX(0) + directX(3)) / 2} y={22} textAnchor="middle">All in the editor</text>
          <path className={c.flowDirect} d={`M${directX(0)} 40 H${directX(4)}`} />
          {DIRECT.map((lines, i) => (
            <g key={lines.join()}>
              <circle className={i === 4 ? c.nodeDone : c.nodeInk} cx={directX(i)} cy={40} r={i === 4 ? 14 : 9}>
                {i === 4 && !still && <animate attributeName="r" dur={FLOW_DUR} repeatCount="indefinite" values="9;9;17;14;14" keyTimes="0;.28;.32;.36;1" />}
              </circle>
              {i === 4 && (
                <path className={c.tick} d={`M${directX(i) - 6} 40 l4 4 l8 -8`}>
                  {!still && <animate attributeName="opacity" dur={FLOW_DUR} repeatCount="indefinite" values="0;0;1;1" keyTimes="0;.29;.33;1" />}
                </path>
              )}
              <Label x={directX(i)} y={78} lines={lines} />
            </g>
          ))}
          {!still && (
            <circle className={c.tokenLight} r={5}>
              <animateMotion dur={FLOW_DUR} repeatCount="indefinite" path={`M${directX(0)} 40 H${directX(4)}`} calcMode="linear" keyPoints="0;1;1" keyTimes="0;.3;1" />
              <animate attributeName="opacity" dur={FLOW_DUR} repeatCount="indefinite" values="1;1;0;0" keyTimes="0;.29;.31;1" />
            </circle>
          )}
        </svg>
      </div>
    </div>
  );
}

const SEVERITIES = [
  { name: 'Critical', token: 'flag.critical', tone: c.critical, behavior: 'Asks for a decision before publishing', usage: 'Promissory language, false claims, missing disclosures that could trigger regulatory action' },
  { name: 'Warning', token: 'flag.warning', tone: c.warning, behavior: 'Allows publishing with acknowledgment', usage: 'Ambiguous phrasing, implied guarantees, statements needing context or qualification' },
  { name: 'Info', token: 'flag.info', tone: c.info, behavior: 'Non-blocking educational note', usage: 'Best practices, style suggestions, disclosure recommendations for stronger content' },
];

/** The three levels every flag belongs to. */
export function FlagTaxonomy() {
  return (
    <div className={c.taxonomy}>
      <p className={c.taxHead}>
        <span>Severity</span>
        <span>Behavior</span>
        <span>Usage</span>
      </p>
      {SEVERITIES.map((level) => (
        <div key={level.name} className={c.taxRow}>
          <p className={cx(c.level, level.tone)}>
            <b>{level.name}</b>
            <code>{level.token}</code>
          </p>
          <p>{level.behavior}</p>
          <p>{level.usage}</p>
        </div>
      ))}
    </div>
  );
}

/** The three pieces of the system, each shown working. */
export function FlagComponents() {
  return (
    <ul className={c.parts}>
      <li>
        <div className={c.partDemo}>
          <p className={c.partPost}>
            Your portfolio is <span className={c.markStill}>guaranteed to recover</span> if you stay the course.
          </p>
        </div>
        <div>
          <b>Inline Flag</b>
          <p>Highlighted phrase within the editor surface. Underline color matches severity. Hover reveals the guidance tooltip.</p>
        </div>
      </li>
      <li>
        <div className={c.partDemo}>
          <p className={c.rule}>SEC · Rule 206(4)-1</p>
          <p className={c.partPost}>
            May be considered <b>promissory language</b>
          </p>
          <p className={c.better}>“Markets have historically recovered”</p>
        </div>
        <div>
          <b>Guidance Tooltip</b>
          <p>Contextual explanation with regulation citation, plain-language risk description, and suggested alternative phrasing.</p>
        </div>
      </li>
      <li>
        <div className={c.partDemo}>
          <p className={c.status}>
            <span>2 items need attention</span>
            <i className={c.critical}>1</i>
            <i className={c.warning}>1</i>
          </p>
        </div>
        <div>
          <b>Status Bar</b>
          <p>Persistent compliance health indicator. Shows active flag count, severity breakdown, and publish readiness at a glance.</p>
        </div>
      </li>
    </ul>
  );
}

/** The end-of-draft report beside the inline review. */
export function ReviewCompare() {
  return (
    <div className={c.compare}>
      <div>
        <div className={c.screen}>
          <div className={c.bar}>
            <span className={c.doc}>End-of-draft review</span>
          </div>
          <Post />
          <ul className={c.report}>
            {FLAGS.map((flag) => (
              <li key={flag.id}>{flag.label}</li>
            ))}
          </ul>
        </div>
        <p className={c.note}>The advisor has to go back into the editor, find each sentence and work out what to change.</p>
      </div>
      <div>
        <div className={c.screen}>
          <div className={c.bar}>
            <span className={c.doc}>Inline review</span>
          </div>
          <Post marked />
          <div className={c.card}>
            <p className={c.tag}>{FLAGS[0].label}</p>
            <p className={c.why}>{FLAGS[0].why}</p>
          </div>
        </div>
        <p className={c.note}>The feedback sits alongside the writing, without turning the editor into a warning screen.</p>
      </div>
    </div>
  );
}

/** The advisor's region decides the context a flag is explained in. */
export function RegionContext() {
  return (
    <div className={c.screen}>
      <div className={c.bar}>
        <span className={c.doc}>Regulatory context</span>
        <ul className={c.regions} aria-label="Selected region: Australia">
          <li className={c.regionOn}>Australia, ASIC</li>
          <li>India, SEBI</li>
          <li>US, SEC and FINRA</li>
        </ul>
      </div>
      <div className={c.card} style={{ marginTop: 24 }}>
        <p className={c.tag}>…{FLAGS[0].phrase}…</p>
        <p className={c.why}>{FLAGS[0].why}</p>
      </div>
    </div>
  );
}

