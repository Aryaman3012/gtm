#!/usr/bin/env python3
"""
skillsdrift-bridge triage.

Reads an existing skill drift report (skillsdrift JSON or registry-import manifest,
a markdown report, or an HTML card), pulls out the skills and drift groups it
describes, and scores which skills are cross-functional (their output is used
outside engineering).

It does not scan anything and does not use the network. The only input is the
report file(s).

Usage:
  python3 triage.py report.json [more files...]          # JSON out
  python3 triage.py skillsdrift-report.md --format md    # markdown summary
  python3 triage.py card.html --out triage.json

If the report's structure isn't recognised, the output has "parsed": false and
"raw_text" (the report text, emails redacted) so the agent can read it directly.
"""
import argparse
import html as htmllib
from html.parser import HTMLParser
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from classify_core import (EMAIL_RE, find_secrets, redact_path, score_skill,  # noqa: E402
                           short_loc)

NAME_KEYS = ["name", "skill", "skill_name", "skillName", "title", "id"]
DESC_KEYS = ["description", "summary", "what", "purpose"]
LOC_KEYS = ["path", "paths", "location", "locations", "file", "files", "source", "sources", "copies_at", "repo"]
OWNER_KEYS = ["owner", "owners", "suggested_owner", "suggestedOwner", "maintainer", "author", "attribution"]
VERSION_KEYS = ["version", "suggested_version", "suggestedVersion"]
PEOPLE_KEYS = ["used_by", "usedBy", "users", "teammates", "contributors", "authors", "consumers", "teams"]
URL_KEYS = ["share_url", "shareUrl", "registry_url", "registryUrl", "dashboard_url", "dashboardUrl", "url", "link",
            "card_url", "cardUrl"]
SECURITY_KEYS = ["security", "security_findings", "securityFindings", "findings", "risks", "secrets"]
GROUP_MEMBER_KEYS = ["members", "copies", "variants", "locations", "paths", "instances"]
GROUP_CANON_KEYS = ["canonical", "suggested_canonical", "suggestedCanonical", "canonical_suggestion"]
SKILL_HINT_KEYS = set(DESC_KEYS + LOC_KEYS + OWNER_KEYS + VERSION_KEYS + PEOPLE_KEYS + SECURITY_KEYS)


def first(d, keys):
    for k in keys:
        if k in d and d[k] not in (None, "", [], {}):
            return d[k]
    return None


def as_list(v):
    if v is None:
        return []
    if isinstance(v, list):
        return v
    return [v]


def text_of(v):
    if isinstance(v, dict):
        return first(v, ["name", "handle", "owner", "team", "email", "value"]) or json.dumps(v)[:80]
    return str(v)


# --- JSON reports --------------------------------------------------------------
def walk_json(node, skills, groups, parent_key=""):
    if isinstance(node, dict):
        keys = set(node.keys())
        members = first(node, GROUP_MEMBER_KEYS)
        is_group = (isinstance(members, list) and len(members) > 1 and
                    (keys & set(GROUP_CANON_KEYS) or "duplicate" in parent_key.lower() or "drift" in parent_key.lower()
                     or "group" in parent_key.lower() or {"distinct_versions", "versions", "version_count"} & keys))
        name = first(node, NAME_KEYS)
        if is_group:
            groups.append({
                "name": str(name or "unnamed group"),
                "members": [text_of(m) for m in members],
                "canonical": text_of(first(node, GROUP_CANON_KEYS)) if first(node, GROUP_CANON_KEYS) else None,
                "distinct_versions": first(node, ["distinct_versions", "version_count", "versions"]),
            })
        elif name and isinstance(name, (str, int)) and keys & SKILL_HINT_KEYS:
            # Looks like a skill record (a name plus skill-ish fields), not a container.
            skills.append(node)
        for k, v in node.items():
            if isinstance(v, (dict, list)):
                walk_json(v, skills, groups, k)
    elif isinstance(node, list):
        for item in node:
            walk_json(item, skills, groups, parent_key)


def headline_from_text(text):
    """Grab exec-style headline sentences ('X% of ... no named owner ...') if the report has them."""
    out = []
    for sent in re.split(r"(?<=[.!?])\s+|\n+", text):
        if "%" in sent and re.search(r"owner|version|review|drift|govern", sent, re.I):
            out.append(sent.strip()[:240])
    return out[:3]


