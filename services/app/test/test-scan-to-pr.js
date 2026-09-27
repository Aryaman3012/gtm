'use strict';

// Scan-to-PR content pipeline: run scheduler against the drifted fixture
// repo (no CODEOWNERS variant) and assert the notice-draft.json title matches
// the blast-radius template exactly, with real numbers substituted, and
// that the body carries all the required sections.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runScheduler } = require('../scheduler');

const FIXTURE_REPO = path.join(__dirname, '..', 'fixtures', 'fixture-repo');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DRAFT_FILE = path.join(DATA_DIR, 'notice-draft.json');
const STATE_FILE = path.join(DATA_DIR, 'test-org__scan-to-pr-repo.json');

async function run() {
  for (const f of [STATE_FILE]) {
    try {
      fs.unlinkSync(f);
    } catch (err) {
      // fine if it didn't exist
    }
  }

  const result = runScheduler({
    repoPath: FIXTURE_REPO,
    repoSlug: 'test-org/scan-to-pr-repo',
    installerLogin: 'aryaman3012',
    test: true,
  });

  assert.strictEqual(result.findings, true, 'fixture-repo should have drift findings');
  assert.ok(result.prResult, 'a PR should have been created (first run, no prior scan)');

  assert.ok(fs.existsSync(DRAFT_FILE), 'notice-draft.json should exist');
  const draft = JSON.parse(fs.readFileSync(DRAFT_FILE, 'utf8'));

  const titleRe = /^Drift scorecard: 2 version\(s\) of pdf-gen diverged, used by \d+ teammate\(s\), 1 file\(s\) affected$/;
  assert.ok(titleRe.test(draft.title), `title did not match template: ${draft.title}`);

  assert.ok(draft.body.includes('candidate exercise for'), 'body must include disclosure phrase');
  assert.ok(draft.body.includes('Atlan'), 'body disclosure must mention Atlan (candidate-exercise disclosure)');
  assert.ok(draft.body.includes(draft.cardUrl), 'body must include the card link');
  // The no-auto-fix guarantee must be present and must name the right channel.
  // It used to read "close this PR if unwanted"; the app no longer opens a PR
  // uninvited (§1.8 step 3), so the guarantee is asserted, not the old wording.
  assert.ok(
    draft.body.includes('no changes are ever made to your files'),
    'body must include the no-auto-fix guarantee'
  );
  assert.ok(
    draft.body.includes(`Close this ${draft.channel === 'pr' ? 'pull request' : 'issue'} if it is unwanted`),
    'the close line must name the channel actually used'
  );
  assert.ok(draft.body.includes('only a governed source stops it recurring'), 'body must include recurrence-close text');
  assert.ok(draft.body.includes('__WAITLIST_URL__'), 'body must include the waitlist placeholder literal');
  assert.ok(draft.body.includes('--checkin'), 'body must mention the check-in flow');
  assert.ok(
    draft.body.includes('No CODEOWNERS entry matched'),
    'this fixture has no CODEOWNERS file — graceful fallback text expected'
  );

  // The linked card must be the REAL cardgen output (spec-03), not the old app-only
  // card-stub — it must carry the recurrence close and CTA the stub lacked.
  const cardPath = draft.cardUrl.replace('https://drift.aryaman.tech/cards/', '');
  const cardHtml = fs.readFileSync(path.join(DATA_DIR, 'cards', cardPath), 'utf8');
  assert.ok(/drift again/i.test(cardHtml), 'card missing recurrence-close language');
  assert.ok(/__WAITLIST_URL__|waitlist/i.test(cardHtml), 'card missing waitlist CTA');
  assert.ok(!/class="[^"]*(score|grade|rating)[^"]*"/i.test(cardHtml), 'card must not carry a score/grade class');
}

module.exports = { run };
