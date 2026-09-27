# 03 — Shareable report card (build #3)

Status: build-ready. The generator has no dependency on specs 01/02 — it consumes local
skillsdrift v2 output directly. Only the hosting step depends on an Aryaman DNS action.

## 1. Purpose (reframed, R14)

**The shareable unit across every surface** — not a report-card add-on, the one artifact every
other surface hands off to. Bot replies (spec 01) carry card links; the weekly report (spec 02) is
a card gallery (`build/scanner/out/index.html`); org scans emit redacted cards; the exec memo is a
card. Screenshot-perfect, one glance = whole story: USP headline, category-level findings, a
recurrence close, disclosure, one waitlist CTA — no score, no grade, no leaderboard (T5 — state,
not judgment).

It carries the exec-memo layer to a DM via a link that survives personnel change (fixes B4 —
single-seat risk, `strategy/two-hop-gtm.md` §B4), and seeds the snowball via a "governed" status
marker. T5-compliant by construction: **no numeric hygiene score.** The card reports findings and
state, never a grade.

**R14 implementation note:** built as `build/cardgen/cardgen.js` (+ `build/cardgen/lib/`), not as
the `artifact/skillsdrift-card.js` sibling-CLI location originally specced below — the R14 brief
consolidated it as a standalone generator so `build/scanner/`'s `scan-repo.js`/`scan-list.js` could
`require()` it directly as the shared card-rendering library for every surface (bot replies, gallery
cards, org-scan cards) without depending on `artifact/`'s own bin layout. `artifact/` itself was not
modified (boundary: require its `src/` as a library, never fork or edit it). Sections 3 and 9 below
describe the original artifact-sibling design; treat `build/cardgen/{cardgen.js,lib/generate.js,
lib/redact.js,lib/template.js}` plus `build/run-tests.sh` as the as-built location and test entry
point.

## 2. Input contract

The card generator reads the *same two files* a normal skillsdrift run already produces — it does
not re-scan anything itself:

```
skillsdrift-report-card <report.md-or-manifest-dir> [options]

Required input (one of):
  --manifest <path>     path to skillsdrift-manifest.json (schema atlan-registry-import/1)
  --json <path>         path to a saved `skillsdrift --json` output (preferred — richer data)

Options:
  --org "<name>"        display name shown on the card (default: "A team", fully generic)
  --slug <slug>         output filename stem, e.g. "acme-2026-09-26" -> acme-2026-09-26.html
                         (default: derived from --org, slugified, + date)
  --out <dir>           output directory (default: ./skillsdrift-report/)
  --pilot-url <url>     overrides the __PILOT_URL__ placeholder (default: env
                         $SKILLSDRIFT_WAITLIST_URL or literal "__PILOT_URL__")
  --no-redact           disable path/username redaction (see §4) — off by default, must be explicit
```

Recommended real usage: run skillsdrift first (`node skillsdrift.js ~/.claude/skills teammate/
.claude/skills --json > scan.json`), then generate the card from that JSON — this is how the
card gets real scorecard numbers without re-implementing any scanning logic.

## 3. Where it lives

```
artifact/                              # existing skillsdrift v2 repo — sibling script, not a new repo
├── skillsdrift.js                     # existing entry point, untouched
├── skillsdrift-card.js                # NEW: sibling CLI entry, same zero-dep constraint
├── src/
│   ├── ...                            # existing modules, untouched
│   └── card/
│       ├── generate.js                # reads --json/--manifest, builds the card model
│       ├── redact.js                  # redaction rules, §4
│       ├── template.js                # inline HTML+CSS template, string-based (no build step)
│       └── render.js                  # fills template, writes file, enforces the ≤50KB budget
├── fixtures/
│   └── card-sample.json               # a saved --json output, for golden-file card tests
└── test/
    └── card.test.js                   # new test file alongside existing test/run-tests.sh cases
```

This is a **new CLI mode in the existing `artifact/` repo**, not a new package — it reuses
skillsdrift's existing zero-dep Node setup and test runner (`bash test/run-tests.sh` already
exists and should grow to cover `card.test.js`). `skillsdrift-card.js` is a separate bin so the
core scanner's `package.json` `bin` entry doesn't change shape.

## 4. Redaction rules (default ON — `--no-redact` required to disable)

The card travels by screenshot and link once shared; it must never leak internal detail even if
forwarded outside the org. `redact.js` applies these transforms to every string pulled from the
input JSON/manifest before it reaches the template:

