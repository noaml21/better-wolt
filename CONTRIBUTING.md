# Contributing to Better Wolt

How changes are made in this repository. To run the stack, the mobile app and the tests, see
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md). The documents in [`docs/`](docs/README.md) are the source of truth for
scope, architecture and design. Where this page and those documents disagree, the documents win.

## Branches and commits

- Make changes on a topic branch and open a pull request to `main`. Do not push to `main` directly.
- `v2/extensible-architecture`, `v3/ui-overhaul` and `v4/premium-frontend` record earlier passes
  ([project history](docs/README.md#project-history)). Leave them unchanged.
- Never force-push or rewrite published history. Undo a commit with `git revert`.
- Keep each commit to one concern, and say in the message which checks you ran.

## Checks before a pull request

```bash
cd web-server && npm ci
npm run test:db:up && npm test        # API integration tests (real MongoDB 7 on :27018)
npm run test:db:down

cd web-server/client && npm ci
npm test -- --watchAll=false          # web tests
CI=true npm run build                 # CI builds with CI=true, so lint warnings fail the build

cd mobile && npm ci
npx expo export --platform android    # the mobile bundle check CI runs
```

CI (`.github/workflows/ci.yml`) runs the same checks on every push and pull request: the API tests against a
`mongo:7` service, the web tests and build, the backend image build and the mobile bundle. Node comes from `.nvmrc`
(24).

## Conventions

- Backend code is organized by feature under `web-server/src/features/<name>/`, as `routes → controller → service →
  model`. A feature may import another feature's **service** (and the restaurants feature's `requireRestaurantOwner`),
  never its controller, routes or model. Only `src/config.js` reads `process.env`.
- Validate input with Zod at the route boundary (`http/validate.js`). Services assume validated input and signal
  expected failures with `AppError(status, message)`. Controllers have no `try/catch` for HTTP mapping.
- Route middleware runs in this order: `requireAuth` (401) → `validate({ body })` (400) → `objectIdParam` (404) →
  role or ownership check (403).
- Error responses are always `{ "error": "<message>" }`. Never return driver or stack text.
- Tests are black-box over HTTP (`web-server/test/*.test.js`), one database per file. Add tests with the feature, and
  cover the happy path, an auth failure, a validation failure and, where relevant, a cross-user failure.
- Do not add microservices, a DI container, generic repositories, an event bus, a plugin system or a shared web/mobile
  package. Keep the web and mobile API clients separate, aligned through
  [ARCHITECTURE §4](docs/ARCHITECTURE.md#4-api-contract).

[EXTENDING.md](docs/EXTENDING.md) walks through adding a backend feature with these rules.

## Invariants

These must hold after every change:

- Order pricing is server-authoritative. Clients send only product ids and quantities
  ([V2_SPEC §3.1](docs/V2_SPEC.md#31-order-pricing-is-server-authoritative)).
- The [authorization matrix](docs/V2_SPEC.md#32-authorization-matrix) holds, including "another user's order is 404,
  not 403".
- Response shapes, status codes and the error strings listed in
  [ARCHITECTURE §4.3](docs/ARCHITECTURE.md#43-error-strings-that-are-contract-clients-display-them) are contract.
  Both clients display them.
- The World Cup restaurant is seeded server-side, and its name and dish names are contract
  ([ARCHITECTURE §6](docs/ARCHITECTURE.md#6-clients)).
