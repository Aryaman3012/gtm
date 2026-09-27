'use strict';

const {
  checkOwnership,
  checkVersion,
  scanSecurityPatterns,
  detectDrift,
  groupByName,
  ownerOf,
} = require('./checks');
const { hashSkillFiles } = require('./hash');

const SNYK_NOTE =
  'Informed by Snyk\'s ToxicSkills research: 36.82% of scanned public skills (1,467) had at ' +
  'least one security flaw, including 76 malicious credential-theft payloads. Agent skills are ' +
  'a software supply chain — treat them like one.';

// T5 (anti-fragmentation gate): every layer ends with a hard-coded
// recurrence close. A hand-fix can't survive a second edit; these lines are
// never optional and never reworded per-run.
const RECURRENCE_CLOSE = {
  l1:
    'This will drift again the moment a second person edits any of these skills. A local scan ' +
    'can find it; only a governed source of truth prevents it.',
  l2:
    'Governed skills stay in sync automatically; ungoverned skills diverge again next sprint. ' +
    'This score will look different next month whether or not anyone acts today.',
  l3:
    'This number moves every sprint whether or not anyone reviews it. A scan finds ungoverned ' +
    'skills; only a governed registry keeps the number from climbing back.',
};

// Same findings, two surface vocabularies (Correction 4's language reframe).
// Layer 1 stays engineer-shaped regardless of --language; this table only
// feeds the team-scorecard and exec-memo layers.
const TERMS = {
  dev: {
    unowned: 'unowned',
    unversioned: 'unversioned',
    securityFlagged: 'security-flagged',
    duplicated: 'duplicated',
    everyoneOwnVersion: 'diverged into separate copies',
    driftIncidents: 'drift incidents',
  },
  biz: {
    unowned: 'no owner on record',
    unversioned: 'no version history tracked',
    securityFlagged: 'flagged for security review',
    duplicated: 'duplicated',
    everyoneOwnVersion: 'everyone made their own version',
    driftIncidents: 'outdated-version incidents',
  },
};

