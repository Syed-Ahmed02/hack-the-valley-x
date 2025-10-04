import { useState, useEffect } from 'react'
import { useUser as useAuth0User } from '@auth0/nextjs-auth0'

interface User {
  id: string
  auth0_id: string
  email: string | null
  name: string | null
  picture: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
}

export function useUser() {
  const { user: auth0User, isLoading: auth0Loading } = useAuth0User()
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync user data when Auth0 user changes
  useEffect(() => {
    if (auth0User && !auth0Loading) {
      syncUser()
    }
  }, [auth0User, auth0Loading])

  const syncUser = async () => {
    if (!auth0User) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to sync user data')
      }

      const data = await response.json()
      setSupabaseUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error syncing user:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    if (!auth0User) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get user data')
      }

      const data = await response.json()
      setSupabaseUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error getting user:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // Auth0 user data
    auth0User,
    auth0Loading,
    
    // Supabase user data
    user: supabaseUser,
    isLoading,
    error,
    
    // Actions
    syncUser,
    refreshUser,
    
    // Computed
    isAuthenticated: !!auth0User,
    isFullyLoaded: !auth0Loading && !isLoading && (!!supabaseUser || !auth0User)
  }
}