def from_json(data):
    raw_skills, groups = [], []
    walk_json(data, raw_skills, groups)
    skills = []
    for r in raw_skills:
        security = first(r, SECURITY_KEYS)
        skills.append({
            "name": str(first(r, NAME_KEYS)),
            "description": str(first(r, DESC_KEYS) or ""),
            "locations": [str(text_of(x)) for x in as_list(first(r, LOC_KEYS))],
            "owner": text_of(first(r, OWNER_KEYS)) if first(r, OWNER_KEYS) else None,
            "owner_confirmed": bool(first(r, ["owner", "owners", "maintainer"])),
            "share_url": str(first(r, URL_KEYS)) if first(r, URL_KEYS) else None,
            "version": str(first(r, VERSION_KEYS)) if first(r, VERSION_KEYS) else None,
            "people_local": [text_of(p) for p in as_list(first(r, PEOPLE_KEYS))],
            "security_flags": [text_of(s) for s in as_list(security)] if security not in (True, False) else
            (["flagged"] if security else []),
            "body_excerpt": str(first(r, ["content", "body", "text", "excerpt"]) or "")[:4000],
        })
    strings, explicit = [], []
    def collect(n):
        if isinstance(n, dict):
            for k, v in n.items():
                if isinstance(v, str) and k.lower() in ("headline", "summary", "exec_memo", "memo", "usp"):
                    explicit.append(v)
                elif not isinstance(v, str):
                    collect(v)
                else:
                    strings.append(v)
        elif isinstance(n, list):
            for x in n:
                collect(x)
        elif isinstance(n, str):
            strings.append(n)
    collect(data)
    headline = headline_from_text("\n".join(explicit)) or headline_from_text("\n".join(strings))
    return skills, groups, headline


# --- Markdown / HTML reports ----------------------------------------------------
class _TableParser(HTMLParser):
    """Collect <table> rows as lists of cell text, plus all visible text."""
    def __init__(self):
        super().__init__()
        self.tables, self.text = [], []
        self._row = self._cell = None
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self._skip += 1
        elif tag == "table":
            self.tables.append([])
        elif tag == "tr" and self.tables:
            self._row = []
        elif tag in ("td", "th") and self._row is not None:
            self._cell = []

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self._skip = max(0, self._skip - 1)
        elif tag in ("td", "th") and self._cell is not None and self._row is not None:
            self._row.append(re.sub(r"\s+", " ", "".join(self._cell)).strip())
            self._cell = None
        elif tag == "tr" and self._row is not None and self.tables:
            if self._row:
                self.tables[-1].append(self._row)
            self._row = None
        elif tag in ("p", "div", "li", "h1", "h2", "h3", "h4", "br"):
            self.text.append("\n")

    def handle_data(self, data):
        if self._skip:
            return
        if self._cell is not None:
            self._cell.append(data)
        self.text.append(data)


def html_to_text(s):
    """Turn HTML into markdown-style tables (so the table parser works) plus plain text (for headlines)."""
    p = _TableParser()
    p.feed(s)
    md = []
    for table in p.tables:
        if not table:
            continue
        md.append("| " + " | ".join(table[0]) + " |")
        md.append("|" + "---|" * len(table[0]))
        md += ["| " + " | ".join(r) + " |" for r in table[1:]]
        md.append("")
    plain = htmllib.unescape(re.sub(r"[ \t]+", " ", "".join(p.text)))
    return "\n".join(md) + "\n" + plain


COLMAP = {
    "name": ["skill", "name", "skill name"],
    "description": ["description", "what", "purpose", "does"],
    "locations": ["where", "location", "path", "paths", "repo", "repos", "copies at"],
    "owner": ["owner", "owners", "suggested owner", "maintainer"],
    "version": ["version", "versions"],
    "copies": ["copies", "count", "instances"],
    "people_local": ["used by", "users", "teams", "teammates"],
    "security_flags": ["security", "findings", "risk", "risks"],
    "shareable": ["shareable", "share"],
}


