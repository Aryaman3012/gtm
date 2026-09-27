# X distribution — three prongs

Launch amplification, builder adoption, and use-case content on X.

**Everything here is verified.** Star counts and push dates come from the GitHub
API; X handles come from each account's own `twitter_username` profile field or
from the person's own website. Nothing is inferred from a name, because an X
handle that looks like a GitHub login is a guess, and a guess sends you to a
stranger's mentions.

---

## Read this before spending effort

**Three facts that change the plan.**

**1. The biggest target in the ecosystem is not on X.** Jesse Vincent (`obra`)
maintains Superpowers — 292,159 stars, larger than Anthropic's own skills repo,
pushed today. His site lists Mastodon, Bluesky, Threads, GitHub and LinkedIn,
and no Twitter/X link at all. A pure-X plan cannot reach him. That is an
argument for a Bluesky/Mastodon arm, not for pretending X covers the field.

**2. Generic indie-hacker reach is the wrong audience and will backfire.** The
usual amplification accounts build solo products in single repos with one AI
tool. §1.9 excludes companies under ~200 people for exactly this reason, and
§2.1 says it outright: *"A solo repo scans clean and boring."* If a large
account runs the tool on one repo and gets zero findings, the public verdict is
"tried it, nothing there" — which is worse than no post at all. **Prong 2's
central risk is not being ignored. It is being tried wrong, publicly.**

**3. The bot cannot post.** `hasWriteCredentials: false`. Every prong below is
manual until X credentials exist. Nothing here is automatable today.

---

## Prong 1 — launch and repost

**First, a correction to the obvious version of this prong.** The tempting move
is to list the big skills repos and call them repost targets. That conflates two
different things: *relevance to the finding* and *incentive to amplify it*. For
the most relevant account they run in opposite directions — the more the finding
is about your list, the less you want to spread it.

Asking honestly what each account gains:

