# Section 3 — the first campaign, and the things you can run

*Aryaman Singh · GTM candidate work sample · Independent exercise, not affiliated with Atlan.*

The brief asks for seven things plus a signal, and then for something you can
click, run or inspect — noting that *"a polished mockup with no path to evidence
is weaker than a rough working system that teaches us something."* This document
is organised that way: the campaign elements first and briefly, then the working
systems in detail, because that is where the weight of the brief sits.

Every figure was verified at the time of writing by running the thing that
produces it.

| | |
|---|---|
| **Code and documents** | <https://github.com/Aryaman3012/gtm> — MIT licensed, public |
| **Live site** | <https://drift.aryaman.tech> — index, per-repo cards, pilot waitlist |
| **Run it in two commands** | `git clone https://github.com/Aryaman3012/gtm` then `node gtm/cli/skillsdrift.js .claude/skills .codex` |

Relative links below point inside that repository. Node 18+ and Python 3.8+, no
dependencies, no network calls, no account.

---

## The campaign in one table

| Brief asks for | Answer |
|---|---|
| **Audience** | Platform and DevEx engineers at 200–2,000 person companies that officially allow two or more AI tools |
| **Offer** | "See how your team's AI skills have drifted across tools and repos in 30 seconds. Nothing leaves your machine." |
| **Acquisition asset** | The `skillsdrift` CLI, the State of Skill Drift index, per-repo cards, and the X bot that scans on request |
| **Destination** | <https://drift.aryaman.tech> — live, with the pilot waitlist behind the report's CTA |
| **Call to action** | "Run the scan." Then: "Import this inventory into a governed pilot." |
| **Launch mechanics** | Data drop on HN, X and LinkedIn on Day 0; creator amplification Days 1–7; awesome-list submissions Days 7–30 once there is usage to cite |
| **Measurement** | Waitlist signups by domain, GitHub traffic by org, App installs per domain. The CLI sends nothing by default |
| **Signal to continue / change / stop** | Below |

**The audience qualifier doing the work is *two or more tools*.** Inside a single
tool the vendor now governs skills properly — Claude org skills, ChatGPT
workspace skills, Copilot org instructions. The pain has moved to the seams, so
a single-tool company is genuinely well served and is not a prospect.

**The offer deliberately gives away no free fragment** — no badge, no score, no
hosted dashboard — that would satisfy the need in one session and stop people
going further. *A scanner finds drift; a registry makes drift impossible.*

---

## The Day 0 asset: the data drop

> **Anthropic publishes 20 official agent skills. Twelve of them are in
> circulation elsewhere in versions that no longer match the original — and
> every single one of those twelve has drifted. Twelve for twelve.**

Not "some copies go stale": every copy found, without exception. The copies are
two months behind — frozen at 2026-07-24 while Anthropic's repository moved on
2026-09-24 — and the divergences are not cosmetic:

| Anthropic skill | Files differing from the copy |
|---|---|
| `docx` | 111 |
| `pptx` | 108 |
| `xlsx` | 53 |
| `slack-gif-creator` | 22 |
| `skill-creator` | 19 |
| `pdf` | 11 |
| `mcp-builder` | 5 |
| `brand-guidelines`, `canvas-design`, `internal-comms`, `theme-factory`, `webapp-testing` | 1 each |

