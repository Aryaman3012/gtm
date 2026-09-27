#!/usr/bin/env node
'use strict';
/**
 * skillsdrift pilot waitlist — the destination for the CLI's report CTA and
 * the State of Skill Drift index.
 *
 * Collects exactly the two qualifying fields §3.5 asks for (job title and
 * company domain) plus an email to reply to. Nothing else: no IP address, no
 * user agent, no cookies, no third-party script. The one surface in this
 * project that touches personal data, so it stays as small as it can be.
 *
 * No dependencies. Listens on loopback only; nginx terminates TLS.
 *   PORT=8802 DATA_FILE=/var/lib/skillsdrift-waitlist/signups.jsonl node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8802);
const HOST = process.env.HOST || '127.0.0.1';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'signups.jsonl');
const MAX_BODY = 4 * 1024;

// --- storage ---------------------------------------------------------------

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

function alreadySignedUp(email) {
  if (!fs.existsSync(DATA_FILE)) return false;
  const needle = email.toLowerCase();
  return fs
    .readFileSync(DATA_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .some((line) => {
      try {
        return (JSON.parse(line).email || '').toLowerCase() === needle;
      } catch {
        return false;
      }
    });
}

function record(entry) {
  fs.appendFileSync(DATA_FILE, JSON.stringify(entry) + '\n', 'utf8');
}

// --- validation ------------------------------------------------------------

// Deliberately permissive: a wrong rejection costs a lead, a wrong accept
// costs one junk row.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;
const FREE_MAIL = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'proton.me', 'protonmail.com', 'aol.com', 'gmx.com',
]);

function clean(value, max) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
}

function validate(body) {
  const email = clean(body.email, 254).toLowerCase();
  const title = clean(body.title, 120);
  const company = clean(body.company, 253).toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
  if (!title) return { error: 'Job title helps us know whether the pilot fits. Please add one.' };
  if (!company || !company.includes('.')) {
    return { error: 'Company domain should look like a domain, e.g. example.com.' };
  }

  const emailDomain = email.split('@')[1];
  return {
    entry: {
      ts: new Date().toISOString(),
      email,
      title,
      company,
      // Flags for qualifying, computed once here rather than re-derived later.
      personal_email: FREE_MAIL.has(emailDomain),
      domain_matches_email: emailDomain === company,
      source: clean(body.source, 40) || 'web',
    },
  };
}

// --- page ------------------------------------------------------------------

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>skillsdrift — Registry pilot waitlist</title>
<style>
  /* Same system as the State of Skill Drift index: cool grey-green paper,
     green-black ink, teal for the canonical/affirmative. No webfonts, no
     third-party requests — the page promises that below, so it has to keep it. */
  :root {
    --paper: #e8eae5; --raised: #f2f3f0; --ink: #171b18; --muted: #5e665f;
    --rule: #ccd1cb; --keep: #0e6e6e; --err: #8a3a62; --field: #fff;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --paper: #12150f; --raised: #1b1f19; --ink: #e6e9e0; --muted: #939c92;
      --rule: #2e332c; --keep: #5cb8b2; --err: #dd92b2; --field: #171b14;
    }
  }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0; background: var(--paper); color: var(--ink);
    font: 400 17px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-synthesis: none;
  }
  code, .mono { font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace; }
  a { color: inherit; text-decoration-color: var(--rule); text-underline-offset: 3px; }
  :focus-visible { outline: 2px solid var(--keep); outline-offset: 2px; }

  .page { max-width: 68rem; margin: 0 auto; padding: 0 1.5rem 5rem; }
  .masthead {
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 1rem; flex-wrap: wrap; padding: 1.5rem 0;
    border-bottom: 1px solid var(--rule); margin-bottom: 3.5rem;
  }
  .wordmark { font-weight: 600; letter-spacing: -0.01em; }
  .masthead a { font-size: 0.875rem; color: var(--muted); }

  main { max-width: 34rem; }
  h1 {
    font-size: clamp(1.7rem, 4.6vw, 2.5rem); line-height: 1.08;
    letter-spacing: -0.03em; font-weight: 600; margin: 0 0 0.75rem; max-width: 18ch;
  }
  .lede { color: var(--muted); margin: 0 0 2.5rem; }

  form { display: grid; gap: 1.25rem; }
  label { display: grid; gap: .3rem; font-weight: 600; font-size: .9375rem; }
  .hint { font-weight: 400; color: var(--muted); font-size: .8125rem; }
  input {
    font: inherit; padding: .6rem .7rem; border: 1px solid var(--rule);
    border-radius: 3px; background: var(--field); color: var(--ink); width: 100%;
  }
  input:focus-visible { border-color: var(--keep); }
  button {
    font: inherit; font-weight: 600; padding: .7rem 1.1rem; border: 0;
    border-radius: 3px; background: var(--keep); color: var(--paper);
    cursor: pointer; justify-self: start;
  }
  button:hover { background: var(--ink); }
  button[disabled] { opacity: .55; cursor: default; }
  #msg { font-size: .9375rem; margin: 0; }
  #msg.ok  { color: var(--keep); }
  #msg.err { color: var(--err); }

  .note {
    margin-top: 3rem; padding: 1.1rem 1.25rem;
    border-left: 2px solid var(--keep); background: var(--raised);
    color: var(--muted); font-size: .9375rem;
  }
  .note strong { color: var(--ink); }
  .note ul { margin: .5rem 0 0; padding-left: 1.1rem; }
  .note li { margin-bottom: .25rem; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>
<div class="page">
  <header class="masthead">
    <span class="wordmark">skillsdrift</span>
    <a href="/">State of Skill Drift</a>
  </header>
<main>
  <h1>Registry pilot waitlist</h1>
  <p class="lede">
    You ran a scan and saw one snapshot. The pilot runs drift, ownership and
    security checks across a whole team, continuously.
  </p>

  <form id="f" novalidate>
    <label>
      Work email
      <input name="email" type="email" autocomplete="email" required
             placeholder="you@company.com">
    </label>
    <label>
      Job title
      <span class="hint">So we know whether the pilot fits what you own.</span>
      <input name="title" type="text" autocomplete="organization-title" required
             placeholder="Platform Engineer">
    </label>
    <label>
      Company domain
      <span class="hint">Just the domain, e.g. <code>example.com</code>.</span>
      <input name="company" type="text" required placeholder="example.com">
    </label>
    <button type="submit">Join the waitlist</button>
    <p id="msg" role="status" aria-live="polite"></p>
  </form>

  <div class="note">
    <strong>What we store:</strong> your email, job title and company domain — nothing else.
    <ul>
      <li>No IP address, no user agent, no cookies, no third-party scripts.</li>
      <li>The <code>skillsdrift</code> CLI sends nothing here. It runs locally and stays local.</li>
      <li>Ask us to delete your row at any time and it's gone.</li>
    </ul>
  </div>
</main>
<script>
  const f = document.getElementById('f');
  const msg = document.getElementById('msg');
  const btn = f.querySelector('button');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = ''; msg.textContent = '';
    btn.disabled = true;
    const body = Object.fromEntries(new FormData(f).entries());
    body.source = new URLSearchParams(location.search).get('ref') || 'web';
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        f.reset();
        msg.className = 'ok';
        msg.textContent = data.duplicate
          ? "You're already on the list — nothing more to do."
          : "You're on the list. We'll be in touch.";
      } else {
        msg.className = 'err';
        msg.textContent = data.error || 'Something went wrong. Please try again.';
      }
    } catch {
      msg.className = 'err';
      msg.textContent = 'Could not reach the server. Please try again.';
    } finally {
      btn.disabled = false;
    }
  });
