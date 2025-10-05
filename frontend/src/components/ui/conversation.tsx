'use client';

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { useCallback, useState } from 'react';

export function Conversation() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Language options with their corresponding voice IDs (using verified public voices)
  const languageOptions = [
    { code: 'en', name: 'English', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Rachel
    { code: 'es', name: 'Spanish', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Spanish
    { code: 'fr', name: 'French', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for French
    { code: 'de', name: 'German', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for German
    { code: 'it', name: 'Italian', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Italian
    { code: 'pt', name: 'Portuguese', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Portuguese
    { code: 'pl', name: 'Polish', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Polish
    { code: 'tr', name: 'Turkish', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Turkish
    { code: 'ru', name: 'Russian', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Russian
    { code: 'nl', name: 'Dutch', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Dutch
    { code: 'cs', name: 'Czech', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Czech
    { code: 'ar', name: 'Arabic', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Arabic
    { code: 'zh', name: 'Chinese', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Chinese
    { code: 'ja', name: 'Japanese', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Japanese
    { code: 'hu', name: 'Hungarian', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Hungarian
    { code: 'ko', name: 'Korean', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // Use Rachel for Korean
  ];

  // Initialize ElevenLabs client
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
  });

  // Debug: Check if API key is loaded
  console.log('API Key loaded:', !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY);
  console.log('API Key length:', process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY?.length);

  const convertTextToSpeech = useCallback(async () => {
    if (!text.trim()) {
      alert('Please enter some text to convert to speech');
      return;
    }

    setIsLoading(true);
    try {
      // Get the selected language's voice ID
      const selectedLang = languageOptions.find(lang => lang.code === selectedLanguage);
      const voiceId = selectedLang?.voiceId || 'JBFqnCBsd6RMkjVDRZzb';

      console.log('Using voice ID:', voiceId);
      console.log('Selected language:', selectedLang?.name);

      // Convert text to speech using the ElevenLabs API
      const audio = await elevenlabs.textToSpeech.convert(voiceId, {
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
      
      // More detailed error handling
      let errorMessage = 'Failed to convert text to speech. ';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage += 'Invalid API key. Please check your ElevenLabs API key.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage += 'API key does not have permission. Please check your ElevenLabs subscription.';
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          errorMessage += 'Rate limit exceeded. Please try again later.';
        } else {
          errorMessage += `Error: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [text, elevenlabs, selectedLanguage, languageOptions]);

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
          <label htmlFor="language-select" className="block text-sm font-medium mb-2">
            Select Language:
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

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
    </div>
  );
}
