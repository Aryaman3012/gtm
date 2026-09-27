'use strict';

// No-findings path: a fixture repo with zero findings -> no PR attempted,
// and notice-draft.json (if one exists from an earlier, unrelated test) must be
// left completely untouched by this run.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runScheduler } = require('../scheduler');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FIXTURE_CLEAN = path.join(__dirname, '..', 'fixtures', 'fixture-repo-clean');
const STATE_FILE = path.join(DATA_DIR, 'test-org__clean-repo.json');
const DRAFT_FILE = path.join(DATA_DIR, 'notice-draft.json');

async function run() {
  try {
    fs.unlinkSync(STATE_FILE);
  } catch (err) {}

  const draftBefore = fs.existsSync(DRAFT_FILE) ? fs.readFileSync(DRAFT_FILE, 'utf8') : null;

  const result = runScheduler({
    repoPath: FIXTURE_CLEAN,
    repoSlug: 'test-org/clean-repo',
    installerLogin: 'aryaman3012',
    test: true,
  });

  assert.strictEqual(result.findings, false, 'fixture-repo-clean should have zero findings');
  assert.strictEqual(result.prResult, null, 'no PR should be attempted when there are zero findings');

  const draftAfter = fs.existsSync(DRAFT_FILE) ? fs.readFileSync(DRAFT_FILE, 'utf8') : null;
  assert.strictEqual(draftAfter, draftBefore, 'notice-draft.json must not be (re)written on the no-findings path');
}

module.exports = { run };
