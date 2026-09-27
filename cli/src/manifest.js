'use strict';

const { groupByName, ownerOf, versionOf, scanSecurityPatterns } = require('./checks');
const { hashSkillFiles } = require('./hash');

const SCHEMA = 'atlan-registry-import/1';

// Best-effort dotted-numeric version compare (1.10.0 > 1.9.0). Falls back to
// treating missing/non-numeric segments as 0 — good enough to pick a
// suggested canonical, not a general semver implementation.
function compareVersions(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10));
  const pb = String(b).split('.').map((n) => parseInt(n, 10));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = Number.isNaN(pa[i]) ? 0 : pa[i] || 0;
    const nb = Number.isNaN(pb[i]) ? 0 : pb[i] || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

function pickCanonical(members) {
  const withVersion = members.filter((m) => versionOf(m));
  const pool = withVersion.length ? withVersion : members;
  let best = pool[0];
  for (const m of pool.slice(1)) {
    if (versionOf(m) && versionOf(best) && compareVersions(versionOf(m), versionOf(best)) > 0) {
      best = m;
    }
  }
  return `${best.rootLabel}/${best.dirName}`;
}

// Build the import-ready registry inventory. Every field is a *suggestion*
// for a human to confirm (T5: humans confirm, never compose) — nothing here
// is written back to the scanned skills.
function buildManifest(allSkills, scannedPaths) {
  const groups = groupByName(allSkills);
  const skills = [];
  const duplicateGroups = [];
  let nextGroupId = 0;

  for (const [, members] of groups) {
    const isDuplicate = members.length > 1;
    const duplicateGroupId = isDuplicate ? nextGroupId++ : null;

    // Identical copies of the same skill collapse into one manifest entry
    // (multiple paths, one content_hash); copies that have actually
    // drifted get one entry per distinct hash, still sharing the group id.
    const byHash = new Map();
    for (const member of members) {
      const hash = hashSkillFiles(member.files);
      if (!byHash.has(hash)) byHash.set(hash, []);
      byHash.get(hash).push(member);
    }

    for (const [hash, hashMembers] of byHash) {
      const rep = hashMembers[0];
      const owner = ownerOf(rep);
      const version = versionOf(rep);
      const securityFlags = [...new Set(scanSecurityPatterns(rep).map((f) => f.patternId))];
      const suggestedAction = securityFlags.length ? 'review' : byHash.size > 1 ? 'merge' : 'import';

      skills.push({
        name: rep.name,
        paths: hashMembers.map((m) => m.rootLabel),
        duplicate_group: duplicateGroupId,
        content_hash: hash,
        owner: owner || null,
        owner_suggestion: owner ? null : 'last-editor-or-runner',
        version: version || null,
        version_suggestion: version ? null : '1.0.0',
        security_flags: securityFlags,
        suggested_action: suggestedAction,
      });
    }

    if (isDuplicate) {
      duplicateGroups.push({
        id: duplicateGroupId,
        members: members.map((m) => `${m.rootLabel}/${m.dirName}`),
        suggested_canonical: pickCanonical(members),
      });
    }
  }

  return {
    schema: SCHEMA,
    generated_at: new Date().toISOString(),
    paths_scanned: scannedPaths,
    skills,
    duplicate_groups: duplicateGroups,
  };
}

module.exports = { buildManifest };
