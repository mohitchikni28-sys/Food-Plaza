# Neelam Food Plaza · Full-Stack & Next.js Architecture

This repository is equipped with full-stack backend capabilities:

## 1. Live Environment (Currently Active)
Inside this environment, a production-ready **Node.js + Express Full-Stack Server** (`server.ts`) is currently active on port 3000:
- **Server Entry**: `/server.ts`
- **Database Engine**: Persistent JSON database at `/server-data/db.json`
- **Frontend**: React + Vite + Tailwind CSS mounted via Vite middleware
- **REST APIs**:
  - `GET /api/menu` - Fetch all live menu items
  - `POST /api/menu` - Add new food dish
  - `PUT /api/menu/:id` - Update dish details, pricing, and availability
  - `DELETE /api/menu/:id` - Remove dish
  - `GET /api/categories` - Fetch all categories
  - `POST /api/categories` - Add category
  - `PUT /api/categories/reorder` - Update tab order sequence
  - `GET /api/orders` - Live sales feed & order transactions
  - `POST /api/orders` - Log WhatsApp orders & auto-decrement portions stock
  - `PATCH /api/orders/:id/status` - Change order status (Pending/Preparing/Delivered/Cancelled)
  - `GET /api/inventory` - Portion counts, low-stock warnings (<10)
  - `PATCH /api/inventory/:id` - Adjust stock counts
  - `GET /api/offers` - Passenger deals & coupons (`TRAIN15`, `SWEETBONUS`)
  - `GET /api/gallery` - Platform 1 photo showcase
  - `GET /api/info` & `PUT /api/info` - Restaurant profile & timings
  - `POST /api/auth/login` - Admin authentication token validation

---

## 2. Next.js App Router Structure (`nextjs-export/`)
If you want to deploy directly to **Vercel** or run as a standalone **Next.js 14/15** application:

1. **API Route Handlers** have been prepared inside `/nextjs-export/app/api/`:
   - `/nextjs-export/app/api/menu/route.ts`
   - `/nextjs-export/app/api/orders/route.ts`
2. **Components & Types**:
   All UI components in `/src/components/*` and `/src/types/*` are 100% compatible with Next.js Client Components (add `'use client';` at the top of client components).
3. **Running in Next.js**:
   ```bash
   npx create-next-app@latest neelam-food-plaza --typescript --tailwind --app
   cp -r nextjs-export/app/api/* neelam-food-plaza/app/api/
   npm run dev
   ```
