# Audit of the three HTML exports

Source files: `HOME PAGE-html.zip` (`HomeGistA.dc.html`), `ABOUT PAGE-html.zip`
(`AboutStack.dc.html`), `CASESTUDY-html.zip` (`CaseFinal.dc.html`).

All three are exports from a visual design tool: an `<x-dc>` template with
inline styles, a `<helmet><style>` block, and a small logic class rendered by
a bundled runtime (`support.js` + vendored React, identical in all three
zips). The runtime is not part of the design and is not migrated.

## What each page is

| Page | Layout | Interactions |
| --- | --- | --- |
| Home | 12px-padded page. 420px sticky sidebar of grey cards (pill nav, name + pitch + CTAs, Melbourne clock + "Open to roles", "The gist" panel) beside a 2-column work grid; side projects; testimonial carousel; full-width grey footer. | Chrome asterisk mascot whose eyes follow the cursor and which hops into the corner when a project is hovered; gist panel swaps per hovered/focused project with staggered rows; tile mock lifts on hover; testimonial carousel with fade; spinning dot asterisk in the footer whose arms lift on hover; live clock (15s); staggered reveal on load; mobile "More / Less" toggle for the gist panel. |
| About | Centred 1020px column with a top nav (brand / links / "Let's talk"). Intro, a photo row that bleeds off both edges, "Off the Clock" photo trio, "How I work" sticky stacking cards, bento footer. | Photo hover/focus zoom + caption pill (always on for touch); CSS sticky stacking cards; footer mascot (eyes follow cursor, poke cycles speech lines); copy-email button with confirmation; live clock with seconds (1s); staggered reveal. |
| Case study | 12px-padded page with the same top nav as About (wider: 1180px), hero with a small mascot + meta list, full-width media panel, sticky table of contents beside the article, previous/next cards, same bento footer as About. | Scroll-spy TOC with an asterisk that grows in beside the active item; hero + footer mascots track the cursor; poke; copy email; live clock; staggered reveal. |

## Shared patterns (become shared components)

- **Site header** (About + Case): brand left, Work/About/LinkedIn centred,
  "Let's talk · open to roles" pill right. Home has its own sidebar nav, which
  is a deliberately different layout and stays page-specific.
- **Bento footer** (About + Case): "Before you go" card (headline, copy,
  Copy email / Résumé / LinkedIn pills, status chip) + clock/mascot card +
  © bar. Only the headline and copy differ, so they become props.
- **Gradient asterisk mascot** (About footer, Case hero, Case footer): the
  masked gradient asterisk with eyes that follow the cursor; optionally
  pokeable with a speech bubble.
- **Asterisk glyph** (About hint, Reframe logo, TOC marker) and the pink →
  violet → blue gradient, re-declared five times under different ids.
- **Pill buttons** (`.pill` with white / lilac fills), status dot, chips,
  uppercase label (`.lbl`), grey card (`.card`).
- **Behaviours:** Melbourne clock (two formats), cursor-following eyes,
  staggered reveal on load, copy-to-clipboard with a timed confirmation.

## Page-specific (kept page-specific)

- Home: sidebar, gist panel, chrome mascot (heavy SVG filters), work tiles
  with their bespoke mock-ups, side project cards, testimonial carousel,
  home footer with the dot asterisk.
- About: bleeding photo row, Off the Clock trio, stacking cards.
- Case study: the hero, media panel, before/after, decisions, stats are
  reusable *building blocks*; the Gather mock-ups and the story order are
  specific to Gather and live with it.

## Design tokens consolidated

Mabry Pro 400/500 (700 is referenced but no Bold file exists — browsers
synthesise it, as they do in the exports). Ink `#000`, `#1F1F1F` (About body),
`#333` (case body), muted `#6B6B6B`, greys `#8A8A8A` `#9A9A9A` `#A3A3A3`,
card `#F5F5F5`, hover `#ECECEC`/`#EEEEEE`, rules `#EDEDED`/`#E5E5E5`, lilac
`#D69FF9`, green `#16A34A`, project fields `#1D3FE0` `#B9DB4C` `#000`,
highlight `#EA4B23`, "to confirm" chip `#FFF4D6`/`#7A5300`, the asterisk
gradient `#F35BC2 → #9A6CF2 → #4F7BF7`. Radii 16px cards, 999px pills.
Focus ring 2px black, 3px offset.

## Inconsistencies and technical issues found

1. **Each page is its own scroll container** (`.pg{height:100vh;overflow-y:auto}`)
   — an artboard artefact. It breaks native scroll restoration, anchor
   behaviour and mobile browser chrome. Migrated to document scroll; sticky
   offsets adjusted so everything sits where it did (e.g. the Home sidebar
   uses `top:12px` instead of `top:0` inside a padded scroller).
2. **Fixed height on the case-study body** (`style="height: 2547px"`) — stale:
   at 1440px the content already overflows it, so the previous/next cards sit
   5px under the Reflection paragraph; on phones Outcome and Reflection run
   over the cards and the footer. Removed; the section's own 80px margin now
   applies.
3. **Pill buttons differ between About and Case study** in the *same* shared
   footer: About pills are 46px with a hairline border that turns black on
   hover; Case pills are 44px, borderless, and lift with a shadow. The site
   now has one pill (the Home/Case version, used on two of the three pages),
   so About's footer pills are 2px shorter and lose the hairline.
4. **Nav differs between About and Case**: 96px tall on a 1020px column vs
   84px on 1180px, and links collapse at 760px vs 1000px. Kept as two header
   widths so each still aligns with its page column.
5. **Font smoothing**: About and Case use `-webkit-font-smoothing:antialiased`;
   Home does not, so Home text renders slightly heavier on macOS. Preserved
   per page; flagged for you to decide.
6. **Dead code**: unused styles and logic for a values accordion, a "How I
   work" stepper, an older card grid, a "fluid footer" with ink-follow name,
   TL;DR cards, prev/next cards, breadcrumbs, a typing caret, a talking
   mouth, a poke "pk" class nobody reads, and a blurred spinning asterisk on
   Home. None of it is rendered; none is migrated.
7. **Duplicate SVG ids** (`fb-g`, `fb-m`, five copies of the gradient) —
   would collide once components render more than once. Generated per
   instance with `useId`, gradient defined once.
8. **Every mousemove re-rendered the whole page** to move the mascot eyes.
   Rewritten to update only the eyes' transform via refs + rAF.
9. **Font files are not in the exports** (`/_blob/REPLACE_MABRY_PRO_*`); the
   pages only look right on a machine with Mabry installed. The local
   Regular/Medium files are now bundled — check your Mabry licence covers web
   use.
10. **Placeholder links and content**: LinkedIn `[your-handle]`, email
    `[hello@yourdomain.com]`, Résumé `#resume`, website-carbon
    `[yourdomain]`, testimonial quotes, Gather case-study `[...]` notes and
    "to confirm" chips. Kept verbatim (they are the real current content)
    and centralised so each is changed in one place.
11. **Small mobile gaps**: the testimonial side photos paint over the centre
    photo below ~700px, and the case-study hero mock is clipped in its 16:7
    panel on phones. Fixed with minimal rules in the same visual language.

## Interactions to migrate

All listed in the table above. None need an animation library — every one is
CSS transitions/keyframes plus a little state — so Framer Motion is not
added.
