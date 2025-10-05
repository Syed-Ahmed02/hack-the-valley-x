"use client";

import { VoiceInput } from "@/components/voice-input";
import { Conversation } from "@/components/ui/conversation";
import { EnglishTutor } from "@/components/ui/english-tutor";
import { VoiceAgent } from "@/components/ui/voice-agent";
import { useUser } from "@/hooks/useUser";
import {
  Mic,
  MessageSquare,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Transcription {
  id: string;
  session_id: string;
  original_text: string;
  translated_text: string;
  timestamp: string;
  sequence_number: number;
  confidence_score?: number;
}

interface Session {
  id: string;
  title: string;
  target_language: string;
  created_at: string;
  ended_at?: string;
  user_id: string;
}

interface LoadedSession {
  session: Session;
  transcriptions: Transcription[];
}

export default function Dashboard() {
  // Get authenticated user
  const { auth0User } = useUser();
  
  // Session loading state
  const [loadedSession, setLoadedSession] = useState<LoadedSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Function to load session data
  const loadSession = async (sessionId: string) => {
    setIsLoadingSession(true);
    setSessionError(null);
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to load session');
      }
      
      const data = await response.json();
      setLoadedSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      setSessionError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Function to clear loaded session
  const clearLoadedSession = () => {
    setLoadedSession(null);
    setSessionError(null);
  };

  // Listen for session selection events from sidebar
  useEffect(() => {
    const handleSessionSelect = (event: CustomEvent) => {
      const { sessionId } = event.detail;
      if (sessionId) {
        loadSession(sessionId);
      }
    };

    window.addEventListener('sessionSelect', handleSessionSelect as EventListener);
    
    return () => {
      window.removeEventListener('sessionSelect', handleSessionSelect as EventListener);
    };
  }, []);

  // If a session is loaded, show session details
  if (loadedSession) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Session Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearLoadedSession}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">{loadedSession.session.title}</h1>
              <p className="text-muted-foreground">
                Target Language: {loadedSession.session.target_language} • 
                Created: {new Date(loadedSession.session.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingSession && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Loading session data...</div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {sessionError && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-destructive">
                  Error loading session: {sessionError}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transcriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Session Transcriptions ({loadedSession.transcriptions.length})
              </CardTitle>
              <CardDescription>
                All transcriptions from this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loadedSession.transcriptions.length > 0 ? (
                  loadedSession.transcriptions.map((transcription, index) => (
                    <div key={transcription.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Sequence #{transcription.sequence_number}</span>
                        <span>{new Date(transcription.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <strong className="text-sm">Original:</strong>
                          <p className="text-sm">{transcription.original_text}</p>
                        </div>
                        <div>
                          <strong className="text-sm">Translated:</strong>
                          <p className="text-sm text-primary">{transcription.translated_text}</p>
                        </div>
                        {transcription.confidence_score && (
                          <div className="text-xs text-muted-foreground">
                            Confidence: {(transcription.confidence_score * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No transcriptions found for this session.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Lingo Lift</h1>
          <p className="text-lg text-muted-foreground">
            Transform your study materials into your preferred language
          </p>
        </div>

        {/* Voice Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Record Audio Lecture
            </CardTitle>
            <CardDescription>
              Record or upload audio lectures to transcribe and translate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceInput userId={auth0User?.sub} />
          </CardContent>
        </Card>

        {/* Text-to-Speech Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Text-to-Speech Converter
            </CardTitle>
            <CardDescription>
              Convert any text to speech in multiple languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Conversation />
          </CardContent>
        </Card>

        {/* Interactive Voice Agent Section */}
        <VoiceAgent />
      </div>
    </div>
  );
}