| Account | Reach | What reposting gets them | Verdict |
|---|---|---|---|
| **Composio** | 75.7k★ / [@composio](https://x.com/composio) | Amplification of a finding that their list carries 12 stale copies. Nothing. It is a self-inflicted wound | **Not a repost target** |
| **Vercel** | 32.6k★ / [@vercel](https://x.com/vercel) | A corporate account boosting an unaffiliated candidate exercise carrying another company's hiring disclosure. Also `skills.sh` is theirs, and a drift audit reads as a gap in it | **Not a repost target** |
| **Behi** | 10.2k★ / [@Behi_Sec](https://x.com/Behi_Sec) | Method content for a security audience — 11 blunt heuristics, category-only reporting. He shares methodology, not callouts | Plausible, on method |
| **Jeff Allan** | 11.6k★ / [@j3ffallan](https://x.com/j3ffallan) | 67 skills to maintain; a drift check is useful to him personally | Plausible, if it finds something in his |
| **Travis Van Nimwegen** | 15.2k★ / [@Travis_Engineer](https://x.com/Travis_Engineer) | Curator of a list unpushed since 28 Apr. The finding is adjacent to his own situation | Unlikely to amplify; worth the courtesy |
| **Sleuth** | 305★ / [@sleuth_io](https://x.com/sleuth_io) | Genuine complementary interest — `sx` shares skills, this audits them | Willing, negligible reach |

Corporate accounts do not repost individual unaffiliated tools, and none of
these people owe you distribution. **Plan for zero reposts from this list and
you will not be disappointed.**

### So what actually carries the launch

Three mechanisms, none of which depend on a curator choosing to help.

**1. The post travels on its own merit.** The shareable object is not the scan,
it is the self-correction: *"my scanner said zero drift and I believed it, and
the zero was an artefact of how I asked."* That story is amplified by people who
repost good debugging writeups — a different and much larger audience than
skills curators, and one that owes nobody anything. Same for the second bug:
a CLI silently truncating its own JSON into `jq`. Engineers repost
"here is how I was wrong" far more readily than "here is my tool."

**2. Engagement beats amplification.** The most valuable response from Composio
is not a repost — it is a reply saying "thanks, syncing those now." A correction
or confirmation from the maintainer of the list in question is what makes the
finding credible to everyone reading. That is worth more than their followers,
and it is a realistic ask where a repost is not. It also only happens if they
heard it from you first, privately, which is why the outreach is blocking.

**3. Clean results are the only genuinely repostable news.** Superpowers scanned
completely clean — 15 skills, no drift, no duplicates, no security-pattern hits.
Its maintainer has an actual reason to share that, because it makes him look
good rather than careless. This is the one case where the incentive points the
right way.

Note what this implies: a public list of who is clean and who is not would give
everyone that incentive — and `strategy/anti-fragmentation-gate.md` kills it
outright: *"Badge / leaderboard — KILL the score. Only a 'governed by Registry'
badge survives."* Telling a maintainer privately that their library is clean is
fine and they may share it themselves. Publishing a league table is not, and the
opt-in version of it is P3, which is Day 7–30, not Day 0.

### What to actually do on Day 0

- Post it yourself, on X and HN, and let the self-correction carry it.
- Bluesky the same day, because that is where the largest library's maintainer
  is (`bsky.app/profile/s.ly`) and it costs one post.
- Reply to anyone who engages, fast, especially anyone disputing the method.
- Do not tag the curators into the launch thread. They heard it privately;
  tagging them publicly converts a courtesy into pressure.

## Prong 2 — get builders actually using it

This is the prong that converts, and the one most likely to be executed badly.

**The rule: never ask someone to "try it". Give them the exact command that
produces a real result for their situation.** "Try my tool" on a single clean
repo returns nothing and costs you the relationship.

The scan that always says something interesting is **their skills against the
upstream they came from** — which only works since cross-repo comparison
exists:

```bash
git clone https://github.com/Aryaman3012/gtm
git clone https://github.com/anthropics/skills /tmp/upstream
node gtm/cli/skillsdrift.js ~/.claude/skills /tmp/upstream
```

Anyone who has ever copied a skill from a list gets a real answer. Anyone who
has not gets a clean bill of health, which is also a fine outcome to post.

**Sequenced, because one of these is a prerequisite.**

| # | Target | The specific opening | Timing |
|---|---|---|---|
| 1 | **Composio** ([@composio](https://x.com/composio)) | The 12 drifted pairs are in their list. They get the detail, privately, before anything is posted. See `campaign/n4-creator-outreach.md` | **Before Day 0. Blocking.** |
| 2 | **Jesse Vincent** (Bluesky/Mastodon) | Superpowers scans completely clean — 15 skills, no drift, no duplicates, no security-pattern hits. That is a true and unusual result, and a better opener than a pitch | Pre-launch |
| 3 | **Travis Van Nimwegen** | His list has not moved since April. Offer the scan; do not send an unsolicited one (§3.4: "Creators are offered a scan; nobody receives a pre-made one") | Day 1–7 |
| 4 | **Behi** | Lead with method, not findings: the 11 heuristics are blunt by design and he is the right person to argue about them | Day 1–7 |
| 5 | **Jeff Allan** | 67 skills across 12 categories is a maintenance surface. A drift check is directly useful to him | Day 1–7 |

**What "using it" looks like, in order of value:** running it once < posting a
report screenshot < committing `.skillsdrift-report.md` to their repo <
adding it to their list. The last one is the compounding outcome, and it is
Idea 0's awesome-list mechanism arriving through a person rather than a PR.

**Do not pursue** general indie-hacker amplification accounts. Wrong company
size, wrong repo shape, null scans, and §1.9 excludes them by name.

---

## Prong 3 — use-case posts

Content after launch, drawn from things that are true rather than invented.

Each of these already has evidence behind it in this repo, so none requires new
claims:

| Post | The material | Where it comes from |
|---|---|---|
| **"My scanner said zero and I believed it"** | Scanning N repos one at a time answers a different question from scanning them together, and the first silently looks like good news | `services/scanner/cross-repo-drift.js` header |
| **"Your CLI is lying to jq"** | `process.exit()` discards buffered stdout on a pipe: 146,103 bytes delivered of 1,469,069, no error either side | `cli/skillsdrift.js` |
| **"Two months of drift, nobody at fault"** | Copies frozen 2026-07-24, source moved 2026-09-24; 111/108/53 files differing | the scan |
| **"A decade of API versions in one corpus"** | 22 distinct pinned `api-version` values from 2016-06-01 to 2026-08-01 across 65 files, side by side | context scan |
| **"The skill that knows last year's price"** | Token prices hardcoded in comments next to model names; 936 pinned model ids including deprecated `gpt-3.5` and `gpt-4` | context scan |
| **"Governance that stops at the vendor's edge"** | Every major assistant governs skills in its own console, and none can see another's copy | §1.4 |

The last two are the bridge to Atlan's actual position — *"a registry proves an
agent is approved to run; it doesn't prove the agent's business logic is still
accurate"* — and they are the only posts here that argue for a context layer
rather than a scanner. Save them for after the drift finding has landed, or
they read as a product pitch with no evidence under it.

**Cadence.** The weekly broadcast (`services/bot/broadcast.js`) is the
automated floor, and `launch-distribution-ideas.md` scores that pattern as
Day 7–30 tail content, not a launch driver. These posts are the tail. Do not
front-load them.

---

## What blocks all three

- **No X credentials.** Nothing posts automatically; every prong is manual.
- **npm publish.** The CTA is a `git clone` until this happens, which costs
  conversion on every post.
- **Composio outreach.** Blocking for Day 0, because the finding is about them.
