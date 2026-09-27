'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { cachePathFor, isFresh, markCloned } = require('./cache');

// The only place this codebase touches the network: a shallow `git clone`
// (via execFileSync with an argv array, never a shell string) of a public
// GitHub repo into the slug's cache dir, reused while within the 24h TTL.
// No fetch/http libs, per the zero-dep constraint.
function ensureCloned(target, { log = () => {} } = {}) {
  const dest = cachePathFor(target.slug);
  if (isFresh(dest)) {
    log(`cache hit (fresh, <24h): ${target.slug}`);
    return dest;
  }
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  log(`cloning ${target.cloneUrl} -> .cache/${target.slug}`);
  execFileSync('git', ['clone', '--depth', '1', '--quiet', target.cloneUrl, dest], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  markCloned(dest);
  return dest;
}

module.exports = { ensureCloned };
