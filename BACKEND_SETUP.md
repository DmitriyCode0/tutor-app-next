# Backend Setup Guide

This guide will help you set up Supabase backend integration with Google OAuth authentication.

## Prerequisites

- Supabase account (free at [supabase.com](https://supabase.com))
- Google Cloud account (for OAuth credentials)

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

4. Go to **SQL Editor** and run the migration script from `supabase/migrations/001_initial_schema.sql`

## Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Go to **APIs & Services → Library**
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: Add your app URL + `/api/auth/callback/google`
     - For local: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-domain.com/api/auth/callback/google`
   - Copy **Client ID** and **Client Secret**

5. Configure Supabase Google OAuth:
   - Go to Supabase dashboard → **Authentication → Providers**
   - Enable **Google**
   - Paste your Google Client ID and Client Secret
   - Add redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
# Generate a random secret: openssl rand -base64 32
AUTH_SECRET=your_random_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Feature Flag - Set to "true" to enable backend
NEXT_PUBLIC_USE_API=true
```

## Step 4: Test the Setup

1. Start your dev server: `npm run dev`
2. You should see "Sign in with Google" button
3. Click it and complete Google OAuth flow
4. Your data will now be stored in Supabase!

## Troubleshooting

### "Unauthorized" errors
- Check that `NEXT_PUBLIC_USE_API=true` is set
- Verify Supabase credentials are correct
- Ensure database migration ran successfully

### Google OAuth not working
- Verify redirect URIs match exactly
- Check Google Cloud Console credentials
- Ensure Google+ API is enabled

### Database errors
- Run the migration script again
- Check RLS policies are enabled
- Verify user is authenticated

## Migration from localStorage

If you have existing data in localStorage and want to migrate:

1. Export your data (can add export feature later)
2. Sign in with Google
3. Manually re-enter data, or
4. Use the Supabase dashboard to import data directly

## Switching Back to localStorage

To temporarily use localStorage again:
- Set `NEXT_PUBLIC_USE_API=false` or remove it
- Restart your dev server
