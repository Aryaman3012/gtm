#!/usr/bin/env bash
# Copies build/scanner/out/ (the public gallery + cards) to a target dir for
# nginx to serve. Does NOT touch nginx config or DNS — those are Aryaman's
# action items (see build/specs/00-feasibility-notes.md). This script only
# prepares the static output; hosting it is a separate, human-run step.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/out" && pwd)"
DEST="${1:?Usage: deploy.sh <target-dir>}"

mkdir -p "$DEST"
rsync -a --delete "$SRC/" "$DEST/"
echo "Deployed $SRC -> $DEST"
