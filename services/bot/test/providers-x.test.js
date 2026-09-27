'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const xProvider = require('../providers/x');

async function withClearedEnv(fn) {
  const keys = ['X_BEARER_TOKEN', 'X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_SECRET'];
  const saved = {};
  for (const k of keys) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  try {
    await fn();
  } finally {
    for (const k of keys) {
      if (saved[k] !== undefined) process.env[k] = saved[k];
    }
  }
}

test('postTweet throws NoCredentialsError with no creds configured (no network attempted)', async () => {
  await withClearedEnv(async () => {
    const https = require('node:https');
    const original = https.request;
    https.request = () => {
      throw new Error('must not attempt network without credentials');
    };
    try {
      await assert.rejects(() => xProvider.postTweet('hello'), xProvider.NoCredentialsError);
    } finally {
      https.request = original;
    }
  });
});

test('getMentions throws NoCredentialsError with no creds configured', async () => {
  await withClearedEnv(async () => {
    await assert.rejects(() => xProvider.getMentions(), xProvider.NoCredentialsError);
  });
});

test('NoCredentialsError message never contains a literal credential value and documents setup', () => {
  const msg = xProvider.setupInstructions();
  assert.ok(msg.includes('X_BEARER_TOKEN'));
  assert.ok(msg.includes('X_API_KEY'));
  assert.ok(msg.includes('X_API_SECRET'));
  assert.ok(msg.includes('X_ACCESS_TOKEN'));
  assert.ok(msg.includes('X_ACCESS_SECRET'));
  assert.ok(msg.includes('skillsdrift-bot'));
});
