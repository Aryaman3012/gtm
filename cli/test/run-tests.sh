#!/usr/bin/env bash
# Runs skillsdrift against the fixtures and asserts each finding category
# fires, drift diffs show real changed lines, and exit codes are correct.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail() {
  echo "FAIL: $1"
  exit 1
}

cp -R "$DIR/fixtures/repo-a" "$TMP/repo-a"
cp -R "$DIR/fixtures/repo-b" "$TMP/repo-b"

echo "== 1. --json run against both fixture repos: exit 1, all categories present =="
set +e
OUTPUT="$(node "$DIR/skillsdrift.js" --json "$TMP/repo-a/.claude/skills" "$TMP/repo-b/.claude/skills")"
CODE=$?
set -e
[ "$CODE" -eq 1 ] || fail "expected exit code 1 (findings present), got $CODE"

echo "$OUTPUT" | node -e '
  let data = "";
  process.stdin.on("data", (c) => (data += c));
  process.stdin.on("end", () => {
    const report = JSON.parse(data);
    const assertTrue = (cond, msg) => {
      if (!cond) {
        console.error("FAIL: " + msg);
        process.exit(1);
      }
    };
    assertTrue(report.scorecard.skillsScanned === 8, "expected 8 skills scanned, got " + report.scorecard.skillsScanned);
    assertTrue(report.drift.some((d) => d.name === "pdf-gen"), "expected pdf-gen drift pair to be detected");
    const pdfDrift = report.drift.find((d) => d.name === "pdf-gen");
    const skillMdDiff = pdfDrift.files.find((f) => f.relPath === "SKILL.md");
    assertTrue(skillMdDiff && skillMdDiff.changes && skillMdDiff.changes.length > 0, "expected pdf-gen drift to include actual changed lines, not just a differs flag");
    assertTrue(!report.drift.some((d) => d.name === "changelog-writer"), "expected changelog-writer NOT to be flagged as drifted (identical content)");
    assertTrue(report.ownership.some((o) => o.name === "no-owner-skill"), "expected no-owner-skill to be flagged unowned");
    assertTrue(report.version.some((v) => v.name === "no-version-skill"), "expected no-version-skill to be flagged unversioned");
    assertTrue(report.security.some((s) => s.name === "installer-helper"), "expected installer-helper to be security-flagged (curl | bash)");
    assertTrue(report.security.some((s) => s.name === "legacy-webhook"), "expected legacy-webhook to be security-flagged (AWS key / eval)");
    console.log("assertions OK: drift/ownership/version/security all detected with line-level diff");
  });
'

echo "== 2. default (Markdown) run: exit 1, report file written =="
cd "$TMP"
set +e
node "$DIR/skillsdrift.js" "$TMP/repo-a/.claude/skills" "$TMP/repo-b/.claude/skills"
CODE2=$?
set -e
[ "$CODE2" -eq 1 ] || fail "expected exit code 1 for markdown run, got $CODE2"
[ -f "$TMP/skillsdrift-report.md" ] || fail "expected skillsdrift-report.md to be written"
grep -q "pdf-gen" "$TMP/skillsdrift-report.md" || fail "expected report to mention pdf-gen"
grep -q "no-owner-skill" "$TMP/skillsdrift-report.md" || fail "expected report to mention no-owner-skill"
cd "$DIR"

echo "== 3. clean directory (single, complete skill): exit 0 =="
mkdir -p "$TMP/clean-only/.claude/skills"
cp -R "$DIR/fixtures/repo-a/.claude/skills/changelog-writer" "$TMP/clean-only/.claude/skills/"
set +e
node "$DIR/skillsdrift.js" --out "$TMP/clean-report.md" --manifest "$TMP/clean-manifest.json" "$TMP/clean-only/.claude/skills"
CODE3=$?
set -e
[ "$CODE3" -eq 0 ] || fail "expected exit code 0 for a clean skill directory, got $CODE3"

echo "== 4. missing path: exit 2 =="
set +e
node "$DIR/skillsdrift.js" "$TMP/does-not-exist" >/dev/null 2>&1
CODE4=$?
set -e
[ "$CODE4" -eq 2 ] || fail "expected exit code 2 for a missing path, got $CODE4"

echo "== 5. no arguments: exit 2 =="
set +e
node "$DIR/skillsdrift.js" >/dev/null 2>&1
CODE5=$?
set -e
[ "$CODE5" -eq 2 ] || fail "expected exit code 2 for missing arguments, got $CODE5"

echo "== 6. --help: exit 0, prints usage =="
set +e
HELP_OUT="$(node "$DIR/skillsdrift.js" --help)"
CODE6=$?
set -e
[ "$CODE6" -eq 0 ] || fail "expected exit code 0 for --help, got $CODE6"
echo "$HELP_OUT" | grep -q "Usage:" || fail "expected --help output to contain usage text"

