# P1 — the Day 0 data drop

The launch event, ranked #1 in `strategy/launch-distribution-ideas.md`: the only
idea that can produce a real spike without a third party's cooperation and
without a structurally slow mechanism.

**Status: drafted, not posted.** Two blockers, one of them new — see the bottom.

## The three conditions this post must meet

From P1's verdict, all mandatory:

1. A visible "candidate exercise, unaffiliated with named companies or Atlan"
   disclosure **on the post itself**, not only on the linked page.
2. **Drift and ownership stats only.** No security findings attributed to a
   named company.
3. Every named finding paired with a direct "run this on your own repos" CTA.

One deliberate departure: P1's condition 3 says the CTA links to the CLI **and**
the GitHub App. R10 supersedes that — `strategy/two-hop-gtm.md` §A3: the wedge
engineer usually cannot install an org-level GitHub App, so the App "is not the
trigger for Hop 1, it's the result of a successful, permission-free Hop 1."
**The CTA is the CLI only.**

## The hook, and why it changed twice

The first draft led with *"951 public skills, 100% with no owner field."* §3.4
retracts that: it measures a file convention, since public libraries keep
ownership in git rather than in frontmatter.

The second draft led with *"I scanned 951 skills for drift and found none — and
that's the finding."* **That was wrong, and the post would have been
embarrassing.** The scan ran on each repository in turn, and a skill cannot
drift against itself, so a per-repo scan reports zero cross-repo drift by
construction. The zero was a property of how the question was asked.

Running the same engine over every repository at once finds the drift
immediately, and it is specific enough to be the whole hook:

> **Anthropic publishes 20 official agent skills. Twelve of them are in
> circulation elsewhere in versions that no longer match the original — and
> every single one of those twelve has drifted. Twelve for twelve.**

Not "some copies go stale". Every copy found, without exception. The copies are
two months behind — frozen at 2026-07-24 while Anthropic's repo moved on
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

**Why naming Anthropic is fine, and naming the copier is not.** Anthropic is the
source. Their repository is the one that moved forward correctly; nothing here
reflects badly on them, and the finding is only legible if the canonical side
has a name. The collection holding the stale copies is the side that a name
would injure, and it gains nothing from being identified — the pattern is the
point, not the party.

## The framing rule this post follows

`campaign/launch-checklist.md` rule 2 and §3.4 both say the same thing: the
public data drop reports aggregates, named repos are scanned only when their
owner asks, and nobody is shamed. So the post reports the **pattern and the
counts**, and does not put a collection's name next to the word "stale."

This is not squeamishness. Vendoring a snapshot of a good skill library is a
reasonable thing to do, and keeping 800-odd skills in step with their upstreams
by hand is not reasonable to expect. Drift is not a failure of care. Saying so
plainly is both more accurate and more persuasive than a callout, and the people
most likely to recognise themselves in it are exactly the audience.

**The maintainers of the affected collection see this before it is posted.** See
`campaign/n4-creator-outreach.md` — that outreach is now a prerequisite, not a
courtesy.

---

## Show HN

**Title**

```
Show HN: Every copy of an Anthropic official skill I could find had drifted
```

**Body**

```
I built a CLI that audits Claude Code / Codex agent-skill directories for
drift: the same skill living in two places with contents that no longer match.

Anthropic publishes 20 official agent skills. Twelve of them are in circulation
elsewhere, and all twelve have diverged from the original. Not most — all of
them. The copies are about two months behind, and the differences aren't
cosmetic: 111 files differ in one skill, 108 in another, 53 in a third. They
still carry Anthropic's own proprietary license line, so they're vendored
snapshots rather than coincidental name collisions.

I nearly published the opposite result. My first scan reported zero drift and I
spent a while constructing an argument for why that was interesting — public
repos are single sources of truth, drift only happens privately inside
companies, and so on. It was wrong. The scanner was running on each repository
in turn, and a skill cannot drift against itself, so a per-repo scan reports
zero cross-repo drift by construction. Running the same engine over every repo
at once found the drift immediately.

Two things worth knowing if you're building something similar:

- Scanning N repositories one at a time answers a different question from
  scanning them together, and the first one silently looks like good news.
- My CLI was truncating its own JSON when piped. process.exit() discards
  buffered stdout because Node writes to pipes asynchronously — 146KB of a
  1.4MB report, no error on either side. Writing to a file worked, which is
  why it went unnoticed.

I'm not naming the collection holding the copies. Vendoring a snapshot is a
reasonable thing to do, and hand-syncing 800-odd skills against their upstreams
is not reasonable to expect of anyone. The maintainers have the detail. The
point isn't that someone was careless — it's that a copy with nothing
connecting it back to its source will drift, every time, and nobody finds out
until the outputs disagree.

The interesting case is inside a company allowing two or more AI tools: one
skill, two copies, two admin consoles, each of which can only see its own.

The tool is local and read-only: reads your files, writes a report next to you,
no network call, no account, no telemetry.

Index and method: https://drift.aryaman.tech
Run it on your own repos:
  git clone https://github.com/Aryaman3012/gtm
  node gtm/cli/skillsdrift.js .claude/skills .codex

Disclosure: this is a candidate exercise for Atlan's GTM challenge. It is not
an Atlan product and is unaffiliated with any company named in the scan.
```

