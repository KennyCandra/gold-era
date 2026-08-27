# Managing Your Files — Design Brief

Design a multi-screen web application called **Managing Your Files**: a file upload
and management dashboard with two roles, User and Admin.

Produce each screen below as its own artboard on the canvas, at **1440 × 1024**
(desktop). Add **390 × 844** mobile artboards for the five screens marked `[+mobile]`.

---

## 1. Product summary

Authenticated users upload files by drag & drop (several at once), browse them in a
searchable, filterable, paginated list, open any file to see its metadata and
extracted text content, and view charts of their storage usage over time.

Administrators get three additional screens: a platform-wide overview, user
management (search, change role, delete), and file management across all users.

Registration requires email verification via a six-digit OTP code.

---

## 2. Visual direction

Clean, modern SaaS dashboard — confident and restrained. The reference points are
Linear and the Vercel dashboard, **not** a Bootstrap admin template.

- Generous whitespace; let the content breathe rather than filling every pixel
- Accent color used sparingly — primary actions, active nav, data highlights only
- Neutral warm grays carry the rest of the interface
- Subtle 1px borders instead of heavy drop shadows; one elevation level total
- Rounded corners, 8–12px on cards and inputs
- Tabular numerals for all file sizes, counts, dates, and chart axes
- Both light and dark themes, designed as equals — not a dark mode bolted on

---

## 3. Design tokens

### Accent — deep amber / gold

The product is for a company called Gold Era, so the accent quietly echoes that.
Amber is unforgiving: bright shades fail contrast on white and read as "warning."
Use these exact values, which are deliberately deeper on light and brighter on dark.

| Token | Light | Dark | Use |
|---|---|---|---|
| `accent` | `#B45309` | `#F59E0B` | Primary buttons, active nav indicator |
| `accent-hover` | `#92400E` | `#FBBF24` | Hover on the above |
| `accent-fg` | `#FFFFFF` | `#1C1917` | Text **on** an accent fill — note dark mode uses near-black |
| `accent-text` | `#B45309` | `#FBBF24` | Links, accent-colored labels |
| `accent-subtle` | `#FEF3C7` | `#78350F` | Badge backgrounds, selected rows, chart fills |
| `accent-border` | `#FCD34D` | `#B45309` | Focus rings, active borders |

White text on `#B45309` sits at ~4.9:1 and passes AA. Never place white text on a
lighter amber than that.

### Neutrals — warm stone, not blue-gray

Amber against cool blue-grays looks muddy. Warm neutrals make it look intentional.

| Token | Light | Dark |
|---|---|---|
| `bg` | `#FAFAF9` | `#0C0A09` |
| `surface` | `#FFFFFF` | `#1C1917` |
| `surface-raised` | `#FFFFFF` | `#292524` |
| `border` | `#E7E5E4` | `#292524` |
| `border-strong` | `#D6D3D1` | `#44403C` |
| `text` | `#1C1917` | `#FAFAF9` |
| `text-muted` | `#57534E` | `#A8A29E` |
| `text-subtle` | `#78716C` | `#78716C` |

### Semantic

Destructive actions get their **own** red. Amber and red sit close enough that a
delete button in amber would be ambiguous — this separation is not optional.

| Token | Light | Dark | Use |
|---|---|---|---|
| `success` | `#059669` | `#34D399` | Upload complete, verified badge |
| `danger` | `#DC2626` | `#F87171` | Delete buttons, destructive confirms |
| `danger-subtle` | `#FEE2E2` | `#7F1D1D` | Error banner backgrounds |
| `info` | `#0284C7` | `#38BDF8` | Informational notices |

There is no separate warning color — do not introduce one, it will collide with the
accent.

### Chart / file-type categorical palette

Six hues that coexist with amber. Amber leads as the first series.

| # | Light | Dark |
|---|---|---|
| 1 | `#B45309` | `#F59E0B` |
| 2 | `#0D9488` | `#2DD4BF` |
| 3 | `#4F46E5` | `#818CF8` |
| 4 | `#BE123C` | `#FB7185` |
| 5 | `#7C3AED` | `#A78BFA` |
| 6 | `#475569` | `#94A3B8` |

