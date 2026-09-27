#!/usr/bin/env bash
# Test harness for build/scanner + build/cardgen (R14). No network — the
# scanner test runs against a LOCAL artifact fixture repo, never a clone.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"
# The CLI lives at <root>/cli here and <root>/artifact on the VPS; resolve it
# the same way the services do instead of assuming either layout.
SKILLSDRIFT_DIR="$(node -e 'process.stdout.write(require(process.argv[1]+"/lib/skillsdrift-path").skillsdriftDir())' "$DIR")"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail() {
  echo "FAIL: $1"
  exit 1
}

echo "== 1. cardgen golden-file: fixture report -> card HTML fragments =="
node "$DIR/cardgen/cardgen.js" "$DIR/test/fixtures/sample-report.json" --org "Acme Corp" --slug acme-test --out "$TMP/cards"
CARD="$TMP/cards/acme-test.html"
[ -f "$CARD" ] || fail "expected card HTML to be written"
grep -q "Acme Corp" "$CARD" || fail "expected org name in card"
grep -Eq '[0-9]+%' "$CARD" || fail "expected a USP percentage in card"
grep -q "candidate exercise for Atlan" "$CARD" || fail "expected disclosure"
grep -q "__WAITLIST_URL__" "$CARD" || fail "expected waitlist placeholder"
grep -q "drift again" "$CARD" || fail "expected recurrence-close language"
if grep -q '<script src=' "$CARD"; then fail "unexpected external script tag"; fi

echo "== 2. cardgen redaction: no full paths, no @handles, no emails, no raw snippet leak =="
if grep -q "/home/" "$CARD"; then fail "leaked a /home/ path into card"; fi
if grep -Eq '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "$CARD"; then fail "leaked an email address into card"; fi
if grep -q "install.example.com" "$CARD"; then fail "leaked a raw security snippet/URL into card"; fi
if grep -qi "curl -fsSL" "$CARD"; then fail "leaked a raw security snippet into card"; fi

echo "== 3. no hygiene score: no grade/score/rating class or letter grade =="
if grep -Eqi 'class="[^"]*(score|grade|rating)[^"]*"' "$CARD"; then fail "found a score/grade/rating class name"; fi

echo "== 4. scan-repo against a LOCAL fixture repo (no network) =="
SCAN_OUT="$(node "$DIR/scanner/scan-repo.js" "$SKILLSDRIFT_DIR/fixtures/repo-a" 2>&1)" || { echo "$SCAN_OUT"; fail "scan-repo.js exited non-zero"; }
echo "$SCAN_OUT" | grep -q "skill(s)" || fail "expected scan-repo summary output"
SLUG="repo-a"
[ -f "$DIR/scanner/data/findings/$SLUG.json" ] || fail "expected findings JSON to be written"
[ -f "$DIR/scanner/out/cards/$SLUG.html" ] || fail "expected card HTML to be written"
[ -f "$DIR/scanner/out/cards/$SLUG.json" ] || fail "expected card record JSON to be written"
node -e '
  const fs = require("fs");
  const findings = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  if (!(findings.scorecard.skillsScanned > 0)) { console.error("FAIL: expected skills scanned > 0"); process.exit(1); }
' "$DIR/scanner/data/findings/$SLUG.json"

echo "== 5. slug rule: remote org/repo -> org--repo, local path -> basename slug =="
node -e '
  const { resolveTarget } = require("'"$DIR"'/scanner/lib/slug");
  const t = resolveTarget("anthropics/skills");
  if (t.slug !== "anthropics--skills") { console.error("FAIL: expected slug anthropics--skills, got " + t.slug); process.exit(1); }
  if (t.cloneUrl !== "https://github.com/anthropics/skills.git") { console.error("FAIL: unexpected clone URL " + t.cloneUrl); process.exit(1); }
  const u = require("'"$DIR"'/scanner/lib/slug").resolveTarget("https://github.com/vercel-labs/skills");
  if (u.slug !== "vercel-labs--skills") { console.error("FAIL: expected slug vercel-labs--skills, got " + u.slug); process.exit(1); }
  const local = require("'"$DIR"'/scanner/lib/slug").resolveTarget("'"$SKILLSDRIFT_DIR"'/fixtures/repo-a");
  if (!local.isLocal || local.slug !== "repo-a") { console.error("FAIL: expected local slug repo-a, got " + JSON.stringify(local)); process.exit(1); }
'

echo "== 6. cache TTL rule: fresh marker is reused, 25h-old marker is stale =="
node -e '
  const fs = require("fs");
  const path = require("path");
  const { isFresh, markCloned } = require("'"$DIR"'/scanner/lib/cache");
  const dir = path.join("'"$TMP"'", "cache-test");
  if (isFresh(dir)) { console.error("FAIL: expected no marker to mean not fresh"); process.exit(1); }
  markCloned(dir);
  if (!isFresh(dir)) { console.error("FAIL: expected freshly marked dir to be fresh"); process.exit(1); }
  fs.writeFileSync(path.join(dir, ".cloned-at"), String(Date.now() - 25 * 60 * 60 * 1000));
  if (isFresh(dir)) { console.error("FAIL: expected 25h-old marker to be stale"); process.exit(1); }
