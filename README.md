# Better Wolt

Better Wolt is an educational, Wolt-inspired full-stack food-delivery platform with a React web client, a React Native/Expo mobile client, and a shared Node.js/Express REST API backed by MongoDB.

This project is not affiliated with or endorsed by Wolt.

**Course project final grade: 97/100**

## Key Features

- Customer and restaurant-owner account registration and sign-in
- JWT-based authentication for protected API operations
- Restaurant and menu creation, editing, and deletion for restaurant owners
- Server-side authorization and ownership checks for restaurant and menu changes
- Restaurant search by name, address, menu item, or menu description
- Cart with per-dish quantity controls, and authenticated, server-priced order placement
- Order history and a live order-tracking screen on both clients
- A designed Hebrew, right-to-left interface on web and mobile, with a shared design-token system,
  a light and a dark theme, and a designed loading, empty and error state on every screen
- React web application served by the backend in production
- React Native mobile application developed with Expo, on bottom-tab navigation with safe-area handling
- A World Cup campaign on both clients: a flag grid, cart-based ordering, and opt-in audio on the web
- Dockerized backend and MongoDB services with persistent database storage

## Screenshots

The V4 interface. Every screen is right-to-left Hebrew; the full set is in
[docs/screenshots/v4](docs/screenshots/v4), and the V3 and V2 interfaces before it are in
[docs/screenshots/v3](docs/screenshots/v3) and [docs/screenshots/v2](docs/screenshots/v2).

### Web

<p align="center">
  <img src="docs/screenshots/v4/web-home-desktop.jpg" alt="Better Wolt web home page: the night search band with photo links to restaurants, the order-again row, the World Cup strip and the restaurant grid" width="850">
</p>

<p align="center">
  <img src="docs/screenshots/v4/web-restaurant-desktop.jpg" alt="Restaurant page: the name set on the photo, the menu as one list with quiet add controls, and the cart panel with the total in its button" width="420">
  &nbsp;
  <img src="docs/screenshots/v4/web-tracking.jpg" alt="Order tracking: the arrival time, the minutes left and four stages with their times" width="420">
</p>

<p align="center">
  <img src="docs/screenshots/v4/web-orders.jpg" alt="Orders: what is on its way first, then history grouped by day with reorder links" width="420">
  &nbsp;
  <img src="docs/screenshots/v4/web-home-dark.jpg" alt="The home page in the dark theme" width="420">
</p>

### Mobile

<p align="center">
  <img src="docs/screenshots/v4/mobile-home.jpg" alt="Mobile home: search, quick searches, the order-again row, the World Cup strip and restaurant cards" width="240">
  &nbsp;
  <img src="docs/screenshots/v4/mobile-restaurant.jpg" alt="Mobile restaurant screen: the name on the photo, the menu as one list and the cart bar" width="240">
  &nbsp;
  <img src="docs/screenshots/v4/mobile-tracking.jpg" alt="Mobile order tracking with the arrival time and a vertical stage timeline" width="240">
</p>

<p align="center">
  <img src="docs/screenshots/v4/mobile-world-cup.jpg" alt="The World Cup campaign on mobile as one list with flags" width="240">
  &nbsp;
  <img src="docs/screenshots/v4/mobile-cart.jpg" alt="Mobile cart with steppers, the total and the order button carrying it" width="240">
  &nbsp;
  <img src="docs/screenshots/v4/mobile-orders.jpg" alt="Mobile orders: on the way, then history by day" width="240">
</p>

## Architecture

```text
React Web -----------\
                      -> Node.js / Express REST API -> MongoDB
React Native / Expo -/
```

The web and mobile applications consume the same REST API. The production backend image builds the React client and serves its static output alongside the API, while the Expo application connects to the API over HTTP.

