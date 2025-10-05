"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAzureTranslation, Transcription } from '@/hooks/useAzureTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh-Hans', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
];

interface TranslationSessionProps {
  userId: string;
}

export default function TranslationSession({ userId }: TranslationSessionProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const { isRecording, isProcessing, startRecording, stopRecording } = useAzureTranslation({
    sessionId,
    targetLanguage,
    onTranscription: (transcription) => {
      setTranscriptions(prev => [...prev, transcription]);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  // Subscribe to transcription updates from Supabase
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`transcriptions:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transcriptions',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newTranscription = payload.new as Transcription;
          setTranscriptions(prev => {
            // Avoid duplicates
            if (prev.some(t => t.id === newTranscription.id)) {
              return prev;
            }
            return [...prev, newTranscription];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const createSession = async () => {
    if (!sessionTitle.trim()) {
      setError('Please enter a session title');
      return;
    }

    setIsCreatingSession(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('lecture_sessions')
        .insert({
          user_id: userId,
          title: sessionTitle,
          target_language: targetLanguage,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setTranscriptions([]);
    } catch (err: any) {
      console.error('Error creating session:', err);
      setError(err.message || 'Failed to create session');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from('lecture_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      stopRecording();
      setSessionId(null);
      setSessionTitle('');
      setTranscriptions([]);
    } catch (err: any) {
      console.error('Error ending session:', err);
      setError(err.message || 'Failed to end session');
    }
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Lecture Translation</CardTitle>
          <CardDescription>
            Record lectures in English and get real-time translations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Setup */}
          {!sessionId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-title">Lecture Title</Label>
                <Input
                  id="session-title"
                  placeholder="e.g., Introduction to Computer Science"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-language">Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger id="target-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={createSession}
                disabled={isCreatingSession || !sessionTitle.trim()}
                className="w-full"
              >
                {isCreatingSession ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  'Start New Session'
                )}
              </Button>
            </div>
          )}

          {/* Recording Controls */}
          {sessionId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold">{sessionTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    Translating to {LANGUAGES.find(l => l.code === targetLanguage)?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRecordingToggle}
                    variant={isRecording ? 'destructive' : 'default'}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  <Button onClick={endSession} variant="outline">
                    End Session
                  </Button>
                </div>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing audio...
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Transcriptions Display */}
          {sessionId && transcriptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Transcriptions</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {transcriptions.map((transcription) => (
                  <Card key={transcription.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Original (English)</p>
                          <p className="text-sm">{transcription.original_text}</p>
                        </div>
                        <div className="border-t pt-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            Translation ({LANGUAGES.find(l => l.code === targetLanguage)?.name})
                          </p>
                          <p className="text-sm font-medium">{transcription.translated_text}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            {new Date(transcription.timestamp).toLocaleTimeString()}
                          </span>
                          {transcription.confidence_score && (
                            <span>
                              Confidence: {(transcription.confidence_score * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
