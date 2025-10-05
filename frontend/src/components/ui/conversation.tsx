'use client';

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { useCallback, useState } from 'react';

export function Conversation() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize ElevenLabs client
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
  });

  const convertTextToSpeech = useCallback(async () => {
    if (!text.trim()) {
      alert('Please enter some text to convert to speech');
      return;
    }

    setIsLoading(true);
    try {
      // Convert text to speech using the ElevenLabs API
      const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
        text: text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      });

      // Convert the audio stream to a blob URL for playback
      const audioArrayBuffer = await new Response(audio).arrayBuffer();
      const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Play the audio automatically
      const audioElement = new Audio(url);
      audioElement.volume = 0.8;
      
      audioElement.onplay = () => setIsPlaying(true);
      audioElement.onended = () => setIsPlaying(false);
      audioElement.onpause = () => setIsPlaying(false);
      
      await audioElement.play();
    } catch (error) {
      console.error('Failed to convert text to speech:', error);
      alert('Failed to convert text to speech. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [text, elevenlabs]);

  const playAudio = useCallback(() => {
    if (audioUrl) {
      const audioElement = new Audio(audioUrl);
      audioElement.volume = 0.8;
      
      audioElement.onplay = () => setIsPlaying(true);
      audioElement.onended = () => setIsPlaying(false);
      audioElement.onpause = () => setIsPlaying(false);
      
      audioElement.play();
    }
  }, [audioUrl]);

  const clearAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsPlaying(false);
    }
  }, [audioUrl]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center">Text to Speech Converter</h2>
      
      <div className="w-full space-y-4">
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium mb-2">
            Enter text to convert to speech:
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={convertTextToSpeech}
            disabled={isLoading || !text.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Converting...' : 'Convert to Speech'}
          </button>
          
          {audioUrl && (
            <>
              <button
                onClick={playAudio}
                disabled={isPlaying}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </button>
              <button
                onClick={clearAudio}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {audioUrl && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Audio generated successfully!</p>
            <audio 
              controls 
              className="w-full max-w-md"
              onPlay={() => setIsPlaying(true)}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Status Display */}
        {isLoading && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Converting text to speech...</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 text-center space-y-1">
        <p>Using ElevenLabs JS SDK</p>
        <p>Voice: JBFqnCBsd6RMkjVDRZzb | Model: eleven_multilingual_v2</p>
        <p>Direct Text-to-Speech (No agent required)</p>
        <p className="text-orange-600 font-medium">
          ⚠️ Note: Make sure to set your NEXT_PUBLIC_ELEVENLABS_API_KEY environment variable
        </p>
      </div>
    </div>
  );
}
