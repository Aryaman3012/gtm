# P1 — the Day 0 data drop

The launch event, ranked #1 in [`strategy/launch-distribution-ideas.md`](../docs/strategy/launch-distribution-ideas.md):
the only idea that can produce a real spike without a third party's cooperation
and without a structurally slow mechanism.

**Status: drafted, not posted.** Blocked on npm publish (see the checklist).

## The three conditions this post must meet

From P1's verdict, all mandatory:

1. A visible "candidate exercise, unaffiliated with named companies or Atlan"
   disclosure **on the post itself**, not only on the linked page.
2. **Drift and ownership stats only.** No security findings attributed to a
   named company. Aggregate, unattributed category counts are the most that may
   appear anywhere, and this post does not lead with them.
3. Every named finding paired with a direct "run this on your own repos" CTA.

One deliberate departure from P1 as written: its condition 3 says the CTA links
to the CLI **and** the GitHub App. R10 supersedes that — see
`strategy/two-hop-gtm.md` §A3: the wedge engineer usually cannot install an
org-level GitHub App, so the App "is not the trigger for Hop 1, it's the result
of a successful, permission-free Hop 1." **The CTA is the CLI only.** Pointing
Day-0 traffic at an install most readers cannot perform would convert worse and
contradict the sequencing gate in `services/app/register-runbook.md`.

## The hook

The earlier draft led with "951 public skills, 100% with no owner field." §3.4
retracts that: it measures a file convention, because public libraries record
ownership in git rather than in frontmatter. Leading with it invites the one
reply that kills the thread — *"that's not what an owner field is for."*

The honest finding is stronger and it is the thesis:

> I scanned 951 public agent skills looking for drift. I found none. That is the finding.

A public repository is a single source of truth; one copy cannot disagree with
itself. Drift is what happens when a skill is copied — into a second repo, a
second AI tool, a teammate's local directory — and all of that happens inside
companies, in private, where no public scan can see it. Which is precisely why
the reader has to run it themselves. The CTA is the conclusion of the argument
rather than an ask bolted onto the end.

---

## Show HN

**Title**

```
Show HN: I scanned 951 public agent skills for drift and found none. Here's why that matters
```

**Body**

```
I built a CLI that audits Claude Code / Codex agent-skill directories for
drift: the same skill living in two places with contents that no longer match.

Then I pointed it at 951 skills across four public repositories to see how
common drift is in the wild. It found zero drifted pairs.

That result is not a null. A public repo is one source of truth, so a skill
there has nothing to disagree with. Drift starts at the moment of the second
copy — a skill pasted into a second repository, a second assistant, someone's
local directory — and that copying happens inside companies, in private. The
public ecosystem is structurally incapable of showing the problem.

What a public scan can show is what the files ask a machine to do, and how
they're maintained. Both are on the index, reported by category across the
whole sample and never tied to a named repository. I'm not interested in
publishing a list of companies with findings next to their name.

The tool is local and read-only: it reads your files, writes a report next to
you, and makes no network call. No account, no telemetry, nothing uploaded.

The interesting case is two or more AI tools in the same company. One skill,
two copies, two consoles, and each vendor's admin console can only see its own.

Index and method: https://drift.aryaman.tech
Run it on your own repos:
  git clone https://github.com/Aryaman3012/gtm
  node gtm/cli/skillsdrift.js .claude/skills .codex

Disclosure: this is a candidate exercise for Atlan's GTM challenge. It is not
an Atlan product and is unaffiliated with any company named in the scan.
```

**First comment from the author** (post immediately, per the checklist)

```
Author here. What I'd most like feedback on:

1. The 11 security heuristics are deliberately blunt — a `sudo` line inside a
   comment matches the same rule as a real one. I'd rather over-flag and say so
   than miss things quietly. If you think that trade is wrong, I want to hear it.

2. The drift definition is "same skill name, different content hash, across two
   scanned roots." That misses a renamed copy, and I don't have a good answer
   for that yet.

3. If you run it and it finds nothing, that's useful to me too — tell me how
   many tools and repos you scanned.

On the disclosure: I'm doing Atlan's GTM challenge, and this is the artifact.
Atlan's Agent Registry is their unreleased product; none of this is theirs, and
nobody at Atlan reviewed this post.
```

## X thread

Keep each under 280. Thread, not a single post: the argument needs three beats.

```
1/ I scanned 951 public agent skills looking for drift — the same skill in two
   places, contents no longer matching.

   Found zero.

   That's the finding, not a failed experiment. 🧵

2/ A public repo is a single source of truth. One copy of a skill has nothing
   to disagree with.

   Drift begins at the second copy: a second repo, a second assistant, someone's
   laptop. All of that happens inside companies, in private.

3/ So the public ecosystem structurally cannot show this problem. No scan of
   GitHub will ever find it.

   The only place it shows up is your own repos — which is the whole reason the
   tool runs locally and uploads nothing.

4/ What a public scan CAN show: how these skills are maintained, and what they
   ask a machine to do. Both on the index, by category across the sample, never
   tied to a named repo.

   https://drift.aryaman.tech

5/ Run it yourself. Local, read-only, no account, no network call:

   git clone https://github.com/Aryaman3012/gtm
   node gtm/cli/skillsdrift.js .claude/skills .codex

   Most interesting if your company allows two or more AI tools.

6/ Disclosure: this is a candidate exercise for Atlan's GTM challenge. Not an
   Atlan product, unaffiliated with any company in the scan, and nobody at Atlan
   reviewed it.
```

## LinkedIn

Different audience — the AI lead rather than the engineer. Same evidence, the
organisational consequence foregrounded, no code block.

```
I scanned 951 public agent skills looking for drift. I found none, and that
turned out to be the useful result.

A public repository is a single source of truth: one copy of a skill has
nothing to disagree with. Drift starts at the second copy — a skill pasted into
a second repository, a second AI assistant, someone's local directory. That
copying happens inside companies, privately, where no public scan reaches.

Which is the part worth sitting with if you own AI tooling. Every major
assistant now governs skills inside its own console: owners, versions,
approvals. Real governance, and it stops at that vendor's edge. The moment a
company allows a second tool, the same skill exists in two consoles and neither
can see the other's copy. Nobody owns the gap, and nobody can answer "which
version is correct" without opening both.

That gap is invisible from outside and cheap to measure from inside. The tool
is free, runs locally, uploads nothing, and takes about thirty seconds.

https://drift.aryaman.tech

Disclosure: this is a candidate exercise for Atlan's GTM challenge — not an
Atlan product, and unaffiliated with any company named in the scan.
```

## Before posting

- [ ] npm publish, then replace the clone command with `npx skillsdrift` everywhere above
- [ ] Re-run the scan so the numbers in the post match the live index that day
- [ ] Confirm no card names a company beside a security finding (regression test: `cd services && bash run-tests.sh`)
- [ ] Post Tue–Thu morning US time
- [ ] Author's first comment goes up immediately, not later
