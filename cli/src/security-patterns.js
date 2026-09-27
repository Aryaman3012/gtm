'use strict';

// 11 heuristic patterns. Each is deliberately simple (regex, no AST/exec) —
// see README "Honest limitations" for what this does and doesn't catch.
// Reason field is surfaced in report output, not just docs, per the
// Snyk ToxicSkills finding that agent skills are a software supply chain.
const SECURITY_PATTERNS = [
  {
    id: 'curl-pipe-bash',
    label: 'curl/wget | bash pipe',
    severity: 'high',
    regex: /\b(curl|wget)\b[^\n]*\|\s*(sudo\s+)?(bash|sh|zsh)\b/i,
    reason: 'Piping a remote download straight into a shell executes unreviewed third-party code at run time.',
  },
  {
    id: 'eval-call',
    label: 'eval( call',
    severity: 'high',
    regex: /\beval\s*\(/,
    reason: 'eval() executes arbitrary dynamic code and is a common code-injection vector.',
  },
  {
    id: 'aws-access-key',
    label: 'AWS access key ID (AKIA...)',
    severity: 'high',
    regex: /AKIA[0-9A-Z]{16}/,
    reason: 'Matches the AWS access key ID format — a hardcoded cloud credential.',
  },
  {
    id: 'openai-style-key',
    label: 'LLM-provider secret key (sk-...)',
    severity: 'high',
    regex: /\bsk-[A-Za-z0-9]{20,}\b/,
    reason: 'Matches common LLM-provider secret key formats.',
  },
  {
    id: 'github-token',
    label: 'GitHub token (ghp_/gho_/ghu_/ghs_/ghr_...)',
    severity: 'high',
    regex: /\bgh[poucsr]_[A-Za-z0-9]{20,}\b/,
    reason: 'Matches GitHub personal-access-token / OAuth token formats.',
  },
  {
    id: 'slack-token',
    label: 'Slack token (xox...)',
    severity: 'high',
    regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
    reason: 'Matches Slack API token formats.',
  },
  {
    id: 'generic-secret-assignment',
    label: 'hardcoded secret-shaped assignment',
    severity: 'medium',
    regex: /(secret|password|passwd|api[_-]?key|token)\s*[:=]\s*['"][A-Za-z0-9+/_-]{20,}={0,2}['"]/i,
    reason: 'A long, high-entropy string assigned to a credential-shaped key name looks like a hardcoded secret.',
  },
  {
    id: 'broad-rm-rf',
    label: 'broad rm -rf',
    severity: 'high',
    regex: /\brm\s+(-[a-z]*f[a-z]*r[a-z]*|-[a-z]*r[a-z]*f[a-z]*)\s+(\/(?!\S)|~|\*|\$HOME|\$\{HOME\})/i,
    reason: 'An unqualified recursive delete against a root/home/wildcard path is destructive if run unattended.',
  },
  {
    id: 'sudo-usage',
    label: 'sudo invocation',
    severity: 'medium',
    regex: /(^|\s)sudo\s+\S/,
    reason: 'Privilege escalation from an agent skill should be reviewed explicitly, not run by default.',
  },
  {
    id: 'reverse-shell',
    label: 'reverse shell / raw socket redirect',
    severity: 'high',
    regex: /\bnc\s+-[a-z]*e\b|\/dev\/tcp\/[\w.$-]+\//i,
    reason: 'Matches common reverse-shell one-liners (netcat -e, /dev/tcp redirection).',
  },
  {
    id: 'raw-ip-endpoint',
    label: 'network call to a raw IP address',
    severity: 'medium',
    regex: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    reason: 'A network endpoint expressed as a bare IP (no domain) is a common exfiltration/C2 pattern.',
  },
];

module.exports = { SECURITY_PATTERNS };
