import { supabase } from './supabase';
import type { Database } from './supabase';

type Tables = Database['public']['Tables'];
type WorkspaceNote = Tables['workspace_notes']['Row'];
type WorkspaceFile = Tables['workspace_files']['Row'];
type WorkspaceData = Tables['workspace_data']['Row'];
type Project = Tables['projects']['Row'];
type Department = Tables['departments']['Row'];
type Task = Tables['tasks']['Row'];
type Member = Tables['members']['Row'];
type Message = Tables['messages']['Row'];
type Profile = Tables['profiles']['Row'];

// Workspace Notes API
export const workspaceNotesApi = {
  async getAll(memberId: string): Promise<WorkspaceNote[]> {
    const { data, error } = await supabase
      .from('workspace_notes')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<WorkspaceNote | null> {
    const { data, error } = await supabase
      .from('workspace_notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(note: Tables['workspace_notes']['Insert']): Promise<WorkspaceNote> {
    const { data, error } = await supabase
      .from('workspace_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Tables['workspace_notes']['Update']): Promise<WorkspaceNote> {
    const { data, error } = await supabase
      .from('workspace_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Workspace Files API
export const workspaceFilesApi = {
  async getAll(memberId: string): Promise<WorkspaceFile[]> {
    const { data, error } = await supabase
      .from('workspace_files')
      .select('*')
      .eq('member_id', memberId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<WorkspaceFile | null> {
    const { data, error } = await supabase
      .from('workspace_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(file: Tables['workspace_files']['Insert']): Promise<WorkspaceFile> {
    const { data, error } = await supabase
      .from('workspace_files')
      .insert(file)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_files')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Workspace Data API
export const workspaceDataApi = {
  async getAll(memberId: string): Promise<WorkspaceData[]> {
    const { data, error } = await supabase
      .from('workspace_data')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<WorkspaceData | null> {
    const { data, error } = await supabase
      .from('workspace_data')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(data: Tables['workspace_data']['Insert']): Promise<WorkspaceData> {
    const { data: result, error } = await supabase
      .from('workspace_data')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async update(id: string, updates: Tables['workspace_data']['Update']): Promise<WorkspaceData> {
    const { data, error } = await supabase
      .from('workspace_data')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_data')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Projects API
export const projectsApi = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(project: Tables['projects']['Insert']): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Tables['projects']['Update']): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Departments API
export const departmentsApi = {
  async getAll(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(department: Tables['departments']['Insert']): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Tables['departments']['Update']): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Tasks API
export const tasksApi = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('title');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(task: Tables['tasks']['Insert']): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Tables['tasks']['Update']): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Members API (legacy support)
export const membersApi = {
  async getAll(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
};

// Messages API
export const messagesApi = {
  async getAll(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByChannel(channel: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel', channel)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(message: Tables['messages']['Insert']): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Profiles API
export const profilesApi = {
  async update(userId: string, profileData: Partial<Tables['profiles']['Update']>): Promise<Profile> {
    console.log('🔧 ProfilesAPI: Attempting to update profile for user:', userId);
    
    // First try to update existing profile
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      console.log('🆕 ProfilesAPI: Profile not found, creating new profile...');
      // Profile doesn't exist, create it with the update data
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          ...profileData,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newProfile;
    }

    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
};

// Settings API
export const settingsApi = {
  async get(): Promise<Tables['settings']['Row'] | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async update(updates: Tables['settings']['Update']): Promise<Tables['settings']['Row']> {
    // Get the first settings record or create one
    let { data: existing } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    if (!existing) {
      // Create default settings if none exist
      const { data: created, error: createError } = await supabase
        .from('settings')
        .insert({
          workspace_name: 'Clickers Workspace',
          theme: 'dark',
        })
        .select()
        .single();

      if (createError) throw createError;
      existing = created;
    }

    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', existing!.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
