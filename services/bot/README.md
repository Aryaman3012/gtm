# skillsdrift Twitter/X drift bot (`build/bot/`)

Public-oracle mode (`@skillsdrift scan <repo>` -> reply with a card link) + a weekly-broadcast
draft mode. Fully functional in DRAFT mode (no X credentials exist on this VPS yet); post mode is
implemented behind a provider interface (`providers/x.js`) and fails clearly with
`NoCredentialsError` until credentials are configured.

Zero npm runtime dependencies — Node built-ins only (`fs`, `path`, `os`, `child_process`, `https`).

## Components

- `mention-listener.js` — real poll mode (`pollMentions(provider)`) and file-inbox draft mode
  (`readInboxFile(path)`, default `data/mentions-queue.json`).
- `oracle.js` — parses `@skillsdrift scan <repo>` mentions, clones the target repo shallowly into
  a tmpdir, uses `build/scanner/lib/discover.js` (shared with the scanner) to find any SKILL.md
  under the clone root, runs `artifact/skillsdrift.js <root> --json` as a subprocess, and builds
  a reply draft. Handles malformed requests, clone failures, "no skills found," and a 24h
  scan-cache dedupe (`data/scan-cache.json`). Renders cards via `build/cardgen` (the same module
  `build/scanner` uses) and writes them under `cards/<slug>.html`, returning
  `https://drift.aryaman.tech/cards/<slug>.html`.
- `broadcast.js` — weekly-delta thread draft, reading a findings JSON shaped like spec 02 §3's
  aggregate output (default fixture: `fixtures/sample-findings.json`).
- `providers/x.js` — `postTweet`, `postThread`, `getMentions`. Throws `NoCredentialsError` with
  setup instructions when no credentials are configured. Credentials come from env vars
  (`X_BEARER_TOKEN`, `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`) or files
  under `~/.config/skillsdrift-bot/` — never hardcoded, never logged, never written by this code.
- `cli.js` — see Commands below.

## Commands

```
node cli.js draft-scan <repo>              # e.g. anthropics/skills — writes drafts/<slug>-<ts>.json
node cli.js draft-broadcast [--source p]   # writes drafts/broadcast-<date>.json
node cli.js process-inbox                  # reads data/mentions-queue.json, one draft per mention
node cli.js post-approved <draft-file>     # ONLY command that touches the network
```

`post-approved` refuses (non-zero exit) unless the draft file's top-level `"approved"` field is
`true` — checked before any credential/provider code runs. A human reviews `tweets[]` and manually
edits the file to add `"approved": true` before this can be run. Even when approved, it will fail
with `NoCredentialsError` today (no X credentials exist on this VPS) — this is expected, not a bug.

## Cron (documented only — NOT installed)

Plain crontab lines (not installed, not a hermes/systemd job):

```cron
*/30 * * * * cd /home/debian/workspace/atlan-gtm/build/bot && /usr/bin/node cli.js process-inbox   >> cron.log 2>&1
0 3 * * 1    cd /home/debian/workspace/atlan-gtm/build/bot && /usr/bin/node cli.js draft-broadcast >> cron.log 2>&1
```

`post-approved` is never put on a cron line — it is a human-invoked command only, by design (the
review gate is a person choosing to run it, not a schedule).

## Tests

```
bash test/run-tests.sh
```

Zero network. Oracle tests use a local fixture directory (built from
`artifact/fixtures/repo-a` / `repo-b`, read-only) via the `opts.localPath` test seam instead of a
real git clone.

## Deviations from the spec-01 template (see report for full rationale)

This build follows the R15 brief's `build/bot/` layout (superseding spec 01's `build/twitter-bot/`
layout) and its exact component list (`mention-listener.js`, `oracle.js`, `broadcast.js`,
`providers/x.js`, `cli.js`), rather than spec 01 §3's file tree — spec 01 was read for
template/tone reference only, per the task brief.
