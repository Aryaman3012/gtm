# skillsdrift

A zero-account CLI that audits local agent-skills directories (`.claude/skills/`,
`.codex/`, or any path you point it at) for **drift** — the same skill name
existing in two places with different content — plus **missing ownership**,
**missing versioning**, and a set of **security risk heuristics**.

If your team shares Claude Code or Codex skills by committing them to a repo
(or copying them around), nothing stops two copies of the same skill from
silently diverging, and nothing tells you who's responsible for a skill or
whether it's safe to run. `skillsdrift` doesn't fix that — it shows you where
it's already happened, in your own directories, in one run.

Security heuristics exist because skills are executable instructions, not
inert prose: Snyk's ToxicSkills research scanned a public skills directory
and found **36.82% of skills (1,467) had at least one security flaw**,
including 76 malicious credential-theft payloads. Skills are a software
supply chain, and this tool treats them like one — a lightweight first pass,
not a replacement for real review.

## Install

Requires Node.js 18+. No dependencies to install (Node built-ins only).

```bash
git clone <this-repo> skillsdrift && cd skillsdrift
node skillsdrift.js --help
```

Once published, `npx skillsdrift <path>...` is the primary invocation (see
Quickstart). Running from source as above works identically.

## Quickstart

```bash
npx skillsdrift ~/.claude/skills path/to/another/repo/.claude/skills
```

This scans both paths, hashes every skill's files, and writes two files to
your current directory:

- `skillsdrift-report.md` — the 3-layer report (below)
- `skillsdrift-manifest.json` — the import-ready inventory (below)

See [`skillsdrift-report.md`](./skillsdrift-report.md) in this repo for a
real sample, generated from `fixtures/`.

## What it checks

1. **Drift** — same skill name found under 2+ scanned paths, hashed (content
   normalized for line endings / trailing whitespace), and if the hashes
   differ, a per-file line diff is included in the report (not just "differs").
2. **Ownership** — flags any skill missing an `owner` (or `maintainer`) field
   in `SKILL.md` frontmatter, unless an `OWNERS`/`CONTACT` file sits next to it.
3. **Version** — flags any skill missing a `version` field in frontmatter.
4. **Security heuristics** — 11 regex-based patterns, checked line-by-line
   against every file in a skill directory:
   - `curl <url> | bash` / `wget ... | sh` — remote script piped straight into a shell
   - `eval(` calls
   - AWS access key IDs (`AKIA...`)
   - LLM-provider-style secret keys (`sk-...`)
   - GitHub tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_...`)
   - Slack tokens (`xox...`)
   - hardcoded secret-shaped assignments (`api_key = "<20+ char string>"`)
   - broad `rm -rf /`, `rm -rf ~`, `rm -rf *`, `rm -rf $HOME`
   - `sudo` invocations
   - reverse-shell one-liners (`nc -e`, `/dev/tcp/...`)
   - network calls to a bare IP address (no domain)

## The 3-layer report

`skillsdrift-report.md` is one file, three audiences, in this order:

1. **Layer 1 — Engineer view.** Per-skill findings: drift diffs, ownership/
   version flags, security heuristics. First-person-useful, no sales pitch —
   a tool you'd want even if no one else ever saw it.
2. **Layer 2 — Team scorecard.** Aggregated across every scanned path:
   ungoverned-skill count, drift incidents, duplicate rate, bus-factor
   (skills with exactly one named owner, or none), and blast-radius examples
   ("`pdf-gen` — 2 versions across 2 scanned paths, 3 files affected").
   Written in internal-audit language, as if your team produced it —
   `skillsdrift` never says "skillsdrift found this," it says "your team's
   skills," because this is the artifact a champion presents as their own
   diligence, not a vendor's pitch.
3. **Layer 3 — Exec memo** (`## For your AI lead / VP`). Leads with the
   headline metric — **Ungoverned Skill Percentage (USP)**:

   > **[XX]% of this team's agent skills have no named owner, no version
   > marker, and no security review. That number only moves one way on its
   > own: up.**

   Followed by drift-incident count, a security-exposure summary (counts by
   pattern category, flagged as forward-looking until Atlan ships its native
   scan), key-person risk translated into engineer-hours (bus-factor-1
   skills × an assumed 4 hours to reconstruct one — stated as an assumption,
   not a measurement), and governance-posture framing. This layer answers
   *"is our AI governance posture improving or degrading,"* never *"you
   should buy this registry."*

