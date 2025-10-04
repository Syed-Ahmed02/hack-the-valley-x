import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { useState, useCallback } from "react";

export function VoiceInput() {
  const [recordings, setRecordings] = useState<{ duration: number; timestamp: Date }[]>([]);

  const handleStop = useCallback((duration: number) => {
    setRecordings(prev => [...prev.slice(-4), { duration, timestamp: new Date() }]);
  }, []);

  const handleStart = useCallback(() => {
    console.log('Recording started');
  }, []);

  return (
    <div className="space-y-8">
        <div className="space-y-4">
          <AIVoiceInput
            onStart={handleStart}
            onStop={handleStop}
          />
      </div>
    </div>
  );
}
