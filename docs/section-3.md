# Section 3 — the campaign, the build, and what is being submitted

*Aryaman Singh · GTM candidate work sample · Independent exercise, not affiliated with Atlan.*

Sections 1 and 2 establish the ICP and the channel. This document is Section 3:
the campaign that runs, the artifacts that exist, and the reasoning behind each
choice — including the two places where the reasoning was wrong and had to be
replaced with something better.

Every number here was verified at the time of writing. Nothing is asserted from
memory: counts come from the scanner output, test results from running the
suites, and live status from HTTP checks against the running site.

---

## The short version

| | |
|---|---|
| **Campaign** | "State of Skill Drift" — a public data drop plus a free 30-second local audit |
| **Day 0 hook** | 12 drifted pairs found across 951 public skills, *and* the fact that the first scan said zero because it was asking the wrong question |
| **Live now** | <https://drift.aryaman.tech> — index, six cards, pilot waitlist, valid TLS |
| **Built and tested** | CLI, scanner, card generator, GitHub App, X bot, bridge skill — 58 tests, passing on Linux and macOS |
| **Blocking Day 0** | npm publish (needs credentials), and the creator outreach that must precede a finding about someone's repository |
| **Still open** | X credentials, the team-scan artifact, and two questions only Atlan can answer |

---

## 3.1 What is the first campaign, ready to run?

**Answer.** **"State of Skill Drift."** A public data drop, launched where
platform engineers already are, paired with a free local audit they can run in
thirty seconds. Ranked #1 of fourteen ideas in
`strategy/launch-distribution-ideas.md` — the only one that can produce a real
spike without depending on a third party's cooperation and without a
structurally slow mechanism.

The full post, drafted for Show HN, X and LinkedIn, is in
[`campaign/p1-data-drop.md`](../campaign/p1-data-drop.md).

**The hook, and why it changed twice.** This is the most important reasoning in
the document, because both earlier versions were wrong in ways that would have
shown.

*First version:* "951 public skills, 100% with no owner field." §3.4 retracted
it. It measures a file convention, not a problem — public libraries record
ownership in git rather than in frontmatter. Leading with it invites the one
reply that kills a thread: *that isn't what an owner field is for.*

*Second version:* "I scanned 951 skills for drift and found none — and that's
the finding." The argument was that a public repository is a single source of
truth, so drift must be something that only happens privately inside companies.
It was elegant, and it was false. The scanner ran on each repository in turn:

```js
for (const entry of repos) { result = scanRepo(slug) }
```

A skill cannot drift against itself, so a per-repo scan reports zero cross-repo
drift *by construction*. The zero was a property of how the question was asked.

*Third and current version:* run the same engine over every repository at once
and the drift appears immediately.

> Twelve skills exist in two public repositories with contents that no longer
> match. Every one is an official skill copied into a community collection,
> which then stood still while the original kept moving.

The copies are two months behind — frozen at 2026-07-24 while the source moved
on 2026-09-24. The largest divergences are substantial: 111 files differ in one
skill, 108 in another, 53 in a third. Anyone can reproduce it.

**Why the mistake stays in the post.** It is the most persuasive part. A tool
that finds drift is a claim; an author who was fooled by his own null result and
says so is evidence that the failure mode is real and easy to miss. It also
demonstrates the product thesis on the author rather than on a stranger.

**Blockers before it can run**, reduced from four to two:

| Blocker | Status |
|---|---|
| ~~Domain not serving~~ | Resolved — live over HTTPS, cert to 26 Dec, auto-renewing |
| ~~Waitlist backend~~ | Resolved — built, deployed, running |
| ~~Data-drop metrics uncomputed~~ | Resolved — the scan is the finding |
| npm publish | **Open.** Needs credentials I do not have. Until then the CTA is a `git clone`, which costs conversion on every post |
| Creator outreach | **Open, and blocking.** The finding concerns a specific repository; its maintainers see it privately first |

## 3.2 Who is the audience?

**Answer.** The ICP from §1.1: **platform and DevEx engineers at 200–2,000
person companies that officially allow two or more AI tools**, reached through
GitHub, Hacker News, X and platform-engineering communities.

