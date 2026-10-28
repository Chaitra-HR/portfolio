import { useRef, type ReactNode } from 'react';
import { useBandReveal } from '../../hooks/useBandReveal';
import { PokeBuddy } from '../interactions/PokeBuddy';
import { ContactActions, FooterCredits } from './FooterParts';
import s from './BentoFooter.module.css';

interface BentoFooterProps {
  /** Wrap a phrase in <span className="g"> to grey it out. */
  heading: ReactNode;
  body: string;
  className?: string;
}

/** The contact footer used on every page: pitch + actions, and the pokeable mascot. */
export function BentoFooter({ heading, body, className }: BentoFooterProps) {
  const ref = useRef<HTMLElement>(null);
  useBandReveal(ref);

  return (
    <footer ref={ref} id="contact" className={className} aria-label="Contact">
      <div className={s.grid}>
        <div className={`card ${s.lead}`}>
          <h2 className={s.heading}>{heading}</h2>
          <p className={s.body}>{body}</p>
          <ContactActions className={s.actions} />
        </div>
        <div className={`card ${s.side}`}>
          <PokeBuddy buddyClassName={s.buddy} sayClassName={s.say} />
        </div>
      </div>
      <div className={`card ${s.bar}`}>
        <FooterCredits />
      </div>
    </footer>
  );
}