The copies still carry Anthropic's own `license: Proprietary. LICENSE.txt has
complete terms` line, which is how you can tell these are vendored snapshots
rather than independent work that happens to share a name.

**Anthropic is named; the collection holding the copies is not.** Anthropic is
the source, and theirs is the repository that moved forward correctly — nothing
here reflects badly on them, and the finding is only legible if the canonical
side has a name. The copier is the side a name would injure, gains nothing from
being identified, and its maintainers get the detail privately before anything
is posted.

**The hook went through two wrong versions first, and the second one matters.**
The first led with "100% of skills have no owner field", which measures a file
convention rather than a problem — public libraries keep ownership in git. The
second led with *"I scanned 951 skills for drift and found none, and that's the
finding"*, with an elegant argument that public repositories are single sources
of truth so drift must be private. That was false. The scanner ran on each
repository in turn:

```js
for (const entry of repos) { result = scanRepo(slug) }
```

A skill cannot drift against itself, so a per-repo scan reports zero cross-repo
drift *by construction*. The zero was a property of how the question was asked.

**That mistake stays in the published post**, because it is the most persuasive
thing in it. A tool that finds drift is a claim; an author fooled by his own
null result, who says so, is evidence that the failure mode is real and easy to
miss. It demonstrates the thesis on the author rather than on a stranger.

Full drafts for Show HN, X and LinkedIn: [`campaign/p1-data-drop.md`](../campaign/p1-data-drop.md).
The three-prong X plan, with handles verified from each account's own profile
data: [`campaign/x-distribution.md`](../campaign/x-distribution.md).

---

## The signal to continue, change, or stop

| Gate | Continue | Change | Stop |
|---|---|---|---|
| **Discovery interviews** | ≥ 5 of 8 describe drift *across tools* unprompted | 3–4 → pain is real but contained in one tool; reposition to the app/assistant gap | < 3 of 8 → the ICP filter is wrong, not the messaging |
| **Launch wave** | ≥ 25 ICP-matching companies complete a scan | Scans cluster below 200 people → shift to platform-engineering communities | Two waves under target → rethink the channel |
| **Individual → team** | ≥ 15% of opted-in scanners run a team scan | Lower → the report is not making the case for looking wider | — |
| **Crossing into non-tech** | A shared link opened by ≥1 non-engineering function within 14 days at a design partner | Engineering-only → run the cross-functional share by hand in one function | — |
| **Champion** | App installs at design partners | Champions engage, leaders do not → reframe the summary for leaders | — |

Two notes rather than five derivations. **25 companies** comes from the plan's
own arithmetic, not an aspiration: 8,000–20,000 best-case week-one readers, a
~5% visitor-to-run assumption, most of those solo developers outside the ICP
filter, leaving 20–100 companies that match — 25 is the conservative end and is
falsifiable inside the window. **The 15% gate cannot be measured today**,
because the team scan does not exist; either it is built before the launch wave
or that row is assessed qualitatively from design partners. A threshold resting
on an unbuilt artifact is not a gate, and saying so is better than letting a
number imply a measurement.

---

# What we left behind

Six working systems, all in the repository, all with tests. **58 tests across
four suites, passing on Linux and macOS.** Nothing here rests on a build log.

## 1. `skillsdrift` — the CLI

The artifact the whole channel depends on. Reads agent-skill directories, finds
the same skill in two places with different contents, plus missing owners,
missing versions, and 11 security patterns. Writes a three-layer report
(engineer / team scorecard / exec memo) and an import-ready manifest.

```bash
cd cli
node skillsdrift.js fixtures/repo-a fixtures/repo-b
```

Two fixture repos ship with planted drift, so it works with nothing else set up:
8 skills across 2 paths, 1 drifted pair, 1 unowned, 1 unversioned, 2
security-flagged. Node 18+, no dependencies, no network call, no telemetry.
`bash test/run-tests.sh` runs 10 tests.

**What it taught.** It was silently truncating its own JSON. `skillsdrift.js`
called `process.exit(run(...))`, and Node writes to a pipe asynchronously, so
`process.exit()` discarded whatever was still buffered — **146,103 bytes
delivered out of 1,469,069, with no error on either side.** Writing to a file
worked, because file writes are synchronous, which is exactly why nobody
noticed. Every user piping `--json` into `jq` had been getting truncated
reports. It now sets `process.exitCode` and lets Node drain.

## 2. The scanner and the cross-repo pass

Clones public repositories, scans them, and generates the index and cards.

```bash
cd services && bash run-tests.sh          # 10 tests
node scanner/cross-repo-drift.js          # the pass that found the drift
```

**What it taught.** `scan-list.js` scans each repository alone, which cannot
find cross-repo drift by construction — this is the bug that produced the false
"zero drift" headline. `cross-repo-drift.js` runs the same engine over every
cached clone in one pass, and found 12 drifted pairs immediately. **The CLI was
always right; only the way it was being called was wrong.**

## 3. The X bot

The public oracle. Someone tweets `@skillsdrift scan <repo>`, it clones, scans,
generates a card and replies. Four commands: `draft-scan`, `draft-broadcast`,
`process-inbox`, `post-approved`. 30 tests.

```bash
cd services && bash bot/test/run-tests.sh
```

**The design decision worth arguing about.** Two source documents pulled in
opposite directions. Spec 01: *"the asker's own followers see the reply, which
is the actual distribution mechanism."* §3.4: *"replies with a private link, not
a public verdict."* Implementing the second as DM-everything honoured it and
switched off the first — nobody's followers see a DM, so the channel stops
distributing.

The line that satisfies both is not public-versus-private, it is **which
findings**. Drift and ownership counts on a public repository are already public
— the index publishes them with the repo named — so repeating them is not a
verdict. Security is what the index deliberately reports unattributed. So every
scan now produces **both halves**: a public reply that distributes, and a DM
carrying any security detail. Security never appears in the public half for
anyone, maintainer included, and a private half with no recipient refuses rather
than falling back to public.

**Human approval is structural, not procedural.** `post-approved` cannot run
against a draft that has not been marked approved, and with no credentials
configured it fails with a specific error rather than pretending to post. It has
no X credentials today, so it cannot post at all.

## 4. The GitHub App

Weekly check on an installed repository: scans, and **opens an issue** with the
findings and a link to the repo's own card. 8 tests.

```bash
cd services && bash app/test/run-tests.sh
```

**Why issues rather than pull requests.** It used to open PRs. §1.8 step 3 is
explicit — *"It never opens pull requests in other teams' repos uninvited; a
colleague's forwarded note is welcome, while an automated PR reads as spam."*
The code's own comment already admitted there was nothing to merge. A PR is now
opened only on a recorded opt-in.

**Why it is built but deliberately not registered.** This looks like an omission
and is a decision. `launch-distribution-ideas.md` ranks the App as the Day 0–7
conversion destination, live on Day 0 as the data drop's CTA. `two-hop-gtm.md`
§A3 supersedes that with a concrete reason: installing a GitHub App on an
org-owned repository requires owner/admin approval, which the wedge engineer —
*"the accidental-owner engineer… explicitly no budget or admin authority"* — by
definition does not have. A3 calls this the modal case at enterprise and
concludes that *"the App is not the trigger for Hop 1, it's the result of a
successful, permission-free Hop 1."* So the Day 0 CTA points at the CLI alone,
and the App's role is Days 7–30, requested by a champion who has already seen
CLI evidence.

**What it taught.** Its scheduler had the same truncation bug as the CLI, on its
*normal* code path — `skillsdrift` exits non-zero whenever it finds anything, and
`execFileSync` truncates stdout on its error path. A repository with enough
findings would have silently produced unparseable JSON. Now uses `spawnSync`.

## 5. The `skillsdrift-bridge` skill

A Claude/Codex skill that reads a drift report, works out which skills are used
*outside* engineering, and shares a link to each skill's page in the org's Atlan
dashboard over Slack — with consent at every step.

```bash
cd skills/skillsdrift-bridge
python3 scripts/triage.py examples/sample-registry-manifest.json --format md
```

**Why a link and not a file.** A file is a copy, and copies are how drift
starts. A link to the governed version means the recipient sees the canonical
copy, its owner and its usage, and signs in with their work account — so a
colleague's Slack message is what onboards them. That is the "one becomes many"
loop in a single artifact.

Consent is two-layered: the user approves each destination individually, and
when a message names someone's skill, that owner approves being named before
anyone else is contacted. Security-flagged skills are never shared at all.

**What it taught.** The packaged `.skill` file had been built by hand and
silently omitted its examples — a generated artifact that had drifted from its
source, in a project about things drifting from their sources. It is now built
by [`scripts/package-skill.sh`](../scripts/package-skill.sh), whose `--check`
mode fails if the package and the source diverge.

## 6. The site and the waitlist

<https://drift.aryaman.tech> — the State of Skill Drift index, per-repo cards,
and the pilot waitlist. Live over HTTPS, certificate valid to 26 December,
auto-renewing.

The waitlist ([`waitlist/`](../waitlist/)) is a dependency-free Node service
under systemd. It collects exactly the two fields that qualify a lead — job
title and company domain — plus an email to reply to. Nothing else: no IP
address, no user agent, no cookies, no third-party script. It is the only
surface in the project that touches personal data, and the CLI deliberately
sends nothing to it. The page says so where a visitor will read it, because a
tool asking to read your repositories has to be legible about what it does not
do.

**What it taught.** The index led with the ungoverned percentage the working doc
had already retracted, and later carried a section arguing public repos *cannot*
show drift — an argument built on the scanner bug. It also briefly published
*"microsoft/azure-skills — Security findings: 10 (… reverse shell …)"*, which is
an accusation of malicious code against a named company and a breach of the
project's own rule. Cards now take a `subject`, defaulting to `third-party`,
which withholds security entirely; only a card about the reader's own repository
shows it. A rule that binds only other people is not a rule.

---

## What is still open

| | Blocker | Owner |
|---|---|---|
| `npx skillsdrift` | npm publish — `package.json` is publish-ready, name unclaimed | Your credentials |
| The X bot posting | No X credentials configured | Your credentials |
| Creator outreach | Drafted, not sent — and it blocks Day 0 | Yours, in your voice |
| Team scan, forwarded notes, opt-in rollup | Designed only. These are §1.8 steps 2–4, the individual→team leap, and their absence is the largest real gap in the build | Build |
| Definition of "team" | Needs Atlan | Atlan |
| Per-skill URLs, manifest import, sandbox workspace | Needs Atlan | Atlan |

The last two are not work items — they are the first two questions for the
working session. The import manifest (`atlan-registry-import/1`) exists
precisely so that answering them becomes a mechanical import rather than a
rebuild.

---

## Everything in the submission

| Path | What it is |
|---|---|
| [`docs/core_challenge_answers.md`](core_challenge_answers.md) | The full argument for sections 1–3, with a 42-source evidence appendix, discovery notes, assumptions and rejected alternatives |
| [`docs/section-3.md`](section-3.md) | This document |
| [`docs/working-doc-final.pdf`](working-doc-final.pdf) | Long-form: how the thesis changed, and a devil's-advocate pass |
| [`deck/`](../deck/) | The readout deck and its next revision |
| [`docs/research/`](research/) | The evidence base: pain sweep, GitLab walkthrough, thesis validation |
| [`cli/`](../cli/) | The CLI — runnable in two commands |
| [`services/`](../services/) | Scanner, card generator, GitHub App, X bot |
| [`waitlist/`](../waitlist/) | The pilot waitlist service |
| [`skills/`](../skills/) · [`dist/`](../dist/) | The bridge skill, source and packaged |
| [`campaign/`](../campaign/) | Data drop, X strategy, creator outreach, launch checklist |

**Deliberately absent:** no badge, no score, no leaderboard —
`anti-fragmentation-gate.md` kills the score outright. No fabricated usage
numbers or invented reach. No pre-made scans sent to creators who did not ask
for one. No security finding attached to a named company on any public surface.
