// bkit-guide Chat API
// Streaming chat with RAG context and auto Q&A saving

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  getBkitGuideSystemPrompt,
  wrapContextWithRag,
  detectCategory,
  detectLanguage,
} from '@/lib/bkit-guide/prompts';
import { buildChatContext } from '@/lib/bkit-guide/knowledge-base';
import { createQA } from '@/lib/bkit-guide/qa-store';
import { indexQA } from '@/lib/bkit-guide/qa-indexer';

const claudeClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, locale = 'ko' } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build RAG context
    const { context, sourcesUsed } = await buildChatContext(message, {
      language: locale,
      maxResults: 8,
    });

    // Wrap user message with context
    const enhancedMessage = context
      ? wrapContextWithRag(context, message)
      : message;

    // Detect language and category
    const detectedLanguage = detectLanguage(message);
    const category = detectCategory(message);

    // Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await claudeClient.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: getBkitGuideSystemPrompt(detectedLanguage),
            messages: [{ role: 'user', content: enhancedMessage }],
            stream: true,
          });

          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }

          // Save Q&A to database (async, don't block response)
          const effectiveSessionId = sessionId || `anon-${Date.now()}`;

          createQA({
            question: message,
            answer: fullResponse,
            category,
            language: detectedLanguage,
            sessionId: effectiveSessionId,
            metadata: {
              ragSourcesUsed: sourcesUsed,
            },
          })
            .then((qa) => {
              // Index to LanceDB for future searches
              indexQA(qa).catch(() => {
                // Silently fail indexing
              });
            })
            .catch(() => {
              // Silently fail Q&A save
            });

          // Send completion signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, category, sourcesUsed })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Chat failed';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Request failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
