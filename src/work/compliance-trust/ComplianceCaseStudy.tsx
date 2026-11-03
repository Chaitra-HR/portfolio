import { Alternatives, Bullets, CaseBody, CaseHero, CaseSection, CaseSub, KeyInsight, Lead, OutcomeCards, Reasoning, TeamStack, Text, type TocEntry } from '../../pages/CaseStudy/kit';
import { Figure, ToAdd } from '../gather/Figure';
import g from '../gather/Gather.module.css';
import { PointCards } from '../website-revamp/PointCards';
import { AuditTrail } from './AuditTrail';
import { ReviewDashboard } from './ReviewDashboard';
import { AnnotatedPost, FlagComponents, FlagTaxonomy, InlineReview, RegionContext, ReviewCompare, WorkflowCompare } from './InlineReview';

const TOC: TocEntry[] = [
  { id: 'problem', label: 'The problem' },
  { id: 'obvious', label: 'The obvious solution' },
  { id: 'review', label: 'What the review should do' },
  {
    id: 'decisions',
    label: 'Three decisions',
    children: [
      { id: 'context', label: 'Regulatory context' },
      { id: 'close', label: 'Close to the sentence' },
      { id: 'history', label: 'Review history' },
      { id: 'system', label: 'Flag system' },
    ],
  },
  { id: 'feedback', label: 'Feedback' },
  { id: 'reflection', label: 'Reflection' },
];

const ILLUSTRATIVE = 'Illustrative, with sample copy.';

