'use strict';

/**
 * oracle.js — core reply logic for `@skillsdrift scan <github-url-or-org/repo-slug>` mentions.
 *
 * Flow: parse mention text -> clone target repo shallowly into a tmpdir -> run the
 * skillsdrift v2 engine (artifact/skillsdrift.js) as a subprocess against the clone root
 * (if discoverSkillRoot finds a SKILL.md anywhere under it) -> build a reply draft (tweets[]).
 *
 * This file invokes the skillsdrift engine directly via subprocess (never `require()`s
 * artifact/src/*), and renders cards via the same build/cardgen used by build/scanner
 * (see writeCard() below). Skill-dir detection is shared with build/scanner via
 * discover.js (see S1 fix note there) so the bot and the scanner never disagree about
 * whether a repo "has skills".
 *
 * Test seam: scanRepo()/handleMention() accept `opts.localPath` — a pre-existing directory
 * standing in for a freshly cloned repo root (same discoverSkillRoot detection applied
 * under it). Tests use this to avoid any real git clone.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
// NOTE: intentionally referenced as `childProcess.spawnSync(...)` at call time (not
// destructured at load time) so tests can monkeypatch `childProcess.spawnSync` on the
// shared module object to assert "no clone/spawn attempted" for cache-hit / malformed-
// mention paths without needing a real subprocess.
const childProcess = require('child_process');

const { generateCard: renderCard } = require('../cardgen/lib/generate');
const { discoverSkillRoot } = require('../scanner/lib/discover');

const SKILLSDRIFT_PATH = require('../lib/skillsdrift-path').cli();
const DEFAULT_CACHE_FILE = path.join(__dirname, 'data', 'scan-cache.json');
const CARDS_DIR = path.join(__dirname, 'cards');
const CARD_BASE_URL = 'https://drift.aryaman.tech/cards/';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DISCLOSURE_LINE =
  'Disclosure: this reply is a candidate exercise for Atlan, not an Atlan product — methodology in the card.';
const RECURRENCE_CLOSE_LINE =
  'This recurs the moment anyone edits a copy again — a scan finds it, only a governed source stops it from coming back.';
const USAGE_HELP_TEXT =
  'Usage: @skillsdrift scan <github-url-or-org/repo> — e.g. "@skillsdrift scan anthropics/skills" or ' +
  '"@skillsdrift scan https://github.com/anthropics/skills".';

const MENTION_PATTERN = /@skillsdrift\s+scan\s+(\S+)/i;

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** Extracts a bare org/repo slug from a mention command argument (URL or slug). */
function extractSlug(arg) {
  let cleaned = arg.trim().replace(/[.,;!?]+$/, '');
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  cleaned = cleaned.replace(/\.git$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  const match = cleaned.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (!match) return null;
  return `${match[1]}/${match[2]}`;
}

/** Parses `@skillsdrift scan <...>` mention text. Returns {slug} or null if malformed. */
function parseMentionText(text) {
  if (typeof text !== 'string') return null;
  const m = text.match(MENTION_PATTERN);
  if (!m) return null;
  const slug = extractSlug(m[1]);
  if (!slug) return null;
  return { slug };
}

// ---------------------------------------------------------------------------
// Clone + scan
// ---------------------------------------------------------------------------

function cloneRepo(slug) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillsdrift-bot-'));
  const url = `https://github.com/${slug}.git`;
  const result = childProcess.spawnSync('git', ['clone', '--depth', '1', url, tmpDir], {
    encoding: 'utf8',
    timeout: 60000,
  });
  if (result.status !== 0) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    const err = new Error(`git clone failed for ${slug} (exit ${result.status})`);
    err.cloneStderr = (result.stderr || '').split('\n').slice(0, 3).join(' ');
    throw err;
  }
  return tmpDir;
}