echo "== 7. 3-layer report: headers, USP headline, 3 recurrence closes =="
mkdir -p "$TMP/layer-test"
REPORT7="$TMP/layer-test/skillsdrift-report.md"
MANIFEST7="$TMP/layer-test/skillsdrift-manifest.json"
set +e
node "$DIR/skillsdrift.js" --out "$REPORT7" --manifest "$MANIFEST7" "$TMP/repo-a/.claude/skills" "$TMP/repo-b/.claude/skills"
CODE7=$?
set -e
[ "$CODE7" -eq 1 ] || fail "expected exit code 1 for layer test, got $CODE7"
grep -q "^## Layer 1 — Engineer view" "$REPORT7" || fail "expected Layer 1 header"
grep -q "^## Layer 2 — Team scorecard" "$REPORT7" || fail "expected Layer 2 header"
grep -q "^## For your AI lead / VP" "$REPORT7" || fail "expected Layer 3 (exec memo) header"
grep -Eq '> \*\*[0-9]+% of this team.s agent skills' "$REPORT7" || fail "expected USP headline with a percentage"
CLOSE_COUNT=$(grep -c '\*\*Recurrence close:\*\*' "$REPORT7")
[ "$CLOSE_COUNT" -eq 3 ] || fail "expected 3 recurrence closes, found $CLOSE_COUNT"

echo "== 8. manifest: valid JSON, duplicate_groups >=1, suggested_action correctness =="
node -e '
  const fs = require("fs");
  const m = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const assertTrue = (cond, msg) => {
    if (!cond) {
      console.error("FAIL: " + msg);
      process.exit(1);
    }
  };
  assertTrue(m.schema === "atlan-registry-import/1", "expected schema atlan-registry-import/1");
  assertTrue(Array.isArray(m.skills) && m.skills.length > 0, "expected non-empty skills array");
  assertTrue(Array.isArray(m.duplicate_groups) && m.duplicate_groups.length >= 1, "expected duplicate_groups.length >= 1");
  assertTrue(/changelog-writer/.test(JSON.stringify(m.duplicate_groups)), "expected changelog-writer to be a duplicate group (identical across repo-a/repo-b)");
  assertTrue(/pdf-gen/.test(JSON.stringify(m.duplicate_groups)), "expected pdf-gen to be a duplicate group (drifted across repo-a/repo-b)");
  const pdfEntries = m.skills.filter((s) => s.name === "pdf-gen");
  assertTrue(pdfEntries.length === 2, "expected 2 manifest entries for pdf-gen (2 distinct versions), got " + pdfEntries.length);
  assertTrue(pdfEntries.every((s) => s.suggested_action === "merge"), "expected pdf-gen entries suggested_action=merge (drifted duplicate)");
  const changelogEntries = m.skills.filter((s) => s.name === "changelog-writer");
  assertTrue(changelogEntries.length === 1, "expected 1 manifest entry for changelog-writer (identical content collapses), got " + changelogEntries.length);
  assertTrue(changelogEntries[0].suggested_action === "import", "expected changelog-writer suggested_action=import (identical duplicate)");
  const installerEntry = m.skills.find((s) => s.name === "installer-helper");
  assertTrue(installerEntry && installerEntry.suggested_action === "review", "expected installer-helper suggested_action=review (security-flagged)");
  const noOwnerEntry = m.skills.find((s) => s.name === "no-owner-skill");
  assertTrue(noOwnerEntry && noOwnerEntry.owner === null && noOwnerEntry.owner_suggestion === "last-editor-or-runner", "expected no-owner-skill to carry an owner_suggestion");
  console.log("assertions OK: manifest schema, duplicate_groups, suggested_action all correct");
' "$MANIFEST7"

echo "== 9. --language biz: outdated/duplicated phrasing present, no unowned/unversioned tokens in scorecard+memo =="
BIZ_REPORT="$TMP/biz-report.md"
BIZ_MANIFEST="$TMP/biz-manifest.json"
set +e
node "$DIR/skillsdrift.js" --language biz --out "$BIZ_REPORT" --manifest "$BIZ_MANIFEST" "$TMP/repo-a/.claude/skills"
CODE9=$?
set -e
[ "$CODE9" -eq 1 ] || fail "expected exit code 1 for biz-language run, got $CODE9"
grep -Eqi "outdated|duplicated" "$BIZ_REPORT" || fail "expected 'outdated' or 'duplicated' phrasing in biz report"
BIZ_SECTIONS="$(sed -n '/^## Layer 2/,$p' "$BIZ_REPORT")"
if echo "$BIZ_SECTIONS" | grep -qi "unowned"; then fail "unexpected literal 'unowned' in biz scorecard/memo sections"; fi
if echo "$BIZ_SECTIONS" | grep -qi "unversioned"; then fail "unexpected literal 'unversioned' in biz scorecard/memo sections"; fi

echo "== 10. --checkin: writes .skillsdrift-report.md, deterministic, contains scorecard layer =="
mkdir -p "$TMP/checkin-test/skills-src"
cp -R "$TMP/repo-a/.claude" "$TMP/checkin-test/skills-src/.claude"
cd "$TMP/checkin-test"
set +e
node "$DIR/skillsdrift.js" --checkin "$TMP/checkin-test/skills-src/.claude/skills"
CODE10=$?
set -e
[ "$CODE10" -eq 1 ] || fail "expected exit code 1 for --checkin run (findings present), got $CODE10"
[ -f "$TMP/checkin-test/.skillsdrift-report.md" ] || fail "expected .skillsdrift-report.md to be created by --checkin"
grep -q "^## Layer 2 — Team scorecard" "$TMP/checkin-test/.skillsdrift-report.md" || fail "expected checkin report to contain the scorecard layer"
if grep -q "^Generated:" "$TMP/checkin-test/.skillsdrift-report.md"; then fail "expected checkin report to omit the Generated timestamp for deterministic diffs"; fi
cd "$DIR"

echo ""
echo "ALL TESTS PASSED"
