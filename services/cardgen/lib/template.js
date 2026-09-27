'use strict';

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

// Inline CSS, no external assets, no JS — a fully static, screenshot-able
// page. `model` is already redacted by generate.js before it reaches here:
// no path/dir/rootLabel/file/snippet field is ever passed in.
function renderTemplate(model) {
  const {
    org, uspPct, scorecard, securityCategories, scannedPathsLine,
    layerSummary, recurrenceClose, waitlistUrl, repoLink, disclosure,
    showSecurity,
  } = model;

  // Security is shown only on a card about the reader's own repository. On a
  // third-party card the row is omitted entirely rather than rendered as "0",
  // which would be a false statement about a real company.
  const securityRow = showSecurity
    ? `\n      <li>Security findings: ${
        securityCategories.length
          ? `${scorecard.securityFlagged} (${securityCategories.map((c) => escapeHtml(c.label)).join(', ')})`
          : '0'
      }</li>`
    : '';

  // The headline figure is withheld on third-party cards (see generate.js).
  const uspHtml =
    typeof uspPct === 'number'
      ? `<p class="usp">${uspPct}%<span> ungoverned · ${escapeHtml(scannedPathsLine)}</span></p>`
      : `<p class="usp">${scorecard.skillsScanned}<span> skill(s) read · ${escapeHtml(scannedPathsLine)}</span></p>`;

  const repoLinkHtml = repoLink
    ? `<p class="repo-link"><a href="${escapeHtml(repoLink)}" rel="noopener">View repo →</a></p>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(org)} — skillsdrift report card</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 2.5rem 1.5rem; background: #f6f7fb; color: #16181d; }
  .card { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .headline { font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.06em; color: #5b6472; margin: 0 0 0.25rem; }
  .usp { font-size: 4rem; font-weight: 800; margin: 0 0 1.25rem; line-height: 1; }
  .usp span { font-size: 1.1rem; font-weight: 600; color: #5b6472; }
  .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0 0 1.5rem; padding: 0; list-style: none; }
  .chips li { background: #eef1f6; border-radius: 999px; padding: 0.4rem 0.9rem; font-size: 0.85rem; }
  .layers { margin: 0 0 1.5rem; padding-left: 1.1rem; }
  .layers li { margin-bottom: 0.4rem; font-size: 0.92rem; }
  .close { font-size: 0.88rem; color: #444; border-left: 3px solid #d8dce3; padding-left: 0.75rem; margin: 0 0 1.5rem; }
  .disclosure { font-size: 0.78rem; color: #767f8c; margin: 0 0 1rem; }
  .cta { display: inline-block; background: #16181d; color: #fff; text-decoration: none; padding: 0.65rem 1.2rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }
  .repo-link a { color: #4a5bd4; font-size: 0.85rem; text-decoration: none; }
  @media (prefers-color-scheme: dark) {
    body { background: #0f1115; color: #e7e9ee; }
    .card { background: #181b21; box-shadow: none; }
    .headline { color: #9aa3b2; }
    .usp span { color: #9aa3b2; }
    .chips li { background: #23262e; }
    .close { color: #c3c8d1; border-left-color: #343841; }
    .disclosure { color: #767f8c; }
    .cta { background: #e7e9ee; color: #0f1115; }
  }
</style>
</head>
<body>
  <div class="card">
    <p class="headline">${escapeHtml(org)}'s agent skills, audited</p>
    ${uspHtml}
    <ul class="chips">
      <li>Skills scanned: ${scorecard.skillsScanned}</li>
      <li>Drift incidents: ${scorecard.driftedPairs}</li>
      <li>Unowned: ${scorecard.unowned}</li>
      <li>Unversioned: ${scorecard.unversioned}</li>${securityRow}
    </ul>
    <ul class="layers">
      <li><strong>Engineer view:</strong> ${escapeHtml(layerSummary.engineer)}</li>
      <li><strong>Team view:</strong> ${escapeHtml(layerSummary.team)}</li>
      <li><strong>Leader view:</strong> ${escapeHtml(layerSummary.leader)}</li>
    </ul>
    <p class="close">${escapeHtml(recurrenceClose)}</p>
    <p class="disclosure">${escapeHtml(disclosure)}</p>
    <p><a class="cta" href="${escapeHtml(waitlistUrl)}" rel="noopener">Join the Registry pilot waitlist</a></p>
    ${repoLinkHtml}
  </div>
</body>
</html>
`;
}

module.exports = { renderTemplate, escapeHtml };
