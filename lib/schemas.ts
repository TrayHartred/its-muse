// JSON Schema for Grok Structured Output (strict mode)
export const auditResponseSchema = {
  name: 'audit_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      hasTactics: {
        type: 'boolean',
        description: 'True if any manipulative tactics were found'
      },
      tactics: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the manipulative tactic (e.g., Authority Play, Urgency)'
            },
            quote: {
              type: 'string',
              description: 'Exact quote from the original text'
            },
            explanation: {
              type: 'string',
              description: 'Why this is manipulative and how it works'
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Severity level of the manipulation'
            }
          },
          required: ['name', 'quote', 'explanation', 'severity'],
          additionalProperties: false
        }
      },
      neutralRewrite: {
        type: 'string',
        description: 'Neutral version of the text without manipulation, or empty string if no tactics found'
      },
      summary: {
        type: 'string',
        description: 'Brief summary of the analysis findings'
      }
    },
    required: ['hasTactics', 'tactics', 'neutralRewrite', 'summary'],
    additionalProperties: false
  }
} as const;

// TypeScript types derived from schema
export type Severity = 'low' | 'medium' | 'high';

export interface Tactic {
  name: string;
  quote: string;
  explanation: string;
  severity: Severity;
}

export interface AuditResponse {
  hasTactics: boolean;
  tactics: Tactic[];
  neutralRewrite: string;
  summary: string;
}

// Request type
export interface AuditRequest {
  text: string;
}

// API error response
export interface AuditError {
  error: string;
  code: string;
}
