#!/usr/bin/env bash
# Bring the whole stack up from a clean checkout: postgres + backend + frontend,
# migrated and seeded with the canonical bill-of-quantities dataset.
set -euo pipefail
cd "$(dirname "$0")"

if docker compose version >/dev/null 2>&1; then
  compose() { docker compose "$@"; }
else
  compose() { docker-compose "$@"; }
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

# shellcheck disable=SC1091
set -a; source .env; set +a

BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

# COMPOSE_BAKE=false: some compose v2 builds panic using the "bake" builder
# driver on a plain `up --build`; the classic builder is more portable here.
COMPOSE_BAKE=false compose up -d --build

echo "Waiting for the backend to be ready..."
ready=false
for _ in $(seq 1 60); do
  if curl -sf "http://localhost:${BACKEND_PORT}/api/v1" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 2
done

if [ "$ready" != "true" ]; then
  echo "Backend did not become ready in time. Check: docker compose logs backend" >&2
  exit 1
fi

echo "Seeding the database..."
compose exec -T backend npm run seed

cat <<EOF

Ready:
  API      http://localhost:${BACKEND_PORT}/api/v1
  Frontend http://localhost:${FRONTEND_PORT}

Re-run this script anytime to reset and reseed the database.
EOF
