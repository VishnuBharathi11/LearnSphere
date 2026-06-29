#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

[[ -f .env ]] || { echo "Missing .env; copy .env.example and populate it." >&2; exit 1; }
chmod 600 .env

PREVIOUS_REVISION=$(cat .deployed-revision 2>/dev/null || true)
printf '%s\n' "$PREVIOUS_REVISION" > .previous-revision

docker compose config --quiet
docker compose build --pull
docker compose up -d --remove-orphans --wait --wait-timeout 300
docker image prune -f --filter "until=168h"

docker compose ps
curl -fsS http://127.0.0.1:8084/actuator/health
echo
git rev-parse HEAD > .deployed-revision
echo "Deployment completed."
