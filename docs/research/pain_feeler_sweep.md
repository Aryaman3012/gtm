# Pain feelers for Atlan Agent Registry: tech and non-tech sweep

*How I ran the loop:* for each persona I set out their job, their tools, what's already on the market, and where the problem actually shows up. Then I pushed back on my first take and wrote down the revised verdict.

---

## The finding that reframes everything

**Inside one vendor, the pain is already mostly solved.** Since July 2026, Claude Team/Enterprise has org skills, a review-before-publish workflow, version history, auto-propagation of approved versions, group targeting and skill scanning, plus **per-skill usage and cost** in admin analytics. ChatGPT has workspace skills with owners, scanning and invocation counts. Salesforce, Decagon, Sierra, Glean and Rovo all version and approve inside their own apps.

**The pain lives in the gaps between tools.** Every persona below hits some combination of six:

| Gap | What breaks |
|---|---|
| **1. Between AI tools** | The same skill lives in Claude, ChatGPT/Codex, Copilot and Cursor. Each admin console only sees its own copy, so the versions drift apart. |
| **2. Between business apps and AI tools** | Gong, Harvey and Decagon govern skills well inside their own apps. Once someone copies one into Claude, it becomes an ungoverned fork. |
| **3. Between skills and data** | A skill that encodes a metric, a price or a policy goes stale when the underlying data changes, and nothing links the two. |
| **4. Measurement** | Usage is reported per vendor. Nobody can say "this skill ran 4,000 times across 3 tools and here's the outcome." |
| **5. Security** | Scanners flag risky skills, but there's no step to approve a version, pin it and revoke it everywhere at once. |
| **6. Migration** | Custom GPTs retire **Dec 11, 2026** and become plugins. Sharing settings reset and custom actions don't carry over, so every enterprise has to repackage its GPTs right now. |

**What this means for targeting:** don't target single-harness orgs. Their vendor's own console is good enough. Pain grows with the **number of AI tools × the number of functions** using them.

---

## Summary

| # | Persona | Pain | Already solved? | Where it breaks | Role in the deal |
|---|---|---|---|---|---|
| X1 | Head of AI / AI CoE | 🔴 High | Partly (Larridin, Agent 365, vendor dashboards) | 1, 4 | **Buyer** |
| T1 | Platform / DevEx lead | 🔴 High (if several AI tools) | Per vendor + sx / Tessl (small) | 1, 5 | **Pain feeler → champion** |
| X2 | CDO / data governance | 🟠 Rising | Databricks UC skills (Beta) | 3 | **Buyer, and already Atlan's customer** |
| N1 | GTM Enablement / RevOps AI builder | 🟠 Medium-high | Inside apps (Gong, Salesforce, Glean) | 2, 1, 6 | **Pain feeler (non-tech)** |
| T3 | AppSec | 🟠 Medium-high | Crowded with scanners | 5 | Blocker who can become an ally |
| N2 | Marketing / brand ops | 🟡 Medium | Brand context via MCP (Jasper, Typeface) | 2, 3 | Second function to expand into |
| T2 | AI platform engineer (prod/CI) | 🟡 Medium | Cloud registries (AWS, Google, Databricks) | 1, 4 | Integration, not a wedge |
| T4 | EM / tech lead | 🟡 Low-medium | Git + in-repo files | 1 | Wedge user |
| N4 | Legal ops | 🟡 Low-medium | Inside apps (Harvey, Legora) | 2 | Blocker, later function |
| N3 | CX / support ops | ⚪ Low | Well solved (Decagon, Sierra) | none | **Don't target** |

---

## Tech personas

### T1: Platform / DevEx lead
- **Owns:** rolling out Claude Code, Codex, Cursor and Copilot; developer productivity; the internal tooling budget.
- **Goals:** adoption, time saved, fewer "works on my machine" problems, no security incidents.
- **Tools:** Claude Code plugin marketplaces + managed settings, Codex `requirements.toml`, Cursor team rules, Copilot org custom instructions (GA Apr 2026), AGENTS.md, git.
- **Already on the market:** each vendor's admin plane. Cross-tool options are sx by Sleuth (open-source, 13+ clients, adoption stats) and Tessl (skill registry with evals). JFrog has a skills registry with a security angle.
- **Where it breaks:** one "house conventions" skill has four copies, one per tool, each with its own admin console and none tied to the others. sx is the nearest fix but it's early-stage and has no enterprise depth.
- **Loop:**
  - *My first take:* this is the core ICP.
  - *Pushback:* if the org standardises on Claude only, native org skills solve it.
  - *Verdict:* **this persona is the core ICP only in orgs using several AI tools.** Qualify every lead with one question: "How many AI coding tools are officially allowed?"

