# Message templates

Short, plain language, and written from the recipient's side ("your renewal decks", not "the qbr-prep SKILL.md"). Most recipients aren't engineers, so skip "repo", "frontmatter", "hash" and "manifest". Fill the `<…>` slots and show the final text to the user before sending.

The footer is optional but on by default. It says where the finding came from and that the user chose to send it. Use "From a skill drift report", or name the actual source (e.g. "skillsdrift", "registry import") if the user wants that.

---

## 1. Owner first (DM): drift / ownership

```
Hey <first name>, a skill drift report I ran flagged the "<skill name>" skill, which <"you own" if confirmed / "lists you as the likely owner" if only suggested>:
• <finding in one line, e.g. "2 different versions are in use (6-slide and 5-slide)">
• It's used beyond eng, mainly <audience team> for <their task>
Would you <"pick one version to keep" / "be up for owning it and picking one version">? And OK if I tell the <audience team, not individual names> who use it that you're on it?
Here's its page in Atlan (versions, usage, owner): <atlan link>
_From a skill drift report · sent by <user's name>_
```

## 2. Teammate who relies on the skill (DM)

```
Hi <first name>, quick heads-up on the "<skill name>" skill you use for <their task>:
<the one thing that affects them, e.g. "there are 2 versions floating around, so decks may differ depending on which one you have">
<next step, e.g. "<owner, if they agreed to be named> is picking one version; I'll ping you when it's settled" / "it currently has no owner, would you or someone on your team want to own it?">
The current version lives here in Atlan. Sign in with your work account and you'll always get the latest: <atlan link>
_From a skill drift report · sent by <user's name>_
```

## 2b. Likely audience (found by title or topic search, not named in the report)

```
Hi <first name>, a skill drift report I ran flagged an AI skill that might matter for <their team's task>: "<skill name>" (<what it does, one line>).
<the finding, e.g. "it has no owner right now, so updates to <thing> may not reach it">
Is this something your team uses? If so, <next step>. You can see it (and who maintains it) in Atlan: <atlan link>
_From a skill drift report · sent by <user's name>_
```

## 3. Team channel (only when it matters to the whole team)

```
Heads-up for <team>: the AI skill for <task> ("<skill name>") <finding in plain words>.
<what people should do now, e.g. "use the version in Atlan below, not a local copy" / "we're looking for an owner, reply here if that's you">
<atlan link>
_From a skill drift report · sent by <user's name>_
```

## 4. Unowned skill, looking for a maintainer

```
"<skill name>" helps with <task> for <team>, but nobody maintains it right now, so fixes don't reach everyone.
Would someone on <team> like to own it? It's usually a small job: review changes and keep one version current.
```

## 5. Report slice (fallback only, when there's no Atlan link)

Use this only when the org has no Atlan workspace. It's a slice, never the full report.

```markdown
# <skill name>: what the drift report found
**Used for:** <task> (<audience team>)
**Owner:** <name, only if they agreed> / none yet
**Status:** <e.g. 2 versions in use · no version marker>
**What it means for you:** <one line>
**Next step:** <one line>
_Source: skill drift report, <date>. File paths and names of other people removed._
```

---

## Wording rules

- One finding per message. Pick the thing that matters most to *that* person.
- One link per message, to that skill's page. Say what they'll see there ("versions, owner, usage"), and that they sign in with their work account.
- Only say "Atlan" when the link really goes to the org's Atlan workspace.
- Name owners only after they've said it's OK. Never list the other people who use a skill.
- No raw file paths, emails or security details. For a security-flagged skill, only the owner hears about it, and only the flag type.
- Don't blame anyone. Drift happens by default, so frame it as "here's how we get to one version", not "someone broke it".
- One message per person or channel. Don't cross-post the same text.
