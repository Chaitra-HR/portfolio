import { useState } from 'react';
import { cx } from '../../lib/cx';
import { AppShell } from '../finscribe-app/AppShell';
import d from '../finscribe-app/Dashboard.module.css';
import f from './Screens.module.css';

const IDEAS = [
  { format: 'LinkedIn post', title: 'Should I top up my super before 30 June?', why: 'From client questions', detail: 'Three clients asked this month, so others are probably wondering too.' },
  { format: 'Newsletter', title: 'What EOFY really means for pre-retirees', why: 'From your EOFY plan', detail: 'Fits the audience you write for, and the timing is right.' },
  { format: 'Carousel', title: 'Why holding cash feels safe, and what it can cost', why: 'From market moments', detail: 'A question you keep explaining in meetings.' },
];

/** Home: a place to start from whatever the advisor has, or from nothing at all. Illustrative, with sample copy. */
export function HomeScreen() {
  return (
    <AppShell section="home" page="" crumb={['Home']} actions={<span className={d.primary}>Start writing</span>}>
      <div className={f.page}>
        <h4 className={f.title}>What’s on your mind?</h4>
        <p className={f.sub}>Start from a rough thought, or from what FinScribe has found for you.</p>
        <div className={f.starts}>
          <section>
            <h5>I have something</h5>
            <div className={f.box}>
              <ul className={f.chips}>
                <li className={f.chipOn}>Client question</li>
                <li>Rough thought</li>
                <li>Market reaction</li>
              </ul>
              <p className={f.ghostText}>Jot down the idea, or paste a note from a meeting…</p>
            </div>
          </section>
          <section>
            <h5>I have nothing</h5>
            <ul className={f.box}>
              {[
                ['Client questions', 'What people have been asking you'],
                ['Market moments', 'What’s happening this week'],
                ['Seasonal moments', 'EOFY and other dates ahead'],
              ].map(([name, note]) => (
                <li key={name} className={f.startRow}>
                  <b>{name}</b>
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

/** Ideas: directions worth talking about, each showing where it came from. Pick one. Illustrative, with sample copy. */
export function IdeasScreen({ chosen = null }: { chosen?: number | null }) {
  const [picked, setPicked] = useState(chosen);
  return (
    <AppShell section="ideas" page="" crumb={['Ideas']} actions={<span className={d.primary}>Turn into a draft</span>}>
      <div className={f.page}>
        <h4 className={f.title}>Worth talking about this week</h4>
        <p className={f.sub}>
          Based on your audience, <b>pre-retirees</b>, and what’s coming up, <b>EOFY</b>.
        </p>
        <div className={f.ideas}>
          {IDEAS.map((idea, i) => (
            <button key={idea.title} type="button" aria-pressed={picked === i} className={cx(f.idea, picked === i && f.ideaOn)} onClick={() => setPicked(i)}>
              <span className={f.tag}>{idea.format}</span>
              <b>{idea.title}</b>
              <span>{idea.detail}</span>
              <small>{idea.why}</small>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

/** From idea to draft: what FinScribe already knows is filled in, so there's nothing to brief. Illustrative, with sample copy. */
export function DraftScreen() {
  return (
    <AppShell section="content" page="Drafts" crumb={['Content', 'Drafts', 'New draft']} actions={<span className={d.primary}>Create draft</span>}>
      <div className={f.twoUp}>
        <div className={f.page}>
          <p className={f.raw}>
            <small>The idea</small>
            Should I top up my super before 30 June?
          </p>
          {[
            ['Who it’s for', 'Pre-retirees, 55 to 65, from your profile'],
            ['In whose voice', 'Your voice: calm and plain'],
            ['Format', 'LinkedIn post'],
          ].map(([name, value]) => (
            <div key={name} className={f.known}>
              <small>{name}</small>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <aside className={f.side}>
          <h5>Angles</h5>
          <p>Two ways in. Choose one or leave it to the draft.</p>
          <div className={f.option}>
            <b>Start with the deadline</b>
            What actually changes after 30 June.
          </div>
          <div className={f.option}>
            <b>Start with the question</b>
            Why this comes up every year.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

const TONES: Record<string, string> = {
  Calmer: 'A few clients have asked whether they should top up their super before 30 June. There’s no single right answer, and that’s worth saying first.',
  Warmer: 'If you’ve been wondering whether to top up your super before 30 June, you’re in good company. It’s the question I’ve heard most this month.',
  'More direct': 'Should you top up your super before 30 June? It depends on three things, and only one of them is the deadline.',
};

/** The editor: work on the words directly, or ask for a change without starting over. Illustrative, with sample copy. */
export function EditorScreen() {
  const [tone, setTone] = useState('Calmer');
  return (
    <AppShell
      section="content"
      page="Drafts"
      crumb={['Content', 'Drafts', 'Top up before 30 June?']}
      actions={
        <>
          <span className={d.saved}>Saved</span>
          <span className={d.primary}>Send to licensee</span>
        </>
      }
    >
      <div className={f.twoUp}>
        <div className={f.page}>
          <h4 className={f.title}>Before you top up your super</h4>
          <p className={f.body} key={tone}>
            {TONES[tone]}
          </p>
          <p className={f.body}>Here’s what I’d look at before making a decision:</p>
          <ul className={f.bullets}>
            <li>How much room you have under the caps</li>
            <li>When you expect to need the money</li>
            <li>What else is on your plate this year</li>
          </ul>
          <p className={f.body}>Book a call and we’ll talk it through.</p>
        </div>
        <aside className={f.side}>
          <h5>Shape</h5>
          <p>Tone</p>
          <div className={f.tones}>
            {Object.keys(TONES).map((name) => (
              <button key={name} type="button" aria-pressed={tone === name} className={cx(tone === name && f.toneOn)} onClick={() => setTone(name)}>
                {name}
              </button>
            ))}
          </div>
          <p>Structure</p>
          <ul className={f.chips}>
            <li>Shorter</li>
            <li>Add a list</li>
          </ul>
          <p>Emphasis</p>
          <ul className={f.chips}>
            <li>Lead with the deadline</li>
          </ul>
          <p className={f.ask}>Ask for a change…</p>
        </aside>
      </div>
    </AppShell>
  );
}