def from_markdown(text):
    skills, groups = [], []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        has_sep = i + 1 < len(lines) and re.match(r"^\|?\s*:?-{2,}", lines[i + 1].strip())
        no_sep_table = i + 1 < len(lines) and lines[i + 1].strip().startswith("|")
        if line.startswith("|") and (has_sep or no_sep_table):
            header = [h.strip().lower().strip("*_ ") for h in line.strip("|").split("|")]
            colidx = {}
            for field, names in COLMAP.items():
                for j, h in enumerate(header):
                    if h in names or any(h.startswith(n) for n in names):
                        colidx.setdefault(field, j)
            i += 2 if has_sep else 1
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                rows.append(cells)
                i += 1
            if "name" not in colidx:
                continue
            drift_table = "copies" in colidx and "description" not in colidx and "people_local" not in colidx \
                and "shareable" not in colidx
            for cells in rows:
                get = lambda f: cells[colidx[f]] if f in colidx and colidx[f] < len(cells) else ""
                name = re.sub(r"[*_`]", "", get("name")).strip()
                if not name:
                    continue
                copies = get("copies")
                if drift_table:
                    if re.match(r"^\d+$", copies or "") and int(copies) > 1:
                        groups.append({"name": re.sub(r"\s*\(maybe\)\s*", "", name), "members":
                                       [f"copy {k + 1}" for k in range(int(copies))], "canonical": None,
                                       "distinct_versions": get("version") or None})
                    continue
                sec = get("security_flags")
                share = get("shareable").lower()
                rec = {
                    "name": re.sub(r"\s*\(maybe\)\s*", "", name),
                    "description": get("description"),
                    "locations": [x.strip() for x in re.split(r",|<br>", get("locations")) if x.strip()],
                    "owner": get("owner") if get("owner") and get("owner").lower() not in ("-", "none") else None,
                    "owner_confirmed": bool(get("owner")) and "suggest" not in header[colidx["owner"]]
                    if "owner" in colidx else False,
                    "version": get("version") or None,
                    "people_local": [x.strip() for x in get("people_local").split(",") if x.strip()],
                    "security_flags": ([sec] if sec and sec.lower() not in ("-", "none", "no", "0") else [])
                    + (["marked not shareable in report: " + get("shareable")] if share.startswith("no") else []),
                    "body_excerpt": " ".join(cells),
                }
                skills.append(rec)
                if copies and re.match(r"^\d+$", copies) and int(copies) > 1:
                    groups.append({"name": rec["name"], "members": rec["locations"] or [f"{copies} copies"],
                                   "canonical": None, "distinct_versions": get("version") or None})
            continue
        i += 1
    return skills, groups, headline_from_text(text)


