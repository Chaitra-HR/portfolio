/**
 * Project metadata — the single source for titles, status, colour and the
 * "gist" Home shows on hover. Presentation (cover art, case-study layout)
 * lives in src/work/<slug>/.
 */

export type ProjectStatus = 'Shipped' | 'Pre-beta';

export interface CaseStudyProject {
  kind: 'case';
  slug: string;
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
    number: '01',
    title: 'Gather',
    summary: 'Wealth-management onboarding',
    status: 'Shipped',
    color: '#1D3FE0',
    proves: 'Proves: ships, and moves a number.',
    gist: {
      problem: 'A long, one-size-fits-all intake stalled new clients before they reached a plan.',
      decision: 'Ask only what each client’s situation needs, and skip the rest.',
      outcome: 'Plan-ready in days, not weeks (estimate).',
    },
  },
  {
    kind: 'case',
    slug: 'finscribe',
    number: '02',
    title: 'FinScribe',
    summary: '0-to-1 AI content tool for advisors',
    status: 'Pre-beta',
    color: '#EFEFEF',
    proves: 'Proves: designing a 0-to-1 AI product.',
    gist: {
      problem: '“Tell the AI what to write” left advisors with the hardest part.',
      decision: 'Start from what matters to each advisor’s business. Built with Aman Pandey.',
      outcome: 'Pre-beta with 12 advisors. No launch metrics yet.',
    },
  },
  {
    kind: 'case',
    slug: 'compliance-trust',
    number: '03',
    title: 'Compliance Trust System',
    summary: 'AI compliance review, explained inline',
    status: 'Pre-beta',
    color: '#000000',
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
    number: '04',
    title: 'Website Revamp',
    cardTitle: 'Website Revamp for Conversions',
    summary: 'Positioning for a wealth firm',
    status: 'Shipped',
    color: '#B9DB4C',
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
    slug: 'screenedu',
    title: 'ScreenEdu',
    role: 'Co-founded',
    status: 'Founder',
    description: 'A product I co-founded outside client work. Now used in 16+ schools.',
    chips: ['Founder', '16+ schools'],
    color: '#B9DB4C',
    gist: 'Co-founded. Now used in 16+ schools.',
  },
  {
    kind: 'side',
    slug: 'reframe',
    title: 'Reframe',
    role: 'Prototype',
    status: 'Shipped',
    description: 'A shipped emotional-design prototype.',
    chips: ['Emotional design', 'Shipped'],
    color: '#000000',
    gist: 'A shipped emotional-design prototype.',
  },
];

export type Project = CaseStudyProject | SideProject;

export const findCaseStudy = (slug: string | undefined) => caseStudies.find((p) => p.slug === slug);

export const caseStudyPath = (slug: string) => `/work/${slug}`;

/** Previous and next case studies, wrapping around the list. */
export function neighbours(slug: string): { previous: CaseStudyProject; next: CaseStudyProject } | null {
  const i = caseStudies.findIndex((p) => p.slug === slug);
  if (i === -1 || caseStudies.length < 2) return null;
  const n = caseStudies.length;
  return { previous: caseStudies[(i - 1 + n) % n], next: caseStudies[(i + 1) % n] };
}
