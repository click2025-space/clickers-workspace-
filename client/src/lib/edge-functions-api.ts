// Updated API client to use Supabase Edge Functions
import { supabase } from './supabase';

const EDGE_FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// Helper function to make authenticated requests to Edge Functions
async function edgeRequest(functionName: string, path: string = '', options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  const url = `${EDGE_FUNCTIONS_URL}/${functionName}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Edge Function error: ${error}`);
  }

  return response.json();
}

// Workspace Notes API
export const workspaceNotesApi = {
  async getAll(): Promise<any[]> {
    return edgeRequest('workspace-notes');
  },

  async getById(id: string): Promise<any> {
    return edgeRequest('workspace-notes', `/${id}`);
  },

  async create(note: any): Promise<any> {
    return edgeRequest('workspace-notes', '', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  },

  async update(id: string, updates: any): Promise<any> {
    return edgeRequest('workspace-notes', `/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    await edgeRequest('workspace-notes', `/${id}`, {
      method: 'DELETE',
    });
  },
};

// Workspace Files API
export const workspaceFilesApi = {
  async getAll(): Promise<any[]> {
    return edgeRequest('workspace-files');
  },

  async getById(id: string): Promise<any> {
    return edgeRequest('workspace-files', `/${id}`);
  },

  async create(file: any): Promise<any> {
    return edgeRequest('workspace-files', '', {
      method: 'POST',
      body: JSON.stringify(file),
    });
  },

  async delete(id: string): Promise<void> {
    await edgeRequest('workspace-files', `/${id}`, {
      method: 'DELETE',
    });
  },
};

// Workspace Data API
export const workspaceDataApi = {
  async getAll(): Promise<any[]> {
    return edgeRequest('workspace-data');
  },

  async getById(id: string): Promise<any> {
    return edgeRequest('workspace-data', `/${id}`);
  },

  async create(data: any): Promise<any> {
    return edgeRequest('workspace-data', '', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, updates: any): Promise<any> {
    return edgeRequest('workspace-data', `/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    await edgeRequest('workspace-data', `/${id}`, {
      method: 'DELETE',
    });
  },
};

// Projects API
export const projectsApi = {
  async getAll(): Promise<any[]> {
    return edgeRequest('projects');
  },

  async getById(id: string): Promise<any> {
    return edgeRequest('projects', `/${id}`);
  },

  async create(project: any): Promise<any> {
    return edgeRequest('projects', '', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  async update(id: string, updates: any): Promise<any> {
    return edgeRequest('projects', `/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    await edgeRequest('projects', `/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tasks API
export const tasksApi = {
  async getAll(): Promise<any[]> {
    return edgeRequest('tasks');
  },

  async getById(id: string): Promise<any> {
    return edgeRequest('tasks', `/${id}`);
  },

  async create(task: any): Promise<any> {
    return edgeRequest('tasks', '', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async update(id: string, updates: any): Promise<any> {
    return edgeRequest('tasks', `/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async patch(id: string, updates: any): Promise<any> {
    return edgeRequest('tasks', `/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    await edgeRequest('tasks', `/${id}`, {
      method: 'DELETE',
    });
  },
};

// Messages API
export const messagesApi = {
  async getAll(channel: string = 'general'): Promise<any[]> {
    return edgeRequest('messages', `?channel=${channel}`);
  },

  async getByChannel(channel: string): Promise<any[]> {
    return edgeRequest('messages', `?channel=${channel}`);
  },

  async getById(id: string): Promise<any> {
    return edgeRequest('messages', `/${id}`);
  },

  async create(message: any): Promise<any> {
    return edgeRequest('messages', '', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },

  async delete(id: string): Promise<void> {
    await edgeRequest('messages', `/${id}`, {
      method: 'DELETE',
    });
  },
};

// Keep the profiles API as is since it uses direct Supabase client
export const profilesApi = {
  async update(userId: string, profileData: any): Promise<any> {
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

  async getByUserId(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
};