### T2: AI platform engineer (agents in production and CI)
- **Owns:** agent runtimes, CI bots, evals, tracing, cost.
- **Goals:** reliability, the cost of each run, being able to reproduce which version ran.
- **Tools:** LangSmith / Langfuse / Arize / Braintrust, the AWS AgentCore / Google / Microsoft Foundry registries, MCP gateways.
- **Already on the market:** the AWS Agent Registry (GA Aug 31, 2026) covers agents, tools, skills and MCP with approval workflows. Google's Skill Registry is in preview. Databricks has UC skills (Beta). LangSmith Fleet skills exist, but version pinning is only planned.
- **Where it breaks:** each cloud registry covers its own cloud, and none reaches developers' laptops. The same skill runs locally in Claude Code and in production on Bedrock, and the two are governed separately.
- **Loop:**
  - *My first take:* strong pain.
  - *Pushback:* these engineers already get approval flows from their cloud and will pick native tools.
  - *Verdict:* **integrate with the cloud registries (sync, don't replace).** This persona isn't the wedge.

### T3: AppSec / security engineer
- **Owns:** supply chain, secrets, prompt-injection risk, audit.
- **Goals:** no incidents, a complete inventory, passing audits.
- **Tools:** Snyk agent-scan, Cisco skill-scanner, Palo Alto Prisma AIRS, Zenity, Noma, Agent 365 / Defender.
- **Evidence the pain is real:** Snyk's ToxicSkills study found critical issues in **13.4% of 3,984 public skills**, with 76 malicious payloads confirmed. The first malicious MCP server appeared on npm in Sept 2025.
- **Where it breaks:** scanners find a bad skill but can't answer "who owns it, which approved version should be running, and how do I revoke it everywhere at once?"
- **Loop:**
  - *My first take:* AppSec could buy.
  - *Pushback:* their budget goes to scanners, and this market is crowded.
  - *Verdict:* **partner with the scanners, don't compete** (plug Snyk or Cisco into the registry's approval step). AppSec then turns from blocker into ally.

### T4: Engineering manager / tech lead
- **Owns:** consistency across the team, code review quality, onboarding new hires.
- **Tools:** in-repo CLAUDE.md, AGENTS.md and `.claude/skills`, CodeRabbit, Claude Code Review (preview).
- **Where it breaks:** the files drift apart across repos, and nobody can see which version each tool actually loaded.
- **Loop:**
  - *My first take:* this is the original doc's "accidental owner".
  - *Pushback:* git already versions these files well enough for one team.
  - *Verdict:* **this person is where adoption starts, not who feels the pain most.** It only gets painful once there are many teams and many tools, and at that point it's T1's problem.

---

## Non-tech personas

