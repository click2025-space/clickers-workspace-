// Edge Function: projects
// Copy this to Supabase Dashboard > Edge Functions > Create Function > Name: "projects"

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
    
    // GET /projects - Get all projects
    if (method === 'GET' && pathSegments.length === 1) {
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .order('name')

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /projects - Create new project
    if (method === 'POST' && pathSegments.length === 1) {
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('projects')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /projects/:id - Get specific project
    if (method === 'GET' && pathSegments.length === 2) {
      const projectId = pathSegments[1]
      
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /projects/:id - Update project
    if (method === 'PUT' && pathSegments.length === 2) {
      const projectId = pathSegments[1]
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('projects')
        .update(body)
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /projects/:id - Delete project
    if (method === 'DELETE' && pathSegments.length === 2) {
      const projectId = pathSegments[1]
      
      const { error } = await supabaseClient
        .from('projects')
        .delete()
        .eq('id', projectId)

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