'

echo "== 7. weekly-delta: two fixture state files -> delta markdown =="
DELTA_OUT_DIR="$TMP/delta-out"
node "$DIR/scanner/weekly-delta.js" --previous "$DIR/test/fixtures/state-a.json" --current "$DIR/test/fixtures/state-b.json" --out-dir "$DELTA_OUT_DIR" >/dev/null
DELTA_MD="$DELTA_OUT_DIR/weekly-delta.md"
[ -f "$DELTA_MD" ] || fail "expected weekly-delta.md to be generated"
grep -q "new drifted" "$DELTA_MD" || fail "expected 'new drifted' language in delta markdown"
grep -q "newly orphaned" "$DELTA_MD" || fail "expected 'newly orphaned' language in delta markdown"
grep -q "2 new drifted, 5 newly orphaned" "$DELTA_MD" || fail "expected computed delta numbers (2 new drifted, 5 newly orphaned)"
grep -q "org-c/repo-c" "$DELTA_MD" || fail "expected new repo org-c/repo-c to be listed"

echo "== 8. discover.js: repo-root skill-dir layout (S1 — e.g. anthropics/skills has skill dirs directly under repo root, not .claude/skills) =="
REPOROOT_FIXTURE="$TMP/repo-root-fixture"
mkdir -p "$REPOROOT_FIXTURE/my-skill"
cat > "$REPOROOT_FIXTURE/my-skill/SKILL.md" <<'EOF'
---
name: my-skill
---
Body.
EOF
node -e '
  const { discoverSkillRoot } = require("'"$DIR"'/scanner/lib/discover");
  const root = discoverSkillRoot("'"$REPOROOT_FIXTURE"'");
  if (root !== "'"$REPOROOT_FIXTURE"'") { console.error("FAIL: expected discoverSkillRoot to find the repo-root-layout skill, got " + root); process.exit(1); }
  const emptyRoot = discoverSkillRoot("'"$TMP"'/does-not-exist");
  if (emptyRoot !== null) { console.error("FAIL: expected null for a nonexistent path"); process.exit(1); }
'
SCAN_OUT2="$(node "$DIR/scanner/scan-repo.js" "$REPOROOT_FIXTURE" 2>&1)" || { echo "$SCAN_OUT2"; fail "scan-repo.js exited non-zero on repo-root-layout fixture"; }
echo "$SCAN_OUT2" | grep -q "1 skill(s)" || { echo "$SCAN_OUT2"; fail "expected scan-repo to find the repo-root-layout skill"; }

echo "== 9. shared discovery: oracle.js (bot) and scan-engine.js (scanner) resolve the same repo-root-layout fixture consistently =="
node -e '
  const oracle = require("'"$DIR"'/bot/oracle");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  const cacheFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "discover-shared-")), "scan-cache.json");
  const result = oracle.scanRepo("test-org/repo-root-fixture", { localPath: "'"$REPOROOT_FIXTURE"'", cacheFile });
  if (result.status !== "ok") { console.error("FAIL: expected oracle.scanRepo to find skills via shared discovery, got status=" + result.status); process.exit(1); }
'

echo "== 10. scan-list: skip-reason logging (S3 — state-of-drift.json must record WHY each repo was skipped) =="
SCANLIST_TMP="$TMP/scan-list-test"
mkdir -p "$SCANLIST_TMP/out" "$SCANLIST_TMP/data"
EMPTY_FIXTURE="$SCANLIST_TMP/empty-fixture"
mkdir -p "$EMPTY_FIXTURE"
cat > "$SCANLIST_TMP/repos.json" <<EOF
[
  { "slug": "$SKILLSDRIFT_DIR/fixtures/repo-a" },
  { "slug": "$EMPTY_FIXTURE" },
  { "slug": "$SCANLIST_TMP/does-not-exist" }
]
EOF
node "$DIR/scanner/scan-list.js" --config "$SCANLIST_TMP/repos.json" --out-dir "$SCANLIST_TMP/out" --data-dir "$SCANLIST_TMP/data" 2>&1 \
  | grep -q "skipped" || fail "expected scan-list stderr to mention skipped repos"
STATE_FILE="$SCANLIST_TMP/out/state-of-drift.json"
node -e '
  const fs = require("fs");
  const state = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  if (!Array.isArray(state.reposSkippedDetail) || state.reposSkippedDetail.length !== 2) {
    console.error("FAIL: expected 2 reposSkippedDetail entries, got " + JSON.stringify(state.reposSkippedDetail));
    process.exit(1);
  }
  for (const entry of state.reposSkippedDetail) {
    if (!entry.slug || !entry.reason) {
      console.error("FAIL: every skipped entry needs slug+reason, got " + JSON.stringify(entry));
      process.exit(1);
    }
  }
  if (state.reposSkipped !== state.reposSkippedDetail.length) { console.error("FAIL: reposSkipped count mismatch"); process.exit(1); }
' "$STATE_FILE"

echo ""
echo "ALL TESTS PASSED"
