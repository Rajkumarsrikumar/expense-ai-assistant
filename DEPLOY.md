# Publish Expense AI Assistant

## Option 1: Vercel (Recommended)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-ai-assistant.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repo (or upload the folder)
4. Before deploying, add **Environment Variables**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ngwrfmyzzfwpmbplitgo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your secret key |
| `BASE_CURRENCY` | `SGD` |
| `NEXT_PUBLIC_BASE_CURRENCY` | `SGD` |

5. Click **Deploy**
6. Copy your deployment URL (e.g. `https://expense-ai-xxx.vercel.app`)

### 3. Update Supabase

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/**`
4. Add for preview deployments: `https://*.vercel.app/**`

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
