-- Clickers Workspace Database Schema for Supabase
-- Run these SQL commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    bio TEXT,
    role TEXT,
    department TEXT,
    avatar TEXT,
    phone TEXT,
    location TEXT,
    skills TEXT[] DEFAULT '{}',
    is_onboarding_complete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for JWT token management
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    progress INTEGER NOT NULL DEFAULT 0,
    department TEXT NOT NULL,
    team_members TEXT[] DEFAULT '{}'
);

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    team_members TEXT[] DEFAULT '{}',
    icon TEXT NOT NULL
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    assigned_to TEXT,
    due_date TEXT,
    project_id TEXT
);

-- Members table (legacy - for existing team data)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    avatar TEXT,
    status TEXT NOT NULL DEFAULT 'online'
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_name TEXT NOT NULL DEFAULT 'Clickers Workspace',
    theme TEXT NOT NULL DEFAULT 'dark'
);

-- Workspace Notes table
CREATE TABLE workspace_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workspace Files table
CREATE TABLE workspace_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workspace Data table (key-value storage)
CREATE TABLE workspace_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    data_type TEXT NOT NULL DEFAULT 'string',
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_workspace_notes_member_id ON workspace_notes(member_id);
CREATE INDEX idx_workspace_files_member_id ON workspace_files(member_id);
CREATE INDEX idx_workspace_data_member_id ON workspace_data(member_id);
CREATE INDEX idx_workspace_notes_category ON workspace_notes(category);
CREATE INDEX idx_workspace_data_category ON workspace_data(category);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_notes_updated_at 
    BEFORE UPDATE ON workspace_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_data_updated_at 
    BEFORE UPDATE ON workspace_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on user-specific tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_data ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Sessions policies
CREATE POLICY "Users can manage own sessions" ON sessions
    FOR ALL USING (auth.uid()::text = user_id);

-- Workspace notes policies
CREATE POLICY "Users can manage own notes" ON workspace_notes
    FOR ALL USING (auth.uid()::text = member_id);

-- Workspace files policies
CREATE POLICY "Users can manage own files" ON workspace_files
    FOR ALL USING (auth.uid()::text = member_id);

-- Workspace data policies
CREATE POLICY "Users can manage own data" ON workspace_data
    FOR ALL USING (auth.uid()::text = member_id);

-- Insert default settings
INSERT INTO settings (workspace_name, theme) 
VALUES ('Clickers Workspace', 'dark')
ON CONFLICT DO NOTHING;

-- Insert sample departments
INSERT INTO departments (name, description, icon, team_members) VALUES
('Engineering', 'Software development and technical operations', 'Code', '{}'),
('Design', 'User experience and visual design', 'Palette', '{}'),
('Product', 'Product management and strategy', 'Target', '{}'),
('Marketing', 'Marketing and growth initiatives', 'Megaphone', '{}'),
('Sales', 'Sales and customer acquisition', 'TrendingUp', '{}'),
('HR', 'Human resources and people operations', 'Users', '{}'),
('Finance', 'Financial planning and operations', 'DollarSign', '{}'),
('Operations', 'Business operations and support', 'Settings', '{}')
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO projects (name, description, progress, department, team_members) VALUES
('Website Redesign', 'Complete overhaul of company website with modern design', 75, 'Design', '{}'),
('Mobile App Development', 'Native mobile application for iOS and Android', 45, 'Engineering', '{}'),
('Customer Analytics Platform', 'Advanced analytics dashboard for customer insights', 60, 'Product', '{}'),
('Brand Identity Refresh', 'Updated brand guidelines and visual identity', 90, 'Marketing', '{}')
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (title, description, status, assigned_to, due_date, project_id) VALUES
('Design Homepage Mockup', 'Create high-fidelity mockup for new homepage design', 'in-progress', NULL, '2024-11-15', NULL),
('Implement User Authentication', 'Set up secure user login and registration system', 'todo', NULL, '2024-11-20', NULL),
('Write API Documentation', 'Document all REST API endpoints with examples', 'done', NULL, '2024-10-30', NULL),
('Conduct User Testing', 'Run usability tests with 10 target users', 'todo', NULL, '2024-11-25', NULL)
ON CONFLICT DO NOTHING;
