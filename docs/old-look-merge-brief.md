# bhwebs.com: NEW STRUCTURE + OLD LOOK (merge brief, Oct 29 2026)

## What the owner said (his words, typos kept)
"i asked peoaple they told me that my real desighn my genaerl desighn is nicer the only thing i like about the new desighn
is the clerity and structure of should prices etc ... put the old stuff from my old doctorine into the new website"

So: START FROM THE NEW WEBSITE (branch `doctrine-b`, its pages, sections, words and clarity) and give it back HIS OLD LOOK:
the live site (git commit `4735dc1`, read with `git -C ~/Developer/bhwebsolutions show 4735dc1:index.html`) and his
original house doctrine ("the look", below). Success = the people who preferred the old design look at the result and say
"that's his design", while a stranger still understands in 5 seconds what he does, where, what it costs, and what to press.

Repo: `/Users/abrahamneumann/Developer/bhwebsolutions` (branch doctrine-b). Local server (serves files live, clean URLs):
http://127.0.0.1:8840. Headless Chrome with remote debugging: 127.0.0.1:9333; tiny driver
`OUT=<prefix> node <scratch>/cdp/cdp.mjs <url> <script.js>` (script = async function body getting `ev, sleep, send`; see
`<scratch>/cdp/shot.js`, `reel.js`, `sweep.mjs`). Scratch dir: `/private/tmp/claude-501/-Users-abrahamneumann-Desktop/1cdc7201-5b51-4451-babb-7323c3996498/scratchpad`.
Screenshots of the LIVE old design to match: `<scratch>/bh/live/live-d1..d7.jpg` (desktop 1440) and `live-m1/m2.jpg` (phone).

## KEEP from the new site (clarity + structure) — do not remove
- Every page's section order, every word, every link; meta tags + JSON-LD unchanged. Base location = Brooklyn, NY.
- Homepage hero clarity: eyebrow (category + place), the H1 "Websites that make your business look *established.*",
  the lede, ONE primary button "Start my website" (/order) + one secondary link, the proof list INCLUDING the price slot
  (`<!-- PRICE SLOT -->` "Fair price in writing before we start"; the owner will put "Websites from $X" there — make the
  price item visually prominent, e.g. a highlighted pill). He specifically likes that prices are shown.
- Phone number "(845) 576-6607" visible in the desktop header; the phone-only sticky bottom bar (Call / WhatsApp / Start my
  website). ≤ 5 nav links, always visible (no burger-only nav on phones; a scrollable row of small pills is fine).
