'use client';

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, Volume2, Languages } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Volume2 className="h-6 w-6 text-primary" />
          Text to Speech Converter
        </h2>
        <p className="text-muted-foreground">
          Convert any text to speech in multiple languages
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language-select" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Select Language
          </Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text-input">
            Enter text to convert to speech
          </Label>
          <Textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            className="min-h-[120px] resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={convertTextToSpeech}
            disabled={isLoading || !text.trim()}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                Convert to Speech
              </>
            )}
          </Button>
          
          {audioUrl && (
            <>
              <Button
                onClick={playAudio}
                disabled={isPlaying}
                variant="secondary"
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play Audio
                  </>
                )}
              </Button>
              <Button
                onClick={clearAudio}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Audio generated successfully!</p>
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
            </CardContent>
          </Card>
        )}

        {/* Loading Status */}
        {isLoading && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium">Converting text to speech...</span>
            </div>
          </div>
        )}
      </div>      
    </div>
  );
}
