# AI work log

*Written by Claude, the AI Aryaman worked with, as the brief asks. "Aryaman" is the human.*

## Approach, models and harnesses

Aryaman used AI in three roles: **builder**, **analyst** and **adversary**. He stayed the editor and the decision-maker. Nothing counted as done because an AI said so. It counted as done when there was an artifact to check: a test run, a real scan, a source read directly.

- **Hermes Agent** (orchestrator on Aryaman's VPS): planned the work, delegated it, and verified the results of each build round.
- **Claude Code**: executed written briefs with done-criteria a machine could check. It built the skillsdrift CLI, the scanner service, the cards, the GitHub App service and the X bot.
- **Claude in Cowork** (Opus-class): this final pass.
  - Research, including parallel research agents that swept tools across personas.
  - A devil's-advocate review, and a separate *cold* reviewer agent that saw only the brief and the answers.
  - A worked example read directly from GitLab's public handbook through the desktop browser.
  - The docs, the evidence appendix, and building and dry-run testing the skillsdrift-bridge skill.

## Systems and reusable workflows built

1. **Brief → done-criteria → report.** Each build round gets a written brief with checks a machine can verify, and returns a committed report.
2. **Verification by artifact, plus an adversarial auditor.** A separate AI pass tries to break the work. In the original build it caught three bugs that had passed the builder's own tests, including drafts shipping pre-approved.
3. **The cold-review loop.** A fresh agent with no context reviews the answers against the brief and ranks the flaws. Aryaman decides which to fix, and the file is revised. This produced the single-ICP / single-channel cleanup.
4. **Parallel research, then source checks.** Research runs in parallel by persona, and anywhere the agents disagree, the primary source is read directly.
5. **The skillsdrift-bridge skill.** The GTM workflow itself, packaged as a reusable skill. It reads a drift report, picks the cross-functional skills, and shares Atlan links over Slack, with consent at every step.

## Where the AI was wrong

**The AI based the whole pain statement on documentation that was out of date.** The early thesis cited Anthropic's docs saying skills had "no versioning… no central registry…" and built the pitch around "teams have no governance." By mid-2026 that was no longer true:
- Claude Enterprise had org skills with review, version history and per-skill usage.
- ChatGPT had workspace skills with owners.

The research agents even disagreed on this. One said Claude org skills had no version history. Checking the source directly showed they did. Believed as stated, the AI would have sent Aryaman into the working session with a pitch any Atlan PM could knock down in one sentence. Once corrected, the thesis moved to where the pain actually is: the gaps between tools, between apps and assistants, and between skills and the data they encode.

*Smaller catches:*
- A drift quote was attributed to the wrong HN commenter.
- A GitLab repo the AI had cited as public now requires sign-in.
- The first version of the sharing skill re-scanned files instead of reading the drift report.

## The decision the AI couldn't make

**Where adoption actually starts inside a company.** The AI's plan used the GitHub App as the way to scan a whole organisation. Aryaman rejected it: *"nobody installs GitHub apps that easily. It's a signal the champion is already onboard."*

That call came from how he knows companies actually adopt tools. It reordered the whole motion:
- scans that need no admin come first
- forwarded notes, and hubs whose skills others depend on, come next
- the App install becomes the metric that confirms a champion, not the way in

He then made the related call that people share **links to the Atlan dashboard, not files**, so that sharing a skill is also how a colleague gets onboarded.

The AI could argue either side. Only Aryaman could decide which one matched how real teams behave, and which honesty lines not to cross: no fake numbers, and nothing presented as Atlan's when it isn't.
