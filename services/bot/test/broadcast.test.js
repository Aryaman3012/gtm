'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const broadcast = require('../broadcast');
const helpers = require('./helpers');

test('broadcast thread draft structure: hook + finding tweets + disclosure + gallery link', () => {
  const findings = broadcast.loadFindings(broadcast.DEFAULT_SOURCE);
  const thread = broadcast.buildBroadcastThread(findings);

  assert.ok(Array.isArray(thread.tweets) && thread.tweets.length >= 5);
  for (const tweet of thread.tweets) {
    assert.ok(tweet.length <= 280, `tweet exceeds 280 chars: "${tweet}"`);
  }

  const joined = thread.tweets.join(' ');
  assert.ok(joined.includes('candidate exercise for Atlan'), 'disclosure missing');
  assert.ok(joined.includes(broadcast.GALLERY_URL), 'gallery link missing');
  assert.ok(
    joined.includes('This recurs the moment anyone edits a copy again'),
    'recurrence close missing'
  );

  // The hook carries the scan's scale and its result. It must NOT carry the
  // ungoverned percentage: §3.4 retracts that figure (it measures a file
  // convention, since public libraries keep ownership in git), and the index no
  // longer shows it — a thread leading with it would contradict the page it
  // links to.
  assert.ok(/\d+ public agent skills across \d+ repos/.test(thread.tweets[0]), 'hook must state the scan scale');
  assert.ok(
    !/% of the \d+ scanned skills|ungoverned|governance gap/i.test(thread.tweets[0]),
    `hook must not carry the retracted percentage: "${thread.tweets[0]}"`
  );

  // The thread must say why a public null matters, or the CTA has no argument
  // behind it.
  assert.ok(/second copy/.test(joined), 'thread must explain where drift actually starts');

  // A CTA the reader can act on, and a link that is not a 403 directory index.
  assert.ok(/skillsdrift\.js/.test(joined), 'thread must carry a runnable command');
  assert.ok(!joined.includes('drift.aryaman.tech/cards/'), 'must not link the cards directory, which 403s');

  // Short enough to finish reading.
  assert.ok(thread.tweets.length <= 9, `thread too long to finish: ${thread.tweets.length} tweets`);

  // Security findings must never carry a repo name (only category label + count).
  const repoSlugs = (findings.byRepo || []).map((r) => r.slug);
  for (const tweet of thread.tweets) {
    if (/security/i.test(tweet)) {
      for (const slug of repoSlugs) {
        assert.ok(!tweet.includes(slug), `security tweet must not name a repo: "${tweet}"`);
      }
    }
  }
});

test('draft-broadcast writes a JSON file with the documented schema', () => {
  const scratchDir = helpers.makeScratchDir('skillsdrift-bot-broadcast-drafts-');
  const filePath = broadcast.writeBroadcastDraft({ draftsDir: scratchDir, date: '2026-09-26' });
  assert.ok(fs.existsSync(filePath));
  const draft = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.equal(draft.status, 'draft');
  assert.equal(draft.approved, false);
  assert.ok(Array.isArray(draft.tweets));
  helpers.cleanup(scratchDir);
});
