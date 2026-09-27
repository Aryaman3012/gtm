'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const cli = require('../cli');
const oracle = require('../oracle');
const { NoCredentialsError } = require('../providers/x');
const helpers = require('./helpers');

test('draft-scan writes a draft file with the documented schema (local fixture, zero network)', () => {
  const repoDir = helpers.makeDriftFixtureRepo();
  const draftsDir = helpers.makeScratchDir('skillsdrift-bot-drafts-');
  const cacheFile = path.join(helpers.makeScratchDir('skillsdrift-bot-cache2-'), 'scan-cache.json');
  try {
    const filePath = cli.draftScan('test-org/cli-fixture', {
      draftsDir,
      oracleOpts: { localPath: repoDir, cacheFile },
    });
    assert.ok(fs.existsSync(filePath));
    const draft = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(draft.repo, 'test-org/cli-fixture');
    assert.equal(draft.status, 'draft');
    assert.equal(draft.approved, false);
    assert.ok(Array.isArray(draft.tweets) && draft.tweets.length > 0);
  } finally {
    helpers.cleanup(repoDir);
    helpers.cleanup(draftsDir);
  }
});

test('process-inbox reads mentions-queue.json and writes one draft per mention (zero network)', () => {
  const repoDir = helpers.makeDriftFixtureRepo();
  const draftsDir = helpers.makeScratchDir('skillsdrift-bot-inbox-drafts-');
  const cacheFile = path.join(helpers.makeScratchDir('skillsdrift-bot-cache3-'), 'scan-cache.json');
  const inboxDir = helpers.makeScratchDir('skillsdrift-bot-inbox-');
  const inboxPath = path.join(inboxDir, 'mentions-queue.json');
  fs.writeFileSync(
    inboxPath,
    JSON.stringify([
      { id: 'm1', author: 'someone', text: '@skillsdrift scan test-org/inbox-fixture', createdAt: '2026-09-26T00:00:00.000Z' },
    ])
  );
  try {
    const paths = cli.processInbox({
      inboxPath,
      draftsDir,
      oracleOpts: { localPath: repoDir, cacheFile },
    });
    assert.equal(paths.length, 1);
    const draft = JSON.parse(fs.readFileSync(paths[0], 'utf8'));
    assert.equal(draft.mentionId, 'm1');
    assert.ok(Array.isArray(draft.tweets) && draft.tweets.length > 0);
  } finally {
    helpers.cleanup(repoDir);
    helpers.cleanup(draftsDir);
    helpers.cleanup(inboxDir);
  }
});

test('S2: a FRESH draft-scan draft (not hand-edited) has no approved:true, and post-approved refuses it', () => {
  const repoDir = helpers.makeDriftFixtureRepo();
  const draftsDir = helpers.makeScratchDir('skillsdrift-bot-freshdraft-');
  const cacheFile = path.join(helpers.makeScratchDir('skillsdrift-bot-cache-fresh-'), 'scan-cache.json');
  let providerCalled = false;
  const spyProvider = {
    postTweet: () => {
      providerCalled = true;
    },
    postThread: () => {
      providerCalled = true;
    },
  };
  try {
    const filePath = cli.draftScan('test-org/fresh-draft-fixture', {
      draftsDir,
      oracleOpts: { localPath: repoDir, cacheFile },
    });
    const raw = fs.readFileSync(filePath, 'utf8');
    assert.ok(!raw.includes('"approved": true'), 'a freshly generated draft must never ship pre-approved');

    assert.throws(
      () => cli.postApproved(filePath, { provider: spyProvider }),
      /does not contain a top-level "approved": true/
    );
    assert.equal(providerCalled, false, 'provider must never be invoked on a fresh, unreviewed draft');
  } finally {
    helpers.cleanup(repoDir);
    helpers.cleanup(draftsDir);
  }
});

test('post-approved refuses without approved:true — BEFORE any provider call', () => {
  const draftsDir = helpers.makeScratchDir('skillsdrift-bot-postcheck-');
  const filePath = path.join(draftsDir, 'unapproved.json');
  fs.writeFileSync(filePath, JSON.stringify({ approved: false, tweets: ['hello'] }));

  let providerCalled = false;
  const spyProvider = {
    postTweet: () => {
      providerCalled = true;
      throw new Error('provider must never be called');
    },
    postThread: () => {
      providerCalled = true;
      throw new Error('provider must never be called');
    },
  };

  assert.throws(
    () => cli.postApproved(filePath, { provider: spyProvider }),
    /does not contain a top-level "approved": true/
  );
  assert.equal(providerCalled, false, 'provider must never be invoked when approved !== true');
  helpers.cleanup(draftsDir);
});

test('post-approved missing "approved" key entirely also refuses', () => {
  const draftsDir = helpers.makeScratchDir('skillsdrift-bot-postcheck2-');
  const filePath = path.join(draftsDir, 'no-approved-key.json');
  fs.writeFileSync(filePath, JSON.stringify({ tweets: ['hello'] }));
  let providerCalled = false;
  const spyProvider = {
    postTweet: () => {
      providerCalled = true;
    },
    postThread: () => {
      providerCalled = true;
    },
  };
  assert.throws(() => cli.postApproved(filePath, { provider: spyProvider }));
  assert.equal(providerCalled, false);
  helpers.cleanup(draftsDir);
});

test('post-approved with approved:true reaches the provider and fails with NoCredentialsError', async () => {
  const draftsDir = helpers.makeScratchDir('skillsdrift-bot-postcheck3-');
  const filePath = path.join(draftsDir, 'approved.json');
  fs.writeFileSync(filePath, JSON.stringify({ approved: true, tweets: ['one', 'two'] }));

  // Use the REAL provider (no stub) — no credentials exist on this VPS, so this must
  // throw NoCredentialsError, not silently succeed and not attempt a real network call.
  // Guard against any accidental network attempt by stubbing https.request to fail loudly.
  const https = require('node:https');
  const originalRequest = https.request;
  https.request = () => {
    throw new Error('no network call should be attempted without credentials');
  };
  try {
    await assert.rejects(() => cli.postApproved(filePath), (err) => {
      assert.ok(err instanceof NoCredentialsError, `expected NoCredentialsError, got ${err}`);
      assert.ok(/X_BEARER_TOKEN/.test(err.message), 'setup instructions should mention X_BEARER_TOKEN');
      assert.ok(/X_API_KEY/.test(err.message), 'setup instructions should mention X_API_KEY');
      assert.ok(/skillsdrift-bot/.test(err.message), 'setup instructions should mention the config dir');
      return true;
    });
  } finally {
    https.request = originalRequest;
    helpers.cleanup(draftsDir);
  }
});
