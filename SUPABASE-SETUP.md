# Supabase Authentication Setup Guide

This guide walks you through setting up Supabase authentication for the Receipt Tracker application.

## Prerequisites

- Node.js installed
- A Supabase account (free tier available)
- Basic knowledge of environment variables

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: Receipt Tracker
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
6. Click "Create new project"
7. Wait for project setup (usually 1-2 minutes)

## Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ`)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root:

   ```bash
   cp env.example .env.local
   ```

2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

## Step 4: Configure Authentication Settings

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/` (for post-login redirect)

## Step 5: Set Up Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the "Confirm signup" template
3. Update the redirect URL to match your domain

## Step 6: Configure Row Level Security (RLS)

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable RLS on auth.users (already enabled by default)
-- Create a profiles table for additional user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipts table (for future use)
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  vendor TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_deductible BOOLEAN DEFAULT true,
  payment_method TEXT,
  tax_amount DECIMAL(10,2),
  confidence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on receipts
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own receipts
CREATE POLICY "Users can view own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own receipts
CREATE POLICY "Users can insert own receipts" ON receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own receipts
CREATE POLICY "Users can update own receipts" ON receipts
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own receipts
CREATE POLICY "Users can delete own receipts" ON receipts
  FOR DELETE USING (auth.uid() = user_id);
```

## Step 7: Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. You should be redirected to `/login`
4. Test the sign-up flow:
   - Create a new account
   - Check your email for verification
   - Click the verification link
5. Test the sign-in flow:
   - Use your credentials to sign in
   - You should be redirected to the dashboard

## Step 8: Production Configuration

When deploying to production:

1. Update **Site URL** in Supabase to your production URL
2. Add production **Redirect URLs**
3. Update environment variables in your hosting platform
4. Ensure HTTPS is enabled for your production domain

## Features Included

✅ **User Registration** - Email/password signup with verification  
✅ **User Login** - Secure authentication with session management  
✅ **Protected Routes** - Dashboard only accessible to authenticated users  
✅ **User Profile** - Display user info in sidebar with sign out  
✅ **Row Level Security** - Database-level security policies  
✅ **Session Management** - Automatic token refresh via middleware  
✅ **Responsive Design** - Works on desktop and mobile

## Troubleshooting

### "Invalid login credentials" Error

- Check email/password are correct
- Verify email is confirmed (check spam folder)
- Ensure user exists in Supabase auth dashboard

### Redirect Loop

- Check middleware configuration
- Verify environment variables are set correctly
- Ensure Site URL matches your domain

### API Key Errors

- Double-check `.env.local` file exists and has correct values
- Restart development server after adding environment variables
- Verify API keys are copied correctly from Supabase dashboard

### Database Errors

- Check RLS policies are set up correctly
- Verify user has necessary permissions
- Review Supabase logs for detailed error messages

## Next Steps

- Set up database tables for receipts and expenses
- Implement receipt storage with user association
- Add profile management functionality
- Configure email notifications
- Set up backup and monitoring

## Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Next.js Auth guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
3. Check the browser console and server logs for error messages
