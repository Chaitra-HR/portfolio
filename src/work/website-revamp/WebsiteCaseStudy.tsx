import houseOfAlpha from '../../assets/images/logos/house-of-alpha.png';
import { useEffect, useRef, useState } from 'react';
import cardClose from '../../assets/images/website-revamp/brand/card-close.jpg';
import cardWide from '../../assets/images/website-revamp/brand/card-wide.jpg';
import folder from '../../assets/images/website-revamp/brand/folder.jpg';
import reception from '../../assets/images/website-revamp/brand/reception.jpg';
import cta from '../../assets/images/website-revamp/cta.jpg';
import faqs from '../../assets/images/website-revamp/faqs.jpg';
import homepage from '../../assets/images/website-revamp/homepage.jpg';
import process from '../../assets/images/website-revamp/process.jpg';
import services from '../../assets/images/website-revamp/services.jpg';
import poster from '../../assets/images/website-revamp/showcase-poster.jpg';
import showcase from '../../assets/images/website-revamp/showcase.mp4';
import testimonials from '../../assets/images/website-revamp/testimonials.jpg';
import webinarBenefits from '../../assets/images/website-revamp/brand/webinar-benefits.jpg';
import webinarCta from '../../assets/images/website-revamp/brand/webinar-cta.jpg';
import webinarFaqs from '../../assets/images/website-revamp/brand/webinar-faqs.jpg';
import webinarFit from '../../assets/images/website-revamp/brand/webinar-fit.jpg';
import webinarIntro from '../../assets/images/website-revamp/brand/webinar-intro.jpg';
import webinarPoster from '../../assets/images/website-revamp/brand/webinar-scroll-poster.jpg';
import webinarScroll from '../../assets/images/website-revamp/brand/webinar-scroll.mp4';
import webinarTestimonials from '../../assets/images/website-revamp/brand/webinar-testimonials.jpg';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CaseBody, CaseHero, CaseSection, CaseSub, KeyInsight, Lead, TeamStack, Text, type TocEntry } from '../../pages/CaseStudy/kit';
import { Figure, ToAdd } from '../gather/Figure';
import g from '../gather/Gather.module.css';
import { Confetti } from './Confetti';
import { PointCards } from './PointCards';
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

const SCREENS = [
  { src: homepage, alt: 'House of Alpha homepage introduction: Helping you retire with confidence' },
  { src: services, alt: 'Six service cards under the heading Craft your ideal retirement and lifestyle plan' },
  { src: process, alt: 'A goals question beside the step Discover your dream life' },
  { src: cta, alt: 'A call to action card: Your life is unique, and so should be your retirement plan' },
];

const BRAND = [
  { src: cardClose, alt: 'House of Alpha business cards in deep brown and cream on tan leather' },
  { src: cardWide, alt: 'Stacks of brown, mustard and cream business cards on limestone' },
  { src: reception, alt: 'A reception with the House of Alpha logo on a brown wall' },
  { src: folder, alt: 'A brown folder and The Alpha approach booklet on a walnut table' },
];

const MODULES = [
  { label: 'Page introductions', src: homepage, alt: SCREENS[0].alt },
  { label: 'Services', src: services, alt: SCREENS[1].alt },
  { label: 'Process explanations', src: process, alt: SCREENS[2].alt },
  { label: 'Testimonials', src: testimonials, alt: 'A client testimonial section with a portrait' },
  { label: 'FAQs', src: faqs, alt: 'Frequently asked questions, with the fees answer open' },
  { label: 'Calls to action', src: cta, alt: SCREENS[3].alt },
];

const WEBINAR = [
  { label: 'Page introduction', src: webinarIntro, alt: 'The webinar page introduction' },
  { label: 'Call to action', src: webinarCta, alt: 'A dark call to action panel' },
  { label: 'Benefits', src: webinarBenefits, alt: 'Cards listing what the webinar will do for you' },
  { label: 'Who it’s for', src: webinarFit, alt: 'Two lists: a good fit and might not be a fit' },
  { label: 'Testimonials', src: webinarTestimonials, alt: 'Three client testimonials' },
  { label: 'FAQs', src: webinarFaqs, alt: 'Frequently asked questions with one answer open' },
];

