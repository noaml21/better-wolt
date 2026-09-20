# Working in this repository

Project guidance for contributors and coding agents. The documents in `docs/` are authoritative:
[V2_SPEC.md](docs/V2_SPEC.md) (scope, invariants, approved behavior changes) ·
[ARCHITECTURE.md](docs/ARCHITECTURE.md) (layout, conventions, API contract) ·
[EXTENDING.md](docs/EXTENDING.md) (how to add a feature) ·
[V2_IMPLEMENTATION_PLAN.md](docs/V2_IMPLEMENTATION_PLAN.md) (what was done, in order, and why) ·
[V3_DESIGN_SPEC.md](docs/V3_DESIGN_SPEC.md) (V3 design direction, tokens, component language) ·
[V3_IMPLEMENTATION_PLAN.md](docs/V3_IMPLEMENTATION_PLAN.md) (V3 phases and progress).

## Git

- V3 (the client redesign) happens on `v3/ui-overhaul`, branched from the V2 HEAD `98d2477`. V2 work happened on
  `v2/extensible-architecture`. Do not commit to or merge into `main`, and do not modify the V2 branch.
- Never reset, clean, discard, force-push or rewrite history; recover with `git revert`.
- One concern per commit, with the verification you actually ran in the message.

## Commands

```bash
cd web-server && npm ci
npm run test:db:up && npm test        # API integration tests (real MongoDB 7 on :27018)
npm run test:db:down
npm run dev                           # API with reload (needs web-server/.env with JWT_SECRET)

cd web-server/client && npm ci
npm test -- --watchAll=false          # web tests
npm run build                         # CI builds with CI=true, so lint warnings fail the build

cd mobile && npm ci
npx expo export --platform android    # what CI checks for the mobile app

JWT_SECRET=... docker compose up -d --build mongo backend   # full stack on :8080
```

Node version comes from `.nvmrc` (24). CI (`.github/workflows/ci.yml`) runs the API tests against a `mongo:7` service,
the web tests and build, the backend image build, and the mobile bundle.

## Conventions

- Backend code is organized by feature under `web-server/src/features/<name>/`, with `routes → controller → service → model`.
  A feature may import another feature's **service** (and the restaurants feature's `requireRestaurantOwner`), never its
  controller, routes or model. Only `src/config.js` reads `process.env`.
- Validate input with Zod at the route boundary (`http/validate.js`); services assume validated input and signal expected
  failures with `AppError(status, message)`. Controllers have no `try/catch` for HTTP mapping.
- Route middleware order: `requireAuth` (401) → `validate({ body })` (400) → `objectIdParam` (404) → role/ownership (403).
- Error responses are always `{ "error": "<message>" }`; never return driver or stack text.
- Tests are black-box over HTTP (`web-server/test/*.test.js`), one database per file. Add tests with the feature, and cover
  the happy path, an auth failure, a validation failure and, where relevant, a cross-user failure.
- Do not add microservices, a DI container, generic repositories, an event bus, a plugin system, or a shared web/mobile
  package. Keep the web and mobile API clients separate and aligned through ARCHITECTURE §4.

## Invariants (do not break)

- Order pricing is server-authoritative: clients send only product ids and quantities (V2_SPEC §3.1).
- The authorization matrix in V2_SPEC §3.2, including "another user's order is 404, not 403".
- Response shapes, status codes and the error strings listed in ARCHITECTURE §4.3 are contract; both clients display them.
- The World Cup restaurant is seeded server-side, and its name and dish names are contract (ARCHITECTURE §6).
