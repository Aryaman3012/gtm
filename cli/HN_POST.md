# Show HN post (ready to publish as-is)

## Title

Show HN: skillsdrift – find out which of your team's Claude Code skills have drifted

## Body

Context: I'm completing a candidate exercise for Atlan and built this as part
of it. It's not an Atlan product and doesn't claim to be — just a real tool
I wanted to exist, published under my own name.

If your team shares Claude Code (or Codex) skills the normal way — commit a
`.claude/skills/` folder to a repo, or copy it around — nothing stops two
people from ending up with different versions of the "same" skill, nothing
tracks who owns it, and nothing checks whether it's safe to run. I kept
seeing this pattern described online (teams with 5 drifted copies of one
skill, repos with no way to tell who's responsible for what), so I built a
small CLI to make the problem visible instead of theoretical.

`skillsdrift` is a zero-dependency, zero-account Node CLI. Point it at two or
more local skills directories:

```
npx skillsdrift ~/.claude/skills path/to/teammates-repo/.claude/skills
```

It hashes every skill's files, flags same-named skills whose content differs
(with an actual line-level diff, not just "these differ"), flags skills
missing an owner or version marker, and runs 11 regex-based security checks
(curl-pipe-bash, eval(), hardcoded-looking credentials, broad `rm -rf`, sudo,
reverse-shell patterns, raw-IP network calls) — the security half is there
because Snyk's ToxicSkills research found over a third of scanned public
skills had at least one security flaw, including planted credential-theft
payloads. Output is a single Markdown report you can drop straight into a PR
or Slack.

No login, no API key, no network calls, no telemetry by default. Source,
fixtures, and tests are in the repo — `bash test/run-tests.sh` runs the full
suite against planted drift/ownership/security cases.

Repo: <link>

If the one-time report is useful and you want the always-on version for your
team — persistent drift monitoring, skill identity, owners, versions — the
pilot waitlist is here: <PILOT_URL>. (Same disclosure as above applies.)

Honest caveats: it's regex-based static analysis, not execution analysis, so
it will miss obfuscated risks and can false-positive on legitimate code. It's
brand new — no usage numbers to report yet, this is the first time it's
public. I'd genuinely like to know if this matches what other teams are
dealing with, or if I'm solving the wrong problem.
