# 02 — Ecosystem scanner / data-drop pipeline (build #2)

Status: build-ready. This is the Day-0 primary event per `strategy/launch-distribution-ideas.md`
idea P1 (verdict: GO with mandatory conditions). It is upstream of spec 01 (the bot consumes its
output) and independent of specs 03/05.

## 1. Purpose (reframed, R14)

**Living public index, not a one-time data-drop.** Built and shipped in R14 as
`build/scanner/` (`scan-repo.js`, `scan-list.js`, `weekly-delta.js`), requiring skillsdrift v2's
`artifact/src/` as a library (no fork), with three standing capabilities:

(a) **On-demand scans of any public repo**, generalized beyond the curated list —
`scan-repo.js <github-url-or-org/repo-or-local-path>` clones (shallow, 24h-TTL cache under
`build/scanner/.cache/`), runs skillsdrift v2, and emits a findings JSON + a card (via
`build/cardgen/`) for that one repo. This is what powers spec 01's `@skillsdrift scan <repo>`
oracle mode and any future manual "scan this repo" request — not just the curated batch.

(b) **A weekly delta** (`weekly-delta.js`) — "this week: N new drifted, M newly orphaned" — diffing
`state-of-drift.json` run over run. Each delta is a fresh content event (feeds spec 01's secondary
broadcast layer); out of scope this round to wire that consumption, but the artifact exists.

(c) **The citable "State of Skill Drift" category number** — `scan-list.js` aggregates the curated
list into `state-of-drift.json` and regenerates `build/scanner/out/index.html`, the living index
gallery (headline stats + a card grid, one per scanned repo, plus the weekly-delta strip once a
prior run exists). This is the number the HN/LinkedIn write-ups below cite, and it moves every
week the scan reruns — it is not a static one-time drop.

The original two disclosure-first write-ups (dev-audience HN cut, leader-audience LinkedIn cut)
remain the intended downstream consumers of `findings.json` / `state-of-drift.json`; producing
`hn-post.md`/`leader-post.md` generation code was not in R14's scope (see `00-feasibility-notes.md`
R14 notes) — the aggregate data they'd render from is now real and network-verified. Each write-up
still must carry the R9 mandatory conditions verbatim:

1. Visible candidate-exercise disclosure on the post itself.
2. Drift/ownership/duplication stats reported freely (repo-nameable); security findings reported
   at **category level only** — never "repo X has finding Y."
3. Every named finding paired with a direct "run this on your own org" CTA into the CLI.

## 2. Curated repo list (initial)

`config/repos.json` — the only place repo slugs live; adding a repo means editing this file, not
code. Initial seed list, combining the brief's named targets with the verified-star-count repos
already surfaced in `research/channel-scan.md`:

```jsonc
[
  { "slug": "anthropics/skills",                 "category": "official",   "note": "Anthropic's own skills repo; verified 175,633★/20,782 forks via GitHub API 2026-09-10 (research/channel-scan.md)" },
  { "slug": "vercel-labs/skills",                "category": "vendor",     "note": "named in R13 brief; verify existence/default-branch at clone time" },
  { "slug": "microsoft/azure-skills",            "category": "vendor",     "note": "named in R13 brief; verify existence/default-branch at clone time" },
  { "slug": "hesreallyhim/awesome-claude-code",  "category": "awesome-list", "note": "53,832★ verified via GitHub API" },
  { "slug": "ComposioHQ/awesome-claude-skills",  "category": "awesome-list", "note": "74,817★ verified via GitHub API" },
  { "slug": "travisvn/awesome-claude-skills",    "category": "awesome-list", "note": "15,023★ verified via GitHub API" },
  { "slug": "BehiSecc/awesome-claude-skills",    "category": "awesome-list", "note": "10,115★ verified via GitHub API" }
]
```

Notes for the builder:
- `vercel-labs/skills` and `microsoft/azure-skills` are named in the brief as scan targets but
  their existence/exact default branch was not independently re-verified by this spec round —
  the pipeline's clone step (§3 stage 2) must handle a clone failure gracefully (log + skip +
  continue, never crash the run) precisely because not every named slug is guaranteed to resolve.
