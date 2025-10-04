'use client'

import { useUser } from '@auth0/nextjs-auth0'
import { useState } from 'react'

export default function TestUserPage() {
  const { user, isLoading, error } = useUser()
  const [apiResult, setApiResult] = useState<any>(null)
  const [isLoadingApi, setIsLoadingApi] = useState(false)

  const testSyncUser = async () => {
    setIsLoadingApi(true)
    setApiResult(null)

    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setApiResult(data)
    } catch (error) {
      setApiResult({ 
        error: 'Network error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setIsLoadingApi(false)
    }
  }

  const testGetUser = async () => {
    setIsLoadingApi(true)
    setApiResult(null)

    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setApiResult(data)
    } catch (error) {
      setApiResult({ 
        error: 'Network error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setIsLoadingApi(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">User Test Page</h1>
        <p>Loading Auth0 user...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">User Test Page</h1>
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">User Test Page</h1>
        <p>Please log in to test user sync.</p>
        <a 
          href="/api/auth/login" 
          className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Log In
        </a>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-6">User Test Page</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Auth0 User Data</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">API Tests</h2>
          <div className="space-x-4 mb-4">
            <button
              onClick={testSyncUser}
              disabled={isLoadingApi}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
            >
              {isLoadingApi ? 'Syncing...' : 'Sync User to Supabase'}
            </button>
            
            <button
              onClick={testGetUser}
              disabled={isLoadingApi}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 hover:bg-green-600"
            >
              {isLoadingApi ? 'Loading...' : 'Get User from Supabase'}
            </button>
          </div>

          {apiResult && (
            <div>
              <h3 className="font-medium mb-2">API Response:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you're logged in (you should see user data above)</li>
            <li>Click "Sync User to Supabase" to create/update your user record</li>
            <li>Click "Get User from Supabase" to retrieve your user data</li>
            <li>Check the console logs in your terminal for detailed debugging info</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