</script>
</body>
</html>`;

// --- server ----------------------------------------------------------------

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, {
    'content-type': type,
    'cache-control': type.startsWith('text/html') ? 'no-cache' : 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && (url.pathname === '/waitlist' || url.pathname === '/waitlist/')) {
    return send(res, 200, PAGE, 'text/html; charset=utf-8');
  }
  if (req.method === 'GET' && url.pathname === '/api/waitlist/health') {
    return send(res, 200, { ok: true });
  }
  if (req.method !== 'POST' || url.pathname !== '/api/waitlist') {
    return send(res, 404, { error: 'Not found' });
  }

  let raw = '';
  let tooBig = false;
  req.on('data', (chunk) => {
    if (tooBig) return;
    raw += chunk;
    if (raw.length > MAX_BODY) {
      tooBig = true;
      send(res, 413, { error: 'Request too large.' });
      req.destroy();
    }
  });
  req.on('end', () => {
    if (tooBig) return;
    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return send(res, 400, { error: 'Expected JSON.' });
    }

    const { error, entry } = validate(body);
    if (error) return send(res, 400, { error });

    try {
      if (alreadySignedUp(entry.email)) return send(res, 200, { ok: true, duplicate: true });
      record(entry);
      // Log the fact of a signup, never the personal fields.
      console.log(`[waitlist] signup company=${entry.company} personal_email=${entry.personal_email}`);
      return send(res, 201, { ok: true });
    } catch (err) {
      console.error('[waitlist] write failed:', err.message);
      return send(res, 500, { error: 'Could not save. Please try again.' });
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[waitlist] listening on http://${HOST}:${PORT} -> ${DATA_FILE}`);
});