**First comment from the author** (post immediately)

```
Author here. What I'd most like feedback on:

1. Drift is defined as "same skill name, different content hash, across two
   scanned roots." That misses a renamed copy, and I don't have a good answer
   for that yet.

2. The 11 security heuristics are deliberately blunt — a `sudo` line in a
   comment matches the same rule as a real one. I'd rather over-flag and say so.
   Security findings are reported by category across the whole sample and never
   tied to a named repo, which is a deliberate choice I'm happy to argue about.

3. If you run it and it finds nothing, tell me — how many tools and repos did
   you scan? A null from a single-repo, single-tool setup is expected and is
   itself the point.

On the disclosure: I'm doing Atlan's GTM challenge and this is the artifact.
Atlan's Agent Registry is their unreleased product; none of this is theirs, and
nobody at Atlan reviewed this post.
```

## X thread

```
1/ Anthropic publishes 20 official agent skills.

   12 of them are in circulation elsewhere in versions that no longer match the
   original.

   All 12 have drifted. Twelve for twelve. 🧵

2/ The copies are ~2 months behind — frozen 24 Jul while the source moved on
   24 Sep.

   Not cosmetic either: 111 files differ in one skill, 108 in another, 53 in a
   third.

3/ I nearly published the opposite. My first scan said zero drift and I started
   writing the clever explanation — public repos are single sources of truth,
   drift only happens privately, etc.

   Wrong. The scanner ran on each repo in turn. A skill can't drift against
   itself.

4/ Scanning N repos one at a time answers a different question from scanning
   them together. The first version silently looks like good news.

   Same engine, all repos at once: 12 pairs, immediately.

5/ I'm not naming the collection holding the copies. Vendoring a snapshot is
   reasonable; hand-syncing 800 skills against upstream is not.

   A copy with nothing linking it back to its source drifts. Every time.

6/ Method, counts and per-repo cards: https://drift.aryaman.tech

   Security findings are reported by category across the whole sample and never
   tied to a named repo.

7/ Run it on your own repos — local, read-only, no account, no network call:

   git clone https://github.com/Aryaman3012/gtm
   node gtm/cli/skillsdrift.js .claude/skills .codex

   Most interesting if your company allows two or more AI tools.

8/ Disclosure: candidate exercise for Atlan's GTM challenge. Not an Atlan
   product, unaffiliated with any company in the scan, nobody at Atlan reviewed
   it.
```

## LinkedIn

```
Anthropic publishes 20 official agent skills. Twelve of them are in circulation
elsewhere in versions that no longer match the original — and every one of those
twelve has drifted. Twelve for twelve.

My first scan reported zero, and I spent a while building the explanation: a
public repository is a single source of truth, so drift must be something that
only happens privately inside companies. Wrong. The scan ran on each repository
in turn, and a skill cannot drift against itself. The zero was a property of how
I had asked the question. Run the same engine across every repository at once
and the drift is immediate.

The copies are roughly two months behind their source, and the differences are
substantial rather than cosmetic: 111 files differ in one skill, 108 in another,
53 in a third.

Nobody was careless. Vendoring a snapshot of a good library is sensible, and
keeping hundreds of skills in step with their upstreams by hand is not something
you can reasonably ask of anyone. That is exactly the point. A copy with nothing
connecting it back to its source drifts, and nobody finds out until two people
get different answers from what they believe is the same skill.

Which is worth sitting with if you own AI tooling. Every major assistant now
governs skills inside its own console — owners, versions, approvals — and stops
at that vendor's edge. The moment a company allows a second tool, the same skill
exists in two consoles and neither can see the other's copy.

Free, local, uploads nothing, about thirty seconds:
https://drift.aryaman.tech

Disclosure: a candidate exercise for Atlan's GTM challenge — not an Atlan
product, unaffiliated with any company named in the scan.
```

## Before posting

- [ ] **Send the N4 outreach first and give them time to reply.** Non-negotiable
      now that the finding involves their repository
- [ ] npm publish, then replace the clone command with `npx skillsdrift` everywhere
- [ ] Re-run `scanner/cross-repo-drift.js` so the counts match the live index that day
- [ ] Confirm no card names a company beside a security finding: `cd services && bash run-tests.sh`
- [ ] Post Tue–Thu morning US time; author's first comment goes up immediately