function terms(language) {
  return TERMS[language] || TERMS.dev;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildResults(allSkills) {
  const ownership = [];
  const version = [];
  const security = [];

  for (const skill of allSkills) {
    if (!checkOwnership(skill)) ownership.push(skill);
    if (!checkVersion(skill)) version.push(skill);
    const findings = scanSecurityPatterns(skill);
    if (findings.length) security.push({ skill, findings });
  }

  const drift = detectDrift(allSkills);
  const duplicateGroups = buildDuplicateGroups(allSkills);
  const busFactor = computeBusFactor(allSkills);
  const duplicateInstances = duplicateGroups.reduce((sum, g) => sum + g.memberCount, 0);

  return {
    scorecard: {
      skillsScanned: allSkills.length,
      driftedPairs: drift.length,
      unowned: ownership.length,
      unversioned: version.length,
      securityFlagged: security.length,
    },
    drift,
    ownership,
    version,
    security,
    duplicateGroups,
    busFactor,
    duplicateInstances,
  };
}

// Cross-path duplicate detection for the team scorecard's blast-radius
// examples: any skill name present in 2+ scanned instances, whether or not
// the content has actually drifted (identical copies are still a duplicate
// worth merging).
function buildDuplicateGroups(allSkills) {
  const groups = groupByName(allSkills);
  const out = [];
  for (const [, members] of groups) {
    if (members.length < 2) continue;
    const hashes = new Set(members.map((m) => hashSkillFiles(m.files)));
    const files = new Set();
    for (const m of members) {
      for (const f of m.files) files.add(f.relPath);
    }
    out.push({
      name: members[0].name,
      memberCount: members.length,
      pathCount: new Set(members.map((m) => m.rootLabel)).size,
      versionCount: hashes.size,
      fileCount: files.size,
    });
  }
  return out;
}

// Bus factor: for each distinct skill name, how many distinct named owners
// cover it. Zero owners is already counted as "unowned"; exactly one named
// owner is the key-person-risk case the exec memo translates into headcount
// terms (blast-radius examples can't know teammate identities, only paths).
function computeBusFactor(allSkills) {
  const groups = groupByName(allSkills);
  let busFactorOne = 0;
  let noOwner = 0;
  for (const [, members] of groups) {
    const owners = new Set(members.map(ownerOf).filter(Boolean));
    if (owners.size === 0) noOwner++;
    else if (owners.size === 1) busFactorOne++;
  }
  return { busFactorOne, noOwner };
}

function hasFindings(results) {
  return (
    results.drift.length > 0 ||
    results.ownership.length > 0 ||
    results.version.length > 0 ||
    results.security.length > 0
  );
}

function skillLabel(skill) {
  return `${skill.name} (${skill.rootLabel}/${skill.dirName})`;
}

// Ungoverned Skill Percentage — the exec-memo headline metric (Part C):
// the union of skills missing an owner, missing a version, or carrying a
// security-heuristic hit, as a share of everything scanned.
function computeUSP(results) {
  const ungoverned = new Set();
  for (const s of results.ownership) ungoverned.add(s);
  for (const s of results.version) ungoverned.add(s);
  for (const entry of results.security) ungoverned.add(entry.skill);
  const total = results.scorecard.skillsScanned;
  const pct = total === 0 ? 0 : Math.round((ungoverned.size / total) * 100);
  return { count: ungoverned.size, pct };
}

function tallySecurityByLabel(security) {
  const counts = new Map();
  for (const entry of security) {
    for (const f of entry.findings) {
      counts.set(f.label, (counts.get(f.label) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function buildJsonReport(results, scannedPaths, waitlistUrl) {
  const usp = computeUSP(results);
  return {
    tool: 'skillsdrift',
    generatedAt: new Date().toISOString(),
    scannedPaths,
    scorecard: results.scorecard,
    drift: results.drift.map((d) => ({
      name: d.name,
      severity: 'medium',
      a: { rootLabel: d.a.rootLabel, dir: d.a.dir },
      b: { rootLabel: d.b.rootLabel, dir: d.b.dir },
      files: d.fileDiffs.map((fd) => ({
        relPath: fd.relPath,
        status: fd.status,
        changes: fd.ops
          ? fd.ops.map((op) => ({ type: op.type, line: op.lineNumber, text: op.line }))
          : undefined,
      })),
    })),
    ownership: results.ownership.map((s) => ({
      name: s.name,
      severity: 'low',
      rootLabel: s.rootLabel,
      dir: s.dir,
    })),
    version: results.version.map((s) => ({
      name: s.name,
      severity: 'low',
      rootLabel: s.rootLabel,
      dir: s.dir,
    })),
    security: results.security.map((entry) => ({
      name: entry.skill.name,
      rootLabel: entry.skill.rootLabel,
      dir: entry.skill.dir,
      findings: entry.findings,
    })),
    duplicateGroups: results.duplicateGroups,
    busFactor: results.busFactor,
    ungovernedSkillPercentage: usp.pct,
    securityNote: SNYK_NOTE,
    waitlistUrl,
  };
}

function buildMarkdownReport(results, scannedPaths, waitlistUrl, opts = {}) {
  const language = opts.language === 'biz' ? 'biz' : 'dev';
  const t = terms(language);
  const deterministic = Boolean(opts.checkin);
  const sc = results.scorecard;
  const usp = computeUSP(results);
  const lines = [];

  lines.push('# skillsdrift report');
  lines.push('');
  if (!deterministic) {
    lines.push(`Generated: ${new Date().toISOString()}`);
  }
  lines.push(`Scanned paths: ${scannedPaths.map((p) => '`' + p + '`').join(', ')}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // ===== Layer 1 — Engineer view =====
  lines.push('## Layer 1 — Engineer view');
  lines.push('');
  lines.push(
    '_Per-skill findings: drift, ownership, versioning, security. First-person-useful — no ' +
      'sales pitch in this section._'
  );
  lines.push('');
  lines.push('### Scorecard');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|---|---|');
  lines.push(`| Skills scanned | ${sc.skillsScanned} |`);
  lines.push(`| Drifted pairs | ${sc.driftedPairs} |`);
  lines.push(`| Missing owner | ${sc.unowned} |`);
  lines.push(`| Missing version | ${sc.unversioned} |`);
  lines.push(`| Security-flagged skills | ${sc.securityFlagged} |`);
  lines.push('');

  lines.push('### Drift');
  lines.push('');
  if (results.drift.length === 0) {
    lines.push('None found — no same-named skill had differing content across the scanned paths.');
  } else {
    for (const d of results.drift) {
      lines.push(`#### \`${d.name}\` drifted — [severity: medium]`);
      lines.push('');
      lines.push(`- Copy A: \`${d.a.rootLabel}/${d.a.dirName}\``);
      lines.push(`- Copy B: \`${d.b.rootLabel}/${d.b.dirName}\``);
      lines.push('');
      for (const fd of d.fileDiffs) {
        if (fd.status === 'added-in-b') {
          lines.push(`- \`${fd.relPath}\`: present only in copy B`);
          continue;
        }
        if (fd.status === 'removed-in-b') {
          lines.push(`- \`${fd.relPath}\`: present only in copy A`);
          continue;
        }
        lines.push(`- \`${fd.relPath}\` changed:`);
        for (const op of fd.ops) {
          const sign = op.type === 'add' ? '+' : '-';
          lines.push(`  - line ${op.lineNumber}: \`${sign} ${op.line}\``);
        }
      }
      lines.push('');
    }
  }

  lines.push('### Ownership');
  lines.push('');
  if (results.ownership.length === 0) {
    lines.push(
      'None found — every skill declares an owner (frontmatter `owner`/`maintainer`, or an ' +
        'OWNERS/CONTACT file).'
    );
  } else {
    for (const s of results.ownership) {
      lines.push(`- ${skillLabel(s)} — no owner marker found [severity: low]`);
    }
  }
  lines.push('');

  lines.push('### Version');
  lines.push('');
  if (results.version.length === 0) {
    lines.push('None found — every skill declares a `version` in frontmatter.');
  } else {
    for (const s of results.version) {
      lines.push(`- ${skillLabel(s)} — no version marker found [severity: low]`);
    }
  }
  lines.push('');

  lines.push('### Security');
  lines.push('');
  lines.push(`_${SNYK_NOTE}_`);
  lines.push('');
  if (results.security.length === 0) {
    lines.push(
      'None found — no skill matched a security heuristic. See README for the full pattern ' +
        'list and their limits.'
    );
  } else {
    for (const entry of results.security) {
      lines.push(`#### ${skillLabel(entry.skill)}`);
      lines.push('');
      for (const f of entry.findings) {
        lines.push(
          `- **${f.label}** [severity: ${f.severity}] — \`${f.file}:${f.line}\`: \`${f.snippet}\``
        );
        lines.push(`  - Why this matters: ${f.reason}`);
      }
      lines.push('');
    }
  }

  lines.push(`**Recurrence close:** ${RECURRENCE_CLOSE.l1}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // ===== Layer 2 — Team scorecard =====
  lines.push('## Layer 2 — Team scorecard');
  lines.push('');
  lines.push(
    `_Your team's skills, audited across ${scannedPaths.length} scanned path(s) — the ` +
      'diligence a champion runs before raising anything upstream._'
  );
  lines.push('');
  const dupRate = sc.skillsScanned === 0 ? 0 : Math.round((results.duplicateInstances / sc.skillsScanned) * 100);
  lines.push('| Metric | Count |');
  lines.push('|---|---|');
  lines.push(`| Ungoverned skills (${t.unowned} or ${t.unversioned}) | ${usp.count} |`);
  lines.push(`| ${capitalize(t.driftIncidents)} | ${sc.driftedPairs} |`);
  lines.push(
    `| Duplicate rate | ${dupRate}% (${results.duplicateInstances} of ${sc.skillsScanned} skill copies exist in more than one place) |`
  );
  lines.push(`| Bus-factor-1 skills (single named owner) | ${results.busFactor.busFactorOne} |`);
  lines.push(`| No-owner skills | ${results.busFactor.noOwner} |`);
  lines.push('');
  lines.push('**Blast radius** (cross-path duplicates):');
  lines.push('');
  if (results.duplicateGroups.length === 0) {
    lines.push('None found — no skill name repeats across the scanned paths.');
  } else {
    for (const g of results.duplicateGroups) {
      const status = g.versionCount > 1 ? `${t.duplicated} — ${t.everyoneOwnVersion}` : t.duplicated;
      lines.push(
        `- \`${g.name}\` — ${status}: used across ${g.pathCount} scanned path(s), ${g.versionCount} version(s), ${g.fileCount} file(s) affected`
      );
    }
  }
  lines.push('');
  lines.push(`**Recurrence close:** ${RECURRENCE_CLOSE.l2}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // ===== Layer 3 — Exec memo =====
  lines.push('## For your AI lead / VP');
  lines.push('');
  lines.push(
    `> **${usp.pct}% of this team's agent skills have no named owner, no version marker, and ` +
      'no security review. That number only moves one way on its own: up.**'
  );
  lines.push('');
  lines.push(`- **${capitalize(t.driftIncidents)} this scan:** ${sc.driftedPairs}`);
  const secTally = tallySecurityByLabel(results.security);
  if (secTally.length === 0) {
    lines.push(
      `- **Security exposure:** none matched by the current heuristic patterns this scan ` +
        '(forward-looking until Atlan ships its native scan).'
    );
  } else {
    lines.push(
      `- **Security exposure** (${t.securityFlagged}, forward-looking until Atlan ships its native scan):`
    );
    for (const { label, count } of secTally) {
      lines.push(`  - ${label}: ${count}`);
    }
  }
  const reconstructionHours = results.busFactor.busFactorOne * 4;
  lines.push(
    `- **Key-person risk:** ${results.busFactor.busFactorOne} skill(s) have exactly one named ` +
      'owner on record. At an assumed 4 engineer-hours to reconstruct a skill from scratch ' +
      `[assumption, not measured], that's ~${reconstructionHours} engineer-hour(s) of ` +
      'reconstruction exposure if any one of those owners leaves.'
  );
  lines.push(
    '- **Governance posture:** this is a snapshot of whether this team\'s AI agent skills are ' +
      'governed — named owner, tracked version, reviewed for risk — or not, and whether that ' +
      'posture is improving or degrading month over month. It is not a recommendation to buy ' +
      'a specific tool.'
  );
  lines.push('');
  lines.push(`**Recurrence close:** ${RECURRENCE_CLOSE.l3}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Next step');
  lines.push('');
  lines.push(
    'Import this inventory into the governed registry pilot — `skillsdrift-manifest.json` is ready.'
  );
  lines.push('');
  lines.push(
    `Want drift, ownership, and security checks like this running automatically across your ` +
      `whole team, not just this one snapshot? Join the Registry pilot waitlist: ${waitlistUrl}`
  );
  lines.push('');

  return lines.join('\n');
}

module.exports = { buildResults, hasFindings, buildJsonReport, buildMarkdownReport, computeUSP };
