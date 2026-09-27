'use strict';

const path = require('path');

// Requires skillsdrift v2's own src/ as a library — no fork, no copy of the
// scanning/reporting logic. This is the only coupling point to artifact/.
const ARTIFACT_SRC = path.join(require('../../lib/skillsdrift-path').skillsdriftDir(), 'src');
const { scanPath } = require(path.join(ARTIFACT_SRC, 'scan'));
const { buildResults, buildJsonReport } = require(path.join(ARTIFACT_SRC, 'report'));

const { resolveTarget } = require('./slug');
const { ensureCloned } = require('./clone');
const { discoverSkillRoot } = require('./discover');
const { generateCard } = require('../../cardgen/lib/generate');

const WAITLIST_URL = process.env.SKILLSDRIFT_WAITLIST_URL || '__WAITLIST_URL__';

// Scans one repo (remote slug/URL or local path) end to end: resolve ->
// (clone if remote) -> scanPath -> buildResults -> buildJsonReport -> card.
// Shared by scan-repo.js (single repo) and scan-list.js (batch).
function scanRepo(input, { log = () => {} } = {}) {
  const target = resolveTarget(input);
  const repoRoot = target.isLocal ? target.localPath : ensureCloned(target, { log });
  const org = target.isLocal ? target.slug : `${target.org}/${target.repo}`;
  const repoLink = target.isLocal ? null : `https://github.com/${target.org}/${target.repo}`;

  // discoverSkillRoot is the same shared walk oracle.js uses to decide whether a repo
  // has anything to scan; when it finds nothing, skip scanPath's (equivalent) walk too.
  const skillRoot = discoverSkillRoot(repoRoot);
  const skills = skillRoot ? scanPath(skillRoot) : [];
  const results = buildResults(skills);
  const findings = buildJsonReport(results, [repoRoot], WAITLIST_URL);
  const card = generateCard(findings, { org, repoLink });

  return { slug: target.slug, org, repoLink, repoRoot, results, findings, card };
}

module.exports = { scanRepo, WAITLIST_URL };
