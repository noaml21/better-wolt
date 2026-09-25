# Better Wolt V5 — Three Concepts

Three design worlds, built as isolated static prototypes before any production code changed. Research behind them:
[V5_VISUAL_RESEARCH.md](V5_VISUAL_RESEARCH.md). Screenshots: [docs/screenshots/v5/concepts/](../screenshots/v5/concepts/).

## How to open them

```bash
cd docs/v5/concepts && python3 -m http.server 8765
# http://localhost:8765/a-screening/  ·  /b-line/  ·  /c-white-city/
```

Hash routes: `#/` home · `#/r/r-burger` restaurant · `#/r/r-smoke` (no photo, long mixed-direction name, ₪1,240 dish) ·
`#/r/r-hummus` (photo URL that fails) · `#/search/<query>` · `#/orders` · `#/track/o-73cbf7` · `#/world-cup`. Query
`?cart=r-burger` preloads a cart; `&sheet=1` opens the phone cart sheet.

The prototypes share `shared/data.js` (the real demo menus from `docs/dev/demo-data.mjs`, the seeded World Cup dishes,
and the same illustrative rating/time/fee derivation as the production client) and `shared/proto.js` (hash routes, a
per-restaurant cart). They are never imported by either production client.

Each concept covers: home/discovery, restaurant + menu, cart (desktop and phone sheet), search (hit and miss), orders,
tracking, the World Cup page, the no-photo and failed-photo states, Hebrew with mixed Latin, large prices, and phone
widths down to 320 px. Every route was captured at 1440, 1024, 768, 390 and 320 (nine routes per concept): no horizontal
overflow and no console errors in any capture.

---

## A — Screening (food as cinema)

**Idea.** The photograph is the screen and the black around it is the auditorium. Words never sit on a photo: they sit
in the letterbox bar beneath it, as a title card. The menu rolls like film credits, the cart speaks in subtitles, and
tracking is a timeline with a playhead.

- **Palette:** true black auditorium, a letterbox bar a hair above it, projected ivory text, credits grey; subtitle
  yellow `#F3D34A` only for subtitle lines (cart bar, in-cart counts, live status).
- **Type:** Frank Ruhl Libre (900 for title cards, 300 for the search sentence); Noto Sans Hebrew for UI and every
  number (tabular).
- **Home:** a search written as a sentence — "בא לי ___" at 104 px — with plain-text suggestions; the active order as a
  subtitle line with a thin progress rule; one restaurant in scope (2.39:1 still + title card); then the programme:
  alternating 7/5 rows of still and text, no grid.
- **Restaurant:** letterboxed still, the name centred in the bar at up to 128 px, facts as credits (label over value);
  the menu as a credits roll — dish right, a gutter dash, price and a quiet outlined + left.
- **Cart:** a subtitle bar at the bottom ("4 מנות מהמבורגר בר — ₪215. לסל") opening a sheet laid out as end credits.
- **Tracking:** arrival time at 240 px/200 weight, a playhead on a scrubber, four chapters.

## B — Line (Tel Aviv transit)

**Idea.** Each restaurant is a line with its own colour and letter; the city is a departures board; a menu is a route
you ride; the cart is your ticket; tracking is the train between stations. Copy stays food language — the metaphor is
visual only.

- **Palette:** platform concrete ground, black ink, an LED board with amber diodes for the one live thing (the active
  order), and eight saturated line colours that each own a restaurant (derived from the id).
- **Type:** Karantina 700 (condensed Hebrew, destination-board scale); Noto Sans Hebrew at 87.5 % width for UI and 62.5–
  75 % width for numbers.
- **Home:** an LED strip for the active order; "לאן הערב?" at 176 px over a heavy-ruled search; "order again" as three
  line-coloured blocks; the departures board (badge · photo · name at 64 px · dishes as stops · time · fare) whose rows
  flood with the line colour from the inline start on hover.
- **Restaurant:** a header drenched in the line colour with the name at 168 px and the photo in a ruled panel; the menu
  as a vertical route whose stop dots fill (and show the count) when a dish is added; square + controls.
- **Cart:** a printed ticket (sticky on desktop, a sheet on phones) that "prints" in with a clip-path reveal.
- **Tracking:** an LED board with the arrival time at 220 px and a four-station line map (vertical on phones).

## C — White City (Tel Aviv Bauhaus)

**Idea.** Plaster, long ribbon windows, the narrow stairwell window, one painted shutter colour. Structure comes from
a 12-column grid with titles hanging in the first three columns; food is seen through windows.

- **Palette:** plaster `#F2F2EE`, white, graphite ink, hairline grey, one shutter teal `#1D6A64` (primary action and
  in-cart marks only). A real dark mode (night plaster).
