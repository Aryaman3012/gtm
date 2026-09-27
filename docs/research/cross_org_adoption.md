# Distribution across the org, from one person inside

**Starting point:** one engineer inside a company has already run the CLI (they came in through Twitter, HN or GitHub).
**Goal:** spread across teams and functions **before** anyone installs the GitHub App. The App install comes last, and it confirms a champion.

---

## Step 1: Check, using only access they already have

| What they scan | How | What it finds |
|---|---|---|
| Their laptop | `skillsdrift scan` | Their own skills and copies |
| **Every repo they can read** | `skillsdrift org --owner acme`, GitHub code search using their existing `gh` login. It looks for `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, `copilot-instructions.md` and MCP configs, and hashes content locally. | **An org inventory:** skills per team, duplicate clusters, skills with no owner |
| Owners | CODEOWNERS files + commit authors on each skill file | **Which team** each skill and copy belongs to |

It's read-only, and nothing leaves the machine. The result is a map of **who else in the org has the same problem**.

---

## Step 2: Distribute, and let the inventory choose the targets

The inventory doesn't produce a report for one person. It produces **addresses**: specific teams, specific repos, specific owners.

| # | Mechanism | How it crosses teams | Why it works without an admin |
|---|---|---|---|
| 1 | **Duplicate-cluster PRs** | For each large duplicate cluster, open one PR in the other team's repo: *"This skill is 1 of 4 drifted copies across 4 repos (teams A, B, C). Diff attached. Pin to one canonical version?"* | Anyone can open a PR on internal repos they can read. The PR lands in the other team's review queue, which is where they already work. |
| 2 | **"Claim your skills"** | Each team with unowned skills gets one ask: add an owner (a CODEOWNERS line or owner field). | Claiming ownership is that team's first act of adoption. |
| 3 | **Share links instead of copies** | When someone would copy a skill, they share the canonical link instead. The link shows "used by N people across M teams." | It works in Slack, email or a PR comment. There's no install step. |
| 4 | **Colleague rollup (opt-in)** | Teammates who scan can merge **hashed, redacted** manifests by email domain. The org view unlocks at 3+ contributors. | This covers repos the first engineer can't see. It's the only step that shares anything, and it's opt-in. |
| 5 | **Bridge skills to non-tech** | The inventory flags skills whose consumers aren't engineers: metric definitions → finance, release notes → PMM, incident summaries → CS. Send those teams a share link in their own Slack channel. | This is how it crosses from engineering to business teams, with no GitHub involved on their side. |
| 6 | **A standing check-in report** | Commit the inventory to one shared repo (platform, handbook, eng-standards) and refresh it weekly in that repo's own CI. | Everyone who watches that repo sees the org's drift numbers move over time. |

**Rules so it doesn't turn into spam:** open PRs only for the largest duplicate clusters, have a human approve each one before it's sent, send them from the engineer's own identity, and make them useful even if the other team ignores Atlan entirely (the diff alone has value).

---

## Step 3: Converge on a champion

After step 2, several teams have touched the same problem: through PRs, claims, share links and the weekly report. **The person who keeps showing up** (reviewing PRs, merging clusters, asking "can we just have one place for this?") is the champion. They're usually the DevEx lead, a tech lead with several teams, or the AI operating-model owner.

**They install the App.** That's the confirmation, not the way in.

---

## What to measure (no telemetry needed)

| Signal | Where you see it |
|---|---|
| Teams touched | Repos with a duplicate-cluster PR |
| Teams engaged | PRs merged, or skills claimed |
| People spreading it | Distinct people at the domain who scan, or contribute to the rollup |
| Non-tech crossing | Share-link opens from non-engineering functions |
| Champion | The App install at that domain, and the time from the first org scan to install |

**It's crossing the org when:** 3+ teams engaged, at least one non-tech function opening share links, and one person repeatedly pulling it together.

---

## Devil's advocate

| Risk | Answer |
|---|---|
| Unsolicited PRs annoy other teams | Only for the largest clusters, approved by a human, sent under the engineer's name, and useful on their own merits. One PR per cluster, never a batch. |
| Some orgs lock repo visibility per team | Then the first engineer sees less. The colleague rollup fills the gaps, and the team-level report still travels. |
| Security flags a mass code search | It only uses the person's own existing permissions, and it's read-only. Say so upfront, and let the engineer limit the scope. |
| Non-tech still never sees it | Bridge skills and share links are the only non-tech path before the champion. After the champion, it's the operating-model owner (ATO / Head of AI). |
