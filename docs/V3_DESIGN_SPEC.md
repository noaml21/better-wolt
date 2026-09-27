# Better Wolt V3 — Design Specification

**Status:** built on `v3/ui-overhaul` (branched from V2 HEAD `98d2477`). Never commit to `main` or to `v2/extensible-architecture`.
What was built, in order, and how each phase was verified: [V3_IMPLEMENTATION_PLAN.md](V3_IMPLEMENTATION_PLAN.md).
**Scope:** a complete visual and UX redesign of the **web** and **mobile** clients. The backend, the API contract and the
test suite are unchanged.

This document is authoritative for V3 appearance and interaction. Where it touches anything listed in
[V2_SPEC.md §3](V2_SPEC.md#3-invariants-must-survive-every-phase) or [ARCHITECTURE.md §4](ARCHITECTURE.md#4-api-contract),
those documents win.

## 1. What V3 changes, and what it must not

**V3 changes:** every screen of both clients, the CSS/StyleSheet architecture, the navigation models, component
structure, copy, states (loading/empty/error/success), responsiveness, motion and accessibility.

**V3 must not change** (verified by the existing suites, not by inspection):

- Any request or response shape, status code, or contract error string (ARCHITECTURE §4).
- Server-authoritative pricing: clients still send only `{ restaurant, products: [{ id, quantity }] }` (V2_SPEC §3.1).
- The authorization matrix, including "another user's order is 404, not 403" (V2_SPEC §3.2).
- BF-1…BF-9, the backend feature layout, the Mongoose models, CI, or the Docker setup.
- The World Cup contract: the restaurant is named exactly `חגיגת מונדיאל` and the client dish names equal the seeded
  product names (ARCHITECTURE §6). V3 restyles this feature and changes how it is ordered; it does not rename anything.

Backend changes are out of scope. None are needed for anything in this document.

## 2. Audit of V2 (what the redesign answers)

Taken from the running V2 app (screenshots in `docs/screenshots/v2/`, as JPEGs), not from reading source.

| # | Problem | Where |
|---|---|---|
| A1 | Home lists restaurants as a single column of near-empty white boxes: name + a purple button, no image, no meta. The good `RestaurantCard` component is only used by `/restaurants`, a page hardcoded to one fake restaurant. | `HomePage`, `RestaurantsPage` |
| A2 | Full-viewport hero with a three-stop purple/maroon/blue gradient, a raster logo that already contains the wordmark, and a headline ("פיצה? בדרך אלייך.") unrelated to what the page lists. | `HeroSection` |
| A3 | A video ad floats over the hero at the top-inline-start corner on every page, overlapping content at every width. | `AdsSidebar` |
| A4 | Menu rows overlap: the description, price and "+ הוסף" button collide inside one `space-between` flex row. Dishes have no imagery and no quantity control. | `RestaurantMenu`, `App.css` |
| A5 | The cart is an unstyled box that holds one line **per unit** (adding 3 burgers shows 3 rows), with no steppers and no per-line totals. | `RestaurantPage` |
| A6 | Orders show raw Mongo ids (`הזמנה #6aaf9dea15112dde56dee827`), no items, no thumbnail, and no way to reach tracking. | `OrdersPage` |
| A7 | Search results ignore the card component: a narrow centred stack of name + button, no result count, no empty-state design. | `searchResultPage` |
| A8 | **Zero `@media` queries in the entire web client.** At 390 px the top bar clips the greeting to one letter, the page scrolls horizontally, the cart sits beside the menu, and the floating widgets cover the content. | `App.css` |
| A9 | Owner flows are two raw `<form>`s inside untitled modals; the restaurant-edit modal has no submit button and contains a stray "price" field; the menu manager is a `<ul>` with emoji buttons. | `HomePage`, `RestaurantPage` |
| A10 | World Cup is a mint-green overlay of clip-art tiles over the brand purple, with autoplaying music, `alert()` feedback, broken images, and one-click ordering that bypasses the cart. | `WorldCupFeature` |
| A11 | Accessibility: 0 `aria-*` attributes, 0 `htmlFor` (labels are not tied to inputs), 1 `:focus` rule and 1 `:hover` rule in 711 lines of CSS, 6 `alert()`/`confirm()` calls, no skip link, no `<h1>` on most pages. | web client |
| A12 | 33 hardcoded hex colours and 40 inline `style={{…}}` objects; theme variables (`--wolt-blue`) referenced but never defined; dark mode defines 5 variables and most components ignore them. | web client |
| A13 | Mobile: 15 `StyleSheet.create` blocks repeat the same magic values (`#542163` 24×, `#351440` 32×). No safe-area handling, no `KeyboardAvoidingView`, no `accessibilityLabel`, no `hitSlop`; 32 `Alert.*` calls are the only feedback channel. | `mobile/src` |
| A14 | Mobile navigation is a bare native stack with default English headers, plus a hand-rolled `BottomNavBar` rendered on some screens only. Tab state is lost on every navigation. | `AppNavigator` |

## 3. Visual direction

### 3.1 The idea: *night market*

Better Wolt is an Israeli delivery product. Its world is the Tel Aviv food scene — Levinsky market stalls, hand-painted
Hebrew signage, spice reds and turmeric yellows, food photographed under warm light at night. V3 takes its identity from
that, not from the delivery-app genre: **warm paper surfaces, deep aubergine ink, one hot pomegranate action colour, and
heavy Hebrew display type used at sign scale.**

The product should read as *appetising and fast*, so photography is large and uncropped where possible, type is tight and
confident, and colour is spent on the two things that matter — what you can order, and what it costs.

**Deliberately not:** Wolt's cyan-on-white, the generic SaaS card kit (one radius, one grey shadow, gradient washes),
glassmorphism, neon on near-black, cream + serif + terracotta, or decorative gradients. The V2 purple survives only as the
*ink* neutral, which keeps the existing logo at home.

### 3.2 Principles

1. **Photography is the interface.** A restaurant is its food. Cards lead with the image; chrome stays out of its way.
2. **One loud thing per screen.** Order tracking is the product's showpiece; discovery cards are quiet so the food is loud.
3. **Structure carries meaning.** The notched *price tag* marks prices and promos, and appears nowhere else. Radii vary by
   role instead of being one value on every surface.
4. **Hebrew first.** RTL is the layout, not a patch: logical properties on web, a direction-aware layer on mobile.
5. **Every state is designed.** Loading, empty, error and success are specified per screen, never a bare "Loading…".
6. **Motion answers actions.** One orchestrated sequence (tracking). Everything else is a 120–180 ms response to a tap,
   and all of it stops under `prefers-reduced-motion`.

## 4. Design tokens

Tokens are defined once per client — web `client/src/styles/tokens.css`, mobile `mobile/src/theme/`. No component
hardcodes a colour, radius, shadow or duration.

### 4.1 Colour

Light (default):

| Token | Hex | Use |
|---|---|---|
| `paper` | `#FBF7F3` | App background |
| `surface` | `#FFFFFF` | Cards, sheets, top bar |
| `sunken` | `#F3EDE6` | Inset areas, skeletons, image placeholders |
| `ink` | `#1F1330` | Primary text, dark sections |
| `ink-muted` | `#655B72` | Secondary text, meta |
| `line` | `#E7DFD7` | Borders, dividers |
| `flame` | `#D93A1E` | Primary action **fills**, active states |
| `flame-deep` | `#B82F17` | Flame as **text/icon**, hover/pressed fill |
| `amber` | `#F0A215` | Ratings, promo tags, highlights (ink text on top) |
| `herb` | `#0E7A57` | Success, "delivered", fresh/vegetarian |
| `danger` | `#A61B2B` | Destructive actions and error text |

Dark: `paper #14101E`, `surface #1E1830`, `sunken #171223`, `ink #F6F1EC`, `ink-muted #ABA2B6`, `line #2E2742`,
`flame #FF6A4D`, `amber #FFC24D`, `herb #3BC694`, `danger #FF7A80`. Dark mode is a real theme, not an inversion: every
component reads the same token names.

Two more tokens came out of building the dark theme, and both exist in each client:

| Token | Light | Dark | Use |
|---|---|---|---|
| `night` / `on-night` | `#1F1330` / `#FBF7F3` | `#241A38` / `#F6F1EC` | The one surface that does **not** flip with the theme: the home hero band, the campaign card, the World Cup hero and the tracking stage. `ink` inverts to a bright slab in dark mode, which would put the loudest surface on the page's quietest colour. |
| `on-danger` | `#FFFFFF` | `#14101E` | Text on a `danger` fill. Dark `danger` is a light red, and white on it fails AA. |

**Contrast rules** (measured, WCAG 2.1):

- `white on flame` = 4.59:1 → fills with white text pass AA, so primary buttons are white-on-flame.
- `flame on paper` = 4.31:1 → **fails** AA for body text. Flame-as-text always uses `flame-deep` (5.70:1).
- `ink on amber` = 8.28:1 → amber surfaces always carry ink text, never white.
- `ink-muted on paper` = 5.98:1, `herb on paper` = 5.00:1, `danger on paper` = 7.00:1.
- Dark-theme pairs are all ≥ 6:1.

### 4.2 Type

Web loads two families from Google Fonts:

- **Suez One** — display only: the home headline, section titles, the tracking countdown, price tags. A Hebrew display
  face with the weight of market signage. Never for running text, and never below 20 px except inside the price
  tag, where the face is the motif.
- **Rubik** (300/400/500/600/700) — everything else, Hebrew and Latin.

Mobile uses the **platform UI font** (Roboto / SF) at the same scale and weights. Shipping and loading a display face for
one headline is not worth the startup cost or the native inconsistency; identity on mobile comes from colour, layout and
the logo. This is a deliberate difference, not an omission.

Scale (web rem, mobile pt — same numbers):

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `display-xl` | 56 / 1.04 | 400 Suez | Home headline (desktop) |
| `display-l` | 40 / 1.08 | 400 Suez | Home headline (mobile), tracking countdown |
| `h1` | 32 / 1.15 | 700 | Page titles |
| `h2` | 24 / 1.25 | 700 | Section titles |
| `h3` | 19 / 1.3 | 600 | Card titles, dish names |
| `body-l` | 17 / 1.6 | 400 | Lead paragraphs, dish descriptions |
| `body` | 15 / 1.6 | 400 | Default |
| `caption` | 13 / 1.45 | 500 | Meta rows, labels |
| `micro` | 12 / 1.4 | 600 | Tags, badges |

Hebrew body text gets the 1.6 line-height above; measure is capped at 68 characters.

### 4.3 Space, radius, elevation

- **Space** (4 px base): `1=4 2=8 3=12 4=16 5=20 6=24 7=32 8=40 9=56 10=72 11=96`. Section rhythm on web is `7` inside
  cards, `9` between sections on mobile widths, `10` on desktop.
- **Radius** varies by role, on purpose: `xs 6` (tags, badges) · `sm 10` (buttons, inputs) · `md 14` (cards, menu rows) ·
  `lg 20` (media, sheets, dialogs) · `pill 999` (chips, status, avatars).
- **Elevation**, tinted with the ink hue rather than pure black:
  - `e1 0 1px 2px rgba(31,19,48,.06), 0 1px 1px rgba(31,19,48,.04)` — resting cards.
  - `e2 0 4px 12px rgba(31,19,48,.08)` — hover/raised, sticky bars.
  - `e3 0 12px 28px rgba(31,19,48,.14)` — dialogs, sheets, toasts.
  Cards rest at `e1` and only the discovery grid raises to `e2` on hover. Nothing else carries a shadow.

### 4.4 Interactive states

Every interactive element defines all six: rest, hover (pointer only), focus-visible, active/pressed, disabled, loading.

- **Focus** is one shared treatment: `outline: 2px solid flame-deep; outline-offset: 2px` (dark: `flame`). Never removed,
  never replaced by colour alone. Mobile mirrors it as a 2 px ring on focused inputs.
- **Hover** raises elevation or shifts the fill one step (`flame` → `flame-deep`); it never moves layout.
- **Pressed** is `scale(.98)` on web and `opacity .9 + scale(.98)` on mobile, 120 ms.
- **Disabled** is 45 % opacity with `cursor: not-allowed`, and is never the only signal — the reason is written next to it.
- **Loading** replaces the label with a spinner **at the same size**, so buttons never resize.
- Touch targets are ≥ 44 × 44 on both clients (`hitSlop` on mobile where the visual is smaller).

### 4.5 Motion

| Token | Value | Use |
|---|---|---|
| `fast` | 120 ms | Press, hover, focus |
| `base` | 180 ms | Toggles, toasts, chips |
| `slow` | 320 ms | Dialogs, sheets, page-level reveals |
| `story` | 600 ms | The tracking sequence only |
| `ease` | `cubic-bezier(.2,.8,.3,1)` | Entrances, movement |
| `ease-out` | `cubic-bezier(.4,0,1,1)` | Exits |

`prefers-reduced-motion: reduce` (web) and `AccessibilityInfo.isReduceMotionEnabled` (mobile) drop every transform and
keyframe animation to an instant state change. No scroll-triggered reveals anywhere.

### 4.6 Breakpoints (web)

| Name | Width | Layout |
|---|---|---|
| base | < 600 | One column, sticky bottom cart bar, sheet dialogs, icon-only top bar |
| `sm` | ≥ 600 | Two-column discovery grid |
| `md` | ≥ 900 | Three-column grid; restaurant page keeps one column with a bottom cart bar |
| `lg` | ≥ 1200 | Restaurant page splits into menu + sticky cart panel; top bar shows full search |
| `xl` | ≥ 1440 | Four-column grid, content capped at 1200 px |

## 5. Navigation models

### 5.1 Web

A slim sticky top bar on every page (RTL: brand at the inline-start/right, search in the middle, actions at the
inline-end/left). No full-viewport hero and no floating ad overlay.

| Route | Purpose |
|---|---|
| `/` | Discovery: compact hero band with search, the World Cup campaign card, category chips, restaurant grid |
| `/restaurants` | The full listing with sort/filter (replaces the hardcoded demo page) |
| `/search?q=` | Results with a count, the same cards, and a designed empty state |
| `/restaurant/:id` | Hero, restaurant meta, menu by section, cart panel (`lg`) or bottom bar |
| `/restaurant/:id/manage` | Owner: edit restaurant details and manage the menu (replaces both modals) |
| `/orders` | Order history with status, items, totals and a tracking link |
| `/tracking/:id` | The active-order showpiece |
| `/world-cup` | The campaign as a real page (replaces the overlay) |
| `/login`, `/register` | Split layout: form beside a brand panel |
| `*` | Designed 404 |

The active-order widget is a single docked pill at the inline-end/bottom that never overlaps the cart panel. It stays a
pill at every width rather than collapsing into the top bar below `md` as this section first planned: the pill is
already the collapsed form, and moving it into the top bar would mean lifting the order fetch into shared state that
nothing else needs. What the pill must not do is hide anything permanently, so while it is shown the page and the
footer both reserve room for it (`body.bw-has-dock`), the same arrangement the cart bar uses.

### 5.2 Mobile

Signed out: a stack of `Login` / `Register`.
Signed in: **bottom tabs** (`@react-navigation/bottom-tabs`, custom `tabBar` for RTL order and styling) —
**בית · חיפוש · הזמנות · עגלה** (cart shows an item-count badge) — with `RestaurantDetails`, `WorldCup`, `Tracking`,
`RestaurantForm` and `ProductForm` pushed onto a stack above the tabs.

Native headers are off (`headerShown: false`); every screen uses one `ScreenHeader` component so the back affordance,
title and actions sit correctly for Hebrew. `SafeAreaProvider` + `useSafeAreaInsets` handle notches and gesture bars;
`KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"` wrap every form. `Alert` is replaced by an in-app toast
for feedback and kept **only** for destructive confirmations.

RTL on mobile is handled by the theme (`row-reverse` helpers, `textAlign: 'right'`, `writingDirection: 'rtl'`), not by
`I18nManager.forceRTL`, which needs a native restart to take effect and would break the first launch.

## 6. Component language

Shared vocabulary; each client implements it idiomatically (web: `components/ui/*.jsx` + CSS modules of tokens; mobile:
`src/ui/*.js` reading `src/theme`).

`Button` (primary · secondary · ghost · danger; sm/md/lg; loading, disabled, icon) · `IconButton` · `Field`
(label tied to input, hint, error, required) · `Chip` · `Tag` (the notched price/promo tag) · `Card` · `RestaurantCard` ·
`DishRow` · `QuantityStepper` · `StatusPill` · `Rating` · `Avatar` · `Skeleton` · `EmptyState` · `ErrorState` ·
`Toast` (stacked, `role="status"`) · `Dialog` (focus trap, Esc, restores focus) / `Sheet` on mobile widths ·
`SectionHeader` · `TabBar` (mobile) · `ScreenHeader` (mobile).

### 6.1 States, per surface

| State | Treatment |
|---|---|
| Loading a list | Skeleton cards in the real grid shape (never a centred spinner replacing the page) |
| Loading an action | In-button spinner, label hidden, size fixed |
| Empty (no restaurants / no results / empty cart / no orders) | Title, one sentence of direction, and the action that fixes it |
| Error | What failed, in the interface's voice, plus **נסו שוב** that re-runs the request. Server contract strings are shown as-is |
| Success | Toast, 3 s, `role="status"`, stacked, dismissible, paused under reduced motion |

Copy is Hebrew, sentence case, active voice, no apologies, no exclamation marks except the one delivery moment. Buttons
name their outcome (`בצעו הזמנה` → toast `ההזמנה נשלחה`).

## 7. Accessibility requirements

- Keyboard: every action reachable and operable; a skip link to `<main>`; dialogs trap focus, close on Esc and restore
  focus to the opener; the cart panel and menus are reachable in DOM order.
- One `<h1>` per page, correct heading order, `<nav>/<main>/<footer>` landmarks, lists marked up as lists.
- All inputs have a `<label htmlFor>`; errors are tied with `aria-describedby` and announced via `role="alert"`.
- Images carry meaningful `alt`; decorative images use `alt=""`; icon-only buttons carry `aria-label`.
- Contrast meets the rules in §4.1; focus-visible is never suppressed; colour is never the only signal.
- Mobile: `accessibilityRole`/`accessibilityLabel`/`accessibilityState` on every touchable, ≥ 44 pt targets, and text that
  survives OS font scaling.
- Verified per phase with a keyboard pass and the `design:accessibility-review` checklist; not claimed without a run.

## 8. Decision log

| Date | Decision |
|---|---|
| 2026-09-20 | V3 is client-only. No backend, schema, contract or test changes; the API suite is the regression net. |
| 2026-09-20 | Identity is "night market": warm paper, aubergine ink, pomegranate `flame`, amber highlight. The V2 purple stays only as the ink neutral so the existing logo still fits. |
| 2026-09-20 | Web type is Suez One (display) + Rubik (UI). Mobile uses the platform font at the same scale — no font assets, no `expo-font`, no startup cost. |
| 2026-09-20 | Flame fails AA as small text on paper (4.31:1), so flame-as-text is always `flame-deep`. Recorded because it constrains every component. |
| 2026-09-20 | World Cup moves from an autoplaying overlay to `/world-cup` and orders through the normal cart. Names stay exactly as seeded (ARCHITECTURE §6). |
| 2026-09-20 | Mobile gains `@react-navigation/bottom-tabs` (the only new runtime dependency). Tabs are the product's navigation model; a hand-rolled bar loses per-tab state. |
| 2026-09-20 | Mobile RTL is done in the theme layer, not `I18nManager.forceRTL`, which requires a native restart. |
| 2026-09-20 | Web cart gains quantity steppers. The request body still carries only ids and quantities, so pricing stays server-authoritative. |
| 2026-09-20 | `night`/`on-night` and `on-danger` added (§4.1) after looking at the dark theme: `ink` as a background inverts, which broke the hero, the auth panel and the campaign, and white on dark `danger` fails AA. |
| 2026-09-20 | Mobile gets no audio. The web campaign plays `public/music.mp3` on request; matching it on mobile means an audio dependency and a 3.7 MB asset in the app bundle for one jingle. |
| 2026-09-20 | The mobile restaurant form picks a photo from the gallery, but refuses one over ~90 KB and points at the URL field. Only `POST /api/users` parses a large body; everything else is on Express's 100 KB default (README, "Security / Backend Design"). |
| 2026-09-20 | Mobile is inspected through Expo's web target (`react-dom`, `react-native-web`, `@expo/metro-runtime` as devDependencies): this environment has no Android emulator. What that cannot check is listed in the plan. |
