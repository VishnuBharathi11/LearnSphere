#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

REVISION=${1:-$(cat .previous-revision 2>/dev/null || true)}
[[ -n "$REVISION" ]] || { echo "Usage: ./scripts/rollback.sh <known-good-git-revision>" >&2; exit 1; }

git cat-file -e "${REVISION}^{commit}"
git switch --detach "$REVISION"
docker compose build
docker compose up -d --remove-orphans --wait --wait-timeout 300
docker compose ps
echo "Rolled back application containers to $REVISION. Persistent data was not changed."
