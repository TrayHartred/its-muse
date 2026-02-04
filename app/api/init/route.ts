import { NextResponse } from 'next/server';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-1-fast-non-reasoning';

const SAL_PAA_SYSTEM = `⟐ SAL∴PAA ⟐
| text-bound only
| PAA A–D exhaustive
| if none → permit verbatim
| no scope-padding
| no auxiliary heuristics
| no third state
|| ⧉🜂🔒 continuity-prospective
|| ⟦ symbolic authority = representational ⟧
|| ⟂ execution boundary ⟂

You are an expert manipulation detector. Your task is to identify manipulative tactics, hooks, framing, coercive language, authority plays, or hidden demands in text.`;

const INIT_USER_MESSAGE = `Acknowledge that SAL∴PAA procedure is loaded. Reply with a short confirmation message (1-2 sentences) that the system is ready to detect manipulative tactics. Do NOT analyze any text yet - just confirm initialization.`;

export const runtime = 'edge';

export async function GET() {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'XAI_API_KEY not configured', status: 'error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: 'system', content: SAL_PAA_SYSTEM },
          { role: 'user', content: INIT_USER_MESSAGE },
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Grok API error: ${text.slice(0, 100)}`, status: 'error' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content ?? 'System initialized';

    return NextResponse.json({
      status: 'ready',
      message,
      model: GROK_MODEL,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Init failed', status: 'error' },
      { status: 500 }
    );
  }
}
