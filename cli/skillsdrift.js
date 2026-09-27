#!/usr/bin/env node
'use strict';

const { run } = require('./src/cli');

// Set exitCode rather than calling process.exit(). When stdout is a pipe,
// Node writes to it asynchronously, and process.exit() discards whatever is
// still buffered — so `skillsdrift . --json | jq` silently truncated large
// reports (measured: 146,103 bytes delivered out of 1,469,069, with no error
// on either side). Writing to a file happened to work, because file writes are
// synchronous, which is why this went unnoticed.
//
// Assigning exitCode lets Node exit naturally once stdout has drained, with
// the same status code.
process.exitCode = run(process.argv.slice(2), { cwd: process.cwd() });
