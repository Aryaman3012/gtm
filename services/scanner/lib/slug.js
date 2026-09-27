'use strict';

const fs = require('fs');
const path = require('path');

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Resolves a scan-repo input (github URL, "org/repo" slug, or a local
// filesystem path) into either a remote clone target or an already-checked-
// out local tree. Local paths never touch the network — this is what lets
// the test harness and done-criterion #2 run against the artifact's own
// fixtures with no clone.
function resolveTarget(input) {
  let s = String(input).trim();
  if (s.startsWith('file://')) s = s.slice('file://'.length);

  const githubUrlMatch = /^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i.exec(s);
  if (githubUrlMatch) {
    const [, org, repo] = githubUrlMatch;
    return { isLocal: false, org, repo, slug: `${org}--${repo}`, cloneUrl: `https://github.com/${org}/${repo}.git` };
  }

  const slugMatch = /^([\w.-]+)\/([\w.-]+)$/.exec(s);
  const looksLikeLocalPath = s.startsWith('.') || s.startsWith('/') || s.startsWith('~') || fs.existsSync(s);
  if (slugMatch && !looksLikeLocalPath) {
    const [, org, repo] = slugMatch;
    return { isLocal: false, org, repo, slug: `${org}--${repo}`, cloneUrl: `https://github.com/${org}/${repo}.git` };
  }

  const resolved = path.resolve(s);
  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Not a local path and not a recognized github.com URL or org/repo slug: ${input}`
    );
  }
  return { isLocal: true, localPath: resolved, slug: slugify(path.basename(resolved)) };
}

module.exports = { resolveTarget, slugify };
