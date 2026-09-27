#!/usr/bin/env bash
# skillsdrift-app deploy script — a DELIVERABLE, not an action performed by
# this build. Claude Code did NOT run this script and will not run
# `systemctl` for real. Aryaman runs this by hand, after completing the
# register-runbook.md steps and clearing the sequencing gate.
#
# What it would do:
#   1. Install a systemd --user unit (skillsdrift-app.service) pointing at
#      this repo's build/app/service.js.
#   2. Reload the user systemd daemon and enable+start the unit.
#   3. Print next steps (nginx site install, webhook URL registration, etc).
#
# It does NOT touch /etc/nginx, does NOT install anything system-wide, and
# does NOT run as root.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$REPO_ROOT/build/app"
UNIT_NAME="skillsdrift-app.service"
UNIT_DIR="$HOME/.config/systemd/user"
UNIT_PATH="$UNIT_DIR/$UNIT_NAME"
PORT="${PORT:-8797}"

echo "== skillsdrift-app deploy =="
echo "Repo root:   $REPO_ROOT"
echo "App dir:     $APP_DIR"
echo "Unit path:   $UNIT_PATH"
echo "Port:        $PORT"
echo

if [[ "${1:-}" != "--yes-really-deploy" ]]; then
  cat <<'EOF'
This script is a deliverable, not something to run casually. It will:
  - write a systemd --user unit file
  - run `systemctl --user daemon-reload`
  - run `systemctl --user enable --now skillsdrift-app.service`

Before running this for real, confirm:
  [ ] The sequencing gate in register-runbook.md has cleared
      (20+ orgs on the CLI AND app registration complete).
  [ ] APP_WEBHOOK_SECRET is generated (openssl rand -hex 32) and set in the
      unit's Environment= line below, not committed anywhere.
  [ ] The GitHub App's webhook URL points at this host + the port above.
  [ ] nginx-site.conf.example (in this dir) has been installed and reloaded
      by hand — this script does not touch nginx.

Re-run with --yes-really-deploy once you've actually decided to do this.
EOF
  exit 0
fi

mkdir -p "$UNIT_DIR"

cat > "$UNIT_PATH" <<EOF
[Unit]
Description=skillsdrift GitHub App webhook + scheduler service
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node $APP_DIR/service.js
Restart=on-failure
RestartSec=5
Environment=PORT=$PORT
Environment=APP_WEBHOOK_SECRET=REPLACE_ME_BEFORE_STARTING

[Install]
WantedBy=default.target
EOF

echo "Wrote $UNIT_PATH"
echo
echo "Next (run these yourself):"
echo "  1. Edit $UNIT_PATH and replace APP_WEBHOOK_SECRET with a real secret"
echo "     (openssl rand -hex 32) — never commit it."
echo "  2. systemctl --user daemon-reload"
echo "  3. systemctl --user enable --now $UNIT_NAME"
echo "  4. Install nginx-site.conf.example under /etc/nginx/sites-available/"
echo "     (edit server_name / proxy_pass first), symlink into"
echo "     sites-enabled, then: sudo nginx -t && sudo systemctl reload nginx"
echo "  5. Register the GitHub App per register-runbook.md, point its"
echo "     webhook URL at https://<your-domain>/webhook"

systemctl --user daemon-reload
systemctl --user enable --now "$UNIT_NAME"

echo "Done. Check status with: systemctl --user status $UNIT_NAME"
