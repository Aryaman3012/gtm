# Distribution adopters: who spreads Atlan Registry to the pain feelers and buyers

## The core idea

**Dramatic distribution comes from people who *publish* skills to others, not people who *use* them.**

A user adopts alone and spreads slowly. A publisher adopts once, and every one of their consumers pulls a governed skill into their own org. Each install puts Atlan inside a company where the pain feeler (DevEx, Enablement) and the buyer (Head of AI, CDO) already sit.

So Atlan should recruit the **supply side** first. Publishers already feel the gaps from the persona sweep, and they feel them *today*:
- they maintain the same skill on 4+ AI tools
- they can't see who uses it
- they can't push a fix to every copy

---

## The test every adopter must pass

| Test | Why it matters |
|---|---|
| **Can adopt alone.** No IT sign-off, no procurement. | Otherwise it's a sales motion, not distribution. |
| **Gets something for themselves on day 1**, before anyone else joins. | Otherwise nobody starts. |
| **Their use reaches other people's orgs.** | That reach is where the multiplier comes from. |
| **Lands in front of a pain feeler or buyer.** | Otherwise it's reach without revenue. |
| **Has a reason to act now.** | Otherwise it sits on a someday list. |

---

## Ranked adopters

| # | Adopter | Multiplier | Selfish day-1 value | Who they reach | Why now | Verdict |
|---|---|---|---|---|---|---|
| 1 | **AI agencies / implementation partners** | 1 → many client orgs | One place to push updates to every client; usage proof for renewals; protects their IP | **The buyer, directly.** Their client contact is the Head of AI / CoE | GPT migration projects before Dec 11 | 🟢 **Primary** |
| 2 | **SaaS vendors shipping skills** (dbt, Gong, Highspot, Glean, Canva…) | 1 → thousands of customer accounts | Publish once to Claude, ChatGPT, Codex, Cursor and Copilot; usage per customer account; push fixes | Engineers and business users inside enterprises, then DevEx / Enablement | Every vendor is shipping MCP servers and skills this year | 🟢 **Primary (partner-led)** |
| 3 | **Internal publishers** (AI CoE, GTM Enablement AI builders, data team) | 1 → every employee in the account | Skills stay current everywhere; they finally see adoption | They *are* the pain feelers, and they report to the buyer | Custom GPT retirement forces a rebuild anyway | 🟢 **In-account multiplier** |
| 4 | **GPT creators facing retirement** (citizen builders) | 1 → their team | "Migrate once, run everywhere, keep sharing and usage" (OpenAI's migration resets sharing and drops custom actions) | Team lead, then the CoE running the migration | **Hard deadline: Dec 11, 2026** | 🟡 **Event wedge, one-time** |
| 5 | **Open-source skill authors** | 1 → many installs | Installs across tools, analytics, update push | Engineers, then DevEx | Public skill repos are exploding (anthropics/skills ~175k stars) | 🟡 Top of funnel |
| 6 | **Creators / educators** (skill packs, courses) | 1 → large audience | Distribution + analytics for their packs | Mostly individuals and SMBs | — | 🔴 Awareness only |
| 7 | **Solo multi-tool developers** | 1 → 1 | Sync my skills across Claude Code, Codex and Cursor | Their team, slowly | — | 🔴 Real, but not dramatic |

---

## How each one reaches the pain feeler and buyer

### 1. Agencies: the direct line to the buyer
```
Agency builds skills for Client A, B, C… ──publishes via Atlan──▶ each client org
        │ client sees "managed in Atlan: owner, version, usage"
        ▼
Client's Head of AI (the agency's sponsor) ──▶ "can our internal skills live here too?"
```
- **Why it's dramatic:** one agency lands in many orgs, and it lands **at the buyer**. This is the Clay / n8n pattern the brief points to: experts and agencies carry the tool into accounts.
- **Devil's advocate:**
  - Clients may not let client IP sit in a third-party system.
  - Large SIs (Accenture, Deloitte) move slowly and have their own tooling.
- **Fix:**
  - Start with boutique AI agencies (5–50 people).
  - The client owns the workspace and the agency is a publisher into it. That also answers the IP question.

### 2. SaaS vendors: B2B2B distribution
```
Vendor publishes its skill once ──▶ runs in Claude / ChatGPT / Codex / Cursor at customer X
        │ install link resolves without an Atlan account
        ▼
Customer X's DevEx / Enablement sees governed vendor skills in its inventory ──▶ adds their own
```
- **Why it's dramatic:** each vendor brings its whole customer base. Atlan already has a large data-ecosystem partner network (dbt, Snowflake, BI tools), and those partners are shipping skills right now.
- **Devil's advocate:**
  - Vendors can just list in each tool's own marketplace (Claude's partner skills directory, ChatGPT plugins).
  - Vendors may not want Atlan to see their customers' usage.
