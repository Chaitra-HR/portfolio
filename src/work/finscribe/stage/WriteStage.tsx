import man from '../../../assets/images/finscribe/slide-man.jpg';
import woman from '../../../assets/images/finscribe/slide-woman.jpg';
import { cx } from '../../../lib/cx';
import { AppShell } from '../../finscribe-app/AppShell';
import d from '../../finscribe-app/Dashboard.module.css';
import s from './WriteStage.module.css';

/** The weekly check-in's prompts; the advisor picks the first and types. */
const PROMPTS = ['Client question', 'Meeting theme', 'Personal moment'];
export const THOUGHT = 'Three clients asked if they should refix after the rate cut';

/** Topics FinScribe picked for the firm, for a week with nothing to share. */
const PICKED = [
  { format: 'Carousel', title: 'Topping up super before 30 June', why: 'EOFY is close, and two clients have asked.' },
  { format: 'Newsletter', title: 'Why holding cash can cost you', why: 'A theme from this month’s meetings.' },
  { format: 'LinkedIn post', title: 'What a rate cut does to your budget', why: 'From this week’s market news.' },
];

/** Drafts in progress, as the dashboard lists them. */
const DRAFTS = [
  { title: 'Tax-loss harvesting, explained', meta: 'Newsletter · edited 2 days ago' },
  { title: 'When markets get noisy', meta: 'LinkedIn post · edited last week' },
];

/** The draft, written from the advisor's note in their own voice: calm, plain, honest about the answer. */
const TITLE = 'What the rate cut means for you';
const POST = [
  'Rates came down this week, and a few of you have asked whether it’s time to refix. It matters less than the headlines suggest, but it’s worth a look.',
  'Before you refix, I’d ask three things:',
  'Will your lender pass on the full cut?',
  'How long do you want certainty for?',
  'What would you do with the savings?',
  'Book a call and we’ll check your plan.',
];

/** Words in the draft, for the writing animation. */
export const DRAFT_WORDS = POST.reduce((n, text) => n + text.split(' ').length, 0);

type Theme = 'light' | 'dark';

/** The carousel, from the post, in the firm's brand kit: four flat slides, two with photos. */
function Slide({ i }: { i: number }) {
  return (
    <>
      <span className={s.top}>
        <b>Hale Wealth</b>
        {i + 1}/4
      </span>
      {i === 0 && (
        <>
          <b className={s.big}>What the rate cut means for you</b>
          <span className={s.foot}>Swipe to read</span>
        </>
      )}
      {i === 1 && (
        <>
          <b className={s.mid}>Your mortgage, your real life</b>
          <img className={s.photo} src={woman} alt="" />
        </>
      )}
      {i === 2 && (
        <>
          <b className={s.mid}>Before you refix</b>
          <ol className={s.list}>
            <li>Will your lender pass it on?</li>
            <li>How long do you want certainty?</li>
            <li>What would you do with the savings?</li>
          </ol>
        </>
      )}
      {i === 3 && (
        <>
          <b className={s.mid}>Let’s check your plan</b>
          <span className={s.headshot}>
            <img className={s.photo} src={man} alt="" />
            <em>James Hale, adviser</em>
          </span>
        </>
      )}
    </>
  );
}

export interface WriteState {
  /** The dashboard, or the draft it leads to. */
  screen: 'home' | 'draft';
  /** "Client question" picked, so the box has focus. */
  prompt: boolean;
  /** Characters of the thought typed so far. */
  typed: number;
  /** "Shape into a topic" pressed, and working. */
  shaping: boolean;
  /** Words of the draft written so far. */
  words: number;
  /** Repurposed as a carousel. */
  carousel: boolean;
  theme: Theme;
  press?: string;
}

/** FinScribe's dashboard: the weekly check-in and drafts on the left, topics picked for the firm in the side panel. */
function Home({ prompt, typed, shaping, press }: WriteState) {
  return (
    <div className={d.work}>
      <div className={s.main}>
        <div className={d.docHead}>
          <div>
            <h4>Good morning, James</h4>
            <p>Thursday 5 November</p>
          </div>
        </div>
        <section className={cx(s.checkin, prompt && s.focused)}>
          <small>Weekly check-in</small>
          <h5>What should we talk about this week?</h5>
          <ul className={s.prompts}>
            {PROMPTS.map((p, i) => (
              <li key={p} className={cx(i === 0 && prompt && s.promptOn, i === 0 && press === 'client' && s.pressed)} data-target={i === 0 ? 'client' : undefined}>
                {p}
              </li>
            ))}
          </ul>
          <div className={s.box}>
            <p className={cx(!typed && s.placeholder)}>
              {typed ? THOUGHT.slice(0, typed) : 'Share a rough thought, question or moment…'}
              {prompt && !shaping && <i className={s.caret} />}
            </p>
            <span className={cx(d.primary, s.shape, typed < THOUGHT.length && s.idle, press === 'shape' && s.pressed)} data-target="shape">
              {shaping ? 'Shaping…' : 'Shape into a topic'}
            </span>
          </div>
        </section>
        <p className={s.label}>Continue where you left off</p>
        <ul className={s.drafts}>
          {DRAFTS.map((draft) => (
            <li key={draft.title}>
              <b>{draft.title}</b>
              <small>{draft.meta}</small>
            </li>
          ))}
        </ul>
      </div>
      <aside className={d.review}>
        <div className={d.reviewHead}>
          <h5>Picked for you</h5>
        </div>
        {PICKED.map((p) => (
          <div key={p.title} className={d.finding}>
            <small className={s.format}>{p.format}</small>
            <b>{p.title}</b>
            <span>{p.why}</span>
          </div>
        ))}
      </aside>
    </div>
  );
}

