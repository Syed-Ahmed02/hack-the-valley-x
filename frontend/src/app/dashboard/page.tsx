"use client";

import { VoiceInput } from "@/components/voice-input";
import { Conversation } from "@/components/ui/conversation";
import { EnglishTutor } from "@/components/ui/english-tutor";
import { VoiceAgent } from "@/components/ui/voice-agent";
import { useUser } from "@/hooks/useUser";
import {
  Mic,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  // Get authenticated user
  const { auth0User } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Lingo Lift</h1>
          <p className="text-lg text-muted-foreground">
            Transform your study materials into your preferred language
          </p>
        </div>

        {/* Voice Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Record Audio Lecture
            </CardTitle>
            <CardDescription>
              Record or upload audio lectures to transcribe and translate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceInput userId={auth0User?.sub} />
          </CardContent>
        </Card>

        {/* Text-to-Speech Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Text-to-Speech Converter
            </CardTitle>
            <CardDescription>
              Convert any text to speech in multiple languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Conversation />
          </CardContent>
        </Card>

       

        {/* Interactive Voice Agent Section */}
        <VoiceAgent />
      </div>
    </div>
  );
}