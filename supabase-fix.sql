-- Quick fix for RLS policies and authentication issues
-- Run this in your Supabase SQL editor

-- First, let's drop and recreate the profiles policies with proper casting
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies with proper UUID comparison
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix workspace policies too
DROP POLICY IF EXISTS "Users can manage own notes" ON workspace_notes;
DROP POLICY IF EXISTS "Users can manage own files" ON workspace_files;
DROP POLICY IF EXISTS "Users can manage own data" ON workspace_data;

CREATE POLICY "Users can manage own notes" ON workspace_notes
    FOR ALL USING (auth.uid() = member_id);

CREATE POLICY "Users can manage own files" ON workspace_files
    FOR ALL USING (auth.uid() = member_id);

CREATE POLICY "Users can manage own data" ON workspace_data
    FOR ALL USING (auth.uid() = member_id);

-- Enable email confirmations (optional - you can disable this for testing)
-- This allows users to sign up without email confirmation
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