- Feishu/Lark and "top skills.sh entries" from the brief are directory/product references, not
  fixed git repo slugs — skills.sh is a discovery *site*, not a single scannable repo. Treat
  these as a **follow-up curation task** (add their actual `.claude/skills`-bearing repos to
  `config/repos.json` once identified) rather than inventing placeholder slugs now. Do not fake
  entries for repos that weren't confirmed to exist.
- "Major awesome-lists" beyond the four above: same rule — add real, checked slugs to
  `config/repos.json` as they're identified; the pipeline doesn't care how many entries there are.

## 3. Pipeline stages

**R14 implementation note:** the pipeline actually shipped under `build/scanner/`, not
`build/ecosystem-scanner/` — a simpler, unified layout (`scan-repo.js` + `scan-list.js` +
`weekly-delta.js` sharing one `lib/`) chosen when this spec's purpose was reframed toward
on-demand-any-repo + living-index rather than a single curated batch job. The stage-by-stage
logic below (clone/cache, run skillsdrift, aggregate, naming firewall) is what was actually built;
treat file paths in this section as historical design intent, and `build/scanner/{scan-repo.js,
scan-list.js,weekly-delta.js,lib/,config/repos.json,out/,data/}` as the as-built layout.

```
build/ecosystem-scanner/    # superseded — see implementation note above; actual: build/scanner/
├── package.json                    # zero runtime deps, Node >=18
├── bin/
│   └── scan.js                     # entry point: run the full pipeline
├── src/
│   ├── clone.js                    # stage 2: shallow clone / cache
│   ├── run-skillsdrift.js          # stage 3: invoke skillsdrift.js --json per repo
│   ├── aggregate.js                # stage 4: merge per-repo JSON into findings.json
│   ├── writeups/
│   │   ├── hn-post.js              # stage 5a: dev cut generator
│   │   └── leader-post.js          # stage 5b: leader cut generator
│   ├── bot-export.js               # stage 5c: bot-findings-table.json (spec 01 §4 contract)
│   └── diff-run.js                 # stage 6: diff vs previous run (for weekly re-scan)
├── config/
│   └── repos.json                  # curated slug list, §2
├── cache/                          # shallow-clone cache dir, git-ignored
│   └── .gitkeep
├── data-drop/                      # one dir per run, timestamped
│   ├── latest -> 2026-09-26/       # symlink, always points at most recent run
│   └── 2026-09-26/
│       ├── findings.json
│       ├── bot-findings-table.json
│       ├── hn-post.md
│       ├── leader-post.md
│       └── per-repo/               # raw skillsdrift --json output, one file per repo, for audit
│           └── anthropics-skills.json
├── fixtures/
│   └── sample-per-repo-output.json # for golden-file tests, no network needed
├── test/
│   ├── aggregate.test.js
│   ├── writeups.test.js
│   └── run-tests.sh
└── README.md
```

Stage detail:

1. **Repo list** — load `config/repos.json`.
2. **Shallow clone** — for each slug, `git clone --depth 1 https://github.com/<slug>.git
   cache/<slug-with-dashes>/` if not already cached; if cached, `git fetch --depth 1 && git
   reset --hard origin/<default-branch>` to refresh. On clone failure (404, network error,
   private repo): log to `data-drop/<run>/clone-errors.log`, skip, continue — never abort the
   whole run for one bad slug.
3. **Run skillsdrift v2 per repo** — `node <path-to-artifact>/skillsdrift.js
   cache/<slug>/.claude/skills cache/<slug>/.codex --json > data-drop/<run>/per-repo/<slug>.json`
   (pass whichever of `.claude/skills` / `.codex` actually exist in that clone; skip repos with
   neither — log to the same clone-errors.log as "no skills directory found"). Exit code 2 from
   skillsdrift here means "no skills found," not a pipeline failure.
