'use strict';

// Builds the "Drift scorecard" notice (title + body) per
// build/specs/05-github-app.md §6, adapted per the R15 brief.
//
// THE DEFAULT IS AN ISSUE, NOT A PULL REQUEST. §1.8 step 3: "It never opens
// pull requests in other teams' repos uninvited; a colleague's forwarded note
// is welcome, while an automated PR reads as spam. A PR is opened only when the
// repo owner asks." The code already knew this in spirit — see `filesToInclude`
// below, which notes there is no code diff to merge and the body is the whole
// deliverable. A pull request with no diff is the wrong primitive: it sits in a
// review queue asking to be merged, when what it wants is a decision. An issue
// asks for the decision.
//
// A pull request is opened only on an explicit ask, recorded per installation
// as `prOptIn: true` in data/installations.json, or forced with
// { channel: 'pr' } / APP_ALLOW_PR=1. Never inferred.
//
// Never auto-fixes anything: the only files this module would ever put in a
// branch are a regenerated report/manifest — NEVER a file under
// `.claude/skills/` or `.codex/`.
//
// Test mode (env APP_TEST_MODE=1, or { test: true }): writes the composed
// notice to data/notice-draft.json instead of touching GitHub at all.
// Real mode: shells out to `gh issue create` (or `gh pr create` when opted
// in) — zero-dep, per the brief, no Octokit. APP_GH_TOKEN, if set, is passed
// through as GH_TOKEN.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { resolveOwners } = require('./codeowners');
const { generateCard: renderCard } = require('../cardgen/lib/generate');

const DATA_DIR = path.join(__dirname, 'data');
const CARDS_DIR = path.join(DATA_DIR, 'cards');
const CARD_BASE_URL = 'https://drift.aryaman.tech/cards';
const WAITLIST_PLACEHOLDER = '__WAITLIST_URL__';

// Renders the SAME universal card build/scanner and build/bot use (recurrence close,
// disclosure, CTA, redaction-by-default, no score) instead of the app's own bot-only
// card-stub.js, which predated cardgen and lacked the recurrence-close line and CTA —
// a spec-03 miss found during R16 verification (same root cause as the bot's).
function generateCard(scan, slug) {
  fs.mkdirSync(CARDS_DIR, { recursive: true });
  const html = renderCard(scan, { org: slug });
  fs.writeFileSync(path.join(CARDS_DIR, `${slug}.html`), html, 'utf8');
  return `${CARD_BASE_URL}/${slug}.html`;
}

function sanitizeSlug(slug) {
  return String(slug).replace(/[^a-zA-Z0-9_.-]/g, '__');
}

function severityRank(sev) {
  return { high: 3, medium: 2, low: 1 }[sev] || 0;
}

// Picks the single highest-severity / highest-blast-radius finding across all
// categories, for the PR title. Everything else is listed in the body.
function pickTopFinding(scan) {
  const scored = [];
  for (const d of scan.drift || []) {
    scored.push({ type: 'drift', item: d, blastRadius: (d.files || []).length, severityRank: severityRank(d.severity) });
  }
  for (const s of scan.security || []) {
    const findingSeverities = (s.findings || []).map((f) => severityRank(f.severity));
    scored.push({
      type: 'security',
      item: s,
      blastRadius: (s.findings || []).length,
      severityRank: findingSeverities.length ? Math.max(...findingSeverities) : 0,
    });
  }
  for (const o of scan.ownership || []) {
    scored.push({ type: 'ownership', item: o, blastRadius: 1, severityRank: severityRank(o.severity) });
  }
  for (const v of scan.version || []) {
    scored.push({ type: 'version', item: v, blastRadius: 1, severityRank: severityRank(v.severity) });
  }
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.severityRank - a.severityRank || b.blastRadius - a.blastRadius);
  return scored[0];
}

