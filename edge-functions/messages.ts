// Edge Function: messages
// Copy this to Supabase Dashboard > Edge Functions > Create Function > Name: "messages"

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
    const searchParams = url.searchParams
    
    // GET /messages?channel=general - Get messages by channel
    if (method === 'GET' && pathSegments.length === 1) {
      const channel = searchParams.get('channel') || 'general'
      
      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('channel', channel)
        .order('timestamp', { ascending: true })
        .limit(100) // Limit to last 100 messages

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /messages - Send new message
    if (method === 'POST' && pathSegments.length === 1) {
      const body = await req.json()
      
      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          ...body,
          sender_id: user.id,
          timestamp: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /messages/:id - Get specific message
    if (method === 'GET' && pathSegments.length === 2) {
      const messageId = pathSegments[1]
      
      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /messages/:id - Delete message (only sender can delete)
    if (method === 'DELETE' && pathSegments.length === 2) {
      const messageId = pathSegments[1]
      
      const { error } = await supabaseClient
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id)

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
