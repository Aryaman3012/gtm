#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { scanRepo } = require('./lib/scan-engine');

const OUT_DIR = path.join(__dirname, 'out');
const DATA_DIR = path.join(__dirname, 'data');

const HELP = `scan-repo.js <github-url-or-org/repo-or-local-path>

Scans one public GitHub repo (or a local checkout, e.g. an artifact fixture)
for skill drift/ownership/versioning/security via skillsdrift v2, then emits:
  - a private findings JSON (full detail) under data/findings/<slug>.json
  - a public card HTML under out/cards/<slug>.html
  - a public card record JSON under out/cards/<slug>.json
`;

function main(argv) {
  const input = argv[0];
  if (!input || input === '--help' || input === '-h') {
    process.stdout.write(HELP);
    return input ? 0 : 2;
  }

  const { slug, org, repoLink, findings, card } = scanRepo(input, {
    log: (m) => process.stderr.write(m + '\n'),
  });

  const findingsDir = path.join(DATA_DIR, 'findings');
  fs.mkdirSync(findingsDir, { recursive: true });
  const findingsPath = path.join(findingsDir, `${slug}.json`);
  fs.writeFileSync(findingsPath, JSON.stringify(findings, null, 2) + '\n', 'utf8');

  const cardsDir = path.join(OUT_DIR, 'cards');
  fs.mkdirSync(cardsDir, { recursive: true });
  const cardHtmlPath = path.join(cardsDir, `${slug}.html`);
  fs.writeFileSync(cardHtmlPath, card, 'utf8');

  const cardRecord = {
    slug,
    org,
    repoLink,
    generatedAt: new Date().toISOString(),
    scorecard: findings.scorecard,
    ungovernedSkillPercentage: findings.ungovernedSkillPercentage,
    cardUrl: `cards/${slug}.html`,
  };
  const cardJsonPath = path.join(cardsDir, `${slug}.json`);
  fs.writeFileSync(cardJsonPath, JSON.stringify(cardRecord, null, 2) + '\n', 'utf8');

  process.stdout.write(
    `scan-repo: ${slug} — ${findings.scorecard.skillsScanned} skill(s), ${findings.ungovernedSkillPercentage}% ungoverned\n` +
      `  findings: ${findingsPath}\n  card: ${cardHtmlPath}\n  record: ${cardJsonPath}\n`
  );
  return 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { main };