### N1: GTM Enablement / RevOps AI builder
- **Owns:** seller workflows (account research, QBR decks, objection handling) and turning one-off agents into standard ones. Example: LinkedIn's open *AI Builder, GTM Enablement* roles, which use Claude Code and are tasked with "consolidat[ing] one-off solutions into durable systems."
- **Goals:** seller adoption, ramp time, a consistent pitch, win rate.
- **Tools:** Gong (custom agents GA June 2026, plus Gong's MCP server), Highspot GTM Agent, Seismic Aura, Salesforce Prompt Builder, Glean Agents, ChatGPT Enterprise, Claude.
- **Already on the market:** Salesforce Prompt Builder has proper versioning (locked once activated), but only inside Salesforce. Glean has version checkpoints and rollback. Gong's agents run only inside Gong.
- **Where it breaks:**
  - Sellers live in Claude and ChatGPT, but the governed versions live inside Gong or Salesforce. Every copy out is a fork.
  - The custom GPT retirement forces the whole seller-GPT library to be rebuilt by December.
- **Loop:**
  - *My first take:* this is the non-tech pain feeler.
  - *Pushback:* Gong and Salesforce are pushing their context *into* Claude over MCP, which could close the gap.
  - *Verdict:* **it's still a gap.** MCP moves *data*, not governed *skills*. The custom GPT migration is the timely trigger: "move your GPT library once, into a registry that works across tools."

### N2: Marketing ops / brand and content lead
- **Owns:** brand voice, approved messaging and claims, content throughput.
- **Goals:** consistency, speed, no off-brand or unapproved claims going out.
- **Tools:** Writer (Skills + Playbooks), Jasper (brand voice pushed to Claude, ChatGPT and Copilot via MCP), Typeface Arc Graph (Sept 2026), Adobe, Canva brand kits.
- **Where it breaks:** brand *context* now reaches the AI tools, but the *skills* built on it (the "GTM deck skill" from the Atlan demo) don't. Messaging changes and the skills keep the old version.
- **Loop:**
  - *My first take:* medium pain.
  - *Pushback:* brand vendors are moving quickly toward working inside Claude and ChatGPT.
  - *Verdict:* **this is the second function to expand into, not the first.** It becomes valuable when a skill depends on a messaging doc that marketing owns (the gap between skills and data, for content).

### N3: CX / support ops lead
- **Tools:** Decagon (git-based versioning, approvals, comparing versions), Sierra (QA → staging → prod snapshots), Intercom Fin Procedures, Zendesk, Guru.
- **Loop:**
  - *My first take:* support has lots of procedures, so it should be a target.
  - *Pushback:* the support agent is the product, and it runs inside one vendor that already governs it well.
  - *Verdict:* **don't target** (this answers "who not to target yet"). The one exception is teams using Claude or ChatGPT internally for escalations.

### N4: Legal ops / compliance
- **Tools:** Harvey (workflow builder with admin approval), Legora, Ironclad (playbooks stay in the app; its MCP server only exposes search), Spellbook (Word only).
- **Where it breaks:** approved language lives in Harvey or Ironclad. Sales and marketing skills that make claims never check against it.
- **Verdict:** **treat legal as a blocker you design for.** Its pain shows up as a reason *other* functions need governance ("which skills make customer-facing claims, and who approved them?").

---

## Personas that span functions

### X1: Head of AI / AI CoE / transformation lead (the persona in Atlan's demo)
- **Owns:** AI seat spend across vendors, adoption across functions, ROI to the CEO and CFO.
- **Goals:** show the investment is working, cut unused seats, stay safe.
- **Tools:** Claude Enterprise analytics (per-skill usage and cost since Jul 2026), ChatGPT Enterprise analytics, Microsoft Agent 365 ($15/user/mo, GA May 2026) + Viva Copilot analytics, ServiceNow AI Control Tower, Larridin / Worklytics (adoption across vendors), Credal.
- **Where it breaks:** each dashboard covers one vendor. Larridin measures across vendors but doesn't govern. Agent 365 inventories agents, not skills. Nobody can answer "which of our skills are used, owned, current and paying off, across every tool?"
- **Loop:**
  - *My first take:* this person is the buyer.
  - *Pushback:* Agent 365 and ServiceNow already have their budget and attention.
  - *Verdict:* **still the buyer.** Those tools stop at the level of agents and identity. The skill-level ROI view across vendors is the report only Atlan can produce, and it's what the demo already shows.

### X2: CDO / data governance lead (Atlan's existing buyer)
- **Owns:** metric definitions, glossary, certification, lineage, and now "context for AI."
- **Goals:** trusted AI answers, one version of the truth, compliance.
- **Tools:** Atlan (MCP server, versioned and certified Context Repos from Activate 2026), Collibra AI Command Center, Snowflake Horizon Context, dbt semantic layer + MCP + skills, Databricks Unity Catalog.
- **Already on the market:** **Databricks UC skills (Beta)** are the closest direct threat: skills as governed catalog objects with the same permissions and audit as tables, loaded over MCP.
- **Where it breaks:** a skill hardcodes "revenue = X." Finance redefines revenue. The skill keeps producing the old number, and nobody knows which skills depend on that metric.
- **Loop:**
  - *My first take:* this is a side persona.
  - *Pushback:* this is the persona where Atlan wins without a fight. It already sells to them, and no AI-tool vendor can link a skill to how data flows into it.
  - *Verdict:* **promote this persona.** It gives the fastest route into existing accounts (the biggest miss in the original doc) and the most defensible moat, provided it beats Databricks to it.

---

## The line through the org, revised

```
Adoption starts with: EM / tech lead, seller-builder     (they create the skills)
        │ drift across AI tools + usage visible in scan/share link
        ▼
Pain feeler:      Platform/DevEx lead  |  GTM Enablement AI builder
        │ per-skill report across vendors: owner, version, usage
        ▼
Buyer:            Head of AI / CoE     ← CDO (existing Atlan relationship) opens the door
        │
Blockers who become allies: AppSec (scanners plug in), Legal (approved claims)
```

## What changed from the earlier thesis

1. **Who not to target:** single-harness orgs and CX teams on Decagon or Sierra.
2. **Qualifying question:** "How many AI tools are officially allowed, across how many functions?"
3. **Timely trigger:** the custom GPT retirement on Dec 11, 2026.
4. **Moat:** the link between skills and data, sold through the CDO relationship Atlan already has. Databricks is the one to watch.
5. **Partner, don't fight:** scanners (Snyk, Cisco) and cloud registries (AWS, Google).

---

## Sources

- [Claude: provision and manage org skills](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization)
- [Claude: admin visibility on usage & spend (Jul 2, 2026)](https://claude.com/blog/giving-admins-more-visibility-and-control-over-claude-usage-and-spend)
- [Claude Code: plugins for orgs](https://code.claude.com/docs/en/plugins/org)
- [OpenAI: skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)
- [OpenAI: custom GPT retirement FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq)
- [GitHub: Copilot org custom instructions GA](https://github.blog/changelog/2026-04-02-copilot-organization-custom-instructions-are-generally-available/)
- [Cursor: rules](https://cursor.com/docs/rules)
- [sx by Sleuth](https://github.com/sleuth-io/sx) · [Tessl skills](https://tessl.io/blog/skills-are-software-and-they-need-a-lifecycle-introducing-skills-on-tessl) · [JFrog skills registry](https://jfrog.com/ai-catalog/skills-registry/)
- [AWS Agent Registry GA](https://aws.amazon.com/about-aws/whats-new/2026/08/aws-agent-registry-generally-available/) · [Google Skill Registry](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/skill-registry)
- [Databricks UC skills](https://docs.databricks.com/aws/en/agents/uc-skills/) · [Databricks AI governance, DAIS 2026](https://www.databricks.com/blog/ai-governance-data-ai-summit-2026-whats-new-unity-ai-gateway)
- [Microsoft Agent 365 GA](https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/)
- [LangSmith Fleet skills](https://www.langchain.com/blog/skills-in-langsmith-fleet)
- [Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) · [Snyk agent-scan](https://github.com/snyk/agent-scan) · [Cisco skill-scanner](https://github.com/cisco-ai-defense/skill-scanner) · [Zenity](https://zenity.io/blog/coding-agent-attack-surface) · [First malicious MCP server](https://thehackernews.com/2025/09/first-malicious-mcp-server-found.html)
- [Gong Revenue Harness](https://www.gong.io/press/gong-launches-mission-big-dipper-revenue-harness) · [Highspot GTM Agent](https://www.highspot.com/blog/highspot-gtm-agent-spring-launch-2026/) · [Salesforce Prompt Builder versions](https://help.salesforce.com/s/articleView?id=sf.prompt_builder_use_multiple_versions.htm&language=en_US&type=5) · [Glean Agents](https://www.glean.com/blog/glean-agents-go-2026)
- [Writer Skills & Playbooks](https://writer.com/blog/writer-agent-skills-playbooks-press-release/) · [Jasper MCP](https://www.prnewswire.com/news-releases/jasper-introduces-mcp-server-to-power-ai-content-workflows-with-built-in-marketing-context-and-governance-302564495.html) · [Typeface Arc Graph](https://ppc.land/typeface-carries-enterprise-brand-rules-into-claude-and-chatgpt/)
- [Decagon versioning](https://decagon.ai/resources/decagon-agent-versioning) · [Sierra Agent Studio 2.0](https://sierra.ai/blog/agent-studio-2-0) · [Intercom Fin Procedures](https://www.intercom.com/help/en/articles/13617008-fin-procedures-faqs) · [Guru MCP](https://www.getguru.com/features/mcp-server)
- [Harvey workflow builder](https://help.harvey.ai/articles/workflow-builder) · [Ironclad MCP](https://support.ironcladapp.com/hc/en-us/articles/39887091143319-Ironclad-MCP-Server)
- [ServiceNow AI Control Tower](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-expands-AI-Control-Tower-to-discover-observe-govern-secure-and-measure-AI-deployed-across-any-system-in-the-enterprise/default.aspx) · [Larridin](https://larridin.com/blog/tools-to-monitor-ai-usage-at-work) · [Credal Agent Registry](https://credal.ai/products/agent-registry)
- [Atlan Activate 2026](https://atlan.com/know/context-layer-stopped-being-theoretical-activate-2026/) · [Collibra AI Command Center](https://www.collibra.com/company/newsroom/press-releases/collibra-launches-ai-command-center-to-scale-agentic-ai) · [Snowflake Horizon](https://www.snowflake.com/en/news/press-releases/snowflake-advances-trusted-ai-with-snowflake-horizon-catalog-centralizing-governance-context-and-security-across-the-enterprise/) · [dbt semantic layer + skills](https://www.getdbt.com/blog/ai-ready-data-in-practice-what-dbt-semantic-layer-and-dbt-s-mcp-server-and-agent-skills-do-for)
