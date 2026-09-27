'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const childProcess = require('node:child_process');

const oracle = require('../oracle');
const helpers = require('./helpers');

function isolatedCacheFile() {
  const dir = helpers.makeScratchDir('skillsdrift-bot-cache-');
  return path.join(dir, 'scan-cache.json');
}

test('golden-file: successful scan reply (drift, top priority)', (t) => {
  const repoDir = helpers.makeDriftFixtureRepo();
  t.after(() => helpers.cleanup(repoDir));
  const cacheFile = isolatedCacheFile();

  const reply = oracle.handleMention('@skillsdrift scan test-org/drift-fixture', {
    localPath: repoDir,
    cacheFile,
  });

  assert.equal(reply.status, 'ok');
  assert.ok(Array.isArray(reply.tweets) && reply.tweets.length > 0);

  for (const tweet of reply.tweets) {
    assert.ok(tweet.length <= 280, `tweet exceeds 280 chars: "${tweet}" (${tweet.length})`);
  }

  const joined = reply.tweets.join(' ');
  assert.ok(joined.includes('candidate exercise for Atlan'), 'disclosure substring missing');
  assert.ok(joined.includes('https://drift.aryaman.tech/cards/'), 'card link missing');
  assert.ok(
    joined.includes('This recurs the moment anyone edits a copy again'),
    'recurrence-close line missing'
  );
  // Top finding priority: drift beats security/ownership/version for this fixture.
  assert.ok(joined.includes('pdf-gen'), 'expected drift headline to name the drifted skill');
  assert.ok(joined.includes('drifted'), 'expected drift wording in hook');

  // The linked card must be the REAL cardgen output (spec-03), not the old bot-only
  // card-stub — it must carry the recurrence close and CTA the stub lacked.
  const cardPath = path.join(__dirname, '..', 'cards', 'test-org-drift-fixture.html');
  const cardHtml = fs.readFileSync(cardPath, 'utf8');
  assert.ok(/drift again/i.test(cardHtml), 'card missing recurrence-close language');
  assert.ok(/__WAITLIST_URL__|waitlist/i.test(cardHtml), 'card missing waitlist CTA');
  assert.ok(!/class="[^"]*(score|grade|rating)[^"]*"/i.test(cardHtml), 'card must not carry a score/grade class');
});

test('usage-help reply for a malformed mention — no clone/spawn attempted', () => {
  const original = childProcess.spawnSync;
  childProcess.spawnSync = () => {
    throw new Error('spawnSync should never be called for a malformed mention');
  };
  try {
    const reply = oracle.handleMention('hello @skillsdrift how are you');
    assert.equal(reply.status, 'usage-help');
    assert.equal(reply.tweets.length, 1);
    assert.ok(reply.tweets[0].startsWith('Usage:'));
    assert.ok(reply.tweets[0].includes('scan anthropics/skills'));
  } finally {
    childProcess.spawnSync = original;
  }
});

test('usage-help reply for a mention with no slug', () => {
  const reply = oracle.handleMention('@skillsdrift scan');
  assert.equal(reply.status, 'usage-help');
});

test('parseMentionText tolerates full github URL and bare slug, case-insensitively', () => {
  assert.deepEqual(oracle.parseMentionText('@SkillsDrift SCAN anthropics/skills'), {
    slug: 'anthropics/skills',
  });
  assert.deepEqual(oracle.parseMentionText('@skillsdrift scan https://github.com/anthropics/skills'), {
    slug: 'anthropics/skills',
  });
  assert.deepEqual(
    oracle.parseMentionText('@skillsdrift scan https://github.com/anthropics/skills.git'),
    { slug: 'anthropics/skills' }
  );
  assert.equal(oracle.parseMentionText('just a random tweet'), null);
});

