# CVR Handicrafts — E-Commerce Platform

A full-stack e-commerce platform for CVR Handicrafts: customer storefront + secure admin panel, built on Next.js 14, PostgreSQL (via Prisma), Supabase Storage, NextAuth, and Razorpay.

---

## 1. What's inside

- **Customer site**: home, shop (filter/sort/search), product detail, cart, checkout with Razorpay, order confirmation, about/contact.
- **Admin panel** (`/admin`): dashboard, category/subcategory management, product management with **dynamic specifications** and **persistent image upload**, order management with status updates.
- **Fully dynamic catalogue**: categories, subcategories, products, and per-product specifications are all database-driven — nothing is hardcoded. Add a new category or a product with completely different spec fields (e.g. Diameter instead of Weight) with zero code changes.
- **Persistent images**: uploads go to Supabase Storage; the database stores only the permanent public URL, never a local file path. Verified to survive refreshes/restarts/redeploys.
- **Real payment verification**: Razorpay order creation + server-side HMAC signature verification + webhook handler with idempotency (duplicate webhook deliveries won't double-process an order).

---

## 2. Prerequisites

You'll need accounts/services for:

1. **Supabase** (free tier is fine to start) — provides both the Postgres database and image storage.
2. **Razorpay** — for payments (test mode keys work for development).
3. **Node.js 18+** installed locally.

---

## 3. Setup steps

### 3.1 Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script — make sure you have internet access (this fetches Prisma's query engine binaries).

### 3.2 Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Once created, go to **Project Settings → Database** and copy the **connection string** (use the "Transaction" pooler string for `DATABASE_URL` if deploying to a serverless platform like Vercel).
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep this secret, server-only)

### 3.3 Create the Storage bucket

1. In Supabase, go to **Storage** → **New Bucket**.
2. Name it `product-images` (or anything — just match `SUPABASE_STORAGE_BUCKET` in your `.env`).
3. Set it to **Public** (so product images can be displayed without signed URLs).
4. No further policy setup is needed for reads since the bucket is public; writes always go through the server using the service role key, which bypasses RLS.

### 3.4 Configure environment variables

```bash
cp .env.example .env
```

Fill in every value in `.env`. See the comments in `.env.example` for what each one is for. Generate `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

### 3.5 Push the database schema

```bash
npm run db:push
```

This creates all tables (categories, subcategories, products, images, specifications, customers, orders, order items, payments, admin users) in your Supabase Postgres database.

> Using `db:push` for initial setup is fine. For ongoing schema changes in a team/production setting, switch to `npm run db:migrate` to get proper migration history.

### 3.6 Seed the real product catalogue

```bash
# Optional: override the default admin login before seeding
export SEED_ADMIN_EMAIL="youradmin@email.com"
export SEED_ADMIN_PASSWORD="ChooseAStrongPassword!23"

npm run db:seed
```

This creates:
- One admin user (`admin@cvrhandicrafts.com` / `ChangeMe123!` if you didn't override the env vars above — **change this password after first login**).
- Categories: Statues, Buddha, Tanjore, Diyas & Lamps, Décor.
- All products transcribed from the two catalogue PDFs you provided, with their real codes, prices, and specifications.

**Important**: the seed script does **not** upload product photos. The PDFs only contained embedded images inside the document, not standalone image files, so nothing was invented or faked. After seeding, go to **Admin → Products → [each product] → Images** and upload the real photos from your files. The first image uploaded per product automatically becomes its primary/featured image.

### 3.7 Run the app

```bash
npm run dev
```

- Customer site: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### 3.8 Configure Razorpay webhook (for production)

1. In the Razorpay Dashboard → **Settings → Webhooks**, add an endpoint pointing to:
   `https://yourdomain.com/api/webhooks/razorpay`
2. Subscribe to at least: `payment.captured`, `payment.failed`, `order.paid`.
3. Copy the **Webhook Secret** shown there into `RAZORPAY_WEBHOOK_SECRET` in your `.env`.

