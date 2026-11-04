import { Evidence, OutcomeCards } from '../../../pages/CaseStudy/kit';
import s from './Outcomes.module.css';

const MEASURED = 'Measured during usability testing of the redesigned flow.';
const REPORTED = 'Reported figure for overall onboarding time, still pending verification. It isn’t a usability-test result.';

const measured = (title: string) => (
  <Evidence status="measured" note={MEASURED}>
    {title}
  </Evidence>
);

/** The results up front: the lead result, what backs it up, and the reported figure kept apart. */
export function Outcomes() {
  return (
    <OutcomeCards
      lead={{ status: 'measured', value: <>32% {measured('faster completion')}</>, body: 'Clients reached the first onboarding milestone sooner.' }}
      items={[
        { status: 'measured', value: <>50% {measured('fewer advisor prompts')}</>, body: 'Clearer questions reduced the need for help.' },
        { status: 'measured', value: <>84% {measured('task completion')}</>, body: 'Most participants completed the core flow without assistance.' },
      ]}
      apart={{
        status: 'reported',
        value: (
          <Evidence status="unconfirmed" note={REPORTED}>
            3 weeks → under 4 days
          </Evidence>
        ),
        body: 'The overall reduction in onboarding time. It’s a separate figure from the testing above.',
      }}
    />
  );
}

const METRICS = [
  { value: '32%', label: 'faster completion' },
  { value: '50%', label: 'fewer advisor prompts' },
  { value: '84%', label: 'task completion' },
];

/** The three testing numbers. */
export function Results() {
  return (
    <div>
      <p className={s.eyebrow}>Measured in usability testing</p>
      <div className={s.metrics}>
        {METRICS.map((metric) => (
          <div key={metric.value}>
            <p className={s.value}>{metric.value}</p>
            <p className={s.label}>{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
