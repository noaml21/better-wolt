# Better Wolt V5 — Visual Research

**Branch:** `v5/visual-reinvention`, from V4 HEAD `b500a21`. **Purpose:** find principles for a frontend that reads as a
different product from V4, outside the food-delivery genre. Nothing here is copied; layouts, assets and identities of
the studied sites stay theirs. Product truth: [PRODUCT.md](../../PRODUCT.md). Concepts built from this research:
[V5_CONCEPTS.md](V5_CONCEPTS.md).

## 1. Method

- **Taste** (the reverse-engineering skill): each site captured at 1440×900 (viewport + full page, or mid + footer when
  taller than six viewports) and at 390×844, plus the skill's DOM extractor (`extract.js`: colours by area, type,
  radii, shadows, spacing, section gaps, focus-visible and reduced-motion support). Capture was scripted on the
  Playwright library with Chrome rather than driven call by call through the Playwright MCP, so that twelve pages of
  DOM data landed on disk instead of in the conversation; the extractor, viewport and screenshots are the skill's own.
  The per-site `{domain}.md/.json` outputs stayed in the session scratchpad (as in V4, extracted tokens are not
  committed); the principles below are the durable result.
- Sites were chosen across categories the brief named — film streaming, hardware/consumer product, retail, hospitality,
  culture editorial, a visual-search product, independent publishing, music editorial, a creative tool — and
  deliberately not delivery apps.
- Three captures were unusable and are excluded: noma.dk (bot wall), nts.live (geo-blocked from Israel) and
  bezalel.ac.il (the Hebrew page returned its 404). Hebrew/RTL evidence therefore comes from V2–V4 and from the
  prototypes, not from a reference site.

## 2. What each site decides, and why it matters here

Each entry is Taste's *Trigger → Decision → Reason → Evidence*, cut to the part V5 can use.

**mubi.com (film streaming).** *Trigger:* a catalogue of thousands of titles has to feel curated. *Decision:* one film
still fills the first viewport edge to edge; a single 60 px/500 grotesk line in caps sits on it, and the only colour
besides the still is one deep blue (`#001489`, 0.7 % of the surface) on the one action. *Reason:* the still is the
argument; chrome that competes would make it a thumbnail. *Evidence:* body 18/24, radius 2 px everywhere, page
white/`#EAEAEA` bands. → **Photography as the frame, not an item in a card.**

**teenage.engineering (hardware).** *Trigger:* a product line with a strong, playful identity. *Decision:* the nav is
four illustrated columns with their own sub-links; display type is a proprietary condensed face at huge size; body is
one thin family (weights 100/300 only), no radii, no shadows; colour is `#F6F8F7` ground, black, and one orange.
*Reason:* the brand lives in type and drawing, so every UI atom is stripped. *Evidence:* `te-20` on 588 nodes, radii
`[]`, shadows `[]`, transitions only `transform .2s`. → **An identity can live entirely in typography and a single
signal colour; boxes are optional.**

**aesop.com (retail).** *Trigger:* products that look alike on a shelf. *Decision:* full-bleed dark video band, then
an ivory `#FFFEF2` ground with 250–550 px section gaps; buttons are 1 px outlined rectangles with an arrow; the serif
(Zapf Humanist) appears only in headings. *Reason:* space and slowness signal care; the page asks for attention, not
clicks. *Evidence:* section gaps 250/554/278 px, body 32/51 in the editorial blocks. → **Whitespace used as pacing;
quiet repeated actions (outline, no fill).** (Its ivory ground is also the calibration trap V5 must avoid.)

**acehotel.com (hospitality).** *Trigger:* a booking task inside a brand that wants personality. *Decision:* the booking
form is a rigid strip of labelled cells across the top (location / check-in / check-out / guests / code / BOOK NOW),
while the page below is a 140 px/300 condensed display face over video. *Reason:* the task is kept utilitarian and
always present; the personality is spent elsewhere. *Evidence:* Toronto Gothic h1 140/133, h2 70/84; Bianco Sans 16/30
body; one orange action cell. → **Separate the task strip from the expressive surface; make the one action a coloured
cell, not a floating pill.**

**itsnicethat.com (culture editorial).** *Trigger:* a feed that updates hourly. *Decision:* a "Nice Feed" strip with
relative times ("12h", "1d") above the fold, headings in a condensed grotesk, one purple used for links and states.
*Reason:* freshness is shown, not claimed. *Evidence:* link colour `#6219FF` on 124 nodes. → **State and time as
typography (small, exact), not badges.**

**cosmos.so (visual search).** *Trigger:* search is the product. *Decision:* the search field sits centred in the
header on every page; the landing page is one 74 px/350 line with −3.7 px tracking and pill buttons; images are
arranged in collage tiles with 16 px radii. *Reason:* the field is always one tap away, the rest is visual evidence.
*Evidence:* 200–300 px section gaps. → **A permanently reachable search; images do the explaining.**