The backend is organized by feature (`web-server/src/features/<name>/` with `routes → controller → service → model`), with shared HTTP plumbing in `src/http/`. See the documentation below for the structure, the API contract, and how to add a feature.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — structure, conventions and the full API contract
- [docs/EXTENDING.md](docs/EXTENDING.md) — how to add a backend feature, with a worked example
- [docs/V2_SPEC.md](docs/V2_SPEC.md) — scope, invariants and the deliberate behavior changes
- [docs/V2_IMPLEMENTATION_PLAN.md](docs/V2_IMPLEMENTATION_PLAN.md) — the phased plan and what was verified
- [docs/V3_DESIGN_SPEC.md](docs/V3_DESIGN_SPEC.md) — the V3 design: identity, tokens, component language, accessibility
- [docs/V3_IMPLEMENTATION_PLAN.md](docs/V3_IMPLEMENTATION_PLAN.md) — the V3 phases, what was built and how it was verified
- [docs/V4_VISUAL_AUDIT.md](docs/V4_VISUAL_AUDIT.md) — the audit of V3 in the browser that V4 answers
- [docs/V4_DESIGN_SPEC.md](docs/V4_DESIGN_SPEC.md) — the V4 design: principles, type, components, motion
- [docs/V4_IMPLEMENTATION_PLAN.md](docs/V4_IMPLEMENTATION_PLAN.md) — the V4 phases, what was built and how it was verified
- [AGENTS.md](AGENTS.md) — branch policy, commands and conventions for contributors

## Tech Stack

### Backend

- Node.js
- Express
- Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs`
- Zod for request validation
- `express-rate-limit`
- CORS and environment-based configuration
- `node:test` and `supertest` for integration tests against MongoDB 7

### Web

- React
- React Router
- Create React App / `react-scripts`
- CSS custom properties as design tokens (`client/src/styles/tokens.css`), CSS logical properties for RTL,
  and a small `components/ui` primitive set — no UI framework
- Suez One and Rubik from Google Fonts

### Mobile

- React Native
- Expo
- React Navigation (native stack + bottom tabs with a custom RTL tab bar)
- `react-native-safe-area-context` for notches and gesture bars
- `react-native-svg` for the icon set and the logo
- A theme module (`mobile/src/theme/`) holding the same tokens as the web client, and a `src/ui` primitive set
- AsyncStorage
- Expo Image Picker

### Database

- MongoDB
- Mongoose schemas for users, restaurants, embedded menu products, and orders

### Infrastructure

- Docker and Docker Compose
- Multi-stage backend image that builds and embeds the React production bundle, runs as a non-root user and exposes a health check
- MongoDB health check and named volume for persistence
- GitHub Actions CI

## Security / Backend Design

- Passwords are hashed with bcrypt before storage.
- Protected endpoints authenticate bearer tokens using JWTs.
- Restaurant and menu mutations are authorized against the authenticated restaurant owner.
- Order creation is server-authoritative: the API resolves products from the selected restaurant, snapshots item names and prices, calculates item counts and totals, and sets the initial status and timestamps.
- Clients submit product identifiers and quantities; they cannot choose authoritative order prices, totals, or status values.
- Request bodies are validated with Zod at the route boundary; errors are returned as `{ "error": "..." }` without driver or stack text.
- Login and registration are rate limited per IP, unknown usernames still run a bcrypt comparison (so timing does not reveal which accounts exist), and only HS256 tokens are accepted.
- JSON bodies are limited to 100 KB, except registration (5 MB) which may carry an avatar.
- Search queries are matched literally, not as regular expressions.
- The API container runs as a non-root user, and MongoDB is published on `127.0.0.1` only.
- Sensitive payment-card data is not collected or stored. The project does not implement payment processing.

## Project Structure

```text
web-server/             Node.js/Express API (src/features/...) and the React web client
web-server/test/        API integration tests (node:test + supertest)
mobile/                 React Native/Expo mobile client
docs/                   Architecture, API contract, extension guide, the V2–V4 specs and plans, screenshots
docker-compose.yml      Backend, MongoDB and the optional Expo dev server
docker-compose.test.yml Throwaway MongoDB for the test suite
.github/workflows/      CI: API tests, web tests and build, image build, mobile bundle
.env.example            Required environment-variable template
```

## Running the Web Application

Docker and Docker Compose are required.

1. Copy `.env.example` to `.env`.
2. Replace the example value in `.env` with a long, random `JWT_SECRET`.
3. Build and start MongoDB and the backend:

   ```bash
   docker compose up --build mongo backend
   ```

4. Open [http://localhost:8080](http://localhost:8080).

The backend container waits for MongoDB to become healthy, builds the React production client, and serves both the web application and the API on port `8080`.

## Running the Mobile Application

Start the backend before launching the mobile client. With an Android emulator available, run:

```bash
cd mobile
npm ci
npx expo start --android
```

The existing mobile API configuration reads `EXPO_PUBLIC_API_URL` when supplied and otherwise falls back to `http://10.0.2.2:8080/api`, which maps the Android emulator to the backend running on the host machine.

