/**
 * Project metadata — the single source for titles, status, colour and the
 * "gist" Home shows on hover. Presentation (cover art, case-study layout)
 * lives in src/work/<slug>/.
 */

type ProjectStatus = 'Shipped' | 'Pre-beta';

export interface CaseStudyProject {
  kind: 'case';
  /** Internal key: art, page module and home layout use it. */
  slug: string;
  /** The public URL segment, /work/<path>. Old slug URLs redirect here. */
  path: string;
  /** "01" — also the case-study order. */
  number: string;
  title: string;
  /** Longer title used on the Home tile, when different. */
  cardTitle?: string;
  summary: string;
  status: ProjectStatus;
  /** Field colour behind the project's art. */
  color: string;
  /** One line shown under the tile on tablet and mobile. */
  proves: string;
  gist: { problem: string; decision: string; outcome: string };
}

export interface SideProject {
  kind: 'side';
  slug: string;
  title: string;
  role: string;
  /** Status shown in the gist panel. */
  status: string;
  description: string;
  chips: string[];
  color: string;
  gist: string;
  href?: string;
}

export const caseStudies: CaseStudyProject[] = [
  {
    kind: 'case',
    slug: 'gather',
    path: 'moneyworks-client-onboarding',
    number: '01',
    title: 'Client Onboarding',
    summary: 'Wealth-management onboarding',
    status: 'Shipped',
    color: '#1D3FE0',
    proves: 'Proves: ships, and moves a number.',
    gist: {
      problem: 'A 47-question spreadsheet stalled new clients before planning could begin.',
      decision: 'Ask what applies, let clients finish in stages, and show advisors what’s missing.',
      outcome: 'Reported: 3 weeks to under 4 days, pending verification.',
    },
  },
  {
    kind: 'case',
    slug: 'finscribe',
    path: 'finscribe-content-creation',
    number: '02',
    title: 'FinScribe',
    summary: '0-to-1 AI content tool for advisors',
    status: 'Pre-beta',
    color: '#EFEFEF',
    proves: 'Proves: designing a 0-to-1 AI product.',
    gist: {
      problem: '“Tell the AI what to write” left advisors with the hardest part.',
      decision: 'Start from what matters to each advisor’s business.',
      outcome: 'Pre-beta with 12 advisors. No launch metrics yet.',
    },
  },
  {
    kind: 'case',
    slug: 'compliance-trust',
    path: 'finscribe-compliance-review',
    number: '03',
    title: 'Compliance Trust System',
    summary: 'AI compliance review, explained inline',
    status: 'Pre-beta',
    color: '#FDC79F',
    proves: 'Proves: trust and human control in AI.',
    gist: {
      problem: 'Pass/fail AI warnings said something was wrong, but not why.',
      decision: 'Explain each issue inline and offer the fix, so people stay in control.',
      outcome: 'In pre-beta.',
    },
  },
  {
    kind: 'case',
    slug: 'website-revamp',
    path: 'website-redesign',
    number: '04',
    title: 'Website Revamp',
    cardTitle: 'Website Revamp for Conversions',
    summary: 'Positioning for a wealth firm',
    status: 'Shipped',
    color: '#F5F1E0',
    proves: 'Proves: positioning and conversion thinking.',
    gist: {
      problem: 'The firm hadn’t decided who its site was for.',
      decision: 'Define the audience first, then redesign around them.',
      outcome: 'Reportedly 15–20% more qualified enquiries.',
    },
  },
];

export const sideProjects: SideProject[] = [
  {
    kind: 'side',
    slug: 'reframe',
    title: 'Reframe',
    role: 'Prototype',
    status: 'Shipped',
    description: 'A calm iOS app for catching a spiralling thought and finding a gentler way to hold it.',
    chips: ['Emotional design', 'Shipped'],
    color: '#EADFD0',
    gist: 'A shipped emotional-design prototype: capture a thought, see the pattern, get a gentler perspective.',
  },
  {
    kind: 'side',
    slug: 'dial',
    title: 'Dial',
    role: 'Interaction study',
    status: 'Interaction study',
    description: 'A machined thermostat knob that turns with your pointer and clicks into each step.',
    chips: ['Interaction', 'Tactile UI'],
    color: '#17181B',
    gist: 'An interaction study: a thermostat dial that follows your pointer.',
  },
  {
    kind: 'side',
    slug: 'rayaru',
    title: 'Rayara Antaranga',
    role: 'Personal',
    status: 'Live',
    description: 'A scroll-driven 3D tribute to Sri Raghavendra Tirtha. A small seva.',
    chips: ['3D web', 'Live'],
    color: '#16150F',
    gist: 'A scroll-driven 3D tribute to Sri Raghavendra Tirtha.',
    href: 'https://www.lifeofrayaru.com/',
  },
];

export type Project = CaseStudyProject | SideProject;

/** Looks a study up by its public path, or by its old slug URL (the loader redirects those). */
export const findCaseStudy = (segment: string | undefined) => caseStudies.find((p) => p.path === segment) ?? caseStudies.find((p) => p.slug === segment);

export const caseStudyPath = (slug: string) => `/work/${caseStudies.find((p) => p.slug === slug)?.path ?? slug}`;

/** Previous and next case studies, wrapping around the list. */
export function neighbours(slug: string): { previous: CaseStudyProject; next: CaseStudyProject } | null {
  const i = caseStudies.findIndex((p) => p.slug === slug);
  if (i === -1 || caseStudies.length < 2) return null;
  const n = caseStudies.length;
  return { previous: caseStudies[(i - 1 + n) % n], next: caseStudies[(i + 1) % n] };
}
