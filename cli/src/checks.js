'use strict';

const path = require('path');
const { hashSkillFiles, normalizeText } = require('./hash');
const { diffLines } = require('./diff');
const { SECURITY_PATTERNS } = require('./security-patterns');

function normalizedName(name) {
  return name.trim().toLowerCase();
}

// Group all scanned skills by normalized name, regardless of path or content
// — the basis for both drift detection and duplicate-group / bus-factor
// aggregation (a skill name present in 2+ scanned instances is a duplicate
// whether or not its content has actually diverged).
function groupByName(allSkills) {
  const groups = new Map();
  for (const skill of allSkills) {
    const key = normalizedName(skill.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(skill);
  }
  return groups;
}

function ownerOf(skill) {
  const fm = skill.frontmatter || {};
  return (fm.owner && fm.owner.trim()) || (fm.maintainer && fm.maintainer.trim()) || null;
}

function versionOf(skill) {
  const fm = skill.frontmatter || {};
  return (fm.version && fm.version.trim()) || (fm.ver && fm.ver.trim()) || null;
}

// Owner marker: frontmatter `owner`/`maintainer`, or an OWNERS/CONTACT file
// convention alongside SKILL.md (per strategy-core.md §4).
function checkOwnership(skill) {
  if (ownerOf(skill)) return true;
  return skill.files.some((f) => /^(OWNERS|CONTACT)(\.[a-z0-9]+)?$/i.test(path.basename(f.relPath)));
}

function checkVersion(skill) {
  return Boolean(versionOf(skill));
}

function scanSecurityPatterns(skill) {
  const findings = [];
  for (const file of skill.files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const pattern of SECURITY_PATTERNS) {
        if (pattern.regex.test(line)) {
          findings.push({
            patternId: pattern.id,
            label: pattern.label,
            severity: pattern.severity,
            reason: pattern.reason,
            file: file.relPath,
            line: idx + 1,
            snippet: line.trim().slice(0, 160),
          });
        }
      }
    });
  }
  return findings;
}

function toLines(normalizedText) {
  const lines = normalizedText.split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function diffSkillFiles(skillA, skillB) {
  const filesA = new Map(skillA.files.map((f) => [f.relPath, f.content]));
  const filesB = new Map(skillB.files.map((f) => [f.relPath, f.content]));
  const allPaths = new Set([...filesA.keys(), ...filesB.keys()]);

  const fileDiffs = [];
  for (const relPath of allPaths) {
    const a = filesA.get(relPath);
    const b = filesB.get(relPath);
    if (a === undefined) {
      fileDiffs.push({ relPath, status: 'added-in-b' });
      continue;
    }
    if (b === undefined) {
      fileDiffs.push({ relPath, status: 'removed-in-b' });
      continue;
    }
    const normA = normalizeText(a);
    const normB = normalizeText(b);
    if (normA === normB) continue;
    const ops = diffLines(toLines(normA), toLines(normB));
    fileDiffs.push({ relPath, status: 'changed', ops });
  }
  return fileDiffs;
}

// Group same-named skills across all scanned paths, hash each, and report
// every pair whose hash differs (with a per-file line diff).
function detectDrift(allSkills) {
  const groups = groupByName(allSkills);

  const driftedPairs = [];
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    const withHash = group.map((skill) => ({ skill, hash: hashSkillFiles(skill.files) }));
    for (let i = 0; i < withHash.length; i++) {
      for (let j = i + 1; j < withHash.length; j++) {
        if (withHash[i].hash !== withHash[j].hash) {
          driftedPairs.push({
            name: key,
            a: withHash[i].skill,
            b: withHash[j].skill,
            fileDiffs: diffSkillFiles(withHash[i].skill, withHash[j].skill),
          });
        }
      }
    }
  }
  return driftedPairs;
}

module.exports = {
  checkOwnership,
  checkVersion,
  scanSecurityPatterns,
  detectDrift,
  normalizedName,
  groupByName,
  ownerOf,
  versionOf,
};
