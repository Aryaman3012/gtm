'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./frontmatter');

const IGNORE_DIRS = new Set(['.git', 'node_modules', '.DS_Store']);
const MAX_DEPTH = 8;
const SKILL_FILENAME_RE = /^skill\.md$/i;

class ScanError extends Error {}

// A directory "is a skill" if it directly contains a SKILL.md. We don't
// descend into a matched skill dir looking for nested skills — skills don't
// nest inside each other by convention.
function walkForSkillDirs(dir, depth, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return;
  }

  const hasSkillFile = entries.some((e) => e.isFile() && SKILL_FILENAME_RE.test(e.name));
  if (hasSkillFile) {
    out.push(dir);
    return;
  }

  if (depth >= MAX_DEPTH) return;
  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORE_DIRS.has(entry.name)) {
      walkForSkillDirs(path.join(dir, entry.name), depth + 1, out);
    }
  }
}

function listFilesRecursive(dir, base) {
  base = base || dir;
  let out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return out;
  }
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(listFilesRecursive(full, base));
    } else if (entry.isFile()) {
      out.push(path.relative(base, full).split(path.sep).join('/'));
    }
  }
  return out;
}

function isProbablyBinary(buf) {
  const len = Math.min(buf.length, 1024);
  for (let i = 0; i < len; i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

// Scan one root path and return every skill found under it, each carrying
// the original CLI argument (`rootLabel`) so reports can say which of the
// input paths a drifted copy came from.
function scanPath(rootPathArg) {
  const resolved = path.resolve(rootPathArg);
  if (!fs.existsSync(resolved)) {
    throw new ScanError(`Path not found: ${rootPathArg}`);
  }
  if (!fs.statSync(resolved).isDirectory()) {
    throw new ScanError(`Path is not a directory: ${rootPathArg}`);
  }

  const skillDirs = [];
  walkForSkillDirs(resolved, 0, skillDirs);

  const skills = [];
  for (const dir of skillDirs) {
    const relFiles = listFilesRecursive(dir);
    const files = [];
    for (const rel of relFiles) {
      const full = path.join(dir, rel);
      const buf = fs.readFileSync(full);
      if (isProbablyBinary(buf)) continue;
      files.push({ relPath: rel, content: buf.toString('utf8') });
    }

    const skillMdFile = files.find((f) => /^skill\.md$/i.test(f.relPath));
    const { data: frontmatter } = skillMdFile
      ? parseFrontmatter(skillMdFile.content)
      : { data: {} };
    const dirName = path.basename(dir);
    const name = (frontmatter.name && frontmatter.name.trim()) || dirName;

    skills.push({
      name,
      dirName,
      dir,
      rootLabel: rootPathArg,
      files,
      frontmatter,
    });
  }

  return skills;
}

module.exports = { scanPath, ScanError };
