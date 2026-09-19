# Better Wolt V2 — Implementation Plan

> **For agentic workers:** use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`.
> Work one task at a time, one commit per task, and update the **Progress** table in the same commit.
> Before every commit: `git branch --show-current` must print `v2/extensible-architecture`.

**Goal:** make Better Wolt extensible and reviewable without changing what works: tests first, then incremental restructuring, then deliberate, tested fixes.

**Architecture:** keep Express + Mongoose + React + Expo. Move the backend from layer folders to feature folders in small rename-only commits, protected by a black-box integration suite running against real MongoDB 7.

**Tech stack:** Node 24 LTS, Express 5, Mongoose 9, `node:test` + `supertest`, Zod, `express-rate-limit`, Docker Compose, GitHub Actions.

**Spec:** [V2_SPEC.md](V2_SPEC.md). Structure and conventions: [ARCHITECTURE.md](ARCHITECTURE.md). Recipe for new features: [EXTENDING.md](EXTENDING.md).

## Global constraints (from the spec)

- Branch `v2/extensible-architecture`; never modify or merge into `main`; never reset, clean, force-push, or rewrite history — recover with `git revert`.
- Preserve invariants in spec §3 (server-authoritative pricing, authorization matrix, token/response contracts, unchanged data model, World Cup data).
- Only BF-1…BF-9 may change behavior, **one BF per commit**, each pin-then-flip (spec §5). Behavior-preserving refactors never share a commit with a BF.
- Phase 1 must be complete and green before any backend restructuring (Phase 2).
- New dependencies limited to `zod`, `express-rate-limit` (runtime) and `supertest` (dev). No DI container, plugin system, generic repositories, or shared web/mobile package.
- Keep `web-server/` layout; no Vite.
- Node 24 LTS in `.nvmrc`, Docker, and CI. Small commits; `npm test` green before each commit from Phase 1 on.

## Progress (update in every commit)

Record the commit hash when a task lands. A phase is done only when its exit criteria are checked.

| Task | Description | Done | Commit |
|---|---|---|---|
| 0.1 | Remove `cords` | ☑ | |
| 0.2 | Remove `react-script` | ☑ | |
| 0.3 | Node 24 baseline | ☑ | |
| 0.4 | Client dev proxy | ☑ | |
| 0.5 | Env docs + drop "ex3" naming | ☑ | |
| 1.1 | Test infra (`mongo-test`, helpers, smoke) | ☑ | |
| 1.2 | Auth/users tests | ☑ | |
| 1.3 | Restaurants/products tests | ☑ | |
| 1.4 | Orders tests | ☑ | |
| 1.5 | Search tests | ☑ | |
| 1.6 | Seed tests | ☑ | |
| 1.7 | App-level tests + BF pins | ☑ | |
| 1.8 | Web tests (replace dead CRA test) | ☑ | |
| 1.9 | CI workflow | ☑ | |
| 2.1 | Delete service shims | ☑ | |
| 2.2 | Delete dead code | ☑ | |
| 2.3 | Drop header-based identity | ☑ | |
| 2.4 | One `toApiProduct` | ☑ | |
| 2.5 | `config.js` + `db.js` | ☑ | |
| 2.6a–f | Feature-folder moves (one per commit) | ☐ | |
| 3.1 | BF-1: `AppError`, error handler, `/api` 404 | ☐ | |
| 3.2 | BF-2: JSON parse + CORS errors | ☐ | |
| 3.3 | BF-3: invalid ids → 404 | ☐ | |
| 3.4a | BF-4: user/auth input validation | ☐ | |
| 3.4b | BF-4: restaurant/product input validation | ☐ | |
| 3.5 | Refactor: controllers without HTTP `try/catch`, owner middleware | ☐ | |
| 3.6 | BF-5: literal search | ☐ | |
| 3.7 | BF-6: auth rate limit | ☐ | |
| 3.8 | BF-7: timing-safe login | ☐ | |
| 3.9 | BF-8: HS256 only | ☐ | |
| 3.10 | BF-9: body-size limits | ☐ | |
| 4.1 | Align both API clients to the contract | ☐ | |
| 4.2 | World Cup client cleanup | ☐ | |
| 4.3 | Delete dead client code | ☐ | |
| 5.1 | Non-root image + Mongo on localhost | ☐ | |
| 5.2 | `/api/health` | ☐ | |
| 5.3 | `npm run dev` + README Development | ☐ | |
| 5.4 | `AGENTS.md` | ☐ | |
| 5.5 | README links + accuracy pass | ☐ | |

### Progress notes

- **Phase 0 (2026-09-19):** verified on Node 24.21.0 / npm 11.19.0 — `npm ci` in all three packages, client build, `expo export --platform android`, `docker compose build backend` and `mobile`, Appendix A steps 1–6 PASS.
- **Phase 1 exit (2026-09-19):** 132 API tests green in parallel and with `--test-concurrency=1`; 9 web tests green; first CI run green (api, web, docker, mobile). `git diff 287b303..HEAD -- web-server/src web-server/server.js` empty. Mutation spot-check — all four caught, each undone by hand and `git status --short web-server/src` empty afterwards:
  (a) owner check removed from `deleteProduct` → `delete by another owner or a customer -> 403 and kept` failed;
  (b) `createOrder` using a client-sent price → `client-sent price, … are ignored` failed;
  (c) `router.use(requireAuth)` removed from `routes/orders.js` → 34 of 35 order tests failed;
  (d) `getOrder` skipping the username check → `GET another user's order -> 404` failed.
