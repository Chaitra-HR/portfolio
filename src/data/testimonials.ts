/** Kind words on Home. */
import engineer from '../assets/images/team/engineer.png';
import founderA from '../assets/images/team/founder-a.png';
import founderB from '../assets/images/team/founder-b.png';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** Portrait (square crop works best). Without one, a neutral placeholder shows. */
  photo?: string;
  /**
   * Written to show the layout, not said by anyone. The production build tags these "Sample"
   * so they can't pass for real praise. Replace each with a real quote, verbatim, and drop the flag.
   */
  sample?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Chaitra didn’t just make our onboarding form shorter. She found out why clients were stalling, and the fix changed how our advisors work, not just what clients see.',
    name: 'Meera Iyer',
    role: 'Head of Client Services, wealth-management firm',
    photo: founderA,
    sample: true,
  },
  {
    quote: 'She asked who the site was really for before drawing a single screen. The new site finally sounds like us, and the enquiries we get now are the ones we want.',
    name: 'Daniel Hale',
    role: 'Managing Director, financial-planning practice',
    photo: founderB,
    sample: true,
  },
  {
    quote: 'Working with Chaitra on FinScribe, compliance stopped being the last-minute blocker. Every flag explains itself, so advisors fix things without waiting on me.',
    name: 'Priya Nair',
    role: 'Compliance Officer, licensee group',
    photo: engineer,
    sample: true,
  },
];
