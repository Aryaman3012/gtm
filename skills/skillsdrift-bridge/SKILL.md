---
name: skillsdrift-bridge
description: Take an existing skill drift report (a skillsdrift report, an Atlan-registry-style import manifest, or any report listing agent skills with owners, versions, duplicates and security findings), work out which skills are cross-functional (their output is used by sales, marketing, finance, CS, legal, people or execs, not just engineers), and share a link to each skill's page in the org's Atlan dashboard with the right teammates over the user's connected Slack (so they onboard onto the governed version), only after asking permission. Use this whenever the user has a skill drift / skill audit / skill inventory report and wants to act on it, asks "who else should see this?", wants to tell other teams about drifted or unowned skills they rely on, or wants to share skill findings on Slack, even if they don't say "cross-functional".
---

# skillsdrift-bridge

A skill drift report usually stays with the engineer who ran it. But many of the skills in it are used by other teams: the QBR-deck skill by sales, the revenue-metric skill by finance. Those teams are the ones hurt when there are three drifted copies and no owner. This skill gets **the right slice of the report to the right people**, in their language, through the user's own Slack, with permission at every step.

The flow is: **load the report → pick the cross-functional skills → find the teammates who rely on them → share a link to that skill's page in the Atlan dashboard, with a short personal note and permission.**

**Why a link and not a file:** a file is a copy, and copies are how drift starts. A link to the skill's page in the Atlan Agent Registry dashboard is the one governed version. The recipient sees the canonical version, the owner and the usage, and signs in with their work account, so they're onboarded to Atlan simply by opening what a colleague sent them.

This skill doesn't scan anything itself. The report is the input.

## Why permission matters here

Messages go out under the user's name to colleagues in other teams. They may name someone's skill, point out drift in their work, or mention a security flag. A single unwanted or wrong message costs trust that is hard to earn back across teams. So treat every send as a request the user approves. When someone else's work is named, the owner approves too.

---

## Step 1: Get the report

- Use the report the user attached, pasted or pointed to, and only that one. If you notice other reports nearby (e.g. an older scan), mention them but don't merge them in unless the user asks.
- If they didn't give one, look in the current directory and `~/.skillsdrift/` for likely files (`*skillsdrift*.{json,md,html}`, `*registry-import*.json`, `*skill*report*.{md,html}`). If you find one, confirm it's the right one.
- If there's no report, ask for it, or suggest running their drift scanner (e.g. `npx skillsdrift`) first. Don't try to reconstruct a report by scanning yourself.

## Step 2: Triage it

```bash
python3 <skill-dir>/scripts/triage.py <report files...> --out <scratch>/triage.json --md-out <scratch>/triage.md
```

`triage.py` reads JSON reports and manifests, markdown tables and HTML cards. It normalises them into one list with, for each skill:
- name, description, owner, version
- copies and drift status (plus the suggested canonical copy if the report has one)
- security flags
- a heuristic `cross_functional` score, a label (`cross-functional` / `maybe` / `engineering-only`) and likely audiences
- `people_local`: people the report says use or own the skill

It also pulls out the report's headline stat (e.g. "68% of skills have no owner…") if there is one.

- **`owner_confirmed: false`** means the report only *suggests* an owner (common in registry-import manifests). Treat them as "likely owner" in messages ("the report lists you as the likely owner"), never as "your skill".
- **Check the headline before quoting it.** It may describe a wider scan than the skills in this file (e.g. "68%" from a 4-skill file). If it doesn't add up, leave it out.

- **`people_local` stays local.** It's only for finding teammates. Never paste it into a message.
- **If `parsed` is false,** the report format wasn't recognised. Read `raw_text` yourself and build the same list by hand.
- Write outputs to a scratch or temp directory, not the user's repo.

## Step 3: Decide what's cross-functional

The script's label is a first pass. The judgement is yours, and it comes down to one question:

> **Who uses what this skill produces?** If the output (a deck, an email, a metric answer, a customer summary, a policy check) is used by people outside engineering, it's cross-functional, even if an engineer wrote it and it lives in a code repo.

- Read every `maybe` before deciding. Downgrade skills whose output is code, tests, CI or infra, even if they mention a business word.
- Upgrade engineering-owned skills that feed other teams: metric definitions → finance and sales ops; release notes → marketing; incident summaries → CS.
- For each confirmed skill, name the **primary audience team** and the **task it helps them with**, in their words ("prepping QBR decks").
- **What's worth telling them** is what affects that team: drift ("2 different versions are in use, so you may be getting different decks"), no owner ("nobody maintains it"), or a security flag ("paused until a credential is removed"). A skill that's healthy and already owned may not need a message at all.
- **Security-flagged skills:** never share the skill or any detail of the flag. You can tell the owner privately that the report flagged it (the type only, e.g. "hardcoded credential", never the value). If there's no owner, tell only the user, and ask who maintains it. Don't message anyone else about it.

Show the user a short summary: a one-line headline, then up to 5 cross-functional skills with audience, the issue, and the owner. Offer the full table as a file rather than pasting it.

## Step 4: Find the relevant teammates

Check which Slack tools are connected (tool names containing `slack`, from the Claude or Codex connector). Then, for each cross-functional skill, find **a few people** (usually 1–3), not a crowd:

