# N4 — creator co-launch

Ranked #3 in `strategy/launch-distribution-ideas.md`, and the only idea in the
set that multiplies reach rather than adding to it: *"the tightest T2 fit of any
idea; converts an unknown candidate tool into a trusted-name recommendation."*

Its verdict carries one execution warning, which is the whole reason this file
exists: **"outreach must start pre-launch, not be pitched cold on Day 0."** It is
the only GO idea whose lead time cannot be compressed. Everything else can be
done on the day; this cannot.

**Status: not started. Nothing has been sent.** Drafts only — I have not
contacted anyone on your behalf, and these need your voice and your judgement
about who you actually want to approach.

## Why a curator rather than a big account

The ask is not "please retweet." It is "you maintain a list of skills; here is a
tool that audits skills; would you look at it before I post it." A curator has
three things a large generic account does not: an audience that is exactly the
ICP, a reason to care about skill quality, and a artifact of their own that the
tool can serve. The honest pitch is that the data is about *their* corner of the
ecosystem.

## Targets, in priority order

Drawn from repos this project has already scanned or cited, so the approach is
grounded in something real rather than flattery.

| Target | Why them | The specific opening |
|---|---|---|
| **ComposioHQ/awesome-claude-skills** (~75k★) | Largest list, already in the scan (864 skills — 91% of the sample) | The scan is mostly *their* list. They have the strongest claim to see it first, and the strongest reason to care what it says |
| **travisvn/awesome-claude-skills** (~15k★) | Second list, independent curator | Same data, different slice; a natural second conversation if the first lands |
| **BehiSecc/awesome-claude-skills** (~10k★) | Security-leaning curator | The 11 heuristics are directly their subject. Most likely of the three to engage on method |
| **The sx author** (Sleuth, HN 48900319) | Built a tool for adjacent pain; the sharpest public pain signal in the research base | Complementary, not competing: sx shares skills, skillsdrift audits them |

Deliberately excluded: Anthropic, Vercel and Microsoft appear in the scan but
are companies, not creators. Approaching a company about findings in their repo
is a different act with different risk, and P1's second condition exists
precisely to avoid it.

## Timing

Send **at least 5 working days before Day 0**. The point is a reply before
launch, not a notification during it. If nobody replies in time, launch without
them — N4 is a multiplier, and the plan's own arithmetic does not depend on it.

## The message

Short, one ask, no attachment, no pitch deck. The scan is the reason to reply.

```
Subject: scanned your skills list for drift — 90 seconds, before I post anything

Hi <name>,

I built a small CLI that audits Claude Code / Codex agent-skill directories for
drift: the same skill in two places whose contents no longer match. To see how
common it is, I scanned 951 public skills — 864 of them from your list.

Two reasons I'm writing before I publish rather than after.

First, the headline result is a null and I want to be sure I'm reading it right.
Zero drifted pairs across the whole sample. My reading is that a public repo is
a single source of truth so there's nothing to disagree with, and drift only
starts once a skill is copied inside a company. If you think that's wrong, I'd
rather hear it now.

Second, your list is most of the sample. It seems only fair you see what it says
first. No repository is named beside any security finding — those are reported
by category across the whole sample and never attributed — and I'm not
publishing a league table.

Index and method: https://drift.aryaman.tech
Run it yourself: git clone https://github.com/Aryaman3012/gtm
                 node gtm/cli/skillsdrift.js <your skills dir>

If it's useful, a note from you when I post would help more than anything else I
could do. Entirely fine if not — the data is yours to look at either way.

Disclosure: this is a candidate exercise for Atlan's GTM challenge. Not an Atlan
product, unaffiliated with any company in the scan, MIT licensed.

— Aryaman
```

## Rules

- **One follow-up maximum**, after 5 days, then stop. The launch-checklist's
  rules of engagement apply here in full.
- **No implied endorsement.** If they don't reply, they are not mentioned in any
  launch material.
- **Their findings are theirs.** If a curator asks for their own list's detail,
  they get everything, including security — that is an `own`-subject card (see
  `services/cardgen/lib/generate.js`). Nobody else gets it.
- **Never soften the disclosure** to improve the odds of a reply.

## Before you send

- [ ] Decide who you actually want to approach — the table is a starting point
- [ ] Re-run the scan so the numbers in the message are current
- [ ] Confirm https://drift.aryaman.tech is up and names no company beside a finding
- [ ] Send from your own account, in your own words
