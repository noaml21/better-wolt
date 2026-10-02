# Better Wolt — Development

How to run, look at and test Better Wolt locally. Configuration variables are listed in
[ARCHITECTURE.md §7](ARCHITECTURE.md#7-configuration); branch policy, conventions and invariants are in
[CONTRIBUTING.md](../CONTRIBUTING.md).

**Requirements:** Docker with Compose, and Node.js 24 (`.nvmrc`) for anything run on the host.

## Run the full stack in Docker

1. Copy `.env.example` to `.env` in the repository root.
2. Replace the example value with a long, random `JWT_SECRET`. The backend refuses to start without one.
3. Build and start MongoDB and the backend:

   ```bash
   docker compose up -d --build mongo backend
   ```

4. Open <http://localhost:8080>.

The backend waits for MongoDB to report healthy. Its image builds the React production bundle, and Express serves the
web app and the API together on port `8080`. MongoDB keeps its data in the `mongo-data` volume and is published on
`127.0.0.1:27017` only. Stop the stack with `docker compose down`.

`GET /api/health` returns `{"status":"ok"}` while the API has a live database connection, and `503` otherwise.

### Sample data

A new database holds only the seeded World Cup restaurant. With the API running on `:8080`:

```bash
node docs/dev/demo-data.mjs
```

This adds the sample restaurants and menus seen in the screenshots, a customer `noam` / `noampass1` with two past
orders, and a restaurant owner `chef` / `chefpass1`. It uses the public API only and is safe to run again.

## Fast development loop

Run MongoDB in Docker and the API and web client on the host, with reload:

1. Start MongoDB only: `docker compose up -d mongo`.
2. Create `web-server/.env` with at least `JWT_SECRET=<a long random value>`. The API run outside Docker reads this
   file, not the root one (see `.env.example` for the optional variables).
3. Start the API:

   ```bash
   cd web-server
   npm ci
   npm run dev          # http://localhost:8080, restarts on change
   ```

4. In a second terminal, start the web client:

   ```bash
   cd web-server/client
   npm ci
   npm start            # http://localhost:3000, /api is proxied to :8080
   ```

## Mobile app

Start the backend first. With an Android emulator available:

```bash
cd mobile
npm ci
npx expo start --android
```

The app reads `EXPO_PUBLIC_API_URL` and otherwise uses `http://10.0.2.2:8080/api`, the address at which the
Android emulator reaches the host.

Without an emulator, the same React Native tree runs in a browser through Expo's web target, which is how the mobile
screenshots were taken:

```bash
cd mobile
EXPO_PUBLIC_API_URL=http://localhost:8080/api npx expo start --web
```

The API has to allow the page's origin. `:8081`, Metro's default port, is in the default `CORS_ORIGINS`. For a
different port, add it to `CORS_ORIGINS`. Expo web cannot show native keyboard, safe-area, image-picker or alert
behaviour. That list is kept under "Needs a device" in
[V3_IMPLEMENTATION_PLAN.md](V3_IMPLEMENTATION_PLAN.md#needs-a-device) and
[V4_IMPLEMENTATION_PLAN.md](V4_IMPLEMENTATION_PLAN.md#needs-a-device).

`docker compose --profile mobile up` can also start the Expo dev server in a container. It does not build a native
app.

## Tests and checks

API integration tests run over HTTP against a real MongoDB 7:

```bash
cd web-server
npm ci
npm run test:db:up     # throwaway MongoDB on 127.0.0.1:27018, in memory
npm test
npm run test:db:down
```

Each test file creates and drops its own `bw_test_*` database. To use another MongoDB 7 instance, set
`TEST_MONGODB_URI`.

Web client:

```bash
cd web-server/client
npm test -- --watchAll=false
npx eslint --ext .js,.jsx src      # plain `eslint src` skips .jsx
CI=true npm run build              # CI builds with CI=true, so lint warnings fail the build
```

Mobile:

```bash
cd mobile
npm run lint                           # expo lint
npx expo export --platform android     # the bundle check CI runs
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request, with four jobs:

| Job | What it checks |
|---|---|
| `api` | `npm test` against a `mongo:7` service |
| `web` | Web tests, then the production build |
| `docker` | The backend image builds |
| `mobile` | `npm ci` and the Android bundle export |
