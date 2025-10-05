import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/sessions called');
    
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
          message: 'Please log in first to get sessions'
        },
        { status: 401 }
      );
    }

    const auth0Id = session.user.sub;
    console.log('Fetching sessions for Auth0 user ID:', auth0Id);

    // Get user's recent sessions from Supabase
    const { data: sessions, error } = await supabase
      .from('lecture_sessions')
      .select('id, title, target_language, created_at, ended_at')
      .eq('user_id', auth0Id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error getting sessions from Supabase:', error);
      return NextResponse.json(
        { 
          error: 'Failed to get sessions',
          details: error.message
        },
        { status: 500 }
      );
    }

    // For each session, get the first transcription to show preview
    const sessionsWithPreview = await Promise.all(
      (sessions || []).map(async (session) => {
        const { data: firstTranscription } = await supabase
          .from('transcriptions')
          .select('original_text')
          .eq('session_id', session.id)
          .order('sequence_number', { ascending: true })
          .limit(1)
          .single();

        return {
          ...session,
          preview_text: firstTranscription?.original_text || session.title
        };
      })
    );

    console.log('Sessions retrieved:', sessionsWithPreview?.length || 0);
    
    return NextResponse.json({
      success: true,
      sessions: sessionsWithPreview || []
    });
  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
