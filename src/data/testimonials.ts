/** Kind words on Home. */
import ajith from '../assets/images/testimonials/ajith-pandey.jpg';
import nisreen from '../assets/images/testimonials/nisreen-mamaji.jpg';
import sameer from '../assets/images/testimonials/sameer-nesarikar.jpg';

interface Testimonial {
  /** Verbatim, as the client gave it. */
  quote: string;
  name: string;
  role: string;
  /** Portrait (square crop works best). Without one, a neutral placeholder shows. */
  photo?: string;
  /**
   * Written to show the layout, not said by anyone. The production build tags these "Sample"
   * so they can't pass for real praise.
   */
  sample?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Chaitra helped us see problems in our client experience that we’d become so used to, we barely questioned them anymore. Some of the most useful changes we made came from her willingness to challenge how things had always been done.',
    name: 'Sameer Nesarikar, CFP',
    role: 'Founder & Wealth Advisor',
    photo: sameer,
  },
  {
    quote: 'Changing a brand after 20 years isn’t something you take lightly, especially when so much of your business is built on trust. Chaitra helped us rethink our identity, website, and overall client experience, bringing everything up to date without losing the familiarity and trust we’d spent two decades building.',
    name: 'Nisreen Mamaji, CFP',
    role: 'Co-founder, MoneyWorks',
    photo: nisreen,
  },
  {
    quote: 'When we started Investment Climb Advisory, we wanted to get our financial planning technology right from day one. Chaitra helped us set up the application around how we wanted to work with clients, making sure the experience was simple for them and practical for our advisors. It gave us a solid foundation to build the business on.',
    name: 'Ajith Pandey, CFP',
    role: 'Founder, Investment Climb Advisory',
    photo: ajith,
  },
];
