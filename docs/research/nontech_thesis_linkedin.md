# Agent Registry for non-tech teams: LinkedIn as the worked example

**TL;DR:** In non-tech teams, the person who feels the pain most is not the seller using AI. It is the small internal team that has to turn sellers' one-off prompts and agents into something official. LinkedIn is hiring exactly that team right now. So the line runs:

**power-user seller (builds it) → GTM Enablement AI builder (has to maintain it) → Director of GTM Enablement / GTM Ops (pays to make it stop)**

---

## 1. Why the thesis changes for non-tech

| | Tech thesis (current doc) | Non-tech thesis |
|---|---|---|
| Where skills live | Repos, `.claude/` folders | Copilot notebooks, Claude projects, Teams threads, Gong, docs |
| What drift looks like | Builds break, reviews go inconsistent | Customers get different pitches, stale pricing, off-brand decks |
| Wedge artifact | CLI scan → PR | Share link → usage report |
| Trigger | Security finding, audit | Sales kickoff, new product launch, a claim Legal didn't approve |
| Buyer | VP Eng / AI transformation lead | GTM Enablement / GTM Ops |
| Observability | Session traces (Tier 1) | Usage events: loads, shares, searches (Tier 2/3) |

---

## 2. LinkedIn's org chart: the slice that matters

LinkedIn's sales org is the **GBO (Global Business Organization)**, which historically reported into Dan Shapero as COO. Shapero became CEO in April 2026. Roslansky now runs LinkedIn plus Microsoft Office and M365 Copilot.

| Seat | Who (public) | AI in their day | Pain |
|---|---|---|---|
| CEO | Dan Shapero (ex-COO, ran GBO) | Sponsor, not user | Low, abstract |
| Chief Business Officer (sales/GTM) | Mark Lobosco* | Reads reports | Medium: wants ROI proof |
| CMO & Strategy | Jessica Jensen | Brand-owner of outputs | Medium: off-brand content |
| Legal | Blake Lawit* | Blocker | Spiky: only when a bad claim ships |
| **GTM Enablement CoE: manager** | Open role: *Manager, AI Builder GTM Enablement* (Director level, in GBO) | Owns the AI portfolio for sellers | **High, and it's their job** |
| **GTM Enablement CoE: AI builders** | Open role: *AI Builder, GTM Enablement* | Builds agents and copilots in Claude Code, wired to Gong and Cornerstone | **Highest, every day** |
| Frontline sales managers | Hundreds | Inspect rep output | High: inconsistent pitch quality |
| AEs, AMs, CSMs | Thousands | Build and tweak their own prompts | Low: they *create* the sprawl |

\*From an aggregator's exec list; not verified on LinkedIn itself.

**The evidence that the pain is real:** LinkedIn's own job posts for this team say, nearly verbatim, what the Registry sells:

- *"Establish reusable patterns and consolidate one-off solutions into durable systems"*
- *"Establish standards for lifecycle management, documentation, and governance"*
- *"Define architecture patterns that improve scalability and reuse"*
- Tools named: **Claude Code**, Replit, Figma Make, Gong, Cornerstone

That is a non-tech org describing the skill-drift problem in its own hiring language.

---

## 3. Who feels it most

1. **The AI builders in GTM Enablement.** They own dozens of agents serving thousands of sellers. Every seller tweak becomes a fork. They can't answer "which version is official", "who uses it", or "did the new play reach the field". Their headcount doesn't scale with the number of sellers.
2. **Frontline sales managers.** They see the result: five reps, five versions of the account plan, one with last quarter's pricing.
3. **Legal and Brand.** The pain is rare but severe, and it lands the day an ungoverned prompt puts an unapproved claim in front of a customer.

The seller feels the least pain. They are the **early adopter**, not the pain feeler.

---

## 4. The line: early adopter → pain feeler → buyer

### Hop 0: the early adopter
- **Who:** a power-user AE, SE or sales-ops analyst in one region.
- **What they do:** build a great "account research → QBR deck" skill and drop it in a Teams channel.
- **Trigger:** 30 teammates ask for it, and each copies and edits their own version.
- **What they need from us:** a share link instead of a file, so the copy stays connected to the source.