1. **The owner**, if the report names one. They get the drift or ownership news first.
2. **People the report names as users** (`people_local`). If the tools support lookup by email or name, find them in Slack.
3. **People in the audience team** who do that task: search users by title or team if possible ("Sales Operations", "RevOps", "FP&A"), or search messages for the task topic ("QBR deck", "ARR definition") to see who works on it.
4. **Optionally, one team channel** (#sales-ops, #revops, #finance-team) when the finding matters to the whole team. Use channel search, and never guess channel names.

Always confirm matches with the user ("Priya Shah in Sales Ops, is that the right Priya?"). Never guess a Slack identity from a git name, a handle or an email alone.

Keep two kinds of recipient apart, because the message differs:
- **Known users** (named in the report): "the skill you use…". Template 2.
- **Likely audience** (found by title or topic search): "this might affect your team's…". Template 2b. Don't claim they use it.

**External people:** if a person's email domain differs from the user's, or the tool marks them as external or guest, ask before messaging them. Default to not messaging them, the same as for Slack Connect channels.

If there are no Slack tools, ask the user who should hear about each skill, and fall back to paste-ready text in Step 6.

## Step 5: Build the share plan and ask permission

Show a plan table and let the user choose rows. To keep the reply short, give a one-line "what they get" per row, and show the **full draft only for the first row** (usually the owner DM). Show the other drafts once the user picks those rows.

| # | To | About | Why them | What they get |
|---|---|---|---|---|
| 1 | You (preview) | Everything below | See how it looks first | All drafts |
| 2 | DM @priya (owner) | qbr-prep | She owns it; 2 drifted copies | Drift note + ask to name one canonical copy |
| 3 | DM @tom (sales ops) | qbr-prep | Uses it for renewal decks | Short heads-up, *after Priya OKs being named* |
| 4 | #finance-team | revenue-metric | Finance relies on it; no owner | "Looking for an owner" note |

Two layers of consent:
- **The user approves each row.** Show the exact message (see `references/message-templates.md`) and the destination, and wait for a clear yes for *that* row. A yes on one row isn't a yes on the next.
- **Owners approve being named.** If a message to others names someone's skill or points out drift in their work, DM the owner first (only after the user approves that DM). Contact the audience only once the owner agrees, or once the user decides to go ahead without naming the owner.
  - Check the DM thread for the reply if a read tool exists. Otherwise ask the user to tell you when the owner replies.

Other checks before sending:
- **Unknown owner:** frame it as "currently unowned, looking for a maintainer". Don't imply someone maintains it.
- **External channels:** if a channel might include people from another company (Slack Connect) and the tool results don't clearly say it's internal, ask before posting. Default to not posting there.
- **Earlier sends:** read the log at `~/.skillsdrift/shares.jsonl` and skip or flag anything already sent to that person or channel.

## Step 6: Get the link for each skill

Resolve a share link in this order:

1. **`share_url` from the report.** Registry manifests and dashboard exports often include a per-skill link. Use it as it is.
2. **The org's Atlan dashboard base URL**, from `~/.skillsdrift/config.json` (`{"atlan_base_url": "https://<tenant>.atlan.com", "skill_path": "/registry/skills/{slug}"}`). Build the link from the skill's slug. If the file doesn't exist, ask the user once for their Atlan dashboard URL, and offer to save it.
3. **No Atlan workspace yet:** say so plainly. Fall back to a card URL or a paste-ready note, and tell the user the recipients won't be onboarded until the skills are imported into their Atlan workspace.

Link rules:
- Only use "Atlan" wording when the link really points at the org's Atlan workspace (an `atlan.com` tenant, or a URL the user confirms). Never label another page as Atlan.
- Keep personal data out of URLs: no names, emails or Slack IDs in query strings. A plain `?ref=slack-share` is fine if the user wants to track shares.
- Check the link opens to the right skill, if a fetch tool can reach it. If it can't be verified (e.g. it needs SSO), say so.

## Step 7: Send

- Offer a preview DM to the user first. When the tools support drafts, prefer creating a **Slack draft** so the user presses send.
- Otherwise send the approved text exactly as shown. Don't edit it after approval.
- **A link, not the report.** Each person gets a short note about their skill plus its Atlan link. Don't attach the report. Only use the markdown slice (template 5) as a fallback when there's no Atlan link. Never include file paths, emails or `people_local`.
- One message per destination, no bulk DMs, and no @channel / @here unless the user asks.
- Confirm each send in one line ("Sent to @priya ✓").
- **No Slack tools:** give paste-ready text per person, with the links.

## Step 8: Log it locally

Append one line per send to `~/.skillsdrift/shares.jsonl` (create it if missing): timestamp, skill name, destination, link used, and status (`sent`, `drafted`, `awaiting-owner`, `declined`). Never log message bodies or report content. The log stops the same finding going to the same person twice, and shows the user who has already been told.

---

## Guardrails

- **Never send without a yes for that specific destination.** Messages go out as the user.
- **Never share a skill with a security flag, or any detail of the flag,** except the flag type, privately to the owner.
- **Share the governed link, not a copy.** Redact paths, emails and the list of people.
- **Don't put Atlan branding on anything that isn't the org's Atlan workspace.**
- **The owner's OK comes before naming them to other teams.**
- **Be honest about limits.** The classification is a judgement call, and the report is only as complete as the scan behind it.

## Files

- `scripts/triage.py`: reads a drift report (JSON, markdown or HTML) and outputs normalised skills, drift, owners, security flags, cross-functional scores and the headline.
- `scripts/classify_core.py`: the scoring heuristics, secret patterns and redaction helpers used by triage.
- `references/message-templates.md`: message templates for teammates, owners and channels, plus the report-slice format and wording rules. Read it before drafting any message.
