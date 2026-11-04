import { useEffect, useRef, useState } from 'react';
import cardsArmrest from '../../assets/images/website-revamp/brand/cards-armrest.webp';
import sign from '../../assets/images/website-revamp/brand/sign.webp';
import poster from '../../assets/images/website-revamp/showcase-poster.webp';
import showcase from '../../assets/images/website-revamp/showcase.mp4';
import coverHevc from '../../assets/images/website-revamp/film-hevc.mp4';
import coverFilm from '../../assets/images/website-revamp/film.mp4';
import coverPoster from '../../assets/images/website-revamp/film.webp';
import film from '../../assets/images/website-revamp/film-16x10.mp4';
import filmPoster from '../../assets/images/website-revamp/film-16x10.jpg';
import uiKit from '../../assets/images/website-revamp/ui-kit.webp';
import webinarPoster from '../../assets/images/website-revamp/brand/webinar-scroll-poster.webp';
import webinarScroll from '../../assets/images/website-revamp/brand/webinar-scroll.mp4';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CaseBody, CaseHero, CaseSection, CaseSub, Figure, Lead, More, PointCards, study, TeamStack, Text, type TocEntry } from '../../pages/CaseStudy/kit';
import { BrandBento } from './BrandBento';
import { Confetti } from './Confetti';
import w from './Website.module.css';

const FILM = 's8fdT4_3L_U';

const TOC: TocEntry[] = [
  { id: 'impact', label: 'Impact' },
  { id: 'problem', label: 'Problem' },
  {
    id: 'solution',
    label: 'Solution',
    children: [
      { id: 'identity', label: 'Brand identity' },
      { id: 'website', label: 'Website' },
      { id: 'people', label: 'People' },
      { id: 'system', label: 'Modular system' },
    ],
  },
  { id: 'webinar', label: 'First test' },
  { id: 'outcome', label: 'Outcome' },
];

const BRAND_PHOTOS: [{ src: string; alt: string }, { src: string; alt: string }] = [
  { src: cardsArmrest, alt: 'Two House of Alpha business cards on a wooden armrest: a brown card reading Don’t Just Retire-ReFire!, and a white card for Bhuvanaa Shreeram, CFP, with the House of Alpha wordmark' },
  { src: sign, alt: 'A brown hanging sign with the cream House of Alpha wordmark on a stone building, reflected in the shop window beside it' },
];

/** A silent loop with a way to stop it. `lazy` waits until it's on screen. Holds on the first frame for reduced motion.
 * `hevc` is a smaller HEVC copy, played where the browser supports it. */
function Preview({ src, hevc, poster, label, className, lazy }: { src: string; hevc?: string; poster: string; label: string; className?: string; lazy?: boolean }) {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const video = useRef<HTMLVideoElement>(null);
  const stopped = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!lazy || still || !el) return;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) el.pause();
        else if (!stopped.current) void el.play().catch(() => {});
      },
      { threshold: 0.4 },
    );
    seen.observe(el);
    return () => seen.disconnect();
  }, [lazy, still]);

  return (
    <div className={className ? `${w.player} ${className}` : w.player}>
      <video
        key={String(still)}
        ref={video}
        className={w.heroShot}
        src={hevc ? undefined : src}
        poster={poster}
        autoPlay={!still && !lazy}
        preload={lazy ? 'none' : undefined}
        muted
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={label}
      >
        {hevc && <source src={hevc} type='video/mp4; codecs="hvc1"' />}
        {hevc && <source src={src} type="video/mp4" />}
      </video>
      <button
        type="button"
        className={w.pause}
        onClick={() => {
          stopped.current = playing;
          if (playing) video.current?.pause();
          else void video.current?.play();
        }}
      >
        {playing ? 'Pause preview' : 'Play preview'}
      </button>
    </div>
  );
}

/** The home page's tile film, on the page's opening frame. */
function HeroVideo() {
  return (
    <div className={`${study.heroFig} rv`} style={{ '--i': 2 }}>
      <Preview className={w.cover} src={coverFilm} hevc={coverHevc} poster={coverPoster} label="The live House of Alpha site scrolling section by section in a white frame on cracked red earth" />
    </div>
  );
}

