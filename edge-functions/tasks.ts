// Edge Function: tasks
// Copy this to Supabase Dashboard > Edge Functions > Create Function > Name: "tasks"

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
    
    // GET /tasks - Get all tasks
    if (method === 'GET' && pathSegments.length === 1) {
      const { data, error } = await supabaseClient
        .from('tasks')
        .select('*')
        .order('title')

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /tasks - Create new task
    if (method === 'POST' && pathSegments.length === 1) {
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('tasks')
        .insert(body)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /tasks/:id - Get specific task
    if (method === 'GET' && pathSegments.length === 2) {
      const taskId = pathSegments[1]
      
      const { data, error } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /tasks/:id - Update task
    if (method === 'PUT' && pathSegments.length === 2) {
      const taskId = pathSegments[1]
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('tasks')
        .update(body)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH /tasks/:id - Partial update task (for status changes, etc.)
    if (method === 'PATCH' && pathSegments.length === 2) {
      const taskId = pathSegments[1]
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('tasks')
        .update(body)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /tasks/:id - Delete task
    if (method === 'DELETE' && pathSegments.length === 2) {
      const taskId = pathSegments[1]
      
      const { error } = await supabaseClient
        .from('tasks')
        .delete()
        .eq('id', taskId)

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
