'use strict';

const fs = require('fs');
const path = require('path');
const { scanPath, ScanError } = require('./scan');
const { buildResults, hasFindings, buildJsonReport, buildMarkdownReport } = require('./report');
const { buildManifest } = require('./manifest');
const pkg = require('../package.json');

const DEFAULT_WAITLIST_URL = '__WAITLIST_URL__';
const CHECKIN_REPORT_FILENAME = '.skillsdrift-report.md';

const HELP = `skillsdrift v${pkg.version}

Scan one or more local agent-skills directories for drift, missing
ownership, missing versioning, and basic security risk patterns.

Usage:
  skillsdrift <path> [<path>...] [options]

Arguments:
  <path>              A directory to scan (e.g. .claude/skills, .codex, or
                       any parent of one). Pass 2+ paths to detect skills
                       that exist in more than one path and have drifted.

Options:
  --json               Print machine-readable JSON to stdout instead of
                        writing a Markdown report file.
  --out <file>          Markdown report output path (default:
                        ./skillsdrift-report.md, relative to cwd).
  --manifest <file>     Import-ready manifest output path (default:
                        ./skillsdrift-manifest.json, relative to cwd).
                        Always written alongside the Markdown report.
  --language <dev|biz>  Report language: "dev" (drift/unowned/unversioned,
                        default) or "biz" (outdated/duplicated — for
                        knowledge-worker / non-engineering audiences).
                        Applies to the team-scorecard and exec-memo layers.
  --checkin             Write the report to the stable, git-friendly
                        filename ${CHECKIN_REPORT_FILENAME} instead of
                        --out, with deterministic content (no timestamp) so
                        diffs are meaningful run-to-run, and print the
                        command to commit it. Not combinable with --json.
  --waitlist-url <url>  Override the CTA URL in the report. Defaults to
                        $SKILLSDRIFT_WAITLIST_URL, or the placeholder
                        "${DEFAULT_WAITLIST_URL}" if unset.
  -v, --version         Print the version.
  -h, --help            Show this help.

Exit codes:
  0  scan completed, no findings
  1  scan completed, findings present (drift / unowned / unversioned / security)
  2  usage error (no paths given, a path doesn't exist, etc.)
`;

function parseArgs(argv) {
  const paths = [];
  const opts = {
    json: false,
    out: null,
    manifest: null,
    language: 'dev',
    checkin: false,
    waitlistUrl: null,
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--help':
      case '-h':
        opts.help = true;
        break;
      case '--version':
      case '-v':
        opts.version = true;
        break;
      case '--json':
        opts.json = true;
        break;
      case '--out':
        opts.out = argv[++i];
        break;
      case '--manifest':
        opts.manifest = argv[++i];
        break;
      case '--language': {
        const val = argv[++i];
        if (val !== 'dev' && val !== 'biz') {
          throw new UsageError(`--language must be "dev" or "biz", got: ${val}`);
        }
        opts.language = val;
        break;
      }
      case '--checkin':
        opts.checkin = true;
        break;
      case '--waitlist-url':
        opts.waitlistUrl = argv[++i];
        break;
      default:
        if (arg.startsWith('-')) {
          throw new UsageError(`Unknown option: ${arg}`);
        }
        paths.push(arg);
    }
  }

  if (opts.checkin && opts.json) {
    throw new UsageError('--checkin cannot be combined with --json.');
  }

  return { paths, opts };
}

class UsageError extends Error {}

function run(argv, { cwd = process.cwd(), stdout = process.stdout, stderr = process.stderr } = {}) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    stderr.write(`${err.message}\n\n${HELP}`);
    return 2;
  }

  const { paths, opts } = parsed;

  if (opts.help) {
    stdout.write(HELP);
    return 0;
  }
  if (opts.version) {
    stdout.write(`${pkg.version}\n`);
    return 0;
  }
  if (paths.length === 0) {
    stderr.write(`No paths given.\n\n${HELP}`);
    return 2;
  }

  let allSkills = [];
  for (const p of paths) {
    try {
      allSkills = allSkills.concat(scanPath(p));
    } catch (err) {
      if (err instanceof ScanError) {
        stderr.write(`Error: ${err.message}\n`);
        return 2;
      }
      throw err;
    }
  }

  const waitlistUrl = opts.waitlistUrl || process.env.SKILLSDRIFT_WAITLIST_URL || DEFAULT_WAITLIST_URL;
  const results = buildResults(allSkills);
  const findingsPresent = hasFindings(results);

  if (opts.json) {
    stdout.write(JSON.stringify(buildJsonReport(results, paths, waitlistUrl), null, 2) + '\n');
    return findingsPresent ? 1 : 0;
  }

  const markdown = buildMarkdownReport(results, paths, waitlistUrl, {
    language: opts.language,
    checkin: opts.checkin,
  });
  const outPath = opts.checkin
    ? path.resolve(cwd, CHECKIN_REPORT_FILENAME)
    : path.resolve(cwd, opts.out || 'skillsdrift-report.md');
  fs.writeFileSync(outPath, markdown, 'utf8');

  const manifest = buildManifest(allSkills, paths);
  const manifestPath = path.resolve(cwd, opts.manifest || 'skillsdrift-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  const sc = results.scorecard;
  let output =
    `skillsdrift: scanned ${sc.skillsScanned} skill(s) across ${paths.length} path(s)\n` +
    `  drifted=${sc.driftedPairs} unowned=${sc.unowned} unversioned=${sc.unversioned} security-flagged=${sc.securityFlagged}\n` +
    `Report written to ${outPath}\n` +
    `Manifest written to ${manifestPath}\n`;
  if (opts.checkin) {
    output += `Commit it: git add ${CHECKIN_REPORT_FILENAME} && git commit -m "skillsdrift: update report"\n`;
  }
  stdout.write(output);

  return findingsPresent ? 1 : 0;
}

module.exports = { run, parseArgs, UsageError, HELP };
