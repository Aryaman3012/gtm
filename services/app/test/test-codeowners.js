'use strict';

// CODEOWNERS resolution: a fixture variant with a CODEOWNERS file mapping
// the drifted skill's dirs to @platform-team -> reviewerList includes it;
// a variant with no CODEOWNERS -> graceful fallback text, no crash.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runScheduler } = require('../scheduler');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FIXTURE_WITH = path.join(__dirname, '..', 'fixtures', 'fixture-repo-codeowners');
const FIXTURE_WITHOUT = path.join(__dirname, '..', 'fixtures', 'fixture-repo');

async function run() {
  const stateWith = path.join(DATA_DIR, 'test-org__codeowners-repo.json');
  try {
    fs.unlinkSync(stateWith);
  } catch (err) {}

  const withResult = runScheduler({
    repoPath: FIXTURE_WITH,
    repoSlug: 'test-org/codeowners-repo',
    installerLogin: 'aryaman3012',
    test: true,
  });
  assert.ok(withResult.prResult, 'PR should be created for the CODEOWNERS fixture');
  assert.ok(
    withResult.prResult.reviewerList.includes('@platform-team'),
    `expected @platform-team in reviewerList, got: ${JSON.stringify(withResult.prResult.reviewerList)}`
  );
  assert.strictEqual(withResult.prResult.teamCount, 1);
  assert.ok(withResult.prResult.body.includes('@platform-team'), 'body must list @platform-team as a requested reviewer');

  const stateWithout = path.join(DATA_DIR, 'test-org__no-codeowners-repo.json');
  try {
    fs.unlinkSync(stateWithout);
  } catch (err) {}

  const withoutResult = runScheduler({
    repoPath: FIXTURE_WITHOUT,
    repoSlug: 'test-org/no-codeowners-repo',
    installerLogin: 'aryaman3012',
    test: true,
  });
  assert.ok(withoutResult.prResult, 'PR should still be created without a CODEOWNERS file (no crash)');
  assert.strictEqual(withoutResult.prResult.reviewerList.length, 0);
  assert.ok(
    withoutResult.prResult.body.includes('No CODEOWNERS entry matched'),
    'graceful fallback text expected when no CODEOWNERS file exists'
  );
}

module.exports = { run };