test('dedupe/rate-limit: repeat scan within 24h reuses cache, does not re-clone', () => {
  const repoDir = helpers.makeDriftFixtureRepo();
  const cacheFile = isolatedCacheFile();
  const now = Date.parse('2026-09-26T12:00:00.000Z');

  const first = oracle.handleMention('@skillsdrift scan test-org/dedupe-fixture', {
    localPath: repoDir,
    cacheFile,
    now,
  });
  assert.equal(first.status, 'ok');
  helpers.cleanup(repoDir); // prove the second call cannot possibly re-read this path

  const original = childProcess.spawnSync;
  let spawnCalled = false;
  childProcess.spawnSync = () => {
    spawnCalled = true;
    throw new Error('spawnSync should not be called on a cache hit');
  };
  try {
    const second = oracle.handleMention('@skillsdrift scan test-org/dedupe-fixture', {
      localPath: '/nonexistent/path/should-not-be-touched',
      cacheFile,
      now: now + 60 * 60 * 1000, // 1h later, still within 24h window
    });
    assert.equal(second.status, 'repeat');
    assert.equal(spawnCalled, false, 'clone/scan must not be attempted on a cache hit');
    const joined = second.tweets.join(' ');
    assert.ok(joined.includes('already scanned within the last 24h'), 'repeat note missing from reply');
  } finally {
    childProcess.spawnSync = original;
  }
});

test('dedupe: cache expires after 24h and triggers a fresh scan', () => {
  const repoDir = helpers.makeDriftFixtureRepo();
  const cacheFile = isolatedCacheFile();
  const now = Date.parse('2026-09-26T12:00:00.000Z');

  const first = oracle.handleMention('@skillsdrift scan test-org/expiry-fixture', {
    localPath: repoDir,
    cacheFile,
    now,
  });
  assert.equal(first.status, 'ok');

  const second = oracle.handleMention('@skillsdrift scan test-org/expiry-fixture', {
    localPath: repoDir,
    cacheFile,
    now: now + 25 * 60 * 60 * 1000, // 25h later — cache expired
  });
  assert.equal(second.status, 'ok');
  assert.notEqual(second.status, 'repeat');

  helpers.cleanup(repoDir);
});

test('security-only fixture: security chip never combines repo name with a specific security detail', () => {
  const repoDir = helpers.makeSecurityOnlyFixtureRepo();
  const cacheFile = isolatedCacheFile();
  const reply = oracle.handleMention('@skillsdrift scan test-org/security-only-fixture', {
    localPath: repoDir,
    cacheFile,
  });
  helpers.cleanup(repoDir);

  assert.equal(reply.status, 'ok');
  for (const tweet of reply.tweets) {
    assert.ok(tweet.length <= 280);
    // Any sentence naming the repo slug must not also carry a specific security
    // finding detail (a patternId label like "curl/wget" or a code snippet).
    if (tweet.includes('test-org/security-only-fixture')) {
      assert.ok(
        !/curl|wget|eval\(|AKIA|snippet/i.test(tweet),
        `sentence combines repo name with specific security detail: "${tweet}"`
      );
    }
  }
  const joined = reply.tweets.join(' ');
  assert.ok(joined.includes('category-level'), 'expected category-level framing for security finding');
});

test('clone failure is handled gracefully (stubbed spawnSync, zero network)', () => {
  const cacheFile = isolatedCacheFile();
  const original = childProcess.spawnSync;
  childProcess.spawnSync = (cmd) => {
    if (cmd === 'git') {
      return { status: 128, stdout: '', stderr: 'fatal: repository not found' };
    }
    throw new Error(`unexpected spawnSync call: ${cmd}`);
  };
  try {
    const reply = oracle.handleMention('@skillsdrift scan some-org/private-repo', {
      cacheFile,
    });
    assert.equal(reply.status, 'clone-failed');
    assert.equal(reply.tweets.length, 1);
    assert.ok(!/Error:|at Object|at Module/.test(reply.tweets[0]), 'must not leak a stack trace');
    assert.ok(reply.tweets[0].toLowerCase().includes("couldn't scan"));
  } finally {
    childProcess.spawnSync = original;
  }
});

test('no-skills-found repo is a graceful reply, not a crash', () => {
  const emptyDir = helpers.makeScratchDir('skillsdrift-bot-empty-');
  const cacheFile = isolatedCacheFile();
  const reply = oracle.handleMention('@skillsdrift scan test-org/empty-fixture', {
    localPath: emptyDir,
    cacheFile,
  });
  helpers.cleanup(emptyDir);
  assert.equal(reply.status, 'no-skills');
  assert.ok(reply.tweets[0].includes('nothing to report'));
});