### Typography

**Inter** throughout (fall back to system sans). Enable tabular numerals on all
numeric data.

| Style | Size / Line | Weight | Use |
|---|---|---|---|
| Display | 30 / 36 | 600 | Auth screen headings |
| H1 | 24 / 32 | 600 | Page titles |
| H2 | 18 / 28 | 600 | Card and section headings |
| Body | 14 / 20 | 400 | Default UI text |
| Body-medium | 14 / 20 | 500 | Table headers, button labels |
| Small | 13 / 18 | 400 | Helper text, metadata |
| Caption | 12 / 16 | 500 | Badges, chart axis labels |
| Stat | 30 / 36 | 600 | Stat tile values, tabular |
| Mono | 13 / 20 | 400 | Extracted content, OTP digits |

### Spacing, radius, elevation

- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Radius: 6 inputs and badges · 8 buttons · 12 cards and modals · full for avatars
- Border: 1px `border` on every card, table, and input
- Elevation: exactly one shadow, `0 4px 12px rgba(0,0,0,0.08)`, used only on modals,
  dropdowns, and toasts. Cards never get a shadow — they get a border.
- Focus ring: 2px `accent-border`, offset 2px, on every interactive element

### Motion

Reference only, for whoever implements it — do not attempt to render motion.

- Page transitions: fade in with a 8px upward slide, 200ms ease-out
- List and table rows: stagger in at 30ms intervals
- Modals: scale from 0.96 to 1 with a backdrop fade, 150ms
- Upload progress bars: width transitions smoothly, no stepping
- Hover states: 120ms color transitions

---

## 4. Application shell

**Sidebar** — 240px, fixed, `surface` background, 1px right border.
- App name "Managing Your Files" at top with a small file-stack mark, 24px padding
- Nav items: 36px tall, 8px radius, icon + label at 14/500
- Active item: `accent-subtle` background, `accent-text` label, plus a 3px `accent`
  bar on the left edge
- Primary group: Dashboard · Upload · My Files · Profile
- Admin group: separated by a divider and a 12px uppercase `text-subtle` label
  "ADMIN", containing Overview · Users · Files
- Bottom: current user's avatar, name, and role badge

**Top bar** — 64px, `bg` background, 1px bottom border.
- Page title on the left at H1
- Right cluster: theme toggle (sun/moon), then avatar with a dropdown menu
  containing Profile and Sign out

**Content area** — `bg` background, 32px padding, max-width 1200px, sections
separated by 24px.

---

## 5. Component inventory

Design each of these once, with all its states, on a dedicated components artboard.

**Buttons** (36px tall, 12px horizontal padding, 8px radius)
- Primary: `accent` fill, `accent-fg` text
- Secondary: `surface` fill, 1px `border-strong`, `text` label
- Ghost: transparent, `text-muted`, hover to `accent-subtle`
- Danger: `danger` fill, white text
- States for each: default, hover, focus ring, disabled at 40% opacity, loading with
  a spinner replacing the label

**Inputs** — 36px, `surface` fill, 1px `border`, 6px radius. States: default, focus
(accent ring), error (`danger` border with a message below), disabled.

**Select / dropdown** — matching input styling with a chevron; open state shows a
menu at elevation with the selected item in `accent-subtle`.

**Search input** — magnifier icon on the left, clear "×" on the right once filled.

**Badges** — 20px tall, 6px radius, Caption type.
- Role: Admin in `accent-subtle` / `accent-text`; User in neutral
- Status: Verified in `success`; Pending in neutral
- File type: colored from the categorical palette by extension group

**Stat tile** — `surface` card, border, 20px padding. Small `text-muted` label,
Stat-sized value, and a delta line below in `success` or `danger`.

**Data table** — `surface`, border, 12px radius, header row in `bg` with
Body-medium labels, 52px rows, 1px row dividers, hover row tint, sortable headers
with a chevron, right-aligned action buttons per row.

**Pagination** — below the table: "Showing 1–10 of 47" on the left in Small
`text-muted`; page buttons on the right, current page in `accent` fill.

