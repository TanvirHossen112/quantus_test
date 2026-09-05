# Quantus — bill of quantities (imagineY take-home)

A bill of quantities is a priced table of contents for a building: nested **articles**
(folders, e.g. `20.11.10. Materials — mortar`) contain **objects** (files pulled from a
drawing — walls, doors, windows), each with a quantity derived from its dimensions and
a unit price. Line total = quantity × unit price; article total = its own objects plus
every descendant article, rolled up.

Stack: **NestJS, TypeScript, PostgreSQL**, **Vue 3**, docker.

## Quick start

```bash
./init.sh
```

Copies `.env.example` → `.env` if missing, builds and starts postgres/backend/frontend,
waits for the API, and seeds the canonical dataset below. Safe to re-run — it reseeds
each time.

Or, the plain path the brief asks for:

```bash
cp .env.example .env
docker compose up
# in another terminal, once the backend is up:
docker compose exec backend npm run seed
```

- API: `http://localhost:3000/api/v1`
- Frontend: `http://localhost:5173`

Migrations run automatically on backend startup (`migrationsRun: true`) — no manual
migration step needed on a clean checkout.

## Running tests

```bash
cd api
npm test          # unit tests
npm run test:e2e  # 29 e2e tests: articles/objects/summary CRUD + edge cases + aggregation
```

## API reference

All routes are prefixed `/api/v1`.

**Articles**
| Method | Path | Notes |
|---|---|---|
| POST | `/articles` | `{ code, title, description?, parentId? }` |
| GET | `/articles` | flat list; `?tree=true` for nested |
| GET | `/articles/:id` | article + children + objects |
| PATCH | `/articles/:id` | partial update; `parentId: null` moves to root |
| DELETE | `/articles/:id` | 204, or 409 if it still has children/objects |

**Objects**
| Method | Path | Notes |
|---|---|---|
| POST | `/objects` | `{ drawingUuid, name, type, unit, unitPriceCents, properties, articleId }` |
| GET | `/objects?articleId=` | each row includes computed `quantity` + `lineTotalCents` |
| GET | `/objects/:id` | |
| PATCH | `/objects/:id` | partial update; re-validates `properties` against the (possibly new) `unit` |
| DELETE | `/objects/:id` | 204 |

**Summary**
| Method | Path | Notes |
|---|---|---|
| GET | `/summary` | `{ articles: [{ id, code, title, subtotal }], grandTotal }` — one entry per top-level article |

## Data model, and why

- **Nesting — adjacency list.** `articles.parent_id` is a self-FK; subtree/ancestor
  queries use Postgres `WITH RECURSIVE`. Considered materialized path and nested set;
  adjacency list wins on simplicity at this scale, and Postgres CTEs make the
  "unlimited depth" requirement cheap to query correctly.
- **Object → article — direct `article_id` FK.** The brief's own example
  ("all Wall objects with thickness 14cm → article 20.11.10") describes rule-based
  assignment. That's a real feature, deliberately deferred: a `criteria` JSONB column
  on `Article` plus a matcher service that runs on object insert. Listed under Future
  improvements below.
- **Money — integer cents**, never floats (`unit_price_cents integer`). Quantity ×
  price is rounded once, at the line total (`objects.service.ts`); the summary then
  sums already-rounded cents, so nothing is rounded twice.
- **Quantity is mocked**, per the brief's own allowance — a pure function
  (`QuantityService.calculate`) over a `properties` JSONB column:

  | Unit | Formula |
  |---|---|
  | m | length |
  | m² | length × height |
  | m³ | length × height × thickness |
  | kg | length × height × thickness × density |
  | piece | count |

## Decisions made

- **Delete = block (409), not cascade or reparent.** Both FKs (`article.parent_id`,
  `object.article_id`) are `ON DELETE RESTRICT`. Deleting an article that still has
  children or objects returns a clean `409 Conflict` telling the caller to delete or
  reassign them first. Chosen over cascade (too easy to silently vaporize a subtree)
  and auto-reparent (which parent? ambiguous, hides data loss).
- **Unique `code` → `409`**, not a raw `500`. Same pattern applied to `drawingUuid`
  on objects (a drawing object should only exist once) — Postgres unique index,
  caught and mapped to `ConflictException` in the service layer.
- **Cycle rejection.** `PATCH /articles/:id` with a `parentId` runs a recursive CTE up
  the proposed new parent's ancestor chain; if the article being moved shows up in
  that chain, the move is rejected with `400` before it can corrupt the tree.
- **Rich text.** `description` is sanitized to an allow-list (`sanitize-html`) on
  write, stored as `text`, rendered with `v-html` on the frontend — never trust
  stored HTML at render time otherwise.
- **`/api/v1` global prefix** on every route, for straightforward versioning later.

## Seed data

`npm run seed` (or `docker compose exec backend npm run seed`) truncates and
repopulates `articles`/`objects` with a small, internally-consistent dataset used
identically here, in the e2e tests, and in this README — so the numbers below are
real, reproducible output, not just an assertion:

```
20.  Masonry                                    €7 407.55
  20.11.  Masonry — materials                   €4 337.55
    20.11.10.  Materials — mortar                 €822.15
      Wall W-01 exterior  12.40 × 2.70 = 33.48 m² × €14.50 = €485.46
      Wall W-02 party      8.60 × 2.70 = 23.22 m² × €14.50 = €336.69
    20.11.20.  Materials — clay brick           €3 515.40
      Wall W-01 exterior             33.48 m² × €62.00 = €2 075.76
      Wall W-02 party                23.22 m² × €62.00 = €1 439.64
  20.12.  Masonry — openings                    €3 070.00
    Door D-01                        3 piece × €340.00 = €1 020.00
    Window R-01                      5 piece × €410.00 = €2 050.00
30.  Roofing                                    €5 210.00
    Roof covering                  10 × 10 = 100 m² × €52.10 = €5 210.00

GRAND TOTAL                                    €12 617.55
```


```bash
curl http://localhost:3000/api/v1/summary
# {"articles":[{"code":"20.","title":"Masonry","subtotal":740755},
#              {"code":"30.","title":"Roofing","subtotal":521000}],
#  "grandTotal":1261755}
```

## Frontend

- `/` — article tree, create/edit/delete, sanitized rich-text description.
- `/articles/:id/objects` — one article's objects with quantity, unit price, line
  total, and a subtotal.
- `/objects` — flat CRUD across all objects (not required by the brief, added for
  convenience while testing).
- `/result` — full tree with rolled-up subtotals per branch and the grand total from
  `/summary` (not required by the brief, added to visualize the aggregation).

## Future improvements

- `criteria` JSONB column on `Article` + a matcher service, for the brief's rule-based
  object→article assignment (currently a direct FK, set explicitly on create).
- Fix the `GET /articles/:id` / `GET /objects` quantity-computation asymmetry noted
  above.
- Wire `CORS_ORIGIN` into `app.enableCors()` instead of allowing all origins.
- Tiptap (or similar) for the rich-text `description` field instead of a plain
  `<textarea>`.
- ESLint + Prettier for `web/` (currently only `api/` has lint/format tooling wired
  up; `web/` files were formatted once by hand for this submission).
- A `format:check` npm script (`prettier --check`) alongside the existing
  `format` (`--write`), for CI.
- Production frontend build (nginx serving static assets) instead of running the
  Vite dev server inside the Docker image.
