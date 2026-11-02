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

type Kind = Mark | 'team';

const LEGEND: [string, Kind][] = [
  ['Client friction', 'pause'],
  ['Information dependency', 'dependency'],
  ['Advisor intervention', 'team'],
  ['Positive moment', 'good'],
];

/** The hand that stuck each note up: no two lean the same way. */
const tilt = (stage: number, note: number) => [-.5, .4, -.3, .5, -.4, .3][(stage + note * 2) % 6];

/**
 * Visual 03. The advisors' walkthrough as a research wall: six stages read across, four
 * lanes read down. The legend filters it. On phones it's a swipe, one stage at a time,
 * with its numbers as the way to jump.
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
    setStage(Math.round(el.scrollLeft / step));
  };
  const jump = (i: number) => {
    const el = scroller.current;
    const column = el?.querySelector<HTMLElement>(`[data-stage="${i}"]`);
    if (el && column) el.scrollTo({ left: column.offsetLeft - el.querySelector<HTMLElement>('[data-stage="0"]')!.offsetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <div className={s.frame} data-only={only ?? undefined}>
      <p className={s.swipe}>Swipe to see all six stages →</p>
      <div className={s.jump}>
        {STAGES.map((item, i) => (
          <button key={item.name} type="button" className={cx(i === stage && s.jumpOn)} aria-label={`Stage ${i + 1}: ${item.name}`} aria-current={i === stage ? 'step' : undefined} onClick={() => jump(i)}>
            {i + 1}
          </button>
        ))}
      </div>
      <div ref={scroller} className={s.scroll} tabIndex={0} role="group" aria-label="Current-state journey across six stages" onScroll={onScroll}>
        <div className={s.map}>
          {STAGES.map((item, i) => (
            <section key={item.name} className={s.col} data-stage={i}>
              <p className={s.lane}>Journey stages</p>
              <h4 className={s.stage}>
                <span aria-hidden="true">{i + 1}</span>
                {item.name}
              </h4>

              <p className={s.lane}>What happens</p>
              <div className={s.happens}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
                <p>{item.happens}</p>
              </div>

              <p className={s.lane}>What we saw</p>
              <div className={s.notes}>
                {item.saw.map(([text, mark], n) => (
                  <Sticky key={text} className={cx(s.note, s[mark])} tilt={tilt(i, n)}>
                    <p>{text}</p>
                  </Sticky>
                ))}
              </div>

              <p className={s.lane}>Where clients pause</p>
              <div className={s.pauseCell}>
                <i className={s[item.mark]} aria-hidden="true" />
                <p>{item.pause}</p>
              </div>

              <p className={s.lane}>Team interventions</p>
              <div className={s.notes}>
                <p className={cx(s.card, s.team)}>{item.team}</p>
              </div>
            </section>
          ))}
        </div>
      </div>

      <p className={s.insight}>
        <b>Key insight.</b> The biggest friction came from asking everything upfront, without tailoring to the client’s situation. Advisors carried the load of clarification and follow-up.
      </p>
      <div className={s.legend} role="group" aria-label="Filter the wall by kind of note">
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
