# Pilot waitlist

The destination for the CTA at the end of every `skillsdrift` report, and for the
"join the pilot" link on the State of Skill Drift index.

**Live:** <https://drift.aryaman.tech/waitlist>

## What it collects, and what it refuses to

§3.5 qualifies a lead on two things — job title and company domain — so those are
the two fields, plus an email to reply to. Nothing else is stored: no IP address,
no user agent, no cookies, no third-party script on the page.

This is the only surface in the whole project that touches personal data. The
`skillsdrift` CLI itself sends nothing here; it runs locally and stays local. That
separation is deliberate, and the page says so where a visitor will read it.

Each row also carries two flags computed at write time, so qualifying doesn't mean
re-deriving them later:

| Field | Why |
|---|---|
| `personal_email` | A gmail.com signup is a weaker signal than a work address |
| `domain_matches_email` | Email domain equal to the stated company domain corroborates both |

The server logs the *fact* of a signup and the company domain — never the email or
the title.

## Running it

```bash
PORT=8802 DATA_FILE=./signups.jsonl node server.js
```

No dependencies, Node 18+. It binds loopback only; nginx terminates TLS in front.
Storage is append-only JSONL, which is enough at this volume and trivially
greppable — a database would be premature.

| Route | Purpose |
|---|---|
| `GET /waitlist` | The form |
| `POST /api/waitlist` | Submit — 201 on success, 200 with `duplicate: true` if already listed, 400 with a readable message on bad input |
| `GET /api/waitlist/health` | Liveness |

Validation is deliberately permissive: a wrong rejection costs a lead, a wrong
accept costs one junk row. Company domains are normalised, so pasting
`https://example.com/careers` stores `example.com`.

## Deploying

```bash
scp waitlist/server.js ovh:/opt/skillsdrift-waitlist/server.js
scp waitlist/skillsdrift-waitlist.service ovh:/tmp/
ssh ovh 'sudo install -m 0644 /tmp/skillsdrift-waitlist.service /etc/systemd/system/ \
  && sudo systemctl daemon-reload && sudo systemctl restart skillsdrift-waitlist'
```

Signups land in `/var/lib/skillsdrift-waitlist/signups.jsonl`. The unit runs as
`debian` under `ProtectSystem=strict` with that directory as its only writable
path.

One gotcha worth recording: **`MemoryDenyWriteExecute=true` cannot be used here.**
V8's JIT needs writable-executable pages and Node dies with `SIGTRAP` in
`v8::base::OS::SetPermissions` during isolate init. Every other hardening flag in
the unit is fine.