**Every layer ends with a recurrence close** — see "Why this never
auto-fixes" below. That's not a style choice; it's load-bearing to what this
tool is for.

## The manifest — `skillsdrift-manifest.json`

Every scan also writes an import-ready inventory, schema
`atlan-registry-import/1`: every skill found, which paths it lives in, its
content hash, a duplicate-group id if the same name appears more than once,
and — for anything missing an owner or version — a *suggestion*, never a
composed value:

```json
{
  "schema": "atlan-registry-import/1",
  "generated_at": "...",
  "paths_scanned": [...],
  "skills": [
    {
      "name": "pdf-gen",
      "paths": ["repo-a/.claude/skills"],
      "duplicate_group": 1,
      "content_hash": "...",
      "owner": "aryaman@example.com",
      "owner_suggestion": null,
      "version": "1.0.0",
      "version_suggestion": null,
      "security_flags": [],
      "suggested_action": "merge"
    }
  ],
  "duplicate_groups": [
    { "id": 1, "members": ["repo-a/.claude/skills/pdf-gen", "repo-b/.claude/skills/pdf-gen"], "suggested_canonical": "repo-b/.claude/skills/pdf-gen" }
  ]
}
```

Identical copies of the same skill collapse into one entry with multiple
`paths`; copies that have actually drifted get one entry per distinct
`content_hash`, sharing a `duplicate_group` id. `suggested_action` is
`"review"` if the skill is security-flagged, `"merge"` if it's part of a
group that has drifted, otherwise `"import"`. Nothing in this file is
written back to your skills — it's a suggestion for a human to confirm when
importing into a governed registry, never a value `skillsdrift` composes on
your behalf.

The report's final CTA: *"Import this inventory into the governed registry
pilot — `skillsdrift-manifest.json` is ready."*

## Dual-language mode — `--language dev|biz`

Same findings, two surfaces. Applies to the team-scorecard and exec-memo
layers (Layer 1 stays engineer-shaped either way):