4. **Aggregate** — `aggregate.js` merges all `per-repo/*.json` into one `findings.json`:
   ```jsonc
   {
     "runId": "2026-09-26",
     "reposScanned": 14,
     "reposSkipped": 2,               // clone/no-skills failures
     "totalSkillsScanned": 412,
     "byRepo": [
       { "slug": "anthropics/skills", "skillsScanned": 38, "drifted": 0, "unowned": 12, "unversioned": 4, "securityFlagged": 3 }
     ],
     "drift": [ /* cross-repo drift entries are rare (drift needs 2+ paths of the SAME skill name) — most drift here is intra-repo, i.e. two paths passed for one repo */ ],
     "duplication": [ { "name": "pdf-gen", "repos": ["org/a", "org/b"], "versionCount": 2 } ],
     "securityCategorySummary": [ { "patternId": "curl-pipe-bash", "label": "curl/wget | bash pipe", "count": 6 }, { "patternId": "aws-access-key", "label": "hardcoded credential pattern", "count": 2 } ],
     "ungovernedSkillPercentage": 41
   }
   ```
   Aggregation rule for `duplication`: group findings by skill `name` across the `byRepo` set
   using each per-repo manifest's `content_hash` (from skillsdrift's `--manifest` output, also
   generated per repo alongside `--json`) — same name + different hash across repos = a
   duplication entry, repo-nameable per §4. `securityCategorySummary` groups every `security[]`
   finding across all repos by `patternId` and counts occurrences — **never retains the repo
   slug on a security finding** at the aggregate level; that's the category-level firewall.
5. **Generate write-ups** — `hn-post.js` and `leader-post.js` render `data-drop/<run>/hn-post.md`
   and `data-drop/<run>/leader-post.md` from `findings.json` using the templates in §5.
   `bot-export.js` renders `bot-findings-table.json` matching spec 01 §4's contract exactly.
6. **Diff vs last run** — `diff-run.js` compares `findings.json` against
   `data-drop/latest/findings.json` (before updating the `latest` symlink) and writes
   `data-drop/<run>/diff.json` (new findings, resolved findings, delta on
   `ungovernedSkillPercentage`). This diff is what feeds the bot's "what's new this week" framing
   in future spec-01 iterations — out of scope to consume it this round, just produce it.

## 4. Naming policy (R9 honesty — enforced in code, not just prose)

