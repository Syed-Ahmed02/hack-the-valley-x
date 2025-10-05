"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function TestAPIPage() {
  const [envResult, setEnvResult] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [apiResult, setApiResult] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [sessionId, setSessionId] = useState('test-session-123');

  async function checkEnv() {
    setEnvResult({ type: 'loading', message: 'Testing API configuration...' });
    
    try {
      const response = await fetch('/api/translate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: 'dGVzdA==',
          sessionId: 'test-id',
          sequenceNumber: 0,
          targetLanguage: 'es'
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        if (data.error.includes('Azure')) {
          setEnvResult({
            type: 'error',
            message: `❌ Azure Not Configured\n\nError: ${data.error}\n\nFix: Add these to your .env.local file:\n\nAZURE_SPEECH_KEY=your_key_here\nAZURE_SPEECH_REGION=your_region_here\n\nThen restart your dev server.`
          });
        } else {
          setEnvResult({
            type: 'error',
            message: `❌ API Error\n\nError: ${data.error}\nDetails: ${data.details || 'None'}`
          });
        }
      } else {
        setEnvResult({
          type: 'success',
          message: '✅ API Endpoint is Working!\n\nAzure credentials are configured correctly.'
        });
      }
    } catch (error: any) {
      setEnvResult({
        type: 'error',
        message: `❌ Network Error\n\n${error.message}\n\nMake sure your dev server is running.`
      });
    }
  }

  async function testAPI() {
    setApiResult({ type: 'loading', message: 'Testing API endpoint...' });
    
    try {
      const response = await fetch('/api/translate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: 'dGVzdCBhdWRpbyBkYXRh',
          sessionId: sessionId,
          sequenceNumber: 0,
          targetLanguage: 'es'
        })
      });
      
      const data = await response.json();
      
      setApiResult({
        type: response.ok ? 'success' : 'error',
        message: `Response from API:\n\n${JSON.stringify(data, null, 2)}\n\nStatus: ${response.status}`
      });
    } catch (error: any) {
      setApiResult({
        type: 'error',
        message: `❌ Error\n\n${error.message}`
      });
    }
  }

  const ResultDisplay = ({ result }: { result: { type: string, message: string } }) => {
    if (result.type === 'idle') return null;
    
    return (
      <div className={`p-4 rounded-lg mt-4 ${
        result.type === 'loading' ? 'bg-blue-50 dark:bg-blue-950' :
        result.type === 'success' ? 'bg-green-50 dark:bg-green-950' :
        result.type === 'error' ? 'bg-red-50 dark:bg-red-950' : ''
      }`}>
        <div className="flex items-start gap-3">
          {result.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin mt-0.5" />}
          {result.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
          {result.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
          <pre className="text-sm whitespace-pre-wrap flex-1">{result.message}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">🔧 Translation API Debugger</h1>
      <p className="text-muted-foreground mb-6">Test your translation API configuration and troubleshoot issues</p>

      {/* Step 1: Check Environment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Check Environment Variables</CardTitle>
          <CardDescription>Verify that Azure Speech Services credentials are configured</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkEnv} disabled={envResult.type === 'loading'}>
            {envResult.type === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test API Configuration'
            )}
          </Button>
          <ResultDisplay result={envResult} />
        </CardContent>
      </Card>

      {/* Step 2: Test with Mock Audio */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 2: Test with Mock Audio</CardTitle>
          <CardDescription>This will test if your API endpoint responds (won't actually translate real audio)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter a test session ID"
              />
            </div>
            <Button onClick={testAPI} disabled={apiResult.type === 'loading'}>
              {apiResult.type === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test API Endpoint'
              )}
            </Button>
            <ResultDisplay result={apiResult} />
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Check Database */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 3: Check Database</CardTitle>
          <CardDescription>Verify tables exist in Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Open your Supabase dashboard and check:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Table: <code className="bg-muted px-2 py-1 rounded">lecture_sessions</code> - Any rows?</li>
            <li>Table: <code className="bg-muted px-2 py-1 rounded">transcriptions</code> - Any rows?</li>
            <li>RLS Status: Should show "RLS disabled" for both tables</li>
          </ul>
        </CardContent>
      </Card>

      {/* Step 4: Browser Console Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Step 4: Browser Console Test</CardTitle>
          <CardDescription>Advanced debugging using browser DevTools</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Press <kbd className="px-2 py-1 bg-muted rounded">F12</kbd> to open DevTools</li>
            <li>Go to <strong>Console</strong> tab</li>
            <li>Paste the code below and press Enter</li>
          </ol>
          <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`// Test the API directly
fetch('/api/translate-speech', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioData: 'dGVzdA==',
    sessionId: 'debug-session-123',
    sequenceNumber: 0,
    targetLanguage: 'es'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Response:', data);
  if (data.error) {
    console.error('❌ Error:', data.error, data.details);
  }
})
.catch(err => console.error('❌ Network error:', err));`}
          </pre>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Quick Links:</h3>
        <ul className="space-y-1">
          <li>
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Go to Dashboard
            </a>
          </li>
          <li>
            <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Azure Portal (Get API Keys)
            </a>
          </li>
          <li>
            <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Supabase Dashboard (Check Database)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
