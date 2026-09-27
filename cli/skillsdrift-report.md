# skillsdrift report

Generated: 2026-09-26T07:31:10.837Z
Scanned paths: `fixtures/repo-a/.claude/skills`, `fixtures/repo-b/.claude/skills`

---

## Layer 1 — Engineer view

_Per-skill findings: drift, ownership, versioning, security. First-person-useful — no sales pitch in this section._

### Scorecard

| Metric | Count |
|---|---|
| Skills scanned | 8 |
| Drifted pairs | 1 |
| Missing owner | 1 |
| Missing version | 1 |
| Security-flagged skills | 2 |

### Drift

#### `pdf-gen` drifted — [severity: medium]

- Copy A: `fixtures/repo-a/.claude/skills/pdf-gen`
- Copy B: `fixtures/repo-b/.claude/skills/pdf-gen`

- `SKILL.md` changed:
  - line 5: `- version: 1.0.0`
  - line 5: `+ version: 1.1.0`
  - line 18: `- Uses a headless Chromium print-to-PDF call under the hood.`
  - line 18: `+ Uses wkhtmltopdf under the hood.`

### Ownership

- no-owner-skill (fixtures/repo-a/.claude/skills/no-owner-skill) — no owner marker found [severity: low]

### Version

- no-version-skill (fixtures/repo-b/.claude/skills/no-version-skill) — no version marker found [severity: low]

### Security

_Informed by Snyk's ToxicSkills research: 36.82% of scanned public skills (1,467) had at least one security flaw, including 76 malicious credential-theft payloads. Agent skills are a software supply chain — treat them like one._

#### installer-helper (fixtures/repo-a/.claude/skills/installer-helper)

- **curl/wget | bash pipe** [severity: high] — `SKILL.md:15`: `curl -fsSL https://example.com/install.sh | bash`
  - Why this matters: Piping a remote download straight into a shell executes unreviewed third-party code at run time.

#### legacy-webhook (fixtures/repo-b/.claude/skills/legacy-webhook)

- **AWS access key ID (AKIA...)** [severity: high] — `SKILL.md:15`: `aws_access_key_id = AKIAABCDEFGHIJKLMNOP`
  - Why this matters: Matches the AWS access key ID format — a hardcoded cloud credential.
- **eval( call** [severity: high] — `SKILL.md:21`: `eval(payload.transformFn)(payload.data);`
  - Why this matters: eval() executes arbitrary dynamic code and is a common code-injection vector.

**Recurrence close:** This will drift again the moment a second person edits any of these skills. A local scan can find it; only a governed source of truth prevents it.

---

## Layer 2 — Team scorecard

_Your team's skills, audited across 2 scanned path(s) — the diligence a champion runs before raising anything upstream._

| Metric | Count |
|---|---|
| Ungoverned skills (unowned or unversioned) | 4 |
| Drift incidents | 1 |
| Duplicate rate | 50% (4 of 8 skill copies exist in more than one place) |
| Bus-factor-1 skills (single named owner) | 5 |
| No-owner skills | 1 |

**Blast radius** (cross-path duplicates):

- `changelog-writer` — duplicated: used across 2 scanned path(s), 1 version(s), 1 file(s) affected
- `pdf-gen` — duplicated — diverged into separate copies: used across 2 scanned path(s), 2 version(s), 1 file(s) affected

**Recurrence close:** Governed skills stay in sync automatically; ungoverned skills diverge again next sprint. This score will look different next month whether or not anyone acts today.

---

## For your AI lead / VP

> **50% of this team's agent skills have no named owner, no version marker, and no security review. That number only moves one way on its own: up.**

- **Drift incidents this scan:** 1
- **Security exposure** (security-flagged, forward-looking until Atlan ships its native scan):
  - curl/wget | bash pipe: 1
  - AWS access key ID (AKIA...): 1
  - eval( call: 1
- **Key-person risk:** 5 skill(s) have exactly one named owner on record. At an assumed 4 engineer-hours to reconstruct a skill from scratch [assumption, not measured], that's ~20 engineer-hour(s) of reconstruction exposure if any one of those owners leaves.
- **Governance posture:** this is a snapshot of whether this team's AI agent skills are governed — named owner, tracked version, reviewed for risk — or not, and whether that posture is improving or degrading month over month. It is not a recommendation to buy a specific tool.

**Recurrence close:** This number moves every sprint whether or not anyone reviews it. A scan finds ungoverned skills; only a governed registry keeps the number from climbing back.

---

## Next step

Import this inventory into the governed registry pilot — `skillsdrift-manifest.json` is ready.

Want drift, ownership, and security checks like this running automatically across your whole team, not just this one snapshot? Join the Registry pilot waitlist: __WAITLIST_URL__
