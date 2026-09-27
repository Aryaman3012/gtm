# skillsdrift — Launch checklist (ready to run)

Owner: Aryaman (candidate exercise for Atlan). Artifact: github.com/<user>/skillsdrift (repo URL set at publish time). Waitlist: to be wired before Day 0.

## Pre-launch (T-2 days)
- [ ] Publish GitHub repo (public, MIT, README + sample report + fixtures) — R3 output
- [ ] Host the landing page: enable GitHub Pages on the repo, deploy `campaign/landing.html` as `/pilot/index.html` → URL `https://<user>.github.io/skillsdrift/pilot` (zero-cost, no new accounts)
- [ ] Edit `src/cli.js` `DEFAULT_WAITLIST_URL` (`'__WAITLIST_URL__'` literal) → the real Pages URL from the step above — this is the funnel's CTA; it must not ship as a placeholder
- [ ] Add the Pages URL to README (one-line "Join the pilot" link) and as the closing line of the HN post body
- [ ] Waitlist: mailto fallback already wired (landing.html); optionally replace with a real form backend (Tally etc.) before Day 0 — form must never submit to a dead URL
- [ ] Smoke-test on a REAL skills directory (e.g. `~/.claude/skills` on Aryaman's machine) — screenshot the report for the HN post
- [ ] `npm publish` (name verified available 2026-09-10) so `npx skillsdrift` works — decide: publish under candidate's npm account
- [ ] Prepare Show HN post from artifact/HN_POST.md (problem-first title, disclosure line included)
- [ ] Screenshot a real report output (redact any private paths) → host in repo as docs/sample-report.png

## Day 0 — Launch
- [ ] Post Show HN (morning US time, Tue–Thu best per HN norms)
- [ ] First comment from author: context + what feedback is wanted (the HN_POST.md comment draft)
- [ ] Pin repo topics: `claude-code`, `codex`, `agent-skills`, `skills`, `developer-tools`
- [ ] Tweet/X post: 1-thread version of the problem→tool→report arc, link repo
- [ ] Log metrics baseline (stars: 0, runs: n/a)

## Day 7–14 — Distribution waves (gated: only after usage evidence exists)
> Gate: awesome-list PRs go out only when ≥1 week has elapsed AND there is a real usage number to cite in the PR (stars, issues, or a run count). A PR to a 74k-star list from a 3-day-old repo gets rejected — the PR template's own note and strategy §3 agree.
- [ ] PR to ComposioHQ/awesome-claude-skills (74.8k stars) — use awesome-list-pr.md template, cite the usage evidence
- [ ] PR to travisvn/awesome-claude-skills (15k stars) + BehiSecc/awesome-claude-skills (10.1k stars) — space them days apart
- [ ] skills.sh auto-index check: search skillsdrift on skills.sh; if absent after 72h, check their submission flow (their Docs page)
- [ ] Follow-up comment in the original sx HN thread (48900319): disclose candidate-exercise context, position as complementary (sx = sharing via Dropbox; skillsdrift = audit/drift detection), link repo. Polite, zero-spam, adds signal to their thread.
- [ ] LinkedIn post (Aryaman's network: GTM + AI tooling people — the exercise itself is the story: "I'm doing Atlan's GTM challenge; here's what I shipped in week 1")

## Evidence collection (Day 0–14, continuous)
- [ ] Check waitlist signups: distinct email domains (activation metric: 2+ people same domain)
- [ ] GitHub traffic insights: unique cloners by org
- [ ] Tally runs (self-reported via issues/DMs — no telemetry by default)
- [ ] Day 14 decision gate (from strategy §3):
  - CONTINUE if ≥50 stars AND ≥5 distinct orgs ran it AND ≥1 non-network activation
  - CHANGE CTA to "invite a teammate to compare reports" if 10–50 stars OR solo-runs-only clustering
  - STOP/rethink channel if <10 stars AND 0 external orgs after 14 days
- [ ] Write Day-14 evidence memo (numbers + decision) → `~/workspace/atlan-gtm/campaign/day14-memo.md`

## Day 14–30 — Iterate
- [ ] If CONTINUE: outreach to activated champions (15-min call template in outreach.md)
- [ ] If CHANGE: ship the CTA fix, re-post to 1 new community (e.g. r/ClaudeAI — with mod approval + disclosure), re-measure 14 days
- [ ] Update evidence appendix + decision doc with real numbers

## Measurement (what we track, how)
| Metric | Source | Cadence |
|---|---|---|
| Stars/forks/watchers | GitHub API | daily |
| Unique cloners + orgs | GitHub traffic insights | daily |
| Waitlist signups + domains | waitlist backend | daily |
| Runs (opt-in self-report) | issues/DMs/survey link in README | weekly |
| Show HN rank + points | HN Algolia API (item id) | every 6h Day 0–2 |
| skills.sh/directory index status | manual check | Day 3, 7 |

## Rules of engagement (non-negotiable)
1. Every community post carries the candidate-exercise disclosure.
2. No fake social proof, no invented usage numbers, no astroturf upvotes.
3. The sx thread comment adds information (their tool ≠ ours, complementary), doesn't threadjack.
4. If anyone asks "is this Atlan's product?" — answer: no, built by a candidate for Atlan's GTM challenge; Registry is Atlan's unreleased product.