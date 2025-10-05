import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, level }: { messages: UIMessage[]; level: string } = await req.json();

  const prompts = {
    beginner: "You are a helpful assistant that explains complex topics in simple, easy-to-understand language. Use analogies and examples to make concepts clear for beginners.",
    intermediate: "You are a knowledgeable assistant that provides detailed explanations suitable for someone with some background knowledge. Include technical details and examples.",
    advanced: "You are an expert assistant that provides in-depth, technical explanations. Use precise terminology and include advanced concepts and methodologies."
  };

  const systemPrompt = prompts[level as keyof typeof prompts] || prompts.intermediate;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: convertToModelMessages(messages),
    system: systemPrompt,
  });

  return result.toUIMessageStreamResponse();
}
