# Supabase Setup Guide - EarnFlow

Follow these steps to set up your backend for **EarnFlow**. We are using a **Dual-Project** setup to keep the platform fast and profit-optimized.

---

## Step 1: Create Supabase Projects
1. Go to [database.new](https://database.new) and create **Project 1** (Call it `EarnFlow-Main`).
2. Repeat and create **Project 2** (Call it `EarnFlow-Game`).

## Step 2: Get API Keys
For **BOTH** projects, go to **Project Settings** -> **API** and copy:
- **Project URL**
- **Project API Key** (anon public)

## Step 3: Update `.env.local`
Open your project folder and paste the keys in `.env.local`:

```env
# PROJECT 1 (Main: Auth, Profiles, Tasks, Probo)
NEXT_PUBLIC_SUPABASE_MAIN_URL=https://your-project-1.supabase.co
NEXT_PUBLIC_SUPABASE_MAIN_ANON_KEY=your-anon-key-1

# PROJECT 2 (Game: Aviator, Color Trading Rounds)
NEXT_PUBLIC_SUPABASE_GAME_URL=https://your-project-2.supabase.co
NEXT_PUBLIC_SUPABASE_GAME_ANON_KEY=your-anon-key-2
```

## Step 4: Setup Project 1 (Main)
1. Go to **SQL Editor** in Project 1.
2. Click **New Query** and paste the **"PROJECT 1"** sections from [schema_v2.sql](file:///d:/My.Project/earning-app/data/schema_v2.sql).
3. **CRITICAL**: Also run the `Profiles` table creation and `increment_user_coins` function from [schema_v2.sql](file:///d:/My.Project/earning-app/data/schema_v2.sql#L75).

## Step 5: Setup Project 2 (Game)
1. Go to **SQL Editor** in Project 2.
2. Paste the **"PROJECT 2"** sections from [schema_v2.sql](file:///d:/My.Project/earning-app/data/schema_v2.sql#L32).
3. Run the query. This creates the Round and Betting logic.

## Step 6: Auth Configuration (For easy testing)
1. In **Project 1**, go to **Authentication** -> **Providers** -> **Email**.
2. **Disable "Confirm email"**. This allows you to register and login instantly.

---

> [!TIP]
> **Admin Access**: To access the `/admin` panel, simply sign up with an email and use that account. In a real app, you would manually add an `is_admin` column to the profiles table for extra security, but for now, it's open for your setup!

**Setup Complete!** Run `npm run dev` to start your platform.