/** The firm's film: its still and our own play button, with YouTube loading only once it's asked for. */
function IntroVideo() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={w.video}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${FILM}?autoplay=1&rel=0`}
          title="House of Alpha introductory video"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" className={w.film} aria-label="Play video" onClick={() => setPlaying(true)}>
          <img src={`https://i.ytimg.com/vi/${FILM}/maxresdefault.jpg`} alt="" loading="lazy" />
          <span className={w.play}>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M4 2.5v11a.5.5 0 0 0 .76.43l9-5.5a.5.5 0 0 0 0-.86l-9-5.5A.5.5 0 0 0 4 2.5Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

export default function WebsiteCaseStudy() {
  return (
    <div className={study.study}>
      <CaseBody title={
      <>
        Redesigning House of Alpha’s website <span className="g">to attract better-fit clients</span>
      </>
    } toc={TOC} overview={
            <>
              House of Alpha is a wealth management firm helping high-net-worth individuals and senior executives plan for retirement and manage their wealth.
              <br />
              <br />
              I led the brand and website revamp, from positioning and messaging to the website experience and a modular design system that made future marketing pages easier to build.
            </>
          } hero={
        <CaseHero
          meta={[
            {
              term: 'Role',
              value: (
                <>
                  Product designer, end to end
                  <br />
                  Capital Design Studio
                </>
              ),
            },
            { term: 'Timeline', value: '8 weeks' },
            {
              term: 'Team',
              value: (
                <TeamStack
                  label="Founders, Engineer & Me"
                  members={[
                    { avatar: 'founderA', title: 'Founder' },
                    { avatar: 'founderB', title: 'Founder' },
                    { avatar: 'engineer', title: 'Engineer' },
                    { avatar: 'me', title: 'Product Designer (me)' },
                  ]}
                />
              ),
            },
            { term: 'Scope', value: ['Product Design', 'Brand & Web Design'] },
          ]}
          media={<HeroVideo />}
        />
      }>

        <CaseSection id="impact" label="Impact" title="Better-fit enquiries. A webinar page launched in just 2 days.">
          <Text>The redesigned website brought in more qualified enquiries than in previous months. Prospects also arrived at discovery calls better informed, allowing advisors to spend less time explaining their services.</Text>
          <PointCards
            items={[
              { title: 'Improved lead quality', body: 'More qualified enquiries compared with previous months.' },
              { title: '2 days', body: 'To build and launch a webinar page using reusable sections.' },
            ]}
          />
        </CaseSection>

        <CaseSection id="problem" label="Problem" title="House of Alpha had the right expertise. Its website wasn’t communicating it.">
          <Text>The firm primarily serves senior executives and high-net-worth professionals in their 40s and 50s who are beginning to plan seriously for retirement.</Text>
          <Text>But the existing website had four problems:</Text>
          <PointCards
            list
            items={[
              { object: 'megaphone', title: 'Broad messaging', body: 'It talked about wealth management without addressing the retirement questions of its ideal clients.' },
              { object: 'pawns', title: 'Little differentiation', body: 'Visitors couldn’t easily understand the firm’s expertise, approach, or reasons to choose it.' },
              { object: 'bubble', title: 'Too much explaining', body: 'Advisors spent discovery-call time covering information the website should have communicated.' },
              { object: 'blocks', title: 'Difficult to scale', body: 'Every new campaign or landing page required additional design and development effort.' },
            ]}
          />
          <Lead>The challenge was to attract better-fit clients while giving the business a website it could continue building on.</Lead>
        </CaseSection>

        <CaseSection id="solution" label="Solution">
          <CaseSub id="identity" title="A more distinctive identity for a more focused business.">
            <Text>The existing brand lacked the distinction and consistency we wanted to carry into the new website.</Text>
            <Text>I explored a visual direction that felt confident and established, without falling back on the usual financial services imagery and design conventions.</Text>
            <Text>The refreshed identity gave us a consistent foundation for typography, imagery, page layouts, and other brand applications.</Text>
            <Figure tone="field" className={w.boardFig} style={{ '--tint': '#FFF4E5' }} caption="The identity on one board: two concept applications made for this case study, the palette and the typefaces.">
              <BrandBento photos={BRAND_PHOTOS} />
            </Figure>
          </CaseSub>

          <CaseSub id="website" title="Redesigning the website">
            <Text>Previously, visitors had to work harder than necessary to understand whether House of Alpha was right for them.</Text>
            <Text>I reorganised the website around the questions a prospective client would naturally have.</Text>
            <More label="Here are those questions">
              <PointCards
                list
                items={[
                  { object: 'mirror', title: '01. Is this for someone like me?', body: 'The homepage speaks directly to senior professionals preparing for retirement.' },
                  { object: 'compass', title: '02. How can they help me?', body: 'Instead of simply listing services, the content explains the firm’s approach to retirement planning and managing wealth over the long term.' },
                  { object: 'mugs', title: '03. Who will I be working with?', body: 'We gave more attention to the firm’s people, philosophy, and advisory process to help visitors understand the relationship before making contact.' },
                  { object: 'signpost', title: '04. What happens next?', body: 'A more purposeful enquiry flow collects relevant information about prospective clients and their goals.' },
                ]}
              />
            </More>
            <div className={study.heroFig}>
              <Preview src={showcase} poster={poster} label="Screens from the redesigned House of Alpha website" lazy />
            </div>
            <Figure tone="plain">
              <Preview className={w.reel} src={film} poster={filmPoster} label="The live House of Alpha site scrolling section by section on a 16:10 screen, in a glass frame over a moving amber flame" lazy />
            </Figure>
          </CaseSub>

          <CaseSub id="people" title="Introducing the people behind the advice">
            <Text>For someone considering retirement advice, the people behind the firm matter just as much as its services.</Text>
            <Text>We incorporated a short introductory video to give prospective clients a better sense of House of Alpha and its team.</Text>
            <IntroVideo />
          </CaseSub>

          <CaseSub id="system" title="Building a website the team could keep using">
            <Text>The website was also expected to support future marketing campaigns, educational content, and webinars.</Text>
            <Text>Designing each page independently would have meant more work for both designers and engineers, with consistency becoming harder to maintain.</Text>
            <Text>I created a lightweight modular design system built around reusable website sections.</Text>
            <Lead>One trade-off was deliberate: slightly less freedom in individual layouts, in exchange for consistency and faster implementation.</Lead>
            <Figure tone="plain" caption="The website system: named tokens, components in every state, 14 reusable sections, and each page as an order of those sections.">
              <img className={w.kit} src={uiKit} alt="A zoomed-out design file headed House of Alpha, Website system, in four frames. Foundations: colour tokens with their roles and contrast ratios, the Gascogne Serial and Karla type scale, twelve spacing steps and five corner radii. Components: buttons in default, hover, focus and disabled states, text fields, goal chips, the FAQ accordion, cards, navigation and carousel controls. Sections: the navigation and fourteen numbered full-width sections cropped from the live site. Pages: Home, About and Process marked with their section numbers, the webinar page built from existing sections in two days, and three rules for new pages" loading="lazy" />
            </Figure>
          </CaseSub>
        </CaseSection>

        <CaseSection id="webinar" label="First test" title="Our first test? A webinar page in two days.">
          <Text>When the team needed a new webinar landing page, engineers could work with the existing sections rather than building everything from scratch.</Text>
          <Lead>The page was assembled and launched in just two days.</Lead>
          <Text>It was a useful demonstration of why we’d invested in the system alongside the redesign.</Text>
          <Figure tone="field" caption="The final page." style={{ '--tint': '#7C4933' }}>
            <Preview className={w.frame} src={webinarScroll} poster={webinarPoster} label="Scrolling through the whole House of Alpha webinar page, from the introduction to the final call to action" lazy />
          </Figure>
        </CaseSection>

        <CaseSection id="outcome" label="Outcome" title="Less explaining. More meaningful conversations.">
          <Text>Prospects came to discovery calls better informed, saving advisors time each week. The team also launched a new webinar page in just 2 days using the modular design system.</Text>
        </CaseSection>
        <Confetti target="cs-outcome" />
      </CaseBody>
    </div>
  );
}
