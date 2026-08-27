# Build Stages

Each stage = one focused commit. Review code after each before moving on.

---

## Stage 1: Backend foundation
**Commit:** `feat: project setup, prisma schema, and express skeleton`

- Initialize server with Express + TypeScript
- Set up tsconfig, nodemon, package.json scripts
- Create Prisma schema (User, VerificationCode, File models)
- Set up config files: env loader, Prisma client singleton, multer config
- Create types (AuthRequest, AppError)
- Create error handler middleware
- Create health check endpoint
- Run prisma generate + db push
- Verify server starts clean

**Done when:** `GET /health` returns `{ status: "ok" }` and DB tables exist.

---

## Stage 2: Auth system
**Commit:** `feat: auth endpoints with email OTP verification`

- Zod schemas for register, login, verify-email, resend-code
- Password hashing + JWT utilities
- Email utility (nodemailer + Gmail)
- Auth controller: register, login, verifyEmail, resendCode, getProfile
- Auth middleware: authenticate (JWT), authorize (role check)
- Auth routes wired up
- Seed script to create default admin user

**Done when:** Can register a user, receive OTP email, verify, login, and hit GET /auth/profile with token.

---

## Stage 3: File management API
**Commit:** `feat: file upload, list, detail, delete endpoints`

- File controller: upload (multiple), list (paginated + search/filter/sort), getById, delete, download
- Admin endpoint: getAllFiles
- File routes with auth middleware
- Uploads directory with .gitkeep

**Done when:** Can upload files via Postman/curl, list them with pagination, get details, download, and delete. Admin can see all files.

---

## Stage 4: Users + Stats API
**Commit:** `feat: admin user management and statistics endpoints`

- User controller: getUsers (paginated + search), updateUser (role), deleteUser
- Stats controller: getUserStats, getAdminStats
- User routes (admin-only)
- Stats routes

**Done when:** Full backend is complete. All endpoints work. Admin can manage users and see platform-wide stats. Regular users see their own stats.

---

## Stage 5: Frontend foundation
**Commit:** `feat: next.js setup with auth context, axios, and layout`

- Initialize Next.js with App Router, Tailwind, TypeScript
- Install deps: axios, react-query, framer-motion, react-hot-toast, react-dropzone, recharts, lucide-react
- Create axios instance with auth interceptor
- Create types file (mirror backend types)
- Create utils (formatBytes, formatDate, cn helper)
- Set up QueryClientProvider and Toaster
- Build layout: sidebar nav, top bar, responsive shell
- Auth context/hook: store token in cookie, user in state, login/logout/register functions
- Protected route wrapper component
- Admin route wrapper component

**Done when:** App loads with layout shell. Unauthenticated users redirect to login. QueryClient and toast are wired.

---

## Stage 6: Auth pages
**Commit:** `feat: register, login, email verification pages`

- Login page with form, validation, error display
- Register page with form, validation
- Email verification page (OTP input, resend button with cooldown)
- Redirect to dashboard after successful login/verify
- Framer Motion page transitions

**Done when:** Can register, verify email, and login through the UI. Token stored, redirects work.

---

## Stage 7: Dashboard + file upload
**Commit:** `feat: user dashboard with stats and file upload`

- Dashboard page showing user stats (total files, storage, file type chart, upload history chart)
- Recharts: bar chart for file types, line chart for upload history
- File upload component: drag & drop zone (react-dropzone), progress bar, file validation, multiple file support
- Upload page or modal
- React Query hooks: useUserStats, useUploadFiles

**Done when:** Dashboard shows live stats. Can drag & drop files and see upload progress. Stats update after upload.

---

## Stage 8: File management pages
**Commit:** `feat: my files page with search, filter, sort, pagination`

- My Files page: table/grid of uploaded files
- Search input (debounced)
- Filter by file type dropdown
- Sort by name/size/date
- Pagination controls
- File detail page: metadata display (name, type, size, upload date)
- Delete file with confirmation
- Download file button
- React Query hooks: useMyFiles, useFileById, useDeleteFile

**Done when:** Full CRUD cycle through UI. Search, filter, sort, pagination all work.

---

## Stage 9: Admin pages
**Commit:** `feat: admin dashboard, user management, file management`

- Admin dashboard: total users, total files, storage usage, most uploaded types, recent uploads
- User management page: table with search, role edit (dropdown), delete user
- Admin file management: table of all files with user info, search, filter, delete
- All admin pages check role on mount, redirect non-admins
- React Query hooks: useAdminStats, useUsers, useUpdateUser, useDeleteUser, useAllFiles

**Done when:** Admin can see platform stats, manage users (edit roles, delete), and manage all files.

---

## Stage 10: Profile + polish
**Commit:** `feat: profile page, animations, responsive polish`

- Profile page showing user info and file count
- Add Framer Motion: page transitions, list animations, modal animations, hover effects
- Responsive pass: mobile sidebar (hamburger), table scroll, upload zone sizing
- Loading skeletons for all data-fetching pages
- Empty states for no files / no users
- Error states with retry buttons
- Toast notifications on all mutations (upload, delete, role change)

**Done when:** App feels polished. Works on mobile. Loading/empty/error states everywhere.

---

## Stage 11: Deployment
**Commit:** `feat: deployment config and README`

- Deploy backend to Render/Railway
  - Set all env vars
  - Run prisma migrate deploy
  - Run seed
- Deploy frontend to Vercel
  - Set NEXT_PUBLIC_API_URL to production backend
- Write README with: overview, tech stack, folder structure, local setup, env vars, DB migration, deployment instructions, assumptions
- Final test: register, verify, upload, view, delete, admin flow, all on production

**Done when:** Live URLs work end to end. README is complete. Push final commit.

---

## Bonus (if time allows, pick 1-2)

- **Dark mode:** Tailwind dark class strategy, toggle in nav, persist preference
- **File preview:** Render images inline, PDF in iframe, text files in code block
- **Download files:** Already have the endpoint, just wire a button

These are low-effort high-visibility wins. Skip Docker, unit tests, refresh tokens, audit logs unless you have time to burn.
