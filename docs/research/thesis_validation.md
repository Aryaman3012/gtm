# Dramatic distribution through internal hubs: validated against the challenge

## 1. What the challenge actually demands

- "Dramatic distribution **before** we optimize for a traditional enterprise sales motion"
- The first **100 activated teams**
- **One** ICP and **one** primary channel, with a defence against the two strongest alternatives
- A channel that "matches how that group **already discovers and adopts tools**," and ideally one with **non-linear scale**
- A campaign that is **ready to run**, plus something built that you can click or run, plus evidence
- It also says you can talk to the Atlan team, which matters for section 5

## 2. Our thesis so far

Inside an org, distribution comes from **hubs**, meaning teams whose knowledge is consumed by hundreds of people: the data team, PMM, DevEx and Enablement. A hub publishes once. Consumers use it in whichever AI tool they have. Skills that depend on it pull other functions in. The usage report goes to the Head of AI, who is the buyer.

## 3. Validation against the brief

| Requirement | Our thesis | Verdict | Gap / fix |
|---|---|---|---|
| Specific group with a painful, current problem | Hubs lose control of their knowledge once it's copied into AI tools | 🟡 Plausible | No interviews yet. Need 5 hub conversations. |
| Individual → team → workspace expansion | Hub publishes → consumers → dependencies → CoE | 🟢 Strong | This is the best part. It answers "how does one become many" inside an org. |
| **Dramatic distribution** | Only inside an org | 🔴 **Gap** | Hubs give *depth*, not *breadth*. Nothing yet gets us into many orgs. |
| Not an enterprise sales motion | The starting point is "someone flips the admin switch" | 🟡 Risk | If every account needs an admin, it becomes sales. The fix is a hub that can start **without** an admin (see 4). |
| One ICP, one channel | Four hubs, no channel | 🔴 **Gap** | Pick one hub and one channel (section 5). |
| Channel matches discovery behaviour | Not defined | 🔴 Gap | Each hub discovers tools in its own professional community (section 4). |
| Built artifact + evidence | None for hubs yet | 🔴 Gap | Reuse the existing skillsdrift CLI engine (section 6). |
| Who not to target | Single-AI-tool orgs; CX on Decagon/Sierra | 🟢 | Keep. |

**The main correction:** the thesis needs **two loops**.
- An **outer loop** that spreads across orgs through the hub's own professional community. This provides the breadth.
- An **inner loop** that spreads within each org through hub publishing and skill dependencies. This provides the depth.

Hubs are perfect for the outer loop because they're the one role in an org that belongs to a strong *professional* community: analytics engineers share dbt packages, PMMs share templates, platform engineers share on GitHub.

## 4. How each hub gets dramatic distribution

| Hub | Where they already discover tools | Free thing that spreads across orgs (outer loop) | How it spreads inside (inner loop) | What makes it non-linear | Trigger |
|---|---|---|---|---|---|
| **Data team** | dbt Community (100K+ members), GitHub, dbt packages, Atlan customers | **Metric → skill kit:** generate governed skills from dbt semantic-layer YAML, plus a CI check that flags stale skills when a metric changes | Every business user asking an AI tool about numbers | One repo covers every metric; every dbt PR shows the check | Metric redefined; "the AI gave the wrong revenue number" |
| **PMM** | LinkedIn creators, the Product Marketing Alliance, templates | **Messaging skill template:** a positioning doc turned into a skill for Claude and ChatGPT | Sales, CS and marketing use it; deck skills depend on it | Three functions per PMM | Launch or SKO |
| **DevEx** | GitHub, HN | skillsdrift CLI (already built) | Every engineer | An org-wide install | A second AI coding tool rolled out |
| **Enablement** | Enablement communities, Gong/Highspot ecosystems | GPT → skill migration kit | Every seller | One library covers every seller | **Dec 11, 2026** GPT retirement |

## 5. Pick one: data team via open source in the dbt ecosystem

**ICP:** analytics engineering / data teams at companies that run dbt (or another semantic layer) **and** have more than one AI tool approved, where business users already ask Claude or ChatGPT numbers questions.

**Channel:** open source in the dbt ecosystem (a dbt package, CLI and CI check), with Atlan's existing customers as the accelerant for the first activations.

**Why it wins:**
1. **The pain is measurable.** A wrong number is a visible, embarrassing failure, not an abstract "drift."
2. **The channel is concentrated.** 100K+ dbt community members, and a package or CI check spreads repo by repo, the same way the brief's own GitHub thesis does.
3. **Atlan's moat is right here.** No AI-tool vendor can link a skill to the lineage of the metric it uses. Atlan already describes "Agent Skills: reusable, versioned, testable units of procedural knowledge" in its Context Engineering Studio, so the registry extends something that already exists.
4. **It skips the permission problem.** The data team owns its own repo and CI, so it can adopt without an admin. In Atlan accounts, the vendor is already approved.
5. **It crosses into non-tech on its own.** Metric skills get consumed by finance, sales ops and executives, so the non-tech spread comes from usage and no separate sale is needed.

**Beats alternative 1, PMM via LinkedIn creators:** PMM pain is fuzzier, and there's no repo or CI moment to hook into. Keep PMM as the **second hub**, pulled in through dependencies.

