// Edge Function: workspace-notes
// Copy this to Supabase Dashboard > Edge Functions > Create Function > Name: "workspace-notes"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const method = req.method
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    // GET /workspace-notes - Get all notes for user
    if (method === 'GET' && pathSegments.length === 1) {
      const { data, error } = await supabaseClient
        .from('workspace_notes')
        .select('*')
        .eq('member_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /workspace-notes - Create new note
    if (method === 'POST' && pathSegments.length === 1) {
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('workspace_notes')
        .insert({
          ...body,
          member_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /workspace-notes/:id - Get specific note
    if (method === 'GET' && pathSegments.length === 2) {
      const noteId = pathSegments[1]
      
      const { data, error } = await supabaseClient
        .from('workspace_notes')
        .select('*')
        .eq('id', noteId)
        .eq('member_id', user.id)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /workspace-notes/:id - Update note
    if (method === 'PUT' && pathSegments.length === 2) {
      const noteId = pathSegments[1]
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('workspace_notes')
        .update(body)
        .eq('id', noteId)
        .eq('member_id', user.id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /workspace-notes/:id - Delete note
    if (method === 'DELETE' && pathSegments.length === 2) {
      const noteId = pathSegments[1]
      
      const { error } = await supabaseClient
        .from('workspace_notes')
        .delete()
        .eq('id', noteId)
        .eq('member_id', user.id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