- `dev` (default): drift, unowned, unversioned, security-flagged.
- `biz`: outdated, off-brand (no owner on record), duplicated ("everyone
  made their own version") — the same underlying scan, read by a
  knowledge worker or a non-technical decision-maker instead of an engineer.

```bash
skillsdrift .claude/skills --language biz
```

## Check-in mode — `--checkin`

```bash
skillsdrift .claude/skills --checkin
```

Writes the report to a stable, git-friendly filename,
`.skillsdrift-report.md`, with deterministic content (no timestamp line) so
`git diff` on it means something run-to-run, and prints the one-line command
to commit it. This is the permission-free path for a team with no shared
repo and no admin rights to install anything: the engineer runs the scan and
commits the file to whatever repo, dotfiles folder, or shared directory
already functions as the team's de facto shared state — no App install, no
org approval, no new infrastructure.

## Why this never auto-fixes

Every layer of the report ends with a hard-coded recurrence close:

- **Layer 1:** *"This will drift again the moment a second person edits any
  of these skills. A local scan can find it; only a governed source of truth
  prevents it."*
- **Layer 2:** *"Governed skills stay in sync automatically; ungoverned
  skills diverge again next sprint. This score will look different next
  month whether or not anyone acts today."*
- **Layer 3:** *"This number moves every sprint whether or not anyone
  reviews it. A scan finds ungoverned skills; only a governed registry keeps
  the number from climbing back."*

This isn't hedging — it's the actual shape of the problem. A scanner finds
drift; only a registry with identity, versions, owners, and dependencies
makes drift structurally impossible to recur. `skillsdrift` deliberately has
no merge command, no auto-fix, no "resolve" button: if it satisfied the pain
in one session, the free tool would replace the thing it's pointing at
instead of making the case for it. It diagnoses. It never composes a fix on
your behalf, and it never will.

## Usage

```
skillsdrift <path> [<path>...] [options]

  --json                Print JSON to stdout instead of writing report/manifest files
  --out <file>           Markdown report path (default: ./skillsdrift-report.md)
  --manifest <file>      Manifest path (default: ./skillsdrift-manifest.json)
  --language <dev|biz>   Report language for the scorecard + exec-memo layers (default: dev)
  --checkin              Write .skillsdrift-report.md (deterministic), print the commit command
  --waitlist-url <url>   Override the CTA URL (or set SKILLSDRIFT_WAITLIST_URL)
  -v, --version
  -h, --help
```

Exit codes: `0` clean scan, `1` findings present, `2` usage error.
`--checkin` cannot be combined with `--json`.

## Waitlist URL

The report's CTA line uses the placeholder `__WAITLIST_URL__` by default.
Set `SKILLSDRIFT_WAITLIST_URL` (or pass `--waitlist-url`) to override it
before running the tool for a real launch.

## Who this is for

An engineer or tech lead who introduced Claude Code / Codex skills to their
team informally (a shared repo, a Dropbox folder, copy-paste) and now wants
to know, in 30 seconds and without asking anyone for access, whether any of
those skills have quietly diverged, lost their owner, or picked up something
that looks like a planted credential or a curl-pipe-bash install step. The
team scorecard and exec memo exist so that same evidence can travel upward —
to a champion's own diligence, then to the decision-maker who owns the
budget conversation — without anyone composing a pitch.

## Enterprise note

`skillsdrift` is **local-only, read-only, zero-network, zero-telemetry**:
it never phones home, never uploads a file, never calls out to any host.
Every check above runs against bytes already on disk. That means an
engineer at an enterprise can run it — and a champion can hand the report
upward — without filing a security review, because there is nothing in its
network or data-handling profile for a review to flag.

## Honest limitations

- **Static and heuristic, not semantic.** The security checks are regex
  patterns on file text, not execution analysis. They will miss obfuscated
  or indirect risks and can false-positive on legitimate uses (e.g. a
  `sudo` line in a comment, or a real base64 blob that isn't a secret).
- **Drift detection only knows about text content.** It hashes normalized
  file bytes; it has no understanding of whether a change is a meaningful
  behavior change or a harmless rewording.
- **Ownership/version checks depend on convention.** If your team uses a
  different marker than `owner`/`version` frontmatter or an `OWNERS`/`CONTACT`
  file, this tool won't recognize it and will over-flag.
- **No cross-file/cross-skill semantic dedup.** Two skills that do the same
  thing under different names won't be linked; only exact-name matches are
  compared for drift.
- **Blast-radius counts are per-path, not per-teammate.** The tool has no
  git history or identity data, so "used by N teammates" is approximated as
  "found across N scanned paths" — a real but coarser signal.
- Nothing here is a claim about how many teams use this — it's a new,
  unpublished tool as of this writing.

## Tests

```bash
bash test/run-tests.sh
```

Spins up fixture copies in a temp directory and asserts: every finding
category fires with the correct exit code; the 3-layer report structure
(all three headers, the USP headline, all three recurrence closes); the
manifest's schema, duplicate groups, and `suggested_action` values; the
`--language biz` output; and `--checkin` file emission and determinism.

## The pilot

skillsdrift is a one-time snapshot. If you want drift, ownership, and
security checks running continuously across your team — a governed registry
layer on top of Claude Code / Codex skills — join the pilot waitlist:
**`<PILOT_URL>`** (landing page hosted at publish time).
