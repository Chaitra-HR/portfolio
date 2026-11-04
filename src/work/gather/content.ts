/**
 * The 47-question set behind the form audit and the pathway comparison, so the
 * two can't disagree. Wording is a reconstruction and every answer is fictional.
 */

export type Friction = 'relevance' | 'effort' | 'trust';

export const FRICTION: Record<Friction, { n: number; name: string; title: string; note: string; body: string }> = {
  relevance: {
    n: 1,
    name: 'Relevance',
    title: 'Questions that didn’t apply',
    note: 'Clients still had to read each one, work out whether it was meant for them, and decide whether to leave it blank.',
    body: 'Every client received the same spreadsheet, even when sections did not apply to their situation.',
  },
  effort: {
    n: 2,
    name: 'Effort',
    title: 'Answers kept somewhere else',
    note: 'A statement, a partner or an accountant held the answer, so the row stayed empty until they came back.',
    body: 'Many responses depended on locating records, accessing accounts or getting information from an accountant, provider or partner.',
  },
  trust: {
    n: 3,
    name: 'Trust',
    title: 'Sensitive with no reason given',
    note: 'The sheet asked for personal figures and never said why they mattered, so clients paused or called their advisor.',
    body: 'Clients were expected to share sensitive financial information without clear visibility into how it would be stored, reviewed or used.',
  },
};

export type Household = 'partner' | 'dependants' | 'home' | 'homeLoan' | 'property' | 'esops' | 'overseas' | 'trust' | 'salaried' | 'self';

export interface Question {
  n: number;
  text: string;
  answer?: string;
  friction?: Friction;
  /** Asked only when the client's gateway answers include this. */
  needs?: Household;
}

interface Section {
  name: string;
  questions: Question[];
}

export const SHEET: Section[] = [
  {
    name: 'Household',
    questions: [
      { n: 1, text: 'Full name as per PAN', answer: 'Meera Iyer' },
      { n: 2, text: 'Date of birth', answer: '14/03/1986' },
      { n: 3, text: 'PAN', answer: 'ABCPI••••K' },
      { n: 4, text: 'Marital status', answer: 'Married' },
      { n: 5, text: 'Spouse or partner: name and occupation', answer: 'Rohan, architect', needs: 'partner' },
      { n: 6, text: 'Dependent children: names and ages', answer: 'Two (9 and 5)', needs: 'dependants' },
      { n: 7, text: 'Dependent parents or other relatives', needs: 'dependants' },
      { n: 8, text: 'Residential status (Resident / NRI / OCI)', answer: 'Resident' },
    ],
  },
  {
    name: 'Income',
    questions: [
      { n: 9, text: 'Employer and designation', answer: 'Director', needs: 'salaried' },
      { n: 10, text: 'Gross annual income (₹)', answer: '28,40,000' },
      { n: 11, text: 'Bonus or variable pay, last 3 years', answer: 'Need payslips', friction: 'effort', needs: 'salaried' },
      { n: 12, text: 'ESOPs or RSUs: vested and unvested', answer: 'N/A?', friction: 'relevance', needs: 'esops' },
      { n: 13, text: 'Business or professional income', friction: 'relevance', needs: 'self' },
      { n: 14, text: 'Rental income', friction: 'relevance', needs: 'property' },
      { n: 15, text: 'Spouse’s annual income', answer: 'Ask Rohan', friction: 'trust', needs: 'partner' },
    ],
  },
  {
    name: 'Assets',
    questions: [
      { n: 16, text: 'Home: current market value', answer: 'Not sure', friction: 'effort', needs: 'home' },
      { n: 17, text: 'Other property: location and value', friction: 'relevance', needs: 'property' },
      { n: 18, text: 'Gold and jewellery: approximate value', answer: '?', friction: 'trust' },
      { n: 19, text: 'Savings and current account balances', answer: '6,20,000' },
      { n: 20, text: 'Fixed deposits: amount and maturity' },
      { n: 21, text: 'Capital gains in the last financial year', answer: 'Ask accountant', friction: 'effort' },
      { n: 22, text: 'HUF, family trust or inherited assets', answer: 'What is this?', friction: 'relevance', needs: 'trust' },
    ],
  },
  {
    name: 'Investments',
    questions: [
      { n: 23, text: 'Mutual funds: current value by folio', answer: 'Need statement', friction: 'effort' },
      { n: 24, text: 'SIPs: amount and date', answer: '40,000 on the 5th' },
      { n: 25, text: 'Direct equity: demat holdings', answer: 'Need statement', friction: 'effort' },
      { n: 26, text: 'PPF balance', answer: '8,15,000' },
      { n: 27, text: 'EPF balance', answer: 'Check with HR', friction: 'effort', needs: 'salaried' },
      { n: 28, text: 'NPS: Tier I and II balance', friction: 'effort' },
      { n: 29, text: 'Unlisted shares, AIF or PMS', friction: 'relevance', needs: 'overseas' },
      { n: 30, text: 'Overseas investments', friction: 'relevance', needs: 'overseas' },
    ],
  },
  {
    name: 'Liabilities',
    questions: [
      { n: 31, text: 'Home loan: outstanding, EMI and rate', answer: 'Need bank letter', friction: 'effort', needs: 'homeLoan' },
      { n: 32, text: 'Car or personal loans' },
      { n: 33, text: 'Credit card balance carried forward', friction: 'trust' },
      { n: 34, text: 'Loans to or from family and friends', answer: 'Why is this needed?', friction: 'trust' },
      { n: 35, text: 'Education loans', friction: 'relevance' },
      { n: 36, text: 'Guarantor on anyone else’s loan', friction: 'trust' },
    ],
  },
  {
    name: 'Insurance',
    questions: [
      { n: 37, text: 'Term life: insurer, cover and premium', answer: 'Find policy', friction: 'effort' },
      { n: 38, text: 'Employer group health cover', needs: 'salaried' },
      { n: 39, text: 'Personal health cover', answer: '10,00,000' },
      { n: 40, text: 'Endowment, ULIP or money-back policies', friction: 'effort' },
      { n: 41, text: 'Critical illness or disability cover', friction: 'relevance' },
    ],
  },
  {
    name: 'Planning',
    questions: [
      { n: 42, text: 'Monthly household expenses (₹)', answer: '1,50,000 approx' },
      { n: 43, text: 'Monthly support to extended family', friction: 'trust' },
      { n: 44, text: 'Will in place? Nominees up to date?', friction: 'trust' },
      { n: 45, text: 'Major expenses in the next 5 years' },
      { n: 46, text: 'Retirement age you have in mind', answer: '55?' },
      { n: 47, text: 'Anything else your advisor should know' },
    ],
  },
];

export const DOCUMENTS = [
  'PAN and address proof',
  'Form 16, last 2 years',
  'ITR acknowledgements, last 2 years',
  'Salary slips, last 3 months',
  'Bank statements, last 6 months',
  'Mutual fund statement (CAS)',
  'Demat holding statement',
  'EPF passbook',
  'NPS statement',
  'Home loan statement',
  'Insurance policy copies',
  'Property papers',
];

export const QUESTIONS = SHEET.flatMap((section) => section.questions);

/** Whether this client's gateway answers rule the question out. */
export const isAsked = (question: Question, household: Household[]) => !question.needs || household.includes(question.needs);

export const CLIENTS = {
  meera: { name: 'Meera', household: ['partner', 'dependants', 'home', 'homeLoan', 'salaried'] as Household[] },
  arjun: { name: 'Arjun', household: ['self', 'overseas'] as Household[] },
};
