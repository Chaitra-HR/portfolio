/** Pieces of the contact footer (BentoFooter); CopyEmailButton is also used on Home. */
import { site } from '../../data/site';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { cx } from '../../lib/cx';
import { Pill } from '../ui/Pill';
import s from './FooterParts.module.css';

/** Copies the email address and confirms for a moment. */
export function CopyEmailButton() {
  const [copied, copy] = useCopyToClipboard();
  return (
    <Pill fill="none" className={s.copy} onClick={() => copy(site.email)} aria-live="polite">
      {/* envelope whose flap flips open while "Email copied" shows */}
      <svg className={cx(s.mail, copied && s.open)} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="8" width="18" height="12" rx="2.5" />
        <path className={s.flap} d="M3.6 8.6 12 14.2l8.4-5.6" />
      </svg>
      <span>{copied ? 'Email copied' : 'Copy email'}</span>
    </Pill>
  );
}

/** Copy email · Resume. */
export function ContactActions({ className }: { className?: string }) {
  return (
    <div className={cx(s.actions, className)}>
      <CopyEmailButton />
      <Pill fill="lilac" href={site.resume}>
        Resume
      </Pill>
    </div>
  );
}

/** The © line. The parent styles the row and the link. */
export function FooterCredits() {
  return (
    <span>
      © 2026. Made with curiosity, care, and a little consideration for the planet we share.{' '}
      <a href={site.footprint} target="_blank" rel="noopener noreferrer">
        See this website’s footprint<span className="sr-only"> (opens in a new tab)</span>
      </a>
      .
    </span>
  );
}
