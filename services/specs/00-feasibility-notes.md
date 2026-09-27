# 00 — Feasibility notes (R13, verified 2026-09-26; R14 build notes appended 2026-09-26)

## R14 — the no-Atlan stack (built 2026-09-26)

R14 built the two fully-unblocked tools for real: scanner-as-service
(`build/scanner/`: `scan-repo.js`, `scan-list.js`, `weekly-delta.js`) and the card
generator (`build/cardgen/cardgen.js`), both requiring skillsdrift v2's `artifact/src/`
as a library (no fork). `build/run-tests.sh` covers cardgen golden-file/redaction
output, a scan-repo run against a local artifact fixture (no network), slug/cache TTL
rules, and delta generation from two fixture state files — all offline. A real
`scan-list.js` run against the curated public list (`build/scanner/config/repos.json`)
scanned 4 of 7 repos successfully (3 awesome-lists had no `.claude/skills`/`SKILL.md`
tree to find — logged to `data/clone-errors.log`, run still succeeded) and produced
`build/scanner/out/state-of-drift.json` + `out/index.html` (the living index gallery).

**Architecture — everything up to the waitlist is ours:**

- The stack ends at the waitlist. There is no Atlan product anywhere in `build/` —
  `atlan-registry-import/1` (skillsdrift's manifest schema *name*, a string, not an
  SDK) is the only place "atlan" appears outside disclosure copy.
- Card URLs (`drift.aryaman.tech/cards/<slug>` once DNS exists, `out/cards/<slug>.html`
  today) are our share-link prototype — Track B (`strategy/skill-share-links.md`) in
  miniature, built entirely on our own static-file stack, no registry-mediated infra
  required to ship this version.
- The manifest (`atlan-registry-import/1`, emitted by `artifact/src/manifest.js`,
  unchanged) is the portable demand object: every scan produces an import-ready
  inventory that makes a future Atlan Registry pilot conversion mechanical — a
  document handoff, not a rebuild.
- Honesty enforced in code, not just prose: `build/cardgen/lib/redact.js` and the
  card template never read a `dir`/`rootLabel`/`file`/`snippet` field off the input
  report — security findings reach every public surface (cards, gallery,
  `state-of-drift.json`) as category-level `{label, count}` only, never repo- or
  path-attributed.

**Open design questions — status update:**

(a) Non-tech activation signal: still unresolved. Not touched by R14 — the scanner/
card/gallery report *governance* state only (drift/ownership/security/duplication),
never a claimed activation number, per the existing constraint below.

(b) Activation measurement instrumentation: still not built. R14 added no dashboard,
no instrumentation — out of scope, as before.

## R13, verified 2026-09-26

Ground truth for specs 01/02/03/05. The orchestrator (Hermes) checked the VPS environment
before this round; the facts below are load-bearing for every design decision in the four
build specs. Do not re-verify unless something here is contradicted at build time.

## Environment facts

| Fact | Detail | Verified |
|---|---|---|
| `gh` CLI | Installed, authenticated as `Aryaman3012` (github.com), https protocol | 2026-09-26 |
| Public repo access | `git ls-remote` / shallow clone of public repos works with no auth | 2026-09-26 |
| Node | v24.19.0 | 2026-09-26 |
| Zero-dep constraint | Holds for CLI artifacts — skillsdrift v2 ships with zero runtime deps; specs 01/02/03 (all CLI-shaped) must preserve this | 2026-09-26 |
| nginx | Serves static sites via sites-enabled; established pattern is a dedicated subdomain per surface (`testing.aryaman.tech`, `dashboard.*`, `personal.*`) with a root dir pointed at a static build output | 2026-09-26 |
| X/Twitter credentials | **NONE on this VPS.** Checked `~/.local/bin`, `~/.xurl*`, `~/.config/xurl*` — no `xurl` binary, no API keys. | 2026-09-26 |
| Scheduling | `hermes` cron exists but is reserved for agent-orchestrated jobs. Specs must use plain `crontab` or a systemd timer for infra-only jobs — keep boring, keep independent of the agent stack. | 2026-09-26 |
| skillsdrift v2 CLI | `node /home/debian/workspace/atlan-gtm/artifact/skillsdrift.js <paths...>` — see interface below | 2026-09-26 |

### skillsdrift v2 CLI interface (as shipped, confirmed via `--help` and a live run)

```
skillsdrift <path> [<path>...] [options]

--json                 machine-readable JSON to stdout (no report file written)
--out <file>           Markdown report path (default ./skillsdrift-report.md)
--manifest <file>      manifest path (default ./skillsdrift-manifest.json, always written)
--language dev|biz     report language (default dev)
--checkin              write to .skillsdrift-report.md, no timestamp, deterministic diff
--waitlist-url <url>   CTA override (default $SKILLSDRIFT_WAITLIST_URL or "__WAITLIST_URL__")

Exit codes: 0 = no findings, 1 = findings present, 2 = usage error
```

`--json` output shape (confirmed by live run against `artifact/fixtures/`):

```
{ tool, generatedAt, scannedPaths[],
  scorecard: { skillsScanned, driftedPairs, unowned, unversioned, securityFlagged },
  drift[], ownership[], version[], security[], duplicateGroups[], busFactor{},
  ungovernedSkillPercentage, securityNote, waitlistUrl }
```

Manifest schema is `atlan-registry-import/1`:

