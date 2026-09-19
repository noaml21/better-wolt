# Better Wolt — Architecture

Authoritative description of how Better Wolt is structured and the conventions contributors follow.
Scope and decisions: [V2_SPEC.md](V2_SPEC.md). Order of work: [V2_IMPLEMENTATION_PLAN.md](V2_IMPLEMENTATION_PLAN.md).
How to add a feature: [EXTENDING.md](EXTENDING.md).

> **Status note.** Sections marked **(V2, Phase N)** describe the target and become true when that phase lands; the plan's
> Progress table records what has landed. Everything else describes the code today. §4 was derived from the current code and is
> what the Phase 1 test suite pins.

## 1. System overview

```text
React web (CRA) ──────┐
                      ├─►  Express 5 REST API  ─►  MongoDB 7
React Native / Expo ──┘        (web-server/)
```

- `web-server/` — the API (`server.js`, `src/`) **and** the React web client (`client/`). In production the Docker image builds the
  client and Express serves `client/build` behind the API.
- `mobile/` — Expo app; talks to the same API over HTTP (`EXPO_PUBLIC_API_URL`, default `http://10.0.2.2:8080/api`).
- Data: MongoDB via Mongoose. Collections: `users`, `restaurants` (with embedded `products`), `orders`.
- Auth: JWT bearer tokens (`Authorization: Bearer <token>`), passwords hashed with bcrypt.

## 2. Backend layout

### Today (V1)
```text
server.js                   loads dotenv, connects DB, seeds, listens
src/app.js                  CORS, JSON parser, routers, static + SPA fallback
src/routes|controllers|services|models|middleware|config/   one file per resource per layer
src/models/<plural>.js      one-line re-exports of services (removed in Phase 2)
```

### Target **(V2, Phase 2)**
```text
web-server/
  server.js                       process entry: connect DB, seed, listen
  src/
    app.js                        builds the Express app; mounts feature routers
    config.js                     the only reader of process.env
    db.js                         connectDB()
    http/                         only plumbing used by several features
      auth.js                     requireAuth
      errors.js                   AppError(status, message)                  (Phase 3)
      errorHandler.js             one JSON error middleware                  (Phase 3)
      validate.js                 validate({ body }), objectIdParam(name, msg) (Phase 3)
    features/
      auth/         auth.routes.js  auth.controller.js  auth.service.js  auth.schemas.js
      users/        users.{routes,controller,service,schemas}.js  user.model.js
      restaurants/  restaurants.{routes,controller,service,schemas}.js  products.{controller,service}.js
                    restaurant.model.js  requireRestaurantOwner.js       (owner check: Phase 3)
      orders/       orders.{routes,controller,service}.js  order.model.js  (validation stays in the service)
      search/       search.{routes,controller}.js    (the query lives in restaurants.service)
    seed/worldCup.js              idempotent seed of the World Cup restaurant
  test/                           black-box integration tests (flat), helpers/
  client/                         React web app (unchanged layout)
```

| Today | Target |
|---|---|
| `routes/users.js`, `controllers/users.js`, `services/users.js`, `models/User.js` | `features/users/users.routes.js`, `.controller.js`, `.service.js`, `user.model.js` |
| `routes/tokens.js` + `controllers/tokens.js` + `services/tokens.js` | `features/auth/auth.*.js` (URL stays `/api/tokens`) |
| `middleware/auth.js` | `http/auth.js` |
| `services/products.js`, `controllers/products.js` | `features/restaurants/products.service.js`, `products.controller.js` (products are embedded in a restaurant) |
| `services/seedWorldCupRestaurant.js` | `seed/worldCup.js` |
| `models/{users,orders,products,restaurants,search,tokens}.js` | deleted (shims) |

## 3. Conventions

### 3.1 Layering and dependencies
`routes → controller → service → model`. A feature may import **another feature's service** (and `requireRestaurantOwner`);
never its controller, routes, or model.
Nothing outside `config.js` reads `process.env`. There is no DI container, plugin loader, or generic repository: services use their
Mongoose models directly.

