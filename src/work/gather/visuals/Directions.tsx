import type { ReactNode } from 'react';
import { smoothScrollTo } from '../../../lib/scroll';
import s from './Directions.module.css';

function Node({ x, y, w, h = 22, label, tone }: { x: number; y: number; w: number; h?: number; label: string; tone?: 'ink' | 'flag' }) {
  return (
    <g className={tone ? s[tone] : undefined}>
      <rect x={x} y={y} width={w} height={h} rx="6" />
      <text x={x + w / 2} y={y + h / 2 + 3.5} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

/** One answer splits the path, and the same question repeats on every branch. */
function Branching() {
  return (
    <svg className={s.diagram} viewBox="0 0 260 140" role="img" aria-label="A tree of questions. The same loan question repeats at the end of every branch.">
      <path className={s.line} d="M62 70 C72 70 70 38 80 38 M62 70 C72 70 70 102 80 102 M136 38 C144 38 142 18 152 18 M136 38 C144 38 142 56 152 56 M136 102 C144 102 142 84 152 84 M136 102 C144 102 142 122 152 122 M198 18 H210 M198 56 H210 M198 84 H210 M198 122 H210" />
      <Node x={2} y={59} w={60} label="How you earn" tone="ink" />
      <Node x={80} y={27} w={56} label="Salaried" />
      <Node x={80} y={91} w={56} label="Self-empl." />
      <Node x={152} y={7} w={46} label="ESOPs?" />
      <Node x={152} y={45} w={46} label="Bonus?" />
      <Node x={152} y={73} w={46} label="GST?" />
      <Node x={152} y={111} w={46} label="Partners?" />
      {[7, 45, 73, 111].map((y) => (
        <Node key={y} x={210} y={y} w={48} label="Loans?" tone="flag" />
      ))}
    </svg>
  );
}

/** Four tidy forms, and one real household that fits none of them. */
function Templates() {
  return (
    <svg className={s.diagram} viewBox="0 0 260 140" role="img" aria-label="Clients pick one of four life-stage forms. A self-employed couple supporting parents fits none of them.">
      <path className={s.line} d="M56 70 C70 70 68 19 84 19 M56 70 C70 70 68 54 84 54 M56 70 C70 70 68 88 84 88 M56 70 C70 70 68 122 84 122" />
      <Node x={2} y={59} w={54} label="Pick one" tone="ink" />
      {['Early career', 'Young family', 'Pre-retirement', 'Retired'].map((name, i) => (
        <Node key={name} x={84} y={7 + i * 34.5} w={76} h={24} label={name} />
      ))}
      <g className={s.flag}>
        <rect x={174} y={38} width={84} height={64} rx="7" strokeDasharray="3 2.5" />
        <text x={216} y={60} textAnchor="middle">
          Self-employed,
        </text>
        <text x={216} y={72} textAnchor="middle">
          joint plan,
        </text>
        <text x={216} y={84} textAnchor="middle">
          parents to support
        </text>
      </g>
    </svg>
  );
}

/** Strong in the room; nothing moves between meetings. */
function AdvisorLed() {
  return (
    <svg className={s.diagram} viewBox="0 34 260 56" role="img" aria-label="Three meetings in a row, with the client on their own between each one.">
      <Node x={2} y={54} w={52} h={32} label="Meeting 1" tone="ink" />
      <path className={s.dash} d="M58 70 H84" />
      <Node x={88} y={54} w={52} h={32} label="Meeting 2" tone="ink" />
      <path className={s.dash} d="M144 70 H170" />
      <Node x={174} y={54} w={52} h={32} label="Meeting 3" tone="ink" />
      <path className={s.dash} d="M230 70 H258" />
      <text className={s.wait} x={71} y={46} textAnchor="middle">
        client alone
      </text>
      <text className={s.wait} x={157} y={46} textAnchor="middle">
        client alone
      </text>
    </svg>
  );
}

const DIRECTIONS: { name: string; diagram: ReactNode; strength: string; limit: string }[] = [
  { name: 'Branching logic', diagram: <Branching />, strength: 'Showing only relevant questions worked,', limit: 'but the logic became hard to maintain.' },
  { name: 'Life-stage templates', diagram: <Templates />, strength: 'More useful than broad demographics,', limit: 'but clients rarely fit neatly into one template.' },
  { name: 'Advisor-led onboarding', diagram: <AdvisorLed />, strength: 'Strong during meetings,', limit: 'but weak for clients completing the process alone.' },
];

const FLOW = [
  { id: 'gateway', name: 'Gateway questions' },
  { id: 'pathways', name: 'Adaptive pathways' },
  { id: 'capture', name: 'Progressive capture' },
  { id: 'summary', name: 'Advisor-ready summary' },
];

/** Visual 06. Three structures, each with its weak spot drawn in, and what was taken forward. */
export function Directions() {
  return (
    <div className={s.wrap}>
      <div className={s.cards}>
        {DIRECTIONS.map((direction, i) => (
          <article key={direction.name} className={s.card}>
            <div>
              <span className={s.n}>Direction {i + 1}</span>
              <h3>{direction.name}</h3>
              <p>
                {direction.strength} <b>{direction.limit}</b>
              </p>
            </div>
            {direction.diagram}
          </article>
        ))}
      </div>
      <div className={s.chosen}>
        <p>What we took forward</p>
        <ol>
          {FLOW.map((step) => (
            <li key={step.id}>
              <a href={`#cs-${step.id}`} onClick={smoothScrollTo(`cs-${step.id}`)}>
                {step.name}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
