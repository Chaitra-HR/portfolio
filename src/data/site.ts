/**
 * Contact details and outbound links, in one place.
 * Values in [brackets] are the exports' own placeholders — replace them here.
 */
export const site = {
  name: 'Chaitra Rao',
  /** The live address, no trailing slash: canonical links, the sitemap and social cards use it. */
  url: 'https://chaitrarao.com',
  email: 'hrchaitrarao@gmail.com',
  linkedin: 'https://www.linkedin.com/in/chaitraraodesign/',
  resume: 'https://drive.google.com/file/d/1PUNue1seACz4psTQJaryU-5rVkiBHQdZ/view?usp=sharing',
  footprint: 'https://www.websitecarbon.com/website/chaitrarao-com/',
} as const;

/** Footer pitch used on case studies (and the fallback page). */
export const hiringPitch = {
  heading: 'Looking for a thoughtful team to make interesting things with.',
  body: 'That’s what I’m after next — in-house, in Melbourne. If that sounds like your team, I’d love to hear from you.',
} as const;
