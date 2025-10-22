-- Migration to add senderName column to messages table
-- Run this in your Supabase SQL editor

-- Add the senderName column to the messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- Update existing messages to have a default sender name
UPDATE messages 
SET sender_name = 'User' 
WHERE sender_name IS NULL;
