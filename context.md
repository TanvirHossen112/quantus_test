# Project context — Quantus code assignment (imagineY)

## Who I am

Full-stack engineer, 4+ years, coming from **Laravel / PHP / Vue**. I'm moving into **Node, NestJS, TypeScript**. Assume I'm fluent in backend concepts, MySQL, Docker and Vue — but treat NestJS-specific idioms (modules, providers, DI, decorators, pipes) as things worth naming explicitly the first time. Laravel comparisons help me. Based in Belgium.

## What I'm building

A take-home assignment for **imagineY**, for their product **Quantus** — software that helps architects produce a *bill of quantities* from Vectorworks drawings.

A bill of quantities is a priced table of contents for a building:

- **Articles** = folders. Nested, unlimited depth. Have a unique code (`20.11.10.`), a title, and a rich-text description.
- **Objects** = files. Things from the drawing — walls, doors, windows. Each has a UUID from the drawing, a name, a type, a unit of measurement (m, m², m³, kg, piece), and a unit price.
- **Quantity** is *derived* from the object's dimensions based on its unit, never typed in.
- **Line total** = quantity × unit price. **Article total** = own objects + all descendant articles, rolled up.

## Hard requirements from the brief

**Stack (non-negotiable):** NestJS + TypeScript, SQL database (Postgres), Vue frontend, all started with a **single `docker compose up`** from a clean checkout.

**Backend**
- CRUD for articles
- CRUD for objects
- `GET /summary` — subtotal for every top-level article + a grand total

**Frontend**
- Page listing articles
- A way to create a new article
- Page showing one article's objects with quantity and price

**Extras (do these — they're where the marks are)**
- Seed script with realistic data
- Tests covering summary and aggregation
- README: how to run it, decisions made, future improvements

**They grade on:** does it run from clean checkout · the data model and why · summary correctness · how gaps were handled · code clarity, validation, tests, commit history.

## Decisions already locked in

Don't relitigate these unless I ask.

- **Nesting:** adjacency list (`parent_id` self-FK). Postgres `WITH RECURSIVE` for subtree queries. Considered materialized path and nested set; adjacency list wins on simplicity for this scope. Say so in the README.
- **Money:** integer cents, or `numeric(12,2)`. **Never floats.** Round once, at the line total, then sum.
- **Object → article:** direct `article_id` FK. The brief mentions rule-based assignment ("all walls with thickness 14cm → 20.11.10"); that's a documented gap, listed as future work (a `criteria` JSONB column plus a matcher service).
- **Quantity:** mocked via one pure function over a `properties` JSONB column:

| Unit | Formula |
|---|---|
| m | length |
| m² | length × height |
| m³ | length × height × thickness |
| kg | volume × density |
| piece | count |

## Endpoints — 11 total

**Articles**
1. `POST /articles` — accepts `parentId`
2. `GET /articles` — flat, or `?tree=true` for nested
3. `GET /articles/:id` — article + children + objects
4. `PATCH /articles/:id`
5. `DELETE /articles/:id`

**Objects**
6. `POST /objects`
7. `GET /objects?articleId=` — each with computed quantity + line total
8. `GET /objects/:id`
9. `PATCH /objects/:id`
10. `DELETE /objects/:id`

**Summary**
11. `GET /summary` → `{ articles: [{ id, code, title, subtotal }], grandTotal }`

## Edge cases I must handle explicitly

- **Cycles** — reject a `parentId` update that would make an article its own descendant.
- **Delete behaviour** — pick one (cascade / block / reparent) and justify it in the README.
- **Rounding** — round at line total, then sum. State it.
- **Unique code** — DB constraint, and a clean `409`, not a `500`.

## Canonical seed data

Use these exact figures everywhere — seed script, tests, README examples. They're internally consistent.

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

GRAND TOTAL                                    €12 617.55
```

`GET /summary` returns only Masonry (€7 407.55), Roofing (€5 210.00), and the grand total.

## Rich text note

`description` is a specification clause an architect writes for a tender document — bold terms, bullet lists, standard references. Column is `text`. Store sanitised HTML, validate with `@IsString() @IsOptional() @MaxLength(10000)`, sanitise on write to an allow-list (otherwise it's stored XSS), render with `v-html` in Vue. Plain `<textarea>` for now; Tiptap goes in future improvements.

## How I want you to work with me

- **Direct and concise.** Ready-to-use output over explanation. One approach, not three options — if there's a real tradeoff, name it in a sentence and pick one.
- **Full files, not fragments,** when I'm creating something new. Diffs are fine for edits.
- **Explain NestJS idioms briefly on first use.** I need to defend every line in the walkthrough, so no clever abstractions I'd struggle to justify.
- **Plain language, short sentences, concrete analogies.** No jargon unless you explain it.
- **Push back** if I'm about to over-engineer or blow the four-hour budget. Cutting scope is usually the right call.
- **Watch the clock.** If something takes more than ~30 minutes it probably belongs in "future improvements" instead.
- Writing for the README should sound natural and human — simple vocabulary, conversational, not formal or robotic.
