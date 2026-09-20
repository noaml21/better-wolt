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
- [ ] **Phase 5 — Mobile foundations.** Theme, `src/ui` primitives, tab navigation, screen header, safe areas, toasts.
- [ ] **Phase 6 — Mobile customer flows.** Home, search, restaurant details, cart, orders, tracking.
- [ ] **Phase 7 — Mobile owner flows and World Cup.** Restaurant/product forms, the campaign on both clients.
- [ ] **Phase 8 — Polish and QA.** Responsive sweep, accessibility pass, motion/reduced-motion, dark theme, final
      verification and screenshots.

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

### Phase 7 — Mobile owner flows and World Cup
`RestaurantFormScreen` and `ProductFormScreen` rebuilt on the primitives with image picking and validation.
`/world-cup` (web) and `WorldCupScreen` (mobile) as a designed campaign: flag grid, opt-in sound, cart-based ordering.
Dish names and the restaurant name stay exactly as seeded.

### Phase 8 — Polish and QA
Responsive sweep at 390/768/1024/1440/1920, keyboard pass, contrast check, dark theme across both clients, motion
review with reduced motion forced, console-error check on every route, final screenshots into `docs/screenshots/v3/`,
README updated.

## Notes for the next session

- The V2 screenshots used for the audit are in `docs/screenshots/v2/`; V3 shots go in `docs/screenshots/v3/`.
- The local dev database contained leftover `Smoke mu…` restaurants from an earlier smoke-test run against the dev DB.
  They are test residue, not seeded data; they are ignored, not deleted.
- Node here is v22 (`.nvmrc` pins 24; `engines` allows ≥ 22). Both are fine for the client build.
