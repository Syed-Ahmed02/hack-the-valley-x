"use client";

import { useState } from "react";
import { useChat } from '@ai-sdk/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Wand2, X, FileText } from "lucide-react";

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  level: DifficultyLevel;
  onLevelChange: (level: DifficultyLevel) => void;
}

export function AISummaryModal({ 
  isOpen, 
  onClose, 
  content, 
  level, 
  onLevelChange 
}: AISummaryModalProps) {
  const { messages, sendMessage } = useChat();

  const handleGenerateSummary = () => {
    sendMessage(
      { text: `Summarize this content at a ${level} level: ${content}` },
      {
        body: {
          level: level,
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand" />
            AI Summary
          </DialogTitle>
        </DialogHeader>

        {/* Difficulty Toggle */}
        <div className="p-4 border-b">
          <label className="text-sm font-medium mb-3 block">Summary Level</label>
          <div className="flex rounded-lg bg-muted p-1">
            {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((difficultyLevel) => (
              <button
                key={difficultyLevel}
                onClick={() => onLevelChange(difficultyLevel)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  level === difficultyLevel
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="p-4 border-b">
          <Button
            onClick={handleGenerateSummary}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate AI Summary
          </Button>
        </div>

        {/* Summary Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Generate AI Summary" to create a summary of your transcript</p>
              </div>
            ) : (
              messages
                .filter(message => message.role === 'assistant')
                .map((message) => (
                  <div key={message.id} className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {message.parts.map((part, i) => {
                      if (part.type === 'text') {
                        return <div key={`${message.id}-${i}`}>{part.text}</div>;
                      }
                      return null;
                    })}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <Button className="flex-1" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Save Summary
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
