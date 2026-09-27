#!/usr/bin/env node
'use strict';
/**
 * cross-repo-drift.js — find the same skill living in two repositories with
 * contents that no longer match.
 *
 * WHY THIS EXISTS. scan-list.js scans each repository on its own:
 *
 *     for (const entry of repos) { result = scanRepo(slug) }
 *
 * A skill cannot drift against itself, so a per-repo scan reports zero drift
 * across public repositories no matter how much drift is actually there. The
 * index said "0 drifted" for months and the conclusion drawn from it — that
 * drift is invisible in public and only happens inside companies — was an
 * artefact of the harness, not a finding.
 *
 * Run the same skillsdrift engine over every cached clone AT ONCE and the drift
 * appears immediately: every Anthropic official skill vendored into the largest
 * community list has diverged from its source.
 *
 * The CLI was always right. Only the way it was being called was wrong.
 *
 *   node cross-repo-drift.js [--cache <dir>] [--out <file>]
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CACHE_DIR = path.join(__dirname, '.cache');
const OUT_FILE = path.join(__dirname, 'out', 'cross-repo-drift.json');
const CLI = require('../lib/skillsdrift-path').cli();

function parseArgs(argv) {
  const opts = { cache: CACHE_DIR, out: OUT_FILE };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--cache') opts.cache = argv[++i];
    else if (argv[i] === '--out') opts.out = argv[++i];
  }
  return opts;
}

/** Clone directories that actually contain at least one SKILL.md. */
function rootsWithSkills(cacheDir) {
  if (!fs.existsSync(cacheDir)) return [];
  return fs
    .readdirSync(cacheDir)
    .map((name) => path.join(cacheDir, name))
    .filter((p) => fs.statSync(p).isDirectory())
    .filter((p) => {
      const stack = [p];
      while (stack.length) {
        const dir = stack.pop();
        let entries;
        try {
          entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
          continue;
        }
        for (const e of entries) {
          if (e.isFile() && e.name === 'SKILL.md') return true;
          if (e.isDirectory() && e.name !== '.git') stack.push(path.join(dir, e.name));
        }
      }
      return false;
    });
}

function runCombinedScan(roots) {
  // spawnSync, not execFileSync. skillsdrift exits non-zero whenever it finds
  // anything, which is the normal case — and execFileSync TRUNCATES stdout on
  // its error path regardless of maxBuffer (measured: 146,103 bytes captured
  // out of 1,469,069). spawnSync does not throw, so the full buffer survives.
  const res = spawnSync('node', [CLI, ...roots, '--json'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (res.error) throw res.error;
  if (!res.stdout) {
    throw new Error(`skillsdrift produced no output (status ${res.status}): ${res.stderr || ''}`);
  }
  return JSON.parse(res.stdout);
}

/** Repo slug from a cache directory name: "owner--repo" -> "owner/repo". */
function slugOf(rootPath) {
  return path.basename(rootPath).replace('--', '/');
}

function main(argv) {
  const opts = parseArgs(argv);
  const roots = rootsWithSkills(opts.cache);
  if (roots.length < 2) {
    process.stderr.write(
      `cross-repo-drift: need at least 2 cached repos containing skills, found ${roots.length}.\n` +
        'Run scan-list.js first to populate the clone cache.\n'
    );
    return 2;
  }

  process.stderr.write(`cross-repo-drift: comparing ${roots.length} repos in one pass\n`);
  const report = runCombinedScan(roots);

  const pairs = (report.drift || []).map((d) => ({
    skill: d.name,
    severity: d.severity,
    a: slugOf(d.a.rootLabel),
    b: slugOf(d.b.rootLabel),
    filesChanged: (d.files || []).length,
  }));

  const out = {
    generatedAt: new Date().toISOString(),
    reposCompared: roots.map(slugOf),
    skillsScanned: (report.scorecard || {}).skillsScanned || 0,
    driftedPairs: pairs.length,
    duplicateGroups: (report.duplicateGroups || []).length,
    pairs,
  };

  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  fs.writeFileSync(opts.out, JSON.stringify(out, null, 2) + '\n', 'utf8');

  process.stderr.write(
    `cross-repo-drift: ${out.driftedPairs} drifted pair(s) across ${out.reposCompared.length} repos ` +
      `(${out.skillsScanned} skills). Written to ${opts.out}\n`
  );
  for (const p of pairs) {
    process.stderr.write(`  ${p.skill}: ${p.a} vs ${p.b} — ${p.filesChanged} file(s) differ\n`);
  }
  return 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { rootsWithSkills, slugOf, main };
