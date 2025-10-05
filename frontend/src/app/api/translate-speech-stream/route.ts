import { NextRequest } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// This endpoint is for starting a continuous recognition session
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { targetLanguage } = await request.json();

    // Validate Azure credentials
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      return new Response(
        encoder.encode(JSON.stringify({ error: 'Azure Speech credentials not configured' })),
        { status: 500 }
      );
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Create Azure Speech Config
          const speechConfig = sdk.SpeechTranslationConfig.fromSubscription(speechKey, speechRegion);
          speechConfig.speechRecognitionLanguage = 'en-US';
          speechConfig.addTargetLanguage(targetLanguage);

          // Use microphone input (this won't work on server-side)
          // We'll need to handle this differently
          const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
          const recognizer = new sdk.TranslationRecognizer(speechConfig, audioConfig);

          // Handle recognizing events (partial results)
          recognizer.recognizing = (s, e) => {
            if (e.result.reason === sdk.ResultReason.TranslatingSpeech) {
              const partial = {
                type: 'partial',
                originalText: e.result.text,
                translatedText: e.result.translations.get(targetLanguage) || '',
                timestamp: new Date().toISOString()
              };
              
              const data = `data: ${JSON.stringify(partial)}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          };

          // Handle recognized events (final results)
          recognizer.recognized = (s, e) => {
            if (e.result.reason === sdk.ResultReason.TranslatedSpeech) {
              const final = {
                type: 'final',
                originalText: e.result.text,
                translatedText: e.result.translations.get(targetLanguage) || '',
                timestamp: new Date().toISOString()
              };
              
              const data = `data: ${JSON.stringify(final)}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          };

          // Handle errors
          recognizer.canceled = (s, e) => {
            const error = {
              type: 'error',
              message: e.errorDetails,
              timestamp: new Date().toISOString()
            };
            
            const data = `data: ${JSON.stringify(error)}\n\n`;
            controller.enqueue(encoder.encode(data));
            
            recognizer.stopContinuousRecognitionAsync();
            controller.close();
          };

          // Start continuous recognition
          recognizer.startContinuousRecognitionAsync(
            () => {
              console.log('Continuous recognition started');
            },
            (err) => {
              console.error('Error starting recognition:', err);
              controller.close();
            }
          );

          // Keep connection alive
          const keepAlive = setInterval(() => {
            controller.enqueue(encoder.encode(': keepalive\n\n'));
          }, 30000);

          // Cleanup on close
          request.signal.addEventListener('abort', () => {
            clearInterval(keepAlive);
            recognizer.stopContinuousRecognitionAsync();
            recognizer.close();
            controller.close();
          });

        } catch (error: any) {
          const errorMsg = {
            type: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMsg)}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Error in stream endpoint:', error);
    return new Response(
      encoder.encode(JSON.stringify({ error: 'Internal server error', details: error.message })),
      { status: 500 }
    );
  }
}
