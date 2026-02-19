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

## Step 4: Enable Email/Password Auth (stores credentials in Supabase)

When users sign up, their email and password are stored securely in Supabase’s `auth.users` table. Sign-in uses these stored credentials.

1. Go to **Authentication** → **Providers** (left sidebar)
2. Click **Email**
3. Ensure **Enable Email provider** is ON (this enables both magic link and password auth)
4. For sign-up:
   - **Confirm email** – **OFF** (recommended for dev): users can sign in immediately after sign-up, no email needed
   - If ON: users must click a link in the email first (Supabase built-in email is rate-limited; use custom SMTP for production)
5. Click **Save**

---

## Step 5: Add Redirect URLs (for login & sign-up confirmation)

1. Go to **Authentication** → **URL Configuration** (left sidebar)
2. Set **Site URL** to `http://localhost:3000` (or your dev/production URL)
3. Under **Redirect URLs**, add ALL of these (the app may run on different ports):
   - `http://localhost:3000/**`
   - `http://localhost:3001/**`
   - `http://localhost:3002/**`
   - `https://expense-ai-assistant-4h8d.vercel.app/**` (if deployed)
4. The auth callback is `/auth/callback` – confirmation links will redirect there
5. Click **Save**

---

## Step 6: Seed FX Rates (optional, for currency conversion)

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

You can now **sign in** with email + password, **sign up** for a new account (with email verification), upload receipts, and use the app.

---

## Troubleshooting

### "Invalid login credentials"
- Ensure the user has signed up first (Sign Up tab).
- If **Confirm email** is ON: the user must click the verification link in the email before signing in.
- **Quick fix**: Supabase → Authentication → Providers → Email → turn **Confirm email** OFF. Then sign up again (or use an existing account) and sign in immediately.

### No confirmation email received / Can't sign in after sign-up
1. **Turn OFF email confirmation** (fastest fix): Supabase → Authentication → Providers → Email → set **Confirm email** to OFF → Save. New sign-ups can then sign in right away.
2. **Already signed up but not verified?** Manually confirm the user: Supabase → Authentication → Users → find the user → click the three dots → **Confirm user**. They can then sign in.
3. **Check spam/junk** – Supabase emails sometimes land there.
4. **Supabase built-in email** is rate-limited (a few per hour on free tier). For reliable emails, use custom SMTP: Supabase → Project Settings → Auth → SMTP Settings.

### "Not working" / Sign in or confirmation link fails
1. **Redirect URL**: In Supabase → Authentication → URL Configuration, add the full callback URL (e.g. `http://localhost:3002/auth/callback` or `http://localhost:3002/**`). Add all ports you might use: 3000, 3001, 3002. For production, add `https://your-domain.com/**`.
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
