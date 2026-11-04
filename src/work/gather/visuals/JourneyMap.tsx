import { useRef, useState } from 'react';
import { cx } from '../../../lib/cx';
import { prefersReducedMotion } from '../../../lib/scroll';
import { Sticky } from './Sticky';
import s from './JourneyMap.module.css';

type Mark = 'pause' | 'dependency' | 'good';

interface Stage {
  name: string;
  icon: string;
  happens: string;
  saw: [string, Mark][];
  pause: string;
  mark: Mark;
  team: string;
}

const STAGES: Stage[] = [
  {
    name: 'First meeting',
    icon: 'M3 4.5h14v9.5H9l-3.5 3v-3H3v-9.5Z',
    happens: 'Advisor understands client goals and explains the process.',
    saw: [
      ['Usually the easy part. The client had already decided.', 'good'],
      ['Many asked what information they needed to prepare.', 'pause'],
    ],
    pause: 'Unclear what will be asked of them',
    mark: 'pause',
    team: 'Advisor explains what to expect',
  },
  {
    name: 'Onboarding sent',
    icon: 'M2.5 5h15v10.5h-15V5Zm0 .5L10 11l7.5-5.5',
    happens: 'Spreadsheet (47 questions) and document checklist are sent.',
    saw: [
      ['The form felt long and intimidating.', 'pause'],
      ['Some clients asked if all sections applied to them.', 'pause'],
    ],
    pause: 'The form feels too long or not relevant',
    mark: 'pause',
    team: 'Advisor reassures and encourages completion',
  },
  {
    name: 'Client completes form and shares docs',
    icon: 'M11.5 2.5H5v15h10V6l-3.5-3.5Zm0 0V6H15M10 14V9m-2 2 2-2 2 2',
    happens: 'Client works on the form and gathers documents from various sources.',
    saw: [
      ['Clients needed info from bank portals, partners or accountants.', 'dependency'],
      ['Documents arrived in pieces, not all at once.', 'dependency'],
    ],
    pause: 'Hard to access information and documents',
    mark: 'dependency',
    team: 'Advisor guides on what’s needed and where to find it',
  },
  {
    name: 'Advisor reviews',
    icon: 'M9 15.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Zm4.7-1.8L17.5 17.5',
    happens: 'Advisor reviews the submission and checks for completeness.',
    saw: [
      ['Forms came back incomplete.', 'pause'],
      ['Some answers needed more context.', 'pause'],
    ],
    pause: 'Unsure how to answer certain questions',
    mark: 'pause',
    team: 'Advisor interprets answers and checks details',
  },
  {
    name: 'Follow-up and missing info',
    icon: 'M16.5 8A7 7 0 0 0 4 6.5M3.5 12A7 7 0 0 0 16 13.5M4 3v3.5h3.5M16 17v-3.5h-3.5',
    happens: 'Advisor follows up for missing answers and clarifications.',
    saw: [
      ['Advisors spent significant time chasing missing information.', 'dependency'],
      ['The same questions had to be explained again.', 'dependency'],
    ],
    pause: 'Back-and-forth to clarify and collect missing details',
    mark: 'dependency',
    team: 'Advisor follows up, clarifies and collects missing info',
  },
  {
    name: 'Plan ready',
    icon: 'M10 17.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM6.5 10.3l2.4 2.4 4.7-5',
    happens: 'All information is in. File is complete and planning begins.',
    saw: [
      ['Once complete, files were comprehensive.', 'good'],
      ['Time to get here varied widely across clients.', 'pause'],
    ],
    pause: 'Long time to reach a plan-ready file',
    mark: 'good',
    team: 'Advisor assembles final file and verifies completeness',
  },
];

/** The stages grouped the way advisors talked about them: [name, how many stages]. */
const PHASES: [string, number][] = [
  ['Getting started', 2],
  ['Gathering', 1],
  ['Review and plan', 3],
];

const LANES = ['Journey stages', 'What happens', 'What we saw', 'Where clients pause', 'Team interventions'];

type Kind = Mark | 'team';

const LEGEND: [string, Kind][] = [
  ['Client friction', 'pause'],
  ['Information dependency', 'dependency'],
  ['Advisor intervention', 'team'],
  ['Positive moment', 'good'],
];

/** How far down the feeling line each kind of stage sits, out of the curve's 64px. */
const FEEL: Record<Mark, number> = { good: 14, pause: 32, dependency: 50 };

/** The hand that stuck each note up: no two lean the same way. */
const tilt = (stage: number, note: number) => [-.5, .4, -.3, .5, -.4, .3][(stage + note * 2) % 6];

/** One stretch of the feeling line: in from halfway to the last stage, out to halfway to the next. */
function curve(i: number) {
  const y = FEEL[STAGES[i].mark];
  const before = i > 0 ? (FEEL[STAGES[i - 1].mark] + y) / 2 : y;
  const after = i < STAGES.length - 1 ? (FEEL[STAGES[i + 1].mark] + y) / 2 : y;
  return `M0 ${before}C25 ${before} 25 ${y} 50 ${y}S75 ${after} 100 ${after}`;
}

