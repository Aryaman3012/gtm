# Atlan Agent Registry: answers to the core challenge

*Aryaman Singh · GTM candidate work sample · 27 Sep 2026 · Independent exercise, not affiliated with Atlan.*

Sections 1 and 2 are complete. Each answer gives the position, the reasoning behind it (including the alternatives I rejected), and the evidence. Section 3 is the campaign, still being finished.

---

## The position in five lines

- **ICP:** platform and developer-experience (DevEx) engineers at software companies of ~200–2,000 people that officially allow two or more AI coding or assistant tools.
- **Primary channel:** open-source, GitHub-native distribution. A free local CLI (`skillsdrift`) and a public "State of Skill Drift" data drop, launched where those engineers already find tools.
- **Why now:** every AI tool now governs its own skills, so the pain has moved to the gaps. It sits between tools, between business apps and assistants, and between skills and the data they encode.
- **How one becomes many:** inside each company, adoption spreads from the engineer to the teams whose skills others depend on. They share links to the governed version instead of copies. A champion confirms the spread by installing the GitHub App, and the Head of AI buys.
- **Validation:** 3–5 existing Atlan customers act as design partners to prove activation. They are where I prove the loop works, not where I acquire the first 100.

## Still open (section 3)

| # | Gap | Where |
|---|---|---|
| G1 | Nothing is live yet: domain, npm, waitlist | 3.1, 3.5, 3.10 |
| G2 | Atlan hasn't defined "team" | 3.8 |
| G3 | Continue / change / stop thresholds not set | 3.9 |
| G4 | Atlan capabilities unconfirmed: per-skill URLs, manifest import, sandbox workspace | 2.4, 3.5 |

---

# Section 1: the first customer

## 1.1 Who is the narrowest credible early adopter?

**Answer.** The early adopter is **platform and DevEx engineers at software companies of roughly 200–2,000 people that officially allow two or more AI coding or assistant tools** (e.g. Claude Code alongside Copilot, or ChatGPT alongside Cursor), and whose repos already hold shared agent instructions.

This is the single ICP. Every other role in 1.6 (champion, budget owner, blockers) describes how a deal moves through the company. None of them is a second ICP.

Four qualifiers define the segment, and each one does work:

| Qualifier | Why it's there | What happens without it |
|---|---|---|
| **Platform / DevEx engineer** | They own "tooling for other engineers". They get asked "which version of this skill is right?" and can put changes into shared repos. | A random engineer feels drift in their own repo but has no mandate to fix it for others |
| **≥2 AI tools officially allowed** | Inside one tool, the vendor now governs skills (1.4). Drift across tools is the part nobody owns. | Single-tool companies are well served by their vendor's admin console |
| **~200–2,000 people** | Big enough for several teams and functions to use AI and for someone to own an AI budget. Small enough that a bottom-up tool can spread before procurement. | Below: no multi-team drift and no budget. Above: a sales motion, which the brief says comes later. |
| **Shared agent instructions already in repos** | The problem already exists in files we can scan | No drift to show yet, so no aha moment |

**Signal we can build a list from:**
- `CLAUDE.md`, `AGENTS.md`, `.claude/skills` or Cursor/Copilot rule files in **≥3 of the company's public repos**, or
- a public job post for **AI enablement, an "AI builder", or an AI Transformation Owner**

**Why this, and what I rejected.**
- **Startup engineers (10–200 people).** This was my first answer. It's the right person in the wrong company. They feel drift, but there's no second tool, no non-engineering use of skills, and nobody with an AI budget.
- **Enterprise AI leaders as the entry point.** They own the budget but don't feel drift day to day, and reaching them first is a sales motion. They become the buyer later (1.6).
- **Sellers and marketers.** They create the sprawl without feeling it. They can't install tools and aren't rewarded for sharing. They're reached through hubs (1.8).
- **Single-tool companies.** Excluded once it became clear that Claude and ChatGPT now govern skills inside their own tools (1.4).

**Which workload leads.** The brief asks whether coding, knowledge work or operational agents should lead. **Coding leads.**
- Skills already live in repos, so drift is visible and scannable.
- Engineers feel it first.
- GitHub is a distribution surface that business functions don't have.

**Knowledge work follows through hubs** (1.8). Sales, finance and marketing consume skills that engineering and data teams own, and those consumers are pulled in by links, not by a separate sale. **Operational agents come third**, through the Software Factory pattern: CI bots governed like any other skill, once the registry is the source.

## 1.2 What job are they trying to do?

**Answer.** For the platform or DevEx engineer:

> *"Keep one version of our AI skills and instructions working across every AI tool and team, so I stop maintaining copies and stop being the person everyone asks which one is right."*

As adoption spreads, the job belongs to whoever owns a function's process:

> *"When we change how we work, change it once and have everyone's AI tool pick it up, and be able to show that it's used."*

And for the budget owner:

> *"Show the AI investment is working, across every tool we pay for, without losing control of how each function operates."*

**Evidence.**
- **GitLab's public handbook** (*Prompts are Process* [R23]) describes the second job almost word for word. When the sales leader changes the sales motion, the owner updates one canonical call-prep skill, and "every AE using the skill picks up the new behaviour automatically." The handbook also names the failure mode: "if a leader cannot change the way their function operates by changing a process, they have lost control of their strategy."
- **LinkedIn's "AI Builder, GTM Enablement" job posts** [R29, R30] ask the hire to "consolidate one-off solutions into durable systems" and "establish standards for lifecycle management, documentation, and governance."
- **Public developer threads** about skill drift describe the first job directly: "a team that had 5 copies that had all drifted"; "I don't want to copy/paste into the different repos and have them drift." [R37]
- **Atlan's own demo** frames the budget owner's job: the AI transformation leader who needs to know "whether that investment is working." [R39]

## 1.3 What trigger makes the problem urgent?

**Answer.** Five triggers turn background annoyance into a task someone has to do this week:

