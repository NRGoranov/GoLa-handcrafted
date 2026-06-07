# GoLa setup walkthrough

Follow these steps in order. You only need a browser and this project folder.

---

## Step 1 — Local admin (about 2 minutes)

A file called `.env.local` should already exist in the project root with:

- `ADMIN_PASSWORD` — password for `/admin/login`
- `ADMIN_SESSION_SECRET` — internal signing key (do not share)

**Do this now:**

```powershell
cd C:\Users\user\Downloads\NRGxPortfolio\GoLa-handcrafted
npm run setup:check
npm run dev
```

Open **http://localhost:3000/admin/login** and sign in with the password from `.env.local`.

You can create sections locally; they save to `data/content-sections.json` until Supabase is connected.

---

## Step 2 — Inquiry email (Gmail for testing)

Your `.env.local` is already set for **nrgoranov@gmail.com**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nrgoranov@gmail.com
SMTP_PASS=          ← only this line is missing
TO_EMAIL=nrgoranov@gmail.com
```

### Test without email first (works now)

On your PC, the form **already works** without `SMTP_PASS`:

- Submissions save to `data/inquiries.json`
- View them in **Admin → Inquiries**
- You’ll see: *“Inquiry received. Email will be enabled once SMTP is configured.”*

### Enable Gmail delivery (when you want email in your inbox)

1. Open https://myaccount.google.com/security → turn on **2-Step Verification** (if off)
2. Open https://myaccount.google.com/apppasswords
3. Create password: App **Mail**, device **GoLa website**
4. Copy the 16-character password (no spaces)
5. Paste into `.env.local` as `SMTP_PASS=xxxxxxxxxxxxxxxx`
6. Restart `npm run dev`

Run `npm run setup:check` — all SMTP lines should show **OK**.

### Later: Superhosting mail server

When your Superhosting mailbox is ready, replace only the SMTP lines in `.env.local` and Vercel (host, port, user, pass). The form code stays the same.

---

## Step 3 — Supabase (for Vercel / persistent storage)

Local JSON is fine on your PC. On **Vercel**, admin edits and the inquiry inbox need a database.

### 3.1 Create project

1. Go to https://supabase.com and sign in (GitHub is fine).
2. **New project**
   - Name: `gola-handcrafted`
   - Database password: save it somewhere safe
   - Region: closest to you (e.g. Frankfurt)
3. Wait until the project finishes provisioning (~1–2 min).

### 3.2 Run the database schema

1. In Supabase: **SQL Editor** → **New query**
2. Open this file in the repo: `supabase/schema.sql`
3. Copy the entire file, paste into the SQL editor, click **Run**
4. You should see success (tables `content_sections` and `inquiries`).

### 3.3 Storage bucket (for image uploads)

1. **Storage** in the left sidebar
2. If `section-images` is not listed, click **New bucket**
   - Name: `section-images`
   - **Public bucket**: ON
3. Create bucket

### 3.4 Copy API keys

1. **Project Settings** (gear) → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (under Project API keys) → `SUPABASE_SERVICE_ROLE_KEY`  
     ⚠️ Never put the service role key in client-side code or GitHub.

Add to `.env.local`:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Restart dev server. `npm run setup:check` should show Supabase OK.

---

## Step 4 — Vercel (production site)

1. Open your GoLa project on https://vercel.com
2. **Settings** → **Environment Variables**
3. Add **every** variable from `.env.local` (same names, same values)
4. **Redeploy** the latest deployment (or push a commit)

Production admin: **https://www.gola-handcrafted.eu/admin/login**

---

## Step 5 — Test a submission

1. Run `npm run dev` and open http://localhost:3000/en (or :3001 if 3000 is busy)
2. Scroll to **Inquiry**
3. Fill the form and submit
4. You should see a success message
5. Open **http://localhost:3000/admin/inquiries** — your test should appear
6. Once `SMTP_PASS` is set, check **nrgoranov@gmail.com** inbox too

---

## Quick reference

| Variable | Purpose |
|----------|---------|
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SESSION_SECRET` | Session signing (random hex) |
| `SMTP_*` + `TO_EMAIL` | Send inquiry emails |
| `SUPABASE_URL` | Database URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only DB access |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Admin login fails | Check `ADMIN_PASSWORD` in `.env.local`, restart dev server |
| Form says SMTP error | Complete Step 2, restart dev server |
| Sections don’t save on Vercel | Complete Step 3 + Step 4 |
| Image upload fails in admin | Create public `section-images` bucket in Supabase |

Need help? Run `npm run setup:check` and share which lines show `MISSING`.
