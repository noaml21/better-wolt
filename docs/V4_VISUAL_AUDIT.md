# Better Wolt V4 — Visual Audit of V3

**Baseline:** `v3/ui-overhaul` at `b547763` (local and `origin` agreed on 2026-09-24). V4 work happens on
`v4/premium-frontend`, branched from that commit.
**Method:** the running V3 product, not its source. Web on the CRA dev server against the dev API and database; every
route walked with Playwright (Chrome 153) at 1440×900, 1024×768, 768×1024 and 390×844, light and dark, signed out, as
the customer `noam` and as the owner `chef` — 112 captures, plus the cart → order → tracking flow at 1440 and 390. The
mobile app's baseline is the V3 set in `docs/screenshots/v3/mobile-*.jpg` (Expo web, Pixel 7 viewport).

The sweep found **no console errors and no horizontal overflow** on any route at any width. V3 is sound; what follows
is about hierarchy, density, typography and feedback — the gap between "correct" and "designed".

Findings are classed **A** (major design issue), **B** (meaningful polish) or **C** (optional refinement). Each was
seen on screen; the evidence column names the capture or measurement.

## 1. First-hand findings

### A — major

| # | Finding | Where | Evidence |
|---|---|---|---|
| A1 | **The repeated action is the loudest thing on the menu.** Every dish row carries a filled flame "הוספה" button; a six-dish menu is six identical red slabs, the World Cup page twenty. The eye reads buttons, not dishes, and the spec's own rule ("one loud thing per screen") is broken on the product's most important page. | Restaurant, World Cup | `restaurant-1440`, `worldcup-1440`, phone frames |
| A2 | **Prices are set in a face that cannot set prices.** The notched tag and every total use Suez One, whose `₪` glyph renders as the letter pair `שח` and whose figures are old-style (`0` reads as `o`, `9` descends). `₪290` reads as `שח29o`. Prices are the second thing a customer reads. | Dish rows, cart total, tracking total, orders | zoomed crops of `restaurant-1440` and `tracking-1440` |
| A3 | **Menu density.** Each dish is a bordered card ~130 px tall at 1440 for a name and one line; a 6-dish menu fills 1,100 px and a 20-dish one needs four screens. There is no way to find a dish in a long menu. | Restaurant | `restaurant-1440`, owner view |
| A4 | **Two floating bars stack on the phone.** With an order on its way and a dish in the cart, the dark order pill sits directly above the flame cart bar; together they cover ~170 px of an 844 px screen and overlap menu rows while scrolling. | Restaurant, World Cup at 390 | `flow-390-light-1added` |
| A5 | **Checkout feedback lives only in toasts.** A refused order, a dish removed from the menu, or a price the server corrected are announced by a transient toast; nothing stays next to the cart or the order it concerns. The cart note also says the delivery fee is "calculated at the payment step" — there is no payment step and no fee is charged. | Cart panel/sheet, tracking | `CartPanel.jsx`, `usePlaceOrder.js`, flow captures |

### B — meaningful polish

| # | Finding | Where | Evidence |
|---|---|---|---|
| B1 | A restaurant without a photo is a beige box with a grey initial; with the dev data, five of thirteen cards look unfinished. If all images fail, the grid is a wall of letters. | Home, search | `home-1440-light` |
| B2 | Home stacks two night slabs (hero, then the campaign card) before the first restaurant; the first restaurant starts at y≈770 on desktop and below the fold on the phone. The photo cluster is decorative and not a way in. | Home | `home-1440`, `_home` phone frames |
| B3 | Search matches dish names and descriptions but never shows which dish matched: searching "פיצה" returns the World Cup restaurant with no hint why. | Search | `search-1440-light` |
| B4 | Orders are ten identical bordered cards, ~160 px each, all with the same green "הושלמה" pill; active and past orders are not separated and there is no way back to the restaurant to order again. | Orders | `orders-1440-light` |
| B5 | The tracking stage says the same thing three times (page title, stage eyebrow, stage note) and gives no clock time; "29:59" is a timer, not an arrival time. | Tracking | `tracking-1440`, `flow-*-4tracking` |
| B6 | Restaurant hero: a photo with a floating white card overlapping its bottom; with no photo the card floats over an empty sunken box. | Restaurant | `restaurant-1440`, `restaurant-owner-1440` |
| B7 | The login brand panel is an empty night slab with a decorative radial glow and three check-marked claims; at 1440 the form card floats in the other half with ~250 px of empty space above it. | Login, register | `login-1440-light` |
| B8 | The theme ignores the system preference: a first visit in a dark OS gets the light theme. | All | `ThemeContext.jsx`, verified by emulating `prefers-color-scheme: dark` |

### C — optional refinement

| # | Finding | Where |
|---|---|---|
| C1 | Owner dish rows spread edit/delete across the full row width at 1440, ~900 px from the dish name they act on. | Restaurant (owner) |
| C2 | Quantity steppers use flame-tint circles for both − and +, so "remove" looks like an action to take. | Dish rows, cart |
| C3 | The footer repeats on auth pages and the tracking page, where it is noise. | Login, register, tracking |
| C4 | The desktop cart panel is sticky but its heading can scroll under the top bar when the menu moves focus; its empty state is one grey sentence in a 340 px box. | Restaurant |

