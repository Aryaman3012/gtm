# Atlan Agent Registry: finding the first 100 teams

GTM candidate work sample by Aryaman Singh.

> Independent candidate exercise. Not affiliated with or endorsed by Atlan.

## Contents

| Path | What it is |
|---|---|
| [`docs/core_challenge_answers.md`](docs/core_challenge_answers.md) | **Start here.** Answers to sections 1–3 of the challenge, plus a resources and evidence appendix (sources, discovery notes, assumptions, rejected alternatives) |
| [`docs/working-doc-final.pdf`](docs/working-doc-final.pdf) | The long-form working document: the reasoning, how the thesis changed along the way, the landscape, a GitLab worked example, the build status, and a devil's-advocate pass |
| [`deck/atlan-deck.pdf`](deck/atlan-deck.pdf) | The readout deck |
| [`deck/deck_fixes.md`](deck/deck_fixes.md) | The next revision of the deck: new slides, source links, and the revised order |
| [`docs/research/`](docs/research/) | Working research: the pain-feeler sweep, the GitLab walkthrough, distribution inside a company, cross-functional adoption, thesis validation, and the devil's-advocate review |
| [`cli/`](cli/) | **Run this.** The `skillsdrift` CLI: scans agent-skills directories for drift, missing owners, missing versions and 11 security patterns, and writes a three-layer report plus an import-ready manifest. Fixtures and a 10-test suite included |
| [`SKILLSDRIFT-BRIDGE.md`](SKILLSDRIFT-BRIDGE.md) | **The skill.** What it does, a 30-second demo with real output, how it carries the "one becomes many" loop, the design decisions worth arguing about, and its limits |
| [`skills/skillsdrift-bridge/`](skills/skillsdrift-bridge/) | Source for that skill: instructions, triage scripts, message templates and sample reports |
| [`dist/skillsdrift-bridge.skill`](dist/skillsdrift-bridge.skill) | The packaged skill, ready to install in Claude |
| [`waitlist/`](waitlist/) | The pilot waitlist behind the report's CTA: a dependency-free Node service and its systemd unit. Stores job title and company domain, and nothing else |
| [`services/`](services/) | The scanner, card generator, GitHub App and X bot. 48 tests across three suites, passing on Linux and macOS |
| [`campaign/`](campaign/) | The launch material: the Day-0 data drop (HN, X, LinkedIn), creator outreach, the launch checklist and the awesome-list PR template |

## The position in five lines

- **ICP:** the engineer who owns AI tooling for everyone else: platform/DevEx engineers (or internal AI-enablement engineers) at software companies of ~200–2,000 people that officially allow two or more AI tools.
- **Channel:** open-source, GitHub-native distribution: a free local CLI (`skillsdrift`) and a public "State of Skill Drift" data drop.
- **Why now:** the big AI tools now govern their own skills, so the pain has moved to the gaps between them.
- **How one becomes many:** adoption spreads to the teams whose skills others depend on. They share governed links instead of copies. A champion installs the GitHub App, and the Head of AI buys.
- **Validation:** 3–5 existing Atlan customers act as design partners to prove activation.

## Try the CLI

Two fixture repos ship with planted drift, so the 30-second scan works with nothing else set up:

```bash
cd cli
node skillsdrift.js fixtures/repo-a fixtures/repo-b
bash test/run-tests.sh
```

That scans 8 skills across 2 paths and reports 1 drifted pair, 1 unowned, 1 unversioned and 2 security-flagged, then writes the three-layer report and the import-ready manifest next to you. Node 18+, no dependencies, no network. The committed [`cli/skillsdrift-report.md`](cli/skillsdrift-report.md) is that exact output, if you'd rather read than run.

## Try the skill

```bash
cd skills/skillsdrift-bridge
python3 scripts/triage.py examples/sample-registry-manifest.json --format md
python3 scripts/triage.py examples/sample-drift-report.md --format md
```

Needs Python 3.8+ and no dependencies. It reads a report and doesn't touch the network. To use the full skill, install `dist/skillsdrift-bridge.skill` in Claude, or copy the folder into `~/.claude/skills/`. Then ask Claude to share your drift report with the teams that rely on those skills.

See [`SKILLSDRIFT-BRIDGE.md`](SKILLSDRIFT-BRIDGE.md) for what it does, the expected output, and why it shares a governed link instead of a copy.

## Build status

| Component | Status | Where |
|---|---|---|
| skillsdrift-bridge skill | ✅ Built, dry-run tested twice | This repo |
| skillsdrift CLI: scan, drift diffs, 11 security heuristics, three-layer report, import manifest, check-in mode | ✅ Built; 10-test suite passes on Linux and macOS | [`cli/`](cli/) in this repo |
| State of Skill Drift index + cards | ✅ Built and **live** | <https://drift.aryaman.tech> |
| Scanner service (public repo scans, weekly delta) | ✅ Built; 10 tests pass | [`services/scanner/`](services/scanner/) |
| GitHub App service | ✅ Built; opens **issues, not PRs** (§1.8 step 3) — a PR only on a recorded opt-in. 8 tests pass | [`services/app/`](services/app/) |
| X bot (@skillsdrift) | ✅ Built; public reply distributes, security goes by DM. Drafts still need human approval; **no X credentials configured**, so it cannot post yet | [`services/bot/`](services/bot/) |
| Waitlist (job title + company domain, per 3.5) | ✅ Built and **live** | [`waitlist/`](waitlist/) · <https://drift.aryaman.tech/waitlist> |
| Team scan, forwarded-note output, opt-in ping and rollup, reframed data drop | Designed | Next |
| drift.aryaman.tech | ✅ Serving over HTTPS (cert valid to 26 Dec 2026, auto-renewing) | VPS |
| npm publish (`skillsdrift`) | Not yet | — |

## Licence

MIT. See [`LICENSE`](LICENSE).
