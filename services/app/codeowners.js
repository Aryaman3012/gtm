'use strict';

// CODEOWNERS resolution (spec 05 §7 / B4 fix): route review requests to a
// team/CODEOWNERS entry rather than a single assignee. Never throws on a
// missing or non-matching CODEOWNERS file — always falls back gracefully.

const fs = require('fs');
const path = require('path');

const LOOKUP_LOCATIONS = ['CODEOWNERS', path.join('.github', 'CODEOWNERS'), path.join('docs', 'CODEOWNERS')];

function parseCodeowners(content) {
  const rules = [];
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    const pattern = parts[0];
    const owners = parts.slice(1);
    if (pattern && owners.length) rules.push({ pattern, owners });
  }
  return rules;
}

function loadCodeowners(repoPath) {
  for (const rel of LOOKUP_LOCATIONS) {
    const full = path.join(repoPath, rel);
    if (fs.existsSync(full)) {
      try {
        return parseCodeowners(fs.readFileSync(full, 'utf8'));
      } catch (err) {
        return null;
      }
    }
  }
  return null;
}

// Naive-but-sufficient matcher for the directory-style patterns skills use
// (e.g. ".claude/skills/pdf-gen/" or "/.codex/pdf-gen/**"). Treats the
// pattern as a path prefix once `**`/`*` are normalized away.
function patternMatches(pattern, relPath) {
  let pat = pattern.replace(/^\//, '');
  pat = pat.replace(/\*\*/g, '').replace(/\*/g, '');
  if (!pat) return false;
  return relPath.startsWith(pat);
}

// affectedDirsAbs: absolute directory paths of skills with findings.
// Returns { reviewerList, teamCount, notes }.
function resolveOwners(repoPath, affectedDirsAbs) {
  const result = { reviewerList: [], teamCount: 0, notes: [] };
  let rules;
  try {
    rules = loadCodeowners(repoPath);
  } catch (err) {
    rules = null;
  }

  if (!rules || rules.length === 0) {
    result.notes.push('No CODEOWNERS entry matched — consider adding a CODEOWNERS file for the affected skill(s).');
    return result;
  }

  const ownersSet = new Set();
  const unmatchedPaths = [];

  for (const absDir of affectedDirsAbs) {
    let rel;
    try {
      rel = path.relative(repoPath, absDir).split(path.sep).join('/');
    } catch (err) {
      continue;
    }
    if (!rel || rel.startsWith('..')) continue;
    const relWithSlash = rel.endsWith('/') ? rel : rel + '/';

    let best = null;
    for (const rule of rules) {
      if (patternMatches(rule.pattern, relWithSlash)) best = rule;
    }
    if (best) {
      best.owners.forEach((o) => ownersSet.add(o));
    } else {
      unmatchedPaths.push(rel);
    }
  }

  result.reviewerList = Array.from(ownersSet);
  result.teamCount = result.reviewerList.length;

  for (const p of unmatchedPaths) {
    result.notes.push(`No CODEOWNERS entry matched for \`${p}\`.`);
  }
  if (result.reviewerList.length === 0 && result.notes.length === 0) {
    result.notes.push('No CODEOWNERS entry matched.');
  }
  return result;
}

module.exports = { loadCodeowners, parseCodeowners, patternMatches, resolveOwners };
