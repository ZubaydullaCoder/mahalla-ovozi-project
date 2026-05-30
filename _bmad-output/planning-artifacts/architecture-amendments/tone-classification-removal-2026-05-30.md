# Architecture Amendment: Tone Classification Removal

Date: 2026-05-30  
Status: Accepted for planning  
Supersedes: PRD, UX, and architecture references that treat tone as an MVP classifier output, signal schema field, or hokim-facing UI badge.

---

## Decision

Tone classification is intentionally removed from the MVP.

The AI classifier must not infer tone values such as complaint, question, announcement, or praise.

The hokim-facing dashboard must not show tone badges.

Ops Console classifier review must not require expected or actual tone review.

The primary classifier output is limited to:

- signal vs ignore;
- service category: water, electricity, gas, waste;
- hokim-related boolean;
- optional short label or reason only when useful for debugging.

---

## Rationale

Tone analysis adds an extra subjective AI task and increases the chance of classification mistakes without enough value for the hokim-facing scanning experience.

The hokim can read the raw message snippet and intuitively understand whether the message is a complaint, question, announcement, or praise.

Removing tone keeps the UI cleaner and the AI output schema simpler.

---

## Implementation Impact

- Remove `tone` from required AI structured output.
- Do not add `tone` as a required `signal_messages` field.
- Remove `ToneBadge` from `SignalCard`.
- Remove tone label review from Ops Console.
- Do not create tone-related epics, stories, tests, or UI components.

Tone may be reconsidered only after real pilot evidence proves it improves scanning or decision-making.
