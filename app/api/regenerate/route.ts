import { NextRequest, NextResponse } from 'next/server';
import { buildRegenerateMessage } from '@/lib/prompts';
import { AuditError } from '@/lib/schemas';

export const runtime = 'edge';
export const maxDuration = 60;

interface RegenerateRequest {
  originalText: string;
  tacticNames: string[];
  previousRewrite: string;
}

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-1-fast-reasoning';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegenerateRequest;
    const { originalText, tacticNames, previousRewrite } = body;

    if (!originalText || typeof originalText !== 'string') {
      return NextResponse.json<AuditError>(
        { error: 'Original text is required', code: 'missing_text' },
        { status: 400 }
      );
    }

    if (!Array.isArray(tacticNames) || tacticNames.length === 0) {
      return NextResponse.json<AuditError>(
        { error: 'Tactics are required', code: 'missing_tactics' },
        { status: 400 }
      );
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json<AuditError>(
        { error: 'API not configured', code: 'not_configured' },
        { status: 500 }
      );
    }

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at rewriting text to remove manipulative language while preserving meaning. Return ONLY the rewritten text, nothing else.'
          },
          {
            role: 'user',
            content: buildRegenerateMessage(originalText, tacticNames, previousRewrite)
          },
        ],
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json<AuditError>(
        { error: `Grok API error: ${text.slice(0, 200)}`, code: 'api_error' },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    // Return streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Regenerate API error:', error);
    return NextResponse.json<AuditError>(
      { error: 'Internal server error', code: 'internal_error' },
      { status: 500 }
    );
  }
}
