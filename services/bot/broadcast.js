'use strict';

/**
 * broadcast.js — weekly-delta thread draft.
 *
 * build/scanner/weekly-delta does not exist yet (R14 not built when this was spec'd),
 * so this is a thin adapter: reads a findings JSON shaped loosely like spec 02 §3 stage 4's
 * aggregate output (byRepo/drift/duplication/securityCategorySummary/ungovernedSkillPercentage)
 * and produces a thread draft. Falls back to build/bot/fixtures/sample-findings.json if no
 * --source path is given.
 */

const fs = require('fs');
const path = require('path');

const { numberThread, DISCLOSURE_LINE, RECURRENCE_CLOSE_LINE } = require('./oracle');

const DEFAULT_SOURCE = path.join(__dirname, 'fixtures', 'sample-findings.json');
// The index root, not /cards/ — directory listing is off, so that path 403s.
const BROADCAST_DISCLOSURE_LINE =
  'Disclosure: this is a candidate exercise for Atlan, not an Atlan product, and unaffiliated with any company in the scan. Method on the index.';
const GALLERY_URL = 'https://drift.aryaman.tech';
// Was 6, which produced a 10-tweet thread nobody finishes. The weekly delta
// earns attention with the headline and the argument, not with an exhaustive
// list — the index carries the full breakdown.
const MAX_FINDING_TWEETS = 3;

function loadFindings(sourcePath) {
  const raw = fs.readFileSync(sourcePath || DEFAULT_SOURCE, 'utf8');
  return JSON.parse(raw);
}

// The hook must match the framing the index itself uses (§3.4): the ungoverned
// percentage is retracted — it measures a file convention, since public
// libraries keep ownership in git rather than in frontmatter — and the drift
// count being zero is the finding, not a gap to paper over.
function hookTweet(findings) {
  const reposScanned = findings.reposScanned ?? 0;
  const totalSkills = findings.totalSkillsScanned ?? 0;
  const drifted = (findings.byRepo || []).reduce((n, r) => n + (r.drifted || 0), 0);

  if (drifted === 0) {
    return `Scanned ${totalSkills} public agent skills across ${reposScanned} repos this week, looking for drift. Found none — and that is the finding. A public repo is one source of truth; it has nothing to disagree with.`;
  }
  return `Scanned ${totalSkills} public agent skills across ${reposScanned} repos this week. ${drifted} drifted pair(s): the same skill in two places, contents no longer matching.`;
}

// Drift only begins at the second copy, which happens inside companies where no
// public scan reaches. That is the argument for running it yourself, so it is
// the tweet that precedes the CTA rather than a line buried mid-thread.
function whyItMattersTweet() {
  return 'Drift starts at the second copy — a second repo, a second assistant, someone\'s laptop. All of that happens inside companies, in private. No public scan can see it; only your own can.';
}

// One aggregate line, not one tweet per category. Six near-identical tweets was
// a thread nobody finishes, and the per-category breakdown belongs on the index
// where it can be read at a glance rather than scrolled.
function securityFindingTweets(findings) {
  const cats = findings.securityCategorySummary || [];
  if (cats.length === 0) return [];
  const total = cats.reduce((n, c) => n + c.count, 0);
  const named = cats
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((c) => c.label)
    .join(' and ');
  return [
    `${total} risky patterns across ${cats.length} categories in the same sample — most often ${named}. Reported by category across the whole sample, never tied to a named repo. Patterns worth a human look, not verdicts.`,
  ];
}

function driftFindingTweets(findings) {
  return (findings.drift || []).map((d) => {
    const repoCount = (d.repos || []).length;
    return `${d.name}: drifted across ${repoCount} of the scanned repos (severity: ${d.severity || 'n/a'}) — common pattern when a skill is copy-pasted instead of shared from one source.`;
  });
}

function duplicationFindingTweets(findings) {
  return (findings.duplication || []).map(
    (d) => `${d.name} shows up in ${((d.repos || []).length)} places across the sample with ${d.versionCount} different versions live at once.`
  );
}

/** Pure function: findings JSON -> thread draft object { tweets: [] }. */
function buildBroadcastThread(findings) {
  const hook = hookTweet(findings);

  // Prioritize security-category and drift/duplication kinds, cap at 6 total.
  const findingLines = [
    ...securityFindingTweets(findings),
    ...driftFindingTweets(findings),
    ...duplicationFindingTweets(findings),
  ].slice(0, MAX_FINDING_TWEETS);

  const parts = [
    hook,
    ...findingLines,
    whyItMattersTweet(),
    RECURRENCE_CLOSE_LINE,
    `Index, method and per-repo cards: ${GALLERY_URL}`,
    'Run it on your own repos — local, read-only, no account, no network call: git clone https://github.com/Aryaman3012/gtm && node gtm/cli/skillsdrift.js .claude/skills .codex',
    BROADCAST_DISCLOSURE_LINE,
  ];
  return { tweets: numberThread(parts) };
}

/** Writes the broadcast draft to build/bot/drafts/broadcast-<date>.json. Returns the file path. */
function writeBroadcastDraft(opts = {}) {
  const findings = loadFindings(opts.source);
  const thread = buildBroadcastThread(findings);
  const date = opts.date || new Date().toISOString().slice(0, 10);
  const draftsDir = opts.draftsDir || path.join(__dirname, 'drafts');
  fs.mkdirSync(draftsDir, { recursive: true });
  const filePath = path.join(draftsDir, `broadcast-${date}.json`);
  const draft = {
    runId: findings.runId || date,
    generatedAt: new Date().toISOString(),
    status: 'draft',
    approved: false,
    tweets: thread.tweets,
  };
  fs.writeFileSync(filePath, JSON.stringify(draft, null, 2), 'utf8');
  return filePath;
}

module.exports = {
  loadFindings,
  buildBroadcastThread,
  writeBroadcastDraft,
  DEFAULT_SOURCE,
  GALLERY_URL,
};
