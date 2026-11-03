import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { findCaseStudy } from '../../../data/projects';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { cx } from '../../../lib/cx';
import { smoothScrollTo } from '../../../lib/scroll';
import s from './kit.module.css';

export interface TocEntry {
  /** The element in the body it points to has the id `cs-<id>`. */
  id: string;
  label: string;
  /** Nested entries, shown while their section is the active one. */
  children?: TocEntry[];
}

/** From here the title and contents hold a column beside the study. */
const RAIL_QUERY = '(min-width: 1024px)';
/** A section counts as being read once its top passes this share of the viewport. */
const READ_LINE = 0.32;

/** The hero, always first in the contents. */
const OVERVIEW: TocEntry = { id: 'overview', label: 'Overview' };

const top = (id: string) => document.getElementById(`cs-${id}`)?.getBoundingClientRect().top ?? Infinity;

/** The sections, with the steps of the current one opened out and the reader's place marked. */
function Contents({ toc, index, kid, onPick }: { toc: TocEntry[]; index: number; kid: string; onPick?: () => void }) {
  const link = (entry: TocEntry, on: boolean, within = false) => (
    <a
      href={`#cs-${entry.id}`}
      className={cx(on && s.on, within && s.within)}
      aria-current={on ? 'location' : undefined}
      onClick={(e) => {
        smoothScrollTo(`cs-${entry.id}`)(e);
        onPick?.();
      }}
    >
      {entry.label}
    </a>
  );

  return (
    <ol className={s.items}>
      {toc.map((entry, i) => (
        <li key={entry.id}>
          {link(entry, i === index && !kid, i === index && !!kid)}
          {i === index && entry.children && (
            <ol className={s.kids}>
              {entry.children.map((child) => (
                <li key={child.id}>{link(child, kid === child.id)}</li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * The study's frame. The way back, the title and subtitle, the facts and the hero image run across the top of the page;
 * under them, on wide screens, a left column holds the contents to the end of the study with
 * the current section marked, and the two columns sit on the centre of the page as one block.
 * Below that a bar at the foot of the screen opens the same list. Sections join in by carrying
 * the ids in `toc`.
 */
export function CaseBody({ title, lede, overview, hero, toc: sections, children }: { title: ReactNode; lede?: string; overview: ReactNode; hero: ReactNode; toc: TocEntry[]; children: ReactNode }) {
  const toc = useMemo(() => [OVERVIEW, ...sections], [sections]);
  /** Under the title: the study's own line, or the one-line approach from the project's gist. */
  const subtitle = lede ?? findCaseStudy(useParams().slug)?.gist.decision;
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const wide = useMediaQuery(RAIL_QUERY);
  const [index, setIndex] = useState(0);
  const [kid, setKid] = useState('');
  const [reached, setReached] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const body = root.current?.getBoundingClientRect();
      if (!body) return;
      const line = innerHeight * READ_LINE;
      setReached(top(sections[0].id) < innerHeight * 0.6 && body.bottom > 60);

      let i = 0;
      toc.forEach((entry, n) => {
        if (top(entry.id) < line) i = n;
      });
      const start = top(toc[i].id);
      const next = i + 1 < toc.length ? top(toc[i + 1].id) : body.bottom;
      const within = Math.min(1, Math.max(0, (line - start) / (next - start)));
      setIndex(i);
      setKid(toc[i].children?.reduce((found, child) => (top(child.id) < line ? child.id : found), '') ?? '');
      bar.current?.style.setProperty('--read', ((i + within) / toc.length).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [toc, sections]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
    <header id="cs-overview" className={s.top}>
      <Link to="/" className={s.back}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m10 3-5 5 5 5" />
        </svg>
        Back
      </Link>
      <div className={s.head}>
        <h1 className={`${s.h1} rv`}>{title}</h1>
        {subtitle && <p className={`${s.lede} rv`}>{subtitle}</p>}
      </div>
      {hero}
    </header>
    <div className={s.body} ref={root}>
      {wide && (
        <nav className={`${s.side} rv`} style={{ '--i': 1 }} aria-label="On this page">
          <Contents toc={toc} index={index} kid={kid} />
        </nav>
      )}
      {!wide && (
        <div ref={bar} className={cx(s.barWrap, !reached && s.off)}>
          {open && (
            <nav className={s.sheet} aria-label="On this page">
              <p className={s.sideHead}>On this page</p>
              <Contents toc={toc} index={index} kid={kid} onPick={() => setOpen(false)} />
            </nav>
          )}
          <button type="button" className={s.bar} aria-expanded={open} aria-label={`Section ${index + 1} of ${toc.length}: ${toc[index].label}. Show all sections`} onClick={() => setOpen((v) => !v)}>
            <span className={s.barCount}>
              {index + 1}/{toc.length}
            </span>
            <span className={s.barLabel}>{toc[index].label}</span>
            <svg className={cx(s.chev, open && s.chevOpen)} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3 7.5 3-3 3 3" />
            </svg>
            <i className={s.barFill} aria-hidden="true" />
          </button>
        </div>
      )}
      <div className={s.column}>
        <section className={s.sec}>
          <h2 className="sr-only">Overview</h2>
          <div className={s.overview}>{overview}</div>
        </section>
        {children}
      </div>
    </div>
    </>
  );
}
