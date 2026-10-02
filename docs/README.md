# Better Wolt — Documentation

Start with the first two sections. The project history at the end records how the codebase got here, one pass at a
time.

## Start here

| Document | What it covers |
|---|---|
| [Project README](../README.md) | What Better Wolt is, highlights, quick start |
| [Showcase](SHOWCASE.md) | Every V4 screen on web and mobile, and the design language |
| [Development](DEVELOPMENT.md) | Running the stack and the mobile app, sample data, tests, CI |

## Architecture and API

| Document | What it covers |
|---|---|
| [Architecture](ARCHITECTURE.md) | Backend layout, layering rules, the request lifecycle, the full API contract, data model, clients, configuration, testing, security measures and known limitations |
| [Extending the backend](EXTENDING.md) | Adding a feature step by step, with worked examples and a definition of done |
| [V2 spec §3: invariants](V2_SPEC.md#3-invariants-must-survive-every-phase) | Rules still in force: server-side pricing, the authorization matrix, response contracts |

## Design

| Document | What it covers |
|---|---|
| [V4 design spec](V4_DESIGN_SPEC.md) | The current visual system: principles, colour, type, components, screens, motion, RTL, accessibility |
| [V4 visual audit](V4_VISUAL_AUDIT.md) | The browser audit of V3 that V4 answers, with the status of every finding |
| [V3 design spec](V3_DESIGN_SPEC.md) | The foundation V4 builds on: design tokens, navigation models, component language |

## Contributing

[AGENTS.md](../AGENTS.md) holds the branch policy, the commands, the conventions and the invariants for anyone,
human or agent, who changes the code.

## Project history

Each pass after the original course release has a spec, which records what it set out to do and why, and a plan,
which records what was built, in what order and how it was verified. They are kept as a record. For the current
state, read the documents above.

| Pass | Branch | Spec | Plan | Screenshots |
|---|---|---|---|---|
| V1: course release | `main` before the V4 merge (`1adfcfc`) | — | — | [v1](screenshots/v1) |
| V2: feature-based backend, integration tests, CI | `v2/extensible-architecture` | [V2_SPEC](V2_SPEC.md) | [V2_IMPLEMENTATION_PLAN](V2_IMPLEMENTATION_PLAN.md) | [v2](screenshots/v2) |
| V3: both clients redesigned | `v3/ui-overhaul` | [V3_DESIGN_SPEC](V3_DESIGN_SPEC.md) | [V3_IMPLEMENTATION_PLAN](V3_IMPLEMENTATION_PLAN.md) | [v3](screenshots/v3) |
| V4: premium frontend pass | `v4/premium-frontend`, merged into `main` | [V4_DESIGN_SPEC](V4_DESIGN_SPEC.md) · [audit](V4_VISUAL_AUDIT.md) | [V4_IMPLEMENTATION_PLAN](V4_IMPLEMENTATION_PLAN.md) | [v4](screenshots/v4) |

## Other files here

- [`dev/demo-data.mjs`](dev/demo-data.mjs) adds the sample restaurants and demo accounts over the API (see
  [Development](DEVELOPMENT.md#sample-data)).
- [`screenshots/`](screenshots) holds the captures for every version, in one folder per version.
