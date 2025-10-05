'use client';

import { useCallback, useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Phone, PhoneOff } from 'lucide-react';

// Mock implementation for development - replace with actual @elevenlabs/react import when package is installed
import { useConversation } from '@elevenlabs/react';



export function VoiceAgent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [agentId, setAgentId] = useState('');
  const [textInput, setTextInput] = useState('');

  // Load agent ID from environment variable
  useEffect(() => {
    const envAgentId = process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID;
    if (envAgentId) {
      setAgentId(envAgentId);
      console.log('Agent ID loaded from environment:');
    } else {
      console.warn('ELEVEN_LABS_AGENT_ID not found in environment variables');
    }
  }, []);

  // Initialize conversation - agent is pre-configured in ElevenLabs dashboard
  const conversation = useConversation({
    textOnly: false, // Enable voice
    micMuted: micMuted,
    volume: volume,
    onConnect: () => {
      console.log('Connected to voice agent');
      setIsConnected(true);
      setIsConnecting(false);
    },
    onDisconnect: () => {
      console.log('Disconnected from voice agent');
      setIsConnected(false);
      setIsConnecting(false);
    },
    onMessage: (message: any) => {
      console.log('Agent message:', message);
      // No conversation history tracking
    },
    onError: (error: any) => {
      console.error('Voice agent error:', error);
      setIsConnecting(false);
      alert('Error connecting to voice agent. Please check your agent configuration.');
    },
  });

  const startConversation = useCallback(async () => {
    if (!agentId.trim()) {
      alert('Please enter an Agent ID to start the conversation');
      return;
    }

    setIsConnecting(true);
    try {
      await conversation.startSession({
        agentId: agentId.trim(),
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsConnecting(false);
      alert('Failed to start conversation. Please check your Agent ID and try again.');
    }
  }, [conversation, agentId]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  }, [conversation]);

  const toggleMic = useCallback(() => {
    setMicMuted(!micMuted);
  }, [micMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const sendTextMessage = useCallback(async (message: string) => {
    if (!message.trim() || !isConnected) return;

    try {
      await conversation.sendUserMessage(message.trim());
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [conversation, isConnected]);

  const handleTextSubmit = useCallback(() => {
    if (textInput.trim()) {
      sendTextMessage(textInput);
      setTextInput('');
    }
  }, [textInput, sendTextMessage]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-6">
    
      

      {/* Agent Configuration */}
      <div className="">
        <div className="space-y-3">
          
          
          {!isConnected && (
            <button
              onClick={startConversation}
              disabled={isConnecting || !agentId.trim()}
              className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  Start Voice Conversation
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {isConnected && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">Connected to Voice Agent</span>
          </div>
          <button
            onClick={endConversation}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="h-4 w-4" />
            End Call
          </button>
        </div>
      )}

      {/* Voice Controls */}
      {isConnected && (
        <div className="flex items-center justify-center gap-4 p-4 bg-white border rounded-lg">
          <button
            onClick={toggleMic}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              micMuted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {micMuted ? 'Unmute' : 'Mute'}
          </button>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${
              conversation.isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {conversation.isSpeaking ? 'Agent Speaking' : 'Listening'}
          </div>
        </div>
      )}


      {/* Text Input for Fallback */}
      {isConnected && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a message or speak..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTextSubmit();
                }
              }}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>

          
        </div>
      )}

    
    </div>
  );
}