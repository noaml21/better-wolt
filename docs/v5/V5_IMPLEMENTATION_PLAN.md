# Better Wolt V5 — Implementation Plan and Progress

Branch `v5/visual-reinvention`, created from the verified V4 HEAD `b500a211e51940c197067cf80a0c90d5da5a3337` (local and
`origin/v4/premium-frontend` agreed; V4's exact-SHA CI green). Design: [V5_DESIGN_SPEC.md](V5_DESIGN_SPEC.md).
Contract that must not move: [ARCHITECTURE.md §4](../ARCHITECTURE.md), [V2_SPEC.md §3](../V2_SPEC.md).

**This file is the resume point.** A fresh session reads it, runs the verification below, and continues from the first
unchecked box. Never merge into `main` or touch the V2–V4 branches.

## Progress

- [x] **V5.0 — Reconcile.** Local = origin at `b500a21`; `v5/visual-reinvention` created and pushed. The untracked
      `.github/hooks/` (a local Impeccable hook) is the user's and is left alone.
- [x] **V5.1 — Product record.** `PRODUCT.md` via Impeccable `init` (three answers from the user: showcase that works;
      the name and Hebrew-first RTL are binding, everything else free; fonts are the only new dependency).
- [x] **V5.2 — Research.** Taste on nine non-delivery sites; principles in V5_VISUAL_RESEARCH.md; Impeccable direction
      roll `186e194c`.
- [x] **V5.3 — Three concepts.** `docs/v5/concepts/` (A Screening, B Line, C White City), captured at five widths.
- [x] **V5.4 — Critique and choice.** Dual-agent Impeccable critique; **B Line** chosen (V5_CONCEPTS.md).
- [x] **V5.5 — Spec.** V5_DESIGN_SPEC.md, this plan, V5_VISUAL_AUDIT.md.
- [x] **V5.6 — Web foundations.** `tokens.css` rewritten for the Line system (both themes, line palette with checked
      pairs), `base.css` (focus, selection, scrollbar, `.bw-num`, range isolation), fonts in `public/index.html`,
      `services/lines.js` (line colour + number from the id), UI primitives restyled: Button, IconButton, Field,
      Dialog, Toast, Feedback, Skeleton, QuantityStepper, Labels, Plate → line plate, Media.
- [x] **V5.7 — Shell.** TopBar (wordmark, nav blocks, search), the LED strip replacing `ActiveOrderWidget`'s floating
      dock, footer.
- [x] **V5.8 — Home and discovery.** Title + search, order-again line chips, the departures board (`BoardRow`), the
      World Cup special line, sponsored slot, all-restaurants page, loading/empty/error.
- [x] **V5.9 — Restaurant.** Header (photo panel + line block, owner-neutral mode), route menu (`StopRow`), menu
      filter, ticket (desktop column, phone bar + sheet with close), owner toolbar and stop actions.
- [x] **V5.10 — Checkout states.** Inline problems on the ticket, price corrections on tracking, cross-restaurant cart,
      account switch — re-verified with intercepted responses.
- [x] **V5.11 — Search.** Title, field, board results with the matched dish, no-result state.
- [x] **V5.12 — Orders and tracking.** Order rows by day; the LED board, line map and receipt ticket.
- [x] **V5.13 — Auth, World Cup, 404.** Auth split with the board side; World Cup stations; 404 board.
- [x] **V5.14 — Motion.** Spec §7 reviewed with the `emil-design-eng` framework (frequency → purpose → easing →
      duration): the board flood shortened to 300 ms in / 160 ms out with the text turning on the same clock, the
      ticket print to 320 ms, presses moved from a 1 px drop to `scale()` (0.97 buttons, 0.94 squares, 0.92 stepper
      cells, 140 ms ease-out). No `transition: all`, no ease-in, nothing from `scale(0)`, no pulsing. Sampled in
      Chrome: the flood is 53 % across at 40 ms and 96 % at 120 ms; with reduced motion it is instant.
- [x] **V5.15 — Web QA.** Every route × 1440/1024/768/390/320 × light/dark; hostile content; slow and failing API;
      failed images; keyboard and focus; 200 % text; functional smoke (order, World Cup order, owner CRUD, tracking,
      reorder, auth redirect/return, 401, account switch).
- [x] **V5.16 — Mobile (Expo).** Karantina + Noto Sans Hebrew (expo-font, the seven faces used), Line tokens for
      both themes (the V3/V4 colour names removed), `getLine()` identical to the web's, the line badge and plate,
      board rows that flood on press, line chips, the World Cup band, the LED strip on home, the route menu with
      filling rings, the ink cart bar, the ticket cart screen, the tracking board and line map (no pulse), orders as
      LED/ruled rows, search, the line bar tab bar, auth on the board, owner toolbar and forms. Verified on Expo web
      at 412×915 (light and dark) and by Android export; not on a device.
- [x] **V5.17 — Second Impeccable pass (web).** Dual-agent critique + detector on the built product; ten findings
      fixed (V5_VISUAL_AUDIT §3.3). The mobile app gets its own check at the end of V5.16.
- [x] **V5.18 — Evidence and docs.** `docs/screenshots/v5/`: 14 web (1440×950, 390×844) and 9 mobile (Expo web
      412×915 at 2×) captures plus the concept set; README and AGENTS.md point at V5; final gate below.

**V5 is complete.** Open items are listed under "Known limitations" and "Needs a device".

## Verification at the end of V5

API 144/144 (no backend file changed since `b500a21`), web Jest 43/43 (38 at V4 + 5 for the line allocation),
`eslint --ext .js,.jsx` clean, `CI=true npm run build` green (103.6 kB JS, 13.0 kB CSS gzipped), `docker build
./web-server` green, mobile `expo lint` at its two documented baseline findings (SearchResultsScreen and
TrackingScreen, `set-state-in-effect`, unchanged from V4), Android export green (24 assets, 7 fonts). Impeccable
detector: 0 findings on the web source; 0 contrast failures and 0 overflow in the rendered pages (V5_VISUAL_AUDIT
§3.3).

## Known limitations

- The dev database still holds V3 test restaurants ("Smoke mu…", "dfsf") at the top of `GET /restaurants`; they
  are data, not design, and double as no-photo cases.
- Restaurant line numbers are derived from the id; two restaurants may rarely share a number (spec §4.1).
- The mobile app follows the OS colour scheme only (no in-app toggle), as in V4.

## Needs a device

Everything in V4_IMPLEMENTATION_PLAN "Needs a device" still applies. V5 adds:

- The custom fonts on Android: the per-weight family mapping (`createStyles`) was checked on Expo web and in the
  Android export's asset list, not on a device.
- The dashed perforations (`borderStyle: 'dashed'` on one edge) render differently across Android versions.
- The board row's pressed flood and the cart bar's rise run on the native driver; felt only on Expo web.

## Implementation rules

- Behaviour stays in hooks and pages (`useMenuCart`, `usePlaceOrder`, `AuthContext`, `ThemeContext`, the pages'
  request guards). Presentation components may be rewritten, renamed or replaced; their props are the seam.
- Tests: keep every behavioural assertion. An assertion tied only to superseded presentation (a class name, a V4 label
  that the spec renamed) is updated in the same commit, with the reason in the message.
- One concern per commit; the verification actually run goes in the message; push after each coherent slice.

## Verification (before every commit that touches code)

```bash
cd web-server && npm run test:db:up && npm test && npm run test:db:down   # API: 144/144 at the V4 baseline
cd web-server/client && npm test -- --watchAll=false                      # web Jest: 38/38 at the V4 baseline
npx eslint --ext .js,.jsx src && CI=true npm run build                    # lint gate (plain `eslint src` skips .jsx)
cd mobile && npm run lint && npx expo export --platform android           # lint: two documented findings at baseline
```

Visual loop for every screen: run the dev stack (API on :8080 with `web-server/.env`, CRA on :3000, demo data from
`docs/dev/demo-data.mjs`), capture with the Playwright library scripts (log in through `POST /api/tokens`, seed
`localStorage` with `token`, `user`, `theme` via `addInitScript`), read every capture, fix, capture again.

## Notes for the next session

- Concept prototypes: `cd docs/v5/concepts && python3 -m http.server 8765`.
- Impeccable lives at `~/.github/skills/impeccable/` (not in the repo); its hook config is the user's untracked
  `.github/hooks/impeccable.json`.
- Demo accounts: customer `noam` / `noampass1`, owner `chef` / `chefpass1`.
