# Publish Expense AI Assistant

## Vercel Deployment (Step-by-Step)

### Step 1: Push to GitHub (if not done)

```bash
cd "d:\Rajkumar.SRIKUMAR\OneDrive - Total eBiz Solutions Pte Ltd\Desktop\Project Backup\Projects\STE\Webfile"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-ai-assistant.git
git push -u origin main
```

### Step 2: Create Vercel Account & Import

1. Go to **[vercel.com](https://vercel.com)** and sign in (use **Continue with GitHub**)
2. Click **Add New** → **Project**
3. Find your `expense-ai-assistant` repo and click **Import**
4. **Do not click Deploy yet** – add environment variables first

### Step 3: Add Environment Variables

Before deploying, click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ngwrfmyzzfwpmbplitgo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your publishable key (from .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your secret key (from .env.local) |
| `BASE_CURRENCY` | `SGD` |
| `NEXT_PUBLIC_BASE_CURRENCY` | `SGD` |

Copy the values from your `.env.local` file.

### Step 4: Deploy

1. Click **Deploy**
2. Wait 2–3 minutes for the build
3. Copy your live URL (e.g. `https://expense-ai-assistant-xxx.vercel.app`)

### Step 5: Update Supabase Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL: `https://your-app.vercel.app`
3. Under **Redirect URLs**, add:
   - `https://your-app.vercel.app/**`
   - `https://*.vercel.app/**` (for preview deployments)
4. Click **Save**

---

## Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. **Add new site** → **Import an existing project** → Connect GitHub
3. Netlify auto-detects Next.js. Build command: `npm run build`
4. Add the same environment variables as above
5. Deploy and update Supabase redirect URLs with your Netlify URL

---

## Option 3: Manual (VPS / Node server)

```bash
npm run build
npm start
```

Set env vars on the server and use a process manager (PM2) or reverse proxy (nginx).

---

## After Publishing

- Add your production URL to Supabase **Redirect URLs**
- Run FX sync: `POST https://your-app.vercel.app/api/fx/sync` (use Postman or curl)
