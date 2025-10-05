'use client';

import { useCallback, useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Phone, PhoneOff, MessageSquare, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="w-full max-w-4xl mx-auto space-y-6">
     

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Interactive Voice Agent Tutor
          </CardTitle>
          <CardDescription>
            Have real-time voice conversations with an AI agent that helps you with your English
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected && (
            <Button
              onClick={startConversation}
              disabled={isConnecting || !agentId.trim()}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  Start Voice Conversation
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Connection Status */}
      {isConnected && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 font-medium">Connected to Voice Agent</span>
              </div>
              <Button
                onClick={endConversation}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2 bg-red-500 text-white"
              >
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Controls */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={toggleMic}
                variant={micMuted ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {micMuted ? 'Unmute' : 'Mute'}
              </Button>

              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground w-8">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${
                  conversation.isSpeaking ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
                }`} />
                {conversation.isSpeaking ? 'Agent Speaking' : 'Listening'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Input for Fallback */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Text Input</CardTitle>
            <CardDescription>
              Type a message as an alternative to voice input
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a message or speak..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}