# Supabase Setup Guide – Expense AI Assistant

Follow these steps in order. Your `.env.local` is already configured with your keys.

---

## Step 1: Run Database Migration

1. Open your Supabase project: **https://supabase.com/dashboard**
2. Click your project
3. Go to **SQL Editor** (left sidebar)
4. Click **+ New query**
5. **Copy everything** from `supabase/migrations/0001_init.sql` (in this project)
6. **Paste** into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see: "Success. No rows returned"

---

## Step 2: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name: `receipts`
4. Leave **Public bucket** OFF (private)
5. Click **Create bucket**

---

## Step 3: Run Storage Policies

1. Go back to **SQL Editor**
2. Click **+ New query**
3. **Copy everything** from `supabase/migrations/0002_storage.sql`
4. **Paste** into the SQL Editor
5. Click **Run**

---

## Step 4: Add Redirect URLs (for magic link login)

1. Go to **Authentication** → **URL Configuration** (left sidebar)
2. Set **Site URL** to `http://localhost:3000` (or your dev port)
3. Under **Redirect URLs**, add ALL of these (the app may run on different ports):
   - `http://localhost:3000/**`
   - `http://localhost:3001/**`
   - `http://localhost:3002/**`
4. Click **Save**

---

## Step 5: Seed FX Rates (optional, for currency conversion)

After the app is running, open in browser or run in terminal:

```
http://localhost:3000/api/fx/sync
```

Use a tool like Postman to send a **POST** request, or run:

```bash
curl -X POST http://localhost:3000/api/fx/sync
```

---

## Done

Restart the dev server (`npm run dev`) and open **http://localhost:3000** (or the port shown if 3000 is in use)

You can now sign in with email (magic link), upload receipts, and use the app.

---

## Troubleshooting

### "Not working" / Magic link doesn't sign you in
1. **Redirect URL**: In Supabase → Authentication → URL Configuration, add the URL shown on the login page (e.g. `http://localhost:3002/**`). Add all ports you might use: 3000, 3001, 3002.
2. **URL and keys must match**: Your `NEXT_PUBLIC_SUPABASE_URL` must be from the **same project** as your publishable/secret keys. In Supabase Dashboard → Project Settings → API, copy the **Project URL** and ensure it matches `.env.local`.
3. **Test connection**: Visit `http://localhost:3000/api/health` (or your port) to verify Supabase is reachable.

### "Failed to fetch" error
1. **Project paused**: Free-tier Supabase projects pause after inactivity. Go to [Dashboard](https://supabase.com/dashboard) → your project → click **Restore project** if paused.
2. **URL/keys mismatch**: Get both from the same project: Project Settings → API. Update `.env.local` and restart the dev server.
3. **Browser extensions**: Disable CORS, Ad block, or privacy extensions. Try **incognito/private** mode.
4. **Legacy keys**: If publishable key fails, use the **anon** (JWT) key from **Legacy API Keys** tab in Supabase. It starts with `eyJ...`. Replace `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
5. **Port change**: If the app runs on 3003 (or another port), add `http://localhost:3003/**` to Supabase Redirect URLs.

### App won't start / EINVAL readlink error
- Delete the `.next` folder and run `npm run dev` again.

### Port already in use
- The app will try 3001, 3002, etc. Use the URL shown in the terminal.
