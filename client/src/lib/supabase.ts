import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cpudsxgkianuajouowiw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdWRzeGdraWFudWFqb3Vvd2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjc2NjEsImV4cCI6MjA3NjY0MzY2MX0.Xcb-goryTxFeuSBVTOC_r_fYFO1juoeLA0vHGryWHF0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (generated from your schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          bio: string | null
          role: string | null
          department: string | null
          avatar: string | null
          phone: string | null
          location: string | null
          skills: string[] | null
          is_onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          bio?: string | null
          role?: string | null
          department?: string | null
          avatar?: string | null
          phone?: string | null
          location?: string | null
          skills?: string[] | null
          is_onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          bio?: string | null
          role?: string | null
          department?: string | null
          avatar?: string | null
          phone?: string | null
          location?: string | null
          skills?: string[] | null
          is_onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workspace_notes: {
        Row: {
          id: string
          member_id: string
          title: string
          content: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          title: string
          content: string
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          title?: string
          content?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspace_files: {
        Row: {
          id: string
          member_id: string
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          member_id: string
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          file_path?: string
          uploaded_at?: string
        }
      }
      workspace_data: {
        Row: {
          id: string
          member_id: string
          key: string
          value: string
          data_type: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          key: string
          value: string
          data_type?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          key?: string
          value?: string
          data_type?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          progress: number
          department: string
          team_members: string[]
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          progress?: number
          department: string
          team_members?: string[]
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          progress?: number
          department?: string
          team_members?: string[]
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          team_members: string[]
          icon: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          team_members?: string[]
          icon: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          team_members?: string[]
          icon?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          assigned_to: string | null
          due_date: string | null
          project_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          project_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          project_id?: string | null
        }
      }
      members: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          department: string
          avatar: string | null
          status: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: string
          department: string
          avatar?: string | null
          status?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          department?: string
          avatar?: string | null
          status?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          channel: string
          timestamp: string
        }
        Insert: {
          id?: string
          content: string
          sender_id: string
          channel: string
          timestamp?: string
        }
        Update: {
          id?: string
          content?: string
          sender_id?: string
          channel?: string
          timestamp?: string
        }
      }
      settings: {
        Row: {
          id: string
          workspace_name: string
          theme: string
        }
        Insert: {
          id?: string
          workspace_name?: string
          theme?: string
        }
        Update: {
          id?: string
          workspace_name?: string
          theme?: string
        }
      }
    }
  }
}