const Arrow = () => (
  <svg className={s.arrow} viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 1.5v16M1.5 13 6 17.5 10.5 13" />
  </svg>
);

/**
 * Visual 03. The advisors' walkthrough as a journey board: phases along the top, six
 * stages read across, five lanes read down, with a line through the pauses for how each
 * stage felt. The legend filters it. Narrower than the board, it scrolls under its pinned
 * lane names; on phones each stage becomes its own card.
 */
export function JourneyMap() {
  const [only, setOnly] = useState<Kind | null>(null);
  const [stage, setStage] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const columns = [...el.querySelectorAll<HTMLElement>('[data-stage]')];
    const step = columns[1].offsetLeft - columns[0].offsetLeft;
    const end = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
    setStage(end ? columns.length - 1 : Math.round(el.scrollLeft / step));
  };
  const jump = (i: number) => {
    const el = scroller.current;
    const column = el?.querySelector<HTMLElement>(`[data-stage="${i}"]`);
    if (el && column) el.scrollTo({ left: column.offsetLeft - el.querySelector<HTMLElement>('[data-stage="0"]')!.offsetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  let start = 2;
  return (
    <div className={s.frame} data-only={only ?? undefined}>
      <div className={s.top}>
        <p className={s.swipe}>Scroll to see all six stages →</p>
        <div className={s.jump}>
          {STAGES.map((item, i) => (
            <button key={item.name} type="button" className={cx(i === stage && s.jumpOn)} aria-label={`Stage ${i + 1}: ${item.name}`} aria-current={i === stage ? 'step' : undefined} onClick={() => jump(i)}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <div ref={scroller} className={s.scroll} tabIndex={0} role="group" aria-label="Current-state journey across six stages" onScroll={onScroll}>
        <div className={s.map}>
          <div className={s.corner} aria-hidden="true" />
          {PHASES.map(([name, span], p) => {
            const column = `${start} / span ${span}`;
            start += span;
            return (
              <p key={name} className={cx(s.phase, s[`phase${p + 1}`])} style={{ gridColumn: column }}>
                {name}
              </p>
            );
          })}

          <div className={s.labels} aria-hidden="true">
            {LANES.map((lane, l) => (
              <p key={lane} className={cx(s.label, s[`band${l + 1}`])}>
                {lane}
                {l === 3 && (
                  <span className={s.scale}>
                    <span>Smooth</span>
                    <span>Stuck</span>
                  </span>
                )}
              </p>
            ))}
          </div>

          {STAGES.map((item, i) => (
            <section key={item.name} className={s.col} data-stage={i} style={{ gridColumn: i + 2 }}>
              <div className={cx(s.cell, s.band1)}>
                <Sticky className={s.stageNote} tilt={tilt(i + 1, 0)}>
                  <h4 className={s.stage}>
                    <span aria-hidden="true">{i + 1}</span>
                    {item.name}
                  </h4>
                </Sticky>
              </div>

              <div className={cx(s.cell, s.band2)}>
                <Arrow />
                <p className={s.lane}>{LANES[1]}</p>
                <div className={s.happens}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={item.icon} />
                  </svg>
                  <p>{item.happens}</p>
                </div>
              </div>

              <div className={cx(s.cell, s.band3)}>
                <Arrow />
                <p className={s.lane}>{LANES[2]}</p>
                <div className={s.notes}>
                  {item.saw.map(([text, mark], n) => (
                    <Sticky key={text} className={cx(s.note, s[mark])} tilt={tilt(i, n)}>
                      <p>{text}</p>
                    </Sticky>
                  ))}
                </div>
              </div>

              <div className={cx(s.cell, s.band4, s.pauseCell)}>
                <p className={s.lane}>{LANES[3]}</p>
                <svg className={s.curve} viewBox="0 0 100 64" preserveAspectRatio="none" aria-hidden="true">
                  <path d={curve(i)} vectorEffect="non-scaling-stroke" />
                </svg>
                <i className={s[item.mark]} style={{ '--y': `${FEEL[item.mark]}px` }} aria-hidden="true" />
                <p>{item.pause}</p>
              </div>

              <div className={cx(s.cell, s.band5)}>
                <Arrow />
                <p className={s.lane}>{LANES[4]}</p>
                <p className={cx(s.card, s.team)}>{item.team}</p>
              </div>
            </section>
          ))}
        </div>
      </div>

      <p className={s.insight}>
        <b>Key insight.</b> The biggest friction came from asking everything upfront, without tailoring to the client’s situation. Advisors carried the load of clarification and follow-up.
      </p>
      <div className={s.legend} role="group" aria-label="Filter the board by kind of note">
        {LEGEND.map(([label, kind]) => (
          <button
            key={label}
            type="button"
            className={cx(s.key, only === kind && s.keyOn)}
            aria-pressed={only === kind}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setOnly(kind)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setOnly(null)}
            onFocus={() => setOnly(kind)}
            onBlur={() => setOnly(null)}
            onClick={() => setOnly((v) => (v === kind ? null : kind))}
          >
            <i className={s[kind]} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
