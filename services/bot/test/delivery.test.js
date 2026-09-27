'use strict';
// §3.4: "The X account replies with a private link, not a public verdict,
// unless the person asking maintains the repo."
//
// These tests hold that policy in place. The dangerous failure is not a crash —
// it is a correct scan delivered to the wrong audience, so what is asserted
// here is mostly about what must NOT appear in public.

const test = require('node:test');
const assert = require('node:assert');
const { resolveDelivery, buildPrivateAck, handleMention } = require('../oracle');
const path = require('node:path');
const { makeDriftFixtureRepo, makeScratchDir, cleanup } = require('./helpers');

test('delivery defaults to DM when the requester is unknown', () => {
  assert.strictEqual(resolveDelivery({ slug: 'acme/skills' }), 'dm');
  assert.strictEqual(resolveDelivery({ slug: 'acme/skills', requester: {} }), 'dm');
  assert.strictEqual(
    resolveDelivery({ slug: 'acme/skills', requester: { maintainerOf: [] } }),
    'dm'
  );
});

test('delivery is public only for a verified maintainer of that exact repo', () => {
  assert.strictEqual(
    resolveDelivery({ slug: 'acme/skills', requester: { maintainerOf: ['acme/skills'] } }),
    'public'
  );
  // Case-insensitive, because GitHub slugs are.
  assert.strictEqual(
    resolveDelivery({ slug: 'Acme/Skills', requester: { maintainerOf: ['acme/skills'] } }),
    'public'
  );
  // Maintaining a different repo earns nothing.
  assert.strictEqual(
    resolveDelivery({ slug: 'acme/skills', requester: { maintainerOf: ['other/repo'] } }),
    'dm'
  );
});

test('nothing a requester merely claims can make delivery public', () => {
  const claims = [
    { handle: 'acme', login: 'acme', isMaintainer: true },
    { maintainerOf: 'acme/skills' }, // a string, not a verified list
    { maintainerOf: null },
    { verified: true, owner: true },
  ];
  for (const requester of claims) {
    assert.strictEqual(
      resolveDelivery({ slug: 'acme/skills', requester }),
      'dm',
      `unverified claim must not go public: ${JSON.stringify(requester)}`
    );
  }
});

test('the public acknowledgement carries no findings', () => {
  const ack = buildPrivateAck('acme/skills');
  // No numbers at all: no counts, no severities, no percentages.
  assert.ok(!/\d/.test(ack.replace('acme/skills', '')), `ack must contain no figures: ${ack}`);
  for (const leak of ['drift', 'unowned', 'security', 'no owner', 'version marker', 'flagged']) {
    assert.ok(
      !ack.toLowerCase().includes(leak),
      `public ack must not mention "${leak}": ${ack}`
    );
  }
  assert.ok(ack.includes('DM'), 'ack should say where the reply went');
});

test('a scan of a repo the requester does not maintain is delivered by DM', () => {
  const dir = makeDriftFixtureRepo();
  const cacheFile = path.join(makeScratchDir(), 'cache.json');
  const reply = handleMention('@skillsdrift scan acme/skills', { localPath: dir, cacheFile });
  cleanup(dir);
  assert.strictEqual(reply.delivery, 'dm', 'default delivery must be dm');
  assert.ok(reply.publicAck, 'a dm reply must supply the finding-free public line');
  // The findings themselves still exist — they just are not public.
  assert.ok(Array.isArray(reply.tweets) && reply.tweets.length > 0, 'reply body still built');
});

test('a maintainer gets the findings in public, with no separate ack', () => {
  const dir = makeDriftFixtureRepo();
  const cacheFile = path.join(makeScratchDir(), 'cache.json');
  const reply = handleMention('@skillsdrift scan acme/skills', {
    localPath: dir,
    cacheFile,
    requester: { maintainerOf: ['acme/skills'] },
  });
  cleanup(dir);
  assert.strictEqual(reply.delivery, 'public');
  assert.strictEqual(reply.publicAck, undefined, 'a public reply needs no private-ack line');
});

test('usage help and scan failures stay public — they name no findings', () => {
  const help = handleMention('@skillsdrift hello');
  assert.strictEqual(help.status, 'usage-help');
  assert.strictEqual(help.delivery, 'public');
});

// The gate that matters: post-approved must never put findings in public for a
// draft that was not cleared for it. A stub provider records what was called.
test('post-approved never posts findings publicly for a private draft', async () => {
  const fs = require('node:fs');
  const cli = require('../cli');
  const helpers = require('./helpers');
  const dir = helpers.makeScratchDir('skillsdrift-delivery-');
  const file = path.join(dir, 'd.json');
  const calls = [];
  const provider = {
    postTweet: (t) => { calls.push(['postTweet', t]); return Promise.resolve({}); },
    postThread: (t) => { calls.push(['postThread', t]); return Promise.resolve({}); },
    sendDirectMessage: (id, t) => { calls.push(['dm', id, t]); return Promise.resolve({}); },
  };

  // A private draft with a recipient: findings go by DM, only the ack in public.
  fs.writeFileSync(file, JSON.stringify({
    approved: true, delivery: 'dm', dmRecipientId: '999',
    publicAck: 'Scanned it — sending you the result by DM.',
    tweets: ['acme/skills: pdf-gen drifted across 2 copies', 'card: https://example.test/c'],
  }));
  await cli.postApproved(file, { provider });

  const dm = calls.filter((c) => c[0] === 'dm');
  const publics = calls.filter((c) => c[0] === 'postTweet' || c[0] === 'postThread');
  assert.strictEqual(dm.length, 1, 'findings must go out exactly once, by DM');
  assert.ok(/pdf-gen drifted/.test(dm[0][2]), 'the DM carries the findings');
  assert.strictEqual(publics.length, 1, 'only the ack may be public');
  assert.ok(!/pdf-gen|drifted/.test(publics[0][1]), 'the public post must carry no findings');

  // A private draft with no recipient must refuse outright, not fall back to public.
  const file2 = path.join(dir, 'd2.json');
  fs.writeFileSync(file2, JSON.stringify({ approved: true, delivery: 'dm', tweets: ['secret finding'] }));
  assert.throws(() => cli.postApproved(file2, { provider }), /no dmRecipientId/);

  // A draft predating the policy (no delivery field) is treated as private.
  const file3 = path.join(dir, 'd3.json');
  fs.writeFileSync(file3, JSON.stringify({ approved: true, tweets: ['legacy finding'] }));
  assert.throws(() => cli.postApproved(file3, { provider }), /delivery "dm"/);

  helpers.cleanup(dir);
});
