'use strict';

// Signature validation: correct HMAC -> 200 + installation recorded;
// tampered/missing signature -> 401 + no state change. Uses service.js's
// exported createServer() and listens on an ephemeral port (no subprocess).

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createServer } = require('../service');

const DATA_DIR = path.join(__dirname, '..', 'data');
const INSTALLATIONS_FILE = path.join(DATA_DIR, 'installations.json');
const SECRET = 'test-webhook-secret-please-ignore';

function sign(secret, rawBody) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

function readInstallations() {
  try {
    return JSON.parse(fs.readFileSync(INSTALLATIONS_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

async function run() {
  process.env.APP_WEBHOOK_SECRET = SECRET;
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const payload = {
    action: 'created',
    installation: { id: 999123, account: { login: 'test-org' } },
    sender: { login: 'aryaman3012' },
    repositories: [{ full_name: 'test-org/test-repo' }],
  };
  const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
  const goodSig = sign(SECRET, rawBody);

  const before = readInstallations();

  // 1. Missing signature -> 401, no state change.
  const respMissing = await fetch(`${base}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-GitHub-Event': 'installation' },
    body: rawBody,
  });
  assert.strictEqual(respMissing.status, 401, 'missing signature should return 401');
  assert.deepStrictEqual(readInstallations(), before, 'installations.json must not change on missing signature');

  // 2. Tampered signature -> 401, no state change.
  const badSig = goodSig.slice(0, -4) + 'dead';
  const respBad = await fetch(`${base}/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'installation',
      'X-Hub-Signature-256': badSig,
    },
    body: rawBody,
  });
  assert.strictEqual(respBad.status, 401, 'tampered signature should return 401');
  assert.deepStrictEqual(readInstallations(), before, 'installations.json must not change on tampered signature');

  // 3. Correct signature -> 200, installation recorded.
  const respGood = await fetch(`${base}/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'installation',
      'X-Hub-Signature-256': goodSig,
    },
    body: rawBody,
  });
  assert.strictEqual(respGood.status, 200, 'correct signature should return 200');
  const after = readInstallations();
  assert.strictEqual(after.length, before.length + 1, 'installation should be recorded exactly once');
  const last = after[after.length - 1];
  assert.strictEqual(last.installationId, 999123);
  assert.strictEqual(last.installerLogin, 'aryaman3012');
  assert.deepStrictEqual(last.repos, ['test-org/test-repo']);

  // healthz sanity check while the server is up.
  const health = await fetch(`${base}/healthz`);
  assert.strictEqual(health.status, 200);
  const healthBody = await health.json();
  assert.strictEqual(healthBody.status, 'ok');

  await new Promise((resolve) => server.close(resolve));
}

module.exports = { run };
