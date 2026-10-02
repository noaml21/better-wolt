# Better Wolt — web client

The React 19 web app for Better Wolt (Create React App, React Router 7), right-to-left and in Hebrew. In production,
Express serves its build next to the API on port `8080`. Pages are in `src/pages`, shared UI in `src/components`, and
the API client in `src/services/api.js`.

From the repository root, with the API running on `:8080`:

```bash
(cd web-server/client && npm ci && npm start)                      # http://localhost:3000, /api proxied to :8080
(cd web-server/client && npm test -- --watchAll=false)             # tests
(cd web-server/client && CI=true npm run build)   # production build; lint warnings fail it, as in CI
```

How to start the API, the rest of the stack and the other checks: [docs/DEVELOPMENT.md](../../docs/DEVELOPMENT.md).
The project overview is in the [root README](../../README.md).
