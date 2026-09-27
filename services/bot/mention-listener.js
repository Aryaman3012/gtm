'use strict';

/**
 * mention-listener.js — two paths to get mention objects:
 *   (a) real poll mode: pollMentions(provider) calls provider.getMentions()
 *       (build/bot/providers/x.js) — needs real X credentials.
 *   (b) draft/mock mode: readInboxFile(path) reads a local JSON file
 *       (default build/bot/data/mentions-queue.json), zero network.
 *
 * Mention object shape: { id, author, text, createdAt }
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_INBOX_PATH = path.join(__dirname, 'data', 'mentions-queue.json');

/**
 * Reads the file-inbox of mentions. Returns [] if the file does not exist
 * (graceful — an empty inbox is not an error). Throws only on malformed JSON,
 * since that indicates a corrupt inbox file that a human should fix.
 */
function readInboxFile(inboxPath = DEFAULT_INBOX_PATH) {
  let raw;
  try {
    raw = fs.readFileSync(inboxPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`mentions-queue file ${inboxPath} must contain a JSON array`);
  }
  return parsed;
}

/**
 * Real poll mode: delegates to the configured provider's getMentions().
 * Requires X credentials (see providers/x.js) — will throw NoCredentialsError
 * on this VPS today, which is expected.
 */
async function pollMentions(provider) {
  return provider.getMentions();
}

module.exports = {
  DEFAULT_INBOX_PATH,
  readInboxFile,
  pollMentions,
};
