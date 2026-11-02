import moneyworks from '../../assets/images/logos/moneyworks.svg';
import { Bullets, CaseBody, CaseHero, CaseSection, CaseSub, Evidence, KeyInsight, Lead, More, Reasoning, TeamStack, Text, type TocEntry } from '../../pages/CaseStudy/kit';
import { Benefits, BeforeAfter, Figure, Reported } from './Figure';
import { AdvisorScreen, GatewayScreen } from './product/Product';
import { Capture } from './visuals/Capture';
import { Directions } from './visuals/Directions';
import { FRICTION } from './content';
import { Frictions, Quotes } from './visuals/Findings';
import { HeroComposition } from './visuals/HeroComposition';
import { JourneyMap } from './visuals/JourneyMap';
import { Outcomes, Results } from './visuals/Outcomes';
import { Pathways } from './visuals/Pathways';
import { PullTogether } from './visuals/PullTogether';
import { SheetSlice, Spreadsheet } from './visuals/Spreadsheet';
import g from './Gather.module.css';

const TOC: TocEntry[] = [
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'context', label: 'Context' },
  {
    id: 'pattern',
    label: 'Finding the pattern',
    children: [
      { id: 'walkthroughs', label: 'Walkthroughs' },
      { id: 'audit', label: 'Form audit' },
      { id: 'stalled', label: 'Stalled cases' },
      { id: 'frictions', label: 'Three frictions' },
    ],
  },
  { id: 'directions', label: 'Directions' },
  {
    id: 'final',
    label: 'What we shipped',
    children: [
      { id: 'gateway', label: 'Gateway questions' },
      { id: 'pathways', label: 'Adaptive pathways' },
      { id: 'capture', label: 'Progressive capture' },
      { id: 'summary', label: 'Advisor summary' },
    ],
  },
  { id: 'results', label: 'Results' },
  { id: 'reflection', label: 'Looking back' },
];

const ADVISORS = 'Reported by advisors. Client records weren’t available to me, so this still needs confirming before it’s stated as fact.';

