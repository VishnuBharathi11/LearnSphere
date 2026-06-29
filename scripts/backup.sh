#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BACKUP_DIR=${BACKUP_DIR:-"$ROOT_DIR/backups"}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$BACKUP_DIR"
cd "$ROOT_DIR"

docker compose exec -T mysql sh -c \
  'exec mysqldump --single-transaction --routines --triggers -uroot -p"$MYSQL_ROOT_PASSWORD" learnsphere_db' \
  | gzip -9 >"$BACKUP_DIR/learnsphere-${STAMP}.sql.gz"

find "$BACKUP_DIR" -type f -name 'learnsphere-*.sql.gz' -mtime +14 -delete
echo "Created $BACKUP_DIR/learnsphere-${STAMP}.sql.gz"
