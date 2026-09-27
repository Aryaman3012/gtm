'use strict';

// Local test harness entry point. Runs every test module in sequence, each
// exporting an async `run()` that throws (via `assert`) on failure. Zero
// live network / live GitHub calls anywhere: the webhook test talks only to
// an in-process service.js instance on an ephemeral localhost port, and the
// scheduler/pr-creator tests run entirely against local fixture repos in
// `test: true` mode (pr-creator writes data/notice-draft.json instead of
// shelling out to `gh`).

const MODULES = [
  './test-signature',
  './test-scan-to-pr',
  './test-issue-not-pr',
  './test-no-auto-fix',
  './test-codeowners',
  './test-idempotency',
  './test-no-findings',
  './test-eaddrinuse',
];

async function main() {
  process.env.APP_TEST_MODE = '1';
  for (const modPath of MODULES) {
    process.stdout.write(`--- running ${modPath} ---\n`);
    const mod = require(modPath);
    await mod.run();
    process.stdout.write(`OK: ${modPath}\n`);
  }
  process.stdout.write('ALL TESTS PASSED\n');
}

main().catch((err) => {
  process.stderr.write(`TEST FAILURE: ${(err && err.stack) || err}\n`);
  process.exit(1);
});
