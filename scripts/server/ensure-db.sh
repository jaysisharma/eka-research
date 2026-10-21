#!/usr/bin/env bash
# Ensures the eka Postgres container and database exist on the server.
# Never recreates an existing container or database — data lives in the
# eka_pgdata volume. Optionally imports from Neon once, when the DB is empty.
#
# Usage (from /opt/app): NEON_DATABASE_URL=... ./scripts/server/ensure-db.sh
set -euo pipefail

cd "$(dirname "$0")/../.."

PG_CONTAINER=eka_postgres

# ── Container ────────────────────────────────────────────────
if docker container inspect "$PG_CONTAINER" >/dev/null 2>&1; then
  echo "Postgres container '$PG_CONTAINER' already exists — not creating."
  docker start "$PG_CONTAINER" >/dev/null
else
  echo "Creating Postgres container '$PG_CONTAINER'..."
  docker compose up -d postgres
fi

echo "Waiting for Postgres to accept connections..."
for _ in $(seq 1 30); do
  if docker exec "$PG_CONTAINER" sh -c 'pg_isready -q -U "$POSTGRES_USER"'; then
    break
  fi
  sleep 2
done
docker exec "$PG_CONTAINER" sh -c 'pg_isready -q -U "$POSTGRES_USER"' \
  || { echo "❌ Postgres did not become ready"; exit 1; }

# ── Database ─────────────────────────────────────────────────
db_exists=$(docker exec "$PG_CONTAINER" sh -c \
  'psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '"'"'$POSTGRES_DB'"'"'"')

if [ "$db_exists" = "1" ]; then
  echo "Database already exists — not creating."
else
  echo "Creating database..."
  docker exec "$PG_CONTAINER" sh -c 'createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
fi

# ── One-time import from Neon ────────────────────────────────
if [ -n "${NEON_DATABASE_URL:-}" ]; then
  table_count=$(docker exec "$PG_CONTAINER" sh -c \
    'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = '"'"'public'"'"'"')

  if [ "$table_count" = "0" ]; then
    echo "Database is empty — importing data from Neon..."
    docker exec -e SRC_URL="$NEON_DATABASE_URL" "$PG_CONTAINER" sh -c \
      'pg_dump "$SRC_URL" --no-owner --no-acl -Fc' \
      | docker exec -i "$PG_CONTAINER" sh -c \
        'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl --exit-on-error'
    echo "✅ Neon import complete"
  else
    echo "Database already has tables — skipping Neon import."
  fi
fi
