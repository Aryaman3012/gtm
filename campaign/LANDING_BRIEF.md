# skillsdrift — pilot waitlist landing page

Single-file landing page for the hosted Registry pilot waitlist. No build step, no framework — plain HTML + inline CSS + a tiny inline JS submit handler.

## Rules
- Voice: developer-to-developer, plain, honest. No marketing fluff. No fabricated stats.
- Hero explains the offer in one sentence + one line of sub-copy: "Your team's Claude Code / Codex skills are drifting apart. skillsdrift finds the drift in 30 seconds — the hosted pilot keeps them governed, always-on."
- Include: (1) what the pilot is (persistent drift monitoring, skill identity + versions + owners, install to Claude Code/Codex via one command), (2) who it's for (the engineer who accidentally owns the team's skills), (3) honest "what it is not" (not a marketplace, not a skills repo, not SOC2'd yet), (4) email waitlist form (POST placeholder — form action uses __WAITLIST_URL__ placeholder or a mailto fallback, noted for Hermes to wire), (5) footer: candidate-exercise disclosure + link to the GitHub repo.
- The form does not need a live backend for this challenge — use a `<form>` with a visible note "form wiring pending" OR a mailto: link as the working fallback. Do not fake a success state.
- Dark-mode friendly, system font stack, looks intentional, ≤300 lines total including CSS.
- One inline SVG allowed: a simple two-nodes-drifting diagram (no hand-drawn doodle style — clean geometric). 

## Content notes (write real copy, these are seeds)
- The pain (from research): "5 copies that had all drifted" — sx HN thread; "name an owner before you share the repo" — Joe Karlsson; Anthropic's own docs list "No versioning… No central registry… No team access control" as known gaps; Snyk: 36.82% of marketplace skills have security flaws.
- CTA: "Join the pilot" + "Star the repo" secondary.