/**
 * FinScribe in the same app frame as the Compliance cover, at the same 820 × 540 and built from the same parts: the
 * weekly check-in on the dashboard, a rough client question shaped into a topic, the draft written in the advisor's
 * voice, then repurposed as a carousel in the firm's brand kit. Illustrative, with sample copy.
 */
export function WriteStage(state: WriteState) {
  const { screen, words, carousel, theme, press } = state;
  let count = 0;
  const write = (t: string) =>
    t.split(' ').map((word, i) => (
      <span key={i} className={cx(s.word, count++ >= words && s.later)}>
        {word}{' '}
      </span>
    ));

  return (
    <div className={s.fixed}>
      <AppShell
        key={screen}
        section={screen === 'home' ? 'home' : 'content'}
        page="Drafts"
        collapsed
        crumb={screen === 'home' ? ['Home'] : ['Content', 'Drafts', TITLE]}
        actions={
          screen === 'draft' ? (
            <>
              <span className={d.saved}>{words < DRAFT_WORDS ? 'Writing…' : 'Saved'}</span>
              <span className={d.ghost}>Preview</span>
              <span className={d.primary}>Save draft</span>
            </>
          ) : undefined
        }
      >
        {screen === 'home' ? (
          <Home {...state} />
        ) : (
          <div className={cx(d.work, s.in)}>
            <div className={d.editor}>
              <ul className={d.formats}>
                <li className={cx(!carousel && d.formatOn)}>LinkedIn post</li>
                <li className={cx(carousel && d.formatOn, press === 'carousel' && s.pressed)} data-target="carousel">
                  Carousel
                </li>
                <li>Newsletter</li>
              </ul>
              <div className={d.docHead}>
                <div>
                  <h4>{TITLE}</h4>
                  <p>{carousel ? '4 slides · 1080 × 1350 · Hale Wealth brand kit' : 'From your client question · Written in your voice'}</p>
                </div>
                <span>v1</span>
              </div>
              {carousel ? (
                <ul className={cx(s.slides, theme === 'dark' && s.dark)}>
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className={s.slide}>
                      <Slide i={i} />
                    </li>
                  ))}
                </ul>
              ) : (
                <article className={d.doc}>
                  <p>{write(POST[0])}</p>
                  <p>{write(POST[1])}</p>
                  <ul>
                    {POST.slice(2, 5).map((t) => (
                      <li key={t}>{write(t)}</li>
                    ))}
                  </ul>
                  <p>{write(POST[5])}</p>
                </article>
              )}
            </div>

            <aside className={d.review}>
              {carousel ? (
                <>
                  <div className={d.reviewHead}>
                    <h5>Design</h5>
                    <span>Brand kit</span>
                  </div>
                  <div className={d.filters}>
                    <button type="button" tabIndex={-1} className={cx(theme === 'light' && d.filterOn)}>
                      Light
                    </button>
                    <button type="button" tabIndex={-1} className={cx(theme === 'dark' && d.filterOn, press === 'dark' && s.pressed)} data-target="dark">
                      Dark
                    </button>
                  </div>
                  <div className={d.finding}>
                    <b>Photos</b>
                    <span>Your headshot on the last slide, one stock photo on slide 2.</span>
                  </div>
                  <div className={d.finding}>
                    <b>Caption</b>
                    <span className={d.findingWords}>Rates came down this week. Before you refix…</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={d.reviewHead}>
                    <h5>Shape</h5>
                    <span>James’s voice</span>
                  </div>
                  <div className={d.finding}>
                    <b>Your note</b>
                    <span>{THOUGHT}</span>
                  </div>
                  <div className={d.finding}>
                    <b>Voice</b>
                    <span>Calm and plain, no jargon. Short sentences, written to clients by name.</span>
                  </div>
                  <div className={d.finding}>
                    <b>Length</b>
                    <span>About 90 words, a list of three, one call to action.</span>
                  </div>
                </>
              )}
            </aside>
          </div>
        )}
      </AppShell>
    </div>
  );
}
