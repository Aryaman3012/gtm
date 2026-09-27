# Running the internal loop at a real org: GitLab

**Why GitLab and not HubSpot:** both are Atlan customers (both logos are on atlan.com), but only GitLab publishes how it runs AI internally, in its public handbook. HubSpot has no public equivalent.

**One correction:** GitLab's analytics dbt repo is **no longer public**. The API now returns `404 Project Not Found` without login. So this run uses the public handbook, not their dbt code.

---

## 1. What GitLab already has (all from its public handbook, June–Sept 2026)

| | What exists |
|---|---|
| **AI platforms** | **Claude Enterprise** (every team member), **Glean** (knowledge + personal automation), **Relevance.ai** (company-wide autonomous agents), **GitLab Duo Agent Platform** with its own AI Catalog. The data team also uses **OpenCode** running on Duo, alongside Claude Code. |
| **Operating model** | **"Hub & Spoke & Hub."** *Enterprise AI* (under the CIO) is the platform hub. Each function gets an **AI Transformation Owner (ATO)**. Each function also has a **Champion** community (people spending 5–10% of their time on it). |
| **Doctrine** | **"Prompts are Process."** Every prompt, skill, plugin or agent is process, so it must be **shared, versioned, owned**. There are three scopes: *function*, *repo*, *company-wide*. The posture is *guided creation*, and the rule is *consume before build*. |
| **How skills are distributed today** | Claude **role-based plugins** ("every team member in the function gets it the next morning"), `.claude/skills` inside repos, **symlinks** for skills shared across repos, Glean skills, Relevance agents, and a Slack intake channel (#enterprise-ai-collab) |
| **Metrics** | An AI Literacy Ladder (tracks reach, depth, applied value). A 22.3% rise in daily AI tool interactions one month after launch (GitLab blog, Sept 2026). |

**The headline finding:** GitLab has independently written Atlan's thesis down as policy. The problem is that the system underneath it is split across five places.

> *"This page is deliberately tool-agnostic… a skill built in Glean, a skill built in Claude, or a fully autonomous agent… the same logic applies."*: GitLab handbook, *Prompts are Process*

The policy works across tools. The tooling doesn't.

---

## 2. GitLab's org map (real roles)

| Seat | Who at GitLab | Notes |
|---|---|---|
| **Buyer** | **Director, Enterprise AI** (in Enterprise Technology & AI, under the CIO) | Owns the AI platforms, governance and security review, and the standards across functions |
| **Pain feelers** | **ATOs**, one per function | They "maintain the canonical skills, prompts, and agents used by the function," gate what people build inside the function, and report value to the exec sponsor |
| | **Enterprise AI engineers** | Build skills, agents and integrations that any function can use |
| **Hubs** | **Sales ATO** | Owns the canonical call-prep skill, which is the handbook's own example |
| | **Data team** | Shared skills across 4 repos, in the Agent Skills format, used in both Claude Code and OpenCode |
| | **ETA** | The interim home for skills that serve the whole company |
| **Connectors** | Champions (one per sub-team), #enterprise-ai-collab, #ai-at-gitlab, role-based plugins | |
| **Consumers** | Every team member, on Claude, Glean or Duo | |

---

## 3. Exactly where it breaks at GitLab (in their own words)

1. **The same process lives in five places.** Claude plugins, Glean skills, Relevance agents, the Duo AI Catalog and repo skills. The governance rules are mapped separately for each platform (there's a "Governance posture: platform mapping" section for Claude and Glean).
2. **"Consume before build" has no catalog across tools.** To check "has this already been built?", people have to ask in Slack or submit an intake form. GitLab's own warning: *"the largest risk is every function quietly rebuilding the same capability."*
3. **Skills shared across repos use symlinks.** They *"have to be symlinked into your local skills directory… Follow the setup steps in that repo's README."* This is the same drift workaround from the original research.
4. **There's no way to promote a skill from one scope to another.** Their own test says a repo skill that's *"useful to people who never touch this repo"* belongs at function scope. But moving it from git into a Claude plugin or Glean means copying it, and a copy is a fork.
5. **Value reporting is split up.** ATOs have to *"report value back to the exec sponsor,"* but usage sits separately in Claude analytics, Glean, Relevance and Duo.
6. **There's leftover shadow process.** The public *Claude.ai Tips* page still has a copy-paste prompt library organised by division. Their own doctrine calls this *"shadow process."*
7. **Conflicting sources of truth.** Glean was brought in partly because *"multiple 'sources of truth' sometimes disagree."*

---

## 4. Running the loop at GitLab, step by step

*The "Signal" column says what to watch. You set the thresholds.*

| Step | Who | Where | Action | Signal |
|---|---|---|---|---|
| **0. Map** | Atlan CSM + Director, Enterprise AI | Existing Atlan relationship | A read-only inventory across Claude org skills and plugins, Glean, repo skills and the AI Catalog, framed around GitLab's own five proposal questions | Number of skills, number of surfaces, duplicates, skills with no owner |
| **1a. Seed: data team** | Data team | `data-team-agentic-skills` | Replace the symlink + README step with one governed install into both Claude Code and OpenCode | Data team members on the current version, with no symlinks |
| **1b. Seed: Sales ATO** | Sales ATO + AI Engineer | Claude role-based plugin, plus Glean | Publish the canonical call-prep skill **once**, to both platforms | AEs running the canonical version, on either tool |
| **2. Pull** | Champions | Champion syncs, #enterprise-ai-collab | Search before building, across every surface: "does this already exist?" | Search hits that stop a duplicate from being built |
| **3. Signal** | ATOs | Monthly value report to the exec sponsor | Per-skill usage across Claude, Glean and OpenCode, by function | Functions with a governed skill in real use |
| **4. Push** | Enterprise AI | Role-based plugins (already how they distribute) | The registry becomes the **source** the plugins pull from | Time from approval to "everyone has it" |
| **5. Spread** | VP Sales → Sales ATO | The handbook's own scenario: "shift the sales motion" | Update the qualification skill once. Skills that depend on it (call prep, messaging, metrics) get flagged, and their owners (PMM, data team) are pulled in. | New hubs pulled in by dependencies |
| **6. Govern** | ATOs + Enterprise AI | Their five-question proposal flow | Proposals become a promotion workflow: personal → repo → function → company | Proposals reviewed, and skills promoted |
| **7. Buy** | Director, Enterprise AI | Planning / renewal | One catalog and one value report across all 5 platforms, with the ATOs as daily users | Budget decision |

---

## 5. GitLab's doctrine, mapped to what the registry does

| GitLab says (Prompts are Process) | Registry feature |
|---|---|
| "Shared, not siloed" | Publish once to Claude, Glean, OpenCode and Duo |
| "Versioned, not improvised" | Versions, pinning, a diff and a review for every change |
| "Owned, not orphaned" | A required owner field, backup owner, staleness alerts |
| Three scopes: repo / function / company | Workspaces, and promotion between scopes without copying |
| "Consume before build" | Search and merging of duplicates across every surface |
| "Is the process versioned and reviewable?" | Branch → review → merge → roll out, for skills that aren't in git |
| The ATO "reports value back to the exec sponsor" | Per-skill usage across platforms, by function |
| "Guided creation": personal → canonical is gated | Personal workspace → proposal → the owner approves |
| A VP changes the motion, and "every AE picks up the new behaviour" | Update once, dependent skills get flagged, and every tool gets the new version |

**This table is the pitch to GitLab:** *"Prompts are Process, with the tooling to match."*

---

## 6. Devil's advocate: GitLab-specific

| Risk | Assessment |
|---|---|
| **GitLab eats its own cooking.** It sells the Duo AI Catalog and calls itself "Customer Zero." | 🔴 Real. But per GitLab's docs, the AI Catalog covers agents, flows and MCP servers *inside GitLab*. It doesn't cover Claude or Glean skills. Pitch Atlan as the layer that sits *across* platforms, with Duo as one destination. |
| **Plugins + git may be good enough for now.** The data team says there are *"still NOT many skills."* | 🟡 The pain grows with the number of skills. Their Champion network is designed to create a lot more of them, so the timing is early rather than wrong. |
| **The data team's skills are dev tools, not business-facing.** Business users get data answers through Glean. | 🟡 At GitLab the **Sales ATO** is the stronger non-tech hub. The data team is a hub for engineers. That updates our earlier "data team first" call: **the first hub is whoever owns canonical process**, and that's the ATO. |
| **The buyer sits in the CIO org**, so this looks like an IT purchase | 🟢 That's fine inside one org. The spread still happens bottom-up through the ATOs and Champions. |
| **The public handbook isn't the whole picture.** The internal handbook may already solve some of this. | 🟡 That's why step 0 is a *question* to GitLab, not an assumption. |

---

## 7. What this changes in our thesis

1. **The real pain feeler has a real title: AI Transformation Owner** (with AI Champions as the connectors). GitLab is hiring for it right now. It's a searchable role, so it doubles as a target list.
2. **The hub is whoever owns canonical process in a function.** Sometimes that's the data team. At GitLab, it's the ATO.
3. **Use the customer's own words.** "Prompts are process" is sharper than "skill governance."
4. **Qualifying signal:** orgs that publish an AI operating model (ATOs, Champions, "consume before build") *and* run 2+ AI platforms. GitLab runs five.

## 8. Three questions to take to GitLab (via Atlan's existing relationship)

1. "When an ATO wants to check whether something already exists, where do they look today, across Claude, Glean, Relevance, Duo and repos?"
2. "When the VP of Sales shifts the motion, how many places does the call-prep process have to change?"
3. "How does an ATO report value per skill to their exec sponsor today?"

---

## Sources (GitLab public handbook unless noted)

- [Enterprise AI](https://handbook.gitlab.com/handbook/eta/ai/)
- [Hub & Spoke & Hub](https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/)
- [AI Transformation Owner](https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/ato/)
- [Prompts are Process](https://handbook.gitlab.com/handbook/eta/ai/strategy/prompts-are-process/)
- [Guiding Principles](https://handbook.gitlab.com/handbook/eta/ai/strategy/guiding-principles/)
- [AI tools: Claude](https://handbook.gitlab.com/handbook/eta/ai/tools/claude/) · [Glean](https://handbook.gitlab.com/handbook/eta/ai/tools/glean/) · [Relevance.ai](https://handbook.gitlab.com/handbook/eta/ai/tools/relevance-ai/)
- [Data team: AI Agent Setup](https://handbook.gitlab.com/handbook/enterprise-data/ai/agent-setup/) · [Agentic Tool Development](https://handbook.gitlab.com/handbook/enterprise-data/ai/agentic-tool-development/)
- [Claude.ai Tips (legacy prompt library)](https://handbook.gitlab.com/handbook/tools-and-tips/ai/claude/)
- [GitLab blog: How GitLab fosters AI-fluent teams (Sept 2, 2026)](https://about.gitlab.com/blog/how-gitlab-fosters-ai-fluent-teams/)
- [GitLab blog: AI Catalog (Jan 14, 2026)](https://about.gitlab.com/blog/ai-catalog-discover-and-share-agents/)
- [Atlan homepage (customer logos)](https://atlan.com/)
