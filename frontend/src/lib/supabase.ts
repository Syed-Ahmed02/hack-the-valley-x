import { createClient } from '@supabase/supabase-js'
import { auth0 } from './auth0'

// Create Supabase client for server-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

// Create Supabase client for client-side operations
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper function to get user data from Auth0 and sync to Supabase
export async function syncUserToSupabase() {
  try {
    const session = await auth0.getSession()
    if (!session?.user) {
      throw new Error('No authenticated user found')
    }

    const user = session.user
    const auth0Id = user.sub

    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError
    }

    const userData = {
      auth0_id: auth0Id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      email_verified: user.email_verified || false,
      updated_at: new Date().toISOString()
    }

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('auth0_id', auth0Id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error syncing user to Supabase:', error)
    throw error
  }
}

// Helper function to get user from Supabase by Auth0 ID
export async function getUserFromSupabase(auth0Id: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user from Supabase:', error)
    throw error
  }
}