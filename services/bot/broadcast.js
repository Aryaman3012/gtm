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
const GALLERY_URL = 'https://drift.aryaman.tech/cards/';
const MAX_FINDING_TWEETS = 6;

function loadFindings(sourcePath) {
  const raw = fs.readFileSync(sourcePath || DEFAULT_SOURCE, 'utf8');
  return JSON.parse(raw);
}

function hookTweet(findings) {
  const reposScanned = findings.reposScanned ?? 0;
  const totalSkills = findings.totalSkillsScanned ?? 0;
  const pct = findings.ungovernedSkillPercentage ?? 0;
  return `Ran skillsdrift across ${reposScanned} public skill repos this week. ${pct}% of the ${totalSkills} scanned skills show at least one governance gap.`;
}

function securityFindingTweets(findings) {
  return (findings.securityCategorySummary || []).map(
    (s) => `Security (category-level only, no repo named): ${s.count}x "${s.label}" pattern found across the sample.`
  );
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

  const parts = [hook, ...findingLines, RECURRENCE_CLOSE_LINE, DISCLOSURE_LINE, `Per-repo cards: ${GALLERY_URL}`];
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
