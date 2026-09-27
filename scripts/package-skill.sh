#!/usr/bin/env bash
# Package skills/skillsdrift-bridge/ into dist/skillsdrift-bridge.skill
#
# A .skill file is a zip with the skill directory at its root. Build it from
# source every time rather than by hand: the first hand-built package silently
# omitted examples/, which is the same drift this project is about.
#
# Usage: ./scripts/package-skill.sh [--check]
#   --check  verify dist/ matches source without rewriting it (exit 1 if not)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_NAME="skillsdrift-bridge"
SRC="$REPO_ROOT/skills/$SKILL_NAME"
OUT="$REPO_ROOT/dist/$SKILL_NAME.skill"

CHECK=0
[ "${1:-}" = "--check" ] && CHECK=1

[ -f "$SRC/SKILL.md" ] || { echo "error: no SKILL.md in $SRC" >&2; exit 1; }
command -v zip >/dev/null || { echo "error: zip not found" >&2; exit 1; }

# Everything tracked-worthy in the skill, minus build noise.
find_payload() {
  find "$SKILL_NAME" -type f \
    ! -path '*/__pycache__/*' \
    ! -name '*.pyc' \
    ! -name '.DS_Store' \
    | LC_ALL=C sort
}

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$STAGE/$SKILL_NAME"
# Copy source in, then prune what must not ship.
cp -R "$SRC/." "$STAGE/$SKILL_NAME/"
find "$STAGE/$SKILL_NAME" \( -name '__pycache__' -type d \) -prune -exec rm -rf {} + 2>/dev/null || true
find "$STAGE/$SKILL_NAME" \( -name '*.pyc' -o -name '.DS_Store' \) -delete 2>/dev/null || true

cd "$STAGE"
PAYLOAD="$(find_payload)"
NEW="$STAGE/new.skill"
# -X drops extra attributes; fixed mtime keeps the archive reproducible.
find "$SKILL_NAME" -type f -exec touch -t 202601010000 {} +
printf '%s\n' "$PAYLOAD" | zip -q -X -@ "$NEW"

if [ "$CHECK" = 1 ]; then
  if [ ! -f "$OUT" ]; then echo "FAIL: $OUT does not exist"; exit 1; fi
  # Compare file lists and contents, not zip bytes (timestamps/order vary).
  A="$(mktemp -d)"; B="$(mktemp -d)"
  unzip -q "$OUT" -d "$A"; unzip -q "$NEW" -d "$B"
  if diff -r "$A" "$B" >/dev/null 2>&1; then
    echo "OK: dist/$SKILL_NAME.skill matches skills/$SKILL_NAME/"
    rm -rf "$A" "$B"; exit 0
  else
    echo "FAIL: dist/$SKILL_NAME.skill is out of date. Differences:"
    diff -rq "$A" "$B" || true
    rm -rf "$A" "$B"; exit 1
  fi
fi

mkdir -p "$REPO_ROOT/dist"
mv "$NEW" "$OUT"
echo "wrote dist/$SKILL_NAME.skill"
printf '%s\n' "$PAYLOAD" | sed 's/^/  /'
