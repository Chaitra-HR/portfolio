import {
  BeforeAfter,
  CaseBody,
  CaseHero,
  CaseSection,
  Chip,
  Chips,
  DecisionList,
  MediaPanel,
  Mock,
  MockField,
  MockLabel,
  MockOption,
  MockProgress,
  MockQuestion,
  MockSkipped,
  Placeholder,
  StatGrid,
  StatusValue,
  Text,
  ToConfirm,
  type TocEntry,
} from '../../pages/CaseStudy/kit';
import type { CaseStudyProps } from '..';
import g from './Gather.module.css';

const TOC: TocEntry[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'The problem' },
  { id: 'role', label: 'My role' },
  { id: 'change', label: 'What changed' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'outcome', label: 'Outcome' },
  { id: 'reflection', label: 'Reflection' },
];

export default function GatherCaseStudy({ project }: CaseStudyProps) {
  return (
    <>
      <CaseHero
        project={project}
        title={
          <>
            Getting new wealth clients plan-ready in <span className="g">days, not weeks.</span>
          </>
        }
        summary="Gather · client onboarding for a wealth-management firm, redesigned around the questions each client actually needs to answer."
        meta={[
          { term: 'Role', value: <>Product designer, end to end · Capital Design Studio <Placeholder>[confirm scope]</Placeholder></> },
          { term: 'Client', value: <>Wealth-management firm, India <Placeholder>[name if you can share it]</Placeholder></> },
          { term: 'Platform', value: <Placeholder>[Web · mobile]</Placeholder> },
          { term: 'Status', value: <StatusValue project={project} /> },
          { term: 'Team', value: <Placeholder>[Who you worked with]</Placeholder> },
          { term: 'Timeline', value: <Placeholder>[Month Year – Month Year]</Placeholder> },
        ]}
      />

      <MediaPanel
        className="rv"
        style={{ '--i': 5 }}
        background={project.color}
        aspect="16/7"
        aspectSm="4/3"
        caption="Illustrative · replace with a real screen from the shipped flow."
      >
        <Mock className={g.heroMock}>
          <MockLabel>Getting to know you · 3 of 9</MockLabel>
          <MockProgress value={33} color={project.color} style={{ marginBottom: 16 }} />
          <MockQuestion>Do you own your home?</MockQuestion>
          <MockOption selected>Yes</MockOption>
          <MockOption>No</MockOption>
          <MockOption>It’s complicated</MockOption>
        </Mock>
      </MediaPanel>

      <CaseBody toc={TOC}>
        <CaseSection id="overview" label="Overview" title="Onboarding was where new clients lost momentum.">
          <Text>
            Before a client could get a financial plan, they had to finish one long intake form — the same questions for everyone, whatever their
            situation. I redesigned it as an adaptive flow that asks only what each client’s situation needs.
          </Text>
        </CaseSection>

        <CaseSection id="problem" label="The problem" title="Everyone got the same form, so most of it didn’t apply.">
          <Text>
            The intake asked every client the same questions, including many that had nothing to do with their circumstances.{' '}
            <Placeholder>[Add how you knew it was a problem — where clients dropped off, what advisors told you, what the data showed.]</Placeholder>
          </Text>
          <Chips>
            <Chip>
              47 questions <ToConfirm />
            </Chip>
            <Chip>
              27% abandoned <ToConfirm />
            </Chip>
          </Chips>
        </CaseSection>

        <CaseSection id="role" label="My role" title="I owned it from the brief to the shipped flow.">
          <Text>
            Through Capital Design Studio I led the work end to end.{' '}
            <Placeholder>[List what you did — research, flows, interface, handover — and who you worked with on the client and engineering side.]</Placeholder>
          </Text>
        </CaseSection>

        <CaseSection id="change" label="What changed" title="From one form for everyone to questions that adapt." wide>
          <BeforeAfter
            before={
              <Mock className={g.baMock}>
                <MockLabel>Client intake · page 1 of 6</MockLabel>
                <MockField />
                <MockField />
                <MockField />
                <MockField />
                <MockField />
                <MockField width="60%" />
              </Mock>
            }
            after={
              <Mock className={g.baMock}>
                <MockLabel>Getting to know you</MockLabel>
                <MockQuestion style={{ fontSize: 17 }}>Do you own your home?</MockQuestion>
                <MockOption selected>Yes</MockOption>
                <MockOption>No</MockOption>
                <span className={g.skipped}>
                  <MockSkipped>Rental history</MockSkipped>
                  <MockSkipped>First-home grants</MockSkipped>
                </span>
              </Mock>
            }
            caption="Illustrative · replace with real before and after screens."
          />
        </CaseSection>

        <CaseSection id="decisions" label="Decisions and trade-offs" title="Ask what applies. Skip the rest.">
          <DecisionList
            items={[
              {
                title: 'Adaptive, not exhaustive.',
                body: (
                  <>
                    Each answer decides what comes next, so a client only sees the questions that fit their situation.{' '}
                    <ToConfirm style={{ marginLeft: 4 }}>~60% of fields hidden · to confirm</ToConfirm>
                  </>
                ),
              },
              { title: '[A trade-off you made.]', body: '[What you gave up, and why it was worth it.]', placeholder: true },
              { title: '[Something that changed your mind.]', body: '[What research or advisors told you, and what you did about it.]', placeholder: true },
            ]}
          />
        </CaseSection>

        <CaseSection id="outcome" label="Outcome" title="Plan-ready in days, not weeks.">
          <StatGrid
            stats={[
              {
                value: '~3.8 days',
                body: (
                  <>
                    From sign-up to plan-ready, down from about three weeks. <ToConfirm>estimate · to confirm</ToConfirm>
                  </>
                ),
              },
              {
                value: 'Shipped',
                body: (
                  <>
                    Shipped to the firm’s clients. <Placeholder>[Add anything you’ve heard since launch.]</Placeholder>
                  </>
                ),
              },
            ]}
          />
        </CaseSection>

        <CaseSection id="reflection" label="Reflection" title="[What I’d do differently]" placeholderTitle last>
          <Text placeholder>[One or two honest sentences — what you learned, or what you’d test next.]</Text>
        </CaseSection>
      </CaseBody>
    </>
  );
}
