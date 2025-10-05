import { useState, useRef, useCallback, useEffect } from 'react';
import { convertToWav } from '@/utils/audioConverter';

export interface Transcription {
  id: string;
  session_id: string;
  original_text: string;
  translated_text: string;
  timestamp: string;
  sequence_number: number;
  confidence_score: number | null;
}

export interface UseAzureTranslationProps {
  sessionId: string | null;
  targetLanguage: string;
  onTranscription?: (transcription: Transcription) => void;
  onError?: (error: string) => void;
}

export function useAzureTranslation({
  sessionId,
  targetLanguage,
  onTranscription,
  onError
}: UseAzureTranslationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sequenceNumberRef = useRef(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording]);

  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    if (!sessionId) {
      onError?.('No active session');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert audio to WAV format that Azure expects
      console.log('Converting audio blob to WAV format...');
      const wavBuffer = await convertToWav(audioBlob);
      
      // Convert WAV to base64
      const base64Audio = Buffer.from(wavBuffer).toString('base64');
      console.log(`Converted audio size: ${base64Audio.length} bytes`);

      // Send to API
      const response = await fetch('/api/translate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          sessionId,
          sequenceNumber: sequenceNumberRef.current++,
          targetLanguage
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process audio');
      }

      if (result.transcription) {
        onTranscription?.(result.transcription);
      }
    } catch (error: any) {
      console.error('Error processing audio chunk:', error);
      onError?.(error.message || 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, targetLanguage, onTranscription, onError]);

  const startRecording = useCallback(async () => {
    if (!sessionId) {
      onError?.('Please create a session first');
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 16000
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      sequenceNumberRef.current = 0;

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Process when chunk is complete
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          await processAudioChunk(audioBlob);
          audioChunksRef.current = [];
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Set up interval to stop and restart recording every 5 seconds
      // (Longer chunks give Azure more audio to work with)
      intervalIdRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          
          // Wait a bit then restart
          setTimeout(() => {
            if (mediaRecorderRef.current && isRecording) {
              audioChunksRef.current = [];
              mediaRecorderRef.current.start();
            }
          }, 100);
        }
      }, 5000);

    } catch (error: any) {
      console.error('Error starting recording:', error);
      onError?.(error.message || 'Failed to start recording');
    }
  }, [sessionId, processAudioChunk, onError, isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
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
