# Better Wolt V4 — Implementation Plan and Progress

Branch `v4/premium-frontend`, created from the verified V3 HEAD `b54776352bae152502ad9a0a2b6c94946ab8ece3` (local and
`origin/v3/ui-overhaul` agreed). Design: [V4_DESIGN_SPEC.md](V4_DESIGN_SPEC.md). Evidence:
[V4_VISUAL_AUDIT.md](V4_VISUAL_AUDIT.md). Contract that must not move: [ARCHITECTURE.md §4](ARCHITECTURE.md#4-api-contract),
[V2_SPEC.md §3](V2_SPEC.md#3-invariants-must-survive-every-phase).

**This file is the resume point.** A fresh session reads the checklist, runs the verification below, and continues
from the first unchecked box.

## Progress

- [x] **V4.0 — Audit.** Git reconciled, branch created, V3 walked in the browser (112 captures + flows), findings
      A1–A5 / B1–B8 / C1–C4 recorded.
- [x] **V4.1 — Research.** Taste on Wolt (discovery + venue); principles in the audit §2, tokens not committed.
- [x] **V4.2 — Impeccable critique.** Detector + design review (degraded, see audit §3).
- [x] **V4.3 — Spec.** This plan, the design spec, the audit.
- [x] **V4.4a — Web foundations.** `.bw-num` role; every price, total and tag in Rubik with tabular figures (the
      tracking countdown moves with V4.4d); themed selection, caret, accent and scrollbar; the theme follows the system
      until chosen, applied before first paint; `.playwright-mcp/` ignored.
- [x] **V4.4b — Web restaurant.** Name on the photo over a scrim (plate tint when there is no photo), facts on the
      page with a `tel:` link, one hairline-divided menu surface, a 40 px round add control (48 px hit area) and a
      neutral −/tinted + stepper, in-cart count on the dish name, a menu filter above 8 dishes, and the owner's tools
      in the side column (a toolbar above the menu below 1100 px). Focus hand-off add ↔ stepper re-verified by
      keyboard.
- [x] **V4.4c — Web cart and checkout.** Cart names its restaurant, says the price is set when the order is placed
      (no more "fee at the payment step"), carries the total in its CTA, and keeps a refused order's reason beside
      itself (`usePlaceOrder().problem`, dismissible, cleared on retry or account change). A total the server
      corrected is handed to tracking in navigation state and explained there. The order dock hides while the cart
      bar is up. Verified with the order endpoint intercepted (500, menu-changed 404, corrected total). Web Jest 29.
- [x] **V4.4d — Web tracking.** The big number is the arrival clock time (Rubik, tabular) with "עוד N דק׳" under
      it; four stops with the time each begins, vertical on phones and horizontal from 600 px; each segment fills on
      its own through `transform` (detector clean again); the current stop's halo is decorative and stops under
      reduced motion; the receipt is one surface; "להזמין שוב" leads back to the restaurant. Stages checked by
      intercepting `GET /orders/:id` at 5, 21 and 32 minutes, light and dark, 1440 and 390.
- [x] **V4.4e — Web orders.** "בדרך אליכם" on a night row with the arrival time; history grouped by day
      (היום / אתמול / "22 בספטמבר"), each day one hairline list; every past order has "פרטים" (its receipt on the
      tracking page) and "להזמין שוב". The dock no longer repeats itself on `/orders`, and it is painted `night`
      (it turned into a pale pill in dark mode).
- [x] **V4.4f — Web discovery.** Cards use the plate when there is no photo, a Rubik "מנות מ-₪…" label, and hover
      zooms the photo without moving the card; the hero loses its decorative glow and its three photos become captioned
      links to their restaurants; the campaign is an amber strip with a flag row (no eyebrow label); signed-in
      customers get "להזמין שוב" from their own orders (one extra `GET /orders`, account-guarded, silent on failure);
      search results say which dish, description or address matched, with the text marked.
- [x] **V4.4g — Web auth, World Cup, 404.** The auth panel shows three restaurant photos (fetched only where the
      panel is visible, ≥ 900 px) instead of a radial glow, and the form card loses its shadow. `/world-cup` loses its
      eyebrow, states the flat price once, and lists the 20 dishes as one hairline surface (two columns from 700 px)
      with the quiet add control; its desktop cart now actually sticks (the column was not stretched). 404 checked.
- [x] **V4.5 — Mobile.** The same moves, natively: one-surface dish rows with a shared quiet `AddButton` and neutral
      −; name on the photo over an SVG scrim (react-native-svg, already a dependency) with the plate as fallback;
      `type.num`/`type.price`; cards with plates; amber campaign strip; search match notes; cart with the total in its
      CTA, honest note and inline problems; tracking with the arrival time and a vertical four-stop timeline; orders
      grouped by day with reorder; "להזמין שוב" on Home; the World Cup list as one surface. Verified on Expo web at
      412×915 (light and dark) and by Android export; not on a device.
- [x] **V4.6 — Motion.** Spec §7 on both clients.
  - [x] Web: `find-animation-opportunities` sweep (5 kept, 5 rejected: skeleton crossfade, menu-filter results,
        sliding quantity digits, staggered grid, route transitions). Implemented: cart bar rises from its edge
        (260 ms, `--bw-ease-drawer`), count badges bump on change (keyed remount, 200 ms), stepper and dish count pop
        in (160 ms), toasts leave the way they came (150 ms), desktop cart lines and checkout problems rise in (180 ms).
        Sampled in Chrome: the bar is settled by ~150 ms; with reduced motion nothing animates.
  - [x] Mobile: the cart bar rises from its edge and its count bumps (`Animated`, native driver), the current
        tracking stop breathes, pressed controls scale to 0.94 — all skipped under the OS reduce-motion setting.
  - [x] `improve-animations` audit (quick effort, inline): the toast exit was on `--bw-ease-out`, which is an ease-in
        curve in V3's tokens → moved to `--bw-ease`; phone sheets now slide on `--bw-ease-drawer` at 300 ms. Not
        reported, by design: instant reduced motion (V3 decision), the 600 ms tracking fill, the hover-only photo zoom.
        No `scale(0)`, `transition: all` or animated layout properties remain (the tracking `width` fill is gone).
  - [ ] `/review-animations` is reserved for explicit user invocation and was not run by the agent.
- [x] **V4.7 — QA and evidence.**
  - Responsive sweep: 14 routes × 6 widths (320–1920) × 2 themes, 168 captures — no overflow, no console errors.
  - Hostile content through the API (63-character name, unbroken Latin, ₪1,000,000 and ₪0, mixed direction with
    emoji, dead image, 40 dishes), deleted afterwards: fixed thousands grouping, plaintext bidi, the cart button.
  - Slow (4 s) and failing (500) API, 200 % text on five routes at 390 and 1440: fixed the desktop skeleton and the
    delivered stage's word.
  - Keyboard: add → stepper → add focus hand-off, focus rings on the new controls.
  - Functional smoke through the UI: signed-out redirect and return, a customer order and a World Cup order to
    tracking (server-priced ₪124 and ₪30), owner create → add dish → edit price → delete dish → close, a 401 signing
    out to `/login` with the session-ended notice.
  - Second Impeccable pass: detector clean on both clients; design review 26/40 → 33/40 (audit §4).
  - Screenshots: `docs/screenshots/v4/` — 13 web (1440×950 and 390×844) and 9 mobile (Expo web, 412×915 at 2×,
    scaled to 720 px). README and AGENTS.md point at V4.

**V4 is complete.** What remains open is listed in the audit §4 ("Still open") and under "Needs a device" below.

## Verification at the end of V4

API 144/144 (no backend file changed since `b547763`), web Jest 38/38 (from 25: order-placement problems and price
corrections, stage arithmetic, day labels, search match notes, price formatting), `eslint --ext .js,.jsx` clean,
`CI=true npm run build` green (+3.5 kB JS, +2.6 kB CSS gzipped over V3), mobile `expo lint` at its two documented
findings, Android export green (991 modules), Impeccable detector clean on both clients.

## Needs a device

Everything in V3_IMPLEMENTATION_PLAN "Needs a device" still applies. V4 adds:

- The cart bar's rise and count bump, the tracking halo and the pressed scales run on the native driver; their feel
  (and that reduce-motion stops them) was checked only on Expo web.
- The restaurant hero's SVG scrim (react-native-svg) was verified on Expo web; confirm it covers the photo edge to
  edge on Android.
- The menu filter's `TextInput` with a real soft keyboard (the list keeps taps with `keyboardShouldPersistTaps`).

## Verification (before every commit that touches code)

```bash
cd web-server && npm run test:db:up && npm test && npm run test:db:down   # API: 144/144 at the V3 baseline
cd web-server/client && npm test -- --watchAll=false                      # web Jest: 25/25 at the V3 baseline
npx eslint --ext .js,.jsx src && CI=true npm run build                    # lint gate (plain `eslint src` skips .jsx)
cd mobile && npm run lint && npx expo export --platform android           # lint: two documented findings at baseline
```

Visual loop for web work (the brief's rule: a screen is not done because it compiles): the dev stack from
V3_IMPLEMENTATION_PLAN "Verification", then the Playwright capture scripts described under "Tooling" below at 1440,
1024, 768 and 390, light and dark, reading every capture.

## Tooling used for visual QA

Captures are driven by small Node scripts on top of the Playwright library that ships with `@playwright/cli`
(`chromium.launch({ channel: 'chrome' })`), signing in by writing the API's login response into `localStorage` —
the same keys the web client uses. They live in the session scratchpad, not in the repo; the recipe is: log in through
`POST /api/tokens`, `addInitScript` to set `token`, `user` and `theme`, visit each route at each width, record
`scrollWidth - innerWidth` (overflow) and console errors, and screenshot.

## Notes for the next session

- Demo data: `docs/dev/demo-data.mjs` (customer `noam`/`noampass1`, owner `chef`/`chefpass1`). The dev DB also holds
  V3 test residue (`Smoke mu…`, `dfsf`); it is left alone and doubles as no-photo test data.
- No Android emulator exists in this environment; mobile is inspected through Expo web and labelled as such. The
  "Needs a device" list in V3_IMPLEMENTATION_PLAN still applies.
