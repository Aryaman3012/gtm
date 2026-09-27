#!/usr/bin/env node
'use strict';

/**
 * cli.js — command-line entry point for the skillsdrift Twitter/X drift bot.
 *
 * Commands:
 *   draft-scan <repo>          - runs oracle.js on a synthetic mention, writes a reply draft
 *   draft-broadcast [--source] - runs broadcast.js, writes a weekly-delta thread draft
 *   process-inbox              - reads mentions-queue.json, writes one reply draft per mention
 *   post-approved <draft-file> - THE ONLY command that may touch the network; refuses
 *                                 without a top-level "approved": true in the draft file
 *
 * Cron (documented only, NOT installed — see README.md):
 *   every 30 min: cd <repo>/build/bot && node cli.js process-inbox   >> cron.log 2>&1
 *   weekly (Mon 03:00): cd <repo>/build/bot && node cli.js draft-broadcast >> cron.log 2>&1
 *   (exact crontab lines are documented in README.md, not embedded here to avoid
 *   an accidental `*` `/` sequence closing this block comment)
 */

const fs = require('fs');
const path = require('path');

const oracle = require('./oracle');
const broadcast = require('./broadcast');
const mentionListener = require('./mention-listener');
const xProvider = require('./providers/x');

const DRAFTS_DIR = path.join(__dirname, 'drafts');

function sanitizeForFilename(str) {
  return String(str).replace(/[^a-zA-Z0-9._-]/g, '-');
}

function timestampStem() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function writeDraftFile(filePath, draft) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(draft, null, 2), 'utf8');
}

/** `draft-scan <repo>` — synthetic mention -> oracle -> draft file. Returns the file path. */
function draftScan(repoArg, opts = {}) {
  if (!repoArg) {
    throw new Error('draft-scan requires a <repo> argument, e.g. "anthropics/skills"');
  }
  const mentionText = `@skillsdrift scan ${repoArg}`;
  const reply = oracle.handleMention(mentionText, opts.oracleOpts || {});
  const draftsDir = opts.draftsDir || DRAFTS_DIR;
  const filePath = path.join(
    draftsDir,
    `${sanitizeForFilename(repoArg)}-${opts.timestamp || timestampStem()}.json`
  );
  const draft = {
    repo: repoArg,
    generatedAt: new Date().toISOString(),
    status: 'draft',
    approved: false,
    replyStatus: reply.status,
    tweets: reply.tweets,
  };
  writeDraftFile(filePath, draft);
  return filePath;
}

/** `draft-broadcast [--source <path>]` — broadcast.js -> draft file. Returns the file path. */
function draftBroadcast(opts = {}) {
  return broadcast.writeBroadcastDraft(opts);
}

/** `process-inbox` — file-inbox mentions -> one reply draft per mention. Returns file paths. */
function processInbox(opts = {}) {
  const mentions = mentionListener.readInboxFile(opts.inboxPath);
  const draftsDir = opts.draftsDir || DRAFTS_DIR;
  const paths = [];
  for (const mention of mentions) {
    const reply = oracle.handleMention(mention.text, opts.oracleOpts || {});
    const filePath = path.join(
      draftsDir,
      `inbox-${sanitizeForFilename(mention.id || 'unknown')}-${opts.timestamp || timestampStem()}.json`
    );
    const draft = {
      mentionId: mention.id,
      author: mention.author,
      generatedAt: new Date().toISOString(),
      status: 'draft',
      approved: false,
      replyStatus: reply.status,
      tweets: reply.tweets,
    };
    writeDraftFile(filePath, draft);
    paths.push(filePath);
  }
  return paths;
}

/**
 * `post-approved <draft-file>` — the only command allowed to touch the network.
 * MUST refuse (throw) before any credential/provider check if approved !== true.
 */
function postApproved(draftFilePath, opts = {}) {
  if (!draftFilePath) {
    throw new Error('post-approved requires a <draft-file> argument');
  }
  const raw = fs.readFileSync(draftFilePath, 'utf8');
  const draft = JSON.parse(raw);

  // Human review gate — checked BEFORE any provider/credential code runs.
  if (draft.approved !== true) {
    throw new Error(
      `Refusing to post: ${draftFilePath} does not contain a top-level "approved": true. ` +
        'A human must review the tweets[] array and add "approved": true before this file can be posted.'
    );
  }

  const provider = opts.provider || xProvider;
  const tweets = draft.tweets || [];
  if (tweets.length === 0) {
    throw new Error(`Refusing to post: ${draftFilePath} has an empty tweets[] array.`);
  }
  if (tweets.length === 1) {
    return provider.postTweet(tweets[0]);
  }
  return provider.postThread(tweets);
}

function parseFlag(args, name) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx === args.length - 1) return undefined;
  return args[idx + 1];
}

async function main(argv) {
  const [cmd, ...rest] = argv;
  try {
    switch (cmd) {
      case 'draft-scan': {
        const filePath = draftScan(rest[0]);
        console.log(filePath);
        return 0;
      }
      case 'draft-broadcast': {
        const filePath = draftBroadcast({ source: parseFlag(rest, '--source') });
        console.log(filePath);
        return 0;
      }
      case 'process-inbox': {
        const paths = processInbox();
        paths.forEach((p) => console.log(p));
        return 0;
      }
      case 'post-approved': {
        const result = await postApproved(rest[0]);
        console.log('Posted.', JSON.stringify(result));
        return 0;
      }
      default:
        console.error(
          'Usage: cli.js <draft-scan <repo>|draft-broadcast [--source <path>]|process-inbox|post-approved <draft-file>>'
        );
        return 2;
    }
  } catch (err) {
    console.error(err.message);
    return 1;
  }
}

module.exports = { draftScan, draftBroadcast, processInbox, postApproved, main };

if (require.main === module) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
