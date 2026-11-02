import { useRef } from 'react';
import books from '../../assets/images/about/books.jpg';
import booksAvif from '../../assets/images/about/books.avif';
import curryLeaf from '../../assets/images/about/curry-leaf.jpg';
import curryLeafAvif from '../../assets/images/about/curry-leaf.avif';
import dancing from '../../assets/images/about/dancing.jpg';
import dancingAvif from '../../assets/images/about/dancing.avif';
import mountain from '../../assets/images/about/mountain.jpg';
import mountainAvif from '../../assets/images/about/mountain.avif';
import puris from '../../assets/images/about/puris.jpg';
import purisAvif from '../../assets/images/about/puris.avif';
import summit from '../../assets/images/about/summit.jpg';
import summitAvif from '../../assets/images/about/summit.avif';
import working from '../../assets/images/about/working.jpg';
import { BentoFooter } from '../../components/layout/BentoFooter';
import { SiteHeader } from '../../components/layout/SiteHeader';
import { usePageMeta } from '../../components/layout/usePageMeta';
import { ScrubText } from '../../components/interactions/ScrubText';
import { useScrub } from '../../hooks/useScrub';
import { cx } from '../../lib/cx';
import { Photo } from './Photo';
import { useStackMotion } from './stackMotion';
import s from './About.module.css';

const HOW_I_WORK: Array<[title: string, body: string]> = [
  ['Get the context first.', 'I like understanding the people, the business, the problem and the constraints before I start making anything. A few good questions early usually save a lot of unnecessary work later.'],
  ['Use AI to think wider.', 'AI is part of my everyday process now. I use it to research, challenge assumptions, explore directions and get unstuck. It is most useful when I treat it like something to think with, not something to agree with.'],
  ['Make things early.', 'I sketch, prototype and test ideas before I get too attached to them. Some things sound great in my head and fall apart the moment they become real. Better to find out sooner.'],
  ['Get closer to the build.', 'I enjoy getting designs into code and seeing what survives contact with the real thing. That is usually where the interesting details show up. AI helps me move faster here, but the decisions are still mine.'],
  ['See what survives reality.', 'I test, refine, break things and fix them. The goal is not to defend the design. It is to find out whether it still makes sense when someone else has to use it.'],
  ['Keep experimenting.', 'The way we design and build products is changing quickly, and I like being close to that change. I try new tools, keep what genuinely improves the work, and ignore the rest.'],
];

const pad = (n: number) => String(n).padStart(2, '0');

/** On load, the photo row and side notes follow the intro's line cascade (ms). */
const PHOTOS_AT = 450;
const NOTES_AT = 700;

export default function AboutPage() {
  const page = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  useScrub(page);
  useStackMotion(stack);
  usePageMeta(
    'About — Chaitra Rao',
    'Product designer with a finance background. Six years running Capital Design Studio for wealth management companies; now based in Melbourne.',
  );

  return (
    <div ref={page} className={s.pg}>
      <SiteHeader current="about" card />

      <main id="main" tabIndex={-1} aria-label="About">
        <section className={cx(s.c, s.intro)} aria-labelledby="about-h">
          <h1 id="about-h" data-scrub="intro">
            About
          </h1>
          <p data-scrub="intro">
            <ScrubText>
              <b>Hi, I’m Chaitra.</b> I’m a product designer with a finance background, interested in how business, human behaviour and emerging
              technology shape what’s worth building.
            </ScrubText>
          </p>
          <p data-scrub="intro">
            <ScrubText>
              For the past 6 years, I’ve been running Capital Design Studio, working with wealth management companies across products, websites and
              brands. These days, I’m also building with AI and getting closer to the things I once only designed.
            </ScrubText>
          </p>
          <p className={s.hint} data-scrub="intro">
            <span>
              The rest is probably better told in photos.<span className={s.hoverHint}> Hover around.</span>
            </span>
          </p>
        </section>

        <div className={s.row}>
          <Photo delay={PHOTOS_AT} stagger={2} className={s.bleedL} src={curryLeaf} avif={curryLeafAvif} alt="Hands with soil around a freshly potted curry-leaf plant" caption="Trying not to overwater" focus="50% 40%" />
          <Photo delay={PHOTOS_AT} stagger={0} className={s.mainPh} src={working} alt="Chaitra working on a laptop at a wooden table" caption="That’s me" focus="32% 50%" />
          <div className={s.rcol}>
            <div className={s.leads}>
              <p className={s.lead} data-scrub="lines" data-delay={NOTES_AT} data-stagger={0}>
                <ScrubText>
                  <b>Finance, first:</b> I studied finance before design, so I naturally tend to think about what makes sense for the business as much
                  as what makes sense for the user.
                </ScrubText>
              </p>
              <p className={s.lead} data-scrub="lines" data-delay={NOTES_AT} data-stagger={1}>
                <ScrubText>
                  <b>Six years in:</b> Running a studio has taught me how to switch between designer, strategist, researcher and business owner,
                  sometimes all before lunch.
                </ScrubText>
              </p>
              <p className={s.lead} data-scrub="lines" data-delay={NOTES_AT} data-stagger={2}>
                <ScrubText>
                  <b>Now:</b> Based in Melbourne, originally from Bangalore, and looking for a thoughtful team to make interesting things with.
                </ScrubText>
              </p>
            </div>
            <Photo delay={PHOTOS_AT} stagger={1} className={s.land} src={summit} avif={summitAvif} alt="Chaitra and her partner smiling on a summit above a bay and islands" caption="Wandering with my partner" focus="50% 42%" />
          </div>
          <div className={s.bleedWrap}>
            <Photo delay={PHOTOS_AT} stagger={3} className={s.bleedR} src={books} avif={booksAvif} alt="A stack of books beside a glowing moon lamp" caption="Buying faster than finishing." focus="78% 60%" />
          </div>
        </div>

        <section className={cx(s.c, s.likes)} aria-labelledby="about-likes">
          <div data-scrub="rise">
            <h2 id="about-likes">Off the Clock</h2>
            <p className={cx('mut', s.likesSub)}>Things I like to do</p>
          </div>
          <Photo stagger={0} className={s.like1} src={dancing} avif={dancingAvif} alt="Chaitra dancing in a studio in an orange outfit" caption="Dancing, always" focus="70% 40%" />
          <Photo stagger={1} className={s.like2} src={mountain} avif={mountainAvif} alt="Looking out over a snowy mountain trail from behind" caption="Chasing the better view" focus="50% 50%" />
          <Photo stagger={2} className={s.like3} src={puris} avif={purisAvif} alt="A plate of green puris, potato curry, sweets and chutney" caption="20 minutes? Sure." focus="50% 50%" />
        </section>

        <section className={s.hw3} aria-labelledby="about-hw">
          <h2 id="about-hw" className={s.hw3H} data-scrub="rise">
            How I work<span>(most days)</span>
          </h2>
          <div ref={stack} className={s.stack}>
            {HOW_I_WORK.map(([title, body], k) => (
              <div key={title} className={s.sc}>
                <article className={s.scCard}>
                  <div className={s.scIn}>
                    <span className={s.scN}>
                      {pad(k + 1)} / {pad(HOW_I_WORK.length)}
                    </span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BentoFooter
        className={s.footer}
        heading={
          <>
            Well, that’s enough about me.{' '}
            {/* phones: "Your turn." carries straight on, no line of its own */}
            <br className={s.deskBreak} />
            <span className="g">Your turn.</span>
          </>
        }
        body="I’d love to know what you’re working on and where I might fit in."
      />
    </div>
  );
}
