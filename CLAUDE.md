# Working in this repo

Full context lives in [`context.md`](./context.md) — read it before touching anything.
It's the take-home brief for imagineY's Quantus assignment, plus locked-in decisions.
**Don't relitigate decisions already marked locked in `context.md`.**

## Repo layout

- `api/` — NestJS + TypeScript backend. Only piece that exists so far.
- `docker-compose.yml`, `.env.example` — root level. Frontend service gets added
  to this same compose file once the Vue app exists — don't create a second one.
- `context.md` — the assignment brief + decisions, source of truth for scope.
- Root `README.md` — the actual deliverable: how to run, decisions, future improvements.
  Keep it updated as things get built, not written in one pass at the end.

## How to work here

- Direct, concise, ready-to-use output. One approach, not three options.
- Full files for new code, diffs for edits.
- Explain NestJS idioms briefly on first use (modules, providers, DI, decorators,
  pipes) — coming from Laravel/PHP, these aren't assumed knowledge. Laravel
  comparisons are welcome.
- Money: integer cents or `numeric(12,2)`, never floats. Round once at line total.
- Push back on scope creep. 
- Gaps in the brief get a documented assumption in the README, not silent guessing.
