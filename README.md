# Managing Your Files

A full-stack file management application. Users register with email OTP verification, upload
files by drag & drop, browse them with search / filter / sort / pagination, view extracted text
content and per-file metadata, and see usage statistics. Administrators additionally manage all
users and all files from a dedicated admin area.

**Live frontend:** _not yet deployed_
**Live backend:** _not yet deployed_

> The backend is hosted on a free tier and may take up to a minute to wake on the first request.

---

## Table of contents

- [Technologies](#technologies)
- [Features](#features)
- [Folder structure](#folder-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database migrations](#database-migrations)
- [Running locally](#running-locally)
- [Testing](#testing)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Assumptions and design decisions](#assumptions-and-design-decisions)

---

## Technologies

### Backend (`server/`)

| | |
|---|---|
| Runtime | Node.js 20+ (developed on 24) |
| Framework | Express 4 + TypeScript |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Database | PostgreSQL |
| Auth | JWT (access + refresh), bcryptjs |
| Uploads | Multer (memory storage → disk) |
| Validation | Zod 4 |
| Email | Nodemailer (Gmail SMTP) |
| Extraction | `pdf-parse`, `mammoth` |
| Tests | Vitest + Supertest |

### Frontend (`client/`)

| | |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Server state | TanStack React Query 5 |
| HTTP | Axios |
| Charts | Recharts |
| Upload UI | react-dropzone |
| Notifications | react-hot-toast |
| Client state | Zustand (access token only) |

---

## Features

### Authentication
- Registration, login, logout
- Email verification via 6-digit OTP (10 minute expiry, bcrypt-hashed at rest)
- Resend verification code, rate limited to 10 per hour per user
- Forgot password / reset password by OTP
- Short-lived access token (15 min) held in memory; refresh token (7 days) in an httpOnly cookie
- Automatic silent refresh on 401, de-duplicated so concurrent failures trigger one refresh
- Role-based authorization (`USER` / `ADMIN`) enforced on both client and server

### User
- Drag & drop upload with per-file progress, cancel and retry
- Client- and server-side validation of type, size and count
- File list with search, type filter, sorting, pagination, and grid / table views
- File detail page with metadata and extracted text content
- File download and soft delete
- Personal dashboard: total files, storage used, breakdown by type, 30-day upload history

### Admin
- User management: list, search, filter by role, change role, delete
- File management across all users: list, search, filter by type and owner, delete
- Admin dashboard: user counts, file counts, storage, most-uploaded types, recent uploads
- Guards against deleting your own account or removing the last remaining admin

### Bonus features implemented
Dark mode · file download · soft delete · refresh-token auth · text content extraction
(`.txt` `.csv` `.json` `.md` `.pdf` `.docx`) · API tests

---

## Folder structure

```
.
├── client/                     # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── (auth)/         # login, register, verify-email
│       │   └── (app)/          # dashboard, files, upload, profile, admin
│       ├── components/
│       │   ├── ui/             # Button, Input, Modal, Table, Pagination, …
│       │   ├── auth/           # ProtectedRoute, AdminRoute
│       │   ├── layout/         # Sidebar, TopBar, MobileDrawer, ThemeToggle
│       │   ├── files/          # FileGrid, FileTable, FilesToolbar
│       │   ├── upload/         # DropZone, UploadQueue
│       │   ├── dashboard/      # stat tiles and charts
│       │   ├── admin/          # UsersTable, admin charts
│       │   └── providers/      # Auth, Query, Theme
│       ├── hooks/              # useAuth, useFiles, useUpload, useStats, useAdmin
│       ├── lib/                # axios instance, types, constants, utils
│       └── store/              # Zustand access-token store
│
└── server/                     # Express API
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── src/
        ├── config/             # env loading, multer setup
        ├── routes/             # auth, file, user, stats routers
        ├── controllers/        # auth, verification, file, user, stats
        ├── reposatories/       # Prisma data access
        ├── middlewares/        # auth, validation, error handler
        ├── schema/             # Zod request schemas
        ├── lib/                # jwt, otp, email, storage, extraction, errors
        ├── types/              # Express request augmentation
        ├── test/               # Vitest + Supertest
        ├── seed.ts             # seeds the default admin
        └── index.ts
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL database (local or hosted)
- A Gmail account with an [app password](https://support.google.com/accounts/answer/185833) —
  optional; without it OTP emails are logged as failures and registration still succeeds

### Install

```bash
git clone <repository-url>
cd Managing-Your-Files

cd server && npm install
cd ../client && npm install
```

---

## Environment variables

### `server/.env`

```bash
PORT=8080
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/managing_your_files?schema=public"

# The two secrets MUST differ, or a 7-day refresh token would also pass as an access token
JWT_SECRET="replace-with-a-long-random-string"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-string"

# Seeded administrator (npm run seed)
ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Admin
ADMIN_PASSWORD=Admin123

# Gmail app password, not your account password
GMAIL_USER=
GMAIL_PASS=

# Allowed CORS origin
CLIENT_URL=http://localhost:3000

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
MAX_FILES_PER_UPLOAD=10
```

`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` and `CLIENT_URL` are required — the server
refuses to boot without them. A template lives at [`server/.env.example`](server/.env.example).

### `client/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Database migrations

The schema has three models — `User`, `VerificationCode` and `File` — with cascade deletes from
`User` to both children.

```bash
cd server

# Generate the Prisma client
npm run prisma:generate

# Apply migrations to a development database
npm run prisma:migrate

# Apply existing migrations to production (no prompts, no drift check)
npm run prisma:deploy

# Seed the default administrator (pre-verified, from ADMIN_* env vars)
npm run seed

# Inspect data
npm run prisma:studio
```

`npm run prisma:migrate` wraps `prisma migrate dev`; use it when changing `schema.prisma` locally.
Deployment should run `npm run prisma:deploy` (`prisma migrate deploy`) as a release step.

---

## Running locally

Two terminals:

```bash
# Terminal 1 — API on http://localhost:8080
cd server
npm run dev

# Terminal 2 — web app on http://localhost:3000
cd client
npm run dev
```

Sign in with the seeded admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) to reach the admin area — that
account is created pre-verified, so it needs no OTP round-trip. Registering a new account sends a
6-digit code to the address you provide.

Other useful scripts:

```bash
cd server
npm run typecheck    # tsc --noEmit
npm run build        # prisma generate && tsc && tsc-alias
npm start            # run the compiled build

cd client
npm run build
npm run lint
```

---

## Testing

```bash
cd server
npm test
```

Vitest drives the Express app through Supertest and covers the health check, Zod rejection of
malformed registration input, and 401s on protected upload and admin-stats routes.

---

## API reference

Base URL: `NEXT_PUBLIC_API_URL`. Authenticated requests send `Authorization: Bearer <accessToken>`.
The refresh token travels only as an httpOnly cookie and is never returned in a response body.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Create an account and email an OTP |
| POST | `/auth/login` | public | Returns `{ user, accessToken }` and sets the refresh cookie |
| POST | `/auth/verify-email` | public | Confirm the OTP and sign in |
| POST | `/auth/resend-code` | public | Reissue a verification code |
| POST | `/auth/forgot-password` | public | Email a password reset code |
| POST | `/auth/reset-password` | public | Set a new password using the code |
| GET | `/auth/refresh` | refresh cookie | Issue a new access token |
| POST | `/auth/logout` | public | Clear the refresh cookie |
| GET | `/auth/profile` | authenticated | Current user |

### Files

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/files/upload` | verified | `multipart/form-data`, field name `files` |
| GET | `/files` | authenticated | The caller's files |
| GET | `/files/all` | admin | Every user's files, with owner |
| GET | `/files/:id` | authenticated | File metadata and extracted content |
| GET | `/files/:id/download` | authenticated | Stream the stored file |
| DELETE | `/files/:id` | owner or admin | Soft delete |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | admin | List users with file counts |
| PATCH | `/users/:id` | admin | Change a user's role |
| DELETE | `/users/:id` | admin | Delete a user and their stored files |

### Statistics

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/stats/user` | authenticated | Totals, storage, types, 30-day history |
| GET | `/stats/admin` | admin | Global totals, recent uploads, type breakdown |

### List parameters

`/files`, `/files/all` and `/users` accept `page`, `limit` (max 100), `search`, `sortBy` and
`sortOrder`. File lists also accept `mimeType` (comma-separated) and `userId`; user lists accept
`role`. Responses are `{ data, page, limit, total, totalPages }`.

### Errors

Errors return `{ success: false, message }` with a meaningful status — `400` validation,
`401` unauthenticated, `403` forbidden or unverified, `404` not found, `409` conflict,
`410` expired code.

---

## Deployment

The frontend is deployed to Vercel and the backend to Railway. Because each needs the other's
URL, deploy in this order.

### 1. Backend (Railway)

1. Create a project from the repository and set the **root directory** to `server`.
2. Add a **PostgreSQL** service; Railway injects `DATABASE_URL`.
3. Attach a **volume** mounted at `/app/uploads`. Without one the container filesystem is
   ephemeral and uploaded files disappear on every redeploy.
4. Build command `npm run build`, start command `npm run prisma:deploy && npm start`.
5. Set the environment variables from [above](#serverenv). Two that matter in particular:
   - `NODE_ENV=production` — required, or the refresh cookie is issued without
     `secure` / `SameSite=None` and is dropped by the browser across domains.
   - `UPLOAD_DIR=/app/uploads` — must match the volume mount path.
6. Seed the admin once: `npm run seed` from the Railway shell.

### 2. Frontend (Vercel)

1. Import the repository and set the **root directory** to `client`.
2. Set `NEXT_PUBLIC_API_URL` to the Railway URL from step 1.
3. Deploy.

### 3. Close the loop

Set `CLIENT_URL` on Railway to the Vercel URL and redeploy. This is what the CORS allow-list and
the cross-site cookie are checked against — until it is set, the browser will block API calls.

---

## Assumptions and design decisions

**Files are stored on disk, not S3.** `UPLOAD_DIR` is read from the environment so local and
production differ only by configuration. This keeps the project dependency-free at the cost of
requiring a mounted volume in production.

**Deletion is soft.** `DELETE /files/:id` sets `deletedAt`; every query filters on it. Rows and
bytes are retained, which makes the admin dashboard's "storage on disk versus storage in use"
comparison possible. Deleting a *user* is hard and removes their files from disk.

**Roles are read from the database on every request, not from the JWT.** The token carries only
`userId`. A role change therefore takes effect immediately instead of waiting for the token to
expire, at the cost of one lookup per request.

**Access tokens live in memory, never `localStorage`.** They are lost on refresh and rebuilt from
the httpOnly refresh cookie at startup, which keeps them out of reach of XSS.

**OTPs are bcrypt-hashed at rest** and compared with `bcrypt.compare`, so a database leak does not
hand over live verification codes.

**`resend-code` and `forgot-password` always return the same generic message** whether or not the
address exists, so neither endpoint can be used to enumerate accounts.

**Extracted content is capped at 50,000 characters.** Extraction covers plain text, CSV, JSON,
Markdown, PDF and `.docx`. Legacy `.doc` and spreadsheets are stored but not extracted; images and
archives have no text to extract.

**Pagination is offset-based** (`page` + `limit`) rather than cursor-based. Simpler, and it
supports the numbered page controls the UI uses.

**Email is optional in development.** A failed send is logged and swallowed rather than failing
registration, so the app remains usable without Gmail credentials configured.
