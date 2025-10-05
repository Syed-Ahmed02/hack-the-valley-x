'use client';

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { useCallback, useState } from 'react';
import { MessageSquare, Mic, Volume2, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';

export function EnglishTutor() {
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'tutor';
    message: string;
    timestamp: Date;
  }>>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Initialize ElevenLabs client
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
  });

  // ESL-focused tutor responses
  const getTutorResponse = useCallback((userInput: string): string => {
    const input = userInput.toLowerCase().trim();
    
    // Greeting responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm your English tutor. I'm here to help you improve your English skills. What would you like to practice today? We can work on grammar, vocabulary, pronunciation, or have a conversation!";
    }
    
    // Grammar help
    if (input.includes('grammar') || input.includes('tense') || input.includes('verb')) {
      return "Great! Let's work on grammar. Can you tell me what specific grammar topic you'd like help with? For example, we could practice present tense, past tense, future tense, or sentence structure. What would you like to focus on?";
    }
    
    // Vocabulary help
    if (input.includes('word') || input.includes('vocabulary') || input.includes('meaning')) {
      return "Vocabulary building is essential for English learning! I can help you with word meanings, synonyms, antonyms, and how to use words in sentences. What word or topic would you like to explore?";
    }
    
    // Pronunciation help
    if (input.includes('pronunciation') || input.includes('pronounce') || input.includes('sound')) {
      return "Pronunciation is important for clear communication! I can help you with difficult sounds, word stress, and intonation. What specific pronunciation challenge are you facing?";
    }
    
    // Conversation practice
    if (input.includes('conversation') || input.includes('talk') || input.includes('speak')) {
      return "Conversation practice is the best way to improve your English! Let's have a natural conversation. I'll help you with corrections and suggestions. What would you like to talk about?";
    }
    
    // Error correction
    if (input.includes('correct') || input.includes('mistake') || input.includes('error')) {
      return "Don't worry about making mistakes - they're part of learning! I'll help you identify and correct errors. Feel free to write or speak, and I'll provide gentle corrections and explanations.";
    }
    
    // General encouragement
    if (input.includes('help') || input.includes('difficult') || input.includes('hard')) {
      return "I'm here to support you! English learning can be challenging, but with practice, you'll improve. What specific area would you like help with? Remember, every mistake is a learning opportunity!";
    }
    
    // Default response for other inputs
    return `That's interesting! "${userInput}" - Let me help you with that. Could you tell me more about what you'd like to learn or practice? I can help with grammar, vocabulary, pronunciation, or we can have a conversation to practice your English skills.`;
  }, []);

  const convertTextToSpeech = useCallback(async (text: string) => {
    try {
      const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
        text: text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      });

      const audioArrayBuffer = await new Response(audio).arrayBuffer();
      const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      
      return url;
    } catch (error) {
      console.error('Failed to convert text to speech:', error);
      return null;
    }
  }, [elevenlabs]);

  const handleSendMessage = useCallback(async () => {
    if (!userMessage.trim()) return;

    const userMsg = userMessage.trim();
    setUserMessage('');
    setIsLoading(true);

    // Add user message to history
    const newHistory = [...conversationHistory, {
      role: 'user' as const,
      message: userMsg,
      timestamp: new Date()
    }];

    // Get tutor response
    const tutorResponse = getTutorResponse(userMsg);
    
    // Add tutor response to history
    const updatedHistory = [...newHistory, {
      role: 'tutor' as const,
      message: tutorResponse,
      timestamp: new Date()
    }];

    setConversationHistory(updatedHistory);

    // Convert tutor response to speech
    const audioUrl = await convertTextToSpeech(tutorResponse);
    if (audioUrl) {
      setCurrentAudioUrl(audioUrl);
      
      // Auto-play the tutor's response
      const audioElement = new Audio(audioUrl);
      audioElement.volume = 0.8;
      
      audioElement.onplay = () => setIsPlaying(true);
      audioElement.onended = () => setIsPlaying(false);
      audioElement.onpause = () => setIsPlaying(false);
      
      await audioElement.play();
    }

    setIsLoading(false);
  }, [userMessage, conversationHistory, getTutorResponse, convertTextToSpeech]);

  const playTutorResponse = useCallback(async () => {
    if (currentAudioUrl) {
      const audioElement = new Audio(currentAudioUrl);
      audioElement.volume = 0.8;
      
      audioElement.onplay = () => setIsPlaying(true);
      audioElement.onended = () => setIsPlaying(false);
      audioElement.onpause = () => setIsPlaying(false);
      
      await audioElement.play();
    }
  }, [currentAudioUrl]);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }
    setIsPlaying(false);
  }, [currentAudioUrl]);

  const quickStartPrompts = [
    "Help me with grammar",
    "Practice conversation",
    "Vocabulary building",
    "Pronunciation help"
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">AI English Tutor</h2>
      </div>
      
      {/* Quick Start Prompts */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Quick start:</p>
        <div className="flex flex-wrap gap-2">
          {quickStartPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setUserMessage(prompt)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50 min-h-[300px] max-h-[400px]">
        {conversationHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Start a conversation with your English tutor!</p>
              <p className="text-sm">I can help with grammar, vocabulary, pronunciation, and conversation practice.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversationHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border shadow-sm'
                }`}>
                  <div className="flex items-start gap-2">
                    {msg.role === 'tutor' && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 mt-1">
                        <BookOpen className="h-3 w-3 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask your English tutor anything..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userMessage.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Send
              </>
            )}
          </button>
        </div>

        {/* Audio Controls */}
        {currentAudioUrl && (
          <div className="flex items-center gap-3">
            <button
              onClick={playTutorResponse}
              disabled={isPlaying}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isPlaying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Playing...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Play Response
                </>
              )}
            </button>
            <button
              onClick={clearConversation}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              New Conversation
            </button>
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-medium text-blue-800">Tutor Features:</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <div>• Grammar correction</div>
          <div>• Vocabulary building</div>
          <div>• Pronunciation help</div>
          <div>• Conversation practice</div>
        </div>
      </div>
    </div>
  );
}