Heads of AI see the LinkedIn version, so the question "do we have this?" reaches
them while their engineers already have the answer. That is a side effect, not a
second audience, and no part of the campaign is built for them.

**Reasoning.** The qualifier doing the work is *two or more tools*. Inside a
single tool the vendor now governs skills properly — Claude org skills, ChatGPT
workspace skills, Copilot org instructions. The pain has moved to the seams, so
a single-tool company is genuinely well served and is not a prospect.

## 3.3 What is the offer?

**Answer.** *"See how your team's AI skills have drifted across tools and repos
in 30 seconds. Nothing leaves your machine."* Once the report has shown
something, the next step is *"import this inventory into a governed pilot."*

**Reasoning.** No risk to the user, and the pain is demonstrated before anything
is asked. It also deliberately gives away no free fragment — no badge, no score,
no hosted dashboard — that would satisfy the need in one session and stop people
going further. The rule behind every free surface: *a scanner finds drift; a
registry makes drift impossible.*

## 3.4 What is the channel-native acquisition asset?

**Answer.** Four, all built:

| Asset | State |
|---|---|
| The CLI | [`cli/`](../cli/) — 10 tests, no dependencies, no network |
| The State of Skill Drift index | Live at <https://drift.aryaman.tech> |
| Shareable per-repo cards | Live, six of them |
| The bridge skill demo | [`SKILLSDRIFT-BRIDGE.md`](../SKILLSDRIFT-BRIDGE.md) |

**What the data drop reports, and what it refuses to.** Three rules, each with a
reason rather than a preference:

1. **No ungoverned percentage.** Retracted — it measures a file convention.
2. **Security by category across the whole sample, never against a named
   repository.** `launch-distribution-ideas.md` P1 condition 2 forbids tying the
   security category to a named company, to avoid defamation-adjacent claims.
   This was violated in practice and had to be fixed: a live card read
   *"microsoft/azure-skills — Security findings: 10 (… reverse shell / raw socket
   redirect …)"*, which is an accusation of malicious code against a real
   company. Cards now take a `subject`, defaulting to `third-party`, which
   withholds security entirely; only a card about the reader's own repository
   shows it.
3. **No call-out marketing.** Named repos are scanned when their owner asks.
   Creators are offered a scan; nobody receives a pre-made one.

**The drift finding is reported as a pattern, not an accusation.** Vendoring a
snapshot of a good skill library is reasonable, and hand-syncing 800-odd skills
against their upstreams is not something anyone can reasonably be expected to
do. Drift is not a failure of care — it is what a copy does when nothing
connects it to its source. Saying that plainly is both more accurate and more
persuasive than a callout.

## 3.5 What is the destination or activation experience?

**Answer.**

1. Local scan → three-layer report (engineer / team scorecard / exec memo)
2. Import-ready manifest (`atlan-registry-import/1`)
3. The public index and per-repo cards
4. The pilot waitlist

**Live and verified:** index, cards, `/waitlist`, and `/api/waitlist` all return
200 over valid TLS. The waitlist service is `enabled` and `active` under systemd
and survives reboot. Zero signups, which is correct — nothing has launched.

**Reasoning on the waitlist's shape.** It collects exactly the two fields that
qualify a lead — job title and company domain — plus an email to reply to.
Nothing else: no IP address, no user agent, no cookies, no third-party script.
It is the only surface in the entire project that touches personal data, and the
CLI deliberately sends nothing to it. That separation is stated on the page
itself, because a tool asking to read your repositories has to be legible about
what it does not do.

## 3.6 What is the call to action?

**Answer.**

- **Primary:** "Run the scan."
- **Inside the company:** "Forward this to the owners", "Claim your skills."
- **Once value is proven:** "Import into a governed pilot."
- **For someone receiving a shared link:** "Open the current version."

**One correction worth recording.** The published CTA was
`npx skillsdrift .claude/skills .codex`. The package is not published, so that
command returned an npm 404 for everyone who tried it. It now reads:

```bash
git clone https://github.com/Aryaman3012/gtm
node gtm/cli/skillsdrift.js .claude/skills .codex
```

verified end to end from a fresh clone. `npx github:Aryaman3012/gtm` cannot work
either, because `package.json` lives in `cli/` rather than the repository root.

## 3.7 What are the launch mechanics?

