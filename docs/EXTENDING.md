# Extending the Backend

How to add a backend feature (for example **reviews** or **favorites**) or a field on an existing entity.
Conventions come from [ARCHITECTURE.md](ARCHITECTURE.md); scope rules from [V2_SPEC.md](V2_SPEC.md).

> **Applies from Phase 3 onward** (feature folders, `AppError`, `validate`, `requireRestaurantOwner`). Before that, follow the
> [implementation plan](V2_IMPLEMENTATION_PLAN.md) — do not add features in the middle of the restructuring.

## The rule of locality

A new feature is **one new folder under `src/features/`, one line in `src/app.js`, and one new file in `test/`**. If you find
yourself editing more than that in other features, stop and ask whether the change belongs in the spec first. The only expected
exceptions are (a) a small exported function in another feature's **service** that you need to call, and (b) docs.

Do **not**: add a base class, generic repository, plugin registry, or shared utility "for the next feature"; import another
feature's controller, routes, or model; read `process.env` outside `config.js`; compute anything price-like on the client's word.

## Checklist for a new feature

1. **Contract first.** Add the endpoints and entity shape to [ARCHITECTURE.md §4](ARCHITECTURE.md#4-api-contract) (auth, success
   status, error cases). Decide authorization and error statuses now — copy existing conventions (below).
2. **Write the failing tests** in `test/<feature>.test.js` (list below). Run them; they must fail for the right reason.
3. **Create `src/features/<feature>/`** with the files you need (all five are not always required):
   `<feature>.model.js`, `<feature>.schemas.js`, `<feature>.service.js`, `<feature>.controller.js`, `<feature>.routes.js`.
4. **Mount** the router in `src/app.js` (one line, before the `/api` 404 handler).
5. **Green.** Run the new file, then the whole suite (`npm run test:db:up && npm test`). No existing test may be edited unless
   you are intentionally changing that feature's behavior and the spec allows it.
6. **Docs.** Update ARCHITECTURE.md §4 (and §5 if you added a model). Clients are a separate follow-up that reads the contract.

### Conventions to copy

| Situation | Do |
|---|---|
| Must be logged in | `requireAuth` on the router |
| Restricted to a role | One line in the controller: `if (req.user.role !== 'restaurant') throw new AppError(403, '…')` |
| Only the restaurant's owner | `requireRestaurantOwner` from `features/restaurants/` (sets `req.restaurant`) |
| Middleware order | `requireAuth` → `validate({ body })` → `objectIdParam` → ownership → controller (ARCHITECTURE §3.4) |
| Resource belongs to a user | Filter by `req.user.username` in the service; a missing **or someone else's** resource is `404`, not `403` (as orders do) |
| Path ids | `objectIdParam('id', 'Review not found')` → invalid id is a `404` |
| Request body | Zod schema in `*.schemas.js`, applied with `validate({ body })`; never trust extra fields — the service picks what it needs |
| Expected failure | `throw new AppError(status, 'Message')` from the service |
| Output | Return the API shape from a `toApi<Entity>` next to the schema; never return raw documents |
| Duplicate | `409` with a clear message (back it with a unique index) |

## Worked example: reviews

**Behavior:** a customer who has ordered from a restaurant can leave one 1–5 star review with an optional comment; anyone can list
a restaurant's reviews; an author can delete their own review; a restaurant owner cannot review their own restaurant.

| Endpoint | Auth | Success | Errors |
|---|---|---|---|
| `GET /api/restaurants/:restaurantId/reviews` | public | `200 Review[]`, newest first | `404` restaurant not found |
| `POST /api/restaurants/:restaurantId/reviews` body `{rating, comment?}` | user | `201 Review` + `Location` | `400` validation, `401`, `403` (owner of the restaurant, or has never ordered from it), `404` restaurant, `409` already reviewed |
| `DELETE /api/restaurants/:restaurantId/reviews/:reviewId` | author | `204` | `401`, `404` (unknown, invalid id, or not yours) |

All three live under one path, so the feature has one router and one mount line.

### Files

```text
src/features/reviews/
  review.model.js        schema + toApiReview
  reviews.schemas.js     zod schemas
  reviews.service.js     rules (ordered-before, not-owner, one-per-user)
  reviews.controller.js  thin handlers
  reviews.routes.js      routing + middleware
src/app.js                                   + 1 mount line
src/features/orders/orders.service.js        + export userHasOrderedFrom(username, restaurantId)
test/reviews.test.js                         new
docs/ARCHITECTURE.md                         §4 endpoints, §4.1 Review entity, §5 model note
```
That is **one new folder, one line in `app.js`, one small exported function in the orders service, one test file, one doc.**
No other feature's files change.

### Sketches (shape, not final code)