export default function ComplianceCaseStudy() {
  return (
    <div className={g.study}>
      <CaseBody title="Making AI-generated financial content safer to publish" toc={TOC} overview={
            <>
              Designing a compliance review experience for financial advisors, with region-specific guidance and a built-in review history.
              <br />
              <br />
              I built FinScribe to help financial advisors turn marketing ideas into content. But there was a fundamental problem: advisors couldn’t confidently tell whether AI-generated copy was appropriate to publish.
              <br />
              <br />
              This case study is about how I approached that problem, why I decided a compliance review feature was worth building, and what eight advisors taught me about making the feedback actually useful.
            </>
          } hero={
        <CaseHero
          meta={[
            { term: 'Role', value: 'Founder & Product Designer' },
            { term: 'Timeline', value: '2026–Present' },
            {
              term: 'Team',
              value: (
                <TeamStack
                  label="Two marketeers, a compliance officer & me"
                  members={[
                    { avatar: 'founderA', title: 'Marketeer' },
                    { avatar: 'founderB', title: 'Marketeer' },
                    { avatar: 'engineer', title: 'Compliance Officer' },
                    { avatar: 'me', title: 'Product Designer (me)' },
                  ]}
                />
              ),
            },
            { term: 'Skills', value: ['Product Strategy', 'UX Research', 'AI Product Design', 'Interaction Design'] },
          ]}
          media={
            <Figure tone="field" className={`${g.heroFig} rv`} style={{ '--i': 2 }} caption="The compliance review experience. Illustrative, with sample copy.">
              <ReviewDashboard />
            </Figure>
          }
        />
      }>

        <CaseSection id="problem" label="The problem" title="AI can write a month’s worth of content. That doesn’t mean an advisor can publish it.">
          <Text>Ask ChatGPT to write a LinkedIn post about retirement planning and it’ll give you something fairly convincing in seconds.</Text>
          <Lead>For a financial advisor, though, convincing isn’t necessarily good enough.</Lead>
          <PointCards
            list
            items={[
              { object: 'lens', title: 'Content review', body: 'A sentence could promise more than it should. A performance claim might need evidence. A perfectly reasonable-looking post could be missing an important disclosure.' },
              { object: 'globe', title: 'Regional requirements', body: 'What’s acceptable depends on who’s publishing it. Advisors in Australia work under ASIC’s requirements. In India, SEBI has its own rules. In the US, SEC and FINRA requirements depend on the type of firm.' },
              { object: 'archive', title: 'Recordkeeping', body: 'Certain firms must retain marketing communications and relevant approval records, sometimes for years after publication.' },
            ]}
          />
          <KeyInsight label="The design challenge">
            So even when AI does a decent job of writing, someone still needs to determine whether the final content is appropriate to publish. <em>That’s the part I wanted to solve.</em>
          </KeyInsight>
          <Figure tone="field" caption={ILLUSTRATIVE}>
            <AnnotatedPost />
          </Figure>
          <Figure tone="field" caption="The existing review loop, and the suggested workflow inside the editor.">
            <WorkflowCompare />
          </Figure>
        </CaseSection>

        <CaseSection id="obvious" label="Questioning the obvious solution" title="Why build a compliance feature when I could just improve the prompt?">
          <Text>This was my first question. I could tell FinScribe’s AI to follow ASIC or SEC guidance. Advisors could do the same thing in ChatGPT. Why complicate the product with another feature?</Text>
          <Lead>The problem is that a good prompt isn’t a review process.</Lead>
          <Bullets items={['An advisor might change the generated copy.', 'The AI might make a claim it can’t substantiate.', 'A firm might have additional rules about what its advisors can publish.']} />
          <Text>And none of that answers what happens to the final post or how the review is recorded. I looked at three ways to handle this.</Text>
          <Alternatives
            items={[
              { label: 'Prompt, draft, publish', title: 'Make the AI more careful', body: 'Useful for reducing obvious problems, but it still leaves the final content unchecked.' },
              { label: 'Write, run review, fix, publish', title: 'Add a compliance checker', body: 'Let advisors finish writing and run a review before publishing. Straightforward, but another step to remember.' },
              { label: 'Write and review, publish', title: 'Build the review into the writing experience', body: 'Let advisors see potential issues, understand them, and keep track of their decisions without moving between tools.', chosen: true },
            ]}
          />
          <Text>I went with the third approach.</Text>
          <Reasoning
            why="I felt the feature would be far more useful if compliance wasn’t something advisors had to remember to do separately."
            tradeoff="It meant more work on the editor."
          />
        </CaseSection>

        <CaseSection id="review" label="Figuring out what the review should actually do" title="Not every warning needs a rewrite. Sometimes it just needs an explanation.">
          <Text>My first instinct was to show a list of compliance issues after the advisor finished writing. Something like a document checker: run the review, get the results, fix the warnings.</Text>
          <Text>It made sense until I started thinking through what the advisor would actually have to do. They would finish a post, get told three things were wrong, go back into the editor, find the sentences, and work out what to change.</Text>
          <Text>I started exploring whether the feedback could sit alongside the writing instead. That brought up another problem: nobody wants an editor covered in red underlines every time they type something about investments.</Text>
          <KeyInsight label="Where the challenge moved">
            So the challenge became finding the right balance. <em>Make potential risks visible without making the entire writing experience feel like a warning screen.</em>
          </KeyInsight>
          <Figure tone="field" caption={ILLUSTRATIVE}>
            <ReviewCompare />
          </Figure>
        </CaseSection>

        <CaseSection id="decisions" label="Design decisions" title="Three decisions shaped the design">
          <CaseSub id="context" kicker="Decision 01" title="The advisor’s regulatory context comes first.">
            <Text>I designed the review to account for the advisor’s selected region and show relevant context alongside flagged content.</Text>
            <Text>I also wanted the language to be careful. There’s a difference between saying something <em>may need attention</em> and confidently declaring it non-compliant.</Text>
            <Reasoning
              why="A generic warning about an investment claim isn’t particularly helpful. The advisor needs to know why something might be a problem under the rules that apply to their business."
              tradeoff="The system is there to help advisors review their content, not issue a regulatory stamp of approval."
              tradeoffLabel="Limit accepted"
            />
            <Figure tone="field" caption={ILLUSTRATIVE} notice="The explanation names the rules for the selected region, and says the wording may need softening, not that it’s wrong.">
              <RegionContext />
            </Figure>
          </CaseSub>

          <CaseSub id="close" kicker="Decision 02" title="Keep the feedback close to the sentence.">
            <Text>Rather than sending advisors to a separate report, I brought potential issues into the editor. A flagged sentence can be inspected where it appears. The advisor can read the explanation, consider a suggested change, or rewrite it themselves.</Text>
            <Reasoning why={<>I didn’t want accepting an AI rewrite to become the only obvious way forward. <b>That decision turned out to matter in testing.</b></>} />
            <Figure tone="field" caption="Try it: click a marked phrase, or just start typing. Illustrative, with sample copy." notice="“Rewrite it myself” and “Use the suggestion” carry the same visual weight, so neither reads as the expected choice.">
              <InlineReview />
            </Figure>
          </CaseSub>

          <CaseSub id="history" kicker="Decision 03" title="Don’t lose the decisions after the warning disappears.">
            <Text>I designed a review history so the advisor can revisit flagged content and the decisions made around it.</Text>
            <Reasoning
              why="Once an advisor edits a flagged sentence, the warning might be resolved. But what happened during that review can still matter."
              tradeoff="It’s a starting point for traceability, not a claim that FinScribe already replaces a firm’s formal approval or recordkeeping systems."
              tradeoffLabel="Limit accepted"
            />
            <Figure tone="field" caption={ILLUSTRATIVE}>
              <AuditTrail />
            </Figure>
          </CaseSub>

          <CaseSub id="system" kicker="The system" title="From flag to fix. One system, every severity level.">
            <Figure tone="field" caption="Severity levels. Each one sets how a flag behaves.">
              <FlagTaxonomy />
            </Figure>
            <Figure tone="field" caption="Components. Illustrative, with sample copy.">
              <FlagComponents />
            </Figure>
          </CaseSub>
        </CaseSection>

        <CaseSection id="feedback" label="Feedback & early traction" title="Eight advisors helped me realise I was paying attention to the wrong thing.">
          <Text>FinScribe is still pre-beta, but I’ve been testing the compliance flow with a small group of eight advisors. I was especially curious about the inline feedback. Would advisors find it useful, or would it make the editor feel cluttered?</Text>
          <OutcomeCards
            lead={{ status: 'observed', value: 'Advisors read the explanations, not the rewrites', body: 'What surprised me was how much attention they paid to the explanations rather than the suggested rewrites.' }}
            items={[
              { status: 'observed', value: 'The flags made sense', body: 'They understood the flags fairly quickly.' },
              { status: 'observed', value: 'Some ignored the rewrite', body: 'In a few sessions, advisors ignored the rewrite completely. Once they understood what was wrong, they preferred to fix the sentence themselves.' },
            ]}
          />
          <Text>One advisor put it simply:</Text>
          <blockquote className={g.insight} style={{ marginInline: 0 }}>
            “I don’t need it to rewrite everything. <em>Just tell me what I should be careful about.”</em>
          </blockquote>
          <Text>I liked that response because it challenged something I’d taken for granted. When you’re building an AI writing product, it’s tempting to make the AI do more. Suggest a better sentence. Fix the warning. Remove the friction.</Text>
          <Text>But perhaps removing every bit of friction isn’t always the right goal. <b>In this case, helping someone understand the concern might be more valuable than automatically fixing it for them.</b></Text>
          <ToAdd>Testing observations and the resulting emphasis on explanations.</ToAdd>
          <OutcomeCards
            lead={{
              status: 'anticipated',
              value: 'Warning quality, across regulatory contexts',
              body: 'It’s still early. Eight advisors are enough to learn something about the interaction, not enough to claim the system is improving regulatory outcomes. I still need to test the quality of its warnings and how it behaves across different regulatory contexts.',
            }}
          />
        </CaseSection>

        <CaseSection id="reflection" label="Reflection" title="The right feedback at the wrong time is still the wrong experience.">
          <Text>I started by treating compliance as a review step: finish the content, run the check, then fix what came back. On paper, it made sense. But once I visualised the full workflow, it was clear that the problem wasn’t just the quality of the feedback. It was when the advisor received it.</Text>
          <Text>Moving compliance into the editor changed how I thought about the feature. <b>The same warning that feels like rework at the end can feel useful when it appears while the sentence is still being shaped.</b></Text>
          <Text>And testing reminded me that a good AI experience doesn’t always mean automating the next action.</Text>
          <KeyInsight label="What I took away">
            Sometimes the better design is to give people enough information to make that decision themselves. <em>That’s the direction I want to keep taking FinScribe.</em>
          </KeyInsight>
        </CaseSection>
      </CaseBody>
    </div>
  );
}