1. **A second AI tool is approved.** The day a company adds Claude alongside ChatGPT, or Codex alongside Copilot, every existing skill needs a second copy, and drift starts. This is also the qualifying question for every lead: *"How many AI tools are officially allowed?"*
2. **A visible wrong output.** Two teammates get different results from "the same" skill, or an answer cites an outdated definition, price or policy. Nobody can say which version is right.
3. **A security or supply-chain finding.** Snyk's ToxicSkills study of 3,984 skills from ClawHub and skills.sh found critical issues in 13.4%, with 76 confirmed malicious payloads [R11]. After a finding like that, "what have we installed, and who owns it?" becomes a CISO question.
4. **The company launches an AI operating model.** It appoints an owner per function, or a champions network. GitLab and LinkedIn both did this publicly in 2026. The owner now exists, and they need tooling to do the job.
5. **A leadership change to how a function works:** a new sales methodology, a product launch, a reorganisation. The owner needs one change to reach everyone at once.

**Why these.** Each one makes the cost of drift visible *and* gives someone a reason to act. Triggers 1 and 2 come from the gap analysis in 1.5. Trigger 3 is Snyk's research. Triggers 4 and 5 come from GitLab's handbook and LinkedIn's hiring.

## 1.4 What do they use today?

**Answer.** Something at every layer, and each tool stops at its own edge:

| Layer | What they use | What it does well | Where it stops |
|---|---|---|---|
| **Files** | `CLAUDE.md`, `AGENTS.md`, `.claude/skills` in repos; git; symlinks | Versioned by git; reviewed by PR | Nothing works across repos or tools. GitLab's data team says shared skills "have to be symlinked into your local skills directory" [R25]. No usage data. |
| **AI tool admin consoles** | **Claude** Team/Enterprise org skills: owner review before publishing, version history, automatic rollout of approved versions, group targeting, skill scanning, per-skill usage and cost (Jul 2026) [R1, R2]. **ChatGPT** workspace skills with owners and usage [R3]. **Copilot** org custom instructions (GA Apr 2026) [R5]. **Cursor** team rules [R6]. | Real governance inside one tool | Each console sees only its own copy |
| **Knowledge and agent platforms** | Glean, Relevance.ai, GitLab Duo AI Catalog | Governed inside their runtime | They don't publish into other assistants |
| **Apps with built-in agents** | Gong [R17], Salesforce Prompt Builder [R18], Highspot [R19], Decagon, Harvey | Versioning and approval inside the app | Copies pasted into Claude or ChatGPT are forks |
| **Cloud registries** | AWS Agent Registry (GA 31 Aug 2026) [R7], Microsoft Agent 365 (GA 1 May 2026) [R8], Google's skill registry (preview) [R9], Databricks Unity Catalog skills (beta) [R10] | Inventory, identity, approvals for that cloud | Built around their own cloud and entry points |
| **Early skill tooling** | sx (Sleuth) [R14], Tessl [R15], JFrog [R16] | Package-manager-style distribution | Early. No ownership across functions, no link to data. |
| **Process** | Slack intake channels, handbook pages, prompt libraries in docs | Cheap | GitLab's handbook calls this "shadow process" |

**The takeaway.** A year ago the honest pitch was "you have no governance." That's no longer true inside a single tool, and GitLab shows why it still breaks. It runs **Claude Enterprise for every team member, plus Glean, Relevance.ai and GitLab Duo, and its data team uses both Claude Code and OpenCode** [R20, R24, R25]. Its policy is written to be "deliberately tool-agnostic." Its tooling isn't.

## 1.5 Why is Agent Registry meaningfully better for this job?

**Answer.** The problem has moved to the seams, and Agent Registry is the only thing positioned to sit across all of them:

| Seam | What breaks today | What the registry does |
|---|---|---|
| **Across AI tools** | One skill lives in Claude, ChatGPT/Codex, Copilot and Cursor. Each console sees only its own copy. | One skill, one owner, one version, published into every tool the company allows |
| **Apps → assistants** | Well governed in Gong or Salesforce. Pasted into Claude, it becomes an ungoverned fork. | The assistant copy points back to the governed source |
| **Skills ↔ data** | A skill encodes a metric, price or policy. The source changes, and nothing connects the two. | Skills are linked to Atlan's glossary, metrics, lineage and certification, and flagged when what they depend on changes |
| **Measurement** | Usage is reported per vendor. Nobody can say "this skill ran 4,000 times across three tools." | One per-skill view across vendors: who uses what, where, and at which version |
| **Security** | Scanners flag a risky skill, but nothing approves a version, pins it and revokes it everywhere | Scan results feed approve / pin / revoke across every tool |

**Three of these are things no platform vendor will build.**
- **Neutrality across tools.** Anthropic, OpenAI, Microsoft and AWS each stop at their own edge on purpose.
- **Skills linked to governed data.** This comes from Atlan's core catalog business. Atlan's site already lists "Agent Skills: reusable, versioned, testable units of procedural knowledge" in its Context Engineering Studio [R31], and Workday's data leader is quoted saying their shared language "can be leveraged by AI via Atlan's MCP server" [R31].
- **Per-skill value across vendors.** Today this means stitching together several dashboards.

**What it isn't.** Agent Registry is not a directory, and not another scanner. The demo shows observability, governance and distribution: first-run scan of existing skills, workspaces, Agent 360 with dependencies, version pinning, merging duplicates, and a reporting surface for the AI transformation leader. Those are team and company capabilities, not individual ones.

