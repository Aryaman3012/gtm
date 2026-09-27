#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { scanRepo } = require('./lib/scan-engine');
const { renderGallery } = require('./lib/gallery');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'out');
const DATA_DIR = path.join(ROOT, 'data');
const REPOS_CONFIG = path.join(ROOT, 'config', 'repos.json');

function parseArgs(argv) {
  const opts = { config: REPOS_CONFIG, outDir: OUT_DIR, dataDir: DATA_DIR };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config') opts.config = argv[++i];
    else if (argv[i] === '--out-dir') opts.outDir = argv[++i];
    else if (argv[i] === '--data-dir') opts.dataDir = argv[++i];
  }
  return opts;
}

// Batch mode over the curated repo list: scan each (skipping/continuing on
// clone failure or a repo with no skills dirs), aggregate into
// state-of-drift.json (the living index), and regenerate the gallery.
// --out-dir/--data-dir default to this module's own out/ and data/ (production
// use) but can be overridden — same convention as weekly-delta.js's --out-dir —
// so tests can exercise a real run without clobbering production state.
function main(argv) {
  const opts = parseArgs(argv);
  const outDir = opts.outDir;
  const dataDir = opts.dataDir;
  const repos = JSON.parse(fs.readFileSync(opts.config, 'utf8'));
  const runId = new Date().toISOString().slice(0, 10);

  fs.mkdirSync(path.join(outDir, 'cards'), { recursive: true });
  fs.mkdirSync(path.join(dataDir, 'findings'), { recursive: true });

  const byRepo = [];
  const errors = [];
  const skipped = [];
  const securityCounts = new Map();
  let totalSkillsScanned = 0;

  for (const entry of repos) {
    const slug = entry.slug;
    process.stderr.write(`scanning ${slug}...\n`);
    let result;
    try {
      result = scanRepo(slug, { log: (m) => process.stderr.write('  ' + m + '\n') });
    } catch (err) {
      process.stderr.write(`  skipped: ${err.message}\n`);
      errors.push(`${slug}: ${err.message}`);
      skipped.push({ slug, reason: err.message });
      continue;
    }

    const { findings } = result;
    if (findings.scorecard.skillsScanned === 0) {
      process.stderr.write('  skipped: no skills directory found\n');
      errors.push(`${slug}: no skills directory found`);
      skipped.push({ slug, reason: 'no skills directory found' });
      continue;
    }

    fs.writeFileSync(
      path.join(dataDir, 'findings', `${result.slug}.json`),
      JSON.stringify(findings, null, 2) + '\n',
      'utf8'
    );
    fs.writeFileSync(path.join(outDir, 'cards', `${result.slug}.html`), result.card, 'utf8');
    const cardRecord = {
      slug: result.slug,
      org: result.org,
      repoLink: result.repoLink,
      generatedAt: new Date().toISOString(),
      scorecard: findings.scorecard,
      ungovernedSkillPercentage: findings.ungovernedSkillPercentage,
      cardUrl: `cards/${result.slug}.html`,
    };
    fs.writeFileSync(
      path.join(outDir, 'cards', `${result.slug}.json`),
      JSON.stringify(cardRecord, null, 2) + '\n',
      'utf8'
    );

    byRepo.push({
      slug: entry.slug,
      cardSlug: result.slug,
      skillsScanned: findings.scorecard.skillsScanned,
      drifted: findings.scorecard.driftedPairs,
      unowned: findings.scorecard.unowned,
      unversioned: findings.scorecard.unversioned,
      securityFlagged: findings.scorecard.securityFlagged,
      ungovernedSkillPercentage: findings.ungovernedSkillPercentage,
    });
    totalSkillsScanned += findings.scorecard.skillsScanned;

    // Category-level only — never retain the repo slug on a security count.
    for (const secEntry of findings.security) {
      for (const f of secEntry.findings) {
        securityCounts.set(f.label, (securityCounts.get(f.label) || 0) + 1);
      }
    }
  }

  if (errors.length) {
    fs.writeFileSync(path.join(dataDir, 'clone-errors.log'), errors.join('\n') + '\n', 'utf8');
  }

  const totalUngovernedCount = byRepo.reduce(
    (sum, r) => sum + Math.round((r.ungovernedSkillPercentage / 100) * r.skillsScanned),
    0
  );
  const aggregateUsp = totalSkillsScanned === 0 ? 0 : Math.round((totalUngovernedCount / totalSkillsScanned) * 100);

  const state = {
    runId,
    generatedAt: new Date().toISOString(),
    reposScanned: byRepo.length,
    reposSkipped: skipped.length,
    reposSkippedDetail: skipped,
    totalSkillsScanned,
    byRepo,
    securityCategorySummary: [...securityCounts.entries()].map(([label, count]) => ({ label, count })),
    ungovernedSkillPercentage: aggregateUsp,
  };

  const statePath = path.join(outDir, 'state-of-drift.json');
  if (fs.existsSync(statePath)) {
    fs.copyFileSync(statePath, path.join(outDir, 'state-of-drift.prev.json'));
  }
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n', 'utf8');

  let delta = null;
  const deltaPath = path.join(outDir, 'weekly-delta.json');
  if (fs.existsSync(deltaPath)) {
    try {
      delta = JSON.parse(fs.readFileSync(deltaPath, 'utf8'));
    } catch {
      delta = null;
    }
  }

  fs.writeFileSync(path.join(outDir, 'index.html'), renderGallery(state, { delta }), 'utf8');

  process.stdout.write(
    `scan-list: ${state.reposScanned} repo(s) scanned, ${state.reposSkipped} skipped, ` +
      `${totalSkillsScanned} skill(s) total, ${aggregateUsp}% ungoverned\n` +
      `  state: ${statePath}\n  gallery: ${path.join(outDir, 'index.html')}\n` +
      (errors.length ? `  clone-errors: ${path.join(dataDir, 'clone-errors.log')}\n` : '')
  );
  return 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { main };