## 2. Research: what good food commerce does differently

Taste was run on Wolt's Tel Aviv discovery page and a Tel Aviv venue page (1440×900, he-IL). The venue page loads
behind a sign-in modal and a cookie banner, so its dish grid was measured from the DOM and the uncovered screen edges.
Airbnb's home page was also captured for listing hierarchy, but its listing grid did not render headless; only its
typographic evidence is used. The extracted tokens are research notes and are **not** committed: Better Wolt copies no
layout, colour, logo or component from either product. The principles:

1. **The repeated action whispers.** On a menu the add action repeats 40–80 times; Wolt makes it a 36 px circular `+`
   in a fixed spot (131 nodes at `radius: 50%`, no filled buttons in the dish grid). Name → description → price read as
   one block.
2. **Price is data, not decoration.** `₪ 76.00` at 14 px in the text family, bottom-aligned; the one shape on a row is
   reserved for a different message ("popular").
3. **Display type is a garnish.** The brand display face is on 23 of ~7,600 text nodes (page and section titles).
   Every number is in the reading face.
4. **Sections, not boxes.** A sticky category row and section titles structure long menus; dish cards have a hairline
   and no shadow. Airbnb's surface is the same idea taken further: one face, weights 400/500, 14 px dominant.

Better Wolt's menus have no categories in the API (a product is `{ id, name, description, price }`), so V4 cannot
invent sections. The equivalent move for long menus is an in-menu filter.

## 3. Impeccable critique

⚠️ **DEGRADED: single-context.** The critique's two assessments were started as isolated sub-agents. The detector
assessment (B) finished; the design review (A) was cut off by a usage limit before it returned anything, so A was
redone in the main context. That run had already seen B's output, but B's findings are two rules (below), which is
little to anchor on. Impeccable's own product-context step (PRODUCT.md) was not run: the committed V3 spec and the V4
brief are the product context, and the repository treats committed specs as the source of truth.

### Design health (Nielsen, 0–4)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Skeletons, busy buttons and the tracking stage are good; checkout outcomes vanish with their toast (A5). |
| 2 | Match with the real world | 3 | Hebrew-first copy and counts are right; `₪` renders as letters (A2); the cart promises a payment step that does not exist. |
| 3 | User control and freedom | 3 | Steppers, Esc-closing sheets, focus return. No way to clear a cart in one step. |
| 4 | Consistency and standards | 3 | One token set, one focus ring. The price tag means "price" on dishes and "starting price" on cards. |
| 5 | Error prevention | 3 | Confirmations on destructive owner actions, double-submit guards, stale-response guards. |
| 6 | Recognition rather than recall | 2 | Search does not show the dish that matched (B3); orders don't lead back to the restaurant (B4). |
| 7 | Flexibility and efficiency | 2 | No way to find a dish in a long menu (A3), no reorder, no quick way from an order to the menu. |
| 8 | Aesthetic and minimalist design | 2 | Repeated loud buttons (A1), a bordered card per dish and per order, two stacked night slabs (B2), two stacked floating bars (A4). |
| 9 | Error recovery | 3 | Every route has a retry state; the menu-changed path re-reads and names the missing dish, but only in a toast. |
| 10 | Help and documentation | 2 | Illustrative data is explained only in the footer; nothing explains why a total changed. |
| **Total** | | **26/40** | Solid, not yet distinctive |

### Design-specificity verdict

The identity is specific — warm paper, aubergine ink, pomegranate, Hebrew display type — and a Tel Aviv food product
could not be mistaken for a SaaS dashboard. The *structure* is generic: the component kit applies the same bordered,
rounded card to dishes, orders, the cart and the login form, so every screen has the same rhythm. The identity lives in
colour and one typeface, not in how the screens are composed. V4's job is to move the identity into structure:
menus that read like menus, prices that read like prices, one loud action per screen.

### Deterministic scan (Impeccable detector)

| Scope | Result |
|---|---|
| `web-server/client/src` (CLI, 92 files) | exit 2, **1 finding**: `layout-transition` at `pages/OrderTrackingPage.css:80` — the tracking progress fill animates `width`. Real, low impact; V4 moves it to `transform: scaleX()`. |
| `mobile/src` (CLI, 41 files) | exit 0, no findings. Most rules target CSS/DOM, so this says little about React Native quality. |
| Browser overlay on `/`, a restaurant, `/login`, `/world-cup` (1440, light, signed out; headless, so no overlay was visible to a person) | `cream-palette` on `body` — a **false positive**: `#FBF7F3` is the specified `paper` token (V3 spec §4.1), and the spec rejects the cream + serif + terracotta pattern the rule looks for. `layout-transition` — reported on every page because the dev server loads all CSS; the element exists only on `/tracking/:id`. |

### Persona red flags

- **Hungry regular on a phone** (knows what they want, one thumb): a 20-dish menu is four screens of identical red
  buttons with no filter; after adding, the cart bar and the order pill stack over the menu; searching "פיצה" lands on
  a restaurant with no pizza visible.
