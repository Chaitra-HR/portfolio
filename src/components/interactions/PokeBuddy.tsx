import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../lib/cx';
import { prefersReducedMotion } from '../../lib/scroll';
import { GradientBuddy, type Mouth, type Outfit } from './GradientBuddy';
import s from './PokeBuddy.module.css';

/** Each poke spins the asterisk into its next outfit, face and line. */
const STEPS: Array<{ outfit: Outfit; mouth: Mouth; say: string }> = [
  { outfit: 'none', mouth: 'rest', say: 'Poke me. I don’t bite.' },
  { outfit: 'specs', mouth: 'smile', say: 'Glasses on. She’s open to new roles. I told her I’d spread the word.' },
  { outfit: 'cool', mouth: 'smirk', say: 'Headphones on. She’s playing that song again. I thought we were done with it.' },
  { outfit: 'blush', mouth: 'cat', say: 'Oh, you’re making me blush. Anyway, the purple one’s her résumé.' },
  { outfit: 'none', mouth: 'grin', say: 'Back to me. AI helps her build. I still think I’m the best thing she’s made.' },
];
/** After the last step, the cycle restarts at the first outfit (not the opening line). */
const next = (i: number) => (i === STEPS.length - 1 ? 1 : i + 1);

const SPIN_MS = 760;
/** Swap the outfit when the asterisk is edge-on; the new line lands just after halfway. */
const SWAP_AT = 0.25;
const SAY_AT = 0.55;

interface PokeBuddyProps {
  /** Size and placement of the mascot. */
  buddyClassName?: string;
  /** Placement of the speech bubble (shown below the mascot, tail pointing up). */
  sayClassName?: string;
}

/**
 * The pokeable mascot and its speech bubble. Poking (click, Enter or Space)
 * turns it round (in 3D) into a new outfit and expression, with a new
 * line. Renders two siblings so each footer can lay them out its own way.
 */
export function PokeBuddy({ buddyClassName, sayClassName }: PokeBuddyProps) {
  const [look, setLook] = useState(0);
  const [line, setLine] = useState(0);
  const [spins, setSpins] = useState(0);
  const busyUntil = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const poke = () => {
    const now = performance.now();
    if (now < busyUntil.current) return;
    const to = next(look);
    if (prefersReducedMotion()) {
      setLook(to);
      setLine(to);
      return;
    }
    busyUntil.current = now + SPIN_MS;
    setSpins((n) => n + 1);
    timers.current.push(window.setTimeout(() => setLook(to), SPIN_MS * SWAP_AT));
    timers.current.push(window.setTimeout(() => setLine(to), SPIN_MS * SAY_AT));
  };

  const onClick = () => poke();
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      poke();
    }
  };

  return (
    <>
      <GradientBuddy
        className={cx(s.buddy, buddyClassName)}
        outfit={STEPS[look].outfit}
        mouth={STEPS[look].mouth}
        spin={spins}
        spinMs={SPIN_MS}
        onClick={onClick}
        onKeyDown={onKey}
        role="button"
        tabIndex={0}
        aria-label="Poke the asterisk"
        data-buddy="footer"
      />
      <span className={cx(s.say, sayClassName)} aria-live="polite">
        {STEPS[line].say}
      </span>
    </>
  );
}
