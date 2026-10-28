/**
 * Contact details and outbound links, in one place.
 * Values in [brackets] are the exports' own placeholders — replace them here.
 */
export const site = {
  name: 'Chaitra Rao',
  email: '[hello@yourdomain.com]',
  linkedin: 'https://www.linkedin.com/in/[your-handle]',
  /** Drop the PDF into public/resume.pdf. */
  resume: '/resume.pdf',
  footprint: 'https://www.websitecarbon.com/website/[yourdomain]/',
} as const;

/** Footer pitch used on case studies (and the fallback page). */
export const hiringPitch = {
  heading: 'Looking for a thoughtful team to make interesting things with.',
  body: 'That’s what I’m after next — in-house, in Melbourne. If that sounds like your team, I’d love to hear from you.',
} as const;
