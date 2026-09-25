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
- [ ] **V5.15 — Web QA.** Every route × 1440/1024/768/390/320 × light/dark; hostile content; slow and failing API;
      failed images; keyboard and focus; 200 % text; functional smoke (order, World Cup order, owner CRUD, tracking,
      reorder, auth redirect/return, 401, account switch).
- [ ] **V5.16 — Mobile (Expo).** Fonts, tokens, line identity, LED strip, board rows, route menu, ticket screen,
      tracking, orders, auth, owner forms, World Cup; Android export; Expo web captures.
- [ ] **V5.17 — Second Impeccable pass.** Critique + detector on the built product; fix meaningful findings.
- [ ] **V5.18 — Evidence and docs.** `docs/screenshots/v5/` final set, README and AGENTS.md pointing at V5, final gate.

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