**kinfolk.com (independent magazine).** *Trigger:* print heritage online. *Decision:* serif display (50/52, −0.5 px),
serif text at 25/29, sans captions; a horizontal rail of articles with a caption line (section, issue) above the title;
white and a sage `#DBDED5` ground; 170–310 px gaps. *Reason:* the issue is the unit; captions orient without chrome.
*Evidence:* radius 2 px on 3 nodes, no shadows. → **Captions and metadata as quiet lines, one scale step down.**

**pitchfork.com (music editorial).** *Trigger:* dense daily news. *Decision:* three columns separated by 1 px vertical
rules; a scored review as a ringed number; tracked caps labels; black header band. *Reason:* density with rules instead
of boxes keeps many stories scannable. → **Rules, not cards, for density.** (Also a calibration trap: hairline
broadsheet plus tracked caps is a generated-page default.)

**are.na (creative tool).** *Trigger:* a tool that refuses to look like SaaS. *Decision:* a lettered list ("a., b.,
c. +") as the product description; 12.5 px UI text; navy `#00075F` as the only action colour; enormous empty space
(536 px gaps). *Reason:* restraint signals seriousness. → **An action colour can be a single dark hue; odd, specific
structures (a list that ends in "+") are memorable.**

## 3. Principles extracted for Better Wolt

1. **Food is seen through a frame, not placed in a card.** Letterbox, window, band: the photo defines the space and
   text lives beside or below it on solid ground (mubi, aesop, V4's own scrim finding).
2. **Spend identity in type.** One committed display voice at large sizes, one workhorse for UI, numbers always in the
   workhorse with tabular figures (teenage.engineering, acehotel).
3. **Keep the task strip utilitarian and always there.** Search and the active order are reachable from every screen;
   personality goes elsewhere (acehotel, cosmos).
4. **Density through rules and alignment, never nested boxes** (pitchfork, kinfolk).
5. **Repeated actions are quiet outlines; the one action is filled** (aesop, are.na).
6. **Time and state as exact small type** — "12h", "עוד 9 דק׳", clock times — not badges (itsnicethat).
7. **Structural oddities are memorable when they are true to the content** — a lettered list, a feed strip, a
   departures board (are.na, itsnicethat).

## 4. The cultural home and the rut

- **Mechanism:** a Hebrew-first Tel Aviv delivery product whose prices are always the server's and whose every state is
  designed.
- **Scene:** a diner in Tel Aviv at 20:30 on a phone, hungry, deciding fast; an owner updating a menu between services.
- **The rut this category always ships:** photo cards in a grid under a rounded search pill, a brand red or blue,
  pill chips, a floating cart button. **Its predictable opposite:** black-and-gold "premium". **V4's world** (cream
  paper, aubergine band, pomegranate red, Suez One, rounded cards) is evidence and anti-reference.
- **Seven grounded candidates from the audience's world, by resonance:** (1) the kitchen's order ticket on the rail;
  (2) Tel Aviv's White City Bauhaus — plaster, ribbon windows, the stairwell's thermometer window; (3) the café felt
  letterboard menu; (4) transit wayfinding — Dan buses, the Red Line, LED destination boards, route diagrams;
  (5) Carmel-market cardboard price signs; (6) Israeli modernist poster tradition; (7) food as cinema — the still,
  the letterbox, subtitles, credits (the Cinematheque's programme).

## 5. Impeccable's direction roll

`impeccable concept-seed --scope direction --mode operate` (seed key `186e194c`) **assigned candidate 7, food as
cinema**, which matched the brief's pinned Concept A (editorial/cinematic). The brief pins three concepts, so the other
two came from the grounded list: **transit wayfinding (4)** for the kinetic urban concept and **White City (2)** for
the restrained concept. The roll dealt six catalogue challengers; each was fused with the product and weighed against
the assigned direction on audience identification and product clarity:

| Challenger | Verdict | Discipline kept |
|---|---|---|
| Night-flight instrument six-pack | declined | every gauge shows **trend as well as value** → tracking shows elapsed and remaining, not only a stage name |
| CRT arcade pixels | declined | **state colours are law** → one colour per meaning, never reused for decoration |
| Late-modern civic prospectus | declined | **all colour spent on one element** → a single accent budget per screen |
| Doujin event catalogue | declined (holds clarity for dense browse only) | **marked state persists** → restaurants you ordered from are marked wherever they appear |
| Iridescent cloud edge | declined | colour confined to **edges of state**, never fills |
| Theatre cyclorama dawn | declined | **discrete, labelled phases** → tracking stages are named bands, not a continuous glow |

No challenger won; every kept discipline is carried into the three concepts. Concept selection itself follows the brief
(the agent chooses, with an Impeccable critique), not the decision page.