- Services dial (radio inputs #v1–#v6 + panels, works with no JS), the work grid (12 tiles) + the index list 13–27, the
  "After launch" band, reviews (XHR from reviews.bhwebs.com — keep script), "What's included", FAQ (all answers open), the
  contact band + #inquiry form (fields, ids, action, hidden fields, honeypot, ES5 script: UNCHANGED), footer content.
- Technical contract: content visible with JS off; any hidden/animated starting state only inside
  `@media (prefers-reduced-motion:no-preference)` (and `@supports` for scroll timelines); ES5 JS only; Safari 10 fallbacks
  (-webkit- prefixes, no unguarded flex `gap`, aspect-ratio/inset/clamp only with a fallback declared first). Shared CSS in
  `/css/site.css`; page-only CSS stays small in each page's `<style>`.

## BRING BACK the old look (copy real values/snippets from 4735dc1:index.html's `<style>`; do not approximate)
1. Tokens: `--paper:#faf7f0; --paper2:#f2ecdf; --ink:#11161f; --muted:#5c6672; --line:#e6dfd0; --line2:#d9d0bd;
   --cobalt:#2b4eff; --violet:#7c3aed; --coral:#ff5c39; --green:#6cb33f; --greend:#4e8f2c; --sun:#ffc53d; --mint:#9fd47a;
   --grad:linear-gradient(100deg,#2b4eff,#7c3aed 38%,#ff5c39 72%,#ffc53d); --r:18px; --r-lg:26px;` + the live shadows.
   Fonts: Fraunces (opsz, 400–600, italics) for display + Hanken Grotesk for text (exact Google Fonts URL from live).
   DROP Instrument Serif and IBM Plex Mono. Labels = live style: small uppercase letter-spaced Hanken with a coloured dot.
   Keep the old token NAMES the inner pages use (--ink2, --line2, --cobalt, --cobalt-l, --pline, --serif, --sans, --mono…)
   defined so nothing breaks (e.g. `--mono` may now point at Hanken; `--cobalt-l` = a light tint usable on dark).
2. Logo: the live multi-colour gradient BH mark (header) — copy its SVG from live; white version on dark if live had one.
3. Header: the live floating frosted PILL nav (rounded, white/frosted with solid fallback, shadow) with the green pill CTA;
   add the phone number in it on desktop. Phones: compact pill (logo + CTA) + the visible link row.
4. Hero: the live full-bleed MOVING hero — client-site screenshots cross-fading with the Ken Burns zoom (pure CSS, first
   slide visible in plain CSS, frozen on slide one under reduced motion; see the live `hslides` markup/CSS and @keyframes
   hslide) — with the FROSTED GLASS PANEL on the left on desktop holding the new clarity content (eyebrow pill with a dot,
   H1 with "established." in the live gradient text + the live green hand-drawn swoosh, lede, green pill button + ghost
   pill secondary, check-list proof incl. the price pill). Phones: the live mobile pattern — the moving site visible at
   the top, compact panel below. Use the fresh `images/shots/*.jpg` (1000w; `-m.jpg` 640w twins) for the slides (4–5 of
   the best). REMOVE the `.reel` ticker row and the rubber `.stamp` (its message survives as the check item "Pay the
   balance after you see the design" / "You see the design before you pay the balance").
5. Buttons: live green pill primary with soft green shadow; ghost pill secondary; keep 44px+ tap targets.
6. Section heads: live style — centred coloured-dot uppercase label + big centred Fraunces heading, one word coloured or
   gradient; any section link ("All work by topic →") sits under it.
7. Cards: white rounded cards (--r-lg) with the live soft shadow and the live gradient top bar (as on the live review
   cards) for: service panels, included items, steps, FAQ items, review cards. Keep small coloured numerals (01, 02…)
   inside cards — that is the structure he likes.
8. Work tiles: live rounded photo tiles, FULL colour (remove the duotone), name overlaid on a dark bottom gradient +
   small pill tags, gentle hover zoom; grid layout stays (no auto-drifting rows). Index list 13–27 = tidy rounded rows/pills.
9. Bands (old doctrine): coloured bands are TWO-TONE gradients with wave-shaped SVG edges and a faint radial shine — never
   one flat colour. Apply to the dark "After launch" band and the contact/"Start" band (use live's wave markup/CSS if it
   has one). Dark bands need their own solid background.
10. Background: never flat — the live paper ground + its grain/texture (whatever live does), under a light veil.
11. Motion: the live reveal (rise + fade, staggered) instead of the "press" wipe; CSS-first (`animation-timeline:view()`
    inside `@supports` + reduced-motion guard). Hover lifts on cards. Remove the press motif everywhere in site.css.
12. Floating round WhatsApp button bottom-left on desktop (live) — hidden on phones where the sticky bar has WhatsApp.
13. Footer: the live footer look, with the new footer's content (columns, areas list, credit).

## Don't
- Don't change words, links, form fields/scripts, meta/JSON-LD, pay.html, email-signature.html, portal/.
- Don't invent prices or claims. Don't add a carousel other than the hero cross-fade.
- Never submit a real form (stub the network). Don't commit, push or deploy — the lead does that.

## ★ UPDATE from the owner (Oct 30, overrides anything above about colours)
His words: "the way its structured is not so bad the only thing thats ugly is the colors the broun it should be more
exeting colors like the simble". So:
- NO brown / beige / tan / parchment / grain-on-beige anywhere. The ground is a CLEAN, bright, near-white (e.g. #ffffff
  with very light cool tints like #f6f7fb / #eef1ff for alternate sections). No warm-brown greys for text either: ink
  #11161f, muted #5c6672 (cool).
- The COLOURS = his BH logo symbol: the multi-colour gradient (cobalt #2b4eff → violet #7c3aed → coral #ff5c39 → sun
  #ffc53d) + the green swoosh #6cb33f. Use them boldly and happily: gradient words in headings, the gradient top bars on
  cards, coloured dots on labels (rotate cobalt / violet / coral / green / sun), green pill buttons, and the coloured
  bands as rich two-tone gradients from the logo (e.g. cobalt→violet for the dark/After-launch band, violet→coral or
  cobalt→violet for the Start/contact band) with the wave edges and a soft radial shine. Dark bands = deep indigo/navy
  (#0f1640 → #2b4eff family), never brown-black.
- Keep it tasteful: white cards, lots of air, colour as accents and bands — exciting, not a rainbow on every element.
- Section ground tints, if used, stay cool/light (never cream). Re-check every contrast pair after the colour change.
