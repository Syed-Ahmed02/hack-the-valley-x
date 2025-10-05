import { useState, useRef, useCallback, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PartialTranscription {
  originalText: string;
  translatedText: string;
  timestamp: string;
}

export interface AccumulatedTranscription {
  originalText: string;
  translatedText: string;
  startedAt: string;
  lastUpdated: string;
}

export interface FinalTranscription {
  id: string;
  session_id: string;
  original_text: string;
  translated_text: string;
  timestamp: string;
  sequence_number: number;
  confidence_score: number | null;
}

export interface UseRealtimeTranslationProps {
  sessionId: string | null;
  targetLanguage: string;
  onPartialTranscription?: (transcription: PartialTranscription) => void;
  onAccumulatedUpdate?: (transcription: AccumulatedTranscription) => void;
  onFinalTranscription?: (transcription: FinalTranscription) => void;
  onError?: (error: string) => void;
}

export function useRealtimeTranslation({
  sessionId,
  targetLanguage,
  onPartialTranscription,
  onAccumulatedUpdate,
  onFinalTranscription,
  onError
}: UseRealtimeTranslationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognizerRef = useRef<sdk.TranslationRecognizer | null>(null);
  const sequenceNumberRef = useRef(0);
  const accumulatedOriginalRef = useRef<string>('');
  const accumulatedTranslatedRef = useRef<string>('');
  const startTimeRef = useRef<string>('');

  const saveAccumulatedTranscription = useCallback(async () => {
    if (!sessionId || !accumulatedOriginalRef.current.trim()) return;

    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .insert({
          session_id: sessionId,
          original_text: accumulatedOriginalRef.current.trim(),
          translated_text: accumulatedTranslatedRef.current.trim(),
          sequence_number: sequenceNumberRef.current++,
          confidence_score: null,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving transcription:', error);
        onError?.('Failed to save transcription');
      } else if (data) {
        onFinalTranscription?.(data as FinalTranscription);
        // Reset accumulated text
        accumulatedOriginalRef.current = '';
        accumulatedTranslatedRef.current = '';
      }
    } catch (error: any) {
      console.error('Error saving transcription:', error);
      onError?.('Failed to save transcription');
    }
  }, [sessionId, onError, onFinalTranscription]);

  const stopRecording = useCallback(async () => {
    if (recognizerRef.current && isRecording) {
      // Save accumulated transcription before stopping
      await saveAccumulatedTranscription();
      
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          console.log('Stopped continuous recognition');
          recognizerRef.current?.close();
          recognizerRef.current = null;
          setIsRecording(false);
          setIsProcessing(false);
        },
        (err) => {
          console.error('Error stopping recognition:', err);
          onError?.('Failed to stop recording');
          setIsRecording(false);
          setIsProcessing(false);
        }
      );
    }
  }, [isRecording, onError, saveAccumulatedTranscription]);


  const startRecording = useCallback(async () => {
    if (!sessionId) {
      onError?.('Please create a session first');
      return;
    }

    // Check if we have Azure credentials (they should be in env)
    const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      onError?.('Azure Speech credentials not configured. Add NEXT_PUBLIC_AZURE_SPEECH_KEY and NEXT_PUBLIC_AZURE_SPEECH_REGION to .env.local');
      return;
    }

    try {
      setIsProcessing(true);

      // Create Azure Speech Config
      const speechConfig = sdk.SpeechTranslationConfig.fromSubscription(speechKey, speechRegion);
      speechConfig.speechRecognitionLanguage = 'en-US';
      speechConfig.addTargetLanguage(targetLanguage);

      // Use microphone input
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.TranslationRecognizer(speechConfig, audioConfig);

      recognizerRef.current = recognizer;
      sequenceNumberRef.current = 0;

      // Handle recognizing events (partial/interim results)
      recognizer.recognizing = (s, e) => {
        if (e.result.reason === sdk.ResultReason.TranslatingSpeech) {
          const partial: PartialTranscription = {
            originalText: e.result.text,
            translatedText: e.result.translations.get(targetLanguage) || '',
            timestamp: new Date().toISOString()
          };
          
          console.log('Partial:', partial.originalText);
          onPartialTranscription?.(partial);
        }
      };

      // Handle recognized events (final results)
      recognizer.recognized = async (s, e) => {
        if (e.result.reason === sdk.ResultReason.TranslatedSpeech) {
          const originalText = e.result.text;
          const translatedText = e.result.translations.get(targetLanguage) || '';
          
          if (originalText.trim()) {
            console.log('Recognized:', originalText);

            // Append to accumulated text with a space
            if (accumulatedOriginalRef.current) {
              accumulatedOriginalRef.current += ' ' + originalText;
              accumulatedTranslatedRef.current += ' ' + translatedText;
            } else {
              accumulatedOriginalRef.current = originalText;
              accumulatedTranslatedRef.current = translatedText;
            }

            // Notify about accumulated update
            onAccumulatedUpdate?.({
              originalText: accumulatedOriginalRef.current,
              translatedText: accumulatedTranslatedRef.current,
              startedAt: startTimeRef.current,
              lastUpdated: new Date().toISOString()
            });
          }
        } else if (e.result.reason === sdk.ResultReason.NoMatch) {
          console.log('No speech detected');
        }
      };

      // Handle session stopped
      recognizer.sessionStopped = (s, e) => {
        console.log('Session stopped');
        setIsRecording(false);
        setIsProcessing(false);
      };

      // Handle cancellation
      recognizer.canceled = (s, e) => {
        console.error('Recognition canceled:', e.errorDetails);
        onError?.(`Recognition error: ${e.errorDetails}`);
        setIsRecording(false);
        setIsProcessing(false);
      };

      // Start continuous recognition
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log('Started continuous recognition');
          setIsRecording(true);
          setIsProcessing(false);
        },
        (err) => {
          console.error('Error starting recognition:', err);
          onError?.(`Failed to start recording: ${err}`);
          setIsProcessing(false);
        }
      );

    } catch (error: any) {
      console.error('Error starting recording:', error);
      onError?.(error.message || 'Failed to start recording');
      setIsProcessing(false);
    }
  }, [sessionId, targetLanguage, onPartialTranscription, onAccumulatedUpdate, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current && isRecording) {
        recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  };
}
  