## Development

For a fast edit-reload loop, run MongoDB in Docker and the API and web client on the host:

1. Start MongoDB only: `docker compose up -d mongo` (published on `127.0.0.1:27017`).
2. Create `web-server/.env` with at least `JWT_SECRET=<a long random value>`. See `.env.example` for the optional variables.
3. Start the API with reload on change:

   ```bash
   cd web-server
   npm ci
   npm run dev          # http://localhost:8080
   ```

4. In a second terminal, start the web client:

   ```bash
   cd web-server/client
   npm ci
   npm start            # http://localhost:3000, /api is proxied to :8080
   ```

`GET /api/health` returns `{"status":"ok"}` when the API has a live database connection, and `503` otherwise.

## Testing

The API integration tests run against a real MongoDB 7 (Docker required for the local database):

```bash
cd web-server
npm ci
npm run test:db:up     # throwaway MongoDB on 127.0.0.1:27018 (in memory)
npm test
npm run test:db:down
```

To use another MongoDB 7 instance instead, set `TEST_MONGODB_URI` (each test file creates and drops its own `bw_test_*` database).

Web client tests: `cd web-server/client && npm test -- --watchAll=false`.

## Design

The interface is specified in [docs/V4_DESIGN_SPEC.md](docs/V4_DESIGN_SPEC.md), which evolves
[docs/V3_DESIGN_SPEC.md](docs/V3_DESIGN_SPEC.md). In short: warm paper surfaces, a deep aubergine ink, one pomegranate
action colour and an amber highlight. Food is loud and chrome is quiet: photography leads, a restaurant without a
photo gets a designed plate in its own tint, and a menu reads like a menu — one list, the dish name first, a small
round add control rather than a button per row. Prices, totals and times are exact: tabular figures, never the
display face. Problems at checkout are written beside the cart and stay until they are dealt with, and a price the
server corrected is explained on the tracking page. Motion only answers an action (the cart bar rising, a count
bumping) or the passing of time (the tracking stages), and stops under the operating system's reduced-motion
setting. Hebrew is the layout, not a patch: CSS logical properties and plaintext bidi for what people type on the web,
a direction-aware layer in the mobile theme, and no `I18nManager.forceRTL`.

## Special World Cup Feature

The World Cup experience is an intentional product and UI feature beyond the core restaurant-browsing and ordering
flow. It presents country-themed dishes through a dedicated web page (`/world-cup`) and mobile screen, with a flag
grid, ordering through the ordinary cart, and background music on the web that plays only when it is asked for.

These dishes are not client-only mock data: the backend seeds a dedicated restaurant and menu as real MongoDB records. Orders placed through the feature use those persisted product identifiers and pass through the same authenticated, server-authoritative order flow as standard restaurant orders.

## Team Project

Better Wolt was jointly developed as a collaborative team project. Its web, mobile, backend, database, and infrastructure elements are presented as the result of the team's shared work rather than as individually owned subsystems.

## Disclaimer

Better Wolt is an educational project inspired by Wolt. It is not affiliated with, sponsored by, or endorsed by Wolt. Wolt and all other third-party trademarks and assets remain the property of their respective owners.
