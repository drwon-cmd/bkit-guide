// Test language detection API
import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage, getBkitGuideSystemPrompt } from '@/lib/bkit-guide/prompts';

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  const detectedLanguage = detectLanguage(message);
  const systemPrompt = getBkitGuideSystemPrompt(detectedLanguage);

  return NextResponse.json({
    message,
    detectedLanguage,
    systemPromptPreview: systemPrompt.slice(0, 100),
    systemPromptLength: systemPrompt.length,
  });
}
