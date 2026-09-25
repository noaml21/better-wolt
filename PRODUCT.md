# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

A second client, the Expo / React Native app in `mobile/`, shares the API and the product identity. It is built for
Android (the only platform CI exports) and is designed on its own terms rather than as a shrunk web page.

## Users

- **Diners in Tel Aviv**, Hebrew-first, usually on a phone, often hungry and in a hurry: find a place or a dish, build
  a cart, place the order, watch it arrive, and order the same thing again another night.
- **Restaurant owners** managing their own restaurant: create it, keep the photo, phone and address right, and add,
  edit and remove dishes and prices with confidence.
- **People evaluating the project** (it is an educational course project and a portfolio showcase). They are served by
  the product being genuinely good to use, not by marketing surfaces. Confirmed with the user, 2026-09-25: "a showcase
  that works" — every screen must behave like a real delivery product.

## Product Purpose

Better Wolt is an educational, Wolt-inspired food-delivery platform: a React web client and an Expo mobile client over
one Express + MongoDB API. Success is a diner getting from hunger to a placed, trackable order quickly and without
doubt about the price, and an owner changing a menu without fear of breaking it.

## Positioning

A Hebrew-first, right-to-left delivery product whose prices are always the server's (the client sends only dish ids
and quantities) and whose every state — no photo, closed restaurant, changed price, failed order, expired session — is
designed rather than left to chance. It is not affiliated with Wolt and must never look like a clone of it.

## Operating Context

- Routes: home / discovery, all restaurants, search, restaurant + menu + cart, orders, order tracking, sign-in,
  registration, owner management on the restaurant page, the World Cup campaign, 404.
- Roles: `customer` and `restaurant` (owner). Owners manage only restaurants they own.
- Tracking is derived on the client from the order's `startTime`; the server never advances an order's status.
- Carts are per restaurant and never trusted: totals are recomputed by the server when the order is placed.

## Capabilities and Constraints

- The API contract (`docs/ARCHITECTURE.md` §4), the authorization matrix (`docs/V2_SPEC.md` §3.2) and the contract error
  strings are fixed. Visual work must be solved with the data that exists.
- The API has **no** ratings, delivery times, delivery fees, categories or cuisines. The clients derive illustrative
  ratings / times / fees from the restaurant id and say so in the footer; nothing further may be invented.
- A restaurant has `name, phone, address, image (URL), products[{ name, description, price }]`. Images may be missing or
  broken; names may be long, mixed Hebrew/Latin, or contain emoji.
- The World Cup restaurant `חגיגת מונדיאל` and its dish names are contract (seeded server-side).
- Web: React 19 + CRA + react-router 7, plain CSS. **New dependencies: fonts only** (confirmed 2026-09-25); motion and
  layout stay in plain CSS/React.
- Mobile: Expo + React Native, platform font, `Animated` with the native driver.

## Brand Commitments

- The name **Better Wolt** and a **Hebrew-first, right-to-left** interface are binding. The logo mark, colours,
  typefaces and voice may all be replaced (confirmed 2026-09-25).
- Photos, ratings, delivery times and fees are illustrative and the product says so.

## Evidence on Hand

- Demo data: `docs/dev/demo-data.mjs` (customer `noam` / `noampass1`, owner `chef` / `chefpass1`), a dozen Tel Aviv
  restaurants with Unsplash-style photo URLs and Hebrew menus, plus the seeded World Cup restaurant (20 dishes, ₪30 each).
- No testimonials, press, user counts, partner logos or real reviews exist, and none may be fabricated.

## Product Principles

1. The price you see is explained, and the price you pay is the server's.
2. Every state is designed: no photo, nothing found, closed, changed, failed, expired.
3. Speed of the common path (find → add → order → track → order again) beats spectacle.
4. Owners get the same product family, tuned for management: clarity and safety over flourish.
5. Hebrew is the first language, not a translation.

## Accessibility & Inclusion

WCAG 2.1 AA on both clients: keyboard and focus management, screen-reader names for every control, ≥ 44 px targets,
text at 200 % zoom, full reduced-motion support, and correct bidi isolation for mixed Hebrew/Latin names beside numbers.
