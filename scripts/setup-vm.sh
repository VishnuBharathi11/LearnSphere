#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run with sudo: sudo ./scripts/setup-vm.sh" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git nginx certbot python3-certbot-nginx ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-$VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker nginx
usermod -aG docker "${SUDO_USER:-ubuntu}"

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

cat >/etc/logrotate.d/learnsphere-nginx <<'EOF'
/var/log/nginx/learnsphere-*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        test ! -f /run/nginx.pid || kill -USR1 "$(cat /run/nginx.pid)"
    endscript
}
EOF

echo "VM setup complete. Log out and back in for Docker group membership."
echo "Also allow TCP 22, 80, and 443 in the Oracle Cloud security list/NSG."
