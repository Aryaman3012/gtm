# Concierge Playbook — operationalizing activation per org (R17 Part C)

**What this is.** The operational doc a concierge runs, org by org, from decided-org handoff
through activation. Every step references an existing, already-locked mechanism — the hero-skill
pull model (`activation-plan.md` §5b), share links (`skill-share-links.md`,
`share-links-deep-design.md`), the four crossing moments (`cross-function-crossing.md`), and the
tiered activation criteria (`activation-signals-redesign.md`). Nothing here is a new thesis; this
is those mechanisms turned into a checklist a human can execute.

---

## 1. The cross-functional pilot clause (the contract moment)

Per `cross-function-crossing.md` moment 1: the DM buys a *program*, not an engineering tool. If
the pilot is scoped engineering-only, cross-function activation quietly dies — this is prevented
at contract time, not hoped for later.

> **Definition of done, written into every pilot contract:**
> The pilot is not complete at "engineering workspace live." **Definition of done = ≥1 non-tech
> workspace live**, meeting the same bar as engineering (skills imported, ≥1 non-tech person with
> a Tier 2/3 usage event per `activation-signals-redesign.md` §3) — not merely created and empty.

**Concierge action at contract signing:** confirm this clause is in the SOW/pilot agreement
before scheduling week 1. If it isn't, escalate to the seller before kickoff — do not start the
runbook below on an engineering-only-scoped pilot; per the crossing doc, this is the #1 silent
failure mode and it's cheaper to fix at contract time than to discover in week 4.

---

## 2. Week-by-week runbook (the 2-week ignition, hero-pull model)