function buildTitle(top, teamCount) {
  const tc = teamCount || 0;
  if (!top) return 'Drift scorecard: no findings';
  if (top.type === 'drift') {
    const n = 2; // a drift entry is always a pair of diverged copies
    const fileCount = (top.item.files || []).length;
    return `Drift scorecard: ${n} version(s) of ${top.item.name} diverged, used by ${tc} teammate(s), ${fileCount} file(s) affected`;
  }
  if (top.type === 'security') {
    const n = (top.item.findings || []).length;
    return `Drift scorecard: ${n} security finding(s) flagged in ${top.item.name}, used by ${tc} teammate(s), ${n} file(s) affected`;
  }
  if (top.type === 'ownership') {
    return `Drift scorecard: 1 skill missing an owner (${top.item.name}), used by ${tc} teammate(s), 1 file(s) affected`;
  }
  // version
  return `Drift scorecard: 1 skill missing version info (${top.item.name}), used by ${tc} teammate(s), 1 file(s) affected`;
}

function relDir(repoPath, absDir) {
  if (!absDir) return absDir;
  try {
    const rel = path.relative(repoPath, absDir);
    return rel || '.';
  } catch (err) {
    return absDir;
  }
}

// Category-level for security (never "repo X has finding Y"); drift/ownership
// details are fine to be specific per the brief.
function buildFindingsList(scan, repoPath) {
  const lines = [];

  for (const d of scan.drift || []) {
    const fileCount = (d.files || []).length;
    lines.push(
      `- \`${d.name}\` diverged: 2 versions found across \`${relDir(repoPath, d.a && d.a.dir)}\` and ` +
        `\`${relDir(repoPath, d.b && d.b.dir)}\` (${fileCount} file(s) changed, severity: ${d.severity}).`
    );
  }
  for (const o of scan.ownership || []) {
    lines.push(`- \`${o.name}\` is missing an owner (\`${relDir(repoPath, o.dir)}\`).`);
  }
  for (const v of scan.version || []) {
    lines.push(`- \`${v.name}\` is missing version info (\`${relDir(repoPath, v.dir)}\`).`);
  }
  if ((scan.security || []).length) {
    const categoryCounts = {};
    for (const s of scan.security) {
      for (const f of s.findings || []) {
        categoryCounts[f.label] = (categoryCounts[f.label] || 0) + 1;
      }
    }
    const skillCount = scan.security.length;
    for (const [label, count] of Object.entries(categoryCounts)) {
      lines.push(`- Security: ${count} finding(s) of category "${label}" across ${skillCount} skill(s) (category-level only — no snippets shown here).`);
    }
  }
  if (lines.length === 0) lines.push('- (no findings)');
  return lines.join('\n');
}

function affectedDirs(scan) {
  const dirs = [];
  for (const d of scan.drift || []) {
    if (d.a && d.a.dir) dirs.push(d.a.dir);
    if (d.b && d.b.dir) dirs.push(d.b.dir);
  }
  for (const o of scan.ownership || []) if (o.dir) dirs.push(o.dir);
  for (const v of scan.version || []) if (v.dir) dirs.push(v.dir);
  for (const s of scan.security || []) if (s.dir) dirs.push(s.dir);
  return Array.from(new Set(dirs));
}

function buildBody({ scan, repoPath, installerLogin, cardUrl, reviewerInfo, channel = 'issue' }) {
  const noun = channel === 'pr' ? 'pull request' : 'issue';
  const findingsList = buildFindingsList(scan, repoPath);
  const reviewerLine = reviewerInfo.reviewerList.length
    ? reviewerInfo.reviewerList.join(', ')
    : reviewerInfo.notes[0] || 'No CODEOWNERS entry matched';
  const extraNotes = reviewerInfo.notes.length > 1 ? reviewerInfo.notes.slice(1).map((n) => `> ${n}`).join('\n') + '\n' : '';

  return `### Disclosure

This ${noun} was opened automatically by the skillsdrift GitHub App — a candidate exercise for
Atlan, not an Atlan product. It was installed on this repo by ${installerLogin}.

### What changed

skillsdrift's weekly scan found:

${findingsList}

### Card

Full scorecard: ${cardUrl}

### Why this is an issue and not a pull request

There is nothing here to merge. Picking the canonical copy is a decision for the people who own
these skills, and a mechanical merge would just create one more diverged copy. This app does not
open pull requests in a repo uninvited. If your team would rather receive these as a PR, say so
on this issue and we will switch this installation over.

### How to resolve this

To resolve it:

1. Pick the canonical version of the affected skill(s) with the owning team.
2. Run the manual check-in flow: \`node skillsdrift.js <path> --checkin\` and commit
   \`.skillsdrift-report.md\` so the next scan has a deterministic diff.
3. If your team wants this tracked centrally instead of re-discovered every week, import into
   the Registry: ${WAITLIST_PLACEHOLDER}.

### Recurrence close

This will drift again the moment someone edits a copy without checking in through one source.
A weekly scan will keep finding it; only a governed source stops it recurring.

Close this ${noun} if it is unwanted — no changes are ever made to your files, and you can
turn the weekly check off from the app settings.

---
${extraNotes}_Reviewers requested via CODEOWNERS: ${reviewerLine}_
`;
}

