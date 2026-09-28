# AI work log — the shipping session (R19)

*Merge note: this covers one continuous session, 2026-09-27 21:15 IST to
2026-09-28 13:20 IST. It slots in after R6 in `submission/AI-WORK-LOG.md` and
uses the same voice — first person is me, the AI systems are named.*

## Approach, and what was different this time

R1–R6 were a planned executor/reviewer loop: briefs with done-criteria, one AI
building and the other verifying. This session was the opposite shape. The work
was **unplanned and adversarial by default** — I gave short instructions, and
the standing rule was that the AI had to verify every claim by running
something before reporting it, including claims about work it had done ten
minutes earlier.

That rule is the only reason this session produced anything. Six of its most
important outputs are corrections of things that were already "done".

Where R1–R6 used two AI systems cross-reviewing each other, here the reviewer
was a machine: the test suites, `curl`, the GitHub API, and the live site. The
question was never "does this look right" but "what happens when I run it".

## Models, harnesses, agents used (R19)

- **Claude Opus 5** via the **Claude Code desktop app** — one continuous
  interactive session, roughly 16 hours wall-clock with breaks, no subagents and
  no orchestrator. Unlike R1–R6's non-interactive `claude -p` runs against
  written briefs, this was conversational: short instructions from me, pushback
  from me when an answer looked too neat.
- **Access it was given, in this order:** shell on this laptop; then SSH to my
  OVH VPS (read and write, which I approved explicitly); then `gh` for the
  GitHub API and `certbot`/`nginx`/`systemd` on the server.
- **Tooling underneath:** the project's own test suites as the verifier, `curl`
  and `openssl s_client` against the live site, GitHub REST API for star counts
  and profile-declared X handles, `pypdf` to read the challenge brief and the
  deck, `git` throughout.
- **Not used:** no subagent fan-out, no web research beyond two searches for
  X-account discovery, no image generation. The work was execution and
  verification rather than research — R1–R6 had already done the research.

---

## Chronology

**21:15 — Publishing the repo.** Started by trying to push a zip that turned out
not to exist on this machine. The AI checked four locations, then checked the
two paths I gave it (`/mnt/user-data/outputs`, `/home/claude`) and told me
plainly that both were claude.ai sandbox paths with no equivalent here. It
refused to guess or retry, which was correct; the file was on my Desktop under a
different name. Repo created public, first push clean.

**21:24 — First correction, and the pattern for the session.** The packaged
`dist/skillsdrift-bridge.skill` silently omitted its `examples/` directory. It
had been built by hand. In a project about artifacts drifting from their
sources, the one generated artifact had drifted from its source. Built
`scripts/package-skill.sh` with a `--check` mode that fails if the package and
the source diverge.

**21:50 — The CLI into the repo.** §3.10 claimed six artifacts "built, per build
logs"; five lived only on the VPS and were unverifiable. Pulled the CLI in. Its
tests failed immediately on a fresh checkout — five places hardcoded the CLI at
`../../artifact`, which only resolves in the VPS layout. 8 of 41 tests failed
with `Cannot find module`. Fixed with a resolver that handles both layouts.

**22:15 — The site live.** The working doc said the domain needed "a reverse
proxy and a TLS certificate". Wrong on both counts: nginx was already proxying
correctly, and there was simply **no vhost for the subdomain at all**, so :443
fell through to another site's certificate. Added the vhost, deployed the
already-built index with the existing `deploy.sh`, issued the cert.

Then the waitlist, because taking the site live exposed that the report's
primary CTA rendered as the literal string `__WAITLIST_URL__`. The whole funnel
ended at a placeholder. Built it, deployed it under systemd. It failed to start
— the AI had included `MemoryDenyWriteExecute=true`, which kills Node because
V8's JIT needs writable-executable pages. It diagnosed that from the SIGTRAP
stack trace in one pass and left a comment so it wouldn't come back.

**22:50 — The redesign, and a regression I would have shipped.** The live index
led with "100% ungoverned across sample" — the statistic my own §3.4 retracts
and §3.11 lists as a lesson learned. The site was publishing the number I had
disowned. Redesigned it around what §3.4 actually asks for.

**In doing so the AI introduced a per-repo "Flagged" column**, so the index
began publishing *"microsoft/azure-skills — 10 flagged"*. That is a security
count against a named company, which `launch-distribution-ideas.md` P1 condition
2 explicitly forbids. It caught this itself the next day while re-reading the
strategy docs, and removed it. The card was worse: it named Microsoft beside
*"reverse shell / raw socket redirect"*, which reads as an accusation of
malicious code. Cards now default to withholding security entirely.

**00:11 — `npx skillsdrift` returns 404.** The AI had written that command onto
the live page, assuming a publish that needs credentials it doesn't have.
Anyone who tried it got an npm error. Replaced with the clone command, verified
end to end from a fresh clone.

**00:29 — The reply policy, and a mechanism switched off.** I asked it to
complete the X bot per §3.4's "replies with a private link, not a public
verdict". It implemented DM-by-default and wrote tests locking it in. Then,
reading spec 01, it found: *"the asker's own followers see the reply, which is
the actual distribution mechanism."* It had honoured one document by disabling
the channel the other depends on. The reconciliation it proposed — the line is
**which findings**, not public-versus-private, because drift counts are already
published per-repo on the index while security is what the index deliberately
reports unattributed — is better than either source document.

**00:46 — The finding.** I told it the distribution list was missing half of
what existed. It found `strategy/launch-distribution-ideas.md`, 28KB and
fourteen adversarially-scored ideas it had never opened, then went back to the
scan data and found two bugs that had been hiding a real result:

1. `scan-list.js` scans each repository alone. A skill cannot drift against
   itself, so a per-repo scan reports **zero cross-repo drift by construction**.
2. The CLI was truncating its own JSON when piped. `process.exit()` discards
   buffered stdout because Node writes to pipes asynchronously — **146,103 bytes
   delivered out of 1,469,069, with no error on either side.** Writing to a file
   worked, because file writes are synchronous, which is why nobody noticed.
   Every user piping `--json` into `jq` had been getting truncated reports. The
   GitHub App had the same bug on its normal code path.

Running the same engine over all repositories at once: **12 drifted pairs.
Anthropic publishes 20 official agent skills; 12 are in circulation elsewhere,
and all 12 have diverged.** Copies frozen 2026-07-24 while Anthropic's repo
moved on 2026-09-24. `docx` differs by 111 files, `pptx` by 108, `xlsx` by 53.

**01:18 — Prong 1 corrected.** It had listed Composio and Vercel as repost
targets for the launch. I asked what reason either had to repost us. It conceded
the table conflated *relevance to the finding* with *incentive to amplify it* —
which for the most relevant account point in opposite directions — and rewrote
the prong around mechanisms that need nobody's goodwill.

**11:54–13:20 — Documents.** Section 3 written, then restructured after I asked
whether the `[A]`–`[E]` apparatus was even in the brief. It checked: the brief
asks to "define the signal", not for a five-variable scoring system, and the
3.1–3.11 numbering was self-imposed. Rebuilt around the brief's seven named
elements, with the working systems taking the weight. Then the master answers
doc, whose §3 still described a project where nothing had launched. Last fix:
the repo URL appeared **zero times** in that document, so a reader holding only
the document could reach none of the work.

---

## Systems and reusable workflows built

- **`scripts/package-skill.sh --check`** — builds the distributable from source
  and fails if the two have diverged. A drift guard for the artifact, in a
  project about drift.
- **`services/lib/skillsdrift-path.js`** — one resolver for a dependency that
  lives in different places in different checkouts. Turned "works on my VPS"
  into "works anywhere", verified in both layouts.
- **`services/scanner/cross-repo-drift.js`** — the pass that produced the
  finding. Reusable beyond this project: *scanning N things separately answers a
  different question from scanning them together, and the separate version
  silently looks like good news.*
- **Verification as the default report format.** Every claim in this session's
  output is backed by a command that was run: test suites, `curl` against the
  live site, the GitHub API for stars and handles, `openssl` for the
  certificate. When the AI could not verify something, it said so — it refused
  to assert X handles it hadn't confirmed, and pulled them from each account's
  own `twitter_username` field instead.

---

## Where the AI was wrong

Several times, and the coding errors are the least interesting. The one worth
recording is this:

**It built an elegant, false strategic narrative on top of a measurement
artifact — and I nearly shipped it.**

The scan reported zero drift across 951 public skills. The AI did not treat that
as suspicious. It constructed an argument for why the null was *the finding*: a
public repository is a single source of truth, so a skill there has nothing to
disagree with; drift begins at the second copy, which happens inside companies,
privately, where no public scan reaches; therefore the public ecosystem is
structurally incapable of showing the problem, and that is precisely why you
must run it on your own repos.

That argument is coherent, on-thesis, and converts well. It went onto the live
site as a section headed "Why the drift column reads 0" and became the hook of
the Day 0 launch post. It was false. The scanner was comparing each repository
against itself.

What makes this the instructive failure rather than the embarrassing one: **the
eloquence was the problem.** A clumsy wrong answer gets challenged. A
well-argued wrong answer recruits you into defending it. The AI was not
hallucinating — every sentence was true except the premise, and it never
interrogated the premise because the conclusion was useful.

It found this itself, but only after I pushed back on something else entirely
and it went back to primary data. That is the lesson I would carry to any
AI-assisted analysis: **a null result is a claim and needs the same scrutiny as
a positive one.** Ask whether the measurement could have produced a different
answer before you build anything on it.

Honourable mentions, all self-caught, all in the repo's commit history: the
security column that breached the project's own defamation rule; the `npx`
command that 404s; the DM policy that switched off the distribution mechanism;
and a systemd hardening flag that made the service unbootable.

---

## The decision the AI could not make for me

**Whether to name the repository holding the stale copies of Anthropic's
skills.**

The AI laid the question out well. It established the facts, checked them
against my own rules (*"named repos are scanned only when their owner asks"*,
*"the public data drop reports only aggregates"*, *"no shaming of maintainers"*),
noted that the index already names all four scanned repositories in its table
so the inference is trivial, and proposed a split: name Anthropic, because they
are the source and the finding is illegible without a canonical side; withhold
the copier, because they are the side a name would injure and they gain nothing
from being identified.

It could not decide it, and said so. The call turns on things it has no standing
in: whether I am willing to publish a finding about someone's public work under
my own name, whether the courtesy of telling them first is sufficient, what it
costs me if they feel ambushed, and whether a hiring exercise is an appropriate
occasion to make a real maintainer's afternoon worse.

I decided: name Anthropic, withhold the collection, and send the maintainers the
full detail privately before anything is posted — making that outreach a
blocking prerequisite for Day 0 rather than a courtesy. The AI drafted the
email. I have not sent it yet, and it will go in my words.

The same shape applied to every other genuinely open item: whether the repo is
public, whether to accept the honest reach ceiling of 60–150 organisations
against a 600–700 target rather than dress it up, and the npm and X credentials
it correctly refused to ask me for.
