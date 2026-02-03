import { NextRequest, NextResponse } from 'next/server';
import { auditText, GrokAPIError } from '@/lib/xai';
import { AuditRequest, AuditError } from '@/lib/schemas';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AuditRequest;
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json<AuditError>(
        { error: 'Text is required', code: 'missing_text' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json<AuditError>(
        { error: 'Text too long (max 10000 characters)', code: 'text_too_long' },
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

    const result = await auditText(text, apiKey);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Audit API error:', error);

    if (error instanceof GrokAPIError) {
      return NextResponse.json<AuditError>(
        { error: error.message, code: error.code },
        { status: error.status >= 500 ? 502 : error.status }
      );
    }

    return NextResponse.json<AuditError>(
      { error: 'Internal server error', code: 'internal_error' },
      { status: 500 }
    );
  }
}
