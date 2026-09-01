# Managing Your Files

Full-stack file management system. Assessment project for Gold Era.

## Stack

### Backend (./server)
- Express.js + TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication
- Multer for file uploads
- Zod for validation

### Frontend (./client)
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack React Query
- Axios

## Project Structure

```
managing-your-files/
  server/
    src/
      config/         # env validation + typed env export
      controllers/    # auth, verification, file, user, stats
      middlewares/    # authMiddleware, requireVerified, validate, errorHandler
      routes/         # express routers
      reposatories/   # data access (one class per model)
      schema/         # zod request schemas
      lib/            # AppError, jwt, otp, email, storage, cookies, error mappers
      types/          # shared types + express Request augmentation
      generated/      # prisma client (gitignored, run prisma:generate)
      seed.ts         # seeds default admin user
      index.ts        # entry point
    prisma/
      schema.prisma
  client/
    src/
      app/          # Next.js app router pages
      components/   # UI + feature components
      hooks/        # custom React Query hooks
      lib/          # axios instance, types, utils
```

## Conventions

- Named exports in lib/, middlewares/, schema/; controllers, routes and
  repositories also carry a default export
- Controllers are classes of static async methods
- Wrap all Express routes with express-async-errors (no try/catch in controllers)
- Throw `AppError(statusCode, message)` for expected errors
- Library errors are translated by mappers, never caught in controllers:
  `lib/prismaError.ts` and `lib/jwtError.ts` each export `toAppError(err)`
  returning `AppError | null`, chained in `errorHandler`. Add a mapper per
  library rather than try/catch at the call site.
- Validate request bodies with Zod schemas before touching the DB; validation
  failures return 400 (401 is reserved for authentication)
- Every list endpoint supports: page, limit, search, sortBy, sortOrder params,
  with `sortBy` whitelisted by a Zod enum - it ends up as a Prisma `orderBy`
  key, so a raw string lets a caller sort by any column
- RBAC is `authorize(...roles)` in `middlewares/authMiddleware.ts`, with
  `requireAdmin = authorize(Role.ADMIN)`. Admin-only routers mount it once via
  `router.use` rather than repeating it per route
- Access token is sent as `Authorization: Bearer <token>`; refresh token lives
  in an httpOnly cookie
- Repositories own every `where` clause. Controllers never build one - this is
  what keeps the soft-delete filter from being forgotten.
- Multi-write operations run in `prisma.$transaction`; side effects that can
  fail independently (email, file writes) happen after the commit
- File uploads use multipart/form-data, field name is `files`
- Frontend API calls go through a single axios instance with auth interceptor
- Use React Query for all server state, no local state for fetched data
- Toast notifications for success/error feedback (react-hot-toast)
- All pages under /dashboard, /files, /admin, /profile are protected
- Admin pages enforce role check on BOTH frontend (redirect) and backend (403)

## Database Models

Three models: User, VerificationCode, File. Two enums: Role, VerificationType.

- User has role enum (USER | ADMIN), verified boolean
- VerificationCode stores a **bcrypt hash** of a 6-digit OTP (10 min expiry)
  plus a `type` (EMAIL_VERIFICATION | PASSWORD_RESET), indexed on [userId, type]
- File stores metadata (originalName, key, mimeType, size) plus `deletedAt` for
  soft delete. Indexed on [userId, deletedAt] (every list query) and [mimeType]
  (the type-breakdown chart).
- File.key is a generated storage key, never a filesystem path and never the
  user's filename - a caller-supplied name is a path-traversal vector, and
  "path" is a disk concept that would leak into the model when S3 lands.
- File.content is `String?`, reserved for extracted text but NOT populated yet
  (see Key Decisions). The column exists now so adding extraction later is not
  a migration plus a backfill of every file already uploaded.
- User -> Files is one-to-many
- User -> VerificationCodes is one-to-many
- Cascade delete on user removal applies to VerificationCode AND File. The
  rows go, but a cascade alone would leave every blob on disk with nothing
  referencing it - invisible to the retention worker forever. So
  `DELETE /users/:id` reads the user's keys first (ignoring `deletedAt`, since
  soft-deleted files still have blobs), deletes the blobs, and only then
  deletes the user. Blobs before rows, same ordering as the worker: a crash
  leaves retryable rows, never an unreferenced blob.

## API Endpoints

Auth: POST /auth/register, /auth/login, /auth/verify-email, /auth/resend-code,
      /auth/forgot-password, /auth/reset-password, GET /auth/profile, /auth/refresh
Files: POST /files/upload, GET /files, GET /files/all (admin), GET /files/:id, GET /files/:id/download, DELETE /files/:id (admin scope deletes any file)
Users: GET /users, PATCH /users/:id, DELETE /users/:id (all admin-only)
Stats: GET /stats/user, GET /stats/admin (admin-only)

## Auth Flow

1. User registers with name/email/password
2. Server hashes password (bcryptjs, 12 rounds), creates the user and its first
   OTP in one transaction so nobody ends up unable to verify
3. OTP is 6 digits from `crypto.randomInt`, stored as a bcrypt hash (10 rounds -
   the 10 min expiry is the real control, not the cost factor). Emailed via
   Gmail AFTER the commit; a failed send does not roll back the account
4. User submits OTP on verify page
5. On success: user.verified = true and all their OTPs are deleted, in one
   transaction; returns tokens + sets the refresh cookie
6. **Login does NOT gate on verified.** Unverified users receive a token whose
   `verified` claim is false, so the client can render a "check your inbox"
   state. `requireVerified` guards the routes that actually need it.