/** A silent loop with a way to stop it. `lazy` waits until it's on screen. Holds on the first frame for reduced motion. */
function Preview({ src, poster, label, className, lazy }: { src: string; poster: string; label: string; className?: string; lazy?: boolean }) {
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
        src={src}
        poster={poster}
        autoPlay={!still && !lazy}
        preload={lazy ? 'none' : undefined}
        muted
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={label}
      />
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

/** The site's screens, on the page's opening frame. */
function HeroVideo() {
  return (
    <div className={`${g.heroFig} rv`} style={{ '--i': 2 }}>
      <Preview src={showcase} poster={poster} label="Screens from the redesigned House of Alpha website" />
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
    <div className={g.study}>
      <CaseBody client={{ name: 'House of Alpha', logo: houseOfAlpha }} title={
      <>
        Redesigning House of Alpha’s website <span className="g">to attract better-fit clients</span>
      </>
    } toc={TOC}>
        <CaseHero
          summary={
            <>
              House of Alpha is a wealth management firm helping high-net-worth individuals and senior executives plan for retirement and manage their wealth.
              <br />
              <br />
              I led the brand and website revamp, from positioning and messaging to the website experience and a modular design system that made future marketing pages easier to build.
            </>
          }
          meta={[
            { term: 'Client', value: 'House of Alpha · Wealth Management' },
            { term: 'My role', value: 'Product Design · Brand & Web Design' },
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
            { term: 'Timeline', value: '8 weeks' },
          ]}
          media={<HeroVideo />}
        />

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
          <ToAdd>Original website with annotations showing generic messaging, unclear hierarchy, and limited page flexibility.</ToAdd>
        </CaseSection>

        <CaseSection id="solution" label="Solution">
          <CaseSub id="identity" title="A more distinctive identity for a more focused business.">
            <Text>The existing brand lacked the distinction and consistency we wanted to carry into the new website.</Text>
            <Text>I explored a visual direction that felt confident and established, without falling back on the usual financial services imagery and design conventions.</Text>
            <Text>The refreshed identity gave us a consistent foundation for typography, imagery, page layouts, and other brand applications.</Text>
            <Figure tone="field" caption="Concept applications, made for this case study.">
              <ul className={w.screens}>
                {BRAND.map((item) => (
                  <li key={item.alt}>
                    <img src={item.src} alt={item.alt} loading="lazy" />
                  </li>
                ))}
              </ul>
            </Figure>
          </CaseSub>

          <CaseSub id="website" kicker="Redesigning the website" title="Answering the important questions before the first call.">
            <Text>Previously, visitors had to work harder than necessary to understand whether House of Alpha was right for them.</Text>
            <Text>I reorganised the website around the questions a prospective client would naturally have.</Text>
            <PointCards
              list
              items={[
                { object: 'mirror', title: '01. Is this for someone like me?', body: 'The homepage speaks directly to senior professionals preparing for retirement.' },
                { object: 'compass', title: '02. How can they help me?', body: 'Instead of simply listing services, the content explains the firm’s approach to retirement planning and managing wealth over the long term.' },
                { object: 'mugs', title: '03. Who will I be working with?', body: 'We gave more attention to the firm’s people, philosophy, and advisory process to help visitors understand the relationship before making contact.' },
                { object: 'signpost', title: '04. What happens next?', body: 'A more purposeful enquiry flow collects relevant information about prospective clients and their goals.' },
              ]}
            />
            <KeyInsight>
              The aim wasn’t to add more content, but <em>to help visitors find what they needed before speaking to an advisor.</em>
            </KeyInsight>
            <Figure tone="field">
              <ul className={w.screens}>
                {SCREENS.map((screen) => (
                  <li key={screen.alt}>
                    <img src={screen.src} alt={screen.alt} loading="lazy" />
                  </li>
                ))}
              </ul>
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
            <Figure tone="field">
              <ul className={w.modules}>
                {MODULES.map((module) => (
                  <li key={module.label}>
                    <img src={module.src} alt={module.alt} loading="lazy" />
                    <span>{module.label}</span>
                  </li>
                ))}
              </ul>
            </Figure>
          </CaseSub>
        </CaseSection>

        <CaseSection id="webinar" label="First test" title="Our first test? A webinar page in two days.">
          <Text>When the team needed a new webinar landing page, engineers could work with the existing sections rather than building everything from scratch.</Text>
          <Lead>The page was assembled and launched in just two days.</Lead>
          <Text>It was a useful demonstration of why we’d invested in the system alongside the redesign.</Text>
          <Figure tone="field" caption="The webinar page, broken into its sections." style={{ '--tint': '#FFFBD4' }}>
            <ul className={w.modules}>
              {WEBINAR.map((section) => (
                <li key={section.label}>
                  <img src={section.src} alt={section.alt} loading="lazy" />
                  <span>{section.label}</span>
                </li>
              ))}
            </ul>
          </Figure>
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
