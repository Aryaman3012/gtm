'use strict';

// Plain Node `http` webhook receiver — zero npm deps (built-ins only).
// Routes:
//   GET  /healthz  -> 200 { status: "ok" }
//   POST /webhook  -> HMAC-SHA256 signature check (X-Hub-Signature-256) against
//                     APP_WEBHOOK_SECRET, timing-safe compare. Missing/invalid
//                     signature -> 401, body is never parsed. Valid signature
//                     -> record `installation` events / mark `push` events
//                     dirty (cheap, synchronous file writes) and respond 200.
//                     The actual scan/PR work is NEVER done here — that's
//                     scheduler.js's job (run on a weekly cadence), so the
//                     webhook response stays fast regardless.
//
// Exports `createServer()` so tests can `.listen()` it themselves rather than
// spawning a subprocess.

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');

function sanitizeSlug(slug) {
  return String(slug).replace(/[^a-zA-Z0-9_.-]/g, '__');
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function verifySignature(secret, rawBody, signatureHeader) {
  if (!secret || !signatureHeader || typeof signatureHeader !== 'string') return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(signatureHeader, 'utf8');
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function recordInstallation(payload) {
  const file = path.join(DATA_DIR, 'installations.json');
  const installations = readJson(file, []);
  const installation = payload.installation || {};
  const account = installation.account || {};
  const repos = payload.repositories || payload.repositories_added || [];
  const entry = {
    installationId: installation.id != null ? installation.id : null,
    installerLogin: (payload.sender && payload.sender.login) || account.login || 'unknown',
    account: account.login || null,
    action: payload.action || null,
    repos: repos.map((r) => r.full_name || r.name).filter(Boolean),
    recordedAt: new Date().toISOString(),
  };
  installations.push(entry);
  writeJson(file, installations);
  return entry;
}

function markRepoDirty(payload) {
  const repoFullName = payload.repository && payload.repository.full_name;
  if (!repoFullName) return null;
  const file = path.join(DATA_DIR, `${sanitizeSlug(repoFullName)}.json`);
  const state = readJson(file, {});
  state.dirty = true;
  state.lastPushAt = new Date().toISOString();
  writeJson(file, state);
  return state;
}

function createServer(options = {}) {
  const getSecret = () => options.webhookSecret || process.env.APP_WEBHOOK_SECRET || '';

  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.method === 'POST' && req.url === '/webhook') {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('error', () => {
        // connection error mid-body: nothing to do, socket is already gone.
      });
      req.on('end', () => {
        const rawBody = Buffer.concat(chunks);
        const sigHeader = req.headers['x-hub-signature-256'];

        // Signature check happens against the raw bytes BEFORE any parsing.
        if (!verifySignature(getSecret(), rawBody, sigHeader)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid or missing signature' }));
          return;
        }

        let payload;
        try {
          payload = JSON.parse(rawBody.toString('utf8'));
        } catch (err) {
          // Valid signature but unparsable body — ack fast, do nothing else.
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'accepted', warning: 'body was not valid JSON' }));
          return;
        }

        const eventType = req.headers['x-github-event'];
        try {
          if (eventType === 'push') {
            markRepoDirty(payload);
          } else if (eventType === 'installation' || eventType === 'installation_repositories' || payload.installation) {
            recordInstallation(payload);
          }
        } catch (err) {
          // Never let a state-recording error crash the process or delay the ack.
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'accepted' }));
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });
}

// Node's default behavior on a listen() failure is an uncaught 'error' event that
// crashes with a raw stack trace — no hint that it's a stale instance already bound
// to the port (the S4 bug: a leftover process caused a confusing 401 during manual
// testing, not an obvious "port already in use"). exit/log are injectable so tests can
// assert on the message without actually killing the test process.
function attachListenErrorHandler(server, port, { log = console.error, exit = process.exit } = {}) {
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      log(
        `skillsdrift-app: fatal — port ${port} is already in use (EADDRINUSE). ` +
          'Another instance may already be running; stop it or set PORT to a free port.'
      );
      exit(1);
      return;
    }
    throw err;
  });
  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8797;
  const server = createServer();
  attachListenErrorHandler(server, port);
  server.listen(port, () => {
    console.log(`skillsdrift-app service listening on :${port}`);
  });
}

module.exports = {
  createServer,
  verifySignature,
  sanitizeSlug,
  recordInstallation,
  markRepoDirty,
  attachListenErrorHandler,
  DATA_DIR,
};
