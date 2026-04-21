# GoLa Handcrafted - Luxury Inquiry Website

Mobile-first, high-performance Next.js single-page website for a handcrafted wooden and leather handbag atelier.

## 1) Install

```bash
npm install
```

## 2) Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 3) Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Set project environment variables from `.env.example`.
4. Deploy.

## 4) Configure email (Nodemailer)

Create a `.env.local` file:

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
TO_EMAIL=your-inbox@example.com
```

The inquiry form sends submissions via `POST /api/inquiry`, which validates input and sends mail through `lib/mail.ts`.

## 5) Update products and images

- Product content lives in `lib/products.ts`.
- Each product has `id`, `name`, `description`, `dimensions`, `images`, and `customizable`.
- Place optimized image assets in `public/images` and reference them with absolute paths like `/images/petite-01.jpg`.
- The collection grid and modal will automatically reflect updated product data.

## 6) Add 3D models later (GLB)

`components/ProductViewer.tsx` is structured to support replacing the image viewer with a 3D viewer.

Recommended approach:

1. Add `.glb` files into `public/models`.
2. Extend the product model to include a model path (example: `model: "/models/petite.glb"`).
3. Update `ProductViewer`:
   - keep fallback image gallery,
   - conditionally render a GLB viewer when model exists.
4. Optionally integrate React Three Fiber (`@react-three/fiber`, `@react-three/drei`) only when needed to keep baseline bundle lean.

---

## Project scripts

- `npm run dev` - start local development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run lint checks
- `npm run typecheck` - run TypeScript checks
