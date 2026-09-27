#!/usr/bin/env bash
# Local test harness for build/app — zero live network / live GitHub calls.
# Usage: bash build/app/test/run-tests.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Fresh data dir each run so tests are deterministic and don't accumulate
# state across invocations (installations.json, per-repo scan state,
# pr-draft.json all live under here).
rm -rf "$APP_DIR/data"
mkdir -p "$APP_DIR/data/cards"

node "$SCRIPT_DIR/index.js"
