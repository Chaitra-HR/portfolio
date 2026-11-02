import { cx } from '../../../lib/cx';
import { CLIENTS, isAsked, QUESTIONS, type Household } from '../content';
import s from './Pathways.module.css';

const ROUTES: { name: string; about: string; answers: string[]; route: string[]; household: Household[] }[] = [
  {
    name: CLIENTS.meera.name,
    about: 'Planning with a partner',
    answers: ['With my partner', 'Salaried', 'Home loan'],
    route: ['Shared goals', 'Household', 'Income', 'Home and loans', 'Investments', 'Insurance'],
    household: CLIENTS.meera.household,
  },
  {
    name: CLIENTS.arjun.name,
    about: 'Managing finances alone',
    answers: ['Just me', 'Self-employed', 'Renting'],
    route: ['Your circumstances', 'Business income', 'Investments', 'Insurance', 'Your goals'],
    household: CLIENTS.arjun.household,
  },
];

/** Visual 08. Two clients, two routes, the same 47 questions accounted for. */
export function Pathways() {
  return (
    <div className={s.wrap}>
      <p className={s.start}>Gateway questions</p>
      <svg className={s.fork} viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 0 V10 M25 24 V16 Q25 10 31 10 H69 Q75 10 75 16 V24" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={s.routes}>
        {ROUTES.map((client) => (
          <article key={client.name} className={s.route}>
            <header>
              <span aria-hidden="true">{client.name[0]}</span>
              <p>
                <b>{client.name}</b>
                {client.about}
              </p>
            </header>
            <p className={s.answers}>
              {client.answers.map((answer) => (
                <span key={answer}>{answer}</span>
              ))}
            </p>
            <ol>
              {client.route.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className={s.ticks} role="img" aria-label={`${client.name} is asked ${QUESTIONS.filter((q) => isAsked(q, client.household)).length} of the 47 questions. The rest are settled by a gateway answer.`}>
              {QUESTIONS.map((q) => (
                <i key={q.n} className={cx(isAsked(q, client.household) && s.asked)} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
