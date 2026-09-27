# 05 — GitHub App "PR creator" (build #5)

Status: build/scaffold now, per R10 sequencing (`strategy/two-hop-gtm.md`). **Do not deploy
publicly** until the sequencing gate in §8 clears. Building and unit-testing the code now is
explicitly fine and is the point of this round.

## 1. Purpose (reframed, R14)

**Ambient presence.** The Hop-1 conversion upgrade — "Dependabot for skills" — makes the weekly
recurrence mechanical *in the repo itself*, so governance state shows up where the team already
works instead of requiring anyone to remember to run a scan. Per R10's A3 fix, this is **not** the
entry point (a champion/admin installs it *after* Hop-1 evidence already exists via the CLI/manual
scan). It runs a cadence scan (weekly, never per-push — A1 fix), opens PRs whose titles carry the
blast-radius number (A1 fix), targets CODEOWNERS (B4 fix), and every PR body leads with disclosure
(R10 T3) and points only at governed remediation — **no auto-fix** (T5).

**Card-link-in-PR-body requirement (R14):** every PR body (§6) must include a link to that repo's
shareable card (`build/cardgen/` output, per `03-shareable-report-card.md`'s reframed "shareable
unit" role) generated from the same scan run that produced the PR — a public PR carrying a card
link is itself a world-visible distribution event (ambient presence compounding with the
shareable-unit mechanism, not a separate channel). `pr-builder.js` (§6) should call
`build/cardgen`'s card-generation function the same way `build/scanner/scan-repo.js` does, then
interpolate the resulting card URL into the PR body template. Build stays gated per §8 — this
requirement affects the PR body template now, not the deploy timeline.

## 2. Component layout

```
build/github-app/
├── package.json                       # this component IS allowed a real dependency set —
│                                       # it's a server, breaks the zero-dep-CLI pattern by design
│                                       # (Probot or a thin @octokit/webhooks + @octokit/rest
│                                       #  setup; either is fine, pick one and note the choice
│                                       #  in README.md)
├── src/
│   ├── server.js                      # webhook HTTP endpoint
│   ├── webhook-handler.js             # verifies signature, routes event types
│   ├── scheduler.js                   # weekly cadence trigger per installed repo
│   ├── scan-runner.js                 # shallow-clones the installed repo, runs skillsdrift v2
│   ├── check-run.js                   # GitHub Checks API integration, §5
│   ├── pr-builder.js                  # title/body generation, §6
│   ├── codeowners.js                  # CODEOWNERS resolution, §4
│   ├── github-client.js               # Octokit wrapper, app-auth (JWT + installation token)
│   └── config.js                      # loads app id, PEM path, webhook secret from env/~/.config
├── fixtures/
│   ├── fixture-repo/                  # a local .claude/skills tree with a planted drift case
│   ├── sample-installation-webhook.json
│   └── sample-check-suite-webhook.json
├── test/
│   ├── webhook-harness.js             # local HTTP harness that POSTs fixture payloads at server.js
│   ├── pr-builder.test.js             # golden-file: scan output -> PR title/body
│   ├── codeowners.test.js
│   └── run-tests.sh
├── runbook/
│   └── app-registration.md            # §3, the Aryaman-owned steps
└── README.md
```

## 3. App-registration runbook (Aryaman-owned action items)

These steps are **not performed by this build round** — they're documented here so the code has
a concrete target to authenticate against once Aryaman decides to register. Building/testing
`src/*` does not require the real app to exist (tests use fixtures, §7).

1. Go to GitHub → Settings → Developer settings → GitHub Apps → New GitHub App.
2. App name: e.g. `atlan-skillsdrift` (must be globally unique on GitHub).
3. Homepage URL: the candidate-exercise disclosure page (reuse the report-card hosting subdomain
   from spec 03, e.g. `https://drift.aryaman.tech/`).
4. Webhook URL: `https://<app-host>/webhook` — needs a public HTTPS endpoint. This VPS can serve
   it via nginx reverse-proxy to the Node process on a local port, same pattern as the static
   sites but with a `proxy_pass` block instead of `root`. Requires its own subdomain or path
   (Aryaman decision: e.g. `githubapp.aryaman.tech`).
5. Webhook secret: generate with `openssl rand -hex 32`, store in `~/.config/skillsdrift-app/
   webhook-secret` (mode 600), loaded by `config.js` — never hardcoded, never committed.
6. Permissions: set exactly the table in §5 below. No more.
7. Subscribe to events: `installation`, `installation_repositories`, `check_suite` (if using
   Checks API path) — see §5 for which events matter depending on the chosen mechanism.
8. Generate a private key (PEM) from the app settings page → download → store at
   `~/.config/skillsdrift-app/private-key.pem` (mode 600) → `config.js` reads this path from
   `SKILLSDRIFT_APP_PEM_PATH` env var, never commits it, never logs its contents.
9. Note the App ID (shown on the app settings page) → `SKILLSDRIFT_APP_ID` env var.
10. Do NOT set "Install on all repositories" default — this app is champion/admin-installed
    per-repo or per-org deliberately (A3 — permission reality), never auto-broad.

## 4. Permission table (minimal set)

| Permission | Level | Why |
|---|---|---|
| Contents | Read-only | Clone/read `.claude/skills` and `.codex` trees, read CODEOWNERS |
| Pull requests | Read & write | Open the scorecard PR |
| Checks | Read & write | Only needed if the Checks-API path (§5) is chosen instead of/alongside PR-opening |
| Metadata | Read-only | Mandatory baseline for every GitHub App, no-op to configure |

No `Administration`, no `Workflows` write, no `Secrets` access, no organization-level permissions.
This app never pushes commits directly to a branch — it only ever opens a PR (or comments on an
existing Check) — so it needs no write access to protected branches beyond opening PRs against
them, which `pull_requests: write` already covers.

## 5. Cadence mechanism: scheduled check runs vs PR opening

**Decision: weekly PR opening is the primary mechanism; the Checks API is not used for v1.**

Justification: the Checks API is designed to attach to a specific commit/check-suite, which is
naturally triggered by push/PR events — exactly the per-push cadence R10's A1 fix says to avoid
("Bot fatigue / PR mute" — a check that reruns on every push is louder, not quieter, than a
weekly PR). A scheduled job (§6) that runs independently of any push, and opens (or updates) one
long-lived PR per week only when the scan finds something new, matches A1's fix directly: fixed
cadence, not push-triggered noise. If Aryaman later wants an inline "does this PR introduce
drift" gate, that would be a *separate*, explicitly-scoped future check-suite integration — out
of scope here, and would need its own T5/A1 review before building.

Sequence (ASCII):

```
scheduler.js (weekly cron-equivalent, in-process node-cron or a plain
              scheduled invocation from crontab calling `node bin/weekly-scan.js`)
      |
      v
for each installed repo (from GitHub App installations list):
      |
      v
scan-runner.js: shallow clone repo (using installation access token)
      |
      v
run skillsdrift.js <cloned-path>/.claude/skills --json
      |
      v
      +-- no findings (exit 0) --> no PR, no comment, done for this repo this week
      |
      +-- findings (exit 1) --> codeowners.js: resolve owning teams/users for
      |                          affected skill paths from CODEOWNERS
      |                                |
      |                                v
      |                         pr-builder.js: build title + body (§6)
      |                                |
      |                                v
      |                  existing open scorecard PR from a prior week?
      |                     |                              |
      |                    yes                             no
      |                     |                              |
      |         github-client.js: update PR         github-client.js: open new PR,
      |         body + push updated branch           push branch, request review from
      |         (same PR, fresh numbers)              CODEOWNERS-resolved reviewers
      v
done
```

Webhook events actually needed given this decision: `installation` /
`installation_repositories` (to know which repos to scan on the weekly cycle — maintain the
installed-repos list, don't discover it by polling). No `push` or `check_suite` subscription is
needed for v1's mechanism.

## 6. PR title/body generation rules and templates

**Title rule (A1 fix — blast-radius number in the title, not buried in the body):**

```
Template: "Drift scorecard: {n} version(s) of {skillName} diverged, used by {teamCount} teammate(s), {fileCount} file(s) affected"
Example:  "Drift scorecard: 3 versions of deploy-checklist diverged, used by 4 teammates, 12 files affected"
```

If multiple skills have findings in one repo, the title uses the single highest-severity /
highest-blast-radius finding, and the body (below) lists the rest — one PR per repo per week, not
one PR per finding (avoids the exact PR-flood A1 warns about).

`teamCount` is derived from CODEOWNERS resolution (§ below) — count of distinct owners/teams
mapped across the affected skill's directory entries; `fileCount` comes directly from
skillsdrift's `--json` output (`drift[].files.length` summed, or `security[].findings.length`
for security-only findings).

**Body template:**

```markdown
### Disclosure

This PR was opened automatically by the skillsdrift GitHub App — a candidate exercise for
Atlan, not an Atlan product. It was installed on this repo by {installerLogin}.

### What changed

skillsdrift's weekly scan found:

{findingsList}
<!-- one bullet per finding, same factual, non-shaming phrasing as spec 01/02's templates,
     e.g. "- `deploy-checklist` diverged: 3 versions found across {paths}, last change: {date}" -->

### How to resolve this

This bot does not auto-fix drift — a mechanical merge here would just create a fourth diverged
copy. To resolve it:

1. Pick the canonical version of the affected skill(s) with the owning team.
2. Run the manual check-in flow: `node skillsdrift.js <path> --checkin` and commit
   `.skillsdrift-report.md` so the next scan has a deterministic diff.
3. If your team wants this tracked centrally instead of re-discovered every week, import into
   the Registry: {pilotCtaUrl}.

### Recurrence close

This will drift again the moment someone edits a copy without checking in through one source.
A weekly scan will keep finding it; only a governed source stops it recurring.

### Full card

{cardUrl}

---
_Reviewers requested via CODEOWNERS: {reviewerList}_
```

`{cardUrl}` is generated from the same scan run via `build/cardgen`'s card-generation function
(see §1 R14 note) — never re-derived separately, so the PR body and the card can't drift apart.

No code diff is ever included in the PR — there is nothing to merge; the PR body is the
deliverable, not a patch. (If the underlying git provider requires an actual diff to open a PR,
the branch contains only the regenerated `.skillsdrift-report.md` / manifest as a checked-in
artifact — never a modification to any skill file itself. This is the literal enforcement of "no
auto-fix.")

## 7. CODEOWNERS targeting (B4 fix)

`codeowners.js`:
1. Read `CODEOWNERS` from the repo root, `.github/`, or `docs/` (GitHub's own lookup order).
2. For each affected skill's directory path (e.g. `.claude/skills/deploy-checklist/`), find the
   most specific matching CODEOWNERS pattern.
3. Collect the matched owners (users and/or `@org/team` handles) across all affected skills in
   this week's findings → dedupe → this is `reviewerList` and the source of `teamCount` in §6.
4. If no CODEOWNERS file exists, or no pattern matches an affected path: fall back to requesting
   review from the repo's default reviewers if configured, else no reviewer is requested and the
   PR body notes "No CODEOWNERS entry matched — consider adding one for `{path}`." Never fail the
   whole run for a missing CODEOWNERS file.

This directly targets the fix for B4 (single-seat risk — routing to a *team*/CODEOWNERS entry
rather than one individual assignee who can mute the PR alone).

## 8. Sequencing gate — do not deploy publicly until

Per R10 (`strategy/two-hop-gtm.md` §A3, and the R9 usage-evidence gate logic referenced in the
brief):

1. **20+ orgs have run the CLI** (usage evidence from specs 01/02's Hop-0 tail — the data-drop
   and bot cadence are what's expected to generate this signal). This is a go/no-go gate on
   *public* availability, tracked by Aryaman, not a technical blocker.
2. **Aryaman has completed app registration** (§3) — app exists, webhook is live, PEM is stored.

Building, unit-testing, and even running the webhook harness (§9) against fixture data requires
neither condition — that work happens now. What's gated is: don't publish the app's install link,
don't pursue org-admin installs, don't point any Hop-1 CTA at it, until both conditions above are
true.

## 9. Security

- **Webhook signature validation:** every incoming webhook POST is verified against
  `X-Hub-Signature-256` using the stored webhook secret (HMAC-SHA256) before any payload is
  parsed or acted on — `webhook-handler.js` rejects (401) unsigned/invalid-signature requests
  before touching the body.
- **PEM storage:** `~/.config/skillsdrift-app/private-key.pem`, mode 600, path referenced via
  `SKILLSDRIFT_APP_PEM_PATH` env var — never committed, never logged, never transmitted anywhere
  except used locally to sign the JWT for GitHub's app-auth token exchange.
- **Installation tokens:** short-lived (GitHub-issued, ~1hr), requested per scan run via the JWT,
  never persisted to disk.
- **Rate limits:** GitHub App installation tokens get a much higher rate limit than unauthenticated
  access (5,000+ req/hr per installation); the weekly-per-repo cadence is far under this — no
  special throttling needed beyond the existing sequential-scan pattern from spec 02.

## 10. Test plan (fixture-repo simulation, no live GitHub)

`test/run-tests.sh` via `node --test`, plus `test/webhook-harness.js` (a plain local HTTP server
using Node's built-in `http` module — no dependency added just for this) that POSTs fixture
payloads at `server.js` running on a test port.

1. **Webhook signature validation.** POST `sample-installation-webhook.json` with a correct
   HMAC signature → assert 200 and that `installation-repositories.json`-equivalent local state
   updates. POST the same payload with a tampered signature → assert 401 and no state change.
2. **Scan-to-PR-content pipeline.** Point `scan-runner.js` at `fixtures/fixture-repo/` (a local
   `.claude/skills` tree with a planted drift case, reusing the same fixture pattern as
   `artifact/fixtures/`) → run through `pr-builder.js` → assert the generated title matches the
   §6 template exactly, with real numbers from the fixture substituted in.
3. **No-auto-fix invariant.** Assert `github-client.js`'s PR-opening call is never given a diff
   that modifies any file under `.claude/skills/` or `.codex/` — only the report/manifest files
   are ever included in the branch. Test by asserting the mocked git-write call's file list
   contains no path under a skills directory.
4. **CODEOWNERS resolution.** Fixture repo with a CODEOWNERS file mapping `.claude/skills/
   deploy-checklist/` to `@platform-team` → assert `reviewerList` includes `@platform-team` and
   `teamCount` reflects it. Fixture repo with no CODEOWNERS file → assert graceful fallback text,
   no crash.
5. **Cadence idempotency.** Run the scan-to-PR pipeline twice against the same fixture with no
   change in between → assert the second run updates the existing open PR (same PR number/branch)
   rather than opening a duplicate.
6. **No-findings path.** Fixture repo with zero drift/ownership/security findings → assert no PR
   is opened and no API write call is made at all.

All 6 cases run against local fixtures and the local webhook harness — no live GitHub API call in
the test suite, consistent with the "no live GitHub in tests" requirement.
