import { cx } from '../../../lib/cx';
import g from '../Gather.module.css';
import { Sticky } from './Sticky';
import s from './PullTogether.module.css';

const TASKS = [
  { title: 'Two banks, two logins', body: 'Balances are easy. Twelve months of statements is not.' },
  { title: 'The LIC policy', body: 'Two policies, one possibly lapsed. Documents are at her parents’.' },
  { title: 'Email the CA', body: 'Last year’s ITR. He takes a week to reply.' },
  { title: 'Ask Rohan', body: 'His EPF, his side of the goals. Travelling until Thursday.' },
  { title: 'EPF passbook', body: 'The OTP goes to an old number.' },
  { title: 'Mutual fund folios', body: 'Three platforms. One password reset away, each.' },
];

const TILT = [-.5, .4, .3, -.4, .4, -.3];

/** Visual 02. One spreadsheet on the desk, with its errands stuck up around it. */
export function PullTogether() {
  return (
    <div className={s.scene}>
      <div className={s.sheet} aria-hidden="true">
        <span className={s.sheetName}>Client_Information.xlsx</span>
        <span className={s.grid}>
          {Array.from({ length: 24 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      </div>
      <p className={s.count}>
        <b>47 questions</b> and a document list
      </p>
      {TASKS.map((task, i) => (
        <Sticky key={task.title} className={cx(s.task, s[`t${i + 1}`], g.effort)} tilt={TILT[i]}>
          <i aria-hidden="true" />
          <b>{task.title}</b>
          <span>{task.body}</span>
        </Sticky>
      ))}
      <p className={s.close}>She closes the laptop. The weekend, properly.</p>
    </div>
  );
}
