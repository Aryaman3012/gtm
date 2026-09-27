'use strict';

/**
 * Test helpers — zero network. Builds a temp "repo root" fixture by copying (never
 * modifying) the read-only artifact/fixtures/repo-a and repo-b skill trees into a
 * scratch directory shaped like a real clone: <tmp>/.claude/skills (from repo-a) and
 * <tmp>/.codex (from repo-b, standing in for a second skills root so drift/duplication
 * findings trigger across the two directories oracle.js scans).
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const ARTIFACT_FIXTURES = require('../../lib/skillsdrift-path').fixtures();

function makeDriftFixtureRepo() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillsdrift-bot-test-'));
  fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
  fs.cpSync(path.join(ARTIFACT_FIXTURES, 'repo-a', '.claude', 'skills'), path.join(tmpDir, '.claude', 'skills'), {
    recursive: true,
  });
  fs.cpSync(path.join(ARTIFACT_FIXTURES, 'repo-b', '.claude', 'skills'), path.join(tmpDir, '.codex'), {
    recursive: true,
  });
  return tmpDir;
}

/** Security-only fixture: just repo-a's installer-helper skill, no drift/ownership/version noise. */
function makeSecurityOnlyFixtureRepo() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillsdrift-bot-test-sec-'));
  fs.mkdirSync(path.join(tmpDir, '.claude', 'skills'), { recursive: true });
  fs.cpSync(
    path.join(ARTIFACT_FIXTURES, 'repo-a', '.claude', 'skills', 'installer-helper'),
    path.join(tmpDir, '.claude', 'skills', 'installer-helper'),
    { recursive: true }
  );
  return tmpDir;
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function makeScratchDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix || 'skillsdrift-bot-scratch-'));
}

module.exports = {
  ARTIFACT_FIXTURES,
  makeDriftFixtureRepo,
  makeSecurityOnlyFixtureRepo,
  cleanup,
  makeScratchDir,
};
