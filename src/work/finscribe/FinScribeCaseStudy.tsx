import { Link } from 'react-router';
import { caseStudyPath } from '../../data/projects';
import { Alternatives, Bullets, CaseBody, CaseHero, CaseSection, CaseSub, Figure, Findings, KeyInsight, Lead, PointCards, study, TeamStack, Text, type TocEntry } from '../../pages/CaseStudy/kit';
import { ReviewDashboard } from '../finscribe-app/ReviewDashboard';
import { BlankComposer, CompetitorTable, PositioningMatrix } from './Market';
import { EmptyBox, Headlines, NoTime, OwnWords } from './Moments';
import { DraftScreen, EditorScreen, HomeScreen, IdeasScreen } from './Screens';

const TOC: TocEntry[] = [
  { id: 'solution', label: 'Solution' },
  {
    id: 'flows',
    label: 'Core flows',
    children: [
      { id: 'find', label: 'Finding the idea' },
      { id: 'draft', label: 'Idea to draft' },
      { id: 'yours', label: 'Making it yours' },
      { id: 'review', label: 'Review' },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    children: [
      { id: 'problem', label: 'The problem' },
      { id: 'opportunity', label: 'The opportunity' },
    ],
  },
  { id: 'exploring', label: 'Exploring the workflow' },
  { id: 'testing', label: 'Prototyping and testing' },
  { id: 'decisions', label: 'Design decisions' },
  { id: 'regulated', label: 'Designing for a regulated industry' },
  { id: 'reflection', label: 'Reflection' },
];

const ILLUSTRATIVE = 'Illustrative, with sample copy.';
const SOURCES = 'Based on public product information, November 2026.';

export default function FinScribeCaseStudy() {
  return (
    <div className={study.study}>
      <CaseBody title="Designing an AI writing workflow for financial advisors" toc={TOC} overview={
            <>
              What does an AI writing tool look like when the user doesn’t know what to write?
              <br />
              <br />
              Financial advisors know their clients. Then they sit down to create content and get this: <b>“What would you like to write about?”</b>
              <br />
              <br />
              FinScribe is an AI-native marketing assistant I’m building to rethink that blank box, helping advisors get from <b>“I should post something”</b> to something worth publishing.
            </>
          } hero={
        <CaseHero
          meta={[
            { term: 'Role', value: 'Founder & Product Designer' },
            { term: 'Timeline', value: '2026 — Present' },
            {
              term: 'Team',
              value: (
                <TeamStack
                  label="Chaitra Rao · Aman Pandey"
                  members={[
                    { avatar: 'me', title: 'Chaitra Rao (me)' },
                    { avatar: 'teammate', title: 'Aman Pandey' },
                  ]}
                />
              ),
            },
            {
              term: 'Skills',
              value: ['Product strategy', 'Customer research', 'UX/UI', 'Prototyping', 'AI product design'],
            },
          ]}
          media={
            <Figure tone="field" className={`${study.heroFig} rv`} style={{ '--i': 2 }} caption={ILLUSTRATIVE}>
              <HomeScreen />
            </Figure>
          }
        />
      }>

        <CaseSection id="solution" label="Solution" title="FinScribe turns advisor expertise into content worth publishing.">
          <Text>Rather than dropping advisors into a blank composer, FinScribe helps them find a direction, turns it into a draft using their existing context, then gives them control to shape it.</Text>
          <Findings
            items={[
              { title: 'Find the idea', body: 'Give advisors useful places to start instead of an empty prompt.' },
              { title: 'Create with context', body: 'Use what FinScribe already knows about the advisor, their audience and their business.' },
              { title: 'Shape, don’t prompt', body: 'Let advisors work directly with the content instead of repeatedly telling AI what to do.' },
            ]}
          />
        </CaseSection>

        <CaseSection id="flows" label="Core flows" title="A workflow that starts before the prompt">
          <Lead>
            <b>Discover → Choose → Create → Shape → Review</b>
          </Lead>

          <CaseSub id="find" title="Find something worth talking about">
            <Text>FinScribe surfaces ideas based on the advisor’s audience, expertise, business and what’s happening around them.</Text>
            <Figure tone="field" caption={`Try it: pick a direction. ${ILLUSTRATIVE}`}>
              <IdeasScreen />
            </Figure>
          </CaseSub>

          <CaseSub id="draft" title="Turn an idea into a draft">
            <Text>Choose a direction and FinScribe uses the context it already has to create a first draft. No elaborate prompt required.</Text>
            <Figure tone="field" caption={ILLUSTRATIVE}>
              <DraftScreen />
            </Figure>
          </CaseSub>

          <CaseSub id="yours" title="Make it yours">
            <Text>Edit directly or ask FinScribe to change tone, structure or emphasis without starting over.</Text>
            <Figure tone="field" caption={`Try it: change the tone. ${ILLUSTRATIVE}`}>
              <EditorScreen />
            </Figure>
          </CaseSub>

          <CaseSub id="review" title="Review before publishing">
            <Text>Potential issues can be surfaced while the advisor is editing, rather than becoming a separate task at the end.</Text>
          </CaseSub>
        </CaseSection>

        <CaseSection id="research" label="Research" title="Understanding where advisors actually get stuck">
          <Text>I spoke with 7 financial advisors about how they currently create content, where ideas come from and how AI fits into that process. I expected writing to be the painful part. It wasn’t.</Text>
          <Findings
            columns={2}
            note={ILLUSTRATIVE}
            items={[
              { visual: <EmptyBox />, title: 'What should I write about?', body: 'Advisors knew plenty. Deciding what to say was the hard part, and their strongest ideas came from questions clients had already asked.' },
              { visual: <OwnWords />, title: 'How do I make it not sound like AI?', body: 'AI could produce something in seconds. Advisors still had to make it sound like them before they’d put their name on it.' },
              { visual: <Headlines />, title: 'Advisors aren’t copywriters', body: 'They’re experts in advice, not content. Turning what they know into a headline and a post people actually want to read didn’t come naturally.' },
              { visual: <NoTime />, title: 'They’re short on time', body: 'Client work comes first. Content gets pushed back to whenever there’s a spare moment, and that moment rarely comes.' },
            ]}
          />

          <CaseSub id="problem" kicker="The problem" title="AI can write the post. The advisor still has to know what to say.">
            <Text>The typical AI writing flow looks simple: <b>Prompt → Generate → Edit → Publish.</b> But most of the thinking sits inside that first step. The advisor has to choose a topic, decide on an angle, provide enough context and explain what they want.</Text>
            <Figure tone="field" caption="The blank box, and everything it leaves to the advisor.">
              <BlankComposer />
            </Figure>
            <KeyInsight label="The design challenge">
              The bottleneck wasn’t typing. <em>It was direction and judgment.</em>
            </KeyInsight>
          </CaseSub>

          <CaseSub id="opportunity" kicker="The opportunity" title="What if the product did more of the thinking before it started writing?">
            <Text>Advisors already have plenty to talk about: client questions, conversations, market events, and problems they find themselves explaining again and again. The opportunity was to turn those signals into useful starting points.</Text>
            <Figure caption={`Hover or tap a logo to see why it sits there. ${SOURCES}`}>
              <PositioningMatrix />
            </Figure>
            <Figure caption={`${SOURCES} FinScribe is pre-beta, so its column shows what it’s designed to do. FMG Suite’s Overwatch and Muse are the closest comparison.`}>
              <CompetitorTable />
            </Figure>
            <Lead>
              Not <b>“Tell me what to write.”</b> More <b>“Help me figure out what’s worth saying.”</b>
            </Lead>
          </CaseSub>
        </CaseSection>

        <CaseSection id="exploring" label="Exploring the workflow" title="How much should FinScribe decide?">
          <Text>I explored a few different ways into the creation experience.</Text>
          <Alternatives
            items={[
              { title: 'Open prompt', body: 'Maximum flexibility. It also assumes the advisor knows exactly what they want.' },
              { title: 'Templates', body: 'Useful when the format is known, but the advisor still has to supply the idea.' },
              { title: 'Guided starting points', body: 'FinScribe does more upfront work to surface relevant directions, then gives the advisor more control as the content develops.', chosen: true },
            ]}
          />
          <Text>The third direction felt closer to the actual problem. But it introduced another question: <b>how much guidance is useful before it starts feeling restrictive?</b></Text>
        </CaseSection>

        <CaseSection id="testing" label="Prototyping and testing" title="Testing how much help was actually helpful">
          <Text>I prototyped different versions of the creation flow and tested the MVP with advisors.</Text>
          <Text>Some versions asked for more information upfront. In practice, every field created another little job. Other versions generated content too quickly. They looked impressive, but advisors had less understanding of where the idea came from and less ownership over the result.</Text>
          <KeyInsight label="Where it landed">
            The useful middle ground was surprisingly simple: <em>Give me a good starting point. Let me decide. Then help me move quickly.</em>
          </KeyInsight>
          <Text>FinScribe is currently pre-beta. I’ve tested the MVP with 12 advisors, but I’m deliberately not treating early enthusiasm as product validation. I’m watching for something more useful:</Text>
          <Bullets items={['Do advisors understand where to start?', 'Do the suggested directions actually feel relevant?', 'How much of the generated draft survives?', 'Where do they hesitate?', 'Does something they start become something they’d actually publish?']} />
        </CaseSection>

        <CaseSection id="decisions" label="Design decisions" title="Turning those insights into a simpler creation loop">
          <Text>The research gave me three principles for the final workflow.</Text>
          <PointCards
            list
            items={[
              { object: 'bulb', title: 'Reduce recall at the start', body: 'Surface possible directions rather than asking the advisor to invent one.' },
              { object: 'briefcase', title: 'Carry context forward', body: 'Use what FinScribe already knows instead of repeatedly asking for it.' },
              { object: 'scales', title: 'Keep judgment with the advisor', body: 'AI can suggest, generate and rewrite. The advisor decides what gets said.' },
            ]}
          />
          <Text>
            Context became part of an <b>Advisor Profile</b> that could be set up once and refined over time. The editor wasn’t where AI output went. It was where the advisor decided whether that output deserved their name.
          </Text>
        </CaseSection>

        <CaseSection id="regulated" label="Designing for a regulated industry" title="Good AI output isn’t necessarily publishable output.">
          <Text>Financial content has a constraint most general writing tools don’t have. The cost of getting something wrong is higher.</Text>
          <Text>If FinScribe interrupts the advisor constantly with warnings, writing becomes painful. If it says nothing, we’re ignoring one of the biggest reasons advisors hesitate to use AI-generated content.</Text>
          <Text>So I explored how review could live inside the writing experience without taking it over.</Text>
          <Figure tone="field" caption={ILLUSTRATIVE}>
            <ReviewDashboard />
          </Figure>
          <Text>
            This became a larger design problem of its own.{' '}
            <Link to={caseStudyPath('compliance-trust')}>
              <b>→ Read the FinScribe compliance case study</b>
            </Link>
          </Text>
        </CaseSection>

        <CaseSection id="reflection" label="Reflection" title="What I learned">
          <Text>A prompt box looks beautifully simple. But all you’ve really done is move the complexity into the user’s head.</Text>
          <Text>The model can write. That’s increasingly the least interesting part.</Text>
          <KeyInsight label="What I took away">
            The generation isn’t the product. <em>The product is everything around it that helps an advisor go from having expertise to knowing what to say.</em>
          </KeyInsight>
        </CaseSection>
      </CaseBody>
    </div>
  );
}
