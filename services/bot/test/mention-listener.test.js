'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const mentionListener = require('../mention-listener');
const helpers = require('./helpers');

test('readInboxFile returns [] gracefully when the file does not exist', () => {
  const result = mentionListener.readInboxFile('/definitely/does/not/exist/mentions-queue.json');
  assert.deepEqual(result, []);
});

test('readInboxFile reads a well-formed mentions array', () => {
  const dir = helpers.makeScratchDir('skillsdrift-bot-inbox-read-');
  const filePath = path.join(dir, 'mentions-queue.json');
  const mentions = [{ id: '1', author: 'a', text: '@skillsdrift scan org/repo', createdAt: '2026-01-01T00:00:00Z' }];
  fs.writeFileSync(filePath, JSON.stringify(mentions));
  const result = mentionListener.readInboxFile(filePath);
  assert.deepEqual(result, mentions);
  helpers.cleanup(dir);
});

test('readInboxFile throws a clear error on malformed (non-array) content', () => {
  const dir = helpers.makeScratchDir('skillsdrift-bot-inbox-bad-');
  const filePath = path.join(dir, 'mentions-queue.json');
  fs.writeFileSync(filePath, JSON.stringify({ not: 'an array' }));
  assert.throws(() => mentionListener.readInboxFile(filePath), /must contain a JSON array/);
  helpers.cleanup(dir);
});

test('pollMentions delegates to provider.getMentions()', async () => {
  const calls = [];
  const fakeProvider = {
    getMentions: async () => {
      calls.push('called');
      return ['fake-mention'];
    },
  };
  const result = await mentionListener.pollMentions(fakeProvider);
  assert.deepEqual(result, ['fake-mention']);
  assert.equal(calls.length, 1);
});
