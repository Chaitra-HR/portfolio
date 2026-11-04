import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cx } from '../../lib/cx';
import v from './Moments.module.css';

/** One looping moment. It starts from the top when it's first seen, rests off screen, and can be paused. */
function Moment({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const root = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const watch = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting), { threshold: 0.4 });
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  return (
    <div ref={root} className={cx(v.moment, seen && !paused && v.on, className)}>
      <p className="sr-only">{label}</p>
      {!still && (
        <button type="button" className={v.pause} aria-label={paused ? 'Play' : 'Pause'} onClick={() => setPaused((now) => !now)}>
          <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M3 1.5h2v9H3zm4 0h2v9H7z" />}
          </svg>
        </button>
      )}
      <div className={v.stage} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

/** The box stays empty while the advisor talks themself out of one idea after another. */
export function EmptyBox() {
  return (
    <Moment label="A prompt box stays empty while an advisor wonders what to write about." className={v.box}>
      <ul>
        <li>Retirement again?</li>
        <li>Something on the market?</li>
        <li>What did I post last time?</li>
        <li>What should I write about?</li>
      </ul>
      <p className={v.prompt}>
        <i />
        Ask anything
        <span>↑</span>
      </p>
    </Moment>
  );
}

/** A line anyone could have generated gives way to one only this advisor would say. */
export function OwnWords() {
  return (
    <Moment label="A generic AI sentence is selected and replaced with one in the advisor’s own voice.">
      <div className={v.note}>
        <p className={v.swap}>
          <small>AI draft</small>
          <small>In their words</small>
        </p>
        <p className={v.swap}>
          <span>Retirement is a journey, not a destination. Here are five tips.</span>
          <span>Most clients ask me this around 55, so here’s what I tell them.</span>
        </p>
      </div>
    </Moment>
  );
}

/** Headline after headline gets written and crossed out. The knowledge is there; the copy isn't. */
export function Headlines() {
  return (
    <Moment label="An advisor writes three dry headlines, crosses each one out, and asks how to make people read it." className={v.headlines}>
      <div className={v.note}>
        <small>Headline</small>
        <p>Q3 portfolio rebalancing update</p>
        <p>Thoughts on asset allocation</p>
        <p>An important market update</p>
      </div>
      <p className={v.ask}>How do I make people read this?</p>
    </Moment>
  );
}

/** Each day fills up with client work, and the post keeps moving to the next one. */
export function NoTime() {
  return (
    <Moment label="A week fills with client meetings and the time set aside to write a post keeps moving until it falls off the end.">
      <div className={v.days}>
        {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
          <div key={i}>
            <small>{day}</small>
            <i />
            <i />
            <i />
          </div>
        ))}
        <b>Post</b>
      </div>
      <p className={v.later}>Maybe next week.</p>
    </Moment>
  );
}
