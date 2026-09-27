'use strict';
// §1.8 step 3: the app never opens a pull request in someone's repo uninvited.
// "A colleague's forwarded note is welcome, while an automated PR reads as
// spam. A PR is opened only when the repo owner asks."
//
// This is the test that keeps that promise honest. It asserts the default
// channel is an issue, that a PR happens ONLY on an explicit ask, and that the
// body tells the reader why it is an issue.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createNotice, createPullRequestOnRequest } = require('../pr-creator');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DRAFT_FILE = path.join(DATA_DIR, 'notice-draft.json');

// A minimal scan with one drifted pair — enough to produce a notice.
const scan = {
  scorecard: { skillsScanned: 2, driftedPairs: 1, unowned: 0, unversioned: 0, securityFlagged: 0 },
  drift: [
    {
      name: 'pdf-gen',
      severity: 'medium',
      a: { rootLabel: 'repo-a', dir: '/tmp/fixture/.claude/skills/pdf-gen' },
      b: { rootLabel: 'repo-b', dir: '/tmp/fixture/.codex/pdf-gen' },
      files: [{ relPath: 'SKILL.md', status: 'changed', changes: [] }],
    },
  ],
  ownership: [],
  version: [],
  security: [],
  scannedPaths: ['/tmp/fixture/.claude/skills', '/tmp/fixture/.codex'],
};

const base = {
  scan,
  repoPath: '/tmp/fixture',
  repoSlug: 'test-org/policy-repo',
  installerLogin: 'aryaman3012',
  test: true,
};

function run() {
  // 1. Default channel is an issue.
  const def = createNotice(base);
  assert.strictEqual(def.channel, 'issue', 'default channel must be issue, never pr');

  // 2. The body says so, in the reader's terms, and offers the opt-in.
  assert.ok(
    /Why this is an issue and not a pull request/.test(def.body),
    'body must explain why this is an issue'
  );
  assert.ok(
    /rather receive these as a PR, say so/.test(def.body),
    'body must offer the opt-in rather than assuming it'
  );
  assert.ok(!/This PR was opened/.test(def.body), 'body must not call an issue a PR');
  assert.ok(/This issue was opened/.test(def.body), 'disclosure must name the right channel');

  // 3. Nothing about the repo can flip it to a PR by itself.
  for (const sneaky of [{ prOptIn: false }, { prOptIn: undefined }, { channel: undefined }, { channel: 'PR' }]) {
    const r = createNotice(Object.assign({}, base, sneaky));
    assert.strictEqual(r.channel, 'issue', `channel must stay issue for ${JSON.stringify(sneaky)}`);
  }

  // 4. A PR only on an explicit, recorded ask.
  const asked = createNotice(Object.assign({}, base, { prOptIn: true }));
  assert.strictEqual(asked.channel, 'pr', 'prOptIn:true must produce a pr');
  assert.ok(/This pull request was opened/.test(asked.body), 'opted-in body must name the pr');

  const viaHelper = createPullRequestOnRequest(base);
  assert.strictEqual(viaHelper.channel, 'pr', 'explicit helper must produce a pr');

  // 5. The no-auto-fix invariant survives either channel: only report and
  //    manifest files, never a skill file.
  for (const r of [def, asked]) {
    for (const f of r.filesToInclude) {
      assert.ok(
        /^\.skillsdrift-(report\.md|manifest\.json)$/.test(f),
        `notice must never touch ${f}`
      );
    }
  }

  // 6. The draft written in test mode records the channel, so an operator can
  //    see what would have been opened.
  assert.ok(fs.existsSync(DRAFT_FILE), 'notice-draft.json should exist');
  const draft = JSON.parse(fs.readFileSync(DRAFT_FILE, 'utf8'));
  assert.ok(['issue', 'pr'].includes(draft.channel), 'draft must record the channel');
}

module.exports = { name: 'issue-not-pr', run };
