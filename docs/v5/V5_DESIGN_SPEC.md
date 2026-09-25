# Better Wolt V5 — Design Specification: "Line"

**Status:** being built on `v5/visual-reinvention`, branched from V4 HEAD `b500a21`. Never commit to `main` or the V2–V4
branches. **Why this direction:** [V5_CONCEPTS.md](V5_CONCEPTS.md) (three concepts, dual-agent Impeccable critique,
decision). **Research:** [V5_VISUAL_RESEARCH.md](V5_VISUAL_RESEARCH.md). **Order of work:**
[V5_IMPLEMENTATION_PLAN.md](V5_IMPLEMENTATION_PLAN.md). **Evidence:** [V5_VISUAL_AUDIT.md](V5_VISUAL_AUDIT.md).

V5 **replaces** the V3/V4 visual system (night market: cream paper, aubergine band, pomegranate, Suez One, rounded
cards). It does not replace behaviour: everything in [V2_SPEC.md §3](../V2_SPEC.md) and
[ARCHITECTURE.md §4](../ARCHITECTURE.md) stands, and so does every behaviour V3 and V4 fixed — stale-response guards,
account-switch handling, 401 sign-out, focus management, inline checkout problems, price corrections explained on
tracking, image fallbacks, reduced motion. Where this document and those disagree, those win.

## 1. The idea in one line