// Resolve the delivery channel. An issue unless the repo owner has explicitly
// asked for pull requests — recorded per installation, passed in, or forced by
// env. Never inferred from anything about the repo.
function resolveChannel({ channel, prOptIn }) {
  if (channel === 'pr' || channel === 'issue') return channel;
  if (prOptIn === true) return 'pr';
  if (process.env.APP_ALLOW_PR === '1') return 'pr';
  return 'issue';
}

function createNotice({ scan, repoPath, repoSlug, installerLogin, test, channel, prOptIn }) {
  const resolvedChannel = resolveChannel({ channel, prOptIn });
  const resolvedInstaller = installerLogin || 'unknown';
  const top = pickTopFinding(scan);
  const affected = affectedDirs(scan);
  const reviewerInfo = resolveOwners(repoPath, affected);
  const teamCount = reviewerInfo.teamCount;
  const title = buildTitle(top, teamCount);
  const slug = sanitizeSlug(repoSlug);
  const cardUrl = generateCard(scan, slug);
  const body = buildBody({ scan, repoPath, installerLogin: resolvedInstaller, cardUrl, reviewerInfo, channel: resolvedChannel });

  // No-auto-fix invariant (T5): the only files this PR's branch would ever
  // contain are a regenerated report/manifest — never a modification to any
  // file under `.claude/skills/` or `.codex/`. There is no code diff to
  // merge; the PR body is the deliverable. We deliberately do not shell out
  // to `skillsdrift.js --checkin` here (that would mutate the scanned repo
  // on disk, including test fixtures) — this list documents intent/contract
  // for whatever real PR-opening mechanism consumes it.
  const filesToInclude = ['.skillsdrift-report.md', '.skillsdrift-manifest.json'];

  const draft = {
    repoSlug,
    channel: resolvedChannel,
    installerLogin: resolvedInstaller,
    title,
    body,
    reviewerList: reviewerInfo.reviewerList,
    teamCount,
    filesToInclude,
    cardUrl,
    createdAt: new Date().toISOString(),
  };

  const isTestMode = Boolean(test) || process.env.APP_TEST_MODE === '1';

  if (isTestMode) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const draftPath = path.join(DATA_DIR, 'notice-draft.json');
    fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2) + '\n', 'utf8');
    return Object.assign({ mode: 'test', draftPath }, draft);
  }

  // Real mode: shell out to `gh` — zero-dep, works today (per the brief this
  // replaces spec 05's Octokit path). Not exercised in tests.
  const env = Object.assign({}, process.env);
  if (process.env.APP_GH_TOKEN) env.GH_TOKEN = process.env.APP_GH_TOKEN;
  const args =
    resolvedChannel === 'pr'
      ? ['pr', 'create', '--title', title, '--body', body, '--repo', repoSlug]
      : ['issue', 'create', '--title', title, '--body', body, '--repo', repoSlug];
  let output;
  try {
    output = execFileSync('gh', args, { cwd: repoPath, env, encoding: 'utf8' });
  } catch (err) {
    return Object.assign({ mode: 'real', error: String(err.message || err) }, draft);
  }
  return Object.assign({ mode: 'real', output }, draft);
}

// Explicit opt-in helper: only call this when a repo owner has asked for pull
// requests. Kept separate so an uninvited PR cannot happen by passing the
// wrong argument to the general entrypoint.
function createPullRequestOnRequest(opts) {
  return createNotice(Object.assign({}, opts, { channel: 'pr' }));
}

module.exports = {
  createNotice,
  createPullRequestOnRequest,
  pickTopFinding,
  buildTitle,
  buildFindingsList,
  affectedDirs,
  buildBody,
  sanitizeSlug,
  severityRank,
};
