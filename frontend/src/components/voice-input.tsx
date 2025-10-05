"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2, Globe, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRealtimeTranslation, PartialTranscription, AccumulatedTranscription, FinalTranscription } from "@/hooks/useRealtimeTranslation";
import { createClient } from '@supabase/supabase-js';
import { AISummaryModal } from "@/components/ai-summary-modal";

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

interface VoiceInputProps {
  userId?: string;
  visualizerBars?: number;
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export function VoiceInput({ userId, visualizerBars = 48 }: VoiceInputProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lectureTitle, setLectureTitle] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [partialTranscription, setPartialTranscription] = useState<PartialTranscription | null>(null);
  const [accumulatedTranscription, setAccumulatedTranscription] = useState<AccumulatedTranscription | null>(null);
  const [savedTranscriptions, setSavedTranscriptions] = useState<FinalTranscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [time, setTime] = useState(0);
  const [shouldStartRecording, setShouldStartRecording] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState<FinalTranscription | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('intermediate');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isRecording, isProcessing, startRecording, stopRecording } = useRealtimeTranslation({
    sessionId,
    targetLanguage,
    onPartialTranscription: (transcription) => {
      setPartialTranscription(transcription);
    },
    onAccumulatedUpdate: (transcription) => {
      setAccumulatedTranscription(transcription);
      setPartialTranscription(null);
    },
    onFinalTranscription: (transcription) => {
      setSavedTranscriptions(prev => [...prev, transcription]);
      setAccumulatedTranscription(null);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  // Auto-start recording when session is created
  useEffect(() => {
    if (sessionId && shouldStartRecording && !isRecording && !isProcessing) {
      setShouldStartRecording(false);
      startRecording();
    }
  }, [sessionId, shouldStartRecording, isRecording, isProcessing, startRecording]);

  // Timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRecording) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }
    return () => clearInterval(intervalId);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      await stopRecording();
    } else {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      // Create session on first click, then start recording
      if (!sessionId) {
        try {
          const title = lectureTitle.trim() || `Lecture ${new Date().toLocaleDateString()}`;
          const { data, error } = await supabase
            .from('lecture_sessions')
            .insert({
              user_id: userId,
              title,
              target_language: targetLanguage,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;
          
          // Set session ID and flag to start recording
          setSessionId(data.id);
          setShouldStartRecording(true);
        } catch (err: any) {
          setError(err.message || 'Failed to create session');
        }
      } else {
        // Session already exists, just start/resume recording
        startRecording();
      }
    }
  };

  const handleGenerateAISummary = (transcription: FinalTranscription) => {
    setSelectedTranscription(transcription);
    setShowAISummary(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Voice Input UI */}
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-4">
        {/* Microphone Button */}
        <button
          className={cn(
            "group w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-lg",
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-blue-500 hover:bg-blue-600 text-white",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
          type="button"
          onClick={handleMicClick}
          disabled={isProcessing || !userId}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>

        {/* Timer */}
        <span className="font-mono text-lg font-semibold text-muted-foreground">
          {formatTime(time)}
        </span>

        {/* Visualizer Bars */}
        <div className="h-6 w-80 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-300",
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : "bg-gray-300 h-2"
              )}
              style={
                isRecording && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : { height: '20%' }
              }
            />
          ))}
        </div>

        {/* Status Text */}
        <p className="text-sm text-muted-foreground font-medium">
          {isRecording ? "🔴 Recording..." : "Click microphone to start"}
        </p>

        {/* Lecture Title Input */}
        <div className="w-full max-w-md space-y-2">
          <Input
            placeholder="Lecture Title (optional)"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            disabled={isRecording}
            className="text-center"
          />
        </div>

        {/* Language Selector */}
        <div className="w-full max-w-md space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Globe className="h-4 w-4" />
            <span>Translate to:</span>
          </div>
          <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isRecording}>
            <SelectTrigger>
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
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Live Transcription Display */}
      {isRecording && (accumulatedTranscription || partialTranscription) && (
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Original Text */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Original (English)
                  </p>
                </div>
                <p className="text-base leading-relaxed">
                  {accumulatedTranscription?.originalText || ''}
                  {partialTranscription && (
                    <span className="italic text-muted-foreground">
                      {accumulatedTranscription ? ' ' : ''}{partialTranscription.originalText}
                    </span>
                  )}
                </p>
              </div>

              {/* Translated Text */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Translation ({LANGUAGES.find(l => l.code === targetLanguage)?.name})
                  </p>
                </div>
                <p className="text-base font-medium leading-relaxed text-primary">
                  {accumulatedTranscription?.translatedText || ''}
                  {partialTranscription && (
                    <span className="italic text-muted-foreground">
                      {accumulatedTranscription ? ' ' : ''}{partialTranscription.translatedText}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Transcriptions */}
      {savedTranscriptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">
            Saved Transcriptions ({savedTranscriptions.length})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {savedTranscriptions.map((transcription: FinalTranscription) => (
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
                    <div className="text-xs text-muted-foreground">
                      {new Date(transcription.timestamp).toLocaleString()}
                    </div>
                    {/* AI Summary Button - only show when transcript is saved */}
                    <div className="pt-3 border-t">
                      <Button
                        onClick={() => handleGenerateAISummary(transcription)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate AI Summary
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      <AISummaryModal
        isOpen={showAISummary}
        onClose={() => setShowAISummary(false)}
        content={selectedTranscription?.original_text || ''}
        level={difficultyLevel}
        onLevelChange={setDifficultyLevel}
      />
    </div>
  );
}