**Beats alternative 2, the AI tools' own org-skill directories (Claude, ChatGPT):** they're good inside one tool, but they don't know when the data changes. They're a place to distribute to, not something that competes with the data team.

## 6. The artifact (built on what already exists)

Extend the skillsdrift engine into a **metric-skill kit**:
- It reads dbt semantic-layer YAML and produces a skill for each certified metric: the definition, caveats and "use X not Y" guidance. The output works in Claude, Codex and a ChatGPT plugin.
- A **CI check on every dbt PR** leaves a comment like: *"`net_revenue` definition changed. 3 skills and 2 dashboards depend on it. Skills now stale: 3."* Every PR is an exposure to the product, and that's where the non-linearity comes from.
- It uses a share link with a usage counter, which becomes the report that goes to the CDO and Head of AI.
- It runs without Atlan. With Atlan it's upgraded: lineage, certification, one dashboard across AI tools.

## 7. The math, reframed (**confirm with Atlan**)

The original doc needed ~667 orgs, because it assumed **one team per org**. In the hub model, one org produces several activated teams: the data team, then finance, sales ops, PMM and more.

```
activated teams = orgs activated × teams per org
100             = (orgs) × (teams per org)   ← you set the assumptions
```

If multiple teams inside one org count toward the 100, the goal needs far fewer orgs, and the inner loop does most of the work. **Ask Atlan how they count a "team."** The brief invites exactly this question.

## 8. Devil's advocate on the new thesis

| Attack | Answer / residual risk |
|---|---|
| Data teams feed AI through MCP and semantic layers, so skills are redundant | MCP carries the *data*. A skill carries the *how*: which metric to use, what to exclude, when not to answer. It complements MCP. **Test it in interviews.** |
| dbt Labs ships its own agent skills and MCP and could build this | Real risk. Build *on* dbt (a package plus CI) and let dbt keep the semantic layer. Atlan's edge is ownership, lineage, usage across AI tools, and working beyond dbt. |
| Databricks UC skills (Beta) already make skills governed objects | Databricks-only. Target dbt-first and multi-warehouse teams. |
| Are business users actually asking AI tools numbers questions today? | Likely, but it's an assumption. Measure it by counting metric-skill invocations in the pilot. |
| The spread to non-tech via dependencies is theoretical | Instrument it: count distinct functions using a data-team skill within 30 days. If it's one function, the crossing failed. |
| Using Atlan's installed base is a sales motion | Only for the first activations. The outer loop (dbt OSS) is what makes it dramatic. Report the two separately. |
| It narrows the product to data | This is the entry point, not the ceiling. PMM and Enablement follow, and the dependency graph is how. |

## 9. Campaign (ready to run) and gates

- **Audience:** analytics engineers in the dbt community at orgs with more than one AI tool.
- **Offer:** "Your metrics, as skills every AI tool uses correctly, and a PR check that tells you when they go stale."
- **Assets:** a dbt package + CLI + GitHub Action, a 60-second demo, and a data-drop: *"We scanned N public dbt projects: X% of metrics have no description an AI could use."* This one is real data from public repos.
- **Launch:** dbt Slack (#tools-and-integrations), a Coalesce talk submission, awesome-dbt, LinkedIn data creators, and 3–5 existing Atlan accounts as design partners.
- **Continue:** ≥20 repos running the CI check within 30 days, and ≥1 design partner with a metric skill used by 2+ functions.
- **Change:** installs happen but skills aren't used, which means the pain is in the PR check and not in AI answers. Reposition to "metric change impact."
- **Stop:** fewer than 5 of 10 interviewed data teams report AI-answer errors on metrics.

## 10. Bottom line

| | |
|---|---|
| ✅ Holds | Hubs are the right way to spread inside an org, and dependencies are how the registry crosses from tech into non-tech. |
| ✅ Fixed | Dramatic distribution comes from the hub's professional community (the outer loop). Pick one hub: the **data team, via dbt OSS**. |
| ⚠️ Unproven | Whether data teams feel AI-answer pain *now*, and whether metric skills get pulled into other functions. |
| ❓ Ask Atlan | Does a "team" mean a team within an org or an org? That changes the whole target. |

**Next 3 moves:**
1. Run 5 data-team interviews, 2 of them at Atlan customers.
2. Ship the metric-skill kit on top of skillsdrift.
3. Get the definition of "team" from Atlan.

---

## Sources

- [dbt Community: 100K+ members](https://www.getdbt.com/community)
- [Atlan homepage: Context Engineering Studio "Agent Skills"; Workday quote](https://atlan.com/)
- [dbt: semantic layer, MCP server and agent skills](https://www.getdbt.com/blog/ai-ready-data-in-practice-what-dbt-semantic-layer-and-dbt-s-mcp-server-and-agent-skills-do-for)
- [Databricks UC skills (Beta)](https://docs.databricks.com/aws/en/agents/uc-skills/)
- [OpenAI: custom GPT retirement FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq)
- Challenge brief: *GTM Candidate Challenge 2.pdf*
- Prior work: `pain_feeler_sweep.md`, `internal_distribution.md`
