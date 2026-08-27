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
      config/       # env, db client, multer setup
      controllers/  # route handlers (auth, file, user, stats)
      middlewares/   # authenticate, authorize, error handler
      routes/       # express routers
      utils/        # validation schemas, email, auth helpers
      types/        # shared types (AuthRequest, AppError)
      seed.ts       # seeds default admin user
      index.ts      # entry point
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

- Use named exports everywhere, no default exports (except Next.js pages)
- Controllers are async functions, not classes
- Wrap all Express routes with express-async-errors (no try/catch in controllers)
- Throw `AppError(statusCode, message)` for expected errors
- Validate request bodies with Zod schemas before touching the DB
- Every list endpoint supports: page, limit, search, sortBy, sortOrder params
- JWT token goes in Authorization header as `Bearer <token>`
- File uploads use multipart/form-data, field name is `files`
- Frontend API calls go through a single axios instance with auth interceptor
- Use React Query for all server state, no local state for fetched data
- Toast notifications for success/error feedback (react-hot-toast)
- All pages under /dashboard, /files, /admin, /profile are protected
- Admin pages enforce role check on BOTH frontend (redirect) and backend (403)

## Database Models

Three models: User, VerificationCode, File.

- User has role enum (USER | ADMIN), verified boolean
- VerificationCode stores 6-digit OTP with expiry (10 min)
- File stores metadata (originalName, fileName, mimeType, size, path)
- User -> Files is one-to-many
- User -> VerificationCodes is one-to-many
- Cascade delete on user removal

## API Endpoints

Auth: POST /auth/register, /auth/login, /auth/verify-email, /auth/resend-code, GET /auth/profile
Files: POST /files/upload, GET /files, GET /files/all (admin), GET /files/:id, GET /files/:id/download, DELETE /files/:id
Users: GET /users, PATCH /users/:id, DELETE /users/:id (all admin-only)
Stats: GET /stats/user, GET /stats/admin (admin-only)

## Auth Flow

1. User registers with name/email/password
2. Server hashes password (bcryptjs, 12 rounds), creates user, generates 6-digit OTP
3. OTP sent via Gmail (nodemailer), stored in VerificationCode with 10min expiry
4. User submits OTP on verify page
5. On success: user.verified = true, delete all their OTPs, return JWT
6. Login checks verified status before issuing token
7. JWT payload: { userId, role }, expires in 7 days

## Environment Variables

### Server
- PORT, DATABASE_URL, JWT_SECRET
- ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD (for seed)
- GMAIL_USER, GMAIL_PASS (app password, not regular password)
- CLIENT_URL (CORS origin)

### Client
- NEXT_PUBLIC_API_URL

## Key Decisions

- Disk storage for files (not S3) to keep it simple
- Single JWT, no refresh token (unless doing bonus)
- Multer file filter: images, PDFs, docs, spreadsheets, text, CSV, JSON, ZIP
- 10MB file size limit
- Max 10 files per upload request
- Upload progress tracked on frontend via axios onUploadProgress
- Stats use Prisma aggregations (groupBy, count, aggregate)
- Pagination is offset-based (page + limit), not cursor

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
