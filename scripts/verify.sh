#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PUBLIC_URL=${1:-}
cd "$ROOT_DIR"

docker compose config --quiet
docker compose ps --format json | grep -q '"Health":"healthy"'
curl -fsS http://127.0.0.1:8084/actuator/health
echo

if [[ -n "$PUBLIC_URL" ]]; then
  curl -fsS "${PUBLIC_URL%/}/actuator/health"
  echo
fi

docker compose exec -T mysql sh -c \
  'mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent'
echo "Core verification passed."