- Local suite time is dominated by bcrypt at cost 12 (~650 ms per hash/compare with bcryptjs); addressed in Task 2.5.

## Rules that apply to every phase

- **Entry check (every session):** on the right branch; `git status` clean or containing only this task's changes; the last commit's test run green (`npm run test:db:up && npm test` in `web-server/`).
- **Verification before commit:** run the task's tests plus the full `npm test`; never record a result you have not seen.
- **Rollback/recovery (default):** `git revert <sha>` for a bad commit (fix forward only for a one-line fix). To abandon a phase: revert its commits newest-first. The whole V2 effort can be dropped by leaving the branch; `main` is never touched. V2 has **no data migrations**, so there is no data rollback to plan for.
- **Stop conditions:** if a characterization test shows behavior different from what these docs describe, stop, record it in the spec's decision log, and decide whether to pin it or amend the spec. Never "fix" behavior inside a refactor commit.

---

## Phase 0 — Hygiene (no behavior change)

**Entry:** on the V2 branch, clean tree.

| Task | Exact change |
|---|---|
| 0.1 | In `web-server/`: `npm uninstall cords` (unused, unrelated 2015 package; likely typo of `cors`). Commit `package.json` + `package-lock.json`. |
| 0.2 | In `web-server/client/`: `npm uninstall react-script` (likely typo of `react-scripts`, which stays). |
| 0.3 | Add `.nvmrc` (`24`); add `"engines": {"node": ">=22"}` to `web-server/package.json` (22 still works, 24 is the pinned target); change both `FROM node:20-bookworm-slim` lines in `web-server/Dockerfile` and the one in `mobile/Dockerfile` to `node:24-bookworm-slim`. |
| 0.4 | Add `"proxy": "http://localhost:8080"` to `web-server/client/package.json` so `npm start` on :3000 reaches the API. |
| 0.5 | Document optional `PORT`, `MONGODB_URI`, `CORS_ORIGINS` (commented out) in `.env.example`, and that non-Docker runs read `web-server/.env`. Rename package `better-wolt-ex3` → `better-wolt-api` and the startup log text `Ex3 web server running` → `Better Wolt API listening`. |

**Tests/verification (no automated tests exist yet):**
- `npm ci` succeeds in `web-server/`, `web-server/client/`, and `mobile/` on Node 24; `npm run build` in the client succeeds.
- `docker compose build backend` succeeds.
- Smoke: `docker compose up -d mongo backend`; Appendix A steps 1–6 via `curl`.
- `git diff --stat main..HEAD -- web-server/src` shows no changes.

**Exit:** all of the above pass; Progress updated.
**Rollback:** revert individual commits. If CRA 5 or Expo fails on Node 24, change 0.3 to Node 22 (supported until April 2027) and record it in the decision log — do not stay on Node 20 (end of life).

---

## Phase 1 — Safety net (characterization tests + CI)

**Entry:** Phase 0 exit met. **Rule for the whole phase: zero changes under `web-server/src/` and `web-server/server.js`.** Only tests, `package.json` dev tooling/scripts, `docker-compose.test.yml`, CI files, and the README "Testing" section change.

### Task 1.1 — Test infrastructure

**Files:** create `web-server/test/helpers/{env,db,api}.js`, `web-server/test/smoke.test.js`, `docker-compose.test.yml`; modify `web-server/package.json`.