| File | Responsibility | Must not |
|---|---|---|
| `*.routes.js` | Map method + path → middleware chain (`requireAuth`, `validate`, controller). | Contain logic. |
| `*.controller.js` | Read validated `req`, call a service, choose the success status/body. | Query the DB, hand-write validation, `try/catch` for HTTP mapping *(from Phase 3)*. |
| `*.service.js` | Business rules and DB access; throw `AppError` for expected failures; return plain API-shaped objects. | Touch `req`/`res`. |
| `*.model.js` | Mongoose schema + the `toApi…` mapper for that entity. | Contain business rules. |
| `*.schemas.js` | Zod schemas for that feature's inputs. | Import Express. |

A feature creates only the files it needs (search has only routes and a controller; it calls
`restaurants.service.searchRestaurants`). Only the seed, which is not a feature, imports another folder's model. Put code in `http/` only when a second feature
actually uses it; until then it stays in its feature folder.

### 3.2 Request lifecycle **(V2, Phase 3)**
`cors → body parser → /api routers (requireAuth → validate → controller → service) → /api 404 → SPA static + fallback → errorHandler`.
Express 5 forwards a rejected promise from an async handler to the error middleware, so handlers simply `throw new AppError(404, 'Restaurant not found')`.

### 3.3 Errors **(V2, Phase 3)**
Every error response is `{ "error": "<message>" }`. `AppError(status, message)` is the only way services signal expected failures.
`errorHandler` also maps: invalid JSON → `400 Invalid JSON`; oversize body → `413 Payload too large`; disallowed CORS origin →
`403 Origin not allowed`; rate limit → `429 Too many requests`; anything unexpected → logged, `500 Error processing request`.
Driver/Mongoose messages are never returned to clients.

### 3.4 Validation **(V2, Phase 3)**
Zod schemas per feature validate the body in `validate({ body })`; the first issue's message becomes `400 {error}`.
Path ids use `objectIdParam(name, notFoundMessage)` → an invalid id is a `404`, the same as a missing document. Where a message is
in §4.3, the schema reproduces it exactly. Order input is the exception: `orders.service.createOrder` keeps its existing checks.

Route middleware order (one rule for every route): `requireAuth` (401) → `validate({ body })` (400) → `objectIdParam` / lookup
(404) → role or `requireRestaurantOwner` (403) → controller.

### 3.5 Authentication and authorization
- `requireAuth` verifies the bearer token and sets `req.user = { id, username, displayName, role, iat, exp }` (rejects: `401`).
- Role checks are a one-line check in the controller (`req.user.role !== 'restaurant'` → `AppError(403, …)`); there is one such
  check today, so there is no role middleware.
