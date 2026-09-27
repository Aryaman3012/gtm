'use strict';

// S4: a second server bound to a port already held by a first server must fail with a
// clear, actionable fatal message (not Node's default raw EADDRINUSE stack trace), and
// must not attempt to touch anything else. log/exit are injected so the test can assert
// on the message without killing the test process.

const assert = require('assert');
const { createServer, attachListenErrorHandler } = require('../service');

async function run() {
  const first = createServer();
  await new Promise((resolve) => first.listen(0, '127.0.0.1', resolve));
  const port = first.address().port;

  const second = createServer();
  const messages = [];
  const exitCodes = [];
  attachListenErrorHandler(second, port, {
    log: (msg) => messages.push(msg),
    exit: (code) => exitCodes.push(code),
  });

  await new Promise((resolve) => {
    second.on('error', () => resolve());
    second.listen(port, '127.0.0.1');
  });

  assert.strictEqual(exitCodes.length, 1, 'EADDRINUSE must trigger exactly one fatal exit');
  assert.strictEqual(exitCodes[0], 1);
  assert.strictEqual(messages.length, 1);
  assert.ok(/EADDRINUSE/.test(messages[0]), 'message must name EADDRINUSE');
  assert.ok(messages[0].includes(String(port)) && messages[0].includes('already in use'));

  await new Promise((resolve) => first.close(resolve));
}

module.exports = { run };