# --- Merge + classify -----------------------------------------------------------
def merge(skills, groups):
    by = {}
    for s in skills:
        key = s["name"].lower().strip()
        if key not in by:
            by[key] = dict(s)
            by[key]["copies_in_report"] = 1
        else:
            m = by[key]
            m["copies_in_report"] += 1
            for f in ("locations", "people_local", "security_flags"):
                m[f] = list(dict.fromkeys(m.get(f, []) + s.get(f, [])))
            m["owner_confirmed"] = m.get("owner_confirmed") or s.get("owner_confirmed")
            for f in ("description", "owner", "version", "body_excerpt", "share_url"):
                m[f] = m.get(f) or s.get(f)
    gmap = {g["name"].lower(): g for g in groups}
    out = []
    for key, s in by.items():
        g = gmap.get(key)
        blob = " ".join([s.get("description", ""), s.get("body_excerpt", "")])
        score, label, audience, reasons = score_skill(s["name"], s.get("description", ""), s.get("body_excerpt", ""),
                                                      " ".join(s.get("locations", [])))
        secrets = list(s.get("security_flags", [])) + [x for x in find_secrets(blob)]
        copies = max(s["copies_in_report"], len(g["members"]) if g else 0, len(s.get("locations", [])))
        out.append({
            "name": s["name"],
            "description": EMAIL_RE.sub("[email]", s.get("description", ""))[:300],
            "owner": s.get("owner"),
            "owner_confirmed": bool(s.get("owner") and s.get("owner_confirmed")),  # False = only suggested
            "version": s.get("version"),
            "share_url": s.get("share_url"),  # per-skill link from the report (e.g. its page in the registry), if any
            "copies": copies,
            "drift": ({"status": "drifted" if (g and g.get("distinct_versions") not in (None, 1, "1")) or copies > 1
                       else "none", "canonical": short_loc(redact_path(g["canonical"])) if g and g.get("canonical")
                       else None} if copies > 1 or g else {"status": "none", "canonical": None}),
            "locations": [short_loc(redact_path(x)) for x in s.get("locations", [])][:10],
            "people_local": s.get("people_local", []),   # local only: for finding teammates; never paste into Slack
            "security_flags": secrets,
            "shareable": not secrets,
            "cross_functional": {"score": score, "label": label, "likely_audience": audience, "reasons": reasons},
        })
    for g in groups:  # groups whose skill had no record of its own
        if g["name"].lower() not in by:
            out.append({"name": g["name"], "description": "", "owner": None, "owner_confirmed": False, "version": None,
                        "copies": len(g["members"]), "drift": {"status": "drifted", "canonical": g.get("canonical")},
                        "locations": [short_loc(redact_path(m)) for m in g["members"]][:10], "people_local": [],
                        "security_flags": [], "shareable": True,
                        "cross_functional": dict(zip(["score", "label", "likely_audience", "reasons"],
                                                     score_skill(g["name"], "", "", " ".join(g["members"]))))})
    return sorted(out, key=lambda s: -s["cross_functional"]["score"])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("reports", nargs="+", help="report files (.json, .md, .html, .txt)")
    ap.add_argument("--format", choices=["json", "md"], default="json")
    ap.add_argument("--out")
    ap.add_argument("--md-out", help="also write the markdown summary table to this file")
    args = ap.parse_args()

    skills, groups, headline, raw = [], [], [], []
    for rp in args.reports:
        p = Path(rp).expanduser()
        text = p.read_text(errors="ignore")
        parsed = False
        if p.suffix.lower() == ".json" or text.lstrip().startswith(("{", "[")):
            try:
                s, g, h = from_json(json.loads(text))
                skills += s; groups += g; headline += h
                parsed = bool(s or g)
            except json.JSONDecodeError:
                pass
        if not parsed:
            if p.suffix.lower() in (".html", ".htm") or "<html" in text[:500].lower():
                text = html_to_text(text)
            s, g, h = from_markdown(text)
            skills += s; groups += g; headline += h
            parsed = bool(s or g)
        if not parsed:
            raw.append(EMAIL_RE.sub("[email]", text)[:60000])

    result_skills = merge(skills, groups)
    cf = [s for s in result_skills if s["cross_functional"]["label"] == "cross-functional"]
    result = {
        "parsed": bool(result_skills),
        "source_files": [Path(r).name for r in args.reports],
        "headline": list(dict.fromkeys(headline))[:3],
        "headline_note": "Headline is copied from the report and may cover a wider scope than the skills parsed here; "
                         "check it matches before quoting it." if headline else None,
        "summary": {
            "skills": len(result_skills),
            "cross_functional": len(cf),
            "cross_functional_shareable": sum(1 for s in cf if s["shareable"]),
            "maybe": sum(1 for s in result_skills if s["cross_functional"]["label"] == "maybe"),
            "drifted": sum(1 for s in result_skills if s["drift"]["status"] == "drifted"),
            "no_owner": sum(1 for s in result_skills if not s["owner"]),
            "security_flagged": sum(1 for s in result_skills if s["security_flags"]),
        },
        "skills": result_skills,
    }
    if raw:
        result["raw_text"] = "\n\n---\n\n".join(raw)

    def render_md():
        sm = result["summary"]
        lines = [f"**{sm['skills']} skills in report** · {sm['cross_functional']} cross-functional "
                 f"({sm['cross_functional_shareable']} shareable) · {sm['maybe']} maybe · {sm['drifted']} drifted · "
                 f"{sm['no_owner']} no owner", ""]
        if result["headline"]:
            lines += [f"> {result['headline'][0]}", ""]
        lines += ["| Skill | For | Drift | Owner | Shareable |", "|---|---|---|---|---|"]
        for s in result_skills:
            if s["cross_functional"]["label"] == "engineering-only":
                continue
            tag = "" if s["cross_functional"]["label"] == "cross-functional" else " (maybe)"
            drift = f"{s['copies']} copies" if s["drift"]["status"] == "drifted" else "-"
            owner = (s['owner'] + ("" if s['owner_confirmed'] else " (suggested)")) if s['owner'] else "none"
            lines.append(f"| {s['name']}{tag} | {', '.join(s['cross_functional']['likely_audience'][:2]) or '-'} | "
                         f"{drift} | {owner} | {'yes' if s['shareable'] else 'no: security flag'} |")
        if not result["parsed"]:
            lines += ["", "_Report format not recognised: read raw_text directly._"]
        return "\n".join(lines)

    if args.md_out:
        Path(args.md_out).write_text(render_md())
    output = render_md() if args.format == "md" else json.dumps(result, indent=2)

    if args.out:
        Path(args.out).write_text(output)
        print(f"wrote {args.out}")
    else:
        print(output)


if __name__ == "__main__":
    main()
