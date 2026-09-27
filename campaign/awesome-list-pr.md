# Awesome-list PR template (ComposioHQ / travisvn / BehiSecc variants)

## PR title
Add skillsdrift — CLI to detect drifted, unowned, and risky agent skills across repos

## PR body
Hi maintainers — adding a tool we built for teams whose Claude Code / Codex skills spread informally and drifted (multiple copies across repos, no owners, no versions).

**skillsdrift** — zero-config CLI (`npx skillsdrift <paths>`), no account, MIT. Scans one or more skills directories and reports:
- drifted duplicate skills across repos (with line-level diffs)
- skills missing an owner marker
- skills missing a version marker
- security-flagged patterns (curl|bash pipes, credential-shaped strings, eval — heuristics inspired by Snyk's ToxicSkills findings that 36.82% of marketplace skills have security flaws)

Sample report in the README. Built while working through a GTM candidate exercise for Atlan (their Agent Registry product addresses the governed-skill layer; this CLI is the free diagnostic).

Suggested entry:
```markdown
- [skillsdrift](https://github.com/<user>/skillsdrift) – Audit your team's agent skills: drift, ownership, versioning, and security risk across Claude Code / Codex / MCP skill directories.
```

Happy to adjust the description. Thanks for maintaining this list!

## Notes for submitter (not in PR)
- ComposioHQ list: check their CONTRIBUTING for entry format/alphabetical order before submitting.
- travisvn + BehiSecc lists: same, check formatting conventions.
- Submit AFTER ≥1 week of real usage evidence exists (stars, issues) — a PR to a 74k-star list with a 3-day-old repo gets rejected.
- One PR per list; space them out; never mass-submit.