# skillsdrift-bridge

**The one thing in this repo that is built and runnable, not proposed.**

A Claude/Codex skill that takes a skill drift report, works out which of the skills in it are used by people *outside* engineering, and shares a link to each skill's page in the org's Atlan dashboard with the right teammates over Slack — asking permission at every step.

- Source: [`skills/skillsdrift-bridge/`](skills/skillsdrift-bridge/)
- Packaged for install: [`dist/skillsdrift-bridge.skill`](dist/skillsdrift-bridge.skill)
- Full instructions: [`skills/skillsdrift-bridge/SKILL.md`](skills/skillsdrift-bridge/SKILL.md)
- Status: built, dry-run tested twice. No network calls, no dependencies.

---

## Try it in 30 seconds

No install, no dependencies, nothing leaves your machine:

```bash
cd skills/skillsdrift-bridge
python3 scripts/triage.py examples/sample-registry-manifest.json --format md
```

Real output from that command:

```
**4 skills in report** · 3 cross-functional (2 shareable) · 0 maybe · 1 drifted · 2 no owner

> 68% of this team's agent skills have no named owner, no version marker, and no security review.

| Skill | For | Drift | Owner | Shareable |
|---|---|---|---|---|
| qbr-prep | Sales, Customer Success / Support | 2 copies | priya (suggested) | yes |
| revenue-metric | Finance | - | none | yes |
| crm-sync | Sales | - | none | no: security flag |
```

The markdown-report parser takes the same path:

```bash
python3 scripts/triage.py examples/sample-drift-report.md --format md
```

Requires Python 3.8+ (tested on 3.9.6). To use the whole skill rather than just the
triage step, install `dist/skillsdrift-bridge.skill` in Claude, or copy the folder to
`~/.claude/skills/`, then ask Claude to share your drift report with the teams that
depend on those skills. The two commands above work from an installed copy too — the
sample reports ship inside the package, so the demo runs with nothing else present.

The package is built from source, never by hand:

```bash
./scripts/package-skill.sh          # rebuild dist/skillsdrift-bridge.skill
./scripts/package-skill.sh --check  # fail if dist/ has drifted from skills/
```

---

## Why this skill, and why it matters to the GTM thesis

The repo's position is that the Agent Registry spreads through **the teams whose skills other people depend on**, and that they should share *governed links* rather than copies. This skill is that mechanic, made concrete.

A drift report normally dies with the engineer who ran it. But the skills inside it belong to other people's work: the QBR-deck skill is sales', the revenue-metric skill is finance's. Those are the teams that get hurt by three drifted copies and no owner — and they never hear about it.

So the skill moves the right slice of the report to the right people, in their language. The mechanism is the important part:

> **A link, not a file.** A file is a copy, and copies are how drift starts. A link to the skill's page in the Atlan Agent Registry is the one governed version. The recipient sees the canonical copy, the owner and the usage — and signs in with their work account, so a colleague's Slack message is what onboards them to Atlan.

That is the "one becomes many" loop in a single artifact: a cross-functional teammate is onboarded by the person they already trust, through a link they had a reason to open.

---

## How it works

**load the report → pick the cross-functional skills → find the teammates who rely on them → share that skill's Atlan link, with a note and permission.**

| Step | What happens |
|---|---|
| 1 | Take the report the user gives — a `skillsdrift` report, an Atlan-registry import manifest, or any report listing skills with owners, versions, duplicates and security findings |
| 2 | `triage.py` normalises JSON, markdown tables and HTML cards into one list: name, owner, version, copies, drift, security flags, a cross-functional score and likely audiences |
| 3 | Judge what's actually cross-functional — the test is *who uses what this skill produces*, not who wrote it or where it lives |
| 4 | Find 1–3 real people per skill: the owner first, then named users, then the audience team by title or topic |
| 5 | Show a share plan and get a yes **per row**, plus the owner's OK before naming them to anyone else |
| 6 | Resolve the Atlan link — from the report's `share_url`, or built from the org's tenant URL |
| 7 | Send (preferring a Slack draft the user presses send on), one message per destination |
| 8 | Log each send to `~/.skillsdrift/shares.jsonl` so no one hears the same finding twice |

It does not scan anything itself. The report is the input.

## The design decisions worth arguing about

These are the parts I'd expect to be challenged on, so they're stated plainly rather than buried in the instructions:

- **Consent is two-layered, not one.** The user approves each destination individually — a yes on one row is not a yes on the next. And when a message names someone's skill or points at drift in their work, that owner approves being named *before* anyone else is contacted. Messages go out under the user's name; one wrong DM across teams costs trust that is slow to earn back.
- **Security-flagged skills are never shared.** Not the skill, not the detail of the flag. The owner can be told the flag *type* privately ("hardcoded credential", never the value). If there's no owner, only the user hears about it.
- **Suggested owners are not owners.** Registry manifests often guess. `owner_confirmed: false` becomes "the report lists you as the likely owner", never "your skill".
- **Headline stats get checked before they're quoted.** The sample above is the live example: the report claims 68% across the org, but the file holds 4 skills. The skill is told to leave a number out rather than let it imply a scan it didn't do.
- **People stay local.** The list of who uses a skill is used to find teammates and is never pasted into a message, a URL or the log.
- **"Atlan" is only used for real Atlan workspaces.** No Atlan wording on a link that doesn't point at the org's tenant.

## Honest limits

- The cross-functional classification is a heuristic plus a judgement call. It will mislabel things, which is why a human approves every message.
- The report is only as good as the scan behind it — this skill inherits every gap in its input.
- Without an Atlan workspace to link into, it degrades to a paste-ready note, and says so: recipients aren't onboarded until the skills are actually imported.
- Slack identity is never inferred from a git name, handle or email alone; matches are confirmed with the user, which makes the flow chattier than a bulk sender.

## Files

| Path | What it is |
|---|---|
| `SKILL.md` | The full instructions, including guardrails and consent rules |
| `scripts/triage.py` | Parses JSON / markdown / HTML reports into normalised skills, drift, owners, flags and scores |
| `scripts/classify_core.py` | Scoring heuristics, secret patterns and redaction helpers |
| `references/message-templates.md` | Templates for teammates, owners and channels, plus wording rules |
| `examples/sample-registry-manifest.json` | Atlan-registry-style manifest, for the demo above |
| `examples/sample-drift-report.md` | Markdown drift report, exercising the other parser |

Plus, at the repo root, [`scripts/package-skill.sh`](scripts/package-skill.sh) — builds
`dist/skillsdrift-bridge.skill` from the source directory, and `--check` verifies the two
haven't drifted apart.
