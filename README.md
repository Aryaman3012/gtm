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
| [`skills/skillsdrift-bridge/`](skills/skillsdrift-bridge/) | **Built:** a Claude/Codex skill that reads a skill drift report, picks out the cross-functional skills, and shares links to each one's page in the org's Atlan dashboard over Slack, with consent at every step |
| [`dist/skillsdrift-bridge.skill`](dist/skillsdrift-bridge.skill) | The packaged skill, ready to install in Claude |

## The position in five lines

- **ICP:** the engineer who owns AI tooling for everyone else: platform/DevEx engineers (or internal AI-enablement engineers) at software companies of ~200–2,000 people that officially allow two or more AI tools.
- **Channel:** open-source, GitHub-native distribution: a free local CLI (`skillsdrift`) and a public "State of Skill Drift" data drop.
- **Why now:** the big AI tools now govern their own skills, so the pain has moved to the gaps between them.
- **How one becomes many:** adoption spreads to the teams whose skills others depend on. They share governed links instead of copies. A champion installs the GitHub App, and the Head of AI buys.
- **Validation:** 3–5 existing Atlan customers act as design partners to prove activation.

## Try the skill

```bash
cd skills/skillsdrift-bridge
python3 scripts/triage.py examples/sample-registry-manifest.json --format md
python3 scripts/triage.py examples/sample-drift-report.md --format md
```

Needs Python 3.8+ and no dependencies. It reads a report and doesn't touch the network. To use the full skill, install `dist/skillsdrift-bridge.skill` in Claude, or copy the folder into `~/.claude/skills/`. Then ask Claude to share your drift report with the teams that rely on those skills.

## Build status

| Component | Status | Where |
|---|---|---|
| skillsdrift-bridge skill | ✅ Built, dry-run tested twice | This repo |
| skillsdrift CLI: scan, drift diffs, security heuristics, three-layer report, import manifest | Built (per build logs) | VPS, not yet in this repo |
| Scanner service, State of Skill Drift index, cards | Built (per build logs) | VPS, not yet in this repo |
| GitHub App service | Built (per build logs); switching to issues/checks instead of cross-repo PRs | VPS, not yet in this repo |
| X bot (@skillsdrift) | Built as drafts only; switching to private replies | VPS, not yet in this repo |
| Waitlist, team scan, forwarded-note output, opt-in ping and rollup, reframed data drop | Designed | Next |
| drift.aryaman.tech | DNS set up; not serving yet | VPS |
| npm publish (`skillsdrift`) | Not yet | — |

## Licence

MIT. See [`LICENSE`](LICENSE).