7. Access token payload is { userId } ONLY, 15 min. Role and verified are read
   from the row by `authMiddleware` on every request - a claim baked into a
   15 min token would keep a demoted admin in charge, and a just-verified user
   locked out, until it expired. The row lookup also revokes a deleted user's
   still-valid token. Refresh token 7d, signed with a SEPARATE secret and
   delivered as an httpOnly cookie.
8. Password reset shares the VerificationCode table via type=PASSWORD_RESET.
   Completing a reset also sets verified = true (inbox control is proven).

### Anti-enumeration rules

- `login` returns the same 401 "Invalid email or password" for an unknown email
  and a wrong password
- `forgot-password` always returns 200 with a generic body, whether or not the
  address exists, and returns that same 200 when rate limited
- `verify-email` / `reset-password` return the same 401 for an unknown user and
  a wrong code
- `resend-code` is PUBLIC and keyed on email, not on a token: register hands
  back no tokens, so a user on the verify page has nothing to authenticate
  with. It returns one generic 200 whether the address is unknown, already
  verified, or rate limited
- `login` validates the password as a non-empty string, NOT against
  `passwordSchema`. The policy belongs on register and reset; enforcing it at
  login rejects any password predating the rules (the seeded `ADMIN_PASSWORD`
  among them) and advertises the policy to anyone probing

### Rate limiting

Codes are NOT deleted on resend - the row count in the trailing hour IS the
limit. Max 10 codes per user per type per hour (the signup code counts, so a
user gets 9 resends).

## File Uploads & Storage

- Multer uses `memoryStorage`, so nothing touches disk until size, count and
  mime validation have all passed
- Upload writes DB rows first (inside `$transaction`), then blobs. A blob
  written before a failed transaction is an orphan nothing references -
  invisible on disk and billable forever on S3. A row without a blob is
  visible and cleanable, so that is the safer failure.
- If a blob write fails, the just-created rows are deleted and the request 500s
- List endpoints whitelist `sortBy` against an allowed column set. Passing raw
  user input into Prisma's `orderBy` key lets a caller sort by any column,
  including ones the API does not expose.
- Search is `originalName` with `mode: "insensitive"`; filter is by `mimeType`

## Environment Variables

### Server
- PORT, NODE_ENV, DATABASE_URL
- JWT_SECRET, JWT_REFRESH_SECRET (must differ - shared secrets would make a
  7-day refresh token usable as an access token)
- ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD (for seed)
- GMAIL_USER, GMAIL_PASS (app password, not regular password)
- CLIENT_URL (CORS origin)
- UPLOAD_DIR, MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD

`src/config/index.ts` validates the required set at boot and throws on anything
missing. Everything reads secrets through its exported `env` object, never
`process.env` directly - the module graph is what guarantees validation runs
before the first read.

### Client
- NEXT_PUBLIC_API_URL

## Key Decisions

- Local disk storage for now, behind a `lib/storage.ts` interface
  (save/read/delete by key). S3 later is then a one-file swap. NOTE: Render's
  filesystem is ephemeral - do not deploy on disk without a persistent volume
  or S3, or uploads vanish on restart.
- Downloads stream through the API, never presigned URLs, so the ownership
  check always applies
- **Soft delete on files** (`deletedAt`). The blob stays; a retention worker
  (30 days) sweeps later. The worker deletes the blob FIRST, then the row - a
  crash then leaves a retryable row rather than an orphaned, unreferenced blob.
- Access + refresh tokens, refresh in an httpOnly cookie (sameSite none/secure
  in production, lax in dev)
- Content extraction is deliberately NOT implemented. The spec's "Extracted
  content" is ambiguous against the metadata bullets beside it; the column is
  reserved and the frontend renders a placeholder. Record this in the README's
  "Any assumptions made" section as a scoping decision.
- Multer file filter: images, PDFs, docs, spreadsheets, text, CSV, JSON, ZIP
- 10MB file size limit
- Max 10 files per upload request
- Upload progress tracked on frontend via axios onUploadProgress
- Stats use Prisma aggregations (groupBy, count, aggregate)
- Storage usage in user-facing stats counts live files only. `GET /stats/admin`
  returns both `storageUsed` (live) and `storageOnDisk` (including
  soft-deleted); the gap is what the retention worker still owes
- At least one admin must always exist - nothing promotes anyone back. A single
  rule enforces it: `PATCH /users/:id` refuses to demote the last admin,
  including yourself. There is deliberately no separate self-demotion guard,
  which would have made the last-admin check unreachable and blocked the
  legitimate case of stepping down while another admin exists.
  `DELETE /users/:id` does keep a self-delete guard, as a footgun check
- Pagination is offset-based (page + limit), not cursor
- Timestamp columns are `timestamp without time zone` and Prisma writes UTC.
  Any raw SQL must use `now() at time zone 'utc'` - the local Postgres session
  is not UTC.

## Build

`moduleResolution` is `node16`, so the emit format comes from
`package.json` - which is `"type": "commonjs"`, giving CommonJS output.
(`node`/node10 and `baseUrl` are both deprecated and removed in TS 7; `paths`
works on its own, resolved relative to the tsconfig.) `tsc` does NOT rewrite
the `@/*` aliases, so `tsc-alias` runs after it:
`prisma generate && tsc && tsc-alias`. Without that step `dist/` still contains
`require("@/config")` and `node dist/index.js` cannot start - which is exactly
what Render runs.

## Commit Strategy

One commit per stage completion. Commit messages should be descriptive:
- "feat: backend auth system with email OTP verification"
- "feat: file upload and management endpoints"
- NOT: "update" or "wip" or "stuff"

## Deployment

- Frontend: Vercel
- Backend: Render / Railway
- DB: Neon or Railway PostgreSQL
- Set env vars on both platforms
- Update CLIENT_URL and NEXT_PUBLIC_API_URL for production
