# Deck fixes: slide copy, ready to drop in

---

## 0. New slide order

| # | Slide | Status |
|---|---|---|
| 1 | Title | keep |
| 2 | The position in five lines | edit (ICP line, see §8) |
| 3 | **What exists today** (1.4) | **new** |
| 4 | Every AI tool governs its own skills. The pain moved to the gaps. (1.5) | edit (§7) |
| 5 | **Proof: GitLab already wrote this down** | **new** |
| 6 | Five triggers (1.3) | keep |
| 7 | **The job to be done** (1.2) | **new** |
| 8 | The first customer (1.1) | edit (§7, §8) |
| 9 | **Who we're not targeting yet** (1.9) | **new** |
| 10 | Artifacts travel; people don't (1.6) | keep |
| 11 | Individuals don't spread tools; hubs do (1.8) | keep |
| 12 | **Sharing is onboarding** | **new** |
| 13 | One primary channel (2.1–2.2) + **where they find tools (1.7)** | edit (add a strip) |
| 14 | Activation means deployment (2.3) | keep |
| 15 | **What Atlan must build or partner on** (2.4) | **new** |
| 16 | Strong channels, better used as amplifiers (2.5) | edit (§5) |
| 17 | Linear across companies, non-linear inside each one (2.6) | keep |
| 18 | **Resources** | **new** (§9) |

The logic now runs: the problem → proof → urgency → who → who not → how it spreads → channel → activation → what Atlan needs → alternatives → scale.

---

## 1a. NEW: What exists today (1.4)

**Label:** 1.4 · WHAT THEY USE TODAY
**Title:** Governance exists. **Inside each tool.**

| Layer | Today | Where it stops |
|---|---|---|
| Files | `CLAUDE.md`, `AGENTS.md`, `.claude/skills`, symlinks | Nothing works across repos or tools |
| AI tool consoles | Claude org skills (review, versions, per-skill usage) · ChatGPT workspace skills · Copilot org instructions · Cursor team rules | Each sees only its own copy |
| Apps with agents | Gong · Salesforce · Highspot | Copies pasted into assistants are forks |
| Cloud registries | AWS Agent Registry · Microsoft Agent 365 · Google · Databricks | Built around their own cloud |

**Footer:** *A year ago the pitch was "you have no governance." Now each tool governs itself, and the problem is everything in between.*

