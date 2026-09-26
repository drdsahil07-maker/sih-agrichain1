# AgriChain: Supabase Setup Guide

This guide explains step-by-step how to configure your Supabase project for **AgriChain: Connect. Trade. Deliver.**

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in.
2. Click **New project**.
3. Set your project name (e.g., `agrichain`) and database password.
4. Select your preferred region (e.g., `ap-south-1` for Mumbai, India) and click **Create new project**.

---

## 2. Run the SQL Schema

1. In the Supabase Dashboard, click on **SQL Editor** from the left navigation bar (icon `>_`).
2. Click **New query**.
3. Copy the entire contents of `supabase/schema.sql` from this repository.
4. Paste the SQL into the editor.
5. Click **Run** (or press `Ctrl+Enter`).
6. You will see `Success. No rows returned`.

This will create:
- `public.profiles` with Row Level Security (RLS) enabled
- `public.farmer_profiles` with RLS enabled
- `public.distributor_profiles` with RLS enabled
- `public.transporter_profiles` with RLS enabled
- Automatic `updated_at` timestamps triggers
- Complete row-level security policies ensuring users can only read and write their own data

---

## 3. Retrieve Your API Keys

1. In the Supabase Dashboard, go to **Project Settings** (gear icon in the left navigation).
2. Click **API** under the Configuration section.
3. Find:
   - **Project URL** (e.g. `https://xyzproject.supabase.co`)
   - **Project API Keys** -> `anon` / `public` key (e.g. `eyJhbGci...`)

> **SECURITY NOTE**: Never use the `service_role` key in frontend code. Use ONLY the `anon` key.

---

## 4. Configure Environment Variables

Set the environment variables in your application environment or in your `.env` file:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

---

## 5. Email Authentication & Redirect URL Settings

### A. Configure URL Configuration & Redirect URLs
To ensure password reset links redirect properly to the application:
1. In the Supabase Dashboard, go to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your application root (e.g. `https://your-domain.com` or `http://localhost:3000`).
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/reset-password`
   - `https://your-domain.com/reset-password`
   - Wildcards like `http://localhost:3000/**` or `https://**` as permitted by your security requirements.
4. Click **Save**.

### B. Confirm Email (Optional for Development)
1. In the Supabase Dashboard, go to **Authentication** -> **Providers** -> **Email**.
2. Toggle OFF **Confirm email** if you want new users to be immediately logged in without waiting for verification links.
3. Note on **Email Rate Limits**: By default, Supabase limits sending reset/confirmation emails per hour. The application UI includes a 60-second cooldown timer and double-submit prevention locks to keep requests within rate limits.

---

## 6. Verifying Users in Supabase

When a user registers on AgriChain:
1. View them in **Authentication** -> **Users**.
2. View their base profile in **Table Editor** -> `profiles`.
3. View their role data in **Table Editor** -> `farmer_profiles`, `distributor_profiles`, or `transporter_profiles`.
4. When they sign in, their `last_login_at` column in `profiles` automatically updates.
