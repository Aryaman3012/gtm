"""Shared scoring helpers (cross-functional signals, secrets, redaction)."""
import re
from pathlib import Path
import os

HOME = str(Path.home())

# Where skills and agent instructions usually live.
DEFAULT_DIRS = [
    "~/.claude/skills",
    "~/.codex/skills",
    "~/.agents/skills",
    "~/.cursor/rules",
]
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".venv", "venv", "__pycache__", ".next"}
MAX_FILES = 5000
MAX_BYTES = 400_000

# --- Cross-functional signals -------------------------------------------------
# Each function maps to words that suggest the skill's OUTPUT is consumed there.
FUNCTION_WORDS = {
    "Sales": ["sales", "prospect", "account executive", "ae ", "deal", "sales pipeline", "deal pipeline", "pipeline review", "qbr", "call prep",
              "discovery call", "objection", "battlecard", "battle card", "proposal", "rfp", "price quote", "outreach"],
    "Marketing / PMM": ["marketing", "messaging", "positioning", "campaign", "brand", "launch", "blog",
                        "newsletter", "seo", "social post", "linkedin post", "press release", "persona", "landing page"],
    "Customer Success / Support": ["customer success", "csm", "support ticket", "customer email", "renewal",
                                   "churn", "onboarding call", "escalation", "help center", "faq", "incident summary"],
    "Finance": ["finance", "revenue", "arr", "invoice", "budget", "forecast", "p&l", "expense", "billing",
                "board deck", "fp&a", "metric definition", "kpi"],
    "Legal / Compliance": ["legal", "contract", "clause", "nda", "privacy", "gdpr", "compliance", "policy",
                           "terms of service", "approved language", "claims review"],
    "People / HR": ["hiring", "recruit", "interview", "job description", "onboarding", "performance review",
                    "offer letter", "people team", "hr "],
    "Exec / Ops": ["executive summary", "exec update", "weekly update", "okr", "all-hands", "memo",
                   "meeting notes", "status report", "strategy doc"],
}
BUSINESS_TOOLS = ["salesforce", "hubspot", "gong", "highspot", "seismic", "zendesk", "intercom", "gainsight",
                  "tableau", "looker", "power bi", "google slides", "google sheets", "google docs", "powerpoint",
                  "excel", "notion", "confluence", "marketo", "outreach.io", "salesloft", "canva", "docusign",
                  "workday", "greenhouse", "netsuite"]
BUSINESS_OUTPUTS = [".pptx", ".docx", ".xlsx", "deck", "slides", "one-pager", "report", "email", "brief",
                    "summary for", "customer-facing", "stakeholder"]
BUSINESS_PATH_HINTS = ["handbook", "marketing", "sales", "finance", "legal", "people", "brand",
                       "content", "enablement", "gtm", "revops", "support", "metrics", "analytics"]

ENG_WORDS = ["refactor", "unit test", "pytest", "jest", "lint", "linter", "pull request", "merge request",
             "code review", "ci pipeline", "github actions", "deploy", "kubernetes", "k8s", "terraform",
             "docker", "stack trace", "debug", "migration", "typescript", "python function", "api endpoint",
             "sdk", "commit message", "git ", "monorepo", "dependency", "compile", "build error", "schema"]

SECRET_PATTERNS = [
    ("AWS access key", r"AKIA[0-9A-Z]{16}"),
    ("GitHub token", r"gh[pousr]_[A-Za-z0-9]{30,}"),
    ("Slack token", r"xox[baprs]-[A-Za-z0-9-]{10,}"),
    ("OpenAI/Anthropic-style key", r"\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}"),
    ("Private key block", r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    ("Hardcoded credential", r"(?i)\b(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['\"][^'\"\s]{8,}['\"]"),
]
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


# --- Helpers -----------------------------------------------------------------
def redact_path(p: str) -> str:
    """Hide home dir and usernames; keep the part that identifies the skill."""
    p = p.replace(HOME, "~")
    p = re.sub(r"/(Users|home)/[^/]+", "/~", p)
    return p


def short_loc(loc: str) -> str:
    """Last few path parts, enough to tell copies apart (e.g. 'eng-repo/.claude/skills/qbr-prep')."""
    if ":" in loc and not loc.startswith(("/", "~")):
        repo, path = loc.split(":", 1)
        return f"{repo}:{'/'.join(path.split('/')[-3:-1]) or path}"
    parts = loc.replace("\\", "/").split("/")
    parts = parts[:-1] if parts[-1] == "SKILL.md" else parts
    return "/".join(parts[-4:])


def parse_frontmatter(text: str):
    fm = {}
    body = text
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            raw = text[3:end]
            body = text[end + 4:]
            for line in raw.splitlines():
                m = re.match(r"^([A-Za-z_][\w-]*)\s*:\s*(.*)$", line)
                if m:
                    fm[m.group(1).strip().lower()] = m.group(2).strip().strip("'\"")
    return fm, body


def normalize(text: str) -> str:
    _, body = parse_frontmatter(text)
    body = body.lower()
    body = re.sub(r"\s+", " ", body)
    return body.strip()


def count_hits(text: str, words):
    """Whole-word/phrase matches only, so 'arr' doesn't match 'array'."""
    t = text.lower()
    hits = []
    for w in words:
        w = w.strip()
        if re.search(r"(?<![a-z0-9])" + re.escape(w) + r"(?:s|es)?(?![a-z0-9])", t):
            hits.append(w)
    return hits


def score_skill(name, description, body, path):
    """Return (score, label, functions, reasons). Heuristic only; the model reviews 'maybe'."""
    head = f"{name}\n{description}\n{body[:4000]}"
    reasons = []
    functions = {}
    for fn, words in FUNCTION_WORDS.items():
        hits = count_hits(head, words)
        if hits:
            functions[fn] = hits
    tools = count_hits(head, BUSINESS_TOOLS)
    outputs = count_hits(head, BUSINESS_OUTPUTS)
    path_l = path.lower()
    path_hits = [h for h in BUSINESS_PATH_HINTS if re.search(rf"(^|[/_.-]){re.escape(h)}([/_.-]|$)", path_l)]
    eng = count_hits(head, ENG_WORDS)

    fn_hits = sum(len(v) for v in functions.values())
    score = 2 * min(fn_hits, 5) + 2 * min(len(tools), 3) + min(len(outputs), 3) + 2 * min(len(path_hits), 1) \
        - 2 * min(len(eng), 5)

    if functions:
        reasons.append("mentions " + ", ".join(f"{k} ({', '.join(v[:3])})" for k, v in functions.items()))
    if tools:
        reasons.append("business tools: " + ", ".join(tools[:4]))
    if outputs:
        reasons.append("business outputs: " + ", ".join(outputs[:4]))
    if path_hits:
        reasons.append("lives in a business-ish location: " + ", ".join(path_hits))
    if eng:
        reasons.append("engineering signals: " + ", ".join(eng[:4]))

    if score >= 6:
        label = "cross-functional"
    elif score >= 2:
        label = "maybe"
    else:
        label = "engineering-only"
    ranked = sorted(functions.items(), key=lambda kv: -len(kv[1]))
    return score, label, [k for k, _ in ranked], reasons


def find_secrets(text):
    found = []
    for label, pat in SECRET_PATTERNS:
        if re.search(pat, text):
            found.append(label)
    return found


