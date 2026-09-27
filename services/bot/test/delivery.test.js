'use strict';
// The reply policy, reconciled from two documents that pull opposite ways:
//
//   spec 01 §1  — "the asker's own followers see the reply, which is the
//                  actual distribution mechanism"
//   §3.4        — "replies with a private link, not a public verdict"
//
// DM-everything honours the second and destroys the first. The line that
// satisfies both is WHICH FINDINGS, not public-vs-private: drift and ownership
// counts are already published per-repo on drift.aryaman.tech, so repeating
// them is not a verdict; security findings are the part the index reports
// unattributed and P1 condition 2 forbids tying to a named company.
//
// So: the public half always goes out, and security never appears in it.

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { resolveDelivery, buildSecurityDm, handleMention } = require('../oracle');
const cli = require('../cli');
const helpers = require('./helpers');

test('the public half always goes out — the channel distributes', () => {
  const dir = helpers.makeDriftFixtureRepo();
  const cacheFile = path.join(helpers.makeScratchDir(), 'c.json');
  const reply = handleMention('@skillsdrift scan acme/skills', { localPath: dir, cacheFile });
  helpers.cleanup(dir);
  assert.strictEqual(reply.delivery, 'public', 'a scan reply is public by default');
  assert.ok(reply.tweets.length > 0, 'there is a public reply to post');
});

test('security never appears in the public half, whoever asked', () => {
  const dir = helpers.makeSecurityOnlyFixtureRepo();
  for (const requester of [undefined, { maintainerOf: ['acme/skills'] }]) {
    const cacheFile = path.join(helpers.makeScratchDir(), 'c.json');
    const reply = handleMention('@skillsdrift scan acme/skills', { localPath: dir, cacheFile, requester });
    const joined = reply.tweets.join(' ');
    for (const leak of ['security', 'sudo', 'curl', 'eval(', 'reverse shell', 'credential']) {
      assert.ok(
        !joined.toLowerCase().includes(leak),
        `public half must not mention "${leak}": ${joined}`
      );
    }
  }
  helpers.cleanup(dir);
});

test('security findings are still delivered, privately and at category level', () => {
  const dir = helpers.makeSecurityOnlyFixtureRepo();
  const cacheFile = path.join(helpers.makeScratchDir(), 'c.json');
  const reply = handleMention('@skillsdrift scan acme/skills', { localPath: dir, cacheFile });
  helpers.cleanup(dir);
  assert.ok(reply.dmText, 'security findings must not be silently dropped');
  assert.ok(/Categories:/.test(reply.dmText), 'the DM names categories');
  assert.ok(!/line \d|\/Users\/|\.md:\d/.test(reply.dmText), 'no file or line detail in the DM');
});

test('a clean scan produces no DM at all', () => {
  assert.strictEqual(buildSecurityDm('acme/skills', { security: [] }), null);
});

test('maintainer status is recorded but never inferred from a handle', () => {
  assert.strictEqual(resolveDelivery({ slug: 'a/b' }), 'public');
  assert.strictEqual(resolveDelivery({ slug: 'a/b', requester: { maintainerOf: ['a/b'] } }), 'maintainer');
  assert.strictEqual(resolveDelivery({ slug: 'a/b', requester: { maintainerOf: ['x/y'] } }), 'public');
  for (const claim of [{ handle: 'a', isMaintainer: true }, { maintainerOf: 'a/b' }, { verified: true }]) {
    assert.strictEqual(
      resolveDelivery({ slug: 'a/b', requester: claim }),
      'public',
      'an unverified claim confers no maintainer status'
    );
  }
});

test('post-approved sends the public half, and the private half only by DM', async () => {
  const dir = helpers.makeScratchDir('skillsdrift-delivery-');
  const file = path.join(dir, 'd.json');
  const calls = [];
  const provider = {
    postTweet: (t) => { calls.push(['public', t]); return Promise.resolve({}); },
    postThread: (t) => { calls.push(['public', t.join(' ')]); return Promise.resolve({}); },
    sendDirectMessage: (id, t) => { calls.push(['dm', t]); return Promise.resolve({}); },
  };

  fs.writeFileSync(file, JSON.stringify({
    approved: true, delivery: 'public', dmRecipientId: '999',
    dmText: 'Scan of acme/skills also matched 3 security-pattern flag(s). Categories: sudo invocation.',
    tweets: ['acme/skills: pdf-gen drifted across 2 copies', 'Card: https://example.test/c'],
  }));
  await cli.postApproved(file, { provider });

  const pub = calls.filter((c) => c[0] === 'public');
  const dm = calls.filter((c) => c[0] === 'dm');
  assert.strictEqual(pub.length, 1, 'the public half goes out');
  assert.ok(/pdf-gen drifted/.test(pub[0][1]), 'the public half carries the drift finding');
  assert.ok(!/security|sudo/i.test(pub[0][1]), 'the public half carries no security detail');
  assert.strictEqual(dm.length, 1, 'the private half goes out too');
  assert.ok(/sudo invocation/.test(dm[0][1]), 'the DM carries the security detail');

  // A private half with nowhere to go must refuse, never fall back to public.
  const f2 = path.join(dir, 'd2.json');
  fs.writeFileSync(f2, JSON.stringify({
    approved: true, delivery: 'public', dmText: 'security detail', tweets: ['public line'],
  }));
  assert.throws(() => cli.postApproved(f2, { provider }), /no dmRecipientId/);

  helpers.cleanup(dir);
});
