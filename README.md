# Expense AI Assistant

A full-stack web app to upload receipts, track expenses, auto-convert currencies, view dashboards, and forecast spending.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend**: Supabase (Postgres, Auth, Storage) with Row Level Security
- **Validation**: Zod

## Prerequisites

- Node.js 18+
- A Supabase project

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to **Project Settings** → **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep secret!)

### 2. Run the database migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/0001_init.sql`
3. Paste and run the SQL

### 3. Create the Storage bucket

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket named `receipts` (Private recommended)
3. Run `supabase/migrations/0002_storage.sql` in SQL Editor to add RLS policies

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BASE_CURRENCY=SGD
```

### 5. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Seed FX rates (required for currency conversion)

Before uploading receipts with non-base currencies, seed sample FX rates:

```bash
curl -X POST http://localhost:3000/api/fx/sync
```

Or visit the API route after the app is running. This uses the service role key.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Email magic link sign-in |
| `/upload` | Upload receipt + optional manual fields |
| `/expenses` | Table with filters (date, category, merchant, status) |
| `/expenses/[id]` | Detail, review/edit, approve |
| `/dashboard` | Charts: spend over time, by category, by currency, top merchants |
| `/forecast` | Next 3 months forecast with confidence band |

## Key Setup Commands

```bash
# Install
npm install

# Dev
npm run dev

# Build
npm run build

# Start production
npm start

# Seed FX rates (run after app is up)
curl -X POST http://localhost:3000/api/fx/sync
```

## Manual Supabase Steps

1. **Run migration**: Execute `supabase/migrations/0001_init.sql` in SQL Editor
2. **Create bucket**: Storage → New bucket → name: `receipts`
3. **Enable Email auth**: Auth → Providers → Email (magic link) is enabled by default
4. **Configure redirect URLs**: Auth → URL Configuration → add `http://localhost:3000/**` for local dev

## Project Structure

```
├── app/
│   ├── (protected)/          # Auth-required routes
│   │   ├── dashboard/
│   │   ├── upload/
│   │   ├── expenses/
│   │   │   └── [id]/
│   │   └── forecast/
│   ├── api/
│   │   ├── expenses/
│   │   ├── upload/
│   │   ├── pipeline/extract/
│   │   ├── fx/sync/
│   │   ├── dashboard/
│   │   └── forecast/
│   ├── login/
│   └── layout.tsx
├── components/
│   ├── Nav.tsx
│   ├── ExpenseTable.tsx
│   ├── ExpenseFilters.tsx
│   ├── UploadForm.tsx
│   ├── ReviewForm.tsx
│   ├── StatusBadge.tsx
│   ├── DashboardCharts.tsx
│   └── ForecastChart.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   └── client.ts
│   ├── validation.ts
│   ├── fx.ts
│   ├── pipeline.ts
│   └── analytics.ts
├── supabase/
│   └── migrations/
│       └── 0001_init.sql
└── middleware.ts
```

## Swapping Stub Implementations

- **FX rates**: Replace the stub in `app/api/fx/sync/route.ts` with a real provider (e.g. exchangerate-api, openexchangerates)
- **AI/OCR extraction**: Replace `lib/pipeline.ts` and the extract route with your OCR/AI service