export default function GatherCaseStudy() {
  return (
    <div className={g.study}>
      <CaseBody client={{ name: 'MoneyWorks', logo: moneyworks }} title={
      <>
        Reducing onboarding <span className="g">from 3 weeks to under 4 days</span>
      </>
    } toc={TOC}>
        <CaseHero
          summary="Before an advisor could start planning, every new MoneyWorks client had to fill in a 47-question spreadsheet. I replaced it with an intake that asks only what applies, lets clients finish in stages and shows advisors exactly what’s missing."
          meta={[
            {
              term: 'Client',
              value: (
                <>
                  MoneyWorks
                  <br />
                  Wealth Management
                  <br />
                  India
                </>
              ),
            },
            {
              term: 'My role',
              value: (
                <>
                  Product Design
                  <br />
                  UX Research
                  <br />
                  Interaction Design
                </>
              ),
            },
            {
              term: 'Team',
              value: (
                <>
                  <TeamStack label="Me" members={[{ avatar: 'me', title: 'Product Designer (me)' }]} />
                  <Reported>To confirm</Reported>
                </>
              ),
            },
            { term: 'Timeline', value: <Reported>To confirm</Reported> },
          ]}
          media={
            <Figure tone="field" className={`${g.heroFig} rv`} style={{ '--i': 2 }}>
              <HeroComposition />
            </Figure>
          }
        />

        <CaseSection id="outcomes" label="Outcomes">
          <Outcomes />
        </CaseSection>

        <CaseSection id="context" label="Context" title="The client was ready to begin. Then came the paperwork.">
          <Text>By this point, the hard part should have been over. <b>A client had met their advisor and decided to go ahead.</b></Text>
          <Lead>The next step? A spreadsheet with 47 questions and a separate list of documents.</Lead>
          <Text>Some answers were easy. Others meant logging into accounts, digging out old records, or checking details with an accountant or partner.</Text>
          <More label="Why not pull the data in?">
            <p>We couldn’t simply pull the data in, because Account Aggregator connectivity in India wasn’t yet dependable enough for the firm’s needs.</p>
          </More>
          <Figure caption="What clients had to pull together to complete it">
            <PullTogether />
          </Figure>
          <KeyInsight>
            What appeared to be one spreadsheet was <em>a substantial onboarding task.</em>
          </KeyInsight>

          <CaseSub id="delay" title="One delayed form became a recurring pattern">
            <Text>Advisors kept seeing the same thing:</Text>
            <Bullets items={[<b>Forms came back weeks later, often with answers or documents missing.</b>, 'Some never came back at all.', 'Every gap meant another email, call or reminder.']} />
            <Text>Until the information was complete, <b>nobody could start building the financial plan.</b></Text>
            <dl className={g.stats}>
              <div>
                <dt>
                  <Evidence status="unconfirmed" note={ADVISORS}>
                    3 weeks
                  </Evidence>
                </dt>
                <dd>Average time to receive a completed form</dd>
              </div>
              <div>
                <dt>
                  <Evidence status="unconfirmed" note={ADVISORS}>
                    27%
                  </Evidence>
                </dt>
                <dd>Clients abandoned onboarding entirely</dd>
              </div>
              <div>
                <dt>
                  <Evidence status="unconfirmed" note={ADVISORS}>
                    1–2 hours
                  </Evidence>
                </dt>
                <dd>Advisor time spent chasing missing information</dd>
              </div>
            </dl>
            <Text>The brief was to make the form easier to complete. But <b>I wanted to know what was actually causing the delay.</b></Text>
          </CaseSub>
        </CaseSection>

        <CaseSection id="pattern" label="Finding the pattern" title="I couldn’t talk to clients, so I worked with what we had">
          <Text>Here’s the catch. Client financial data was highly sensitive: <b>no CRM records, no completed forms, and no speaking to clients directly.</b></Text>
          <Text>So I <b>reconstructed the experience with the people who saw it every day</b>, using the existing spreadsheet, de-identified cases and the workarounds advisors had already created.</Text>

          <CaseSub id="walkthroughs" kicker="Step #1" title="Walking the journey with advisors">
            <Text>Advisors walked me through everything from the first meeting to a plan-ready client file. Together we marked:</Text>
            <Bullets items={['Where clients paused', 'Where information came back incomplete', 'Where the team had to step in']} />
            <Figure caption="The journey as advisors described it. Not drawn to scale.">
              <JourneyMap />
            </Figure>
            <Text>
              <b>That told me where things stalled. It didn’t tell me why.</b> So I went back to the spreadsheet.
            </Text>
          </CaseSub>

          <CaseSub id="audit" kicker="Step #2" title="Auditing all 47 questions">
            <Text>I reviewed every question to understand <b>which were essential, which applied only to certain clients, and which needed documents, specialist knowledge or input from someone else.</b></Text>
            <Figure
              caption={
                <>
                  <b>A reconstruction, not the original file.</b> I rebuilt the sheet for this case study: the question wording is representative and the answers are fictional. Select a note to see every row it applies to.
                </>
              }
            >
              <Spreadsheet />
            </Figure>
          </CaseSub>

          <CaseSub id="stalled" kicker="Step #3" title="Rebuilding the cases that stalled">
            <Text>Advisors reconstructed recent cases using de-identified examples. We looked at <b>where progress stopped, what clients asked for help with, and what advisors had to explain outside the spreadsheet.</b></Text>
            <Figure>
              <Quotes />
            </Figure>
          </CaseSub>

          <CaseSub id="frictions" title="Through these steps, the same three frictions kept appearing">
            <Text>Can you guess what they were? 👇</Text>
            <Frictions />
            <Text>
              The spreadsheet treated every question as equally relevant and immediately answerable. <b>Neither assumption held up.</b>
            </Text>
            <p className={g.insight}>
              The problem wasn’t simply the number of questions. It was expecting clients to have <em>every answer ready at once.</em>
            </p>
          </CaseSub>
        </CaseSection>

        <CaseSection id="directions" label="Directions" title="Shortening the form seemed obvious. Until it wasn’t.">
          <Text>Now, you may ask: why not just cut some questions?</Text>
          <Text>Because the firm still needed that information to give appropriate advice. <b>Removing questions could make onboarding look simpler while creating more work for advisors later.</b></Text>
          <Text>So I worked through three directions with advisors. <b>Each one broke in a different place.</b></Text>
          <Figure>
            <Directions />
          </Figure>
          <KeyInsight>
            None of them worked alone. What finally made sense was combining the useful parts: <em>understand the client first, show relevant questions, and let them complete the information in stages.</em>
          </KeyInsight>
        </CaseSection>

        <CaseSection id="final" label="What we shipped" title="Same information. A very different experience.">
          <Text>After testing and refining the core flow, we moved the selected concepts into the final onboarding experience. The firm still collected the same financial and regulatory information.</Text>
          <Lead>What changed was the order, the pacing and the amount clients had to complete upfront.</Lead>

          <CaseSub id="gateway" kicker="Decision 01" title="Gateway questions">
            <Text>Instead of opening with finances, the intake starts with a short set of questions about the client’s household, life stage and reason for seeking advice. <b>Those answers shape everything that follows.</b></Text>
            <Reasoning why={FRICTION.relevance.body} />
            <BeforeAfter
              before={<SheetSlice rows={[1, 2, 3, 4, 5, 8]} label="The first thing a client saw" />}
              after={<GatewayScreen />}
              caption="All client details in these screens are fictional."
            />
            <Benefits items={['Clients only see questions relevant to their situation', 'Household and reasons come first, instead of PAN and date of birth', 'Answering takes no documents and no figures']} />
          </CaseSub>

          <CaseSub id="pathways" kicker="Decision 02" title="Adaptive pathways">
            <Text>I replaced the fixed spreadsheet order with <b>different routes through the same required information.</b></Text>
            <Reasoning why="Life-stage templates were more useful than broad demographics, but clients rarely fit neatly into one template." />
            <BeforeAfter
              before={<SheetSlice rows={[5, 12, 13, 14, 17, 22]} label="The same rows, in the same order, for everyone" />}
              after={<Pathways />}
              caption="Each tick is one of the 47 questions. A hollow tick isn’t lost: the client’s gateway answer already settles it."
            />
            <Benefits items={['A client with a partner begins with shared goals and household finances', 'A single client moves straight into their own circumstances, with no spouse section', 'Both routes cover the same required information']} />
          </CaseSub>

          <CaseSub id="capture" kicker="Decision 03" title="Progressive capture">
            <Text>We split the intake into smaller stages, so clients could <b>provide what they knew today and come back for the rest.</b></Text>
            <Reasoning why={FRICTION.effort.body} />
            <BeforeAfter
              before={<SheetSlice rows={[23, 27, 28, 31, 37, 40]} label="One gap anywhere, and the whole file waits" />}
              after={<Capture />}
              caption="One fictional client: adding what she knows, stepping away, then coming back."
            />
            <Benefits items={['Smaller stages instead of one large submission', 'Progress is saved, so clients can return when a document turns up', 'A missing statement holds up one item instead of everything']} />
          </CaseSub>

          <CaseSub id="summary" kicker="Decision 04" title="Advisor-ready summary">
            <Text>The client’s responses now arrive as a structured summary, so advisors can <b>see what’s been provided and what still needs attention.</b></Text>
            <Reasoning why="Every gap had meant another email, call or reminder." />
            <BeforeAfter
              before={<SheetSlice rows={[31, 33, 34, 36, 43, 44]} label="Finding a gap meant reading every cell" />}
              after={<AdvisorScreen />}
              caption="The advisor’s view of the same client, at the moment she stepped away."
            />
            <Benefits items={['A structured overview instead of searching spreadsheet cells', 'Missing documents, open questions and outstanding requests are kept apart', 'Easier to prepare for the first planning conversation']} />
          </CaseSub>
        </CaseSection>

        <CaseSection id="results" label="Results" title="Less confusion, and fewer moments that needed an advisor">
          <Text>Testing showed clients could move through the intake with <b>less confusion and fewer points where advisor help was needed.</b></Text>
          <Figure>
            <Results />
          </Figure>
          <Text>The findings were encouraging, particularly because <b>the underlying information requirements hadn’t been removed.</b> We had changed when and how clients provided that information.</Text>
        </CaseSection>

        <CaseSection id="reflection" label="Looking back" title="One thing I’d approach differently now">
          <Text>I began this project focused on the spreadsheet. Looking back, the more useful question was <b>why clients needed to finish the entire spreadsheet before anything else could happen.</b></Text>
          <Text>The design improved once I stopped treating onboarding as one form and started looking at the different pieces of work involved.</Text>
          <KeyInsight label="What I took away">
            The information hadn’t changed. <em>The way we asked for it had.</em>
          </KeyInsight>
        </CaseSection>
      </CaseBody>
    </div>
  );
}
