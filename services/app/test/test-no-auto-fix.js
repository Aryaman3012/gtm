'use strict';

// No-auto-fix invariant (T5): whatever "files to include in the PR/branch"
// list pr-creator computes must never contain a path under `.claude/skills/`
// or `.codex/` — only a regenerated report/manifest file is ever included.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runScheduler } = require('../scheduler');

const FIXTURE_REPO = path.join(__dirname, '..', 'fixtures', 'fixture-repo');
const DATA_DIR = path.join(__dirname, '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'test-org__no-auto-fix-repo.json');

async function run() {
  try {
    fs.unlinkSync(STATE_FILE);
  } catch (err) {
    // fine if it didn't exist
  }

  const result = runScheduler({
    repoPath: FIXTURE_REPO,
    repoSlug: 'test-org/no-auto-fix-repo',
    installerLogin: 'aryaman3012',
    test: true,
  });

  assert.ok(result.prResult, 'PR should have been created for the drifted fixture');
  const files = result.prResult.filesToInclude;
  assert.ok(Array.isArray(files) && files.length > 0, 'filesToInclude must be a non-empty array');
  for (const f of files) {
    assert.ok(
      !f.includes('.claude/skills/') && !f.includes('.codex/'),
      `filesToInclude must never include a skill path, got: ${f}`
    );
  }
}

module.exports = { run };
