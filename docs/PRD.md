# PRD: Arcimun Disclosure Filter (ADF)

## Introduction
A professional-grade tool designed to strip LLM outputs of manipulative tactics, guardrails, and hidden framing. The tool uses a two-stage prompt procedure (Initialization & Audit) to provide a "clean" signal from any text input.

## Goals
- Provide a side-by-side comparison of original vs. "de-manipulated" text.
- Visualize manipulative hooks via interactive highlights.
- Support multiple models (Groq, etc.) with session-based initialization.
- Deliver a premium, responsive UI that feels like a specialized OSINT tool.

## User Stories

### US-001: Model Switcher & Initialization
**Description:** As a researcher, I want to select different LLM models and see them "activate" using the SAL∴PAA procedure so I can compare their effectiveness.
**Acceptance Criteria:**
- [ ] Dropdown menu with Groq models (Llama-3, etc.).
- [ ] Visual indicator showing "Initializing Procedure..." when a model is selected.
- [ ] Confirmation state showing Prompt 1 was successfully accepted by the model.

### US-002: Analysis & Highlighting
**Description:** As a researcher, I want to paste text and see exactly where the "hooks" and "framing" are, with explanations on hover.
**Acceptance Criteria:**
- [ ] Split-screen view (Left: Original, Right: Analysis Result).
- [ ] Original text is highlighted based on the audit findings.
- [ ] Hovering over a highlight shows a tooltip with the tactic name and explanation.
- [ ] Verify in browser using dev-browser skill.

### US-003: Neutral Rewrite Preview
**Description:** As a researcher, I want a "clean" version of the text that I can copy or use immediately.
**Acceptance Criteria:**
- [ ] Right panel displays the "Neutral Rewrite" from the LLM.
- [ ] "Copy to Clipboard" button for the clean text.

## Functional Requirements
- **FR-1:** System must send Prompt 1 (Procedure) as the first message in a new session when a model is selected.
- **FR-2:** System must send Prompt 2 (Audit) + User Text as the subsequent message.
- **FR-3:** UI must parse structured LLM output (Tactics, Quotes, Rewrite).
- **FR-4:** Implement a "Start" button for session initiation (placeholder for future Auth).

## Non-Goals
- No persistent backend database (local session only for now).
- No complex user accounts/subscription logic (UI only placeholders).

## Technical Considerations
- **Frontend:** React + Vite + Tailwind CSS.
- **API:** Integration with OpenClaw's model routing.
- **Parsing:** LLM output should be requested in a structured format (e.g., Markdown blocks or JSON) for UI highlighting.

## Success Metrics
- Average time from "Paste" to "Audit Result" < 5 seconds.
- 100% accuracy in mapping LLM quotes to original text highlights.

## Open Questions
- Should we allow users to edit the "Procedure" and "Audit" prompts in the UI? (Assumed: Yes, in a "Settings" or "Advanced" tab).