**Source line (links):** [Claude org skills](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization) · [Claude usage analytics](https://claude.com/blog/giving-admins-more-visibility-and-control-over-claude-usage-and-spend) · [ChatGPT skills](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) · [AWS Agent Registry](https://aws.amazon.com/about-aws/whats-new/2026/08/aws-agent-registry-generally-available/) · [Microsoft Agent 365](https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/)

---

## 1b. NEW: Proof slide, GitLab

**Label:** PROOF · A REAL COMPANY
**Title:** GitLab already wrote our thesis **down as policy**

**Left column: what they have**
- Claude Enterprise for every team member, plus Glean, Relevance.ai and GitLab Duo
- One AI Transformation Owner per function, and a champion community per function
- A policy page called *"Prompts are Process"*: every skill must be **shared, versioned, owned**

**Quote card:**
> "If a leader cannot change the way their function operates by changing a process, they have lost control of their strategy."
> GitLab Handbook, *Prompts are Process*

**Right column: where it breaks (their words)**
- The policy is "deliberately tool-agnostic." The tooling is split across 5 platforms.
- Shared skills "have to be symlinked into your local skills directory"
- "Consume before build" has no catalog spanning every tool

**Footer strip:** *Not a one-off: LinkedIn is hiring "AI Builder, GTM Enablement" roles to "consolidate one-off solutions into durable systems."*

**Source line (links):**
[Prompts are Process](https://handbook.gitlab.com/handbook/eta/ai/strategy/prompts-are-process/) · [Hub & Spoke & Hub](https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/) · [AI Transformation Owner](https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/ato/) · [Data team agent setup](https://handbook.gitlab.com/handbook/enterprise-data/ai/agent-setup/) · [LinkedIn AI Builder role](https://www.dreamworkhq.com/job/ab7c2a6f-a327-4d5d-b82f-64261a71ab47)

---

## 2a. NEW: Who we're not targeting yet (1.9)

**Label:** 1.9 · FOCUS
**Title:** Who we're **not** targeting yet

| Not yet | Why |
|---|---|
| Single-AI-tool companies | Their vendor's console is good enough |
| Support teams on Decagon / Sierra | The agent is the product, and it's already governed where it runs |
| Companies under ~200 people | They'll use the free CLI, but there's no second function and no budget owner |
| Companies all-in on one cloud's agent stack | The native registry wins until they add a second tool |
| Sellers and marketers as the entry point | No pain, no install rights. They're reached through hubs. |

**Bottom callout:** *One question qualifies or disqualifies a lead: "How many AI tools are officially allowed, across how many functions?"*

## 2b. NEW: What Atlan must build or partner on (2.4)

**Label:** 2.4 · WHAT ATLAN NEEDS
**Title:** Five things Atlan builds. **Three it partners on.**

**Build (or confirm it exists)**
1. **Import the scan manifest.** A scan becomes a workspace in one step (`atlan-registry-import/1` already exists).
2. **A URL for every skill.** Shared links open it, and whoever opens it gets onboarded.
3. **Publish into every tool:** Claude, ChatGPT, Codex, Copilot, Cursor, Glean.
4. **Usage across vendors,** at whatever depth each tool exposes.
5. **Link skills to data.** Flag a skill when its metric changes. This is the moat.

**Partner**
- **Scanners** (Snyk, Cisco), feeding the approve step
- **Anthropic and OpenAI directories,** as places to publish
- **Cloud registries** (AWS, Google, Microsoft): sync, don't replace

**Footer:** *Everything I built works without Atlan. My card links stand in for #2 until Atlan's exist.*

## 2c. EDIT the channel slide: add "Where they find tools" (1.7)

Add a strip under the existing table:

**WHERE THEY FIND TOOLS**

| Who | Where |
|---|---|
| Engineers | GitHub · npm · HN · X · platform-engineering communities |
| Data teams | dbt community (100K+) |
| Budget owners | LinkedIn · vendors they already pay · their own champion |
| Consumers | They don't look. Tools arrive via plugins and Slack. |

---

## 3. NEW: The job to be done (1.2)

**Label:** 1.2 · THE JOB
**Title:** Three people, **one job at three altitudes**

| Who | In their words |
|---|---|
| **Engineer** (user) | "Keep one version of our AI skills working across every tool and team, and stop being the person everyone asks which one is right." |
| **Process owner** (champion) | "When we change how we work, change it once and have everyone's AI tool pick it up." |
| **Head of AI** (buyer) | "Show the AI investment works, across every tool we pay for, without losing control of how each function operates." |

**Footer:** *Sources: GitLab Handbook · LinkedIn job posts · public developer threads · Atlan's own demo ("whether that investment is working")*

---

## 4. NEW: Sharing is onboarding

**Label:** HOW NON-TECH GETS ONBOARDED
**Title:** Share a link, not a file. **Sharing is onboarding.**

**Visual flow (5 steps):**
1. **Drift report** → an engineer runs the scan
2. **Bridge skill (in Claude / Codex)** → picks skills whose output is used outside engineering. *"Who uses what this skill produces?"*
3. **Slack, with consent** → the user approves every message, and owners approve being named
4. **Atlan link** → opens the skill's page: versions, owner, usage
5. **Sign in with a work account** → the recipient is now in Atlan, on the governed version

**Two callouts:**
- *A file is a copy, and copies are how drift starts. A link is the governed version.*
- *Security-flagged skills are never shared. Companies without Atlan get a neutral card, not Atlan branding.*

---

## 5. EDIT the alternatives slide: native agent recommendations

Replace the "Also weighed" chip row with a third mini-card:

**Native agent recommendations** (the brief's "can Claude recommend Registry?")
- **Strongest case:** it lives where people already work
- **Why not primary:** it only reaches people already using the tool, so it can't do cold discovery
- **Role instead:** **the loop inside the primary channel.** The bridge skill has Claude recommend and share governed skills with teammates, and that's the step that carries adoption from engineers into business teams.

Keep the smaller chips for: Atlan's existing customers (design partners) · Agencies (later) · Builder communities.

---

## 6. Slide order

See §0.

---

## 7. Small fixes

| Slide | Change |
|---|---|
| **Gaps slide title** | "Every AI tool now governs its own skills" → **"The big AI tools now govern their own skills. The pain moved to the gaps."** |
| **Gaps slide chip** | "Apps → assistants" → **"One source for apps and assistants"** |
| **Gaps slide, left label** | Add a one-line example under AI TOOLS & APPS: *"Same skill, 4 copies, 3 versions"* |
| **ICP slide, "which workload leads"** | Add one line under the three chips: *"Coding first (skills live in repos) → knowledge work through hubs → operational agents last."* |
| **Triggers slide, #3** | "13.4% of 3,984 public skills" → **"13.4% of 3,984 skills from ClawHub and skills.sh"** (the actual sample) |

---

## 8. ICP wording (early adopter by job, not title)

**Summary slide, ICP row:**
> The engineer who owns AI tooling for other people: **platform/DevEx** at most companies, or an **internal AI-enablement engineer** where there's an Enterprise AI team, at software companies of ~200–2,000 people that officially allow two or more AI tools.

**ICP slide:**
- **Title:** "The engineer who owns AI tooling **for everyone else**"
- **Inner box:** "Platform / DevEx engineer, **or** internal AI-enablement engineer. Owns tooling for other people and can change shared repos."
- **Small note at the bottom:** *"Not product AI engineers: their problem is production agents, already served by LangSmith and cloud registries."*


---

## 9. NEW: Resources slide (last slide)

**Label:** RESOURCES
**Title:** Sources behind every claim

Four columns, 3–5 links each. The full list with claims mapped is in the answers doc appendix (R1–R42).

| How tools govern today | Real-company proof | Security & registries | Atlan & channel |
|---|---|---|---|
| [Claude org skills](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization) | [GitLab: Prompts are Process](https://handbook.gitlab.com/handbook/eta/ai/strategy/prompts-are-process/) | [Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) | [atlan.com (Agent Skills)](https://atlan.com/) |
| [Claude usage analytics](https://claude.com/blog/giving-admins-more-visibility-and-control-over-claude-usage-and-spend) | [GitLab: Hub & Spoke & Hub](https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/) | [AWS Agent Registry GA](https://aws.amazon.com/about-aws/whats-new/2026/08/aws-agent-registry-generally-available/) | [anthropics/skills](https://github.com/anthropics/skills) |
| [ChatGPT skills](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) | [GitLab: AI Transformation Owner](https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/ato/) | [Microsoft Agent 365](https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/) | [skills.sh](https://skills.sh) |
| [Custom GPT retirement](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq) | [LinkedIn: AI Builder, GTM Enablement](https://www.dreamworkhq.com/job/ab7c2a6f-a327-4d5d-b82f-64261a71ab47) | [Databricks UC skills](https://docs.databricks.com/aws/en/agents/uc-skills/) | [dbt community](https://www.getdbt.com/community) |

**Footer:** *Independent candidate exercise. Accessed Sept 2026.*