**Compose — separate file `docker-compose.test.yml`** (as built: a profile in `docker-compose.yml` does not work, because Compose interpolates the whole file and the backend's required `JWT_SECRET` aborts `up mongo-test`; the separate file has its own project name so `down` never touches the dev stack):
```yaml
name: better-wolt-test
services:
  mongo-test:
    image: mongo:7
    container_name: better-wolt-mongo-test
    ports: ["127.0.0.1:27018:27017"]
    tmpfs: ["/data/db"]
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.runCommand({ ping: 1 }).ok"]
      interval: 3s
      timeout: 5s
      retries: 20
```

**Scripts (`web-server/package.json`):**
```json
"test": "node --test test/*.test.js",
"test:db:up": "docker compose -f ../docker-compose.test.yml up -d --wait",
"test:db:down": "docker compose -f ../docker-compose.test.yml down"
```
(`test/*.test.js` is shell-expanded and flat on purpose: it never picks up `client/` tests.)

**Interfaces produced (all later tasks rely on these exact names):**
```js
// test/helpers/env.js — require FIRST in every test file (before requiring the app).
//   sets JWT_SECRET='test-secret', CORS_ORIGINS='http://localhost:3000',
//   MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27018/better_wolt_test',
//   AUTH_RATE_LIMIT_MAX = '1000' unless already set (inert until Phase 3)
// test/helpers/db.js
//   assertTestDbName(name)     // throws unless name matches /^bw_test_/
//   connect(): Promise<void>   // unique db name `bw_test_<pid>_<rand>`, checked with assertTestDbName;
//                              // awaits Model.init() for every registered model (unique indexes exist)
//   clear(): Promise<void>     // deleteMany on every collection (keeps indexes)
//   close(): Promise<void>     // dropDatabase + disconnect
//   collection(name)           // raw collection, for SETUP ONLY where no API exists (e.g. deleting a user)
// test/helpers/api.js
//   request()                                  // supertest(app), app = require('../../src/app')
//   auth(token)                                // { Authorization: `Bearer ${token}` }
//   registerUser(overrides?)                   // -> { id, username, password }
//   loginAs(username, password)                // -> { token, user }
//   createCustomer(overrides?)                 // -> { id, username, token, user }
//   createOwner(overrides?)                    // -> same, with role 'restaurant'
//   createRestaurantAs(owner, overrides?)      // -> restaurant JSON
//   addProductAs(owner, restaurantId, overrides?) // -> product JSON
//   ensureClientBuildFixture()                 // creates client/build/index.html only if absent (gitignored);
//                                              // returns cleanup() that removes only what it created
```
Usage pattern in every file: `require('./helpers/env'); const db = require('./helpers/db'); before(db.connect); afterEach(db.clear); after(db.close);`.

**Steps:** (1) add compose service + scripts + `npm i -D supertest`; (2) write helpers; (3) write `smoke.test.js` (`GET /api/restaurants` → `200 []`); (4) `npm run test:db:up && npm test` passes; (5) commit.
**Exit for task:** smoke test green against `mongo-test`; `assertTestDbName('better_wolt')` throws and `assertTestDbName('bw_test_1_x')` does not (both asserted in the smoke test).

### Tasks 1.2 – 1.7 — Characterization tests (one file, one commit each)

Assert **current** behavior for **single-fault requests** (exactly one thing wrong). Which error wins when a request has several faults is not contract (spec §5) and is not pinned. Where current behavior is a bug, title the test `[BF-n] …` and add `// PINNED: old behavior, flipped in Phase 3`.

| Task / file | Cases (all through HTTP) |
|---|---|
| **1.2** `auth.test.js` | Register: valid → `201`, body `{id}`, `Location: /api/users/<id>`; missing field → `400` with the exact "Missing required fields…" text; weak password (no digit / no letter / <8 / 73 bytes) → `400` exact text; duplicate username → `400 Username already taken`; no body → `400`. Login: success shape `{token,user}` with no password field; wrong password and unknown user → `401 Invalid username or password`; missing fields → `400`. JWT claims `{id,username,displayName,role,exp}`, `exp−iat = 24h`. `GET /users/:id`: self → `200` safe fields only (no `password`); other id → `403`; no header → `401 Unauthorized`; `Basic x` → `401 Invalid authorization header`; garbage/expired token → `401 Invalid or expired token`; user deleted via `db.collection('users')` → `404 User not found`. Role: register with `role:'restaurant'` → token role `restaurant`. **Pins:** `[BF-4]` `role:'admin'` → `500`; `username` as object → `500`. `[BF-6]` 25 wrong logins all `401`. `[BF-7]` spy `bcrypt.compare` (bcryptjs module) with `node:test` `mock.method`: unknown username → 0 calls. `[BF-8]` HS512 token signed with the test secret is accepted on `GET /api/orders` (`200`). |
| **1.3** `restaurants.test.js` | List/get shape `{id,username,name,phone,address,image,products[]}`; `POST` as owner → `201` + `Location`; as customer → `403 Only restaurant owners can create restaurants`; no token → `401`; missing name (owner) → `400 Name is required`; duplicate name → `400 Restaurant with this name already exists`. `PATCH`: owner → `204` and persisted; other owner → `403`; customer → `403`; unknown valid id → `404`; duplicate name → `400`. `DELETE`: owner `204`, other `403`, unknown `404`. Products: add (`201`, `Location`, shape), missing name/price → `400 Missing required fields: name, price`, non-owner `403`, get/list, patch (`200` body), delete (`204`), unknown product `404`, unknown restaurant `404`. **Pins:** `[BF-3]` with id `not-an-id` (valid auth and body otherwise): `GET /restaurants/:id` → `404`; `GET …/products`, `GET …/products/:pId`, `DELETE /restaurants/:id`, `POST`/`PATCH`/`DELETE` product routes → `500`; `PATCH /restaurants/:id` → `400` with cast text (assert only that `error` contains `Cast` or `ObjectId`). `[BF-4]` (as owner) `POST` product price `-5` → `201`; `POST` price `"abc"` → `500`; `PATCH` product price `"abc"` → `500`. |
| **1.4** `orders.test.js` | Create: `201`, `Location`; `status === 'בדרך 🛵'`; `date` equals the UTC `YYYY-MM-DD` taken just before **or** just after the request (midnight-safe); `items`/`total` computed; duplicate ids merged into one `orderItems` row with summed quantity; `products[]` lists the id once per unit; `total` rounding (3 × `0.1` → `0.3`); **client-sent `price`, `total`, `status`, `username` ignored**. Errors: no token `401`; missing `restaurant`/non-array `products` → `400 Bad Request`; empty array → `400 Order must contain at least one product`; quantity `0`, `-1`, `1.5`, `"2"` → `400 Quantity must be a positive integer`; entry not an object → `400 Each product must include an id and quantity`; unknown restaurant / invalid id → `404 Restaurant not found`; product not on that menu → `404 Product not found in restaurant menu`. Snapshot: `PATCH` the product price after ordering → old order keeps old price. List: only own orders. Get: own `200`; other user's → `404`; unknown id → `404`. Delete: own `204` then `404`; other's `404`; invalid id `404`. User deleted via `db.collection('users')` → order routes `404 Invalid username`. |
| **1.5** `search.test.js` | Matches restaurant name, address, product name, product description; case-insensitive; no match → `200 []`; blank (`%20`) → `400 Missing search query`; result shape equals list shape. **Pins:** `[BF-5]` `/api/search/.*` returns every restaurant; `/api/search/(` → `500`. |
| **1.6** `seed.test.js` | (Imports `src/services/seedWorldCupRestaurant` directly — the one allowed non-HTTP import; Phase 2 updates this single import path in Task 2.6f.) Creates restaurant `חגיגת מונדיאל` with 20 products and owner `system`; second run changes nothing (same product ids); edited price/description restored; duplicate product names collapsed; legacy products (`חבילת מונדיאל זוגית`, `נשנושי מחצית`) removed; **order placed against a seeded product succeeds and totals correctly** (README claim). |
| **1.7** `app.test.js` | CORS: allowed origin → `Access-Control-Allow-Origin` echoed; no `Origin` → OK. **Pins:** `[BF-2]` disallowed origin → `500`; body `{bad` on `POST /api/tokens` → `400` with `text/html`. `[BF-1]` `GET /api/does-not-exist` → `200 text/html` (uses `ensureClientBuildFixture()`). `[BF-9]` 200 KB JSON (valid shape, unknown user) to `POST /api/tokens` → `401` (parsed, not rejected). Unknown non-API path returns the SPA `index.html`. |

**Per-task steps:** write tests → run (`npm test`) → all green against unmodified code (if a test fails, the test's expectation or these docs are wrong — see stop conditions) → commit `test(api): characterize <area>`.

### Task 1.8 — Web tests
Replace `web-server/client/src/App.test.js` (the untouched CRA "learn react" test, which cannot pass) with `ProtectedRoute.test.jsx`: unauthenticated → redirected to `/login`; authenticated → renders children. Add `web-server/client/src/services/api.test.js` (mocked `fetch`): sends `Authorization: Bearer <token>` when `localStorage.token` is set; error body `{error}` → thrown `Error(message)`; `204` → `null`. Test files only.
**Known risk:** CRA 5's Jest may not resolve `react-router-dom` v7. If so, add a `"jest": {"moduleNameMapper": {...}}` entry to `client/package.json` (a CRA-supported key) and note it in the commit message.

### Task 1.9 — CI
Create `.github/workflows/ci.yml`, triggered on `push` and `pull_request`, all jobs using `node-version-file: .nvmrc`:
- **api:** `services: mongo: image mongo:7` with health check; `working-directory: web-server`; `npm ci`; `npm test` with `TEST_MONGODB_URI=mongodb://127.0.0.1:27017/better_wolt_test`.
- **web:** `web-server/client`: `npm ci`, `CI=true npm test -- --watchAll=false`, `npm run build`.
- **docker:** `docker build ./web-server`.
- **mobile:** `mobile`: `npm ci`, `npx expo export --platform android --output-dir "$RUNNER_TEMP/expo-out"` (bundle compiles). If it proves unworkable in CI, reduce it to `npm ci` and record why in the decision log — do not silently drop the job.

### Phase 1 exit criteria (all required)
- [x] Every row of the matrix above has passing tests; every BF-1…BF-9 has a `[BF-n]` pin.
- [x] `npm test` green locally and CI green on the final Phase 1 commit.
- [x] Order-independence check: `node --test --test-concurrency=1 test/*.test.js` is also green (serial vs. parallel catches shared-state leaks — this replaces any "N green runs" rule).
- [x] `git diff <phase-0-end>..HEAD -- web-server/src web-server/server.js` is **empty**.
- [x] **Mutation spot-check** (not committed; it is the only proof that tests written against working code can fail): for each mutation — (a) remove the owner check in `deleteProduct`; (b) make `createOrder` use a client-sent `price`; (c) remove `router.use(requireAuth)` from `routes/orders.js`; (d) make `getOrder` skip the username comparison — edit the file, confirm `npm test` fails with a relevant assertion, undo the edit by hand, and confirm `git status --short web-server/src` is empty. Record the four results in the Progress notes. If a mutation survives, add the missing test before exiting the phase.
- [x] README gets a short "Testing" section (`npm run test:db:up && npm test`, and the `TEST_MONGODB_URI` override).

**Rollback:** revert individual test commits; they cannot affect runtime. If CI is unfixable, revert 1.9 only — the local suite remains the gate.

---

## Phase 2 — Mechanical restructuring (behavior-preserving)

**Entry:** Phase 1 exit fully checked. **Rules:** the Phase 1 tests are **not edited** in this phase (except the one seed import path, Task 2.6f). Every commit passes `npm test`. Each move commit is renames + require-path edits only, verified with `git diff -M --stat` (every file shows as a rename).

*Why the error model and validation are not here:* today each handler maps errors differently (BF-3); a shared helper would either change responses or reproduce the inconsistency. They land in Phase 3, where each response change is its own tested commit.

| Task | Exact change |
|---|---|
| 2.1 | Delete the six shims `src/models/{users,orders,products,restaurants,search,tokens}.js`. Repoint `middleware/auth.js` to `../services/tokens`. |
| 2.2 | Delete dead code: `updateOrder` (controller **and** service), `getAllUsers`, `userOwnsRestaurant`, `getRestaurantDocumentById`, `getRestaurantByName`, the `req.action` middleware. Confirm each is unreferenced with `grep` and list the greps in the commit message. |
| 2.3 | Orders controller reads `req.user.username` only (delete `getRequestUsername`); remove the `x-user-id`/`username` header injection in `middleware/auth.js`. Behavior-preserving: every orders route is behind `requireAuth`, which already overwrote those headers. Keep the per-request "user still exists" lookup — it produces the pinned deleted-user `404`. |
| 2.4 | One `toApiProduct` (kept in `services/restaurants.js`; `services/products.js` imports it). |
| 2.5 | Add `src/config.js` exporting `{ port, mongoUri, jwtSecret, corsOrigins, bcryptRounds }` with today's defaults (`bcryptRounds` from `BCRYPT_ROUNDS`, default 12, integer 4–31; the test env sets 4 — see decision log), throwing `JWT_SECRET environment variable is required` as today. Replace direct `process.env` reads in `server.js`, `app.js`, `config/db.js`, `services/tokens.js`. Move `config/db.js` → `src/db.js` (`connectDB()` uses `config.mongoUri`). `server.js` keeps `require('dotenv').config()` as its first line. |
| 2.6 | Move to feature folders **one feature per commit**, each named `refactor(structure): move <x> to features/<x>`: **a** search → `features/search/search.{routes,controller,service}.js`; **b** tokens → `features/auth/auth.{routes,controller,service}.js`, and `middleware/auth.js` → `http/auth.js`; **c** users → `features/users/users.{routes,controller,service}.js` + `user.model.js`; **d** restaurants (+ embedded products) → `features/restaurants/` with `restaurant.model.js`, `restaurants.{routes,controller,service}.js`, `products.{controller,service}.js`; **e** orders → `features/orders/orders.{routes,controller,service}.js` + `order.model.js`; **f** `services/seedWorldCupRestaurant.js` → `seed/worldCup.js` (update the import in `seed.test.js` and `server.js`). `app.js` mounts each feature router at the same path. Remove the emptied directories. |

**Exit:**
- [ ] `npm test` green; `git diff <phase-1-end>..HEAD --stat -- web-server/test` shows only the one seed import line.
- [ ] Layout matches ARCHITECTURE.md §2; no `models/ controllers/ services/ routes/ middleware/ config/` directories remain; `grep -rn "process.env" web-server/src` matches only `config.js`.
- [ ] `docker compose build backend` and Appendix A steps 1–6 succeed.

**Rollback:** each task is an isolated commit; revert newest-first. A move commit that fails tests is reverted, not patched.

---

## Phase 3 — Approved behavior fixes, then the refactor they enable

**Entry:** Phase 2 exit checked. Add runtime deps `zod` and `express-rate-limit` in the tasks that first use them.

**Fix protocol (every BF task, one commit, one BF):**
1. Edit the matching `[BF-n]` pin to assert the new behavior (delete the `// PINNED…` comment; add `// Regression: was <old behavior>`). Add any extra regression case listed below.
2. Run it and see it **fail** against the unfixed code.
3. Apply the fix. `npm test` green — every other test unchanged.
4. Commit `fix(api): <summary> (BF-n)` with body `old: … / new: …` and the failing assertion line from step 2.

**Ordering principle:** fixes that make responses uniform (3.1–3.4) come first, so the behavior-preserving refactor (3.5) can use shared helpers without changing any response. Security fixes (3.6–3.10) touch one mechanism each and are independent of 3.5.

**Error precedence (applies from 3.3):** routes check in this order — authentication `401` → request body `400` → path id / unknown resource `404` → role / ownership `403`. This matches every single-fault case pinned in Phase 1; only multi-fault requests may change, which the spec declares non-contract.

| Task | Exact change | Tests |
|---|---|---|
| 3.1 (BF-1) | `src/http/errors.js`: `class AppError extends Error { constructor(status, message) }`. `src/http/errorHandler.js`: `AppError` → `{error: message}` at its status; anything else → `console.error` + `500 {error:'Error processing request'}`. In `app.js`, mount `app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))` after the feature routers and before static/SPA; `errorHandler` last. | flip `[BF-1]`. |
| 3.2 (BF-2) | `errorHandler`: `err.type === 'entity.parse.failed'` → `400 Invalid JSON`; CORS rejection (the `cors` origin callback now passes an `AppError(403, 'Origin not allowed')`) → `403`. | flip both `[BF-2]` pins. |
| 3.3 (BF-3) | `src/http/validate.js` with `objectIdParam(name, notFoundMessage)` → invalid id ⇒ `AppError(404, notFoundMessage)`. Apply to every `:id` (`Restaurant not found`) and `:pId` (`Product not found`) route in `restaurants.routes.js`, after `requireAuth`. Orders already return `404` for invalid ids — unchanged. | flip every `[BF-3]` pin. |
| 3.4a (BF-4) | Add `validate({ body })` to `validate.js` (Zod; first issue's message → `AppError(400, …)`). `features/users/users.schemas.js`, `features/auth/auth.schemas.js` with **custom messages identical to today's strings** (Phase 1 asserts them); add `role` ∈ {`customer`,`restaurant`}, string-typed fields. Mount `validate({ body })` on `POST /users` and `POST /tokens`. | flip user `[BF-4]` pins; all other auth tests unchanged. |
| 3.4b (BF-4) | `features/restaurants/restaurants.schemas.js`: restaurant create/update and product create/update; `price` finite and `≥ 0`; messages `Name is required`, `Missing required fields: name, price`, `Missing required field: body` reproduced. Mount on the restaurant/product `POST`/`PATCH` routes, before `objectIdParam` (precedence above). **Orders keep their existing in-service validation** — it is complete and already returns the contract messages; converting it would add risk for no behavior gain. | flip product `[BF-4]` pins (`POST` `-5` → `400`, `"abc"` → `400`, `PATCH` `"abc"` → `400`). |
| 3.5 (refactor, no BF) | Services throw `AppError` instead of returning `null`/plain `Error`/`statusCode` errors (orders' `orderError` becomes `AppError`); controllers drop HTTP `try/catch`; delete the duplicated validation now covered by schemas (users controller vs. service). Add `features/restaurants/requireRestaurantOwner.js` (loads the restaurant once, sets `req.restaurant`, `AppError(403,'Forbidden')` if `restaurant.username !== req.user.username`) and use it on the five owner routes. The restaurant-role check stays a one-line check in the controller (`AppError(403, 'Only restaurant owners can create restaurants')`) — it is used once, so no `requireRole` helper. | **No test edits.** The whole suite must pass unchanged — that is the proof of no behavior change. Unexpected (non-`AppError`) failures now return the generic `500` instead of echoing an internal message with `400` (orders/restaurant create paths); this is not reachable by a valid or single-fault request, so no pinned test changes. |
| 3.6 (BF-5) | `features/search/search.service.js`: escape the query (`q.replace(/[.*+?^${}()\|[\]\\]/g, '\\$&')`) before `new RegExp(q, 'i')`. | flip `[BF-5]`; add: a restaurant named `A.B` is found by `A.B` and not by `AxB`. |
| 3.7 (BF-6) | `express-rate-limit` on `POST /api/tokens` (with `skipSuccessfulRequests`) and `POST /api/users`; window 15 min, max `config.authRateLimitMax` (env `AUTH_RATE_LIMIT_MAX`, default 20); handler throws `AppError(429, 'Too many requests')`. | replace the `[BF-6]` pin with `test/rate-limit.test.js`, which sets `AUTH_RATE_LIMIT_MAX=5` before requiring `env.js`: 6th bad login → `429`; successful logins do not consume the budget. |
| 3.8 (BF-7) | In the login service, when the user is unknown, `await bcrypt.compare(password, DUMMY_HASH)` (a constant hash of a random string) before returning the same failure. | flip `[BF-7]` (0 calls → 1 call). |
| 3.9 (BF-8) | `jwt.verify(token, secret, { algorithms: ['HS256'] })`. | flip `[BF-8]` (HS512 token → `401 Invalid or expired token`). |
| 3.10 (BF-9) | Global `express.json()` at the default 100 KB; `express.json({ limit: '5mb' })` registered for `POST /api/users` **before** the global parser (restaurant `image` is a URL, so only avatars need the large limit). `errorHandler`: `entity.too.large` → `413 Payload too large`. | flip `[BF-9]` (200 KB → `413`); add: a 1 MB avatar body to `POST /api/users` is not rejected with `413`. |

**Exit:**
- [ ] No test asserts old BF behavior (`grep -rn "PINNED" web-server/test` is empty); each BF commit body quotes its failing assertion.
- [ ] No controller contains `try/catch` for HTTP mapping; all errors flow through `errorHandler`.
- [ ] ARCHITECTURE.md §4 updated: the † markers replaced by the new behavior.
- [ ] `npm audit --omit=dev` reviewed; findings triaged in the decision log (none silently ignored).

**Rollback:** revert the single commit; its test flip reverts with it, restoring the pinned old-behavior test, so the suite stays green. 3.1 is a prerequisite for 3.2–3.10, and 3.3/3.4 for 3.5 — revert dependents first.

---

## Phase 4 — Client alignment

**Entry:** Phase 3 exit checked. Web and mobile API clients stay separate; the backend is not changed in this phase.

| Task | Exact change | Verification |
|---|---|---|
| 4.1 | Walk ARCHITECTURE.md §4 endpoint by endpoint against `web-server/client/src/services/api.js` and `mobile/src/services/api.js`; fix mismatches (e.g. both surface `429`/`413` messages from `{error}`). Web: delete duplicate `registerUser` (use `register`; update the importing page). Mobile: remove unused `normalizeRestaurantList` and the no-op `normalizeOrder`. | Web api tests (1.8) extended; `grep` shows no remaining references; mobile CI job green. |
| 4.2 | World Cup: web `WorldCupFeature.jsx` — remove the stale alert telling users to create the restaurant manually (the server seeds it); replace it with a plain "not available" message. Both clients reference the restaurant name through one named constant per client (`WORLD_CUP_RESTAURANT_NAME`), matching the name documented in ARCHITECTURE.md §6. | Appendix A steps 9 and 12. |
| 4.3 | Delete `mobile/src/screens/EditProfileScreen.js` after re-confirming with `grep` that nothing imports it (it calls a nonexistent `/users/update-profile` route through a nonexistent default `api` export). Remove the no-op `import './services/api'` in `App.jsx`. Any other dead code found in 4.1 is removed only if `grep` confirms it is unreferenced. | `npm run build`, web tests, mobile CI job green. |

**Exit:** [ ] web + mobile CI jobs green; [ ] Appendix A completed on web and on an Android emulator, results noted in Progress; [ ] both clients show the server's `error` text for every status in §4.
**Rollback:** revert commits; no backend or data change is involved.

---

## Phase 5 — Operations and developer experience

**Entry:** Phase 4 exit checked.

| Task | Exact change | Verification |
|---|---|---|
| 5.1 | `web-server/Dockerfile`: `COPY --chown=node:node`, `USER node`. `docker-compose.yml`: publish Mongo as `127.0.0.1:27017:27017`. | `docker compose up -d` works; `docker compose exec backend id -u` ≠ `0`; site works. |
| 5.2 | `GET /api/health` → `200 {status:'ok'}` when `mongoose.connection.readyState === 1`, else `503 {status:'unavailable'}`. Docker `HEALTHCHECK` and compose `healthcheck` call it (with `node -e "fetch(...)"`, since the slim image has no curl). | `test/health.test.js`; backend container reports `healthy`. |
| 5.3 | `web-server/package.json`: `"dev": "node --watch server.js"`. README "Development": Mongo via Compose, `web-server/.env`, `npm run dev` + client `npm start` (proxy from 0.4), tests. | Fresh-clone walkthrough executed once from the README alone. |
| 5.4 | Add `AGENTS.md` (branch policy, commands, conventions, pointers to `docs/`). | Review. |
| 5.5 | README: link the four docs, remove statements that stopped being true. | Review. |

**Exit:** [ ] README-only fresh clone can run the app and the tests; [ ] container non-root and healthy; [ ] all docs match the code; [ ] Progress table complete.
**Rollback:** revert per task. If `USER node` breaks reading `client/build`, revert 5.1 and fix ownership before retrying.

---

## Risks

| Risk | Mitigation |
|---|---|
| Characterization tests encode bugs that later look like requirements | `[BF-n]` titles + `PINNED` comments; flipped one per commit in Phase 3; Phase 3 exit greps for leftovers. |
| Tests written against working code never fail | Phase 1 mutation spot-check; Phase 3 protocol requires seeing each flipped test fail. |
| A "mechanical" move hides a behavior change | Rename-only commits, `git diff -M`, unchanged test files as the proof. |
| Zod messages drift from today's strings | Schemas copy current messages; Phase 1 asserts them. |
| Node 24 breaks CRA 5 or Expo | Verified in Task 0.3; fall back to Node 22, never 20. |
| CRA Jest vs `react-router-dom` v7 | `moduleNameMapper` fallback in Task 1.8. |
| Rate limit trips tests or users behind one NAT | Configurable max; test env sets 1000; successful logins not counted. |
| Contributors without Docker can't run tests | `TEST_MONGODB_URI` accepts any Mongo 7; documented. |
| Mobile has no unit tests | Bundle-compile CI job + manual smoke; add tests only when logic is extracted. |

---

## Appendix A — Manual smoke checklist

Run after Phases 0, 2, and 4 (steps 1–6 via `curl`; 7–10 in the web UI; 11–12 on an Android emulator).

1. `GET /api/restaurants` → array containing `חגיגת מונדיאל` with 20 products.
2. Register a customer and a `restaurant` user.
3. Log in as each; `GET /api/users/<own id>` works with the token.
4. As the restaurant user: create a restaurant, add a product, update it, delete it.
5. As the customer: order from that restaurant; `total` matches the menu.
6. As the customer: order a World Cup dish; fetch the order back.
7. Web: register (with avatar), log in, browse, search, add to cart, place an order, open tracking.
8. Web: as owner, create/edit/delete a restaurant and a product.
9. Web: open the World Cup menu and order one dish.
10. Web: log out; `/orders` redirects to `/login`.
11. Mobile: log in, browse, search, cart, place an order, view orders.
12. Mobile: World Cup screen orders a dish.