| Field source | Rule |
|---|---|
| `scannedPaths[]` / `paths_scanned[]` (full filesystem paths) | Never rendered verbatim. Replaced with a path-shape summary only: `"2 local skills directories"` (count + generic noun), never the actual path string. |
| `owner` / `owner_suggestion` (manifest emails/usernames) | Never rendered. The card shows *counts* of owned/unowned skills, never who owns what. |
| Skill `name` fields | Rendered as-is (skill names like "pdf-gen" are not sensitive) UNLESS `--org` is unset, in which case names still render — redaction targets *identity/location*, not skill labels. |
| Security `snippet` fields (raw code/credential-like strings from `security[]`) | Never rendered on the card at all — the card shows the security **count** and category labels (e.g. "2 findings: credential pattern, unsafe shell pipe"), never the matched snippet text (which may contain a real-looking secret string even if it's a fixture/test value). |
| `--org` value | Used verbatim as the display name (that's an explicit opt-in disclosure — the user typed it deliberately). Default when omitted: `"A team"`. |
| Hostname / username in `content_hash`-adjacent metadata, if any is added later | Treat any future field containing a local username or hostname the same as `owner`: never rendered. |

`--no-redact` exists for Aryaman's own internal dry-runs / demos where showing real paths is
useful for debugging generator output — it must never be the default and should print a one-line
warning to stderr when used: `"--no-redact: this card will contain unredacted local paths — do not share it."`

## 5. Content structure (single HTML page, ≤ 50KB)

Sections, top to bottom:

1. **USP headline** — `"{org}'s agent skills, audited"` (or the generic default if `--org` unset).
2. **Scorecard row** — three stat blocks, counts only, no percentage-as-grade framing:
   - Ungoverned skills (unowned or unversioned count)
   - Drift incidents (count)
   - Security findings (count, category labels only per §4 — e.g. "2 (credential pattern,
     unsafe shell pipe)")
3. **Three-layer structure, compressed** — one collapsed summary per layer (engineer / team /
   leader), reusing the same language as `artifact/src/report.js`'s existing Markdown report
   (do not invent new copy — pull the recurrence-close and framing lines verbatim from the
   existing report generator so the card and the full report never contradict each other).
4. **Recurrence close** — verbatim from the scan input if present (skillsdrift v2's report
   already computes a recurrence-close string per layer; the card generator reads the same
   underlying data model, not the rendered Markdown, so it must replicate
   `artifact/src/report.js`'s recurrence-close text exactly — see implementation note below).
5. **Disclosure footer** — fixed text, always present, not configurable:
   `"Generated by skillsdrift — part of a candidate exercise for Atlan, not an Atlan product."`
6. **Pilot CTA** — `"Want this running automatically, every sprint? {pilotUrl}"` where
   `{pilotUrl}` is `__PILOT_URL__` unless overridden (matches the existing skillsdrift CLI's own
   `--waitlist-url` convention — same placeholder string, same override mechanism, for
   consistency across every surface).

**Explicitly excluded (T5 — no hygiene score):** no percentage-as-grade, no letter grade, no
"B+", no single composite number presented as a score. The `ungovernedSkillPercentage` field
from the JSON output MAY appear only as a plain labeled count inside the scorecard row (e.g.
"41% of skills scanned" as a factual stat next to "Ungoverned skills: 12 of 29"), never as a
standalone badge, gauge, or letter grade — the difference is presentation: a bare number in a
sentence is a fact, a colored badge/gauge is a grade. No visual score gauge, meter, or star
rating of any kind anywhere on the card.

**Implementation note on reuse:** `src/card/generate.js` should import and call the same
recurrence-close string builders that `artifact/src/report.js` uses internally (refactor those
into small exported functions if they're currently inline in `report.js`), rather than
duplicating the close-text strings — this keeps the card and the full Markdown report from
drifting apart when the copy is tuned later.

## 6. Technical constraints

- **No external assets.** All CSS inline in a `<style>` block, no external fonts/images/scripts,
  no CDN links. Any icon needed is inline SVG or a Unicode glyph.
- **Dark-mode friendly.** Use `prefers-color-scheme: dark` media query with a matching palette;
  don't ship a JS toggle (keeps it a fully static file, zero JS is preferred but not mandated —
  if any JS is added it must be inert without it, e.g. a dark-mode toggle that degrades to
  system-preference-only with JS disabled).
- **≤ 50KB total file size.** `render.js` asserts this after writing (`fs.statSync(...).size`)
  and throws a build error if exceeded — this is a hard CI-checkable constraint, not a guideline.
- **Zero network calls from the page itself** — no analytics script tag, no pixel, no external
  `<link>`/`<script src>` of any kind (§8 makes this explicit).

## 7. Hosting / deploy steps

Follows the existing `testing.aryaman.tech` nginx pattern (00-feasibility-notes.md environment
facts).

**Aryaman-owned action item:** add a DNS A/AAAA record for the chosen subdomain (spec proposes
`drift.aryaman.tech`) pointing at this VPS, matching how `testing.*` / `dashboard.*` /
`personal.*` are already set up.

Once DNS exists, deploy is a static-file copy + one nginx server block:

```nginx
# /etc/nginx/sites-available/drift.aryaman.tech
server {
    listen 80;
    server_name drift.aryaman.tech;
    root /var/www/drift.aryaman.tech;
    location /cards/ {
        try_files $uri $uri.html =404;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/drift.aryaman.tech /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# then, per generated card:
mkdir -p /var/www/drift.aryaman.tech/cards
cp skillsdrift-report/<slug>.html /var/www/drift.aryaman.tech/cards/<slug>.html
```

Until DNS is set up, the generator output is still fully usable: cards are plain local HTML files
that open directly in a browser (`file://` URL) for review/demo, or can be copied under
`testing.aryaman.tech/cards/` as a temporary path if Aryaman wants an interim shareable link
before committing to the new subdomain (00-feasibility-notes.md blocking item #2).

## 8. Zero-telemetry (explicit, binding)

The card is a static file. It ships with:
- **No analytics pixel** (no Google Analytics, Plausible, Fathom, etc.).
- **No beacon** (`navigator.sendBeacon`, tracking `<img>`, etc.).
- **No client-side script** that reports views, clicks, or any interaction back to any server.

If Aryaman later wants view counts, the correct mechanism is a server-side nginx access-log grep
against `/cards/<slug>.html` hits (`grep <slug>.html /var/log/nginx/access.log | wc -l`) — never
client-side tracking added to the page. This spec forbids adding any tracking to the HTML output;
a future view-count feature is explicitly out of scope for this build and must be implemented
server-side only, if ever.

## 9. Test plan

Added to `artifact/test/` alongside the existing suite (`bash test/run-tests.sh`).

1. **Golden-file: card generation.** `fixtures/card-sample.json` → `generate.js` + `render.js` →
   assert the output HTML matches a checked-in `fixtures/expected-card.html` byte-for-byte.
2. **Redaction.** Fixture containing a real-looking local path (`/home/alice/.claude/skills`)
   and an owner email → generate with default redaction → assert neither string appears anywhere
   in the rendered HTML output.
3. **`--no-redact` opt-out.** Same fixture, `--no-redact` flag → assert the path *does* appear
   (proves the flag works) AND assert the stderr warning string is printed.
4. **No hygiene score.** Regex-scan the rendered HTML for score-like patterns (a standalone
   percentage not adjacent to a labeled count noun, any `grade`/`score`/`rating` class name or
   attribute) → assert none match. Concretely: assert the string `ungovernedSkillPercentage`'s
   value never appears without being immediately preceded/followed by explanatory count text in
   the same sentence, and assert no HTML element has a `class` or `id` containing `score`,
   `grade`, or `rating`.
5. **Size budget.** Generate from the largest realistic fixture (many skills, many findings) →
   assert `fs.statSync(output).size <= 50 * 1024`; if this fails, that's a template-bloat bug to
   fix before shipping, not a spec change.
6. **Zero-telemetry.** Regex-scan rendered HTML for `<script`, `sendBeacon`, `googletagmanager`,
   `plausible`, `fathom`, any `<img` with a `src` pointing off-page → assert zero matches (a
   `<script>` tag is only permitted if it contains an inline dark-mode media-query fallback with
   no network calls — assert any matched `<script>` block contains no `fetch`/`XMLHttpRequest`/
   `sendBeacon`/`src=` reference).
7. **Disclosure presence.** Assert the exact disclosure string from §5.5 is present.
8. **Org display name.** `--org "Acme Corp"` → assert "Acme Corp" appears in the headline; no
   `--org` → assert the generic default "A team" appears and no org-identifying string leaks in
   from the input fixture's paths.