- **Type:** Miriam Libre (geometric Hebrew) for display at 400; Noto Sans Hebrew for UI, 200 weight for the tracking
  clock.
- **Home:** a personal greeting ("ערב טוב, נועם. מה נאכל?") with a single underline search; the ribbon window — every
  restaurant as a vertical pane in one long strip, a pane widening when hovered; "order again" with tall thumbnails; the
  lobby directory — a ruled table sorted by delivery time.
- **Restaurant:** the name at 112 px, facts in a four-column row, the menu as a ruled list with prices on a tab stop and
  a quiet outlined "הוספה"; the stairwell photo sticky beside it with the cart as a "balcony" under it — the only
  rounded corner in the system.
- **Cart:** the balcony on desktop; a bottom bar + sheet on phones.
- **Tracking:** the stairwell window filling floor by floor beside the arrival clock and the floor list.

---

## Critique (Impeccable, dual-agent)

Method: Impeccable `critique`, two isolated sub-agents — **A**: design review (PRODUCT.md, critique.md heuristics and
personas, craft-floor.md, every screenshot, the source); **B**: `impeccable detect --json` on each prototype plus
`detect.js` injected into the rendered pages (Chrome, 1440 and 390, four routes each, 24 runs), overflow, console and
contrast. Both were interrupted once by a usage limit and resumed from their transcripts.

| | A Screening | B Line | C White City |
|---|---|---|---|
| Nielsen total | 23/40 | **26/40** | 26/40 |
| Uniqueness / memorability | 4 / 4 | **5 / 5** | 3 / 3 |
| Beauty | 4 | 3 | 4 |
| Clarity / usability | 3 / 2 | **4 / 4** | 4 / 4 |
| Food emphasis | **5** | 2 | 3 |
| Hebrew/RTL | 4 | 4 | 4 |
| Mobile | 3 | **4** | 3 |
| Scales to every feature | 2 | 3 | **5** |
| Accessibility | 2 | 3 | 3 |
| Feasibility (React + CSS) | 4 | 4 | 5 |
| Detector (CLI) | 1 advisory | 1 warning (`pulsing-dot`) | 1 advisory |
| Detector (rendered) | low-contrast labels, skipped heading | bounce easing, pulsing dot, skipped heading | caption contrast on no-photo panes, skipped heading, an eyebrow |
| Looks generated / template? | half: dark + serif + zig-zag rows is a portfolio staple | no — the most authored | drifts toward calm "minimal" default |
| Different from V4 at a glance? | yes | **yes, instantly** | yes, but reads as a new theme |

Findings common to all three (from the shared runtime and markup): an `h1` followed by `h3` on the restaurant and World
Cup pages; the cart sheets had no visible close control; adding from another restaurant emptied the cart silently; a
Hebrew prefix glued to a Latin name ("מSmoke…"); long mixed-direction names breaking badly in display faces.

## Decision: B — Line

**Chosen for the strongest balance of distinctiveness, product quality and usability, not for safety.** B is the only
concept that reads as a different product within three seconds *and* is specific to this product: a Tel Aviv
wayfinding language for a Tel Aviv delivery service. Its signature devices are interaction, not costume — the LED strip
is the best order-status pattern of the three (heuristic 1 scored 4), the route menu shows what is in the cart in place,
and the departures board is the most comparable home (times and fees aligned in tabular columns). Its weaknesses are
matters of discipline (noise, photo scale, identity allocation, no dark theme); A's are structural (dark-only, a home
that cannot be scanned, the cart colliding with content) and C's is fundamental (not memorable enough for this brief).

What V5 takes from the other two — disciplines, not their clothes:

- **From A (Screening):** photography at real scale (the restaurant photo leads its header; board rows carry photos on
  phones too); the credits-roll price discipline (dish · gutter · tabular price); one colour per meaning (amber is live
  status only, never a button); the Hebrew voice of "בא לי" in search and empty states.
- **From C (White City):** a quiet ground (1 px rules by default, heavy rules only where the board needs them); a
  reserved error hue no restaurant can take; light *and* dark from the first commit; empty states with a way back; a
  text-labelled add for first-timers where space allows; the calm table idiom for owner screens; a visible label on
  every time ("מגיעה ב־").
- **From the roll's challengers:** tracking shows trend and value (elapsed and remaining); phases are discrete and
  labelled; restaurants you ordered from are marked wherever they appear.

A and C stay in `docs/v5/concepts/` with their screenshots for reference. Design system: [V5_DESIGN_SPEC.md](V5_DESIGN_SPEC.md).
