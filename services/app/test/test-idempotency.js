'use strict';

// Idempotency: run the scan-to-PR pipeline twice against the same unchanged
// fixture -> the second run must not open/update a PR (no duplicate draft) —
// it should explicitly signal "findings unchanged since last run, skip".

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runScheduler } = require('../scheduler');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FIXTURE_REPO = path.join(__dirname, '..', 'fixtures', 'fixture-repo');
const STATE_FILE = path.join(DATA_DIR, 'test-org__idempotency-repo.json');
const DRAFT_FILE = path.join(DATA_DIR, 'pr-draft.json');

async function run() {
  try {
    fs.unlinkSync(STATE_FILE);
  } catch (err) {}

  const first = runScheduler({
    repoPath: FIXTURE_REPO,
    repoSlug: 'test-org/idempotency-repo',
    installerLogin: 'aryaman3012',
    test: true,
  });
  assert.ok(first.prResult, 'first run should open a PR (no prior scan exists)');
  const firstCreatedAt = JSON.parse(fs.readFileSync(DRAFT_FILE, 'utf8')).createdAt;

  // small delay so a wrongly-rewritten draft would carry a detectably different timestamp
  await new Promise((resolve) => setTimeout(resolve, 20));

  const second = runScheduler({
    repoPath: FIXTURE_REPO,
    repoSlug: 'test-org/idempotency-repo',
    installerLogin: 'aryaman3012',
    test: true,
  });
  assert.strictEqual(second.prResult, null, 'second run against an unchanged fixture must not produce a new PR draft');
  assert.strictEqual(second.action, 'no PR needed: findings unchanged since last run');

  const secondCreatedAt = JSON.parse(fs.readFileSync(DRAFT_FILE, 'utf8')).createdAt;
  assert.strictEqual(secondCreatedAt, firstCreatedAt, 'pr-draft.json must not be rewritten when nothing materially changed');
}

module.exports = { run };