**The honest risk.** Platforms may consolidate (Microsoft Agent 365, Databricks), and companies may build their own catalog (GitLab's Duo AI Catalog [R28]). The answer is to **integrate with them as destinations, not replace them.** The registry is the one version behind all of them.

## 1.6 Who is the user, champion, blocker and budget owner?

**Answer.**

| Seat | Who | What they need to see | What moves them |
|---|---|---|---|
| **User** | The platform or DevEx engineer (the ICP) | Their team's drift in 30 seconds, with nothing leaving their machine | A local report that names the copies and the blast radius |
| **Champion** | In engineering, the DevEx or platform lead. In business functions, whoever owns the function's shared process: AI Transformation Owner, GTM Enablement, RevOps. | A team-level inventory: duplicates, which teams, which skills have no owner | Evidence in lead language: "used by 4 teammates, 3 versions, 12 files affected" |
| **Budget owner (exactly one)** | The **Head of AI / Director of Enterprise AI**, often reporting to the CIO | A per-skill view across vendors, and control over how each function operates | Their own champion's diligence, timed by a trigger (1.3) |
| **Blockers** | Security / CISO, IT, legal, procurement | Local and read-only entry, scan results wired into approvals, nothing shared without consent | Requirements designed in from day one, not argued about at the end |

**How the seats connect.** Artifacts travel; people don't. The engineer's report reaches the champion. The champion's inventory reaches the budget owner. At each step, the person receiving it gets something in their own language, from a colleague, at a moment when they already have a reason to care.

**Why exactly one budget owner.** A buying center with two possible payers stalls, because each assumes the other is buying. In existing Atlan accounts the data leader (CDO) will influence the deal and opens the door to design partners, but the AI budget sits with the Head of AI.

**Consumers are not a seat.** Sellers, analysts and marketers who use skills never adopt anything. They're reached through the teams whose skills they use (1.8).

**Real example: GitLab's public org chart** [R20, R21, R22].
- **Budget owner:** the Director of Enterprise AI, under the CIO.
- **Champions:** one AI Transformation Owner per function. They "maintain the canonical skills, prompts, and agents used by the function" and report value to the exec sponsor.
- **Carriers inside each function:** Champion communities at 5–10% of their time.

## 1.7 What channels do they typically find products on?

**Answer.**

| Who | Where they find tools | Evidence |
|---|---|---|
| **Platform and DevEx engineers (ICP)** | GitHub and npm; Hacker News and Show HN; X; platform-engineering communities (Slack groups, PlatformCon, DevEx newsletters); curated "awesome" lists | Anthropic distributes its official skills as a public GitHub repo with six-figure stars. Four independent awesome-claude-skills lists exist, the largest at ~75k stars [R38]. The sharpest public pain signal was a Show HN launch aimed at this exact problem [R37]. |
| **Data and analytics engineers** (the first hub inside a company) | dbt community (100K+ members) [R35], GitHub, dbt packages | dbt's own community figures |
| **Champions and budget owners** | LinkedIn, peer communities of practice, announcements from vendors they already pay (Anthropic, OpenAI, Microsoft), vendor CSMs | Where their roles are posted and discussed publicly (GitLab handbook, LinkedIn job posts) |
| **Consumers** | They don't look for tools. Tools arrive through their company's AI plugins, Slack, and onboarding. | How GitLab distributes skills: "shipped inside the function's role-based plugin so every team member gets it without an install step" [R21] |

**What this means for the channel.** The ICP is reachable through open, technical channels. The budget owner is reached indirectly: by the data drop on LinkedIn, and by their own champion arriving with an inventory. Nobody on the business side is asked to find anything.

## 1.8 How could individual adoption become team or workspace adoption?

**Answer.** Seven steps. Each uses only access the person already has, and nothing leaves the machine unless they choose to share it.

1. **Local scan.** The engineer runs the CLI on their machine. The report has three layers:
   - their own drift
   - a team scorecard with blast radius, written in a tech lead's language
   - a one-line summary for leadership

   The scan mirrors the registry's own onboarding, which on first run "scans the skills and sessions already on my laptop."
2. **Team scan.** By default it covers the repos the engineer's own team owns. Scanning wider (other teams' repos they can read) is a separate, explicit command. It asks the user to check company policy and lets them choose the scope.
3. **A note the engineer forwards.** For each large duplicate cluster, the tool writes one short note ("this skill exists in 4 places, in 3 versions") for the engineer to forward to the owners. It never opens pull requests in other teams' repos uninvited; a colleague's forwarded note is welcome, while an automated PR reads as spam. A PR is opened only when the repo owner asks.
4. **"Claim your skills."** The note asks each team with unowned skills to name an owner. Naming one is that team's first act of adoption.
5. **Hubs and dependency pull.** Some teams own knowledge hundreds of colleagues consume:
   - the data team (metric definitions)
   - product marketing (messaging)
   - platform engineering (standards)
   - GTM enablement (seller workflows)

   When one of these hubs governs its skills, the skills that depend on them follow. A QBR-deck skill needs marketing's messaging and the data team's metrics, so once the source is governed, the dependent skills get flagged every time it changes. Their owners want in. **This is how it crosses from tech into non-tech without a separate sale.**
6. **Cross-functional sharing with the skillsdrift-bridge skill.** A skill for Claude or Codex reads the drift report and picks out skills whose output is used outside engineering. The test is *"who uses what this skill produces?"* It then shares them with the right teammates over Slack:
   - The user approves every message and destination.
   - Owners approve being named.
   - Skills with a security flag are never shared.

   What gets shared is **a link to the governed version, never a file.**
   - **Where the company has Atlan:** the link opens the skill's page in the Atlan dashboard. Signing in with a work account onboards the recipient, so sharing *is* onboarding.
   - **Where it doesn't:** the link opens a neutral, redacted skill card, clearly not branded Atlan, with an "import into a governed workspace" prompt.
