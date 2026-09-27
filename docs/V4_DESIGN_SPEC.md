# Better Wolt V4 — Design Specification

**Status:** built on `v4/premium-frontend`, branched from V3 HEAD `b547763`. Never commit to `main`,
`v2/extensible-architecture` or `v3/ui-overhaul`.
**Evidence:** [V4_VISUAL_AUDIT.md](V4_VISUAL_AUDIT.md) (findings A1–A5, B1–B8, C1–C4). **Order of work and progress:**
[V4_IMPLEMENTATION_PLAN.md](V4_IMPLEMENTATION_PLAN.md).

V4 **evolves** V3; it does not replace it. [V3_DESIGN_SPEC.md](V3_DESIGN_SPEC.md) stays authoritative for everything
this document does not change — tokens, breakpoints, navigation models, accessibility requirements. Where either spec
touches [V2_SPEC.md §3](V2_SPEC.md#3-invariants-must-survive-every-phase) or
[ARCHITECTURE.md §4](ARCHITECTURE.md#4-api-contract), those documents win.

## 1. Scope and what must not move

V4 is a presentation and interaction pass over both clients. It does **not** change request or response shapes,
status codes, contract error strings, backend authorisation, models, pricing authority (clients still send only
`{ restaurant, products: [{ id, quantity }] }`), the World Cup names, or the backend feature layout. It keeps every
behaviour V3's three review passes fixed: stale-response guards, account-switch handling, 401 sign-out, focus
management, reduced motion, image fallbacks.

## 2. Personality

V3 named the world: *night market* — warm paper, aubergine ink, one pomegranate action colour, Hebrew signage type.
The audit found that identity sound and its structure generic: every screen is the same bordered card at the same
rhythm. V4 moves the identity from colour into composition.

**Better Wolt should feel like a well-kept market stall at night:** the food lit and up front, the prices chalked
clearly, the stall-holder quick. Confident, warm, exact. Never busy.

## 3. Principles

1. **Food is loud, chrome is quiet.** Photography and dish names carry the page. Surfaces are flat paper divided by
   hairlines and space; a card is used only where the item is a destination with a photo (a restaurant).
2. **One loud thing per screen.** A flame fill marks the one action the screen exists for — search, place the order,
   sign in. An action that repeats per row is quiet: a tinted round `+`, never a labelled flame button (A1).
3. **Numbers are exact.** Prices, totals, times and counts are set in the reading face with tabular figures, `₪` before
   the number. The display face sets Hebrew words only, never a numeral (A2).
4. **Structure by type and space, not boxes.** A list is rows inside one surface, not a stack of cards (A3, B4).
5. **Feedback stays where the action was.** An outcome that matters is written next to what caused it and stays until
   it is no longer true. Toasts confirm; they never carry the only copy of an error (A5).
6. **Every state is designed, including "no photo".** Loading, empty, error, success — and a restaurant whose image
   failed — each look intended (B1).
7. **Motion explains cause.** Something moves because the user did something or because time passed (tracking).
   120–220 ms, no bounce, nothing under reduced motion.

## 4. Visual system

### 4.1 Colour

The V3 palette stays (V3 §4.1), including `night`/`on-night` and `on-danger`. Changes are in *use*:

- **Flame fills** are for the screen's primary action and the phone cart bar only. The add action is
  `flame-tint` with a `flame-deep` icon; in dark mode `flame-tint` with `flame`.
- **Night surfaces** on a screen: at most one. Home keeps the hero band; the campaign card moves off night onto an
  amber-tinted surface (B2). The tracking stage stays night — it is the showpiece.
- **Plates** (restaurants without a usable photo) use one of four tint pairs chosen from the restaurant id, so the
  same restaurant always gets the same plate: `amber-tint/ink`, `flame-tint/flame-deep`, `herb-tint/herb`,
  `ink-tint/ink`. Each pair is ≥ 4.5:1 in both themes.
- **The theme** follows `prefers-color-scheme` until the person chooses one; the choice is then remembered (B8).

### 4.2 Typography

| Role | Face | Size / line-height | Weight | Notes |
|---|---|---|---|---|
| Display (hero, restaurant name, tracking headline, campaign title, plate words) | Suez One | 40–56 / 1.06 | 400 | Hebrew words only |
| Page title | Rubik | 32 / 1.15 | 700 | |
| Section title | Rubik | 22 / 1.25 | 700 | down from 24: sections are quieter than pages |
| Dish / card name | Rubik | 17 / 1.35 | 600 | |
| Body | Rubik | 15 / 1.6 | 400 | measure ≤ 68 ch |
| Description | Rubik | 14 / 1.5 | 400 | `ink-muted`, clamped to 2 lines in lists |
| Meta / caption | Rubik | 13 / 1.45 | 500 | |
| **Price in a row** | Rubik | 15 / 1.3 | 600 | `tabular-nums`, `ink` |
| **Total** | Rubik | 20–24 / 1.2 | 700 | `tabular-nums` |
| **Big number** (tracking arrival time) | Rubik | 48–64 / 1 | 700 | `tabular-nums`, `-0.02em` tracking |

Every numeric string goes through one formatter (`formatPrice` on web, `formatPrice` on mobile) and one CSS/StyleSheet
role (`.bw-num` / `type.num`). Mobile keeps the platform font (V3 decision).

### 4.3 Space, radius, borders, elevation

Space scale unchanged (4 px base). Radii keep their roles; V4 **uses fewer shapes**: dish rows and order rows have no
radius of their own — the list surface has `radius-lg` and rows are divided by 1 px `line` hairlines inset by the row
padding. Elevation: `e1` is removed from resting list surfaces (a hairline border does the work), `e2` is hover on
restaurant cards and sticky bars, `e3` dialogs, sheets and toasts.

### 4.4 Images

- Restaurant card: 16:10, `radius-md`, `object-fit: cover`. Hover scales the photo to 1.03 inside its frame over
  320 ms; the card itself never moves.
- Restaurant hero: 3:1 at ≥ 900 px (max 320 px tall), 16:9 below; the name sits on the photo over a bottom scrim
  (`night` at 0 → 78 %), which guarantees ≥ 4.5:1 for white text on any photo.
- No photo, or the photo failed: the **plate** — the restaurant's first word in Suez One on its tint pair. The hero's
  plate is the same, larger, and the scrim is dropped (text is already on a solid tint).
- Photos load `lazy` below the fold, and every frame has a fixed aspect ratio, so nothing shifts when an image lands.

### 4.5 Icons

The V3 line set (`components/ui/Icon.jsx`, 1.75 px stroke, 20 px default) stays. Icons label, they never decorate: an
icon appears beside text or as an icon button with an accessible name, never alone as ornament.

## 5. Components

- **Buttons.** Primary (flame fill) · secondary (surface + line) · ghost · danger. The primary button on the cart
  carries the total: `לביצוע ההזמנה · ₪153`. Loading keeps the size (V3 §4.4).
- **Add control.** A 40 px round button (`flame-tint`, `flame-deep` plus icon; 44 px hit area) at the row's inline
  end, accessible name `הוספה: <dish>`. After the first add it becomes a compact stepper (− · n · +) in the same place,
  and focus follows (V3 behaviour kept). The − is neutral (`sunken`); only + is tinted (C2).
- **Dish row.** Name (17/600) and, if in the cart, a small flame count badge before it; description (14, 2-line
  clamp); price (15/600 tabular) on its own line under the description; add control vertically centred at the end.
  Rows sit in one surface with hairlines.
- **Menu filter.** Above 8 dishes, a search field at the top of the menu filters by name and description as you type,
  with a count ("3 מנות מתאימות") and a designed empty result. Client-side; the API is untouched.
- **Cart.** Header with the restaurant name; lines as `n × name`, line total, stepper; one total; an honest note
  ("המחיר הסופי נקבע לפי התפריט ברגע ההזמנה"); the primary button with the total. An **inline message area** above the
  button holds checkout problems (`role="alert"`) until the cart changes or the order is retried.
- **Cart bar (phone).** Flame bar: count badge · "לסל" · total. While it is shown the order dock steps aside (A4).
- **Restaurant card.** Photo or plate, name (17/600) with rating, one line of menu highlights, one meta line.
  "מנות מ-₪22" becomes a small ink-on-surface label over the photo corner, set in Rubik.
- **Order row.** Restaurant, date in words ("היום", "אתמול", "22 בספטמבר"), item summary, total, and two actions:
  "פרטי ההזמנה" (tracking) and "להזמין שוב" (the restaurant).
- **Tracking stage.** Night surface; the arrival **clock time** as the big number with "עוד N דק׳" under it; a
  four-stop rail whose fill is `transform: scaleX()`; each stage with its note and its expected time; the current stop
  has a slow halo (none under reduced motion). The receipt below it is a list, not a second card.
- **Dialogs and sheets.** V3 behaviour (focus trap, Esc, focus return, busy guards). Sheets enter from the bottom
  (translateY 100 % → 0, 280 ms `ease`); dialogs fade and scale from 0.98 (200 ms).
- **Toasts.** Stack at the bottom centre on phones and bottom inline-start on desktop; enter 180 ms, leave 140 ms.
- **Empty / error states.** V3 §6.1. Icons sit in a 56 px `sunken` circle; the action is a secondary button unless it
  is the only way forward.

## 6. Screens

- **Home.** Hero band (night) shortened; the photo cluster stays on wide screens and is dropped below 900 px. For a
  signed-in customer with past orders, a **"להזמין שוב"** row of the last three restaurants they ordered from (real
  data from `GET /orders`). The campaign as an amber-tinted strip with the flag mosaic. Then the grid.
- **Restaurant.** Hero with name on the photo; one meta line on paper under it; owner tools as a quiet toolbar under
  the meta line; menu list + sticky cart (≥ 1100 px) or cart bar + sheet (below).
- **Search.** Result cards gain "נמצא בתפריט: <dish>" when the match was a dish, with the query emphasised.
- **Orders.** "בדרך אליכם" (active, live minutes, link to tracking) above "הזמנות קודמות" (one list surface).
- **Tracking.** As above; a price the server corrected is explained on this page, inline, not in a toast.
- **Auth.** The brand panel loses its decorative glow and gains the logo mark; the form aligns to the panel's top third.
- **Owner.** Edit/delete move next to the dish name's column on wide screens (C1); the owner toolbar reads "ניהול
  המסעדה" with the two actions and the dish count.
- **World Cup.** The flag grid uses the same quiet add control and the flat price is stated once in the hero, not on
  every row.

## 7. Motion

| Moment | Motion | Duration / easing | Reduced motion |
|---|---|---|---|
| Add → stepper | stepper fades and scales 0.94 → 1 | 160 ms `ease` | instant |
| Quantity change | the number slides 4 px in the direction of change and fades | 140 ms | instant |
| Cart bar appears | translateY(100 %) → 0 | 220 ms `ease` | instant |
| Cart count changes | badge scales 1 → 1.15 → 1 | 180 ms | none |
| Sheet / dialog | see §5 | 280 / 200 ms | fade only |
| Toast | translateY 8 px + fade | 180 ms in, 140 ms out | fade only |
| Skeleton → content | content fades in | 180 ms | instant |
| Tracking rail | fill `scaleX` to the elapsed fraction | 600 ms `ease` once, then follows the clock | instant |
| Current tracking stop | halo pulse | 2 s, infinite | none |

No scroll-triggered reveals, no page transitions, no springs with overshoot. Mobile uses React Native `Animated` with
the native driver (no new dependency); `useReducedMotion()` gates every animation.

## 8. Responsive rules

V3 breakpoints stay. Additionally: nothing floats over content except one bar at a time (cart bar **or** order dock);
the restaurant hero height is capped by aspect ratio, not viewport height; every list row keeps its action within
thumb reach on the inline end.

## 9. RTL and bidi

The document is `dir="rtl"`. Dish and restaurant names are isolated (`unicode-bidi: isolate` on web, FSI/PDI in
strings) wherever they sit next to numbers. `₪` precedes the amount (`₪62`); tabular figures keep columns of totals
aligned. Mixed Hebrew/Latin names are allowed to wrap anywhere they must (V3's `overflow-wrap: break-word`).

## 10. Accessibility

V3 §7 stands. V4 adds: the add control keeps a ≥ 44 px hit area even though it draws 40 px; inline checkout
messages are `role="alert"` and are tied to the cart region; the menu filter announces its count through a polite live
region; the tracking stage exposes the arrival time and the current stage as text, the halo is decorative
(`aria-hidden`); colour is never the only in-cart signal (the count badge carries a number).

## 11. Decision log

| Date | Decision |
|---|---|
| 2026-09-24 | V4 evolves the night-market identity instead of replacing it: the audit found the palette and type voice sound and the structure generic. |
| 2026-09-24 | The display face never sets numerals: Suez One draws `₪` as a letter pair and uses old-style figures (audit A2). |
| 2026-09-24 | Add is a quiet round control; flame fills are reserved for the one primary action per screen (A1). |
| 2026-09-24 | Menus get a client-side filter, not categories: the API has no category field and V4 does not change the contract. |
| 2026-09-24 | Checkout problems are written inline and kept; toasts only confirm (A5). The cart note stops promising a payment step and a fee that do not exist. |
| 2026-09-24 | The campaign card leaves the night surface so home has one night band (B2). V3 listed it among the night surfaces; this supersedes that for home only. |
| 2026-09-24 | Figma was not used: the only Figma tools exposed in this environment are its authentication entry points, and the design is expressed directly in code and verified in the browser. |
| 2026-09-24 | Reference products were studied for principles only (audit §2). Their extracted tokens are not committed and nothing is copied. |