- `features/restaurants/requireRestaurantOwner.js` *(V2, Phase 3)* loads the restaurant once, sets `req.restaurant`, and returns
  `403 Forbidden` unless `restaurant.username === req.user.username`. Today this check is copy-pasted in five handlers. Another
  feature that needs the same rule may import it (it is the restaurants feature's public middleware).
- Authorization rules are in [V2_SPEC.md §3.2](V2_SPEC.md#32-authorization-matrix).

### 3.6 Order pricing
`orders.service.createOrder` is the only place order prices are computed. It never reads `price`, `total`, `status`, `username`,
`items`, or `date` from the request. Do not add code paths that do.

## 4. API contract

Base path `/api`. JSON in, JSON out. Errors: `{ "error": string }`. `201` responses carry a `Location` header. Ids are Mongo ObjectId strings.
Rows marked † change in Phase 3 (BF-n); the "Now" column is the current behavior pinned by Phase 1 tests.

### 4.1 Entities
```text
User      { id, username, displayName, email, address, image, role }        role ∈ customer | restaurant
Product   { id, name, description, price }
Restaurant{ id, username, name, phone, address, image, products: Product[] }
Order     { id, username, restaurant, restaurantName, products: string[],
            orderItems: [{ productId, name, price, quantity }], items, total,
            status, date: 'YYYY-MM-DD', startTime: epoch-ms }
Login     { token, user: { id, username, displayName, image, role } }
JWT claims{ id, username, displayName, role, iat, exp }  (HS256, 24 h)
```

### 4.2 Endpoints

| Method + path | Auth | Success | Errors (Now) |
|---|---|---|---|
| `POST /users` body `{username,password,displayName,address,email,image?,role?}` | – | `201 {id}` | `400` missing/weak password/duplicate; `500` bad types or role †BF-4 |
| `GET /users/:id` | self only | `200 User` | `401`, `403` (not self), `404` |
| `POST /tokens` body `{username,password}` | – | `200 Login` | `400` missing, `401` invalid; `429` after BF-6 |
| `GET /restaurants` | – | `200 Restaurant[]` | `500` |
| `POST /restaurants` body `{name,phone?,address?,image?}` | role `restaurant` | `201 Restaurant` | `400`, `401`, `403`, duplicate name `400` |
| `GET /restaurants/:id` | – | `200 Restaurant` | `404` (incl. invalid id) |
| `PATCH /restaurants/:id` | owner | **`204`** (no body) | `403`, `404`, `400`; invalid id → `400` cast text †BF-3 |
| `DELETE /restaurants/:id` | owner | `204` | `403`, `404`; invalid id `500` †BF-3 |
| `GET /restaurants/:id/products` | – | `200 Product[]` | `404`; invalid id `500` †BF-3 |
| `POST /restaurants/:id/products` body `{name,price,description?}` | owner | `201 Product` | `400`, `403`, `404`; invalid id `500` †BF-3; price `-5` accepted, `"abc"` `500` †BF-4 |
| `GET /restaurants/:id/products/:pId` | – | `200 Product` | `404`; invalid id `500` †BF-3 |
| `PATCH /restaurants/:id/products/:pId` | owner | **`200 Product`** | `400` (no body), `403`, `404`; invalid id `500` †BF-3; price `"abc"` `500` †BF-4 |
| `DELETE /restaurants/:id/products/:pId` | owner | `204` | `403`, `404`; invalid id `500` †BF-3 |
| `POST /orders` body `{restaurant, products:[{id, quantity}]}` | user | `201 Order` | `400`, `401`, `404` |
| `GET /orders` | user | `200 Order[]` (own) | `401`, `404` |
| `GET /orders/:id` | owner | `200 Order` | `401`, `404` (also for other users' orders) |
| `DELETE /orders/:id` | owner | `204` | `401`, `404` |
| `GET /search/:query` | – | `200 Restaurant[]` | `400` blank; `.*` matches all, `(` → `500` †BF-5 |
| `GET /health` *(Phase 5)* | – | `200 {status:'ok'}` | `503` |

Unknown `/api/*` path: `200` SPA HTML today †BF-1 → `404 {error:'Not found'}`.
The statuses above are for single-fault requests. When a request is wrong in several ways, which error wins is not contract
(spec §5).
Note the existing asymmetry (restaurant `PATCH` → `204`, product `PATCH` → `200`); it is kept.

### 4.3 Error strings that are contract (clients display them)
`Missing required fields: username, password, displayName, address, email` · `Password must be 8-72 UTF-8 bytes and contain at least one letter and one digit` ·
`Username already taken` · `Missing required field: body` · `Missing required fields: username, password` · `Invalid username or password` ·
`Unauthorized` · `Invalid authorization header` · `Invalid or expired token` · `Forbidden` · `User not found` · `Name is required` ·
`Only restaurant owners can create restaurants` · `Restaurant with this name already exists` · `Restaurant not found` · `Product not found` ·
`Missing required fields: name, price` · `Missing search query` · `Bad Request` · `Order must contain at least one product` ·
`Quantity must be a positive integer` · `Each product must include an id and quantity` · `Product not found in restaurant menu` ·
`Invalid username` (order routes, deleted user or someone else's order) · `Not Found` (order not found) · `Error processing request`.

## 5. Data model (unchanged in V2)

| Model | Notes |
|---|---|
| `User` | `username` unique; `password` is a bcrypt hash; `image` is a base64 data URL; `role` enum. |
| `Restaurant` | `name` unique; `username` = owner's username; embedded `products` (own `_id`); `image` is a URL string. |
| `Order` | `restaurant` is a **string** id; `products` (flat ids, one per unit) duplicates `orderItems`; `status` is the Hebrew display string `בדרך 🛵`; `date` string + `startTime` ms + `timestamps`. |

## 6. Clients

- **Separate API clients** — `web-server/client/src/services/api.js` and `mobile/src/services/api.js`. They are not merged; both
  must follow §4 (error body `{error}`; `204`/empty body → `null`; send `Authorization: Bearer <token>` on protected routes).
  Contract changes update §4 first, then both clients in the same phase.
- **Token storage** — web `localStorage` (`token`, `user`), mobile `AsyncStorage`. Web restores a session only if the JWT is unexpired.
- **Order tracking** — the web tracking page derives progress from `startTime`; the server never advances `status` in V1/V2.
- **World Cup** — the server seeds the restaurant (`seed/worldCup.js`). **Contract:** the restaurant's name is exactly
  `חגיגת מונדיאל`, and its product names equal the `dishName` values in the clients' presentation lists (web
  `WorldCupFeature.jsx`, mobile `WorldCupScreen.js`). Web finds the restaurant in `GET /restaurants`; mobile via
  `GET /search/:query`. Renaming the restaurant or a dish means changing the seed and both clients in one commit.
- **Cart** — mobile keeps a `CartContext` (single restaurant at a time); web keeps cart state in `RestaurantPage`. Neither is trusted:
  totals are recomputed by the server.
- **Large screens** — several mobile screens are 300–680 lines. They are split only when a change touches them, not as a V2 task.

## 7. Configuration

Read only in `src/config.js` *(V2, Phase 2)*.

| Variable | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | none — process refuses to start | HS256 signing key |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/better_wolt` | Database |
| `PORT` | `8080` | Listen port |
| `BCRYPT_ROUNDS` | `12` | bcrypt cost factor (integer 4–31); the test suite uses 4 |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:8080,http://localhost:8081,http://localhost:19006` | Comma-separated allowlist |
| `AUTH_RATE_LIMIT_MAX` | `20` | Attempts per 15 min per IP on login (failed only) and registration (all) |
| `NODE_ENV` | – | `production` in the Docker image |
| `TEST_MONGODB_URI` | `mongodb://127.0.0.1:27018/better_wolt_test` | Tests only |
| `EXPO_PUBLIC_API_URL` | `http://10.0.2.2:8080/api` | Mobile API base |

Docker Compose reads the repo-root `.env`; running the API outside Docker reads `web-server/.env` (dotenv, current directory).

## 8. Testing

- `web-server/test/*.test.js`, `node:test` + `supertest`, against real MongoDB 7 (`npm run test:db:up && npm test`).
- Black-box over HTTP, one database per test file (`bw_test_*`); helpers in `test/helpers/`.
- Every endpoint: happy path, auth failure, validation failure, and ownership/cross-user failure where applicable.
- Web: Jest via `react-scripts test` (API client, `ProtectedRoute`). Mobile: bundle-compile check in CI.
- CI: `.github/workflows/ci.yml` (`api`, `web`, `docker`, `mobile`).

## 9. Known limitations (intentional, documented)

Self-selected `role` at registration; role embedded in a 24 h JWT with no revocation; web token in `localStorage`; ownership by
`username`; `Order.restaurant` as a string; display-string `status`; base64 avatars in Mongo; seed can race when two instances start
simultaneously; no pagination on list endpoints; a stray `Connection`/`Keep-Alive` header middleware. See the spec's "not changed" list.
