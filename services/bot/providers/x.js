'use strict';

/**
 * providers/x.js — X (Twitter) API v2 provider.
 *
 * Zero npm deps: uses Node's built-in `https` module directly.
 * NEVER hardcode credentials, never log credential values, never persist them anywhere.
 *
 * Credentials, if present, come from either:
 *   - env vars: X_BEARER_TOKEN, X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 *   - files under ~/.config/skillsdrift-bot/ (e.g. ~/.config/skillsdrift-bot/credentials.json)
 *
 * On this VPS today, none of the above exist — every exported method throws
 * NoCredentialsError. That is the correct, expected behavior (see brief env facts).
 */

const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CONFIG_DIR = path.join(os.homedir(), '.config', 'skillsdrift-bot');

const ENV_VARS = [
  'X_BEARER_TOKEN',
  'X_API_KEY',
  'X_API_SECRET',
  'X_ACCESS_TOKEN',
  'X_ACCESS_SECRET',
];

class NoCredentialsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NoCredentialsError';
  }
}

function setupInstructions() {
  return (
    'No X API credentials configured. Set one of:\n' +
    '  - X_BEARER_TOKEN (read-only access, e.g. for getMentions), or\n' +
    '  - the OAuth1 user-context set: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET ' +
    '(required for postTweet/postThread)\n' +
    `as environment variables, or place credential files under ${CONFIG_DIR}/ ` +
    '(e.g. a credentials.json with the same fields). Never commit these values.'
  );
}

function configDirHasCredentialFiles() {
  try {
    const entries = fs.readdirSync(CONFIG_DIR);
    return entries.length > 0;
  } catch (_err) {
    return false;
  }
}

/** Returns true if enough credentials exist for read (bearer) access. */
function hasReadCredentials() {
  return Boolean(process.env.X_BEARER_TOKEN) || configDirHasCredentialFiles();
}

/** Returns true if enough credentials exist for write (post) access. */
function hasWriteCredentials() {
  const oauth1Complete = ENV_VARS.slice(1).every((name) => Boolean(process.env[name]));
  return oauth1Complete || configDirHasCredentialFiles();
}

function requireReadCredentials() {
  if (!hasReadCredentials()) {
    throw new NoCredentialsError(setupInstructions());
  }
}

function requireWriteCredentials() {
  if (!hasWriteCredentials()) {
    throw new NoCredentialsError(setupInstructions());
  }
}

/**
 * Low-level helper: performs an authenticated HTTPS request against the X API v2.
 * Not exercised in tests/on this VPS (no credentials exist) — implemented plausibly,
 * documented, and never called unless requireWriteCredentials/requireReadCredentials
 * has already passed.
 */
function apiRequest({ method, hostname, apiPath, body, bearerToken }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        method,
        hostname,
        path: apiPath,
        headers: Object.assign(
          {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
          payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}
        ),
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (_err) {
              resolve({});
            }
          } else {
            reject(new Error(`X API request failed: HTTP ${res.statusCode}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * postTweet(text) — POST /2/tweets
 * Documented prod path; requires OAuth1 user-context credentials (or bearer with
 * user context, per X API v2). Not exercised here — no credentials exist on this VPS.
 */
async function postTweet(text) {
  requireWriteCredentials();
  // Prod path (untested on this VPS — no credentials configured):
  return apiRequest({
    method: 'POST',
    hostname: 'api.twitter.com',
    apiPath: '/2/tweets',
    body: { text },
    bearerToken: process.env.X_BEARER_TOKEN || '',
  });
}

/**
 * postThread(tweets) — chains POST /2/tweets calls, each replying to the previous
 * tweet's id (X API v2 reply-chain via `reply.in_reply_to_tweet_id`).
 */
async function postThread(tweets) {
  requireWriteCredentials();
  let previousId;
  const results = [];
  for (const text of tweets) {
    const body = previousId
      ? { text, reply: { in_reply_to_tweet_id: previousId } }
      : { text };
    // eslint-disable-next-line no-await-in-loop
    const result = await apiRequest({
      method: 'POST',
      hostname: 'api.twitter.com',
      apiPath: '/2/tweets',
      body,
      bearerToken: process.env.X_BEARER_TOKEN || '',
    });
    previousId = result && result.data && result.data.id;
    results.push(result);
  }
  return results;
}

/**
 * sendDirectMessage(participantId, text) — POST
 * /2/dm_conversations/with/:participant_id/messages
 *
 * The default delivery for a scan result (§3.4: "The X account replies with a
 * private link, not a public verdict, unless the person asking maintains the
 * repo"). A public post about someone else's repository is a verdict delivered
 * in front of an audience; a DM is the same information offered to the person
 * who asked for it.
 *
 * Same credential requirements and same untested-on-this-VPS caveat as
 * postTweet. A DM to someone who does not follow the account can fail; callers
 * must treat failure as "not delivered" and never fall back to posting the
 * findings publicly.
 */
async function sendDirectMessage(participantId, text) {
  requireWriteCredentials();
  if (!participantId) throw new Error('sendDirectMessage requires a participant id');
  return apiRequest({
    method: 'POST',
    hostname: 'api.twitter.com',
    apiPath: `/2/dm_conversations/with/${encodeURIComponent(participantId)}/messages`,
    body: { text },
    bearerToken: process.env.X_BEARER_TOKEN || '',
  });
}

/**
 * getMentions() — GET /2/users/:id/mentions
 * Requires a bearer token and the bot account's numeric user id (X_USER_ID, documented
 * alongside the other env vars if this path is ever activated).
 */
async function getMentions() {
  requireReadCredentials();
  const userId = process.env.X_USER_ID || '';
  return apiRequest({
    method: 'GET',
    hostname: 'api.twitter.com',
    apiPath: `/2/users/${userId}/mentions`,
    bearerToken: process.env.X_BEARER_TOKEN || '',
  });
}

module.exports = {
  NoCredentialsError,
  postTweet,
  postThread,
  sendDirectMessage,
  getMentions,
  hasReadCredentials,
  hasWriteCredentials,
  setupInstructions,
  CONFIG_DIR,
};
