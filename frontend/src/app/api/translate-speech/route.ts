import { NextRequest, NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { audioData, sessionId, sequenceNumber, targetLanguage } = await request.json();

    if (!audioData || !sessionId || sequenceNumber === undefined || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: audioData, sessionId, sequenceNumber, targetLanguage' },
        { status: 400 }
      );
    }

    // Validate Azure credentials
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      return NextResponse.json(
        { error: 'Azure Speech credentials not configured' },
        { status: 500 }
      );
    }

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    // Create Azure Speech Config
    const speechConfig = sdk.SpeechTranslationConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = 'en-US';
    speechConfig.addTargetLanguage(targetLanguage);
    
    // Configure for better recognition
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "3000");
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000");

    // Create audio format - WAV PCM 16kHz, 16-bit, mono
    const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(format);
    
    // Write audio data to stream
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    );
    
    console.log(`Processing audio chunk: ${arrayBuffer.byteLength} bytes`);
    pushStream.write(arrayBuffer);
    pushStream.close();
    
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    // Create translation recognizer
    const recognizer = new sdk.TranslationRecognizer(speechConfig, audioConfig);

    // Perform recognition
    const result = await new Promise<sdk.TranslationRecognitionResult>((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          recognizer.close();
          resolve(result);
        },
        (error) => {
          recognizer.close();
          reject(error);
        }
      );
    });

    // Check result
    if (result.reason === sdk.ResultReason.TranslatedSpeech) {
      const originalText = result.text;
      const translatedText = result.translations.get(targetLanguage);
      const confidenceScore = result.properties?.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult);

      // Parse confidence score if available
      let confidence = null;
      if (confidenceScore) {
        try {
          const jsonResult = JSON.parse(confidenceScore);
          confidence = jsonResult.NBest?.[0]?.Confidence || null;
        } catch (e) {
          console.warn('Could not parse confidence score:', e);
        }
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('transcriptions')
        .insert({
          session_id: sessionId,
          original_text: originalText,
          translated_text: translatedText || '',
          sequence_number: sequenceNumber,
          confidence_score: confidence,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving to Supabase:', error);
        return NextResponse.json(
          { error: 'Failed to save transcription', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        originalText,
        translatedText,
        confidence,
        transcription: data
      });
    } else if (result.reason === sdk.ResultReason.NoMatch) {
      return NextResponse.json({
        success: true,
        originalText: '',
        translatedText: '',
        message: 'No speech detected in this segment'
      });
    } else {
      const errorDetails = result.errorDetails;
      return NextResponse.json(
        { error: 'Speech recognition failed', details: errorDetails },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in translate-speech API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