**Answer.** Five ideas survive as GO in
`strategy/launch-distribution-ideas.md`, each with a distinct role:

| Day | What runs |
|---|---|
| **0** | P1 data drop on HN, X and LinkedIn. Bluesky the same day |
| **1–7** | Creator amplification; staggered, disclosed beta-tester posts; awesome-list submissions once there is usage to cite |
| **7–30** | Organic compounding, PR merges landing, champion follow-up calls, the badge layer once there are real results to show |

**The X mechanics specifically** are in
[`campaign/x-distribution.md`](../campaign/x-distribution.md), and the reasoning
there corrects an assumption worth stating here.

The obvious version of "launch and repost" lists the big skills repositories as
repost targets. That conflates *relevance to the finding* with *incentive to
amplify it*, and for the most relevant account they point in opposite
directions: the more the finding is about your list, the less you want to spread
it. Composio has no reason to amplify a post about stale copies in their list.
Vercel is a corporate account that will not boost an unaffiliated candidate
exercise carrying another company's hiring disclosure, and `skills.sh` is
theirs, so a drift audit reads as a gap in their own product.

So the launch does not depend on anyone's goodwill:

1. **The self-correction travels.** "My scanner said zero and I believed it" is
   amplified by people who repost debugging writeups — a much larger audience
   than skills curators, and one that owes nobody anything.
2. **Engagement beats amplification.** A reply from the maintainer in question
   saying "thanks, syncing those" is what makes the finding credible. That is a
   realistic ask where a repost is not, and it only happens if they heard it
   privately first.
3. **Clean results are the only genuinely repostable news.** Superpowers —
   292,159 stars, the largest skill library in the ecosystem — scans completely
   clean: 15 skills, no drift, no duplicates, no security-pattern hits. Its
   maintainer has a real reason to share that.

**One fact that constrains the whole plan:** Superpowers' maintainer is not on
X. His site lists Mastodon, Bluesky, Threads and LinkedIn, and no Twitter link.
A pure-X plan cannot reach the largest library in the ecosystem, which is why
Bluesky is in the Day 0 list rather than a "maybe later".

**Also dropped:** a campaign around the ChatGPT custom-GPT retirement. OpenAI's
own migration already turns GPTs into plugins with skills, and those buyers are
a different workload from the ICP. It remains a question to ask in interviews,
not a campaign.

## 3.8 What is the measurement plan?

**Answer.** The CLI sends nothing by default. Every signal below comes from
something a user chose to do, or from our own servers.

| Stage | Signal | Source | Built? |
|---|---|---|---|
| Reach | Page views, npm downloads, GitHub stars | Server logs, npm, GitHub | Partly — npm pending |
| First value | Waitlist signups with title and domain | Waitlist service | ✅ Live |
| Opt-in usage | One anonymous "scan completed" event | Opt-in ping | ❌ Not built |
| Spread inside a company | Rollup contributors per domain; skills claimed | Rollup service | ❌ Not built |
| Crossing into non-tech | Shared links opened, by recipient function | Link service | ❌ Not built |
| Champion | GitHub App installs per domain | App service | ✅ Built, not registered |
| Activation | Per the §2.3 definition | Registry | Depends on Atlan |

**Working definition of "team"** until Atlan confirms: *a group of ≥5 people who
share at least one governed skill with a named owner.* Several teams can exist
in one company, which is why the target moves from roughly 667 companies to far
fewer if Atlan counts teams within a company separately. **This is one of two
open questions for Atlan.**

## 3.9 What signal would make us continue, change or stop?

The placeholders [A]–[E] were unset. Proposed values and the derivation for
each, so they can be argued with rather than accepted:

| Gate | Continue | Change | Stop |
|---|---|---|---|
| Discovery interviews | ≥ **5** of 8 describe drift across tools unprompted | 3–4 → pain is real but within one tool; reposition to the app/assistant gap | < **3** of 8 → rethink the ICP |
| Launch wave | ≥ **25** ICP-matching companies complete a scan | Scans cluster below 200 people → shift to platform-engineering communities | Two waves under target → rethink the channel |
| Team → company | ≥ **15%** of opted-in scanners run a team scan | Lower → the report is not making the case for looking wider | — |
| Crossing into non-tech | A shared link opened by ≥1 non-engineering function within **14** days at a design partner | Engineering-only → run the cross-functional share by hand in one function | — |
| Champion | App installs at design partners | Champions engage, leaders do not → reframe the summary for leaders | — |