```js
// review.model.js
const schema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  username:   { type: String, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: '', maxlength: 500 },
}, { timestamps: true, versionKey: false });
schema.index({ restaurant: 1, username: 1 }, { unique: true });     // one review per user per restaurant
const toApiReview = (r) => ({ id: r.id, restaurant: String(r.restaurant), username: r.username,
                              rating: r.rating, comment: r.comment, createdAt: r.createdAt });

// reviews.schemas.js
const createReviewBody = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// reviews.service.js (rules live here)
async function createReview({ restaurantId, user, input }) {
  const restaurant = await restaurantsService.getRestaurantById(restaurantId);   // AppError(404) if missing
  if (restaurant.username === user.username) throw new AppError(403, 'Owners cannot review their own restaurant');
  if (!await ordersService.userHasOrderedFrom(user.username, restaurantId)) throw new AppError(403, 'Order from this restaurant before reviewing');
  try { return toApiReview(await Review.create({ restaurant: restaurantId, username: user.username, ...input })); }
  catch (e) { if (e.code === 11000) throw new AppError(409, 'You already reviewed this restaurant'); throw e; }
}

// reviews.routes.js — express.Router({ mergeParams: true }) so :restaurantId is visible
const restaurantId = objectIdParam('restaurantId', 'Restaurant not found');
router.get('/', restaurantId, controller.list);
router.post('/', requireAuth, validate({ body: createReviewBody }), restaurantId, controller.create);
router.delete('/:reviewId', requireAuth, restaurantId, objectIdParam('reviewId', 'Review not found'), controller.remove);
// app.js (before the /api 404 handler)
app.use('/api/restaurants/:restaurantId/reviews', reviewsRouter);
```

Decisions to record in the PR: orphaned reviews after a restaurant is deleted are left in place (as orders are) to avoid a
dependency cycle between `restaurants` and `reviews`; `reviews` may depend on `restaurants` and `orders` services, not the reverse.

### Tests that must be added (`test/reviews.test.js`)

Follow the standard file preamble (`require('./helpers/env')`, `db.connect/clear/close`) and use the helpers in `test/helpers/api.js`.

- **Create — happy path:** `201`, response shape, `Location` header, persisted (visible in the list).
- **Create — auth:** no token `401`; invalid token `401`.
- **Create — validation:** missing `rating`; `0`, `6`, `1.5`, `"5"`; `comment` over 500 chars → each `400` with a readable message.
- **Create — ids:** invalid restaurant id and unknown id → `404`.
- **Create — authorization/rules:** owner of that restaurant → `403`; user who never ordered from it → `403`; second review by the same user → `409`.
- **Create — untrusted input:** client-sent `username`, `createdAt`, `restaurant` in the body are ignored.
- **List:** public `200`, newest first; empty → `[]`; unknown restaurant → `404`.
- **Delete:** author `204` (gone afterwards); another user → `404`; unknown / invalid review id → `404`; review id under a different restaurant → `404`; no token `401`.
- **Cross-feature contract:** after placing an order through `POST /api/orders`, the same user can review — proves `userHasOrderedFrom` matches the order data.
- **Non-regression:** the whole existing suite still passes untouched.

## Worked example: favorites (short)

**Behavior:** a user keeps a personal list of restaurants.

- Endpoints: `GET /api/favorites` (own list), `PUT /api/favorites/:restaurantId` (idempotent add, `204`), `DELETE /api/favorites/:restaurantId` (`204`, idempotent). All require auth; everything is scoped to `req.user.username`.
- Files: `src/features/favorites/{favorite.model.js, favorites.schemas.js, favorites.service.js, favorites.controller.js, favorites.routes.js}`, one line in `app.js`, `test/favorites.test.js`, ARCHITECTURE.md §4.
- Model: `{ username, restaurant: ObjectId }` with a unique compound index.
- Tests: `401` without a token; add is idempotent (`PUT` twice → one entry); unknown/invalid restaurant → `404`; list returns only the caller's favorites and never another user's; delete of a non-favorite is `204`; two users' lists stay independent.

## Adding a field to an existing entity (e.g. `cuisine` on a restaurant)

Files: the entity's `*.model.js` (schema **and** `toApi…`), its `*.schemas.js` (create/update), the service's create/update copy of
validated fields, and — if searchable — `search.service.js`. Tests: in the entity's existing test file add create, update,
invalid-value (`400`), and "appears in the response shape" cases; if it is searchable, add a search case. Then ARCHITECTURE.md §4.1.
No other backend file should change. (Today this touches five places by hand; after Phase 3 it is the files above.)

## Definition of done for any backend change

- [ ] Contract documented in ARCHITECTURE.md §4 before or with the code.
- [ ] Tests cover happy path, unauthenticated, validation, and cross-user/ownership cases where they apply.
- [ ] New failure modes return `{ error }` from `AppError`, never raw driver messages.
- [ ] No new `process.env` reads outside `config.js`; no new dependency without a spec amendment.
- [ ] `npm test` green locally; CI green.
- [ ] Server-authoritative pricing and the authorization matrix (spec §3) untouched.