```
{ schema: "atlan-registry-import/1", generated_at, paths_scanned[],
  skills: [{ name, paths[], duplicate_group, content_hash, owner, owner_suggestion,
             version, version_suggestion, security_flags[], suggested_action }] }
```

`suggested_action` ∈ `import | review | merge`. These two shapes are the only contracts specs
01/02/03/05 may assume; do not invent fields that aren't in this dump.

## Per-build feasibility verdicts

| Build | Buildable now? | Blocking item | Workaround specced |
|---|---|---|---|
| 01 — Twitter drift bot | **Yes, `draft` mode only.** `post` mode cannot function until X API creds exist. | X API credentials (OAuth2 app or `xurl`-equivalent) | Pluggable auth-provider interface; `post` fails loud with a named error until creds are supplied. Never fake a post. |
| 02 — Ecosystem scanner | **Yes, fully.** Only needs `git`, Node, and public GitHub read access — all confirmed working. | None | — |
| 03 — Shareable report card | **Yes, generator fully buildable now.** Hosting needs one DNS action. | DNS record for the proposed `drift.aryaman.tech` subdomain | Generator ships and can be tested by opening the HTML file locally; deploy step is a documented Aryaman action item, not a blocker to building. |
| 05 — GitHub App | **Scaffolding only, per R10 sequencing.** Do not deploy publicly. | (a) GitHub App registration (name, webhook URL, PEM) — Aryaman-owned; (b) 20+ orgs must have run the CLI first (usage-evidence gate, R9) | Spec the full architecture and code layout now; runbook documents the registration steps as an explicit later action, gated on the usage-evidence threshold. |

## Blocking items list (owners + workarounds)

1. **X API credentials** — Owner: Aryaman. Needed only for spec 01's `post` mode. Workaround: `draft` mode is the shipped default and requires nothing; `post` mode is built against a documented provider interface (spec 01 §6) so wiring real creds later is a config change, not a rewrite.
2. **DNS for `drift.aryaman.tech`** (or whatever subdomain Aryaman approves) — Owner: Aryaman. Needed only to make report cards (spec 03) publicly link-shareable. Workaround: cards are static files; they can be generated, reviewed, and even served from `testing.aryaman.tech/cards/` temporarily if Aryaman wants to defer the new subdomain.
3. **GitHub App registration** (app name, webhook URL, PEM, install-flow decisions) — Owner: Aryaman. Needed only to run spec 05 against real repos. Workaround: none needed yet — R10 sequencing explicitly says build/scaffold now, deploy publicly only after the usage-evidence gate (20+ orgs having run the CLI) AND registration is complete. Both are named action items in spec 05, not blockers to writing or even unit-testing the code.
4. **Usage-evidence gate for spec 05** — Owner: Aryaman (tracks it), Hop-0/Hop-1 mechanisms (spec 02 data-drop, spec 01 bot) produce the evidence. Not a technical blocker — a go/no-go gate on the *public* install flow only.

## Open design questions (flagged, not resolved by this round)

These two items surfaced during R9/R10/R12 activation-definition work and remain unresolved.
They are out of scope for specs 01/02/03/05 to fix, but every spec that touches "activation" or
"traces" language must not silently assume they're solved.

**(a) Traces don't work as an activation signal for non-tech teams.**
Correction 3's activation definition (`strategy/activation-plan.md`, `strategy/enterprise-icp-correction.md`)
requires "traces flowing" — agents executing against governed skills, feeding the reporting
surface — as one of three activation legs. That signal is well-defined for engineering workspaces
(coding agents emit traces naturally). It is **not** well-defined for non-tech buying-center seats
(sales, marketing, CS workspaces per the cross-function-crossing work) — those teams don't
generate the same kind of execution trace, so "traces flowing" as currently defined would read
non-tech teams as permanently non-activated even when they're genuinely using governed skills.
**Open question:** what is the non-tech-equivalent activation signal (skill invocation count?
check-in commits? something else), and who defines it? Not answered in this round.

**(b) Nothing has been built for activation measurement yet.**
The three-leg activation test (imported skills / ~10 people via workspace-plugin / traces flowing)
exists as a strategy definition only. No dashboard, no instrumentation, no data pipeline currently
computes or reports it for any org. This is flagged as work required — likely a future R-round —
not something specs 01/02/03/05 should attempt to backfill. Builders should NOT invent an ad hoc
activation metric inside the Twitter bot, scanner, report card, or GitHub App; all four report
*governance* state (drift/ownership/security/duplication), never a claimed "activation" number.

## Constraints binding every spec (do not restate, do not weaken)

- **T5 (anti-fragmentation gate, `strategy/anti-fragmentation-gate.md`):** every free artifact must
  *diagnose*, never *satisfy*. No auto-fix. No numeric score/hygiene badges. Every report-shaped
  output ends on a recurrence close (the finding recurs the moment someone edits a skill again;
  only a governed source of truth prevents it).
- **Honesty:** candidate-exercise disclosure ("part of a candidate exercise for Atlan, not an
  Atlan product") visible on every public-facing artifact. No fabricated reach/usage numbers.
  Security findings about named third parties reported at category level only, never
  "repo X has a leaked key Y."
- **Zero-telemetry:** free artifacts (CLI, report card) ship with no analytics, no beacons, no
  phone-home. If Aryaman wants view counts later, that's a server-side nginx log grep, never
  client-side tracking.
- **Enterprise ICP:** the DM is an AI-transformation-leader, not an individual contributor. Leader-
  facing copy in specs 02/03 should read as boardroom-safe, not developer-snarky.
