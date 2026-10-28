/** Kind words on Home. Still placeholders — swap in real quotes, verbatim. */
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** Portrait URL (square crop works best). Without one, a neutral placeholder shows. */
  photo?: string;
}

export const testimonials: Testimonial[] = [
  { quote: '[Client quote — their exact words, one or two sentences.]', name: '[Name]', role: '[Role, Company]' },
  { quote: '[Collaborator quote — their exact words.]', name: '[Name]', role: '[Role, Company]' },
  { quote: '[Another client quote — their exact words.]', name: '[Name]', role: '[Role, Company]' },
];
