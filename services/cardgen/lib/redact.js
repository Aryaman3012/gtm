'use strict';

// The card template (template.js) never reads a raw path/dir/rootLabel/file/
// snippet field off the input report — these helpers turn the fields that
// *are* safe to summarize (counts, category labels) into template-ready
// shapes, so there is no field on the model an author could accidentally
// wire a filesystem path or credential-shaped snippet through.
function scannedPathsSummary(scannedPaths) {
  const n = Array.isArray(scannedPaths) ? scannedPaths.length : 0;
  return `${n} scanned path${n === 1 ? '' : 's'}`;
}

function securityCategoryCounts(security) {
  const counts = new Map();
  for (const entry of security || []) {
    for (const f of entry.findings || []) {
      counts.set(f.label, (counts.get(f.label) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

module.exports = { scannedPathsSummary, securityCategoryCounts };
