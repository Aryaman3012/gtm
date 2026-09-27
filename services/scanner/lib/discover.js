'use strict';

const fs = require('fs');
const path = require('path');

// Mirrors artifact/src/scan.js's own walk (same ignore rules, same depth limit,
// same case-insensitive SKILL.md match) so a "does this repo have skills" verdict
// here always agrees with what an actual skillsdrift scan of the same root would
// find. Shared by build/scanner (scan-engine.js) and build/bot (oracle.js) so both
// use IDENTICAL skill-dir detection instead of drifting apart (the S1 bug: oracle.js
// only checked `.claude/skills` and `.codex`, missing repo-root layouts like
// anthropics/skills where each skill dir sits directly under the repo root).
const IGNORE_DIRS = new Set(['.git', 'node_modules', '.DS_Store']);
const MAX_DEPTH = 8;
const SKILL_FILENAME_RE = /^skill\.md$/i;

function hasSkillsUnder(dir, depth) {
  depth = depth || 0;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return false;
  }
  if (entries.some((e) => e.isFile() && SKILL_FILENAME_RE.test(e.name))) return true;
  if (depth >= MAX_DEPTH) return false;
  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORE_DIRS.has(entry.name)) {
      if (hasSkillsUnder(path.join(dir, entry.name), depth + 1)) return true;
    }
  }
  return false;
}

// Given a cloned/checked-out repo root, returns the path skillsdrift should scan
// (the repo root itself — its own recursive walk finds SKILL.md wherever it lives:
// repo-root skill dirs, .claude/skills/, .codex/, .agents/, skills/, or any custom
// nesting), or null if no SKILL.md exists anywhere under it.
function discoverSkillRoot(repoRoot) {
  return hasSkillsUnder(repoRoot) ? repoRoot : null;
}

module.exports = { discoverSkillRoot, hasSkillsUnder };
