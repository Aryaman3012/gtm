'use strict';

// Weekly (cron-equivalent) cadence job per installed repo — spec 05 §5:
// scheduled PR-opening, not per-push. Also runnable as a one-shot CLI:
//   node build/app/scheduler.js --repo-path <dir> --repo-slug <org/repo> [--test]
//
// Flow: get a checked-out repo (given directly via --repo-path in test/local
// mode, or shallow-cloned here in real/prod mode) -> run the skillsdrift v2
// engine as a subprocess against whichever of .claude/skills / .codex exist
// -> compare against the last stored scan for this repo -> if there are
// findings AND they materially changed (or there's no prior scan at all),
// hand off to pr-creator.js; otherwise skip and log "no PR needed". The
// actual GitHub-touching work (scanning is already done here; PR
// opening/updating happens in pr-creator.js) never happens inline in the
// webhook response — service.js only records install/dirty state.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { createPR } = require('./pr-creator');

const ARTIFACT_CLI = require('../lib/skillsdrift-path').cli();
const DATA_DIR = path.join(__dirname, 'data');

function sanitizeSlug(slug) {
  return String(slug).replace(/[^a-zA-Z0-9_.-]/g, '__');
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return fallback;
  }
}

// Shallow-clones a repo for real/prod runs. Not exercised by tests (test
// mode always passes --repo-path pointing at an already-checked-out fixture
// repo, per the brief — no clone needed for local/test runs).
function cloneRepo(repoSlug) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillsdrift-clone-'));
  const url = `https://github.com/${repoSlug}.git`;
  execFileSync('git', ['clone', '--depth', '1', url, tmpDir], { encoding: 'utf8' });
  return tmpDir;
}

// Runs the skillsdrift engine as a subprocess (never require()'d directly,
// per the brief) against whichever of `.claude/skills` / `.codex` exist
// under repoPath. Returns the parsed JSON report regardless of exit code
// (skillsdrift exits 1 — not 0 — when findings are present, but still
// prints the full JSON to stdout).
function runScan(repoPath) {
  const candidates = [path.join(repoPath, '.claude', 'skills'), path.join(repoPath, '.codex')];
  const existing = candidates.filter((p) => fs.existsSync(p));
  if (existing.length === 0) {
    return {
      scorecard: { skillsScanned: 0, driftedPairs: 0, unowned: 0, unversioned: 0, securityFlagged: 0 },
      drift: [],
      ownership: [],
      version: [],
      security: [],
      scannedPaths: [],
    };
  }

  let stdout;
  try {
    stdout = execFileSync('node', [ARTIFACT_CLI, ...existing, '--json'], { encoding: 'utf8' });
  } catch (err) {
    // skillsdrift exits 1 when findings are present — execFileSync throws in
    // that case, but the JSON is still on stdout per the brief; capture it
    // regardless of exit code. A genuine crash (no stdout) rethrows.
    if (err.stdout) {
      stdout = err.stdout.toString('utf8');
    } else {
      throw err;
    }
  }
  return JSON.parse(stdout);
}

function hasFindings(scan) {
  const sc = scan.scorecard || {};
  return (sc.driftedPairs || 0) + (sc.unowned || 0) + (sc.unversioned || 0) + (sc.securityFlagged || 0) > 0;
}

// Stable fingerprint of finding *identities* (not timestamps) so we can tell
// whether anything materially changed since the last stored scan.
function findingsFingerprint(scan) {
  const drift = (scan.drift || [])
    .map((d) => `${d.name}:${d.severity}:${d.a && d.a.dir}:${d.b && d.b.dir}:${(d.files || []).length}`)
    .sort();
  const ownership = (scan.ownership || []).map((o) => `${o.name}:${o.severity}:${o.dir}`).sort();
  const version = (scan.version || []).map((v) => `${v.name}:${v.severity}:${v.dir}`).sort();
  const security = (scan.security || [])
    .map((s) => `${s.name}:${s.dir}:${(s.findings || []).map((f) => f.patternId).sort().join(',')}`)
    .sort();
  return JSON.stringify({ scorecard: scan.scorecard || {}, drift, ownership, version, security });
}

function runScheduler(opts) {
  const { repoSlug, test = false, installerLogin = 'unknown' } = opts;
  let repoPath = opts.repoPath;

  if (!repoSlug) throw new Error('runScheduler requires repoSlug');
  if (!repoPath) {
    if (test) throw new Error('runScheduler in test mode requires repoPath (fixture repo) — no clone');
    repoPath = cloneRepo(repoSlug);
  }

  const slug = sanitizeSlug(repoSlug);
  const stateFile = path.join(DATA_DIR, `${slug}.json`);
  const prior = readJson(stateFile, null);

  const scan = runScan(repoPath);
  const findings = hasFindings(scan);
  const fingerprint = findingsFingerprint(scan);
  const priorFingerprint = prior && prior.lastScan && prior.lastScan.fingerprint;
  const materiallyChanged = !prior || fingerprint !== priorFingerprint;

  let prResult = null;
  let action;

  if (!findings) {
    action = 'no PR needed: no findings';
  } else if (!materiallyChanged) {
    action = 'no PR needed: findings unchanged since last run';
  } else {
    prResult = createPR({ scan, repoPath, repoSlug, installerLogin, test });
    action = 'PR opened/updated (see pr-creator output)';
  }

  const newState = {
    repoSlug,
    lastScan: Object.assign({}, scan, { fingerprint, scannedAt: new Date().toISOString() }),
    lastPR: prResult || (prior && prior.lastPR) || null,
    dirty: false,
  };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(newState, null, 2) + '\n', 'utf8');

  console.log(`[scheduler] ${repoSlug}: ${action}`);
  return { scan, findings, materiallyChanged, prResult, action };
}

function parseCliArgs(argv) {
  const opts = { test: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--repo-path') opts.repoPath = argv[++i];
    else if (arg === '--repo-slug') opts.repoSlug = argv[++i];
    else if (arg === '--installer') opts.installerLogin = argv[++i];
    else if (arg === '--test') opts.test = true;
  }
  return opts;
}

if (require.main === module) {
  const opts = parseCliArgs(process.argv.slice(2));
  if (!opts.repoSlug) {
    console.error('Usage: node build/app/scheduler.js --repo-path <dir> --repo-slug <org/repo> [--test]');
    process.exit(2);
  }
  try {
    runScheduler(opts);
  } catch (err) {
    console.error(`[scheduler] failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { runScheduler, runScan, hasFindings, findingsFingerprint, sanitizeSlug, cloneRepo };
