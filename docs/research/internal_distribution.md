# Distribution inside the org: who spreads the registry to the pain feelers and the buyer

## Core idea

Inside a company, dramatic distribution doesn't come from individual users. It comes from **hubs**: people whose job is to get *their* knowledge used correctly by hundreds of colleagues. Think product marketing (PMM) and messaging, the data team and metric definitions, platform engineering (DevEx) and engineering standards.

Today, hubs lose control of their knowledge the moment it's copied into someone's GPT or Claude project. A governed skill fixes that for them:
- one version
- it shows up in everyone's AI tool
- it updates everywhere
- usage proves the hub's work matters

**The hub adopts for its own reasons. Hundreds of people then use its skills. That usage turns into the report the buyer pays for.**

---

## The internal map

```
                        BUYER: Head of AI / AI CoE   (CDO in Atlan accounts)
                                     ▲
                cross-function usage dashboard (owner, version, usage per skill)
                                     │
      PAIN FEELERS: Platform/DevEx lead · GTM Enablement AI builder
                                     ▲
                      "N versions, M users, 1 stale" reports
                                     │
  HUBS (adopters):  Data team · PMM · DevEx · Enablement/RevOps · Legal ops · Brand
                                     │ publish once
                                     ▼
  CONNECTORS:  AI champions network · team leads · Chiefs of Staff · onboarding
                                     │ pass it on
                                     ▼
  CONSUMERS:   every engineer, seller, marketer, analyst, using skills in their own AI tool
```

Consumers are **reached, not recruited.** You recruit hubs and connectors.

---

## Ranking the internal adopters

| # | Adopter (hub) | Reach inside the org | What's in it for them | Path to buyer | Why act now |
|---|---|---|---|---|---|
| 1 | **Data team / analytics engineering** | Everyone who asks a numbers question | Stop wrong numbers. A metric change flags every skill that depends on it. | Direct → CDO (and in Atlan accounts, **already a user**) | A metric gets redefined; people "ask the data" in Claude or ChatGPT |
| 2 | **Product marketing (PMM)** | Sales, CS, marketing: three functions | Messaging stays current in every AI tool; proof that reps actually use it | → Enablement → CRO / CMO → Head of AI | Launch or SKO: new messaging must reach every rep's AI tool |
| 3 | **Platform / DevEx** | Every engineer | Push once to Claude Code, Codex, Cursor and Copilot | They *are* the pain feeler → VP Eng / Head of AI | A second AI coding tool gets rolled out |
| 4 | **GTM Enablement / RevOps** | Every seller | Turn one-off agents into the standard; see adoption | Pain feeler → Head of AI | Custom GPTs retire on **Dec 11, 2026**, so the seller GPT library gets rebuilt anyway |
| 5 | **Legal ops / Brand** | Anyone making customer-facing claims | Approved language gets into skills and stays current | Credibility with the blockers; an approval step for the CoE | Audit, or a bad claim going out |

### Connectors (they spread it, they don't originate it)

| Connector | Why they matter |
|---|---|
| **AI champions network** | Many CoEs already run one: a named champion in every team. **It's a distribution channel the buyer already built.** Give champions the hub skills to roll out. |
| **Onboarding / new joiners** | Every new hire gets their function's skill pack on day 1. Adoption grows with headcount automatically. |
| **Team leads** | Push to their 5–15 people. Slow, but steady. |
| **Chiefs of Staff** | They build skills for the leadership team, which puts the buyer's peers in front of the product. Small reach, high visibility. |

---

## Why it spreads across functions: dependencies

Hubs pull each other in, because skills depend on other skills:

```
PMM "messaging" skill ──used by──▶ Sales "QBR deck" skill ──used by──▶ 300 sellers
Data "revenue metric" skill ──used by──▶ Finance, Sales ops, Exec reporting
Legal "approved claims" ──checked by──▶ Marketing + Sales skills
```

Once one hub is live, every skill that depends on it wants to be governed too. Otherwise, when PMM updates messaging, the sales skill breaks without anyone noticing. **One hub pulls the next.** That's how the registry crosses from tech to non-tech without a separate sale.

---

## Triggers inside the org

1. **A second AI tool rollout.** The day the company adds Claude next to ChatGPT (or Codex next to Copilot), every skill needs a second copy. This is the moment tools start drifting apart.
2. **Custom GPT retirement (Dec 11, 2026).** Every workspace has to repackage its GPTs. Sharing resets, and the CoE owns the project.
3. **Launch or SKO (sales kickoff).** New messaging has to reach every rep's AI tool.
4. **A metric gets redefined.** Every skill that uses the old number is now wrong.
5. **An onboarding cohort.** Day-1 skill packs.

---

## Devil's advocate

| Objection | Answer |
|---|---|
| Hubs already have distribution tools (Highspot for PMM, Confluence, Slack) | Reps increasingly *ask their AI tool* instead of opening Highspot. If PMM's truth isn't in there as a skill, the rep gets an old or made-up answer. The AI tool is becoming the front door. |
| Hubs can't install anything company-wide without IT | True. Internal distribution needs **one admin switch**: the registry plugin enabled in the company's Claude and ChatGPT marketplaces. DevEx or the CoE flips it once, then hubs publish freely. In **existing Atlan accounts**, the vendor is already approved, which is why the data team goes first. |
| Won't Claude's and ChatGPT's own org skills do this? | Yes, inside one tool. Hubs publish to *everyone*, and everyone uses different tools. Only a neutral registry gives the hub one version, and gives the buyer one dashboard. |
| Consumers won't care about governance | They don't need to. They get skills that are visibly better and current. Governance comes along with usage; people don't adopt for it. |

---

## The recommended sequence (in one account)

1. **Enable once:** DevEx or the CoE turns on the registry plugin across the company's AI tools. In an Atlan account, the data team switches it on.
2. **Seed two hubs:** the **data team** (a metric skill) and **PMM** (a messaging skill). One is tech-adjacent and one is non-tech, and between them they reach every function.
3. **Ride the champions network:** each champion rolls the hub skills out to their team, and new joiners get them automatically.
4. **Let dependencies pull:** sales, finance and CS skills that depend on the hub skills get governed next.
5. **Send the report upward:** a cross-function dashboard of skills, owners, versions and usage goes to the Head of AI. That's the buying moment.

## Cheapest test

In 2–3 existing Atlan accounts, ask the data team: *"Which metric do people get wrong most often when they ask an AI tool?"* Turn that metric into a governed skill, publish it, and count how many people across functions use it within 30 days.
