# Open Issues & Deferred Decisions

Tracked here so they don't get lost. Nothing below blocks the main build — revisit
before Stage 11 (deployment) and before writing the README.

---

## 1. Persistent storage in production — DECIDED, needs execution

**Issue:** Uploaded files go to disk (`uploads/`). Cloud containers have ephemeral
filesystems — every redeploy or idle spin-down wipes the directory, so previously
uploaded files 404 on download.

**Decision:** Keep disk storage. Deploy to a host with a mounted volume.
- Railway: attach a volume, mount at `/app/uploads`
- Fly.io: `fly volumes create` + one entry in `fly.toml`
- Render free tier cannot do this (persistent disks are paid)

**Action:** Read the upload directory from `UPLOAD_DIR` env var, never hardcode
`./uploads`, so local and prod differ by config only.

**Fallback if volumes prove annoying:** store bytes in a Postgres `Bytes` column.
Acceptable at 10MB/file and assessment-scale data — but must be documented in the
README as a deliberate portability tradeoff.

**Status:** open — resolve at Stage 11.

---

## 2. "Extracted content" requirement

**Issue:** The spec lists *extracted content* under File Details. Current schema has
no field for it and no stage covers extraction.

**Plan:**
- Add `extractedContent String?` (Text) to the `File` model
- Extract on upload: `.txt/.csv/.json/.md` read directly; PDF via `pdf-parse`;
  `.docx` via `mammoth`; null for images/archives
- Cap stored text (~50KB) to keep rows small
- Bonus: makes content search almost free on `GET /files`

**Status:** open — fold into Stage 3.

---

## 3. OTP email deliverability

**Issue:** Gmail SMTP from a cloud host is unreliable and needs an app password with
2FA enabled. If sending fails in production, registration is unusable for a reviewer.

**Plan:**
- Wrap the send in try/catch so a mail failure never 500s registration
- Seed a **pre-verified demo user** and document the credentials in the README, so
  the reviewer never has to complete an OTP round-trip
- Consider Resend (free tier, HTTP API, no SMTP) as a drop-in alternative

**Status:** open — Stage 2 for the try/catch and seed, Stage 11 for the decision.

---

## 4. Backend cold starts

**Issue:** Free tiers sleep after ~15 min idle; the first request can take ~50s. A
hanging login form is a bad first impression.

**Plan:** Prefer Railway/Fly over Render. Either way, put a "the backend may take up
to a minute to wake on first request" note at the top of the README.

**Status:** open — Stage 11.

---

## 5. Prisma + serverless Postgres connection pooling

**Issue:** Neon (and similar) need the pooled connection string, or migrations and
runtime queries conflict.

**Plan:** `DATABASE_URL` = pooled string, `directUrl` = direct string in
`schema.prisma`.

**Status:** open — Stage 11.

---

## 6. Security hardening (cheap, graded)

Not currently in any stage. All small:
- `helmet`
- `express-rate-limit` on `/auth/*` — `resend-code` in particular is an
  email-bomb vector without it
- Login errors must not reveal whether an email exists
- **Verify `GET /files/:id` and `/files/:id/download` check ownership-or-admin**,
  not just authentication — this is the classic IDOR in this kind of app and is
  likely to be tested

**Status:** open — fold into Stages 2 and 3.

---

## 7. Minimal test coverage

**Issue:** "Unit testing" is a listed bonus; an empty test directory is conspicuous.

**Plan:** Not a full suite — 3-4 Vitest tests over auth utilities (hash/compare,
JWT sign/verify) and one Zod schema. Signals competence for ~20 minutes of work.

**Status:** open — optional, Stage 10.

---

## 8. Soft delete (bonus swap)

Cheaper than it looks: `deletedAt` on `File`, filter in queries. Directly
demonstrates database-design thinking, which is on the evaluation criteria list.
Better value than Docker / refresh tokens / audit logs.

**Status:** open — optional, Stage 8.

---

## 9. Deferred dependencies

Not installed during setup — added at the stage that first needs them, to keep the
initial install to the required stack only:

| Package | Needed for | Stage |
|---|---|---|
| `react-dropzone` | drag & drop upload | 7 |
| `recharts` | dashboard charts | 7 |
| `react-hot-toast` | toast notifications | 5/6 |
| `lucide-react` | icons | 5 |
| `pdf-parse`, `mammoth` | content extraction (issue #2) | 3 |
| `helmet`, `express-rate-limit` | hardening (issue #6) | 2 |
| `vitest` | tests (issue #7) | 10 |
