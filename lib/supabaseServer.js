import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey

export const supabaseServerEnabled = Boolean(supabaseUrl && supabaseKey)
export const supabaseServerHasServiceRole = Boolean(supabaseUrl && supabaseServiceRoleKey)

export function createRequestSupabaseClient(accessToken = '') {
  if (!supabaseServerEnabled) {
    return null
  }

  const trimmedAccessToken = String(accessToken || '').trim()
  const globalHeaders = trimmedAccessToken
    ? {
        Authorization: `Bearer ${trimmedAccessToken}`,
      }
    : undefined

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: globalHeaders ? { headers: globalHeaders } : undefined,
  })
}

export const supabaseServer = createRequestSupabaseClient('')
