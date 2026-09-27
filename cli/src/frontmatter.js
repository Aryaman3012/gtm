'use strict';

// Minimal YAML-frontmatter reader for SKILL.md files. Only supports flat
// `key: value` pairs (quoted or bare) inside a leading `---` block, which is
// all the skill-file convention needs (name/owner/version/description).
function parseFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
  if (!match) {
    return { data: {}, hasFrontmatter: false };
  }

  const data = {};
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, hasFrontmatter: true };
}

module.exports = { parseFrontmatter };
