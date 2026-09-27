'use strict';

// Classic LCS-based line diff. Skill files are small (docs + short scripts),
// so the O(n*m) table is cheap; no need for a streaming Myers implementation.
function diffLines(oldLines, newLines) {
  const n = oldLines.length;
  const m = newLines.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        oldLines[i] === newLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (oldLines[i] === newLines[j]) {
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', line: oldLines[i], lineNumber: i + 1 });
      i++;
    } else {
      ops.push({ type: 'add', line: newLines[j], lineNumber: j + 1 });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: 'remove', line: oldLines[i], lineNumber: i + 1 });
    i++;
  }
  while (j < m) {
    ops.push({ type: 'add', line: newLines[j], lineNumber: j + 1 });
    j++;
  }

  return ops;
}

module.exports = { diffLines };
