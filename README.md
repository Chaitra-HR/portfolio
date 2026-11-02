# Chaitra Rao — portfolio

The Home, About and case-study design exports, rebuilt as one React +
TypeScript app (Vite, React Router). The audit of the original exports is in
[docs/AUDIT.md](docs/AUDIT.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ locally
```

Node 20.19 or later (Vite 7); `.nvmrc` pins 22 for local work, CI and hosts.

## Deploy

`dist/` is a static single-page app. Every path that isn't a file must fall
back to `index.html` so `/about` and `/work/gather` load directly:

- **Vercel** — `vercel.json` already rewrites to `index.html`.
- **Netlify** — `public/_redirects` (`/* /index.html 200`) is copied into `dist/`.
- **Anything else** — configure the same fallback (e.g. nginx `try_files $uri /index.html;`).

Build command `npm run build`, output directory `dist`, Node from `.nvmrc`
(Vercel and Netlify detect the Vite preset). GitHub Actions
(`.github/workflows/ci.yml`) runs a clean install and the build on every push
and pull request.

## Structure

```
src/
  app/            router.tsx (routes), RootLayout.tsx (skip link, SVG defs, scroll restoration)
  components/
    layout/       SiteHeader, BentoFooter (+ FooterParts), usePageMeta
    ui/           Pill, SmartLink, StatusDot, Asterisk (arms + glyph), SvgDefs
    interactions/ CustomCursor, GradientBuddy (cursor-following mascot), PokeBuddy, ScrubText,
                  ReadWords, Intro, TravelGuide, glass/ (three.js mascot)
  hooks/          useMelbourneTime, useLookAt, useCopyToClipboard, useMediaQuery,
                  useReadAlong, useScrub, useBandReveal
  lib/            cx (class names), intro, scroll
  data/           site.ts (links + contact), projects.ts (metadata), testimonials.ts
  work/           per-project covers and case-study pages, FilmCover (video tiles),
                  plus the index.ts registry
  pages/
    Home/         sidebar, gist panel (+ GistBuddy), tiles, testimonials
    About/        page + Photo
    CaseStudy/    route.tsx (loader + page shell) and kit/ (case-study building blocks)
    NotFound/
  styles/         tokens.css, global.css, animations.css
public/fonts/     Mabry Pro Regular + Medium (Latin subset, WOFF2)
```

**Styling.** Design tokens are CSS variables in `styles/tokens.css`. Each page
and component has a CSS Module. The exports' CSS was carried over with its
selectors intact, so the cascade (and the rendering) matches. Kebab-case
classes in CSS are used as camelCase in TSX (`.side-head` → `s.sideHead`). Global
classes are kept to the few utilities repeated verbatim across the exports:
`.card`, `.lbl`, `.mut` and the `.rv` reveal.

**Shared vs page-specific.** The header, bento footer, mascot, pills, status
dot, asterisk and all the behaviour hooks are shared. The Home sidebar, gist
panel, tiles and testimonials, the About photo layouts, and
each case study's story stay with their page. Home's layout differs on purpose
and does not use the shared header, but it does use the shared footer.

**Interactions.** All are CSS transitions or keyframes plus a little React
state. No animation library is needed. The mascots' eyes are moved through
refs once per frame, so moving the mouse doesn't re-render the page. Every
listener, timer and observer is cleaned up. Reduced motion disables the
reveal, spins, floats, blinks and the chrome sheen.

## Responsive system

Three layouts, modelled on lorenzocabra.xyz (breakpoints noted in `styles/tokens.css`):

- **Desktop, 1200px and up:** the designs as exported. Home has its sticky
  card rail beside the 2-column work grid.
- **Tablet, 810–1199px:** nothing is sticky. Home's rail cards become tiles in
  one 2-column grid: nav across the top, then the intro beside the gist panel,
  then a full-width clock bar. The work grid stays at 2 columns and the
  tiles show their "Proves:" line. The footer keeps 2 columns.
- **Phone, under 810px:** one column with 12px gutters on Home and 20px on
  the text pages. Home tiles are square, there's no hover gist panel
  (see "Phone guide" below),
  the header shows brand + "Let’s talk" on one row and links on a second,
  footers stack, and vertical spacing tightens.

Display headings scale fluidly with `clamp()` and hit their exported sizes at
1440px. A sweep at 320–1440px shows no horizontal overflow on any page.

## Adding a case study

1. **Metadata.** Add or edit the project in `src/data/projects.ts`: slug,
   number, title, status, colour, the one-line "proves", and the three-part
   gist Home shows on hover. Order in `caseStudies` sets the previous/next
   order.
2. **Art.** Create `src/work/<slug>/Cover.tsx` and register it in `workArt`
   in `src/work/index.ts`. Size everything in `cqw` (see
   `src/work/covers.module.css`): the same cover then fills a Home tile and
   shrinks into the case study's More case studies tiles. To place it on Home, add
   `[slug, aspect]` to `COLUMNS` in `pages/Home/HomePage.tsx` (each column
   pairs a `24/25` card with a `6/5` one so the columns end level).
3. **Page.** Create `src/work/<slug>/<Name>CaseStudy.tsx` with a default
   export (it's passed `{ project }` if it wants it), and add it to `caseStudyPages` in
   `src/work/index.ts`. It gets its own code-split chunk. Until it's
   registered, `/work/<slug>` shows a "not published yet" page.

A case study composes what it needs from `pages/CaseStudy/kit`: `CaseHero`
(hero image, then the overview and facts, with `TeamStack` for the team),
`CaseBody` (takes the title and the contents, with the back link, title and
contents in a sticky left column from 1024px, centred with the study as one block, and a
contents bar below that width; the hero and sections are its children),
`CaseSection`, `CaseSub`, `Text`, `Evidence`, and the editorial blocks in
`Editorial.tsx` (`Lead`, `Bullets`, `KeyInsight`, `Findings`, `Reasoning`,
`Alternatives`, `OutcomeCards`, `Notice`, `AnnotatedImage`,
`More`). Nothing forces a template. Any element
inside `CaseBody` with `id="cs-<id>"` can be a contents entry, so a bespoke
section, video or interactive demo can sit between kit sections. Put project-only styles in a module next to the study, as
`work/gather/Gather.module.css` does.

## Content still to replace

Everything in [brackets] is the exports' own placeholder text, kept verbatim:

- `src/data/site.ts`: email, LinkedIn and website-carbon URLs. The
  Résumé button points to `/resume.pdf`; add the file to `public/`.
- `src/data/testimonials.ts`: quote, name, role and an optional square `photo` URL per card.
- Gather case study: the "3 weeks → under 4 days" figure stays marked "to
  confirm" until it's verified (`REPORTED` in `GatherCaseStudy.tsx`, and the
  panel at the bottom of `visuals/Results.tsx`).
- Side projects have no links yet. Add `href` in `projects.ts`.
- Only Gather has a case-study page. FinScribe, Compliance Trust System and
  Website Revamp link to "not published yet".
- There is no social preview image. Add `og:image` to `index.html` once one exists.

## Decisions and differences from the exports

Checked by diffing every text element's position, size and computed type
style against the originals at 1440, 1100, 768 and 390px. Home and About match
to the pixel; the measured differences are:

- **Document scrolling.** Each export was its own 100vh scroll container.
  Pages now scroll the document. The Home sidebar's sticky offset moved from
  `top:0` to `top:12px` to sit in the same place.
- **One pill style.** About's footer pills were 46px with a hairline border;
  Home and Case use 44px pills that lift. The shared footer uses the latter
  everywhere.
- **Case-study body height.** The stale `height: 2547px` is gone (see
  AUDIT #2). The previous/next cards now sit 104px below Reflection instead of
  5px, and on phones the sections no longer run into the footer.
- **Work tiles** were redrawn from your mock-up: shorter proportions (24:25
  and 6:5 instead of 4:5 and 7:6), FinScribe and Website on the left, Gather
  and Compliance on the right, and new typographic covers (blurred asterisk;
  before/after pills; "Who is this site for?"; flagged card with why + fix).
  Titles stay below the cards. FinScribe's field is now light grey.
- **Kind words** is now a swipeable deck of quote cards; the export's large
  photos with blurred side panels are gone. Portraits are small 44px avatars.
  Motion runs on a small spring engine (`pages/Home/deckMotion.ts`, no
  dependency): drag 1:1, flick momentum carried into the throw, the next card
  rising as you pull, the thrown card tucking in behind; also trackpad
  two-finger swipes, arrow buttons and arrow keys. Reduced motion snaps.
- **Asterisk mascot** (`GradientBuddy`) is a 3D asterisk in iridescent liquid
  glass, rendered with three.js (`glass/glassAsterisk.ts`). Its shape is
  exactly the 2D mark's (six straight rounded arms, as in the Home sidebar),
  built once as one seamless surface from a distance field, so the outline
  stays crisp. A physical glass material (transmission, thin-film
  iridescence, clear coat, dispersion) lit by white strips and lavender, pink
  and blue panels; a hidden backdrop that only the refraction sees keeps the
  centre clear while the rims go deep violet. It leans toward the
  pointer and pauses off-screen. It's alive like liquid (like adamperlis.com's
  buddy): ripples drift over the surface and the arms sway in depth (vertex
  shader, so the outline keeps its shape), and every 3.5–7.5 s it does
  something small on springs: a jiggle, a hop with squash and stretch, or a
  wiggle. A poke stretches it as it spins and it lands with a wobble. Reduced
  motion turns all of this off. Its face is kept light: real
  eyeballs (white, with a violet iris and pupil that roam inside them toward
  the cursor, and glance around on their own when the cursor rests:
  `useLookAt` `wander`), a fine soft-ink mouth (`INK`, not black) and thin
  wire specs. The same mascot appears in three places: the footers
  (`PokeBuddy`), the Home gist panel (`GistBuddy`: it shrinks into the corner
  and grins while a project is hovered; the panel returns to "Let me save you
  a few clicks" 150 ms after the cursor or focus leaves a project) and the case-study hero. On Home it
  sits near the top, so three.js loads soon after first paint there.
  **Why three (the one heavy dependency):** a convincing 3D finish needs a
  real renderer; SVG filters couldn't get there. It's lazy-loaded only when a
  mascot nears the viewport (~136 kB gzip, its own chunk), never on first
  paint. Until then, or without WebGL, a flat SVG glass stand-in shows; with
  reduced motion it holds still. The 2D face sits on top and turns with the
  body. In the footer, each poke spins it a full turn into a new outfit, face
  and line (`PokeBuddy` → `STEPS`): reading glasses ("open to new
  roles"), shades + headphones ("that song again"), a blush ("the purple
  one’s her résumé"), then back to bare ("AI helps her build…"); each has its
  own mouth. Edit the lines in `STEPS`.
- **Phone guide** (Home, phones only; like adamperlis.com on mobile): hover
  means nothing on touch, so each case study shows its gist in a speech
  bubble under its card, and one mascot (`PhoneGuide`) is a companion that
  stays on screen: it moves quickly (a critically damped spring, no
  overshoot) to the case study in view and perches on its seat
  (`[data-seat]`); once there it is locked to the card, drawn in page
  coordinates so the browser scrolls it natively, and the bubble reads itself
  out (`perch.ts` → `usePerched` → `useReadAlong`, kept outside React state so
  only the cards involved re-render). When its card scrolls away it waits at
  the edge it is leaving from, then makes one hop to the next card once that
  is properly in view (centre within 20–72% of the screen), leaning into its
  direction of travel and squashing as it lands. Side projects get no visit (it floats off the side). When
  the footer arrives it glides in, growing to full size, and hands over to the
  footer's pokeable mascot (`[data-buddy="footer"]`); scrolling back up takes
  it back. To keep it smooth on phones: every mascot boots its 3D in idle time
  after load (never mid-scroll), the 3D shape is built once and shared, touch
  devices render lighter (pixel ratio 1.5, no dispersion), and a hidden
  mascot stops rendering. Desktop and tablet are unchanged.
- **Gist read-along** (Home, like adamperlis.com's intro): when a project's gist
  appears, its words start faint and light up one by one in reading order
  while a small glass bead hops onto each word (`useReadAlong` +
  `<ReadWords>`), starting about 0.12 s after the gist appears (on phones, as
  the mascot lands). Longer words hold a touch longer; commas and full stops
  pause. After the last word the bead rests a beat, then hops off and fades. Each hover reads from the start. Reduced motion shows the text at
  once, with no bead.
- **About photo row edges (desktop)**: the bleeding edge photos (curry leaf,
  books) always show at least 140px (`--edge` in About.module.css); on
  narrower desktops the two middle columns give way, keeping their 500:580
  proportion. The cursor's hover label is clamped 12px inside the screen
  edges, so captions on edge photos aren't cut off.
- **Performance, accessibility and SEO pass (Oct 2026)** — measured on the
  production build in headless Chrome:
  - About photos ship as AVIF (quality 60, via macOS `sips`) with the JPEGs
    as the fallback (`<picture>` in `Photo.tsx`; if a browser can't decode an
    AVIF, the photo swaps to its JPEG instead of staying blank). "That’s me"
    (working.jpg) stays JPEG: sips writes it with a less compatible AVIF
    layout that Safari rejected. About page 1,334 → about 1,005 KB.
  - The 3D mascot draws at 30 fps while calm (only the slow ripple moving) and
    at 60 the moment anything moves; with reduced motion it draws once and
    rests. A visible mascot's GPU draw calls 180 → 108 per second (−40%).
  - The phone and desktop guides sleep unless the page scrolls or resizes, or
    they are moving (they used to check every frame): Home's idle main-thread
    work on phones 590 → 130 ms per 10 s (−78%).
  - Greys darkened just enough for WCAG 2.2 AA contrast (`tokens.css`):
    grey-1 #8A8A8A → #707070, grey-2 #9A9A9A → #737373 (small text, 4.5:1),
    grey-3 #A3A3A3 → #8A8A8A (large greyed headline text, 3:1).
  - Home's case-study grid has a heading for screen readers; index.html
    carries Person structured data (JSON-LD); the unused
    `usePrefersReducedMotion` hook was removed.
- **Loading intro** (`Intro`, on every full page load; not on in-app
  navigation; skipped with reduced motion): the site's own 3D glass mascot
  loads first (its 3D starts downloading at app start, `lib/intro.ts`); once
  it is ready (at most 1.5 s), so nothing sets up mid-animation, it pops onto
  a clean screen and says "I’m the little asterisk. Just getting things ready
  for you.", lighting up word by word. Then: Home at desktop size — the screen
  fades and the mascot flies into the sidebar, handing over to the sidebar's
  mascot (one mascot); other desktop pages — an asterisk-shaped window (CSS
  mask hole) grows past the screen edges; phones and tablets — a light fade
  and shrink (compositor-only, so it stays smooth). It waits for fonts and the
  route (not every image), at most 5.5 s; a click, tap or key skips to the
  exit. A reload always lands at the top of the page (the browser's and the
  router's scroll restore would otherwise leave it part-way down under the
  intro), unless the URL points at a section (`#…`). Page entrances wait for the exit (`introDone`; `.rv` is a CSS
  animation held by `html.intro-active`, so it starts on the first paint
  and runs even while the page's script is busy). On phones, Home's hero
  cards rise in one after another (as the desktop sidebar does) and the work
  below follows them (`phone-in` in Home.module.css), so the top never arrives
  after the cards beneath it; other pages have no entrance on phones. After
  the intro, About and the case-study pages are fetched in idle time
  (`router.tsx`), so moving between pages is instant. Other mascots boot
  after it (`othersMayBoot`: on desktop once the intro's mascot is ready, so
  Home's sidebar can take over; on phones after the intro has gone), each in
  its own idle moment; on touch devices no sooner than 1.2 s after it mounts,
  so the page's entrance plays first.
- **Desktop mascot handover** (Home, 1200px+, `TravelGuide`): one mascot on
  screen at a time. It lives in the sidebar's gist panel (`[data-buddy="gist"]`)
  until the footer comes into view, then jumps down into the footer, growing
  to full size, and hands over to the footer's pokeable mascot; scrolling back
  up sends it home. Hidden copies stop rendering.
- **Home details**: case-study status pills (Shipped, Pre-beta) use the
  side-project chip style; testimonial cards open with a quote mark in the
  asterisk gradient, and the arrows are Pills (black flood, magnetic, press).
- **Copy email**: while "Email copied" shows, the envelope icon's flap
  flips open (hinged on its top edge, with a little spring) and closes again
  after.
- **Text selection** everywhere is a soft lavender wash with violet text
  (`--select-bg`, `--select-ink` in tokens.css). iOS (every iPhone browser) doesn't
  support styling selection, so iPhones keep the system blue; the caret colour
  is set to the same violet as the only hint iOS might use.
- **About headings** follow one scale: page title (About) 44px → 32px on
  phones; both section titles (Off the Clock, How I work) one step down at
  30px → 24px; card titles 20px → 18px; sub-lines 16px → 15px. On phones the
  footer's "Your turn." follows on the same line.
- **About on phones**: no hovering, so the intro hint drops "Hover around."
  and the photos show without caption pills or the dark caption gradient.
- **About nav (every width)**: Home's nav card (Work and About as pills,
  LinkedIn as the magnetic pill CTA), 520px wide on desktop and tablet (Home's
  is 420), full width inside the 20px gutters on phones, centred over the
  column; no name or "Let's talk" there (`SiteHeader card`). Case studies and
  the 404 keep the regular header.
- **Buttons (pills)** follow together.agency's: on hover a black fill floods
  out from the point the pointer enters and drains back on leave (label turns
  white); pressing shrinks to 95% and springs back. They're magnetic too —
  leaning toward the cursor (label a little further) and springing back on
  leave (mouse only). No lift or shadow. Home's menu LinkedIn is a pill as well
  (its "in" badge inverts on hover). Home's
  intro card now offers Copy email + Résumé (the same `CopyEmailButton` as
  the footer).
- **Custom cursor** (`components/interactions/CustomCursor.tsx`), modelled on
  protasevich.com: a 16px rounded arrow that leans up to 60° toward the screen
  centre, presses to 80% on click, morphs into a dot over anything interactive
  (a circle path with the arrow's exact structure, blended point by point —
  no GSAP), and carries a pill label for any element with
  `data-cursor-tooltip="…"` (About photo captions; "View" on Home's case-study
  cards and side projects). Solid colours — a black arrow/dot and a black
  pill with white text — keep it crisp over photos (no colour inversion). Mouse or
  trackpad on screens over 800px only; touch and keyboard keep the corner
  captions.
- **About page** layout on tablet/phone follows pixel-one.com/about (the
  edge-bleeding photo row becomes a two-column mosaic keeping all four
  photos; the three short paragraphs follow). Its motion follows
  together.agency/about (`hooks/useScrub.ts`):
  - opening: every line of the intro rises 20px and fades in, one after
    another (`data-scrub="intro"` + `ScrubText`), then photos and notes;
  - on scroll: text rises line by line, headings rise (`lines` / `rise`),
    tied to the scroll and smoothed, so it rewinds on the way back;
  - photos open from an inset, rounded window while the image settles from
    a slight zoom (`grow`); hover zoom and cursor captions are unchanged.
- **Footer band:** the shared footer rises in with a curved top edge that
  flattens as you scroll (`hooks/useBandReveal.ts`, an elliptical clip-path;
  same colours and layout), on every page.
- **How I work cards** follow the "Good to know." cards on together.agency/about
  (archived 2024-11-08): a 650px column, 650×270 cards (320 tall on phones),
  8px radius, #FAFAFA, 32px apart, sticky at 20vh (48px on phones). Motion in
  `pages/About/stackMotion.ts`: each card rises 100px into a slot that
  cascades 100/n px lower, steps back 3.25% / dims 1.3% per card when the
  next one lands, and settles at 5% / 3% per step as the stack leaves —
  checked against values sampled from their page.
- **Tablet and phone layouts** were reworked (see Responsive system). Desktop
  still matches the exports.
- **Footer (every page)** is the shared bento footer, simplified at your
  request: no "Before you go" label, status chip or LinkedIn pill; a smaller
  headline (38px desktop → 28px phone) vertically centred in its card; Copy
  email and Résumé; the pokeable mascot, centred (no clock); © bar with an
  underlined footprint link (darkens on hover, dims on press; no "by
  Chaitra"). The mascot has no tap highlight on phones. Home passes its own
  copy, "You’ve made it this far. Might as well say hello."
- **Home navigation.** The "Contact" link was removed at your request; the
  "Let’s talk" buttons still scroll to the footer contact block. "About" opens
  `/about` instead of scrolling to the footer blurb. "Capital Design Studio" links to `/about`, FinScribe to its
  case study, and Work (Home's nav and every page header) goes to the top of
  Home (`/`), so phones start at the hero rather than mid-page.
- **Not migrated (dead code in the exports):** a values accordion, a How I
  work stepper, an older card grid, a fluid footer with an ink-follow name,
  TL;DR cards, breadcrumbs, a typing caret, a talking mouth, a blurred spinning
  asterisk, and About's accidental footer-bar fade (a keyframe name clash).
- **Mabry Pro** files are bundled from your local install (Regular, Medium;
  there is no Bold, so 700 is synthesised exactly as in the exports). Check
  that your licence covers web embedding.
- Home text is not antialiased while About and Case are, as in the exports.
  Add `-webkit-font-smoothing: antialiased` to `.pg` in `Home.module.css` to
  unify.