**[A] = 5, [B] = 3.** With 8 interviews, 5 (62%) is clearly above a coin flip
and enough to say the pain generalises within the segment; 4 is not
distinguishable from chance. Below 3 (37%) the pain does not generalise and the
ICP filter is wrong rather than the messaging. The 3–4 band is deliberately the
"change" column, because that pattern — real pain, contained within one tool —
is a repositioning signal, not a stop signal.

**[C] = 25 companies.** Derived from the plan's own honest arithmetic rather
than an aspiration: best-case week-1 reach of 8,000–20,000 readers, R2's ~5%
visitor-to-run assumption giving 400–1,000 runs, of which most will be solo
developers outside the ICP filter. At 5–10% matching the filter that is 20–100
companies. 25 is the conservative end, and it is falsifiable within the window.

**[D] = 15%, and this gate cannot currently be measured.** The team scan does
not exist — §3.10 lists it as designed only. A gate that depends on an unbuilt
artifact is not a gate, and the honest thing is to say so rather than to let a
number imply a measurement. Either the team scan gets built before the launch
wave, or [D] is deferred and the individual→team leap is assessed qualitatively
from design partners.

**[E] = 14 days.** Long enough that a Slack message can survive one week of
someone else's priorities, short enough that a null result still arrives inside
the 30-day window with time to change something.

## 3.10 What did we leave behind that Atlan can click, run or inspect?

All six artifacts are now in the repository and independently verifiable. This
question previously answered "built, per build logs" for five of them, which is
not an answer a reviewer can check.

| Artifact | State | Where |
|---|---|---|
| **skillsdrift CLI** — scan, drift diffs, 11 security heuristics, three-layer report, import manifest, check-in mode | ✅ 10 tests, Linux + macOS | [`cli/`](../cli/) |
| **skillsdrift-bridge skill** — reads a drift report, picks cross-functional skills, shares governed links on Slack with consent | ✅ Built, dry-run tested twice | [`skills/`](../skills/), [`dist/`](../dist/) |
| **Scanner + card generator** — public repo scans, index, weekly delta, cross-repo drift | ✅ 10 tests | [`services/scanner/`](../services/scanner/) |
| **GitHub App** — weekly check, opens an issue with findings | ✅ 8 tests. Not registered, deliberately | [`services/app/`](../services/app/) |
| **X bot** — scans on mention, public reply plus private security detail | ✅ 30 tests. No credentials, so it cannot post | [`services/bot/`](../services/bot/) |
| **Waitlist** — the pilot destination | ✅ Live | [`waitlist/`](../waitlist/) |

**58 tests across four suites, passing on both Linux and macOS.**

Live: <https://drift.aryaman.tech> (index, cards, `/waitlist`, `/state-of-drift.json`,
`/cross-repo-drift.json`), valid certificate to 26 December, auto-renewing.

**Why the GitHub App is built but not registered.** This looks like an omission
and is a decision. `launch-distribution-ideas.md` ranks the App as the Day 0–7
conversion destination, live on Day 0 as the data drop's CTA. `two-hop-gtm.md`
§A3 supersedes that, and gives the reason: installing a GitHub App on an
org-owned repository needs owner/admin approval, which the wedge engineer — "the
accidental-owner engineer… explicitly no budget or admin authority" — by
definition does not have. A3 calls this the modal case at enterprise and
concludes that *"the App is not the trigger for Hop 1, it's the result of a
successful, permission-free Hop 1."* So the Day 0 CTA points at the CLI alone,
and the App's role is Day 7–30, requested by a champion who has already seen CLI
evidence. Pointing launch traffic at an install most readers cannot perform
would convert worse and breach the project's own sequencing gate.

**Still designed only:** team scan, forwarded-note output, opt-in ping and
rollup. These are §1.8 steps 2–4, the individual→team leap, and their absence is
the largest real gap in the build.

## 3.11 Is it what the thesis requires, and has it taught us anything?