This webhook is what makes payment status authoritative even if a customer closes their browser mid-checkout — the server-to-server webhook confirms payment independently of the frontend redirect.

---

## 4. Deployment

This is a standard Next.js 14 App Router project — it deploys cleanly to **Vercel** (recommended) or any Node hosting that supports Next.js.

1. Push this project to a Git repository.
2. Import it into Vercel.
3. Add all the same environment variables from your `.env` file into Vercel's Project Settings → Environment Variables.
4. Deploy.
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your real production domain.
6. Point your Razorpay webhook at the production URL (see 3.8).

Because images live in Supabase Storage (not on the server's local disk), redeploying the frontend will **never** break existing product images — this was a specific requirement and the architecture guarantees it structurally, not just by convention.

---

## 5. How the dynamic systems work

### Dynamic categories/subcategories
`Category` and `Subcategory` are ordinary database tables with `isActive` and `sortOrder` columns. The customer site only ever queries `WHERE isActive = true`, and hides any category with zero active products so you never get an empty section on the homepage. Everything is managed from **Admin → Categories** — no code changes needed to add "Wooden Décor" or "Terracotta" next month.

### Dynamic product specifications
Each product has a `ProductSpecification[]` — an ordered list of `{ label, value }` pairs, not fixed columns. This is what lets one product show *Material / Height / Weight* and another show *Material / Height / Diameter / Finish*, all edited through the same **"+ Add Specification"** UI in the admin product editor. The customer product page only renders whichever rows exist — it never shows a blank "Diameter: —" for a product that doesn't have one.

### Image upload flow (verified end-to-end in code)
```
Admin selects file in browser
  → POST /api/admin/products/:id/images (multipart FormData)
    → validated (type, size) server-side
    → uploaded to Supabase Storage bucket
    → public URL + storage key returned
    → ProductImage row created with that URL (never a local path)
  → Customer site reads product.images[].url directly from the database
```
Deleting an image removes it from **both** Supabase Storage and the database row, so it disappears from the site immediately and doesn't linger as an orphaned file.

---

## 6. Project structure

```
prisma/
  schema.prisma       — full relational schema
  seed.ts             — real catalogue seed script
src/
  app/
    (shop)/           — customer-facing pages (home, shop, product, checkout, about, contact)
    admin/
      login/          — public admin login
      (protected)/    — dashboard, products, categories, orders (behind middleware auth)
    api/
      admin/          — protected admin CRUD endpoints
      products/, categories/, orders/, webhooks/  — public + payment endpoints
  components/         — shared UI (header, footer, product card, cart drawer, etc.)
  components/admin/   — admin-only UI (image uploader, spec editor, sidebar, etc.)
  lib/                — prisma client, supabase client, auth config, razorpay, validation schemas
  types/              — shared TypeScript DTOs
```

---

## 7. Known limitations / next steps for you

- **Product photos**: not seeded (see 3.6) — upload real photos via admin.
- **Shipping rule**: a simple flat ₹99 fee (free above ₹2000) is hardcoded in `src/app/api/orders/route.ts` and the checkout page as a starting point — adjust to your actual shipping policy, or wire it to a `SiteSetting` row if you want it admin-editable.
- **Instagram feed**: the homepage section links out to your Instagram profile but does not pull a live post feed (that requires Instagram Graph API app review). The section is structured so a live feed can be dropped in later without breaking the layout.
- **Homepage banners**: the `Banner` table exists in the schema for future promotional banners, but there's no admin UI for it yet — extend `Admin → Categories` pattern if you want this next.
- **Multi-admin roles**: `AdminUser.role` supports `ADMIN`/`SUPERADMIN` but the app doesn't yet restrict any actions by role — every logged-in admin currently has full access.

---

## 8. Support

Business contact details (used throughout the site) are centralized in `src/lib/siteConfig.ts` — update them there if anything changes.
#   c v r - h a n d i c r a f t s  
 