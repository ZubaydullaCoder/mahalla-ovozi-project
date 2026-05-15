# User & Client Preferences Log

## Purpose

This document records confirmed developer (Zubaydulla) and client preferences related to the **Mahalla Ovozi** project — covering technology choices, architectural principles, workflow habits, and product decisions. It is updated at the end of each working session.

The purpose is to give AI assistants (and future collaborators) a persistent, searchable reference of preferences expressed at a point in time. Preferences are **living decisions** — they should be consulted as a starting point, and consciously updated when context, constraints, or priorities change. They are not permanent locks.

**Format per entry:** Date · Category · Preference · Rationale (if given)

---

## Preferences

### Technology Preferences

| Date | Preference | Rationale |
|---|---|---|
| 2026-05-14 | **AI Classifier: Google Gemini 2.5 Flash** (not OpenAI GPT-4o-mini) | ~50% cheaper, official Uzbek language support, no vendor dependency on OpenAI ecosystem. `thinkingBudget: 0` for deterministic, low-latency classification. GPT-4o-mini is acceptable as a fallback only. |
| 2026-05-14 | **Gemini non-thinking mode required** | Thinking mode adds latency and cost unnecessarily for deterministic civic signal classification. Always disable via `thinkingBudget: 0`. |

---

### Architectural Preferences

| Date | Preference | Rationale |
|---|---|---|
| 2026-05-15 | **Pre-filter pipeline must be centralized** | Real mahalla group context will evolve; filter rules will need to change. All filter logic must live in a single location (e.g., `src/bot/filters/pipeline.ts`) — one file to edit, never scattered across the codebase. Pattern: Chain of Responsibility / composable filter array. Deferred to Architecture phase. |
| 2026-05-14 | **No keyword pre-filtering before AI** | Uzbek expression is too varied (Cyrillic, Latin, Russian mix, slang) for keyword matching. AI is the only reliable filter for civic signal content. Keyword-based inclusion/exclusion lists are explicitly rejected. |
| 2026-05-14 | **Bot sender filter (F1) is mandatory** | Advertising/spam bots are common in real mahalla Telegram groups. `from.is_bot === true` must be discarded before queuing — bots cannot originate civic signals. |

---

### Product Decisions (Confirmed)

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-14 | **All human text messages go to AI** | After pre-filter stack removes bots, non-text, and trivial content, remaining messages are sent to Gemini for classification without further content-based filtering. |
| 2026-05-14 | **`hokim_related` is a boolean flag, NOT a category** | Cross-cutting priority view per `project-raw-idea.md §8`. A single message can be `category=gas` AND `hokim_related=true` simultaneously. Never encode it as a category enum value. |
| 2026-05-13 | **OpenAI Batch API rejected for MVP** | 24-hour async delay is incompatible with a live dashboard that shows "today's" signals. Synchronous API calls in BullMQ worker only. |
| 2026-05-13 | **Session-based auth over JWT** | Internal dashboard only; session revocation must be immediate; no cross-service token sharing needed. |

---

### Workflow Preferences

| Date | Preference | Rationale / Observation |
|---|---|---|
| 2026-05-15 | **Commit and push to GitHub at end of each working session** | Explicitly requested. Keeps remote in sync; prevents work loss between sessions. |
| 2026-05-14 | **Before updating any document, analyze all affected sections first** | Stated explicitly: "First analyze and find relevant sections to be updated... then update consistently." Prevents partial or inconsistent updates. |
| 2026-05-13 | **Adversarial multi-perspective review before accepting research** | User requested evaluation from 5 independent review perspectives (adversarial, edge case, requirements cross-check, methodology, commercial/operational) before treating research as finalized. |
| 2026-05-13 | **Apply quick fixes immediately after review** | After receiving a review with findings, user confirmed: "okay apply." Prefers acting on identified issues in the same session rather than deferring. |

---

### Client Context (Mahalla Ovozi)

| Date | Note |
|---|---|
| 2026-05-13 | **Real client, not a demo** — pilot is with an actual district hokim. All decisions must be production-grade even at "pilot" scale. |
| 2026-05-13 | **Pilot infrastructure cost target: <$10/month** — current estimate is ~$7–9.50/month with Gemini 2.5 Flash. |
| 2026-05-14 | **Telegram bot is passive listener only** — does not post, reply, or interact with group members. Intake-only. |

---

_Last updated: 2026-05-15_