7. **A champion confirms, then the budget owner buys.**
   - The person who keeps pulling it together installs the GitHub App. That install is the conversion signal, not the way in: nobody installs an org-wide app casually, so an install means the champion is already won.
   - The team inventory and cross-function usage then go to the Head of AI.
   - Where the company already runs an AI operating model (GitLab's hub-and-spoke [R21], for example), the registry becomes the tooling under their existing policy: *"Prompts are Process, with the tooling to match."*

**Optional, opt-in only: colleague rollup.** This is a separate hosted feature, off by default. When a user turns it on, the CLI sends only skill-name hashes, content hashes and counts, never contents, paths or names. Manifests from the same email domain are combined, and a company view unlocks once three people contribute. It's the only step where anything leaves the machine, and the CLI says so every time.

**Why this design.**
- **Individuals don't spread tools inside companies; hubs do.** GitLab formalises this with one platform team, one owner per function, and a champion community per function.
- **Every step is something engineers already do:** scan, forward, review, claim ownership.
- **Consent and scope are defaults, not options,** because every message goes out under a colleague's name.

## 1.9 Who should not be targeted yet?

**Answer.**

| Not yet | Why |
|---|---|
| **Companies standardised on one AI tool** | That vendor's admin console (Claude org skills, ChatGPT workspace skills) is good enough |
| **Customer-support teams on Decagon or Sierra** | The agent *is* the product, and it's already versioned and governed where it runs |
| **Companies under ~200 people** | They'll use the free CLI and are welcome: they spread the word, and people change jobs. But there's no second function using skills and no budget owner, so they're not counted or targeted. |
| **Large enterprises with long procurement** | Later. Reached first through design partners and existing Atlan relationships. |
| **Companies all-in on one cloud's agent stack** (only Microsoft Agent 365 + Copilot, only Duo, only Databricks) | The native registry wins until they add a second tool |
| **Sellers and marketers as the entry point** | No pain, no install rights, no incentive to share. Reached through hubs instead. |

**The one question that qualifies or disqualifies a lead:** *"How many AI tools are officially allowed, across how many functions?"*

---

# Section 2: the channel

## 2.1 What is the one primary channel, and how do we defend it?

**Answer.** **Open-source, GitHub-native distribution.** A free local CLI (`skillsdrift`) and a public "State of Skill Drift" data drop, launched where platform engineers already find tools. Inside each company it keeps spreading through forwarded notes, claimed skills and shared links (1.8).

**The defence, in four parts:**
1. **It matches observed behaviour, not assumed behaviour.**
   - Anthropic ships its own skills as a public GitHub repo [R33], and developers star and fork it at six-figure scale.
   - Curators maintain four separate awesome-claude-skills lists.
   - The clearest public pain signal came from someone in this exact audience launching a tool for this exact problem on Show HN.
2. **It passes security review because of how it's built.** Local, read-only, no network by default, no telemetry, MIT licence. A tool that fails security review never reaches the budget owner, so this is a design requirement, not a nice-to-have.
3. **It gets more valuable as the team grows.** A solo repo scans clean and boring. A 50-person team scans as drift nobody can fix by hand, and it comes back next month whether or not anyone acts. So the free tool leads towards the registry instead of replacing it. The rule behind every free surface: *a scanner finds drift; a registry makes drift impossible.*
4. **It doesn't give away a free fragment.** No badges, no scores, no standalone server that would satisfy the need in one session and stop people there.

**Where Atlan's existing customers fit:** 3–5 design partners who prove the full path to activation in a real company. They are not the acquisition channel for the first 100. That would be a CSM-led motion, which the brief says to put after distribution.

## 2.2 Why does it fit the customer's existing behaviour?

**Answer.** Every step asks the ICP to do something they already do:

| What they already do | What the channel asks |
|---|---|
| Keep skills and agent instructions in git | Scan them |
| Discover tools on GitHub, HN and in their communities | Find this one there |
| Run CLIs locally before trusting a service | Run a local, read-only CLI |
| Forward internal notes to other teams' owners | Forward the drift note |
| Add owners through CODEOWNERS | Claim a skill |

On the business side, teams already receive AI tools through their company's plugins and Slack, which is exactly where the shared links arrive.

**Rejected:** channels that need new behaviour. A new directory to browse, a sales call to take, a marketplace to list in, or a dashboard to log into before seeing any value.

## 2.3 How does discovery lead to activation and then expansion?

**Answer.**

| Stage | What happens | What carries it |
|---|---|---|
| **Discovery** | An engineer sees the data drop or a colleague's forwarded note and runs the CLI | 30 seconds, local, no sign-up |
| **First value** | The three-layer report shows their drift, the team's blast radius, and a line for leadership | The report |
| **Team value** | Team scan, forwarded notes, skills claimed | Notes in their colleagues' language |
| **Crossing into non-tech** | Hub skills shared as links to the governed version | The skillsdrift-bridge skill |
| **Champion** | The person pulling it together installs the GitHub App | The inventory |
| **Decision** | The Head of AI sees the inventory and cross-function usage | The champion's own diligence, timed by a trigger |
| **Activation** | Skills imported into the registry and in use | Import from the scan's manifest (`atlan-registry-import/1`) |

**Activation means deployment, not sign-up.**
- **A team is activated** when:
  1. its skills are in a governed registry with a named owner and a version each
  2. **≥5 people** run governed skills through their AI tools
  3. that usage can be observed, at whatever depth each tool exposes (full sessions for Claude Code and Codex; usage and share events elsewhere)

  The test: *if they stopped tomorrow, would real work break?*
- **An account has crossed over** when **≥10 people across ≥3 functions and ≥2 AI tools** use governed skills. An engineering-only account has stalled where it started.

**Expansion.**
- **Adoption is pulled by value, not pushed by governance.** In the demo nobody adopts for governance. They adopt because a skill is visibly better than doing it themselves and colleagues already use it. So the first move in each workspace is to make its top 3–5 skills great.
- **Dependency pull brings in the next hub.**
- **New joiners get default skill packs,** so adoption grows with headcount.
- **A per-function report names the next function to govern.**

## 2.4 What must Atlan build or partner on?

**Answer.**

**Build, or confirm it already exists:**

| # | Capability | Why the channel needs it |
|---|---|---|
| 1 | **Import from the scan's manifest** | A scan becomes a governed workspace in one step. The CLI already writes `atlan-registry-import/1`, with owners, versions and suggested canonical copies pre-filled as suggestions. |
| 2 | **A URL per skill, plus sharing that onboards whoever opens it** | Shared links are how non-engineers arrive. This is what the bridge skill points to. |
| 3 | **Publishing into each AI tool:** Claude and ChatGPT plugins, Codex, Copilot, Cursor, Glean | One version reaching every tool is the core promise |
| 4 | **Usage data at different depths:** sessions where tools expose them, events elsewhere | The per-skill value view for the budget owner |
| 5 | **Links from skills to data:** glossary, metrics, lineage | The part no AI-tool vendor can copy |
| 6 | **A GitHub App under Atlan's name** | Mine proves the pattern; Atlan's scales it |

**Partner:**
- **Security scanners** (Snyk agent-scan [R12], Cisco's skill scanner [R13]). Plug their results into the approval step rather than competing.
- **Anthropic's and OpenAI's skill directories.** Places to publish to.
- **Cloud registries** (AWS, Google, Microsoft). Sync with them; don't replace them.

**Everything I built works without Atlan existing.** My stack ends at the waitlist, and my card links stand in for Atlan's share links. The import manifest is the portable object that turns later conversion into a mechanical import. Whether capabilities 1, 2 and 4 already exist in Atlan's product is the first question for Atlan.

## 2.5 Why does this route beat the two strongest alternatives?

**Answer.**

| Alternative | Its strongest case | Why it isn't the primary channel | Its role instead |
|---|---|---|---|
| **Public skill directories** (e.g. skills.sh [R34]) | Real reach: 1.43M all-time installs, and the #1 skill is a skill-finder (~3.3M installs), the clearest pain signal anywhere [R34] | A directory for individuals, with nothing for teams. It optimises the individual install that causes drift, it can't host the move from one person to a team, and we'd be one listing among 23,600+. | A free amplifier: list the CLI and cards there |
| **Platform partnerships** (the brief's "can we growth-hack AWS's registry?") | Proves the category at enterprise scale. AWS launched with Southwest, PepsiCo and Syngenta [R36]. | AWS is building its own registry, partner deals take quarters, and there's no fast on-ramp for a third party | **Be compatible, not a partner.** Export the scan manifest in AWS Agent Registry's resource format, so AWS users can adopt the CLI without leaving AWS. That's a distribution hook, not a channel. |

**Also weighed:**
- **Native agent recommendations** (the brief's "can Claude set up and recommend Registry?"). This already happens *inside* the primary channel: the skillsdrift-bridge skill has Claude, in the user's own tools, recommend and share governed skills with teammates. It can't be the primary channel because it only reaches people already using the tool, so it can't do cold discovery. Its strength is exactly the step the primary channel lacks, which is carrying adoption from engineers into business teams.
- **Atlan's existing customers.** The vendor is already approved and the CSM knows the data leader, so it's the fastest path to a first activation. But it's a CSM-led motion, so it proves activation rather than driving distribution.
- **Agencies and implementation partners.** One agency lands in many companies, directly at the buyer. Worth revisiting once there's usage data, but it's an outside-in motion, and this plan starts from inside the company.
- **Builder communities** (the n8n and Clay pattern). They work for tools whose users publish templates to each other. Skills do travel that way, but the pain here is team drift, not missing templates.

## 2.6 Does it scale non-linearly, or is it the channel we're most comfortable executing?

**Answer.** Both, and it's worth being exact about which part is which.

- **Across companies, growth is roughly linear.** Each first install is a separate decision, spread through content: the data drop, cards, a weekly update. It compounds, but only slowly.
- **Inside each company, growth is non-linear:**
  - a single team scan covers every repo that team owns
  - one hub reaches hundreds of consumers
  - dependency pull brings in the next hub without a new sale
  - every shared link onboards a person to the governed version
  - default packs grow with headcount

  So each company that lands produces several activated teams, not one.
- **And it's the channel I can execute myself this week,** which the brief explicitly allows. Everything in it is built or close to built. It doesn't depend on a partner saying yes.

**What this means for the goal.** The non-linearity sits inside the company, so the number of companies needed depends on whether several teams in one company count toward the 100. I've asked Atlan to confirm (3.8).

---


# Section 3: campaign and build (in progress)

## 3.1 What is the first campaign, ready to run? ❌ (designed, not live)

**Answer.** **"State of Skill Drift."** A public data drop plus a free 30-second local audit, launched where platform engineers gather, and followed by the inside-the-company loop (1.8).

**Blockers before it can run (this week):**
1. drift.aryaman.tech resolves, but isn't serving pages yet. It needs a reverse proxy and a TLS certificate.
2. The CLI isn't on npm yet. The `skillsdrift` name is currently unclaimed.
3. The waitlist backend isn't built.
4. The reframed data-drop metrics (3.4) need to be computed.

## 3.2 Who is the audience? ✅

**Answer.** The ICP: **platform and DevEx engineers at 200–2,000 person companies with two or more AI tools.** They're reached through GitHub, HN, X and platform-engineering communities, and filtered by the observable signal in 1.1.

Heads of AI see the data drop's LinkedIn version, so the question "do we have this?" reaches them while their engineers already have the answer. That's a side effect, not a second audience.

## 3.3 What is the offer? ✅

**Answer.** *"See how your team's AI skills have drifted across tools and repos in 30 seconds. Nothing leaves your machine."* Once the report has shown the value, the next step is *"Import this inventory into a governed pilot."*

**Why this offer.** No risk to the user, and the pain shows before anything is asked of them. It also deliberately gives away no free piece (no badges, no scores, no standalone server) that would satisfy the need in one session and stop people from going further.

## 3.4 What is the channel-native acquisition asset? ⚠️

**Answer.**
- the CLI (GitHub and npm)
- the **State of Skill Drift** data drop, with a live index and a weekly update
- shareable skill cards: ≤50 KB, redacted, no scores
- a demo of the bridge skill

**The data drop is reframed.** The earlier headline ("951 public skills, 100% with no owner field") measured a definition. Public libraries keep ownership in git, not in the file. The new headline measures things that matter inside a company:
- **Duplicates and drift:** the same skill found in multiple public repos in different versions.
- **Risky patterns by category:** hardcoded credentials, instructions that pull unpinned remote content, prompt-injection patterns.
- **Maintenance:** skills with no changes in N months while the tools they target have moved on.

Each number says exactly what it measures and what it doesn't.

**No call-out marketing.** Named repos are scanned only when their owner asks. The public data drop reports only aggregates. The X account replies with a private link, not a public verdict, unless the person asking maintains the repo. Creators are offered a scan; nobody receives a pre-made one.

**Why ⚠️.** The reframed metrics haven't been computed yet.

## 3.5 What is the destination or activation experience? ⚠️

**Answer.**
1. local scan
2. three-layer report
3. team scan and forwarded notes
4. an import-ready manifest
5. the waitlist, which asks for job title and company domain

For shared skills, the landing is the skill's page in the Atlan dashboard where the company has Atlan, or a neutral skill card on drift.aryaman.tech where it doesn't. The free scan deliberately mirrors the registry's own onboarding, which "scans the skills and sessions already on my laptop."

**Why ⚠️.** The waitlist and card site aren't live (G1), and Atlan links depend on Atlan (G4).

## 3.6 What is the call to action? ✅

**Answer.**
- **Primary:** "Run the scan."
- **Inside the company:** "Forward this to the owners" and "Claim your skills."
- **Once value is proven:** "Import into a governed pilot."
- **For people receiving a shared link:** "Open the current version."

## 3.7 What are the launch mechanics? ⚠️

**Answer.**
- **Day 0:** the data drop on HN and LinkedIn, with the CLI live.
- **Days 1–7:** posts in platform-engineering communities. Offer (don't push) scans to authors whose public writing shaped the thesis.
- **Days 7–30:** submissions to curated lists, only once there's real usage. A Show HN once there's usage. The GitHub App opens to champions.
- **In parallel:** 3–5 Atlan customers as design partners for the inside-the-company loop.
- **Dropped:** a campaign around the ChatGPT custom-GPT retirement (11 Dec 2026) [R4]. OpenAI's own migration already turns GPTs into plugins with skills, and those buyers are a different workload from the ICP. It stays as a trigger to ask about in interviews, not a campaign.

**Why ⚠️.** Dates depend on G2.

## 3.8 What is the measurement plan? ⚠️

**Answer.** The CLI sends nothing by default. Every signal below comes from something the user chose to do, or from our own servers.

| Stage | Signal | Source |
|---|---|---|
| Reach | Data-drop and card page views, npm downloads, GitHub stars | Server logs, npm, GitHub |
| First value | Cards created; waitlist sign-ups with title and company domain | Card service, waitlist |
| Opt-in usage | One anonymous "scan completed" event (CLI version, skill count, scope: local or team). The CLI asks once and it's off unless the user says yes. | Opt-in ping |
| Spread inside a company | Opt-in rollup contributors per domain; skills claimed; notes forwarded through the bridge skill | Rollup service, bridge log |
| Crossing into non-tech | Shared links opened, grouped by the recipient's function. The bridge skill records the function at send time, and each link carries a random token, with no personal data in the URL. | Link service |
| Champion | GitHub App installs per domain; time from first scan to install | App service |
| Activation | Per the 2.3 definition, counted in design partners and imported workspaces | Registry |

**Working definition of "team"** until Atlan confirms: *a group of ≥5 people who share at least one governed skill with a named owner.* Several teams can exist in one company. That's why the target changes from roughly 667 companies (1 team each: 100 activated ÷ a 50% deployment rate ÷ a 30% conversion rate) to far fewer if Atlan counts teams within a company separately.

**Why ⚠️.** Instrumentation isn't built yet (G1), and the definition needs Atlan (G2).

## 3.9 What signal would make us continue, change or stop? ⚠️

**Answer.**

| Gate | Continue | Change | Stop |
|---|---|---|---|
| Discovery interviews | ≥ **[A]** of 8 describe drift across tools without prompting | Pain is real but within one tool → reposition to the gaps between apps and assistants | Fewer than **[B]** of 8 feel it → rethink the ICP |
| Launch wave | ≥ **[C]** companies matching the ICP signal complete a scan | Scans come mostly from companies under 200 people → shift to platform-engineering communities | Two waves under target → rethink the channel |
| Team → company | ≥ **[D]**% of opted-in scanners run a team scan | Low → the report isn't making the case for looking wider | — |
| Crossing into non-tech | Shared links opened by ≥1 non-engineering function within **[E]** days at design partners | Engineering-only → run the cross-functional sharing in one function by hand | — |
| Champion | App installs at design partners | Champions engage but leaders don't → reframe the summary for leaders | — |

**Numbers to set: [A]–[E] (G3).** Everything else in the table is fixed.

## 3.10 What did we leave behind that Atlan can click, run or inspect? ⚠️

**Answer.**

| Artifact | State |
|---|---|
| **skillsdrift CLI:** scan, drift diffs, 11 security heuristics, three-layer report, import manifest, check-in mode | Built and tested (per build logs) |
| **Scanner service:** public repo scans, index, weekly update | Built (per build logs) |
| **Card generator + gallery** | Built (per build logs) |
| **@skillsdrift bot on X:** human approval is enforced in code, and it replies privately by default | Built as drafts only; policy updated per 3.4 |
| **GitHub App service:** signed webhooks, weekly checks, no auto-fixes | Built (per build logs) |
| **skillsdrift-bridge skill:** reads a drift report, picks cross-functional skills, shares governed links on Slack with consent | Built, and tested twice in dry runs |

**Why ⚠️.** Nothing is publicly clickable yet (G1), and the builds weren't re-verified on the server in this pass. The minimum to have before the working session: the domain serving the index and cards, `npx skillsdrift` working, and a recorded demo of the bridge skill.

## 3.11 Is it what the thesis requires, and has it taught us anything? ⚠️

**Answer.**
- **Required: yes.** The thesis is that artifacts travel and people don't. The CLI carries the first step, the report and summary carry the step to the champion, and the bridge skill carries the crossing into non-tech.
- **Learned so far, from building:**
  - The file-level "no owner" stat measures a definition, not a problem, so the data drop was reframed.
  - The natural thing to share is a link, not a file.
  - Suggested owners must never be presented as confirmed owners.
  - An App install means a champion already exists, so it can't be the way in.
  - GitLab's handbook shows the operating model this product needs already exists in real companies.
- **Not learned yet: anything from users.** That comes from launching (G1) this week.

---

# Resources and evidence appendix

*The brief asks for an evidence appendix with sources, discovery notes, assumptions and rejected alternatives. Tags like [R1] in the answers point here.*

## A. Sources

### How AI tools govern skills today (1.4, 1.5)

| # | Claim it supports | Source |
|---|---|---|
| R1 | Claude Team/Enterprise org skills: owner review, version history, auto-rollout, group targeting, scanning | [Claude Help: Provision and manage skills for your organization](https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization) |
| R2 | Claude admin analytics show per-skill usage and cost (Jul 2026) | [Claude blog: More visibility and control over usage and spend](https://claude.com/blog/giving-admins-more-visibility-and-control-over-claude-usage-and-spend) |
| R3 | ChatGPT workspace skills, with owners and usage | [OpenAI Help: Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) |
| R4 | Custom GPTs retire 11 Dec 2026 and migrate to plugins with skills | [OpenAI Help: Custom GPT retirement and migration FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq) |
| R5 | Copilot org-level custom instructions GA (Apr 2026) | [GitHub changelog](https://github.blog/changelog/2026-04-02-copilot-organization-custom-instructions-are-generally-available/) |
| R6 | Cursor team rules | [Cursor docs: Rules](https://cursor.com/docs/rules) |

### Cloud registries (1.4, 1.5, 2.5)

| # | Claim it supports | Source |
|---|---|---|
| R7 | AWS Agent Registry GA on 31 Aug 2026 (agents, tools, skills, MCP) | [AWS What's New](https://aws.amazon.com/about-aws/whats-new/2026/08/aws-agent-registry-generally-available/) |
| R8 | Microsoft Agent 365 GA on 1 May 2026 | [Microsoft Security blog](https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/) |
| R9 | Google skill registry (preview) | [Google Cloud docs: Skill Registry](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/skill-registry) |
| R10 | Databricks Unity Catalog skills (beta) | [Databricks docs: UC skills](https://docs.databricks.com/aws/en/agents/uc-skills/) · [DAIS 2026 governance blog](https://www.databricks.com/blog/ai-governance-data-ai-summit-2026-whats-new-unity-ai-gateway) |
| R36 | AWS Agent Registry launch partners (Southwest, PepsiCo, Syngenta) | "AWS Agent Registry launch", as linked in the challenge brief |

### Security (1.3, 2.4)

| # | Claim it supports | Source |
|---|---|---|
| R11 | 13.4% of 3,984 skills (ClawHub + skills.sh) had critical issues; 76 confirmed malicious payloads | [Snyk: ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) |
| R12 | Snyk agent-scan (partner candidate) | [github.com/snyk/agent-scan](https://github.com/snyk/agent-scan) |
| R13 | Cisco skill scanner (partner candidate) | [github.com/cisco-ai-defense/skill-scanner](https://github.com/cisco-ai-defense/skill-scanner) |

### Early skill tooling and apps with built-in agents (1.4)

| # | Claim it supports | Source |
|---|---|---|
| R14 | sx: skill package manager across clients | [github.com/sleuth-io/sx](https://github.com/sleuth-io/sx) |
| R15 | Tessl: skill registry with evals | [Tessl blog](https://tessl.io/blog/skills-are-software-and-they-need-a-lifecycle-introducing-skills-on-tessl) |
| R16 | JFrog: agent skills registry | [JFrog AI Catalog](https://jfrog.com/ai-catalog/skills-registry/) |
| R17 | Gong: custom agents inside Gong | [Gong press release](https://www.gong.io/press/gong-launches-mission-big-dipper-revenue-harness) |
| R18 | Salesforce Prompt Builder versioning | [Salesforce Help](https://help.salesforce.com/s/articleView?id=sf.prompt_builder_use_multiple_versions.htm&language=en_US&type=5) |
| R19 | Highspot pushes GTM context into assistants | [Highspot blog](https://www.highspot.com/blog/highspot-gtm-agent-spring-launch-2026/) |

### Proof from real companies (1.2, 1.6, 1.8)

| # | Claim it supports | Source |
|---|---|---|
| R20 | GitLab's Enterprise AI team owns Glean, Claude and Relevance.ai; sits under the CIO | [GitLab Handbook: Enterprise AI](https://handbook.gitlab.com/handbook/eta/ai/) |
| R21 | Hub & Spoke & Hub model; skills shipped in role-based plugins; "consume before build" | [GitLab Handbook: Hub & Spoke & Hub](https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/) |
| R22 | AI Transformation Owner owns canonical skills and reports value | [GitLab Handbook: AI Transformation Owner](https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/ato/) |
| R23 | "Prompts are Process": shared, versioned, owned; the sales-motion example | [GitLab Handbook: Prompts are Process](https://handbook.gitlab.com/handbook/eta/ai/strategy/prompts-are-process/) |
| R24 | Every GitLab team member has Claude Enterprise | [GitLab Handbook: Claude](https://handbook.gitlab.com/handbook/eta/ai/tools/claude/) |
| R25 | The data team uses Claude Code and OpenCode; shared skills are symlinked | [GitLab Handbook: Data team AI Agent Setup](https://handbook.gitlab.com/handbook/enterprise-data/ai/agent-setup/) |
| R26 | Data-team skills spread across four repos | [GitLab Handbook: Agentic Tool Development](https://handbook.gitlab.com/handbook/enterprise-data/ai/agentic-tool-development/) |
| R27 | GitLab's AI Champions and AI Transformation Owners in practice (Sept 2026) | [GitLab blog: How GitLab fosters AI-fluent teams](https://about.gitlab.com/blog/how-gitlab-fosters-ai-fluent-teams/) |
| R28 | Duo AI Catalog covers agents, flows and MCP inside GitLab | [GitLab blog: AI Catalog](https://about.gitlab.com/blog/ai-catalog-discover-and-share-agents/) |
| R29 | LinkedIn: Manager, AI Builder GTM Enablement | [Job post (mirror)](https://www.dreamworkhq.com/job/2a06de8b-ec4a-4331-b3c6-747512522c14) |
| R30 | LinkedIn: AI Builder, GTM Enablement | [Job post (mirror)](https://www.dreamworkhq.com/job/ab7c2a6f-a327-4d5d-b82f-64261a71ab47) |

### Atlan (1.5, 2.4)

| # | Claim it supports | Source |
|---|---|---|
| R31 | "Agent Skills" in Context Engineering Studio; Workday quote; customer logos | [atlan.com](https://atlan.com/) |
| R32 | Context repos and MCP (Activate 2026) | [Atlan: Activate 2026](https://atlan.com/know/context-layer-stopped-being-theoretical-activate-2026/) |
| R39 | The AI transformation leader persona; first-run scan; workspaces; Agent 360 | Agent Registry product demo and Software Factory demo (materials shared with the exercise) |

### Channel evidence (1.7, 2.1, 2.5)

| # | Claim it supports | Source |
|---|---|---|
| R33 | Anthropic distributes its skills as a public GitHub repo | [github.com/anthropics/skills](https://github.com/anthropics/skills) (star count to re-check on submission day) |
| R34 | skills.sh reach: 1.43M all-time installs; top skill is a skill-finder | [skills.sh](https://skills.sh) (figures from my original research; re-check on submission day) |
| R35 | dbt community has 100K+ members | [getdbt.com/community](https://www.getdbt.com/community) |
| R37 | Drift quotes from developers ("5 copies that had all drifted") and the Show HN launch | Hacker News thread from my original research log. **URL to add from the log.** |
| R38 | Four awesome-claude-skills lists (largest ~75k stars) | GitHub, from my original research log. **URLs to add from the log.** |

### My own work

| # | What | Where |
|---|---|---|
| R40 | skillsdrift CLI, scanner service, cards, GitHub App, X bot | Repo link to add once published · drift.aryaman.tech (not serving yet) |
| R41 | skillsdrift-bridge skill (reads a report, shares Atlan links on Slack) | Attached skill package |
| R42 | Scan of 951 public skills across anthropics/skills, vercel-labs/skills, microsoft/azure-skills, ComposioHQ | Scanner output (see 3.4 for what it does and doesn't measure) |

## B. Discovery notes

- **Method so far:** desk research. Three independent research passes over the tool landscape, with vendor docs checked directly wherever the passes disagreed. GitLab's handbook was read in full as a real-company inventory. LinkedIn job posts were used to confirm the roles exist. My own scans covered public skill repos.
- **What changed the thesis:**
  1. The Claude and OpenAI docs showed that single-tool governance now exists. That moved the pain to the gaps between tools (1.5).
  2. GitLab's handbook showed the operating model, and the role that owns it, already exist (1.6, 1.8).
  3. Building the bridge skill showed that the right thing to share is a link, not a file (1.8).
  4. The GitHub App turned out to be a champion signal, not the way in (1.8).
- **Corrections made along the way:**
  - I first cited GitLab's analytics dbt repo as public. It now requires sign-in, so the GitLab example uses the handbook only.
  - Research passes disagreed on whether Claude org skills have version history. The source says they do.

## C. Assumptions

| Assumption | Where it's used | How it gets tested |
|---|---|---|
| Companies with 2+ AI tools experience skill drift across them | 1.1, 1.5 | Launch-wave scans; design partners |
| Platform/DevEx engineers will run a local CLI from an open-source repo | 2.1 | Scans from ICP-signal companies (3.9) |
| Hubs exist in most target companies, and dependency pull happens | 1.8, 2.3 | Functions per account at design partners |
| Link sharing onboards non-technical users | 1.8 | Link opens by non-engineering functions (3.8) |
| Several teams in one company can count toward the 100 | 2.6, 3.8 | Question to Atlan (G2) |
| Atlan can import the manifest and give each skill a URL | 2.4 | Question to Atlan (G4) |

## D. Rejected alternatives

| Rejected | Why | Section |
|---|---|---|
| Startup engineers as the ICP | No second tool, no non-engineering use, no budget | 1.1 |
| Enterprise AI leaders as the entry point | Doesn't feel drift daily; reaching them first is a sales motion | 1.1 |
| Sellers and marketers as the entry point | They create the sprawl but don't feel it, and can't install tools | 1.1, 1.9 |
| Product AI engineers | Their problem is production agents, already served by LangSmith and cloud registries | 1.1 |
| Public skill directories as the primary channel | Built for individuals; optimises the install that causes drift | 2.5 |
| AWS / platform partnership as the primary channel | AWS builds its own registry; deals take quarters | 2.5 |
| Native agent recommendations as the primary channel | Can't do cold discovery; used as a loop inside the channel instead | 2.5 |
| Atlan's customer base as the acquisition channel | CSM-led; used for design partners instead | 2.1 |
| GitHub App as the way in | Nobody installs an org app casually; an install means a champion | 1.8 |
| Unsolicited PRs into other teams' repos | Reads as spam; replaced with forwarded notes | 1.8 |
| Sharing skill files | A copy is how drift starts; replaced with governed links | 1.8 |
| Free fragments (badges, scores, a standalone MCP endpoint) | Solve the need in one session and cannibalise the registry | 2.1 |
| Custom-GPT migration campaign | OpenAI's migration already does it; a different workload | 3.7 |
