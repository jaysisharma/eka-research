#!/usr/bin/env bash
# Dumps the eka database to $BACKUP_DIR and prunes old dumps.
# Installed as a cron job by the deploy workflow.
#
# Restore: docker exec -i eka_postgres sh -c \
#   'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < <file>.dump
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/app/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
PG_CONTAINER=eka_postgres

mkdir -p "$BACKUP_DIR"

file="$BACKUP_DIR/eka-$(date +%Y%m%d-%H%M%S).dump"

# Write to a temp file first so a failed dump never looks like a valid backup.
docker exec "$PG_CONTAINER" sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc --no-owner' > "$file.tmp"
mv "$file.tmp" "$file"

find "$BACKUP_DIR" -name 'eka-*.dump' -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name 'eka-*.dump.tmp' -mmin +60 -delete

echo "$(date -Is) backup ok: $file ($(du -h "$file" | cut -f1))"