### Hop 1: early adopter → pain feeler (the AI builder)
- **Moment:** Enablement is asked to make it official and finds 14 variants.
- **Artifact that carries the hop:** the usage report on the shared link, e.g. *"QBR skill: 212 sellers, 3 regions, 4 live variants, 1 citing old pricing."*
- **Why they act:** the report turns a mess they suspected into a mess they can point to. It also hands them the consolidation plan their job description asks for.

### Hop 2: pain feeler → buyer (Director of GTM Enablement / VP GTM Ops)
- **Moment:** a planning cycle or sales kickoff, when new plays roll out and the question becomes "how do we know every seller is using the new version?" A second moment is any Legal or Brand incident.
- **Artifact:** a one-page adoption and consistency report: *"% of seller AI output running on approved skills,"* by region and team. Later, it gets tied to ramp time and win rate from Gong.
- **Why they pay:** Enablement is measured on adoption and field consistency. This is the first tool that measures that for AI output, and it sits in a budget line they already own (Gong and Cornerstone are in their stack).
- **Signs off above them:** the CBO, if it's cross-org.
- **Blockers:** IT/Security and Legal, which is where governance becomes the selling point.

### How the line connects

```
Seller builds skill ──share link──▶ 200 sellers use it
                                        │ usage report
                                        ▼
                  AI builder: "4 variants, 1 wrong" ──consolidation plan──▶
                                        │ adoption report at SKO / planning
                                        ▼
                  Dir. GTM Enablement: budget  ──▶  CBO sign-off (if cross-org)
```

---

## 5. The honest caveat

**LinkedIn itself is a bad first customer.** It sits inside Microsoft, and Microsoft's own **Agent 365** (generally available since May 2026) is an agent registry and control plane. A third-party tool faces an uphill fight there.

Use LinkedIn as **the shape, not the target**. The same shape is the targeting query:

> Companies hiring "AI Builder" / "GTM AI" / "AI Enablement" roles inside sales or enablement orgs, running Claude or ChatGPT, and **not** all-in on the Microsoft agent stack.

Those job posts are both the list and the proof of pain. That makes LinkedIn a usable channel, not just the example.

**Positioning vs Agent 365:** it governs *agents* (identity, access). The Registry governs *the context inside them* (skills, versions, owners) across harnesses. Say this plainly, because an Atlan interviewer will ask.

---

## 6. What to test first

1. **Pull 20 companies** with open "AI builder in GTM enablement" roles. That list is the pain signal.
2. **Talk to 3–5 people** in those roles: *"How many versions of your top seller skill exist right now, and how would you know?"*
3. **Mock the Hop 1 artifact:** one usage report for one shared skill. Show it and see if they ask for it.

---

## Sources

- [GeekWire: Shapero becomes LinkedIn CEO](https://www.geekwire.com/2026/linkedin-ceo-change-daniel-shapero-takes-the-helm-as-ryan-roslansky-broadens-microsoft-role/)
- [CNBC: LinkedIn names Shapero CEO](https://www.cnbc.com/2026/04/22/microsofts-linkedin-makes-executive-daniel-shapero-its-new-ceo.html)
- [DigitalDefynd: LinkedIn C-suite 2026](https://digitaldefynd.com/IQ/meet-the-c-suite-executive-team-of-linkedin/) (aggregator)
- [Marketing Week: Jessica Jensen joins as CMO & Strategy](https://www.marketingweek.com/linkedin-chief-marketing-strategy-officer/)
- [LinkedIn CEO message on GBO reorg (2023)](https://news.linkedin.com/2023/may/a-message-from-linkedin-s-ceo)
- [Job: Manager, AI Builder GTM Enablement (LinkedIn)](https://www.dreamworkhq.com/job/2a06de8b-ec4a-4331-b3c6-747512522c14)
- [Job: AI Builder, GTM Enablement (LinkedIn)](https://www.dreamworkhq.com/job/ab7c2a6f-a327-4d5d-b82f-64261a71ab47)
- [Microsoft: Agent 365 generally available](https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/)
