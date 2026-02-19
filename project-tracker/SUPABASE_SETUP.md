# Supabase Setup Guide – Project Tracker

Follow these steps to set up Supabase for the Project Tracker app.

---

## Step 1: Create a Supabase project

1. Go to **[supabase.com](https://supabase.com)** and sign in (or create an account).
2. Click **New Project**.
3. Fill in:
   - **Name:** e.g. `project-tracker`
   - **Database Password:** choose a strong password and save it
   - **Region:** pick the closest region
4. Click **Create new project** and wait 1–2 minutes for it to be ready.

---

## Step 2: Run the database schema

1. In your Supabase project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` in this project.
4. Copy its full contents and paste into the SQL Editor.
5. Click **Run** (or press Ctrl+Enter).
6. You should see: `Success. No rows returned`.

This creates:

- `profiles` – user profiles
- `projects` – project records
- `history_entries` – project history
- RLS policies
- Triggers for `updated_at` and history

---

## Step 3: Get your API credentials

1. In the left sidebar, go to **Settings** (gear icon).
2. Click **API**.
3. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)

---

## Step 4: Configure the app

1. Open the `.env` file in the project root.
2. Set:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual Project URL and anon key.

3. Save the file.
4. Restart the dev server: stop it (Ctrl+C) and run `npm run dev` again.

---

## Step 5: Create the test user (optional)

1. In Supabase, go to **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
3. Enter:
   - **Email:** `testuser@example.com`
   - **Password:** `Test123456!`
4. Turn on **Auto Confirm User**.
5. Click **Create user**.

You can then use **Sign in as testuser** on the login page.

---

## Step 6: Disable email confirmation (optional, for development)

1. Go to **Authentication** → **Providers**.
2. Click **Email**.
3. Turn off **Confirm email**.
4. Click **Save**.

New signups will be able to sign in immediately without confirming email.

---

## Quick links (when logged into Supabase)

| Task              | Link                                      |
|------------------|-------------------------------------------|
| Create project   | https://supabase.com/dashboard/new         |
| SQL Editor       | Your project → SQL Editor                 |
| API settings     | Your project → Settings → API             |
| Create user      | Your project → Authentication → Users      |
| Email provider   | Your project → Authentication → Providers  |

---

## Troubleshooting

**"Invalid API key"**  
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in `.env`.
- Restart the dev server after changing `.env`.

**"relation does not exist"**  
- Run the full `supabase/schema.sql` in the SQL Editor.

**"Sign in failed"**  
- Ensure the test user exists in Authentication → Users.
- If using sign up, turn off "Confirm email" or confirm the email first.
