# Distribution inside the org: how hubs spread the registry

## First, an honest check: does the dramatic distribution work?

**It's a credible design, not a proven one.** Be precise about which loop is doing what:

| Loop | How strong the multiplier is | Why |
|---|---|---|
| **Outer loop** (across orgs, via the dbt community) | 🟡 **Moderate, roughly linear** | Each repo install is a separate decision. The PR comment is only seen *inside* that org. Spread across orgs still depends on content (the data-drop, talks, community posts). That's good reach, but not viral. |
| **Inner loop** (inside an org, via hubs) | 🟢 **Genuinely non-linear** | One hub reaches hundreds of consumers. Dependencies pull the next hub in. New joiners grow the base automatically. |

**So the "dramatic" part is mostly inside the org.** The outer loop only has to land a hub in enough orgs. The inner loop turns each landing into several activated teams. That's also why the definition of "team" matters so much for the math.

---

## The inner loop, step by step

```
 0 SEED       one hub publishes 3–5 hero skills
 1 PULL       share links in Slack/Teams → people add the skill to their own AI tool (no admin needed)
 2 SIGNAL     usage report: "147 people, 3 functions, 2 AI tools"
 3 PUSH       admin assigns it to the whole org/groups → skills load automatically when relevant
 4 SPREAD     dependencies pull the next hub in · consumers suggest edits · new hubs appear
 5 GOVERN     owners, versions, review, security scans, one dashboard across AI tools
 6 BUY        Head of AI / CDO pays to keep what's already running
```

The key move is **pull before push**. Start with personal installs through share links, where the org allows personal skills, so the hub doesn't need IT on day 1. The usage count from step 2 is the evidence that gets the admin to push org-wide in step 3.

---

## Seven mechanics that make it non-linear inside

| # | Mechanic | How it spreads | Who it reaches |
|---|---|---|---|
| 1 | **Automatic loading** | Once assigned, a skill fires whenever it's relevant, because the AI tool matches on the skill's description. Every relevant question counts as usage, without anyone deciding to adopt. | Every consumer, without them noticing |
| 2 | **Search before you build** | The in-tool search, over MCP, asks "is there already an official skill for this?" That turns would-be copies into governed ones. | Would-be builders |
| 3 | **Dependency pull** | A deck skill depends on PMM messaging, which depends on the data team's metrics. Updating one flags everything that depends on it, so those owners want in. | The next hub |
| 4 | **Default packs for new joiners** | Every new hire gets their function's skills on day 1. | Grows with headcount |
| 5 | **Fork → suggest a change** | A consumer who improves a skill proposes the edit and doesn't keep a private copy. Some become owners. | Turns consumers into new hubs |
| 6 | **Weekly digest / credit** | A Slack post: "Top skills this week, by owner." Hubs get visible credit, and teammates see what's already in use. | Hubs and managers |
| 7 | **Staleness alerts** | A source changes, and the owners of dependent skills get pinged. Brings people back repeatedly, not just once. | Hubs, and the pain feelers |

---

## Hubs: how to find them, and what gets them in

**How to find hubs in an org.** These signals are visible in the free scan, in the share-link counts and in the Claude/ChatGPT admin analytics:
- the skills, GPTs and projects with the **most copies** or the **most users**
- whoever owns the **source of truth**: the semantic layer, the messaging doc, eng standards, approved claims
- names that keep coming up in "#ai-prompts"-style channels

| Hub | What they get on day 1 | Their first 3 hero skills | How they know it worked |
|---|---|---|---|
| **Data team** | No more wrong numbers; a metric change flags everything that depends on it | Revenue metric, customer count, "how to query X" | Invocations, and the number of functions using it |
| **PMM** | Messaging stays current in every AI tool | Positioning, competitor battlecard, pricing answers | Seller usage after a launch |
| **DevEx** | Push once to every AI coding tool | Coding conventions, PR review, repo onboarding | Share of engineers on the current version |
| **Enablement** | The GPT library rebuilt once, and it works in every AI tool | Account research, QBR deck, objection handling | Seller adoption, and ramp time |

**Consumers are never recruited.** They get a skill that is visibly better than doing it themselves, and they see colleagues already using it. Governance comes along with the usage.

---

## Walk-through: one org

- **Week 0:** the data team runs the metric-skill kit and publishes 3 metric skills with share links.
- **Weeks 1–2:** links go into #finance, #sales-ops and #analytics. People add the skills to Claude or ChatGPT themselves, and the usage counter starts.
- **Week 3:** the digest shows the skills used across 3 functions. The CoE sees the usage report.
- **Week 4:** an admin assigns the plugin to groups, so the skills now load automatically. PMM notices its pricing answers conflict with the metric skill, and **dependency pull** brings PMM in.
- **Weeks 6–8:** Enablement links the QBR skill to both hubs. New joiners get the default packs.
- **The buying moment:** the Head of AI's dashboard shows skills, owners, versions and usage across 4 functions and 2 AI tools. That's the report nobody else can produce.

*(These timings show the sequence, not a forecast. You set the assumptions.)*

---

## Where it stalls (devil's advocate)

| Failure | Mitigation |
|---|---|
| Nobody knows the skills exist | Automatic loading, a weekly digest, and the AI champions channel |
| Admin policy blocks personal skills | Start in orgs that allow them, or with the data team in Atlan accounts where the vendor is already approved |
| The owner leaves, and the skill rots | Owner field + staleness alerts + a named backup owner |
| Too many skills, and they trigger on top of each other | Search-before-build + merging duplicates (from the Atlan demo) + limit skills per hub at the start |
| Consumers don't trust AI answers anyway | Show "governed by: Data team, v1.3" inside the answer |
| Weak usage data from some AI tools | Use whatever each tool exposes: full session data for Claude Code and Codex, share-link and install events for everything else |

## What to measure in the inner loop

- Consumers per hero skill, and **number of functions per org** (1 = stalled, 3+ = the crossing worked)
- Time from personal installs to org-wide push
- Hubs per org over time (did dependency pull happen?)
- Copies avoided (search-before-build hits)
- Share of relevant AI answers that ran on a governed skill
