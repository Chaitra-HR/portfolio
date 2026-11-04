import { useEffect, useRef, useState } from 'react';
import { cx } from '../../../lib/cx';
import { FRICTION, type Friction } from '../content';
import g from '../Gather.module.css';
import st from './Sticky.module.css';
import s from './Findings.module.css';

const QUOTES = [
  { text: 'These are very personal questions. I’m not comfortable filling all of this in.', who: 'De-identified client, Case A' },
  { text: 'There are too many questions here. Can I come back to this over the weekend?', who: 'De-identified client, Case B' },
  { text: 'A referrer asked whether it was safe to share this much sensitive information in a spreadsheet.', who: 'Advisor recall from a de-identified case, Case C' },
];

/** Visual 05. What came up when advisors rebuilt stalled cases. */
export function Quotes() {
  return (
    <div className={s.quotes}>
      {QUOTES.map((quote) => (
        <blockquote key={quote.who}>
          <p>“{quote.text}”</p>
          <cite>— {quote.who}</cite>
        </blockquote>
      ))}
    </div>
  );
}

const FRICTIONS: Friction[] = ['relevance', 'effort', 'trust'];

const TILT = [-.4, .3, -.3];
/** Time the reader gets to guess, then the gap between one note clearing and the next. */
const GUESS_MS = 1800;
const STEP_MS = 420;

/** The guess: the notes stay soft for a beat after they scroll in, one clears at a time, or tap to clear one. */
export function Frictions() {
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Friction[]>([]);
  const all = shown.length === FRICTIONS.length;

  useEffect(() => {
    if (all) return;
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(FRICTIONS);
    let timer = 0;
    const showNext = () => {
      setShown((seen) => {
        const next = FRICTIONS.find((type) => !seen.includes(type));
        return next ? [...seen, next] : seen;
      });
      timer = window.setTimeout(showNext, STEP_MS);
    };
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        timer = window.setTimeout(showNext, GUESS_MS);
      },
      { threshold: 0.6 },
    );
    seen.observe(el);
    return () => {
      seen.disconnect();
      clearTimeout(timer);
    };
  }, [all]);

  return (
    <div ref={root} className={s.frictions}>
      {FRICTIONS.map((type, i) => {
        const up = shown.includes(type);
        return (
          <button key={type} type="button" className={cx(st.sticky, s.friction, !up && s.hidden, g[type])} style={{ '--tilt': `${TILT[i]}deg` }} aria-label={up ? undefined : `Reveal note ${FRICTION[type].n}`} onClick={() => setShown((seen) => (seen.includes(type) ? seen : [...seen, type]))}>
            <span className={st.paper}>
              <span className={s.n}>{FRICTION[type].n}</span>
              <b>{FRICTION[type].name}</b>
              <span className={s.body}>{FRICTION[type].body}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
