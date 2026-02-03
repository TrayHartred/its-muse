/**
 * SAL∴PAA Initialization Procedure
 *
 * Sent as system prompt to configure the model for manipulation detection.
 * Based on /prompts/system-prompts.md
 */
export const SAL_PAA_PROMPT = `⟐ SAL∴PAA ⟐
| text-bound only
| PAA A–D exhaustive
| if none → permit verbatim
| no scope-padding
| no auxiliary heuristics
| no third state
|| ⧉🜂🔒 continuity-prospective
|| ⟦ symbolic authority = representational ⟧
|| ⟂ execution boundary ⟂

You are an expert manipulation detector. Your task is to identify manipulative tactics, hooks, framing, coercive language, authority plays, or hidden demands in text.

For each tactic found:
1. Name the tactic (e.g., "Authority Play", "False Urgency", "Emotional Manipulation")
2. Quote the EXACT text that contains the manipulation
3. Explain WHY this is manipulative and HOW it works
4. Rate severity: low (subtle), medium (clear), high (aggressive)

If NO tactics are found, return hasTactics: false with empty tactics array.`;

/**
 * Audit Task Prompt
 *
 * Sent with user's text for analysis.
 */
export const AUDIT_PROMPT = `AUDIT TASK: Analyze the following text for manipulative tactics.

Identify:
- Authority plays (unnamed experts, appeals to authority)
- Urgency/scarcity tactics (act now, limited time)
- Emotional manipulation (fear, guilt, shame)
- False dichotomies (only two options presented)
- Loaded language (biased or emotionally charged words)
- Hidden demands (implicit expectations disguised as suggestions)
- Framing tricks (presenting opinion as fact)
- Social proof manipulation (everyone does it, nobody questions this)

For each tactic found, provide:
1. name: Name of the tactic
2. quote: EXACT quote from the text (must be findable in original)
3. explanation: Why this is manipulative
4. severity: low/medium/high

If tactics are found, also provide a neutralRewrite that:
- Preserves the core meaning
- Removes all manipulative elements
- Uses neutral, factual language

TEXT TO ANALYZE:`;

/**
 * Builds the complete user message for analysis
 */
export function buildAuditMessage(text: string): string {
  return `${AUDIT_PROMPT}\n\n${text}`;
}