**Better Wolt is read like the city's transit system.** Every restaurant is a *line* with its own colour and number; the
city's restaurants are a *departures board*; a menu is a *route* whose stops you choose; the cart is your *ticket*; the
order you are waiting for is on the *LED board* at the top of every page; tracking is the *line map* between four
stations. The metaphor is visual and structural only — the copy stays in plain food language ("הסל", "לביצוע
ההזמנה", "בדרך אליכם"). Nobody has to learn transit words to order dinner.

**What makes it unmistakable:** condensed Hebrew signage type at destination-board scale; a concrete ground with black
rules; saturated line colours that each own one restaurant; an amber LED strip that is the only live element; square,
heavy controls; menus drawn as a route with stop dots that fill when you add. Hide the logo and it is still this
product, and nothing about it resembles V4.

## 2. Personality

Quick, exact, local, a little loud where it earns it. The stall-holder of V4 becomes the city's timetable: you look up,
you know when, you go. Confident without shouting everywhere — the board is loud, the ticket is exact, the rest is
concrete and space.

## 3. Principles

1. **One live thing.** Amber-on-black LED is reserved for what is happening now (the active order, the arrival time).
   Nothing else is amber, and nothing static blinks.
2. **Colour is identity, not decoration.** A line colour means "this restaurant". Red is never a line colour: it means
   *error* and only error. Neutral concrete, black and white do everything else.
3. **Loud where you choose, quiet where you repeat.** The board header, a restaurant's name and the one primary action
   per screen are heavy. Repeated actions (add, stepper, row links) are outlined squares; rules are 1 px unless they
   structure the board, the ticket or the top bar (then 2–3 px).
4. **Food leads its line.** The restaurant photo is the largest thing on the restaurant page and appears in every board
   row at every width. A restaurant with no photo gets a designed *line plate*, never an empty box.
5. **Numbers are timetable-exact.** Prices, totals, times and counts are set in Noto Sans Hebrew with tabular figures,
   `₪` before the amount, ranges isolated left-to-right. Condensed width for big numbers, normal width in running text.
6. **Every time is labelled.** "מגיעה ב־21:47", "עוד 9 דק׳", "20–30 דק׳" — a clock time never stands alone.
7. **Feedback stays where the action was.** The stop dot fills where you pressed +; a refused order is written on the
   ticket and stays; toasts only confirm.
8. **Motion explains a change.** A row floods with its line colour when you point at it; a stop fills when you add; the
   ticket prints when it gets its first line; the line map fills with elapsed time. Nothing loops.

## 4. Visual system

### 4.1 Colour tokens

Light theme — *platform*:

| Token | Value | Use |
|---|---|---|
| `ground` | `#E4E6E1` | page (concrete) |
| `panel` | `#F3F4F1` | inputs, ticket body, board rows on hover-off, dialogs |
| `raised` | `#FFFFFF` | the one surface above panel (menus, popovers) |
| `ink` | `#101214` | text, heavy rules, primary fill |
| `ink-muted` | `#4D535A` | secondary text (6.2:1 on ground) |
| `rule` | `#6E746C` | 1 px control borders (≥ 3:1 on ground and panel) |
| `hairline` | `#C3C7BF` | 1 px separators between rows (decorative) |
| `board` / `led` | `#0A0A0A` / `#FFB000` | the LED strip and the tracking board (10.8:1) |
| `error` / `error-tint` / `on-error` | `#B3261E` / `#F6E3E1` / `#FFFFFF` | errors only (5.2:1 on ground) |
| `ok` | `#0B7A3E` | a confirmed state (delivered), also a line colour; always with text |

Dark theme — *night platform* (follows the system until chosen, remembered after):
`ground #121416`, `panel #1B1E21`, `raised #24282C`, `ink #ECEDE9`, `ink-muted #A5ABB0` (8:1), `rule #7A8187`,
`hairline #2E3337`, board stays `#000` with the same amber, `error #FF8A80` with `on-error #121416`.

**Line colours** (ten, deterministic from the restaurant id; never red, never amber):

| # | Light fill / text on it | Dark fill / text on it |
|---|---|---|
| 0 green | `#0B7A3E` / white | `#4CC38A` / ink-dark |
| 1 blue | `#1D4ED8` / white | `#7AA2FF` / ink-dark |
| 2 purple | `#7B2D9B` / white | `#C48BE0` / ink-dark |
| 3 orange | `#E07800` / `#101214` | `#FFA24C` / ink-dark |
| 4 teal | `#00747A` / white | `#3CC2C9` / ink-dark |
| 5 magenta | `#B0165A` / white | `#F07AA8` / ink-dark |
| 6 navy | `#1B2A6B` / white | `#9FB0FF` / ink-dark |
| 7 sky | `#0369A1` / white | `#56B8F0` / ink-dark |
| 8 olive | `#6B5B00` / white | `#C9B64A` / ink-dark |
| 9 brown | `#7C4A1E` / white | `#D49A6A` / ink-dark |

Every pair is ≥ 4.5:1 (checked in `tokens.css` comments). The World Cup restaurant always takes its own line: black
with the amber LED stations (it is the one campaign; it is allowed the board's colours).

**Line number.** A two-digit number (10–99) derived from the id, shown in the badge. It is presentation only, like the
illustrative rating, and it is labelled for assistive tech as part of the name, never alone ("קו 42, המבורגר בר"
is *not* read — the badge is `aria-hidden`; the name is the name). Two restaurants may rarely share a number; the colour
and name still differ, and nothing depends on uniqueness.

### 4.2 Typography

| Role | Face | Size / line-height | Notes |
|---|---|---|---|
| Board title, page title | Karantina 700 | 56–176 / 0.82 | `clamp()`; Hebrew and Latin; only ≥ 28 px |
| Restaurant name (board row, header) | Karantina 700 | 36–64 (row), 64–168 (header) / 0.85 | `text-wrap: balance`; long names step down |
| Section title | Karantina 700 | 36–44 / 0.9 | |
| Dish name | Noto Sans Hebrew 800, width 87.5 | 18–21 / 1.25 | |
| UI label, nav, button | Noto Sans Hebrew 700, width 87.5 | 15–18 / 1.3 | |
| Body, description | Noto Sans Hebrew 400–500, width 100 | 14–16 / 1.55 | measure ≤ 68 ch |
| Meta / caption | Noto Sans Hebrew 600, width 87.5 | 13 / 1.4 | never below 13 px |
| **Price in a row** | Noto Sans Hebrew 800, width 75, tabular | 18–20 | `₪` first |
| **Total** | Noto Sans Hebrew 800, width 62.5, tabular | 32–40 | |
| **Big number** (arrival) | Noto Sans Hebrew 900, width 62.5, tabular | 96–220 / 0.8 | on the LED board only |

Karantina never sets a price or a running sentence. Numbers in a badge (line number) may use Karantina — it is an
identifier, not a quantity. Fonts are the only new dependency (Google Fonts, `display=swap`, preconnect).

### 4.3 Space, grid, shape

- 4 px base; steps 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96. Page gutter `clamp(16px, 3vw, 40px)`; content is
  full-width (the board runs edge to edge inside the gutter) with a 1440 px cap only for reading columns.
- **Shape:** square. Radius 0 on every box, control and image. Circles only for route stops, the stations of the line
  map and flag stations. No pills, no rounded cards.
- **Rules:** 3 px ink under the top bar and around the ticket and the dialog; 2 px ink on board row separators and
  controls; 1 px `rule` on inputs at rest (2 px ink on focus); 1 px `hairline` between list rows.
- **Elevation:** none on resting surfaces. Only sheets, dialogs and toasts get one soft shadow
  (`0 18px 40px -12px rgba(16,18,20,.35)`), offset downward.

### 4.4 Images

- **Board row:** 4:3 photo, 120 px wide on desktop, 72 px on phones (a square crop) — every width shows food.
- **Restaurant header:** the photo leads — 5:4 panel taking ~45 % of the header on desktop, 16:9 full-bleed above the
  line-coloured name block on phones. The name never sits on the photo.
- **No photo / failed photo:** the *line plate* — the line colour, the line number large in Karantina and the name
  under it in the line's text colour. Same everywhere (row, header, order row, ticket).
- Fixed aspect ratios everywhere; `loading="lazy"` below the fold.

### 4.5 Icons

The V3 line set (`Icon.jsx`) stays, drawn at 2.2 px stroke with square caps to match the heavier rules. Icons label;
they never decorate alone.

## 5. Components

- **LED strip** (top of every page when the signed-in customer has an order on the way): board black, amber text:
  `<restaurant> בדרך אליכם · מגיעה ב־21:47 · עוד 9 דק׳ · למעקב`. Short form below 600 px:
  `מגיעה ב־21:47 · עוד 9 דק׳ · למעקב`. Replaces V4's floating order dock — nothing floats over content except the phone
  cart bar. A static amber square marks it live (no blinking).
- **Top bar:** panel, 3 px ink bottom rule. Wordmark (a black square "B" tile + "Better Wolt" in Karantina), search, nav
  as text; the current page is an ink block with panel text. Theme toggle and account menu at the inline end.
- **Buttons:** *primary* ink fill, panel text, 48 px, square — one per screen; *secondary* 2 px ink outline;
  *ghost* underlined text; *danger* error fill. Loading keeps the size. The primary on the cart carries the total.
- **Add control:** a 44 px square, 2 px ink border, plus icon; name `הוספה: <dish>`. After the first add it becomes a
  stepper of three 40 px squares (− · n · +) in the same place; focus follows. Where the row has room (≥ 600 px, not
  owner mode) the add control carries the word "הוספה".
- **Line badge:** a square in the line colour with the number in Karantina; 44 px in rows, 72 px in the header,
  `aria-hidden`.
- **Board row (restaurant):** badge · photo · name (Karantina) with up to three dishes as a stops line underneath ·
  delivery time column · fee column. The whole row is one link. Hover and focus flood the row with its line colour from
  the inline start (clip-path, 420 ms ease-out) and switch the text to the line's text colour. A row you have ordered
  from carries a small "הזמנתם כאן" mark.
- **Route menu:** the menu is a vertical line in the line colour on the inline start; each dish is a stop — a 42 px
  ring that fills with the line colour and shows the count when the dish is in the cart. Dish name, description, price
  on a tab stop, add control at the inline end. Menu filter above 8 dishes (client-side, as V4).
- **Ticket (cart):** 3 px ink frame; a header band in the line colour with the badge and "הסל"; lines with steppers
  separated by perforations (dashed hairline); total in big condensed figures; the honest note ("המחיר הסופי נקבע לפי
  התפריט ברגע ההזמנה"); the inline problem area (error hue, `role="alert"`) above the primary button. Sticky column on
  desktop ≥ 1100 px; on narrower screens a bottom cart bar (ink, count square in the line colour, "לסל", total) opens
  it as a sheet with a visible close button.
- **Dialogs and sheets:** panel, 3 px ink frame, an ink title band; focus trap, Esc, focus return, busy guards (V3).
- **Fields:** label above; 48 px input, panel fill, 1 px `rule` border, 2 px ink border + no outline on focus (the
  border is the ring); error text in the error hue under the field with an icon.
- **Toasts:** an ink block with panel text and an icon for the tone; error toasts use the error fill. They only
  confirm; the only copy of an error is always inline.
- **Order row:** badge · photo · restaurant name · date in words and items · total · actions "פרטים" and "להזמין שוב"
  as small outlined squares.
- **Empty / error states:** a Karantina title, one sentence, and a way forward (a secondary button or links to
  suggestions); the icon sits in a 56 px square outlined in `rule`.

## 6. Screens

- **Home:** LED strip (if any) → "לאן הערב?" title with the search field ("בא לי…") and five quick searches as outlined
  squares → "להזמין שוב" as a row of line chips (badge + name) from the customer's own orders → the departures board of
  every restaurant → the World Cup as a special line (black band, amber stations with flags, the contract name "חגיגת
  מונדיאל") → footer. The sponsored video keeps its slot as a board row–height panel between rows 3 and 4, labelled
  "חסות". Owners get "פתיחת מסעדה חדשה" beside the board title.
- **Restaurants (all):** the full board with the same rows.
- **Restaurant:** header (photo panel + line block with badge, name, facts: time, fee, rating, address, phone link)
  → route menu + ticket. **Owner mode:** the header block turns neutral (panel with a line chip) so editing never looks
  like an alert; an owner toolbar ("ניהול המסעדה", dish count and price range, add dish, edit details, close) sits
  above the menu; each stop gets edit and delete squares.
- **Search:** the query as the page title in Karantina, the field under it, then board rows with "בתפריט: <dish>"
  (query marked) when a dish matched. No result: "אף מסעדה לא מגישה את זה" + quick searches + "כל המסעדות".
- **Orders:** "בדרך אליכם" (LED-styled row with arrival time and "למעקב"), then "הזמנות קודמות" grouped by day, order
  rows as above.
- **Tracking:** the LED board (restaurant, "מגיעה ב־", the arrival time as the big number, "עוד N דק׳", the stage in
  words) → the line map: four stations with their times, the line filling with elapsed time (vertical on phones) →
  the receipt as a ticket → "להזמין שוב". A server-corrected price is explained on the ticket, inline.
- **Auth:** a split: the board side lists tonight's lines (restaurant rows from `GET /restaurants`, ≥ 900 px only);
  the form side is a ticket-machine panel — title, fields, one primary action, the switch to register/sign in.
- **World Cup:** title "חגיגת מונדיאל" with a "קו מיוחד" label, flat price stated once, twenty flag stations as a
  grid of ruled cells (flag, dish, team, add), ticket as on a restaurant.
- **404:** the LED board says "העמוד הזה לא קיים" with a way home.

## 7. Motion

| Moment | Motion | Duration / easing | Reduced motion |
|---|---|---|---|
| Board row hover / focus | line colour floods from inline start (`clip-path`); text turns on the same clock | 300 ms in, 160 ms out, `cubic-bezier(.16,1,.3,1)` | instant colour |
| Add → stepper | stepper fades in, scale .96 → 1 | 160 ms ease-out | instant |
| Stop fills | ring fill + scale 1 → 1.08 | 240 ms ease-out, no overshoot | instant |
| Ticket's first line | the ticket prints: `clip-path` top → bottom | 320 ms ease-out | instant |
| Press | buttons `scale(.97)`, square controls `scale(.94)`, stepper cells `scale(.92)` | 140 ms ease-out | kept (no travel) |
| Cart bar appears | translateY(100 %) → 0 | 260 ms drawer curve | instant |
| Sheet / dialog | sheet from bottom 300 ms; dialog fade + scale .98 | drawer curve | fade only |
| Line map | fill `scaleX`/`scaleY` to elapsed fraction | 800 ms once, then with the clock | instant |
| Arrival time changes | digits slide up 6 px and fade | 180 ms | instant |
| Toast | translateY 8 px + fade | 180 in / 140 out | fade |

No springs with overshoot, no pulsing, no scroll reveals, no route transitions.

## 8. Responsive

Breakpoints: 600 (phone → large phone), 900 (tablet: board gains its fee column, auth gains its board side), 1100
(desktop: the ticket becomes a sticky column). Phones get: the short LED form, board rows as badge · photo · name +
time, the header photo on top, the cart bar + sheet, the vertical line map. Nothing floats over content except the cart
bar. Minimum width 320 px, no horizontal overflow at any width.

## 9. RTL and bidi

`dir="rtl"`. Names typed by people are isolated (`unicode-bidi: plaintext` in their own box, `<bdi>` inline).
Numeric ranges are LTR-isolated (`20–30` must not become `30–20`). A Hebrew prefix never touches a Latin name: write
"הסל · <name>" rather than "מ<name>". Long mixed-direction names wrap with `overflow-wrap: anywhere` and step down one
display size above 28 characters.

## 10. Accessibility

WCAG 2.1 AA. Every text pair ≥ 4.5:1 (large ≥ 3:1), control borders ≥ 3:1. Targets ≥ 44 px. Focus: a 3 px ink (dark:
ink-dark) outline offset 2 px on controls; inputs use their 2 px border. Heading order has no gaps (restaurant page:
h1 name → h2 "התפריט" → h3 dishes). Colour is never the only signal (line = colour + number + name; in-cart = filled
stop + count; error = colour + icon + text). The LED strip is a link with its full sentence as its name; the tracking
board exposes the arrival time and stage as text. Live regions: cart lines (polite), menu filter count (polite),
checkout problems (alert).

## 11. Mobile app (Expo)

Same identity, native composition: Karantina and Noto Sans Hebrew through `@expo-google-fonts` (fonts only); the LED
strip under the status bar when an order is on the way; bottom tabs restyled as a line bar (ink, current tab in amber
text on black); board rows; route menu; ticket as a native bottom sheet screen; tracking with a vertical line map.
Details in the implementation plan's mobile phase.

## 12. Decision log

| Date | Decision |
|---|---|
| 2026-09-25 | V5 replaces the V3/V4 visual world; behaviour and contracts are untouched. |
| 2026-09-25 | Concept B "Line" chosen over A "Screening" and C "White City" after a dual-agent Impeccable critique (V5_CONCEPTS.md). |
| 2026-09-25 | Restaurants are identified by a line colour + two-digit number derived from the id (presentation only, like the illustrative rating); letters were dropped because they collide. |
| 2026-09-25 | Red is reserved for errors; amber for live status. Neither is a line colour. |
| 2026-09-25 | The World Cup restaurant keeps its contract name "חגיגת מונדיאל"; "קו מיוחד" is only a label beside it. |
| 2026-09-25 | The floating order dock is replaced by the LED strip in the page flow; the only floating element is the phone cart bar. |
| 2026-09-25 | Radius 0 system-wide; circles only for stops and stations. |
| 2026-09-25 | Figma was not used: this environment exposes only Figma's authentication entry points; concepts were built as coded prototypes and inspected in the browser. |
