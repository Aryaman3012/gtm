# skillsdrift GitHub App — registration runbook (Aryaman-owned)

This is a runbook, not automation. Nothing in `build/app/` registers the
GitHub App, touches nginx, installs systemd units, or opens crontab entries
for real — those actions are listed here as steps *you* (Aryaman) run by
hand, when you decide to. Claude Code did not run any of them.

## Sequencing gate — do not deploy publicly until

Per `build/specs/05-github-app.md` §8 / R10's A3 fix:

1. **20+ orgs have run the CLI** (usage evidence from specs 01/02's Hop-0
   tail). This is a go/no-go gate on *public* availability — tracked by you,
   not a technical blocker.
2. **You have completed app registration** (this document, in full) — the
   app exists, its webhook is live, and the PEM is stored.

Building, unit-testing, and running the local webhook harness
(`build/app/test/run-tests.sh`) against fixture data requires neither
condition — that work is done as of this build. What's gated: don't publish
the app's install link, don't pursue org-admin installs, don't point any
Hop-1 CTA at it, until both conditions above are true.

## 1. Create the GitHub App

1. GitHub → Settings → Developer settings → GitHub Apps → New GitHub App.
2. App name: e.g. `atlan-skillsdrift` (must be globally unique on GitHub).
3. Homepage URL: the candidate-exercise disclosure page (reuse the
   report-card hosting subdomain from spec 03, e.g. `https://drift.aryaman.tech/`).
4. Webhook URL: `https://app.aryaman.tech/webhook` (or whatever subdomain you
   pick — see `nginx-site.conf.example` in this directory for a template).
   Requires a public HTTPS endpoint; this VPS serves it via nginx
   reverse-proxying to the local Node process (§5 below).
5. Do NOT set "Install on all repositories" as the default — this app is
   champion/admin-installed per-repo or per-org deliberately (never
   auto-broad).

## 2. Permissions (minimal set — set exactly this, no more)

| Permission     | Level         | Why |
|----------------|---------------|-----|
| Contents       | Read-only     | Clone/read `.claude/skills` and `.codex` trees, read CODEOWNERS |
| Pull requests  | Read & write | Open/update the scorecard PR |
| Metadata       | Read-only     | Mandatory baseline for every GitHub App, no-op to configure |

**Checks is NOT used** for this build, per spec 05 §5's decision: weekly PR
opening is the primary (and only) mechanism. A per-push Checks-API
integration would be *louder*, not quieter, than a weekly PR (the exact
"bot fatigue" failure mode R10's A1 fix warns against) — so it's explicitly
out of scope for v1. If a future round wants an inline "does this PR
introduce drift" check, that's a separate, explicitly-scoped integration
that needs its own T5/A1 review before building.

No `Administration`, no `Workflows` write, no `Secrets` access, no
organization-level permissions.

## 3. Events

Subscribe to: `installation`, `installation_repositories`. No `push` or
`check_suite` subscription is needed for this mechanism — `service.js` does
handle `push` events (mark-repo-dirty bookkeeping) if you do subscribe to
it, but the PR-opening cadence itself runs on the weekly schedule
(`scheduler.js`), not per-push.

## 4. Webhook secret

Generate with:

```bash
openssl rand -hex 32
```

Store it where the running service can read it. Two options:
- Environment variable `APP_WEBHOOK_SECRET` (used directly by `service.js`).
- A file at `~/.config/skillsdrift-app/webhook-secret` (mode 600) — if you
  go this route, export it into the environment before starting the
  service, e.g. in the systemd unit's `Environment=` or an `EnvironmentFile=`
  line (see §6). `service.js` itself only reads `process.env.APP_WEBHOOK_SECRET`
  — it does not read the file directly (keeps the zero-dep file-loading
  logic out of the hot path).

Never hardcode it, never commit it.

## 5. Private key (PEM) — for prod App-auth (documented, not implemented)

1. Generate a private key from the app settings page → download.
2. Store at `~/.config/skillsdrift-app/private-key.pem`, mode 600:
   ```bash
   mkdir -p ~/.config/skillsdrift-app
   chmod 700 ~/.config/skillsdrift-app
   mv ~/Downloads/<app-name>.<date>.private-key.pem ~/.config/skillsdrift-app/private-key.pem
   chmod 600 ~/.config/skillsdrift-app/private-key.pem
   ```
3. Note the App ID from the app settings page.

**Out of scope for this round:** JWT signing (App-auth token exchange) is
NOT implemented in `build/app/`. The current code path for opening real PRs
shells out to the `gh` CLI using a personal-access-token-style dev
credential (`APP_GH_TOKEN` env var, passed to the `gh` subprocess as
`GH_TOKEN`) — this works today, zero-dep, without a PEM or JWT library. The
env vars below document the prod App-auth path for when that's built:

| Env var                     | Used by                          | Purpose |
|------------------------------|-----------------------------------|---------|
| `APP_WEBHOOK_SECRET`         | `service.js`                      | HMAC verification of incoming webhooks |
| `APP_GH_TOKEN`               | `pr-creator.js` (dev/real mode)   | Passed to `gh` subprocess as `GH_TOKEN`; a PAT with `repo` scope works for now |
| `SKILLSDRIFT_APP_ID`         | (future) App-auth JWT signing     | GitHub App ID — documented, not read by any code yet |
| `SKILLSDRIFT_APP_PEM_PATH`   | (future) App-auth JWT signing     | Path to the PEM above — documented, not read by any code yet |
| `PORT`                       | `service.js`                      | Port to listen on (default 8797) |

## 6. Deploy target (VPS) — systemd unit example

See `deploy.sh` in this directory for a script that *would* install this
(Aryaman runs it, not Claude Code). Manual equivalent:

```ini
# /etc/systemd/system/skillsdrift-app.service  (or a user unit under
# ~/.config/systemd/user/ — either works; example below is a user unit)
[Unit]
Description=skillsdrift GitHub App webhook + scheduler service
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /home/debian/workspace/atlan-gtm/build/app/service.js
Restart=on-failure
RestartSec=5
Environment=PORT=8797
Environment=APP_WEBHOOK_SECRET=REPLACE_ME
# Environment=APP_GH_TOKEN=REPLACE_ME   # only if this host also runs the scheduler

[Install]
WantedBy=default.target
```

Enable (as a user unit, run as the current user — no root needed):

```bash
systemctl --user daemon-reload
systemctl --user enable --now skillsdrift-app.service
```

The weekly scan itself (`scheduler.js`) is invoked separately — either as a
`systemd` timer or a crontab line calling
`node /home/debian/workspace/atlan-gtm/build/app/scheduler.js --repo-slug <org/repo>`
once per installed repo, per week. Neither the timer nor the crontab entry
is installed by this build.

## 7. Reverse proxy

See `nginx-site.conf.example` in this directory — a template only, not
installed under `/etc/nginx/`. Aryaman installs and reloads nginx by hand.
