# Project Tracker

A full-stack project tracking web app built with React, Vite, and Supabase. Tracks projects with status, progress, and an append-only history timeline.

## Tech Stack

- **Frontend:** Vite + React (JavaScript), React Router
- **State:** Zustand
- **Backend:** Supabase (Auth, Postgres, Row Level Security)
- **Validation:** Zod

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to be provisioned.

### 2. Apply the database schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Copy the contents of `supabase/schema.sql`.
3. Paste and run the SQL. This creates:
   - `profiles` – user profile (full_name, role, timezone)
   - `projects` – project records
   - `history_entries` – append-only timeline per project
   - RLS policies on all tables
   - Triggers for `updated_at` and auto-inserting history on status/progress changes
   - Auto-create profile on user signup

### 3. Configure environment variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. In Supabase: **Settings → API** – copy the Project URL and anon/public key.
3. Set in `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4. Enable Email auth (optional)

Supabase enables email/password auth by default. For local development, you can disable email confirmation:

- **Authentication → Providers → Email** – turn off "Confirm email" if desired.

## Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## RLS (Row Level Security)

All tables use RLS:

- **profiles:** Users can SELECT, INSERT, UPDATE only their own row (`auth.uid() = id`).
- **projects:** Users can SELECT, INSERT, UPDATE, DELETE only rows where `user_id = auth.uid()`.
- **history_entries:** Users can SELECT and INSERT only rows where `user_id = auth.uid()` and the project belongs to them (via `EXISTS` on `projects`). No UPDATE or DELETE – history is append-only.

## History rules

- **status_change:** Created by DB trigger when `status` changes.
- **progress_update:** Created by DB trigger when `progress` changes.
- **field_edit:** Created by the frontend when other fields (name, description, priority, dates, tags, owner_label) change.
- **note:** Created when the user adds a note via the form.

History entries cannot be edited or deleted from the UI or via RLS.

## Export / Import

- **Export:** Downloads a JSON file with all projects and history for the current user.
- **Import:** Uploads a JSON file and inserts projects + history for the current user. Existing projects are not overwritten; imported projects get new IDs, and history is mapped to the new project IDs.

## Seed demo data

On the Settings page, **Seed demo data** adds 3–5 sample projects with history. It only runs when the user has no projects.

## Project structure

```
src/
├── api/           # Supabase queries (profiles, projects, history)
├── components/   # Reusable UI (Toast, ConfirmDialog, StatusBadge, etc.)
├── lib/          # Supabase client, validation
├── pages/        # Login, Dashboard, ProjectDetail, Profile, Settings
├── store/        # Zustand stores (auth, toast)
├── App.jsx
└── main.jsx
```
