# Better Wolt V2 — Specification

**Status:** approved direction, not yet implemented. **Branch:** `v2/extensible-architecture` (never commit to `main`).
**Companion docs:** [V2_IMPLEMENTATION_PLAN.md](V2_IMPLEMENTATION_PLAN.md) (how and in what order) ·
[ARCHITECTURE.md](ARCHITECTURE.md) (structure, conventions, API contract) · [EXTENDING.md](EXTENDING.md) (adding features).

If these documents disagree, this spec wins. Changing the spec requires a commit that edits this file and adds a line to the
[Decision log](#8-decision-log).

## 1. Goal

Turn Better Wolt from a course project into a clean, extensible, production-style portfolio project by:

1. Making a new backend feature **local** — one folder, one route mount, one test file.
2. Making the API **safe and predictable** — validated input, one error format, no stack/driver text leaking.
3. Putting **automated tests first**, so every later refactor is checked against real behavior.
4. Making the project **easy to run, test, and review** — CI, one-command test DB, accurate docs.

## 2. Non-goals

Not built in V2 unless a concrete need appears and this spec is amended first:

- Microservices, message queues, event buses.
- A dependency-injection container, plugin/module system, or "feature registry".
- Generic repositories or a data-access abstraction over Mongoose.
- A shared web/mobile package (the two API clients stay separate; their contract is documented and aligned).
- Vite migration, splitting `web-server/` into `api/` + `web/`, or a monorepo tool.
- Data-model migrations (see §3.4), payments, real-time order tracking, admin role, refresh tokens.
- New UI features.
- New lint/format tooling beyond what CRA already runs (revisit after V2).

## 3. Invariants (must survive every phase)

A change to anything in this section is a behavior change and needs a spec amendment.

### 3.1 Order pricing is server-authoritative
Clients send only `{ restaurant, products: [{ id, quantity }] }`. The server resolves products from the restaurant's menu,
snapshots `name` and `price` into `orderItems`, merges duplicate product ids, computes `items` and `total`
(rounded to 2 decimals), and sets `status`, `date`, `startTime`. Client-supplied prices, totals, status, or username are ignored.
Existing orders keep their snapshotted prices when the menu later changes.

### 3.2 Authorization matrix

| Operation | Rule |
|---|---|
| Register, login, list/get restaurants, menu, product, search | Public |
| `GET /api/users/:id` | Authenticated, and only for the token's own id (else 403) |
| `POST /api/restaurants` | Authenticated **and** role `restaurant` (else 403) |
| Restaurant `PATCH`/`DELETE`, product `POST`/`PATCH`/`DELETE` | Authenticated **and** `restaurant.username === token.username` (else 403) |
| All `/api/orders*` | Authenticated; orders are created for, listed for, readable by, and deletable by the token's user only |
| Another user's order (`GET`/`DELETE /api/orders/:id`) | **404**, not 403 (does not reveal existence) |
| Token for a deleted user on order routes | 404 `Invalid username` (existing behavior, keep) |

### 3.3 Token and response contracts
- JWT: HS256, 24 h, claims `{ id, username, displayName, role, iat, exp }`. Login returns `{ token, user: { id, username, displayName, image, role } }`.
- Response shapes for User, Restaurant, Product, Order, and the `Location` headers on `201` are as listed in
  [ARCHITECTURE.md §4](ARCHITECTURE.md#4-api-contract).
- Status codes and `error` strings for the cases listed in ARCHITECTURE.md §4.3 are contract (clients display them).

### 3.4 Data model is unchanged
No schema migration in V2: `Order.restaurant` stays a `String`; `Order.products` and `orderItems` both stay; `status` stays the
Hebrew display string `בדרך 🛵`; ownership stays keyed on `username`; user avatars stay base64 data URLs. No schema field is
added or removed in V2.

### 3.5 World Cup feature keeps working
The seeded restaurant `חגיגת מונדיאל` with its 20 products remains real MongoDB data, product ids stay stable across restarts, and
orders against it go through the normal order flow. Clients find it by its exact name and match dishes by product name; both
names are part of the documented API contract ([ARCHITECTURE.md §6](ARCHITECTURE.md#6-clients)), not an implementation detail.

## 4. Target architecture (summary)

Full detail in [ARCHITECTURE.md](ARCHITECTURE.md). In short:

- Backend is organized **by feature**: `src/features/<name>/<name>.{model,service,controller,routes,schemas}.js`.
  Shared HTTP plumbing lives in `src/http/`; configuration in `src/config.js`; seeding in `src/seed/`.
- Dependency direction stays `routes → controller → service → model`. Features may import another feature's **service**, never its
  controller, routes, or model.
- Validation with **Zod** at the route boundary for user, auth, restaurant, and product input. Order input keeps its existing,
  complete in-service validation (converting it adds risk and no behavior).
- Shared HTTP helpers are limited to what at least two features use today: `requireAuth`, `AppError`, `errorHandler`, `validate`,
  `objectIdParam`. `requireRestaurantOwner` lives in the restaurants feature. No `requireRole` helper (one call site).
- One error type (`AppError`) and one error-handling middleware; controllers do not `try/catch` for HTTP mapping.
- One `config.js` reads and validates `process.env`; nothing else reads it.
- Express 5 forwards rejected promises to error middleware, so no async wrapper is added.

## 5. Approved behavior changes

Everything not listed here must behave exactly as today. Each fix ships with a regression test that **first pins the old
behavior (Phase 1) and is then flipped to the new behavior in the fix commit (Phase 3)**; the commit message states old → new.
Security fixes are behavior changes and are treated identically.

| ID | Audit | Old behavior (pinned in Phase 1) | New behavior | Regression test |
|---|---|---|---|---|
| BF-1 | A3 | Unknown `/api/*` path returns the SPA `index.html` with `200` | `404` `{ "error": "Not found" }` JSON | `GET /api/does-not-exist` |
| BF-2 | A3 | CORS-rejected origin → unhandled `Error` → `500` HTML. Malformed JSON body → default Express `400` HTML | `403` `{ "error": "Origin not allowed" }`; `400` `{ "error": "Invalid JSON" }` | request with disallowed `Origin`; body `{bad` |
| BF-3 | A4 | Invalid ObjectId path param: `404` on `GET /restaurants/:id`, but `500` on menu/product routes and `400` + raw Mongoose cast text on `PATCH /restaurants/:id` | Always `404` with the same `Restaurant not found` / `Product not found` message; no driver text | `not-an-id` on every id-taking route |
| BF-4 | A5 | Product `price` of `-5` accepted (`201`), `"abc"` → `500` on create and update; user `role: "admin"` or non-string fields → `500` | Invalid input → `400` with a readable message. `price` must be finite and `≥ 0`; `role` ∈ {`customer`,`restaurant`}; strings must be strings | POST product `-5`, `"abc"`; PATCH product `"abc"`; POST user `role:"admin"`, `username:{}` |
| BF-5 | A2 | `/api/search/:q` builds `new RegExp(q)`: `.*` matches everything, `(` → `500` | `q` is matched literally (escaped), case-insensitive | search `.*` and `(` |
| BF-6 | A6 | Unlimited login/register attempts | `429` `{ "error": "Too many requests" }` after `AUTH_RATE_LIMIT_MAX` (default 20) attempts per 15 min per IP on `POST /api/tokens` and `POST /api/users`; successful logins are not counted | N+1 bad logins with `AUTH_RATE_LIMIT_MAX=N` |
| BF-7 | A6 | Login for an unknown username returns before any bcrypt work (timing reveals account existence) | Unknown username performs a dummy bcrypt compare, same response | spy on `bcrypt.compare`: 0 calls → 1 call |
| BF-8 | A6 | JWT verify accepts HS256/384/512 | Only HS256 accepted; an HS512 token signed with the correct secret → `401` | forged HS512 token on `GET /api/orders` |
| BF-9 | A8 | Every route accepts JSON bodies up to 5 MB | Default 100 KB everywhere except `POST /api/users` (avatar), which keeps 5 MB; oversize → `413` `{ "error": "Payload too large" }` | 200 KB body to `POST /api/tokens` |

Derived, small additions to confirm at review: BF-2's malformed-JSON case (part of "one error format") and BF-4's `role` /
type checks (inherent in adopting Zod). Neither changes any successful path.

**What "preserve behavior" covers.** The contract is every successful response and every **single-fault** error response (a
request with exactly one thing wrong), as pinned by the Phase 1 tests. Two things are explicitly *not* contract and may change during
Phase 3 without a BF entry:
1. *Multi-fault precedence* — which error wins when a request is wrong in several ways (e.g. a non-owner sending an invalid price).
   From Phase 3 every route uses one order: `401` → body `400` → id/unknown `404` → role/ownership `403`, which reproduces every
   pinned single-fault case.
2. *Unexpected internal failures* (driver errors, bugs) return the generic `500 Error processing request` instead of, in a few
   handlers today, `400` with the internal message echoed.

**Deliberately not changed (documented, revisit later):** self-chosen `role` at registration (A7); role baked into a 24 h JWT with
no revocation; token in web `localStorage` (A7); `status` as display string and `Order.restaurant` as `String` (B7); ownership by
`username`; seed runs at every startup and can race with multiple instances (B8); avatar content is not checked to be an image
(A8, only size is bounded); MongoDB has no authentication (Phase 5 limits it to localhost); the stray `Connection`/`Keep-Alive`
header middleware (harmless, affects static files only).

## 6. Testing strategy

- **Real MongoDB 7.** Locally via Docker Compose (`docker-compose.test.yml`, service `mongo-test`, tmpfs, port 27018); in CI via a `mongo:7`
  service container. `TEST_MONGODB_URI` overrides for any Mongo 7 instance.
- **Runner:** Node's built-in `node:test` + `supertest` (dev dependency). No Jest on the backend.
- **Black-box:** tests call the Express `app` over HTTP and read/write through the API. Exceptions, all listed here: the seed test
  imports the seed function; BF-7 spies on the `bcryptjs` module; `db.collection(name)` may be used for **setup only** where no API
  exists (deleting a user). Because tests never depend on `src/` layout, they stay untouched during the Phase 2 refactor
  (except the seed import path).
- **Isolation:** flat `web-server/test/*.test.js`; each file runs in its own process with its own database `bw_test_<pid>_<rand>`,
  so files run in parallel. Helpers refuse to connect to any database whose name does not start with `bw_test_`.
- **Characterization first:** Phase 1 tests assert **current** behavior, including current bugs. A pinned bug is titled `[BF-n] …`
  and carries a `// PINNED: old behavior, flipped in Phase 3` comment.
- **Tests must be able to fail:** characterization tests are written green, so Phase 1 exit requires a four-mutation spot-check
  (plan, Phase 1 exit) proving the suite catches broken authorization and client-trusted pricing. Phase 3 requires each flipped
  test to be seen failing before its fix.
- **Flakiness:** designed out (one database per file, no fixed ports in tests, midnight-safe date assertions) and checked once by
  running the suite serially and in parallel. No "N consecutive green runs" rule.
- **Coverage bar** (behavioral, not a percentage): every endpoint has a happy path, an auth failure, a validation failure, and, where
  applicable, an ownership/cross-user failure. The matrix is in the plan (Phase 1).
- **Clients:** web gets a small Jest suite (API client, `ProtectedRoute`); mobile is gated by a bundle-compile CI check. No UI
  end-to-end framework in V2. Manual smoke checklist in the plan covers what automation does not.
- **CI (GitHub Actions):** `api` (tests against Mongo service), `web` (test + build), `docker` (image build), `mobile` (install + bundle).

## 7. Constraints and conventions

- **Runtime:** Node 24 LTS pinned in `.nvmrc`, both Dockerfiles, and CI; `engines` allows `>=22`. Node 20 (current Dockerfiles)
  reached end of life in April 2026, so staying on it is not an option. Node 22 is in maintenance until April 2027; Node 24 is the
  active LTS, supported until April 2028, so it avoids a second runtime bump soon after V2. If CRA 5 or Expo fails on 24 in
  Phase 0, fall back to 22.
- **Dependencies added in V2 (exhaustive):** runtime `zod`, `express-rate-limit`; dev `supertest`. Anything else needs a spec amendment.
- **Layout:** keep `web-server/` (API + React client) and `mobile/` as they are.
- **Commits:** small, one concern each; `npm test` green before every commit from Phase 1 on. File moves are their own commits
  (rename-only, verified with `git diff -M --stat`). Never reset, force-push, or rewrite history; recover with `git revert`.
- **Progress** is recorded in the checklist at the top of the implementation plan so any session can resume.
- **Language:** new code, comments, tests, and docs in English. Existing Hebrew UI strings and data are left as they are.

## 8. Decision log

| Date | Decision |
|---|---|
| 2026-09-19 | Integration tests use real MongoDB 7 (Compose locally, service container in CI). |
| 2026-09-19 | Zod for request validation. |
| 2026-09-19 | BF-1…BF-9 approved; each needs a focused pin-then-flip regression test. |
| 2026-09-19 | Keep `web-server/` layout; no Vite migration or repo-layout change in V2. |
| 2026-09-19 | Controllers stay as a separate file per feature (smaller diffs than merging into routes). |
| 2026-09-19 | Error model, ownership helper, and validation move to Phase 3, **after** Phase 2's mechanical moves: they cannot be done without changing today's inconsistent per-handler responses (BF-3). |
| 2026-09-19 | Review: Node 24 LTS instead of 22 (longer support; 22 as fallback). |
| 2026-09-19 | Review: Phase 3 order is uniformity fixes (BF-1…4) → behavior-preserving refactor → security fixes (BF-5…9), one BF per commit; no refactor shares a commit with a fix. |
| 2026-09-19 | Review: dropped the planned `Restaurant.tag` / `?tag=` lookup — it would still leave dish-name matching in both clients and break "no schema change"; the World Cup names are documented as contract instead. |
| 2026-09-19 | Review: dropped `requireRole` (one call site) and Zod for orders (existing validation is complete); `requireRestaurantOwner` lives in the restaurants feature. |
| 2026-09-19 | Review: multi-fault error precedence and unexpected-error responses are not contract (§5). |
| 2026-09-19 | Review: replaced "three green CI runs" with one serial + one parallel run; kept the mutation spot-check. |
| 2026-09-19 | Implementation: test MongoDB lives in `docker-compose.test.yml` (project `better-wolt-test`), not a profile in `docker-compose.yml` — Compose interpolates the whole file, so the backend's required `JWT_SECRET` blocked starting only `mongo-test`. |
