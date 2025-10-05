import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/sessions/${params.id} called`);
    
    // Get the current session from Auth0
    let session;
    try {
      session = await auth0.getSession();
      console.log('Auth0 session:', session ? 'exists' : 'null');
      if (session?.user) {
        console.log('User ID:', session.user.sub);
      }
    } catch (sessionError) {
      console.error('Error getting Auth0 session:', sessionError);
      return NextResponse.json(
        { 
          error: 'Failed to get session',
          details: sessionError instanceof Error ? sessionError.message : 'Unknown session error'
        },
        { status: 401 }
      );
    }
    
    if (!session?.user) {
      console.log('No authenticated user found');
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          message: 'Please log in first to get session details'
        },
        { status: 401 }
      );
    }

    const auth0Id = session.user.sub;
    const sessionId = params.id;
    
    console.log('Fetching session details for:', { sessionId, auth0Id });

    // Get session details
    const { data: sessionData, error: sessionError } = await supabase
      .from('lecture_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', auth0Id) // Ensure user can only access their own sessions
      .single();

    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return NextResponse.json(
        { 
          error: 'Session not found or access denied',
          details: sessionError.message
        },
        { status: 404 }
      );
    }

    // Get all transcriptions for this session
    const { data: transcriptions, error: transcriptionsError } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence_number', { ascending: true });

    if (transcriptionsError) {
      console.error('Error getting transcriptions:', transcriptionsError);
      return NextResponse.json(
        { 
          error: 'Failed to get transcriptions',
          details: transcriptionsError.message
        },
        { status: 500 }
      );
    }

    console.log('Session details retrieved:', { 
      sessionId, 
      transcriptionsCount: transcriptions?.length || 0 
    });
    
    return NextResponse.json({
      success: true,
      session: sessionData,
      transcriptions: transcriptions || []
    });
  } catch (error) {
    console.error('Error in session details API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get session details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
