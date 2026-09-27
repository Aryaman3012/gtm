'use strict';

const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', '.cache');
const TTL_MS = 24 * 60 * 60 * 1000;

function cachePathFor(slug) {
  return path.join(CACHE_DIR, slug);
}

function isFresh(dir) {
  const marker = path.join(dir, '.cloned-at');
  if (!fs.existsSync(marker)) return false;
  const ts = Number(fs.readFileSync(marker, 'utf8').trim());
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < TTL_MS;
}

function markCloned(dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.cloned-at'), String(Date.now()), 'utf8');
}

module.exports = { CACHE_DIR, TTL_MS, cachePathFor, isFresh, markCloned };