**File type icon** — 36px rounded square, tinted background from the categorical
palette, glyph inside. Distinct treatments for image, PDF, document, spreadsheet,
text, archive.

**Modal** — 480px wide, 12px radius, elevation, backdrop at 50% black. Title,
body copy, right-aligned Cancel + confirm buttons.

**Toast** — 360px, elevation, 12px radius, colored left edge bar, icon, message,
dismiss "×". Success and error variants. Stacks bottom-right.

**Progress bar** — 6px tall, full radius, `border` track, `accent` fill.

---

## 6. Screens

### 6.1 Login `[+mobile]`
Centered 400px card on `bg`. App mark and Display heading "Welcome back", Small
`text-muted` subheading. Email and password inputs, a "Forgot password?" ghost link
right-aligned, full-width primary button "Sign in", then "Don't have an account?
Register" below. Show a second copy of this artboard with an error banner reading
"Invalid email or password" in `danger-subtle`.

### 6.2 Register `[+mobile]`
Same card treatment. Heading "Create your account". Fields: Name, Email, Password
with a three-segment strength meter and the rule "At least 8 characters" in Small
`text-subtle`. Full-width "Create account", then a link back to sign in.

### 6.3 Verify email
Centered card. Heading "Check your email", subheading "We sent a 6-digit code to
ahmed@example.com". Six separate 48 × 56 digit boxes in Mono, 12px gaps, the first
focused with an accent ring. Below: "Code expires in 9:47" in Small `text-muted`.
Then a full-width "Verify" button, and a "Resend code" ghost button — design this
one **twice**, once enabled and once disabled reading "Resend in 42s".

### 6.4 User dashboard `[+mobile]`
Page title "Dashboard".
- Row of four stat tiles: Total Files `47`, Storage Used `142.8 MB`, File Types `6`,
  Last Upload `2 hours ago`
- Two-column row beneath: a vertical bar chart "Files by type" on the left
  (categories: Images, PDFs, Documents, Spreadsheets, Text, Archives), and a line
  chart "Upload history" on the right spanning the last 30 days, with an `accent`
  line over a soft `accent-subtle` gradient fill
- Full-width "Recent uploads" card at the bottom: five rows, each with file type
  icon, name, size, and relative time

### 6.5 Upload
Page title "Upload files".
- Large drop zone, 240px tall, 2px dashed `border-strong`, 12px radius, centered
  upload glyph, "Drag & drop files here" at H2, "or click to browse" in Small, and
  the constraint line "Max 10 files · 10 MB each · Images, PDFs, documents,
  spreadsheets, text, CSV, JSON, ZIP"
- Design a **second copy** of the drop zone in its active drag state: `accent-border`
  dashed border, `accent-subtle` background, `accent-text` label
- Below it an upload queue card with four rows showing every status: one complete
  with a `success` check, one mid-upload at 64% with a visible progress bar, one
  queued and greyed, one failed in `danger` reading "File exceeds 10 MB" with a
  retry ghost button

### 6.6 My Files `[+mobile]`
Page title "My Files", primary "Upload" button top-right.
- Toolbar: search input on the left (placeholder "Search files…"), then a type
  filter select ("All types"), a sort select ("Newest first"), and a grid/list view
  toggle on the right
- Data table with columns: checkbox, Name (icon + filename + type badge), Size,
  Uploaded (relative, with the exact date in Small below), and a right-aligned
  actions cell with download and delete icon buttons