- **Careful first-timer** (checks the total before paying): `₪` reads as letters on every total; the cart says a
  delivery fee comes "at payment", then the order is placed with no payment step and no fee; if the server corrects a
  price, the explanation is a toast on the next page.
- **Restaurant owner at a laptop**: edit/delete controls sit ~900 px from the dish they act on; finding one dish in a
  long menu means scrolling.

### Priority issues (P0–P3)

1. **[P1] Menu hierarchy (A1, A3).** Quiet round add action, flat hairline list, in-menu filter above 8 dishes.
2. **[P1] Numbers (A2).** Every price, total, count and time in Rubik with tabular figures; the display face sets words only.
3. **[P1] Checkout feedback (A5).** Inline, persistent messages beside the cart and on the tracking page; honest cart note.
4. **[P2] Phone chrome (A4).** One floating bar at a time.
5. **[P2] Discovery (B1–B3).** Designed no-photo plates, a lighter path to the first restaurant, matched dishes in search.

## 4. After V4 — second pass

Run on `v4/premium-frontend` after the implementation phases, against the same product in the browser.

**Deterministic scan (Impeccable detector):** `web-server/client/src` exit 0, no findings (the tracking
`layout-transition` is gone — the rail fills with `transform`); `mobile/src` exit 0, no findings.

**Design review (single-context, as in §3):**

| # | Heuristic | V3 | V4 | What changed |
|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 4 | Refused orders stay beside the cart; tracking gives a clock time and each stage's time; skeletons keep the page's shape. |
| 2 | Match with the real world | 3 | 4 | `₪1,000,000` reads as money; the cart no longer promises a payment step; days read as היום / אתמול / 22 בספטמבר. |
| 3 | User control and freedom | 3 | 3 | Dismissible checkout messages; still no one-step "clear cart". |
| 4 | Consistency and standards | 3 | 4 | One list language (menu, cart, orders, campaign) on both clients; one add control; one price role. |
| 5 | Error prevention | 3 | 3 | Unchanged and sound. |
| 6 | Recognition rather than recall | 2 | 3 | Search says what matched; orders and tracking lead back to the restaurant; "להזמין שוב" on home. |
| 7 | Flexibility and efficiency | 2 | 3 | Menu filter above eight dishes; reorder in one tap. |
| 8 | Aesthetic and minimalist design | 2 | 3 | One loud thing per screen, one night surface on home, no card-per-row; the plate keeps a photo-less grid designed. |
| 9 | Error recovery | 3 | 4 | The menu-changed path names the removed dish beside the cart; a corrected price is explained on tracking. |
| 10 | Help and documentation | 2 | 2 | Illustrative ratings and ETAs are still explained only in the footer. |
| **Total** | | **26/40** | **33/40** | |

### Status of the findings

| # | Status | Where it was addressed |
|---|---|---|
| A1 | Fixed | Quiet round add control on both clients; flame fills only for the one primary action. |
| A2 | Fixed | Every number in Rubik with tabular figures; `formatPrice` groups thousands. |
| A3 | Fixed | One-surface menu rows; menu filter above eight dishes (both clients). |
| A4 | Fixed | The order dock steps aside whenever a cart has dishes, at every width (it also covered the desktop cart panel). |
| A5 | Fixed | Inline, persistent checkout problems; corrected totals explained on tracking; honest cart note. |
| B1 | Fixed | Id-tinted plates on cards, heroes, thumbnails and the owner's preview. |
| B2 | Fixed | One night band on home; the campaign is an amber strip; hero photos are links. |
| B3 | Fixed | Match notes on search results (both clients). |
| B4 | Fixed | Orders: on the way first, history by day, reorder. |
| B5 | Fixed | Tracking: arrival clock time, stage times, no repeated heading. |
| B6 | Fixed | Name on the photo over a scrim; plate when there is no photo. |
| B7 | Fixed | Auth panel shows food instead of a glow. |
| B8 | Fixed | Theme follows the system until chosen, applied before first paint. |
| C1 | Fixed | Owner tools in the side column; row actions beside the dish. |
| C2 | Fixed | The stepper's − is neutral. |
| C3 | Fixed | No footer on sign-in and registration; tracking keeps it (it leads on to the menu and orders). |
| C4 | Fixed | Sticky carts stretch their column (restaurant and World Cup). |

### Found during V4 QA and fixed

Hostile-but-valid content (created through the API and deleted afterwards) found ungrouped large prices, Latin-first
lines scrambled inside the RTL paragraph (now `unicode-bidi: plaintext`) and a cart button that broke its own label;
200 % text found the delivered stage's word wider than the stage; a slow API found the desktop restaurant skeleton
collapsed to a line; the final screenshots found the order dock over the desktop cart panel. Each is fixed and
recorded in its commit.

### Still open

- Heuristic 10: the illustrative ratings, delivery times and fees are named in the footer note (it used to name only
  the photos), but nowhere next to the numbers themselves.
- On Expo web an unbroken Latin dish name overflows its row; react-native-web does not break inside words and Android
  does. It stays on the device list in V3_IMPLEMENTATION_PLAN.
