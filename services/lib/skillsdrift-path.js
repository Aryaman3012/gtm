'use strict';
/**
 * Locate the skillsdrift CLI, which these services run as a subprocess.
 *
 * Two layouts exist and both are legitimate:
 *   this repo   <root>/cli           + <root>/services
 *   the VPS     atlan-gtm/artifact   + atlan-gtm/build
 *
 * Every service used to hardcode '../../artifact', so the whole test suite
 * failed the moment the code was checked out anywhere else. Resolve it once,
 * here, and let SKILLSDRIFT_DIR override for an unusual checkout.
 */

const fs = require('fs');
const path = require('path');

const CANDIDATES = [
  process.env.SKILLSDRIFT_DIR,
  path.resolve(__dirname, '..', '..', 'cli'),
  path.resolve(__dirname, '..', '..', 'artifact'),
  path.resolve(__dirname, '..', '..', '..', 'artifact'),
].filter(Boolean);

function skillsdriftDir() {
  for (const dir of CANDIDATES) {
    if (fs.existsSync(path.join(dir, 'skillsdrift.js'))) return dir;
  }
  throw new Error(
    'skillsdrift CLI not found. Looked in:\n  ' +
      CANDIDATES.join('\n  ') +
      '\nSet SKILLSDRIFT_DIR to the directory holding skillsdrift.js.'
  );
}

module.exports = {
  skillsdriftDir,
  /** Absolute path to the CLI entrypoint. */
  cli: () => path.join(skillsdriftDir(), 'skillsdrift.js'),
  /** Absolute path to the CLI's fixture repos, used by the test suites. */
  fixtures: () => path.join(skillsdriftDir(), 'fixtures'),
};