- **Repo-nameable:** `byRepo[]` entries, `duplication[]` entries (drift/duplication findings may
  name org+repo — that's the interesting, non-defamatory finding per the brief).
- **Category-level only, never repo-attributed:** anything derived from `security[]` findings.
  `aggregate.js` must structurally drop the repo slug when folding a security finding into
  `securityCategorySummary` — there is no field in that output shape that could carry a repo
  name back in. This is the same rule as `nameable: false` in spec 01's bot-findings-table
  contract (§3 stage 5c writes that flag).
- Write-up templates (§5) must never interpolate a repo slug into a security-finding sentence —
  enforced by using a separate template partial for security findings that has no `{repoSlug}`
  variable available to it at all.

## 5. Write-up templates

`hn-post.md` template (dev cut — direct, technical, first-person from Aryaman):

```markdown
# Show HN: I scanned {reposScanned} public "awesome skills" repos for drift — {ungovernedSkillPercentage}% show a governance gap

Disclosure: this is part of a candidate exercise for Atlan. Not an Atlan product,
not sponsored, published under my own name.

I ran skillsdrift (a zero-dependency, zero-account CLI I built) against {reposScanned}
public repos that Claude Code / Codex users actually pull skills from — {topSlugsList}.

## What it found

- {ungovernedSkillPercentage}% of the {totalSkillsScanned} skills scanned have no owner marker,
  no version marker, or both.
- Duplication: {duplicationHighlights} — e.g. "{name}" shows up with {versionCount} different
  versions live across {repoCount} of the scanned repos.
- Security (category-level only — I'm not calling out which repo had which finding, that's not
  the point and it isn't fair to maintainers of public reference repos):
  {securityCategorySummaryList}

## Run this on your own org

This is a scan of *public* repos, which under-counts the real problem — the interesting drift
happens in your own private `.claude/skills/` across your team, not in a public reference repo.
The same CLI runs against your own paths in one command:

    npx skillsdrift ~/.claude/skills path/to/teammates-repo/.claude/skills

Recurrence close: a scan finds this once; the moment two people edit a skill again, it drifts
again. Only a governed source of truth stops it from recurring.

Repo: {repoLink} · Methodology + raw findings: {findingsJsonLink}
```

`leader-post.md` template (LinkedIn cut — for the AI-transformation-leader ICP, boardroom-safe,
no jargon, no "curl pipe bash" detail):

```markdown
Disclosure: candidate exercise for Atlan, not an Atlan product.

We scanned {reposScanned} widely-used public "AI agent skill" repositories — the kind of
libraries teams are already pulling into Claude Code / Codex workflows. {ungovernedSkillPercentage}%
of the {totalSkillsScanned} skills sampled had no named owner, no version tracking, or both.

This isn't a story about any one repo doing something wrong — it's the default outcome of
letting reusable AI instructions spread through copy-paste instead of a governed source. The
pattern shows up everywhere we looked, at every scale.

For a transformation leader, the question isn't "did we get unlucky" — it's: if this is the
baseline in public reference repos, what does the baseline look like inside your own
organization, across every team already experimenting with agent skills?

The scan is free to run on your own org (link below). What it will not do is fix what it finds —
that's the point. A scan finds drift; only a governed registry — named owners, tracked versions,
security review as part of import, not an afterthought — keeps it from recurring every sprint.

Run it: {ctaLink}
```

Both templates are plain Markdown with `{braces}` variables filled by `writeups/*.js` from
`findings.json`. Neither template contains a `{repoSlug}`-in-security-sentence slot (§4).

## 6. Rate limits and caching

- Shallow clone (`--depth 1`) only — never full history.
- Cache dir (`cache/`) persists between runs; a weekly re-scan does `fetch --depth 1` +
  `reset --hard`, not a fresh clone, to stay light on GitHub's anonymous rate limit
  (60 req/hr unauthenticated, higher via `gh`'s authenticated session — prefer routing clones
  through `gh repo clone` when available, since `gh` is already authenticated on this VPS per
  00-feasibility-notes.md, falling back to plain `git clone` over https for repos gh can't reach).
- Sequential clone with a fixed delay (`--delay-ms`, default 2000) between repos, not parallel —
  a 7-repo curated list doesn't need concurrency and staying sequential avoids any rate-limit
  surprises worth debugging.

## 7. Cron schedule

Weekly re-scan, feeding spec 01's bot:

```cron
0 3 * * 1 cd /home/debian/workspace/atlan-gtm/build/ecosystem-scanner && /usr/bin/node bin/scan.js >> cron.log 2>&1
```

Plain crontab (not hermes cron, per 00-feasibility-notes.md).

## 8. Test plan (no network)

`test/run-tests.sh` via `node --test`.

1. **Golden-file: aggregation.** `fixtures/sample-per-repo-output.json` (3 fake per-repo
   skillsdrift `--json` outputs, one with a security finding, one with a cross-repo duplicate) →
   `aggregate.js` → assert `findings.json` output matches a checked-in expected fixture exactly.
2. **Security naming firewall.** Aggregate a fixture containing a security finding tagged with a
   repo slug in the raw per-repo input → assert the repo slug string does not appear anywhere in
   `securityCategorySummary` or in the rendered `hn-post.md` / `leader-post.md` output.
3. **Write-up golden files.** Fixed `findings.json` fixture → `hn-post.js` / `leader-post.js` →
   assert rendered Markdown matches checked-in `fixtures/expected-hn-post.md` /
   `expected-leader-post.md` byte-for-byte.
4. **Disclosure presence.** Both write-up outputs → assert each contains the exact string
   "candidate exercise for Atlan" in its first 3 lines.
5. **Bot export contract.** `bot-export.js` output → validate against spec 01 §4's documented
   shape (required keys present, `nameable` is `false` for every entry derived from a security
   finding).
6. **Clone-failure resilience.** Mock `clone.js`'s git invocation to fail for one slug in a
   3-slug fixture list → assert the pipeline still produces `findings.json` covering the other
   two, plus a `clone-errors.log` entry for the failed one, and exits 0 (partial success is
   success, not a pipeline failure).

All 6 cases run offline against fixtures; no live GitHub access required for the test suite
(the pipeline itself needs network only at stage 2, which is exercised manually/in CI-with-
network, not in the unit test suite).
