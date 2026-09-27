#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { generateCard } = require('./lib/generate');
const { slugify } = require('../scanner/lib/slug');

const HELP = `cardgen.js <report.json> [--org "Acme"] [--slug foo] [--out dir] [--waitlist-url url]

Generates a standalone, static HTML "report card" from a skillsdrift v2
--json report (see artifact/src/report.js buildJsonReport). Zero deps,
inline CSS, no external assets, redaction on by default (no paths, no
owner identities, no security snippets ever reach the template).
`;

function parseArgs(argv) {
  const opts = { org: null, slug: null, out: null, waitlistUrl: null };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--org') opts.org = argv[++i];
    else if (a === '--slug') opts.slug = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--waitlist-url') opts.waitlistUrl = argv[++i];
    else if (a === '--help' || a === '-h') opts.help = true;
    else positional.push(a);
  }
  return { reportPath: positional[0], opts };
}

function main(argv) {
  const { reportPath, opts } = parseArgs(argv);
  if (opts.help || !reportPath) {
    process.stdout.write(HELP);
    return reportPath ? 0 : 2;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const slug = opts.slug || `${slugify(opts.org || 'skillsdrift-card')}-${new Date().toISOString().slice(0, 10)}`;
  const html = generateCard(report, { org: opts.org, waitlistUrl: opts.waitlistUrl });

  const outDir = opts.out || '.';
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf8');

  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  process.stdout.write(`Card written to ${outPath} (${sizeKb} KB)\n`);
  return 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { main, parseArgs };
