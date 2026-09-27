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

  // hook is the first (numbered) tweet and carries the aggregate stat.
  assert.ok(/\d+% of the \d+ scanned skills/.test(thread.tweets[0]));

  // 3-6 finding tweets between hook and recurrence-close/disclosure/gallery tail.
  const findingCount = thread.tweets.length - 4; // hook, recurrence, disclosure, gallery
  assert.ok(findingCount >= 3 && findingCount <= 6, `expected 3-6 finding tweets, got ${findingCount}`);

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
