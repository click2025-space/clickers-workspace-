-- Fix for Supabase Auth integration
-- Run this in your Supabase SQL editor

-- Drop the existing foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add the correct foreign key constraint referencing auth.users
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also fix other tables that reference users
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE sessions 
ADD CONSTRAINT sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix workspace tables to reference auth.users as well
ALTER TABLE workspace_notes DROP CONSTRAINT IF EXISTS workspace_notes_member_id_fkey;
ALTER TABLE workspace_notes 
ADD CONSTRAINT workspace_notes_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE workspace_files DROP CONSTRAINT IF EXISTS workspace_files_member_id_fkey;
ALTER TABLE workspace_files 
ADD CONSTRAINT workspace_files_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE workspace_data DROP CONSTRAINT IF EXISTS workspace_data_member_id_fkey;
ALTER TABLE workspace_data 
ADD CONSTRAINT workspace_data_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the custom users table since we're using auth.users
DROP TABLE IF EXISTS users CASCADE;