**Required: yes.** The thesis is that artifacts travel and people do not. The
CLI carries the first step, the three-layer report carries the step to the
champion, and the bridge skill carries the crossing into non-engineering teams.
The gap is the middle — steps 2 to 4 — where nothing is built yet.

**What building it actually taught, beyond the earlier list:**

- **A null result is a claim, and it needs the same scrutiny as a positive one.**
  The scan reported zero drift and an entire narrative was built on top of it
  before anyone asked whether the measurement could have produced a non-zero
  answer. It could not. The shape of the harness determined the finding.
- **A tool can lie quietly.** `skillsdrift.js` called `process.exit(run(...))`.
  Node writes to a pipe asynchronously, so `process.exit()` discarded buffered
  output: 146,103 bytes delivered of 1,469,069, silently, with no error on
  either side. Writing to a file worked, because file writes are synchronous,
  which is exactly why it went unnoticed. Every user piping `--json` into `jq`
  had been getting truncated reports. The GitHub App had the same shape, on its
  normal code path.
- **A generated artifact drifts from its source too.** The packaged
  `.skill` file was assembled by hand and silently omitted its examples, in a
  project about things drifting from their sources. It is now built by a script
  with a `--check` mode.
- **The rules bind us first.** The index published a security count against a
  named company before anyone noticed it violated the project's own condition.
  A rule that only applies to other people's behaviour is not a rule.
- **Relevance is not incentive.** The people most affected by a finding are the
  least likely to amplify it.

**Not learned yet: anything from users.** That still requires launching, and
launching still requires an npm publish and one outreach email.

---

## What is being submitted, and why each piece is here

| Path | What it is | Why it is in the submission |
|---|---|---|
| [`docs/core_challenge_answers.md`](core_challenge_answers.md) | Sections 1–3 plus a 42-source evidence appendix | The argument, with its sources and its rejected alternatives |
| [`docs/section-3.md`](section-3.md) | This document | Section 3 in full, with the reasoning and the corrections |
| [`docs/working-doc-final.pdf`](working-doc-final.pdf) | Long-form working document | How the thesis changed, and a devil's-advocate pass |
| [`deck/`](../deck/) | Readout deck and its next revision | The 20-minute version |
| [`docs/research/`](research/) | Pain sweep, GitLab walkthrough, thesis validation | The evidence base the argument rests on |
| [`cli/`](../cli/) | The `skillsdrift` CLI | The artifact the whole channel depends on. Runnable in two commands |
| [`services/`](../services/) | Scanner, cardgen, GitHub App, X bot | The rest of the stack, so no claim rests on a build log |
| [`waitlist/`](../waitlist/) | Pilot waitlist service | The funnel's destination, and the only surface touching personal data |
| [`skills/`](../skills/), [`dist/`](../dist/) | The bridge skill, source and packaged | How adoption crosses from engineering into other functions |
| [`campaign/`](../campaign/) | Data drop, X strategy, creator outreach, launch checklist | Everything needed to run Day 0, written to be executed rather than admired |
| [`scripts/package-skill.sh`](../scripts/package-skill.sh) | Skill packaging with a drift check | Because the packaged artifact had already drifted once |

**What is deliberately absent.** No badge, no score, no leaderboard —
`anti-fragmentation-gate.md` kills the score outright, and the opt-in version
belongs to a later phase. No fabricated usage numbers, no invented reach, no
pre-made scans sent to creators who did not ask. No security finding attached to
a named company anywhere on a public surface.

## What is still open

| | Blocker | Owner |
|---|---|---|
| `npx skillsdrift` | npm publish — `package.json` is publish-ready | Needs your credentials |
| The X bot posting | No X credentials configured | Needs your credentials |
| Creator outreach | Drafted, not sent — and it blocks Day 0 | Yours to send, in your voice |
| Team scan, forwarded notes, opt-in rollup | Designed only; [D] cannot be measured without them | Build |
| Definition of "team" (§3.8) | Needs Atlan | Atlan |
| Per-skill URLs, manifest import, sandbox workspace (§2.4) | Needs Atlan | Atlan |

The last two are not work items. They are the first two questions for the
working session, and the import manifest exists precisely so that answering them
turns into a mechanical step rather than a rebuild.
