import { auditResponseSchema, AuditResponse } from './schemas';
import { SAL_PAA_PROMPT, buildAuditMessage, buildRegenerateMessage } from './prompts';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-4-1-fast-reasoning';
const GROK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GrokAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public retryable: boolean
  ) {
    super(message);
    this.name = 'GrokAPIError';
  }
}

/**
 * Sleep utility for retry delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Grok API with structured output
 */
async function callGrok(
  messages: GrokMessage[],
  apiKey: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROK_TIMEOUT);

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages,
        max_tokens: 4000,
        response_format: {
          type: 'json_schema',
          json_schema: auditResponseSchema,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      const retryable = response.status >= 500 || response.status === 429;
      throw new GrokAPIError(
        `Grok API error: ${text.slice(0, 200)}`,
        response.status,
        response.status === 429 ? 'rate_limit' : 'api_error',
        retryable
      );
    }

    const data: GrokResponse = await response.json();
    return data.choices[0]?.message?.content ?? '{}';
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call Grok with retry logic
 */
async function callGrokWithRetry(
  messages: GrokMessage[],
  apiKey: string
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await callGrok(messages, apiKey);
    } catch (error) {
      lastError = error as Error;

      if (error instanceof GrokAPIError && !error.retryable) {
        throw error;
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error('Unknown error');
}

/**
 * Parse JSON response safely
 */
function parseAuditResponse(content: string): AuditResponse {
  try {
    const parsed = JSON.parse(content);

    // Validate required fields
    if (typeof parsed.hasTactics !== 'boolean') {
      throw new Error('Invalid hasTactics field');
    }
    if (!Array.isArray(parsed.tactics)) {
      throw new Error('Invalid tactics field');
    }
    if (typeof parsed.summary !== 'string') {
      throw new Error('Invalid summary field');
    }

    return {
      hasTactics: parsed.hasTactics,
      tactics: parsed.tactics.map((t: Record<string, unknown>) => ({
        name: String(t.name ?? ''),
        quote: String(t.quote ?? ''),
        explanation: String(t.explanation ?? ''),
        severity: ['low', 'medium', 'high'].includes(String(t.severity))
          ? (t.severity as 'low' | 'medium' | 'high')
          : 'medium',
      })),
      neutralRewrite: parsed.neutralRewrite ?? '',
      summary: parsed.summary,
    };
  } catch {
    // Return safe default on parse error
    return {
      hasTactics: false,
      tactics: [],
      neutralRewrite: '',
      summary: 'Failed to parse analysis response',
    };
  }
}

/**
 * Main audit function
 *
 * Sends text to Grok for manipulation analysis
 */
export async function auditText(
  text: string,
  apiKey: string
): Promise<AuditResponse> {
  if (!apiKey) {
    throw new GrokAPIError(
      'XAI_API_KEY not configured',
      401,
      'not_configured',
      false
    );
  }

  if (!text.trim()) {
    return {
      hasTactics: false,
      tactics: [],
      neutralRewrite: '',
      summary: 'No text provided for analysis',
    };
  }

  const messages: GrokMessage[] = [
    { role: 'system', content: SAL_PAA_PROMPT },
    { role: 'user', content: buildAuditMessage(text) },
  ];

  const content = await callGrokWithRetry(messages, apiKey);
  return parseAuditResponse(content);
}

/**
 * Call Grok for plain text response (no JSON schema)
 */
async function callGrokPlainText(
  messages: GrokMessage[],
  apiKey: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROK_TIMEOUT);

  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      const retryable = response.status >= 500 || response.status === 429;
      throw new GrokAPIError(
        `Grok API error: ${text.slice(0, 200)}`,
        response.status,
        response.status === 429 ? 'rate_limit' : 'api_error',
        retryable
      );
    }

    const data: GrokResponse = await response.json();
    return data.choices[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Regenerate clean text
 *
 * Generates a new neutral rewrite based on detected tactics
 */
export async function regenerateCleanText(
  originalText: string,
  tacticNames: string[],
  previousRewrite: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new GrokAPIError(
      'XAI_API_KEY not configured',
      401,
      'not_configured',
      false
    );
  }

  const messages: GrokMessage[] = [
    { role: 'system', content: 'You are an expert at rewriting text to remove manipulative language while preserving meaning. Return ONLY the rewritten text.' },
    { role: 'user', content: buildRegenerateMessage(originalText, tacticNames, previousRewrite) },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await callGrokPlainText(messages, apiKey);
    } catch (error) {
      lastError = error as Error;

      if (error instanceof GrokAPIError && !error.retryable) {
        throw error;
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error('Unknown error');
}