Explicitly **not** the reverted config-sprint (`activation-plan.md` §5b: "the governance-sprint
framing was reverted... a census asks busy people to do governance work with no immediate
payoff — it stalls"). Every action below seeds value, not process.

### Week 1 — import manifest + seed heroes + bridge-skill share

| Day | Action | Mechanism it draws on |
|---|---|---|
| 1 | Pull the org's waitlist entry: confirm `manifest_hash`, `harnesses_in_use`, `functions_represented` are populated (`activation-signals-redesign.md` §4 field spec). If any are missing, get them from the champion before proceeding — week 1 planning depends on knowing which harnesses and functions are in scope. | Waitlist field spec |
| 1-2 | **Import the manifest** into the registry — skill list, owner slots assigned, versions pinned, dupes flagged for merge (`activation-plan.md` §5 item 1: the scan report IS the import file). | Import-ready manifest |
| 2-3 | **Seed 2-3 hero skills in engineering** — not a census, an upgrade: pick the top 2-3 skills by usage/import signal, wire their dependencies, assign a named owner, add assets/templates so the skill is *obviously* better than the ungoverned version (`activation-plan.md` §5b: "the deck skill with the Atlan theme beats a blank prompt every time"). | Hero-skill pull model |
| 3-4 | **Seed 1-2 bridge heroes** — heroes whose *consumer* is non-tech (deck/presentation generator depending on a messaging skill, doc/report generator, brand-voice checker, battle-card chain — the demo's own examples). This is the artifact moment (`cross-function-crossing.md` moment 2), and it is a checklist requirement, not optional: no bridge skill seeded means the crossing never triggers. | Bridge-skill protocol (§3 below) |
| 4-5 | **Post the share link into the target non-tech Slack/Teams channel** — the concierge or the engineering champion posts, with the one-liner specified in §3. This is the single mechanical act that starts the cross-function funnel (`cross-function-crossing.md`: "the share event is engineered to land in a NON-TECH channel"). | Share links (same-org path 1a, `share-links-deep-design.md` §1) |

**Week 1 exit check:** manifest imported, ≥2-3 eng heroes upgraded, ≥1 bridge skill posted into a
named non-tech channel. If any of these three isn't true, week 2 does not start on schedule —
flag the blocker instead of proceeding on a partial base.

### Week 2 — workspace live, plugin distribution ambient, usage events flowing, scoreboard populated

| Day | Action | Mechanism it draws on |
|---|---|---|
| 6-7 | Track the preview-page funnel from the week-1 share: previews viewed, "run this through your team's Atlan" CTA clicks. Per the crossing doc's product moment: marketing ops (or the equivalent non-tech champion) clicks through and asks for a workspace — this is the signal the non-tech workspace is about to go live, not something the concierge pushes. | Preview-page CTA (`skill-share-links.md` §1) |
| 7-8 | **Stand up the non-tech workspace** the moment the champion asks — do not pre-build an empty one and wait; per `activation-plan.md` §5b, "nobody activates on an empty registry." Ship it **with the department's hero starter pack already in it** (messaging/SEO/deck chain for marketing; battle-card/deck chain for sales; the CS pack Atlan itself bootstrapped first, per `enterprise-icp-correction.md` Correction 4) — never an empty workspace. | Department workspace templates (`activation-plan.md` §5 item 9) |
| 8-9 | Confirm **plugin distribution is ambient** for the new workspace — members receive the hero pack in their harness (ChatGPT/Cowork/Grokbot, per the org's `harnesses_in_use` field) with zero opt-in, per "Sales appears because I belong to that workspace" (`N8kAZW-yqIU.txt:146`). | Plugin distribution |
| 9-10 | Confirm **Tier 2/3 usage events are flowing** for the new workspace's members — skill loads/invocations (Tier 2) or workspace/search/share activity (Tier 3), per `activation-signals-redesign.md` §2-3. This is the mechanical check that the workspace is live, not just created. | Tier model |
| 10 | **Populate the activation scoreboard** — skills imported %, members active by function, governed-skill usage share per function, observability tier hit per member. This is the artifact the DM report-out (§5 below) is built from. | Per-team activation scoreboard (`activation-plan.md` §5 item 5) |

**Week 2 exit check:** ≥1 non-tech workspace live (not just created — has a Tier 2/3 event from
≥1 member), plugin distribution confirmed ambient, scoreboard populated with real numbers. This
is the mechanical form of the contract clause in §1 — if this isn't true by end of week 2, the
pilot has NOT met its definition of done regardless of engineering-side progress.

---

## 3. The bridge-skill protocol

Directly operationalizes `cross-function-crossing.md` moment 2. Concrete, not abstract:

- **Which heroes:** whichever of the org's engineering skills has a genuine non-tech consumer
  already implied by its dependency chain — the demo's own worked examples are the template:
  deck/presentation generator (depends on a messaging skill), doc/report generator, brand-voice
  checker, battle-card chain. Pick from what the manifest actually contains; do not invent a
  bridge skill the org doesn't have.
- **Who shares:** the engineering champion or the concierge, posting as a peer — not a broadcast
  from "Atlan" or "IT." Per the crossing doc, a peer-vouched artifact in the recipient's own
  channel is the whole point (the marketer's Hop-0 is "a peer-vouched artifact in their own
  channel, not an ad, not git, not a CLI").
- **Into which channel:** the specific Slack/Teams channel of the function the bridge skill's
  consumer sits in (marketing channel for a deck/messaging bridge, sales channel for a
  battle-card bridge) — never a general/company-wide channel, which dilutes the peer-vouch
  signal.
- **With what one-liner:** *"we're maintaining this as a team standard — use it instead of
  rebuilding."* (Verbatim from `cross-function-crossing.md` moment 2 — kept as-is because it
  states the value proposition, not a governance pitch: it names a *thing that already works
  better*, matching the hero-pull model's value-gravity principle, not a config-sprint ask.)

---

## 4. Activation checklist (the mechanical per-org gate)

Per org, checked at week-2 exit and again at day-30/60 report-outs:

- [ ] **Skills governed %** — % of the manifest's skill inventory imported with named owner +
      pinned/floating version assigned (Correction 3 criterion 1).
- [ ] **People-by-function with usage events** — headcount table: function × tier-appropriate
      event present this period (Tier 1 trace for eng seats; Tier 2 skill-invocation or Tier 3
      workspace/share/search event for non-tech seats), per `activation-signals-redesign.md` §3.
- [ ] **≥10 people, ≥2 functions, ≥1 non-tech function** — the multi-function bar, checked as a
      literal headcount-by-function query against the table above.
- [ ] **Observability per tier confirmed** — no counted person is missing their tier's minimum
      event; a person with zero events this period does not count toward the ≥10, regardless of
      whether they were counted in a prior period.
- [ ] **Bridge skill(s) still live and depended-on** — the non-tech workspace's hero pack still
      shows real invocations, not a one-time week-1 spike that died (checked via the Tier 2/3
      event trend, not a point-in-time snapshot).
- [ ] **Smell test** — for the counted people/skills, would real work break or degrade if this
      stopped tomorrow? A "yes" from the champion, not just a green scoreboard, is required to
      mark the org activated.

An org is **ACTIVATED** only when every box is checked. Partial completion is reported honestly
as "in progress toward activation," per this checklist — never rounded up.

---

## 5. The DM report-out (day 30/60)

What the champion shows the AI transformation leader — the artifact the scoreboard (week 2, §2)
feeds directly:

1. **Per-function USP decomposition** — "engineering 85% governed · marketing 10% · sales 15%,"
   on the same dashboard framing the DM already watches (`cross-function-crossing.md` moment 4,
   citing `N8kAZW-yqIU.txt:39-44`). This is the number that sold the pilot; the report-out shows
   it moving.
2. **Usage events, by tier, by function** — not raw counts alone, but tier-labeled so the DM sees
   which functions are Tier-1-rich (engineering) vs. Tier-2/3-evidenced (non-tech) — this is the
   report-out's honest application of the tier model, so the DM never mistakes a Tier 3 workspace
   action for engineering-grade trace depth.
3. **Next-function expansion target** — the worst-governed function becomes the DM's next
   mandate target, named explicitly (`cross-function-crossing.md` moment 4: "the memo number
   [USP] that closed Hop 2 becomes the per-function to-do list for expansion"). The report-out
   always ends with a named next function and a proposed bridge-skill candidate for it, not just
   a status recap.
4. **Share-link intent signal, if present** — if a bridge skill's preview page shows resolution
   activity in a function that has no workspace yet ("marketing previewed the bridge skill 40x,
   no workspace yet"), report it as a demand signal the DM/champion can act on directly
   (`cross-function-crossing.md` moment 4, §5 of `skill-share-links.md`).

---

## 6. Failure-mode fixes (operationalized from `cross-function-crossing.md`)

| Failure mode (source: crossing doc) | Playbook step that prevents/catches it |
|---|---|
| No bridge skill seeded → crossing never triggered | §2 week-1 day 3-4 is a checklist requirement, not optional; week-1 exit check (§2) blocks week 2 start if it's missing |
| Preview-page CTA dead-ends (marketer clicks, no follow-up) | §2 week-2 day 6-7 explicitly tracks preview→CTA-click funnel; §5 item 4 surfaces stalled intent to the DM as an actionable signal instead of letting it silently die |
| Mandate without pull (workspace created, nobody uses it) | §2 week-2 day 7-8 requires the workspace ship **with the hero pack already in it** — never empty; §4 checklist item on bridge-skill trend (not point-in-time) catches a workspace that was used once and went quiet |
| The dependency obligation stalls (marketing never maintains its messaging skill) | Not directly fixable by the concierge — per the crossing doc, this is caught by the product itself (the governed bridge skill visibly breaking when its ungoverned dependency changes, via Agent 360's Relationships). Concierge action: confirm at day-30 report-out that the dependency's owner is named and active, and flag to the DM if not — this is a report-out line item, not a silent assumption. |
| Pilot scoped engineering-only (contract-time failure) | §1's contract clause, checked before week 1 starts — the earliest possible catch, per the crossing doc's own framing that this is prevented "at contract time, not by hoping" |
