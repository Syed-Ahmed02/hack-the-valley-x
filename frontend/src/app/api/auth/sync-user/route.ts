import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/auth/sync-user called')
    
    // Get the current session from Auth0
    // In App Router API routes, call getSession() without arguments
    let session
    try {
      session = await auth0.getSession()
      console.log('Auth0 session:', session ? 'exists' : 'null')
      if (session?.user) {
        console.log('User ID:', session.user.sub)
      }
    } catch (sessionError) {
      console.error('Error getting Auth0 session:', sessionError)
      return NextResponse.json(
        { 
          error: 'Failed to get session',
          details: sessionError instanceof Error ? sessionError.message : 'Unknown session error'
        },
        { status: 401 }
      )
    }
    
    if (!session?.user) {
      console.log('No authenticated user found')
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          message: 'Please log in first to sync user data'
        },
        { status: 401 }
      )
    }

    const user = session.user
    const auth0Id = user.sub
    console.log('Auth0 user ID:', auth0Id)

    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single()

    console.log('Existing user query result:', { existingUser, selectError })

    const userData = {
      auth0_id: auth0Id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      email_verified: user.email_verified || false,
      updated_at: new Date().toISOString()
    }

    let result
    if (existingUser) {
      // Update existing user
      console.log('Updating existing user')
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('auth0_id', auth0Id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        throw error
      }
      result = data
    } else {
      // Create new user
      console.log('Creating new user')
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        throw error
      }
      result = data
    }

    console.log('User sync successful:', result)
    
    return NextResponse.json({
      success: true,
      user: result
    })
  } catch (error) {
    console.error('Error in sync-user API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/auth/sync-user called')
    
    // Get the current session from Auth0
    // In App Router API routes, call getSession() without arguments
    let session
    try {
      session = await auth0.getSession()
      console.log('Auth0 session:', session ? 'exists' : 'null')
      if (session?.user) {
        console.log('User ID:', session.user.sub)
      }
    } catch (sessionError) {
      console.error('Error getting Auth0 session:', sessionError)
      return NextResponse.json(
        { 
          error: 'Failed to get session',
          details: sessionError instanceof Error ? sessionError.message : 'Unknown session error'
        },
        { status: 401 }
      )
    }
    
    if (!session?.user) {
      console.log('No authenticated user found')
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          message: 'Please log in first to get user data'
        },
        { status: 401 }
      )
    }

    // Get user data from Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (error) {
      console.error('Error getting user from Supabase:', error)
      throw error
    }

    console.log('User data retrieved:', userData)
    
    return NextResponse.json({
      success: true,
      user: userData
    })
  } catch (error) {
    console.error('Error in get-user API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
