#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN=${1:?Usage: sudo ./scripts/configure-ssl.sh api.example.com admin@example.com}
EMAIL=${2:?Usage: sudo ./scripts/configure-ssl.sh api.example.com admin@example.com}
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
HTTP_CONF=/etc/nginx/sites-available/learnsphere

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

cat >"$HTTP_CONF" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / {
        proxy_pass http://127.0.0.1:8084;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
ln -sfn "$HTTP_CONF" /etc/nginx/sites-enabled/learnsphere
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

certbot certonly --webroot -w /var/www/html -d "$DOMAIN" \
  --email "$EMAIL" --agree-tos --no-eff-email --non-interactive

sed "s/__API_DOMAIN__/${DOMAIN}/g" "$ROOT_DIR/nginx/learnsphere.conf.template" >"$HTTP_CONF"
nginx -t
systemctl reload nginx
systemctl enable --now certbot.timer
certbot renew --dry-run
echo "TLS configured for https://${DOMAIN}"