- **Fix:**
  - The pitch is *"one publish, four marketplaces, and usage per customer account you can't get anywhere else."* Each marketplace only shows its own slice.
  - The vendor sees its own analytics. The customer governs. Atlan stays neutral.
  - Test with 3 friendly data-ecosystem partners first.

### 3. Internal publishers: how one account goes deep
```
Data team publishes "certified revenue metric" skill ──▶ every analyst and seller's Claude / ChatGPT
Enablement publishes "QBR deck" skill            ──▶ every seller
        │ per-skill usage across vendors on one dashboard
        ▼
Head of AI / CDO: the ROI view nobody else can give ──▶ expansion
```
- **Why it matters:** this is where the moat between skills and data lives (a metric changes, and every dependent skill gets flagged).
- It's also the route into Atlan's **existing customers**: the data team is already a user.

### 4. GPT migration: the timed event
- **The event:** every ChatGPT workspace has to repackage its custom GPTs by **Dec 11, 2026** (Feb 11, 2027 for some Enterprise workspaces).
- **The offer:** a one-click "GPT → cross-tool skill" converter that keeps a share link and usage tracking.
- **Who it reaches:** citizen builders (the adopters) and the CoE running the migration (the buyer), at the same time.
- **Devil's advocate:** OpenAI's own migration is free and built in. People under deadline take the default path.
- **Fix:** only pitch it to orgs that use more than one AI tool: *"Migrate once, not twice."* It's a campaign, not a channel. It ends in December.

---

## The recommended bet

- **Primary adopter: skill publishers who serve other orgs.** Agencies first because they reach the buyer directly. SaaS vendors next, starting with Atlan's data partners.
- **In-account multiplier:** internal publishers, starting with data teams at existing Atlan customers.
- **Campaign for the next 10 weeks:** GPT migration, aimed at multi-tool orgs.
- **What makes all of it work:** a **publish-once link that installs into any AI tool without an Atlan account** and reports usage back to the publisher. If Atlan ships only one distribution feature, it should be this.

## Cheapest tests (this week)

1. **Agencies:** DM 10 boutique AI agencies and ask: *"How do you update a skill you've shipped to 8 clients?"* If the answer is "manually, per client, per tool," the channel is alive.
2. **Vendors:** ask 3 data-ecosystem partners how many tool marketplaces they publish skills to, and whether they can see usage per customer.
3. **Migration:** post a GPT → skill converter as a free tool and count how many users come from workspaces running more than one AI tool.

---

## Sources

- [OpenAI: custom GPT retirement FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq)
- [Claude: organization skills and directory](https://claude.com/blog/organization-skills-and-directory)
- [Claude: provision and manage org skills](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization)
- [dbt: semantic layer, MCP server and agent skills](https://www.getdbt.com/blog/ai-ready-data-in-practice-what-dbt-semantic-layer-and-dbt-s-mcp-server-and-agent-skills-do-for)
- [Glean Claude plugins](https://github.com/gleanwork/claude-plugins)
- [Highspot GTM Agent (MCP + Anthropic/OpenAI/Copilot)](https://www.highspot.com/blog/highspot-gtm-agent-spring-launch-2026/)
- Persona sweep and gap analysis: `pain_feeler_sweep.md`
