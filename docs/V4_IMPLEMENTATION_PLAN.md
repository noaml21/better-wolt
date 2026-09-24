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
- [ ] **V4.4e — Web orders.** Active/past sections, rows in one surface, dates in words, reorder.
- [ ] **V4.4f — Web discovery.** Plates on cards, hero compaction, campaign strip, "להזמין שוב" row, search shows the
      matched dish.
- [ ] **V4.4g — Web auth, World Cup, 404.** Brand panel, campaign page on the new rows.
- [ ] **V4.5 — Mobile.** Same moves idiomatically: dish rows + add control, price type, cart CTA with total, orders
      sections, tracking arrival time, plates, campaign card.
- [ ] **V4.6 — Motion.** Spec §7 on both clients; review-animations pass.
- [ ] **V4.7 — QA and evidence.** Responsive sweep, dark, reduced motion, keyboard, long/mixed content, failed images,
      slow/failed API; second Impeccable pass; screenshots in `docs/screenshots/v4/`; docs and README updated.

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
