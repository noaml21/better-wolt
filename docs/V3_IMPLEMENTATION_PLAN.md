# Better Wolt V3 — Implementation Plan and Progress

Branch `v3/ui-overhaul`, created from the verified V2 HEAD `98d24771fda44523eac31e77ec850222b4c03f63`.
Design decisions and tokens: [V3_DESIGN_SPEC.md](V3_DESIGN_SPEC.md). Contract that must not move:
[ARCHITECTURE.md §4](ARCHITECTURE.md#4-api-contract), [V2_SPEC.md §3](V2_SPEC.md#3-invariants-must-survive-every-phase).

**This file is the resume point.** Any session can read the checklist, run the verification commands, and continue from
the first unchecked box without conversation history.

## Progress

- [x] **Phase 0 — Audit.** V2 HEAD verified, branch created, both clients read, the stack run, the web UI walked with
      Playwright at 1440×900 and 390×844, findings recorded as A1–A14 in the design spec, spec and plan written.
- [x] **Phase 1 — Web foundations.** Tokens, type, reset, RTL shell, `components/ui` primitives, top bar, toasts, 404.
- [x] **Phase 2 — Web discovery.** Home, restaurant cards, listing, search, sponsored slot, skeletons and empty states.
- [x] **Phase 3 — Web restaurant, cart and orders.** Restaurant page, menu, cart with steppers, checkout, orders, tracking.
- [x] **Phase 4 — Web auth and owner flows.** Login, register, restaurant create/edit, menu management, role states.
- [x] **Phase 5 — Mobile foundations.** Theme, `src/ui` primitives, tab navigation, screen header, safe areas, toasts.
- [x] **Phase 6 — Mobile customer flows.** Home, search, restaurant details, cart, orders, tracking.
- [x] **Phase 7 — Mobile owner flows and World Cup.** Restaurant/product forms, the campaign on both clients.
- [x] **Phase 8 — Polish and QA.** Responsive sweep, accessibility pass, motion/reduced-motion, dark theme, final
      verification and screenshots.

**V3 is complete.** The checklist above is the resume point if work continues; what a device still has to confirm is
under "Needs a device" below.

## Verification (run before every commit)

```bash
# API — must stay green and untouched
cd web-server && npm run test:db:up && npm test && npm run test:db:down

# Web
cd web-server/client && npm test -- --watchAll=false
CI=true npm run build            # CI treats lint warnings as errors

# Mobile
cd mobile && npx expo export --platform android
```

Live inspection (the plan's own requirement — a screen is not done because it compiles):

```bash
docker compose up -d mongo
cd web-server && JWT_SECRET=<dev-secret> MONGODB_URI=mongodb://127.0.0.1:27017/better_wolt node server.js
cd web-server/client && BROWSER=none npm start          # http://localhost:3000
playwright-cli open http://localhost:3000               # walk the flow, screenshot, read the console
```

Demo data for visual work is created through the public API by `docs/dev/demo-data.mjs`
(customer `noam` / `noampass1`, owner `chef` / `chefpass1`). It never writes to MongoDB directly.

## Phase detail

### Phase 1 — Web foundations
`client/src/styles/`: `tokens.css` (§4 of the spec), `base.css` (reset, RTL, focus-visible, reduced motion, font
loading), and per-component CSS. `components/ui/`: `Button`, `IconButton`, `Field`, `Chip`, `Tag`, `Card`, `StatusPill`,
`Rating`, `Skeleton`, `EmptyState`, `ErrorState`, `Spinner`, `Dialog`, `Toast` + `ToastProvider`, `SectionHeader`.
App shell: `<html dir="rtl" lang="he">`, real `<title>`/meta/manifest, skip link, `TopBar`, `AppFooter`, 404 route.
Exit: primitives render in the app, `App.css` no longer holds page styles, build and Jest green.

### Phase 2 — Web discovery
`HomePage` (hero band with search + campaign card, category chips, grid), `RestaurantCard` (image, name, rating, ETA,
fee, promo tag), `RestaurantsPage` (real listing, sort), `SearchResultsPage` (count, cards, empty state), the sponsored
slot as a placed card instead of a floating overlay. Skeletons for every list.
Exit: discovery works at 390 / 768 / 1024 / 1440 with screenshots at each.

### Phase 3 — Web restaurant, cart and orders
`RestaurantPage` split into `RestaurantHero`, `MenuSection`, `DishRow`, `CartPanel` (desktop) / `CartBar` + `CartSheet`
(mobile). Cart holds one line per product with a `QuantityStepper`; the order body stays `{ id, quantity }`.
`OrdersPage` cards with thumbnail, status, items and a tracking link; `OrderTrackingPage` as the showpiece (stepped
rail, countdown, one 600 ms sequence, reduced-motion fallback). `ActiveOrderWidget` docked, never overlapping.
Exit: place an order end-to-end in the browser, land on tracking, see it in history.

### Phase 4 — Web auth and owner flows
`LoginPage` / `RegisterPage` as a split layout with tied labels, inline validation, `aria-describedby`, and the server's
contract strings shown verbatim. Owner management happens **on the restaurant page itself** rather than at a separate
`/restaurant/:id/manage` route (the plan's original idea): the owner sees edit/delete on the hero and add/edit/delete on
each dish, so the menu is managed where it is read and there is no second copy of it to keep in sync.
Exit: register → create restaurant → add dishes → order from another account.

### Phase 5 — Mobile foundations
`mobile/src/theme/` (colors, type, space, radius, shadow, motion, rtl helpers), `mobile/src/ui/` mirroring the web
primitives, `SafeAreaProvider`, `ScreenHeader`, bottom `TabBar` with a cart badge, `ToastProvider` replacing `Alert` for
non-destructive feedback.
Exit: `npx expo export --platform android` green; navigation model in place with the old `BottomNavBar` deleted.

### Phase 6 — Mobile customer flows
Home (search entry, campaign card, restaurant list), Search, Restaurant details (hero, menu, sticky add-to-cart),
Cart (steppers, summary, place order), Orders, Tracking. `KeyboardAvoidingView` on every form.

Phases 5 and 6 landed as one commit: the new navigator refers to the rebuilt screens and the rebuilt screens refer to
the new primitives, so neither half compiles alone. Built as described, plus:

- `CartContext` holds one line per product with a quantity (V2 pushed one entry per unit) and is one piece of state, so
  switching restaurants is a single replayable update. The order body is still `{ id, quantity }` only.
- `Logo` is the drawn price-tag mark from the web client, ported to `react-native-svg`. The 1 MB raster
  `assets/Logo.png` it replaced is deleted — nothing referenced it, and it was riding along in the Android bundle.
- Hebrew counting helpers (`dishCount`, `itemCount`, `orderCount`, `resultCount`) — "1 מנות" is not Hebrew.
- `formatOrderNumber` wraps the number in Unicode isolates; the web does the same job with `unicode-bidi: isolate`.
- Home's greeting shows the account name only: the login response carries no address (ARCHITECTURE §4.3).
- Inputs draw the focus ring that §4.4 asks for, and `Skeleton` stops pulsing under `useReducedMotion()`.

### Phase 7 — Mobile owner flows and World Cup
`RestaurantFormScreen` and `ProductFormScreen` rebuilt on the primitives with image picking and validation.
`/world-cup` (web) and `WorldCupScreen` (mobile) as a designed campaign: flag grid, opt-in sound, cart-based ordering.
Dish names and the restaurant name stay exactly as seeded. Built as described, plus:

- The restaurant form picks a photo from the gallery and sends it inline, but refuses one over ~90 KB with a way out
  (paste a link). Only `POST /api/users` parses a large body; everything else is on Express's 100 KB default, so an
  oversized photo would come back as a 413 with no explanation.
- The campaign's flat price is read back from the products, not written into either client.
- Web `/world-cup` plays the existing `public/music.mp3` **on request only** and stops it when the page is left. The
  mobile screen has no audio: an audio dependency plus a 3.7 MB asset in the app bundle is not worth a jingle.
- Both campaign screens share the ordinary cart, so the campaign is no longer a one-tap path around it.
- The mobile cart is emptied when the signed-in account changes; it used to survive a sign-out.

### Phase 8 — Polish and QA
Responsive sweep at 390/768/1024/1440/1920, keyboard pass, contrast check, dark theme across both clients, motion
review with reduced motion forced, console-error check on every route, final screenshots into `docs/screenshots/v3/`,
README updated.

What the pass actually ran, and what it found:

- **Responsive sweep.** Nine web routes × five widths (390 / 768 / 1024 / 1440 / 1920), driven with Playwright:
  **zero console errors and zero horizontal overflow** anywhere.
- **Keyboard.** Tabbing through the home page: the skip link comes first and every control takes the shared
  `2px solid flame-deep` ring. Three inputs were suppressing it (`outline: none` in `Field`, the hero search and the
  top-bar search) — the field keeps its border-and-halo emphasis, and the two search pills now take the ring on the
  wrapper with `:focus-within`.
- **Dark theme.** Two real bugs, both from a surface that reads `--bw-ink` as a *background*: in dark mode `ink` is a
  light colour, so the home hero and the auth brand panel turned into pale slabs with white text on them. Fixed with the
  `night` token (spec §4.1), applied to the hero, the auth panel, the campaign card, the World Cup hero and the tracking
  stage, on both clients. Error toasts were white-on-light-red in dark mode; they now use `on-danger`.
- **Reduced motion.** With `prefers-reduced-motion: reduce` forced, the tracking page has **no** element left with a
  non-zero transition or animation duration. On mobile the same switch is `useReducedMotion()` (skeletons stop pulsing,
  the tracking rider is placed rather than animated).
- **Images are allowed to fail.** Every photograph in the product comes from somewhere else — restaurant images are
  URLs an owner typed, the campaign flags come from a CDN. With `images.unsplash.com` and `flagcdn.com` blocked in the
  browser, the home hero showed three broken-image frames, every campaign row showed an empty box, and a restaurant
  page showed a blank hero. Both clients now share a `Media` component that hands over to a fallback — the restaurant's
  initial, the campaign's mark, or nothing — and the home photo cluster drops to the next candidate photo, hiding
  itself only when fewer than three survive. Re-verified with both CDNs blocked.
- **Searches can overtake each other.** Reproduced in the browser by answering the first search after three seconds
  and the second immediately: the stale answer landed last and filled the list with results that did not match the
  heading above them. Both search screens and the web restaurant page now keep a request counter and let only the
  newest request write; re-running the same reproduction leaves the current results in place.
- **The docked order pill covered what was under it.** Measured at 390: it correctly clears the cart bar, but the end of
  a page and the whole footer sat underneath it, so the footer's links could not be reached while an order was on its
  way. The page and the footer now reserve room while the pill is shown. The spec's original plan to collapse the pill
  into the top bar below `md` is recorded as dropped, with the reason (§5.1).
- **One long name broke the grid for everyone.** A restaurant whose name has no break opportunity made every column in
  the discovery grid as wide as that name — at 390 the page scrolled sideways by 150 px, which is finding A8 of the V2
  audit returning. The columns are `minmax(0, 1fr)` now, so they may shrink below their content and the card's ellipsis
  does its job; the campaign grid's `minmax(280px, 1fr)` became `minmax(min(280px, 100%), 1fr)` for the same reason.
  Verified by creating a restaurant with a very long name and dish description, checking both clients at 390 and 1440,
  and deleting it again.
- **Flows walked end to end.** Web: sign in → home → restaurant → cart → order → tracking → orders → search, plus
  `/world-cup` from add-to-cart to the tracking page, plus the signed-out guard (toast + redirect to `/login`).
  Mobile: the same customer flow in a Pixel 7 viewport, the owner's restaurant and dish forms, and the campaign screen.
- **Copy and RTL fixes found by looking, not by reading code:** "1 מנות" (Hebrew has no "1 items"), the order number's
  `#` drifting to the wrong end of a Hebrew line, a greeting that promised an address the login response does not
  return, a cart that survived a sign-out, and the owner's "new restaurant" button squeezing the section heading at
  phone width.

## Needs a device

Inspected through Expo's web target, so these are the parts a real Android device or emulator still has to confirm:

- `KeyboardAvoidingView` behaviour with a real soft keyboard (login, registration, both owner forms).
- Safe-area insets on a notched device and a gesture-bar device: on the web target every inset is `0`, so the padding is
  present in the code but was never exercised. `Screen` pays the top inset, and the tab bar, the cart bar and the toast
  pay the bottom one.
- `expo-image-picker`: permission prompts and the gallery itself (the ~90 KB guard in the restaurant form is code-level).
- `Alert` dialogs for destructive confirmations (they render as browser dialogs on the web target).
- Native scroll and overscroll behaviour, and `RefreshControl` pull-to-refresh on Home and Orders.
- Platform fonts: the type scale is the platform UI font, which is Roboto on Android rather than the browser's default.

## Linting the mobile app

The mobile client had no linter; it now uses Expo's own setup (`npm run lint` → `expo lint`, with
`eslint-config-expo`). It earns its place: on the first run it found a stale import, a `useMemo` whose dependency was
rebuilt on every render, and three components reading `ref.current` during render.

Three `react-hooks/set-state-in-effect` findings remain, and they are deliberate rather than unexamined:

- `HomeScreen` and `TrackingScreen` — `useEffect(() => { load(); }, [load])`, where `load` sets `status` to `loading`
  before it awaits. This is data fetching, not derived state. Removing the setState means either dropping the loading
  state on a retry or leaving stale content on screen while the next request runs; both are worse than the warning, and
  the alternative is a data-fetching library, which V3 is not adding.
- `SearchResultsScreen` — copies a query handed over by Home (`route.params.query`) into the field's state, runs it, and
  clears the param. That one really is a prop-to-state sync, but the term has to land in an editable field and the
  search itself is a request, so it cannot move into render. It is guarded by a ref so clearing the param cannot
  re-trigger it, and the behaviour is verified in the browser.

## Looking at the mobile app

There is no Android emulator in this environment (`~/Android/Sdk` has no `emulator` package and no AVDs), so the mobile
screens are inspected through Expo's web target, which renders the same React Native tree via `react-native-web`:

```bash
cd mobile && BROWSER=none EXPO_PUBLIC_API_URL=http://localhost:8080/api npx expo start --web --port 8082
# the API must allow the origin. Keep :8080 in the list — the CRA dev server proxies /api with
# changeOrigin, so requests from :3000 arrive with the API's own origin on them:
cd web-server && JWT_SECRET=<dev-secret> \
  CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8082 node server.js
playwright-cli open --device="Pixel 7" http://localhost:8082
```

`react-dom`, `react-native-web` and `@expo/metro-runtime` are **devDependencies** for exactly this reason; the Android
bundle does not contain them. What this cannot check is listed under "Needs a device" above.

## Notes for the next session

- The V2 screenshots used for the audit are in `docs/screenshots/v2/`; V3 shots go in `docs/screenshots/v3/`.
- The local dev database contained leftover `Smoke mu…` restaurants from an earlier smoke-test run against the dev DB.
  They are test residue, not seeded data; they are ignored, not deleted — which is why they appear in the home-page
  screenshots next to the demo restaurants.
- The final screenshots in `docs/screenshots/v3/` are JPEGs: web at 1440×950 and 390×844, mobile from a Pixel 7
  viewport scaled to 720 px wide.
- Node here is v22 (`.nvmrc` pins 24; `engines` allows ≥ 22). Both are fine for the client build.