function runSkillsdrift(subpaths) {
  const result = childProcess.spawnSync('node', [SKILLSDRIFT_PATH, ...subpaths, '--json'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  // Exit 0 (clean) and 1 (findings present) both print valid JSON on stdout.
  if (result.status !== 0 && result.status !== 1) {
    const err = new Error(`skillsdrift engine exited ${result.status}`);
    err.stderr = result.stderr;
    throw err;
  }
  try {
    return JSON.parse(result.stdout);
  } catch (err) {
    throw new Error('skillsdrift engine did not print valid JSON');
  }
}

function loadCache(cacheFile) {
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  } catch (_err) {
    return {};
  }
}

function saveCache(cacheFile, cache) {
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * scanRepo(slug, opts) — the clone+scan+cache orchestration.
 * opts:
 *   - localPath: use this directory instead of cloning (test seam)
 *   - cacheFile: override cache file path (test seam)
 *   - now: override current time (ms epoch, test seam)
 *   - force: bypass cache even if fresh
 *
 * Returns one of:
 *   { status: 'repeat', slug, draftSummary, cachedAt }
 *   { status: 'ok', slug, scanJson }
 *   { status: 'no-skills', slug }
 *   { status: 'clone-failed', slug, error }
 */
function scanRepo(slug, opts = {}) {
  const now = opts.now || Date.now();
  const cacheFile = opts.cacheFile || DEFAULT_CACHE_FILE;
  const cache = loadCache(cacheFile);
  const cached = cache[slug];
  if (
    cached &&
    !opts.force &&
    now - new Date(cached.lastScannedAt).getTime() < ONE_DAY_MS
  ) {
    return { status: 'repeat', slug, draftSummary: cached.draftSummary, cachedAt: cached.lastScannedAt };
  }

  let repoRoot;
  let cleanup = () => {};
  if (opts.localPath) {
    repoRoot = opts.localPath;
  } else {
    try {
      repoRoot = cloneRepo(slug);
      cleanup = () => fs.rmSync(repoRoot, { recursive: true, force: true });
    } catch (err) {
      return { status: 'clone-failed', slug, error: err.message };
    }
  }

  try {
    const skillRoot = discoverSkillRoot(repoRoot);
    if (!skillRoot) {
      return { status: 'no-skills', slug };
    }
    const scanJson = runSkillsdrift([skillRoot]);
    return { status: 'ok', slug, scanJson };
  } finally {
    cleanup();
  }
}

// ---------------------------------------------------------------------------
// Reply assembly
// ---------------------------------------------------------------------------

function pickTopFinding(scanJson) {
  const drift = scanJson.drift || [];
  const security = scanJson.security || [];
  const ownership = scanJson.ownership || [];
  const version = scanJson.version || [];
  if (drift.length > 0) {
    const order = { high: 0, medium: 1, low: 2 };
    const sorted = [...drift].sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
    return { kind: 'drift', entry: sorted[0] };
  }
  if (security.length > 0) {
    return { kind: 'security', entry: security };
  }
  if (ownership.length > 0) {
    return { kind: 'ownership', entry: ownership[0], count: ownership.length };
  }
  if (version.length > 0) {
    return { kind: 'version', entry: version[0], count: version.length };
  }
  return { kind: 'clean' };
}

function securityCategoryChips(securityEntries) {
  const labels = Array.from(
    new Set(securityEntries.flatMap((s) => (s.findings || []).map((f) => f.label)))
  );
  const totalFindings = securityEntries.reduce((sum, s) => sum + (s.findings || []).length, 0);
  return { labels, totalFindings };
}

/** Numbers a list of tweet strings "1/", "2/" etc if there is more than one. */
function numberThread(lines) {
  if (lines.length <= 1) return lines.slice();
  return lines.map((line, i) => `${i + 1}/${lines.length} ${line}`);
}

function buildHookAndChips(slug, scanJson) {
  const top = pickTopFinding(scanJson);
  const lines = [];

  if (top.kind === 'drift') {
    const d = top.entry;
    lines.push(`${d.name} drifted across 2 copies found in ${slug}'s public skill scan.`);
    if ((scanJson.security || []).length > 0) {
      const { labels, totalFindings } = securityCategoryChips(scanJson.security);
      lines.push(
        `Also flagged: ${totalFindings} security-pattern flag(s) (category-level: ${labels
          .slice(0, 2)
          .join(', ')}) — no repo-linked detail shared here.`
      );
    } else if ((scanJson.ownership || []).length > 0 || (scanJson.version || []).length > 0) {
      lines.push(
        `${(scanJson.ownership || []).length} skill(s) with no named owner, ${
          (scanJson.version || []).length
        } with no version marker in the same scan.`
      );
    }
  } else if (top.kind === 'security') {
    const { labels, totalFindings } = securityCategoryChips(top.entry);
    lines.push(
      `Ran a skills scan on ${slug} — found ${totalFindings} security-pattern flag(s) (category-level, no repo-linked detail).`
    );
    lines.push(
      `Categories flagged: ${labels.slice(0, 2).join(', ')} (category-level only; no file/line detail shared).`
    );
  } else if (top.kind === 'ownership') {
    lines.push(
      `${slug}'s public skill scan found ${top.count} skill(s) with no named owner — no one to ask when it breaks.`
    );
  } else if (top.kind === 'version') {
    lines.push(
      `${slug}'s public skill scan found ${top.count} skill(s) with no version marker.`
    );
  } else {
    lines.push(`Scanned ${slug}'s public skills — no drift, ownership, version, or security findings this pass.`);
  }

  return lines.slice(0, 2);
}

function sanitizeSlugForFilename(slug) {
  return String(slug).replace(/[^a-zA-Z0-9._-]/g, '-');
}

/**
 * writeCard(scanJson, slug) — renders the SAME universal card build/scanner uses
 * (build/cardgen/lib/generate.js: recurrence close, disclosure, CTA, redaction-by-
 * default, no score) and writes it under build/bot/cards/<slug>.html. Previously this
 * called a bot-only card-stub.js that predated cardgen and lacked the recurrence-close
 * line and CTA — a spec-03 miss found during R16 verification.
 */
function writeCard(scanJson, slug) {
  const html = renderCard(scanJson, { org: slug });
  fs.mkdirSync(CARDS_DIR, { recursive: true });
  const safeSlug = sanitizeSlugForFilename(slug);
  fs.writeFileSync(path.join(CARDS_DIR, `${safeSlug}.html`), html, 'utf8');
  return `${CARD_BASE_URL}${safeSlug}.html`;
}

/** Builds the tweets[] array for a successful scan. */
function buildOkReply(slug, scanJson, opts = {}) {
  const cardUrl = (opts.generateCard || writeCard)(scanJson, slug);
  const parts = [];
  const [hook, chip] = buildHookAndChips(slug, scanJson);
  parts.push(hook);
  if (chip) parts.push(chip);
  parts.push(`Card: ${cardUrl}`);
  parts.push(RECURRENCE_CLOSE_LINE);
  parts.push(DISCLOSURE_LINE);
  return { tweets: numberThread(parts), cardUrl };
}

function buildRepeatReply(slug, draftSummary) {
  const noteLine = `Note: ${slug} was already scanned within the last 24h — reusing that result instead of re-cloning.`;
  const original = draftSummary && draftSummary.tweets ? draftSummary.tweets : [];
  // Strip any prior numbering before re-numbering with the note inserted.
  const stripped = original.map((t) => t.replace(/^\d+\/\d+\s/, ''));
  const parts = [stripped[0], noteLine, ...stripped.slice(1)].filter(Boolean);
  return { tweets: numberThread(parts), cardUrl: draftSummary && draftSummary.cardUrl, repeat: true };
}

function buildCloneFailedReply(slug) {
  return {
    tweets: [
      `Couldn't scan ${slug} — the repo may be private, renamed, or not found. Try a public org/repo slug, e.g. "anthropics/skills".`,
    ],
  };
}

function buildNoSkillsReply(slug) {
  return {
    tweets: [
      `Scanned ${slug} — no skill directories (SKILL.md) found there, nothing to report.`,
    ],
  };
}

function buildUsageHelpReply() {
  return { tweets: [USAGE_HELP_TEXT] };
}

/**
 * resolveDelivery({ slug, requester }) — decide whether findings may be posted
 * publicly, or must go by DM.
 *
 * §3.4: "The X account replies with a private link, not a public verdict,
 * unless the person asking maintains the repo." A public post about someone
 * else's repository is a verdict delivered in front of an audience, and this
 * project's whole position is that a forwarded note is welcome where a
 * broadcast is not.
 *
 * Public requires `requester.maintainerOf` to contain the slug — a list the
 * caller supplies only after verifying it. It is never inferred from the
 * handle, the display name, or anything the requester claims, because an X
 * handle proves nothing about a GitHub repository.
 */
function resolveDelivery({ slug, requester = {} }) {
  const maintains =
    Array.isArray(requester.maintainerOf) &&
    requester.maintainerOf.some((s) => String(s).toLowerCase() === String(slug).toLowerCase());
  return maintains ? 'public' : 'dm';
}

// What the bot may say in public when the findings themselves are going by DM.
// Deliberately carries no counts, no severities, no verdict — only that a reply
// was sent. Anything more is the public verdict the policy forbids.
function buildPrivateAck(slug) {
  return `Scanned it — sending you the result by DM so the details stay with you. If you maintain ${slug} and would rather this were public, say so and I'll reply here instead.`;
}

/**
 * handleMention(text, opts) — top-level entry point. Parses the mention, runs the
 * scan (or reuses cache), builds a reply object: { status, tweets, cardUrl?, repeat? }.
 * Never throws for expected failure modes (malformed request, clone failure, no skills);
 * only throws on truly unexpected internal errors.
 *
 * The reply also carries `delivery` ('dm' by default, 'public' only for a
 * verified maintainer) and, when delivery is 'dm', `publicAck` — the one
 * finding-free line that may be posted in the open.
 */
function handleMention(text, opts = {}) {
  const parsed = parseMentionText(text);
  if (!parsed) {
    // Usage help carries no findings, so it is safe in public.
    return { status: 'usage-help', delivery: 'public', ...buildUsageHelpReply() };
  }
  const { slug } = parsed;
  const delivery = resolveDelivery({ slug, requester: opts.requester });
  const withDelivery = (reply) =>
    delivery === 'dm'
      ? { ...reply, delivery, publicAck: buildPrivateAck(slug) }
      : { ...reply, delivery };
  const scanResult = scanRepo(slug, opts);

  if (scanResult.status === 'repeat') {
    return withDelivery({ status: 'repeat', slug, ...buildRepeatReply(slug, scanResult.draftSummary) });
  }
  if (scanResult.status === 'clone-failed') {
    // "Couldn't scan that" names no findings, so it may go back in public.
    return { status: 'clone-failed', slug, delivery: 'public', ...buildCloneFailedReply(slug) };
  }
  if (scanResult.status === 'no-skills') {
    return { status: 'no-skills', slug, delivery: 'public', ...buildNoSkillsReply(slug) };
  }

  // status === 'ok'
  const draftSummary = buildOkReply(slug, scanResult.scanJson, opts);
  const cacheFile = opts.cacheFile || DEFAULT_CACHE_FILE;
  const now = opts.now || Date.now();
  const cache = loadCache(cacheFile);
  cache[slug] = { lastScannedAt: new Date(now).toISOString(), draftSummary };
  saveCache(cacheFile, cache);
  return withDelivery({ status: 'ok', slug, ...draftSummary });
}

module.exports = {
  resolveDelivery,
  buildPrivateAck,
  parseMentionText,
  extractSlug,
  scanRepo,
  handleMention,
  numberThread,
  DISCLOSURE_LINE,
  RECURRENCE_CLOSE_LINE,
  USAGE_HELP_TEXT,
  DEFAULT_CACHE_FILE,
  SKILLSDRIFT_PATH,
};