- Ten rows of realistic data, then pagination reading "Showing 1–10 of 47"
- Design **three additional variants** of this artboard: the loading skeleton
  (shimmer blocks in the table), the empty state (centered illustration, "No files
  yet", "Upload your first file to get started", primary Upload button), and the
  no-results state ("No files match your search", ghost "Clear filters" button)

### 6.7 File detail
Back link "← My Files" above the title.
- Header card: large file type icon, filename at H1, a row of type badge and
  `success` "Processed" badge, and right-aligned secondary "Download" plus danger
  ghost "Delete" buttons
- Metadata panel in a two-column definition grid: File type, Size, Uploaded,
  Owner, MIME type, File ID
- **Extracted content** card: H2 heading, a scrollable 320px panel of Mono text with
  a subtle `bg` fill, and a "Copy" ghost button in the top-right corner
- Design a **second copy** of this artboard for an image file, where the extracted
  content panel is replaced by a centered image preview on a checkered transparency
  background

### 6.8 Profile
Page title "Profile". A wide `surface` card: 64px avatar with initials on
`accent-subtle`, name at H1, email in `text-muted`, role badge, and "Member since
March 2026" in Small. Below, a three-tile row: Files Uploaded `47`, Storage Used
`142.8 MB`, Account Status `Verified`. A secondary "Change password" button at the
bottom.

### 6.9 Admin overview
Page title "Admin Overview".
- Four stat tiles: Total Users `128`, Total Files `1,842`, Storage Used `4.7 GB`,
  New This Week `+23`
- A horizontal bar chart "Most uploaded file types" using the categorical palette
- A "Recent uploads" table with an extra Owner column showing an avatar and name

### 6.10 Admin users
Page title "Users", search input in the toolbar.
- Table columns: User (avatar + name + email stacked), Role (an inline select
  showing "Admin" / "User" — show one row with the select **open**), Status badge,
  Files count, Joined date, and a right-aligned delete icon button
- Eight rows, mixed roles and statuses, then pagination
- Design a **second copy** of this artboard with the delete confirmation modal open
  over a dimmed backdrop: "Delete user?", body "This will permanently delete Sarah
  Chen and all 12 of their files. This action cannot be undone.", Cancel + danger
  "Delete user"

### 6.11 Admin files
Page title "All Files". Same table as My Files plus an Owner column, and a toolbar
that adds an owner filter alongside search, type, and sort. Ten rows spanning
several different users, then pagination.

---

## 7. Shared states artboard

Collect these on one artboard so they read as a consistent set:
- Table loading skeleton
- Empty state (illustration, heading, subtext, action)
- No search results state
- Error state: `danger` icon, "Something went wrong", "We couldn't load your files.",
  secondary "Try again" button
- Destructive confirmation modal
- Success toast and error toast
- Inline field error
- Full-page 404

---

## 8. Responsive behavior

For the five `[+mobile]` artboards at 390 × 844:
- Sidebar becomes a hamburger-triggered left drawer over a dimmed backdrop
- Stat tiles stack to a 2×2 grid
- Charts go full-width and stack vertically
- Data tables become stacked cards: file icon and name on the first line, then size
  and date on a muted second line, with actions in an overflow "⋯" menu
- The upload drop zone shortens to 160px and reads "Tap to browse files"
- Toolbar controls stack: full-width search, then filter and sort side by side

Also note a tablet behavior at 768–1024px: the sidebar collapses to a 64px
icon-only rail with tooltips on hover.

---

## 9. Sample data to use throughout

Filenames: `Q4-financial-report.pdf` · `team-offsite-photo.jpg` ·
`invoice-2026-0142.xlsx` · `meeting-notes.txt` · `brand-assets.zip` ·
`product-roadmap.docx` · `analytics-export.csv` · `logo-final.png`

Sizes: 12 KB · 340 KB · 1.2 MB · 2.8 MB · 4.1 MB · 8.4 MB (10 MB is the cap)

People: Ahmed Hassan (Admin) · Sarah Chen · Marcus Webb · Priya Raman ·
Tom Okafor · Lena Fischer

Dates: within the last four months, relative where recent ("2 hours ago",
"Yesterday", "3 days ago") with exact dates for anything older.

---

## 10. Rules

1. **Amber is reserved** for primary actions, active navigation, and data
   highlights. Everything else is neutral. If more than roughly 10% of a screen is
   amber, it's too much.
2. **Destructive actions are always red**, never amber.
3. **Cards get borders, not shadows.** Shadow is only for modals, dropdowns, toasts.
4. **Every interactive element needs a visible focus ring** — 2px `accent-border`,
   2px offset.
5. **Both themes are first-class.** Every artboard should work in light and dark;
   remember that dark-mode accent fills take near-black text, not white.
6. **No gradients** except the single soft area fill under the upload-history line
   chart.
7. **No stock photography or 3D illustration.** Empty states use simple line
   illustrations in `border-strong`.
