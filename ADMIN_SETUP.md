# GoLa Admin Setup

This project includes a password-protected admin panel at `/admin` for managing homepage sections and reviewing inquiries.

## 1. Admin login

Add to `.env.local` (and Vercel environment variables):

```env
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SESSION_SECRET=generate-a-long-random-string-at-least-32-chars
```

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Visit `/admin/login` and sign in with `ADMIN_PASSWORD`.

## 2. Inquiry form email (required for live submissions)

The inquiry form is enabled. It sends email through your existing SMTP settings:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
TO_EMAIL=
```

Without SMTP, form submissions will fail with a clear error.

## 3. Supabase (recommended for Vercel production)

Local development can store sections in `data/content-sections.json`. On Vercel, use Supabase so edits persist.

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Create a public storage bucket named `section-images` if needed
4. Add env vars:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Use the **service role** key only on the server (Vercel env). Never expose it in the browser.

## 4. What the admin can do

- **Sections** — create bilingual blocks with predefined layouts:
  - Split image left / split image right
  - Centered
  - Full bleed
  - Text only
- **Images** — paste a site path (`/images/...`) or upload to Supabase Storage
- **Inquiries** — view submissions when Supabase is connected

Published sections appear on the homepage after the Custom section and before Inquiry.

## 5. Security notes

- `/admin` routes require a signed httpOnly session cookie
- Admin APIs return `401` without a valid session
- Inquiry form includes a honeypot field for basic bot protection
- Keep `ADMIN_PASSWORD` and `SUPABASE_SERVICE_ROLE_KEY` private
