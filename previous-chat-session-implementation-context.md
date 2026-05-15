# Previous Chat Session Context

> **Purpose:** This file is updated at the end of each working session. It gives the AI assistant in the next session immediate, accurate context about current project state — what was done and what was decided. Read this before starting any new work on Mahalla Ovozi.

---

## Session: 2026-05-13 → 2026-05-15

### What Was Accomplished

#### 1. Technical Research — Reviewed, Fixed, and Finalized
File: `_bmad-output/planning-artifacts/research/technical-telegram-ai-pipeline-research-2026-05-13.md`

Ran a 5-layer adversarial review (27 findings). Applied all critical fixes:
- **Zod schema fix:** Removed `hokim_related` from `category` enum — it is a standalone `boolean` flag, not a category. A message can be `category=gas` AND `hokim_related=true` simultaneously.
- **Cost recalculation:** Corrected to standard API pricing (was using Batch API rates).
- **Legal/Regulatory section added:** 5 open questions flagged for PRD (Uzbekistan data law, resident notification, data residency, etc.)
- **DB index recommendations added:** Composite indexes for lane query, drawer query, hokim filter, full-text search, idempotency.
- **Backup/Disaster Recovery section added:** `pg_dump` daily to Backblaze B2/S3, 5-step recovery procedure, RTO/RPO targets.
- **Terminology fix:** "Synchronous Batch" → "Real-time API Batch"; Express/Fastify inconsistency resolved (Fastify throughout).

#### 2. Pre-filter Stack — Designed and Documented
Added a **3-layer pre-filter pipeline** applied in the webhook handler before any message reaches the queue:

| Layer | Rule | Discards |
|---|---|---|
| F1 | `from.is_bot === true` | Advertising/spam bots (common in mahalla groups) |
| F2 | Non-text message type | Photos, stickers, voice, polls, GIFs |
| F3 | Trivial content | `text.trim().length < 5`, emoji-only, bare URL, `/command` |

- ~40–50% of raw Telegram traffic discarded before AI. Zero false-negative risk.
- **No keyword pre-filtering.** All human text goes to AI. Uzbek language variability makes keyword filters unreliable.
- **Architectural decision deferred to Architecture phase:** Filters must be centralized in a single file (`src/bot/filters/pipeline.ts`) using Chain of Responsibility pattern — easy to modify from one place as real-group context evolves.

#### 3. AI Classifier Switch — OpenAI → Google Gemini
Switched primary classifier from OpenAI GPT-4o-mini to **Google Gemini 2.5 Flash**.

| Item | Old | New |
|---|---|---|
| Model | GPT-4o-mini | Gemini 2.5 Flash (non-thinking) |
| Input cost | $0.15/1M | ~$0.075/1M |
| Output cost | $0.60/1M | ~$0.30/1M |
| Pilot AI cost | ~$1.25/month | **~$0.63/month** |
| SDK | `openai` | `@google/generative-ai` |
| Structured output | `response_format` + Zod | `responseSchema` + `responseMimeType: 'application/json'` |
| Key config | `temperature: 0` | `temperature: 0`, `thinkingBudget: 0` |
| Uzbek support | ✅ Works well | ✅ Official support |

GPT-4o-mini listed as viable fallback only.

All references updated throughout the technical research document: model table, stack summary, cost estimates, structured outputs section (full rewrite), communication protocols table, security table, synthesis, PRD decisions table.

#### 4. Domain Research — Completed
File: `_bmad-output/planning-artifacts/research/domain-mahalla-governance-research-2026-05-13.md`

Covers:
- Uzbek administrative hierarchy: Viloyat → Tuman → Mahalla → Fuqarolar
- Mahalla Ovozi targets the **Tuman (district) level** — the hokim's jurisdiction
- **~9,400+ mahallas** nationwide; each tuman has ~30–80 mahallas
- Hokim's current morning briefing workflow is verbal, filtered, and blind to Telegram groups
- Key insight: Telegram groups are where civic signals live first and most authentically — before formal complaint channels
- **>70% Telegram penetration** in Uzbekistan; all levels of government use it
- Full Uzbek terminology reference (mahalla, tuman, hokimiyat, rais, suv, gaz, etc.)
- **7 open questions for PRD discovery:**
  1. How many mahallas in the pilot district?
  2. Mahalla-level breakdown vs. district totals?
  3. Are mahalla groups public or private?
  4. Sender name visibility policy?
  5. What does the hokim consider "hokim-related"?
  6. Will rais chairs be informed about the bot?
  7. Does the pilot district already have active Telegram groups?

#### 5. Supporting Files Created
- **`user-client-preferences-log.md`** — Initialized with all confirmed preferences from this session (technology, architectural, product, workflow). To be updated at end of each session.

#### 6. All Changes Committed and Pushed to GitHub
Three commits on `main`:
- `9dbf9d9` — Initial technical + domain research artifacts
- `1fad26b` — Pre-filter stack + Gemini switch + all document updates (115 insertions, 72 deletions)
- `77f74fd` — `user-client-preferences-log.md` initialized

---

### Current Project State

| Artifact | Status |
|---|---|
| `project-raw-idea.md` | ✅ Source document — do not modify |
| Technical Research | ✅ Complete, reviewed, updated, committed |
| Domain Research | ✅ Complete, committed |
| User-Client Preferences Log | ✅ Initialized, committed |
| PRD | ❌ Not started |
| UX Design | ❌ Not started |
| Architecture Document | ❌ Not started |
| Epics & Stories | ❌ Not started |

---

### Current Technical Decisions

> Research-grounded decisions are technically stable. Rows marked **⚙️** are preference-based — check `user-client-preferences-log.md` for the latest, as they may be updated.

| Decision | Value |
|---|---|
| Architecture | Modular Monolith |
| Bot framework | grammY (Node.js/TypeScript) + webhooks |
| Queue | Redis + BullMQ (20-min repeatable job) |
| AI Classifier ⚙️ | Google Gemini 2.5 Flash, `thinkingBudget: 0`, `temperature: 0` |
| Database | PostgreSQL |
| Backend API | Fastify (Node.js/TypeScript) |
| Auth ⚙️ | Session-based (not JWT) |
| Infra | Single VPS + Docker Compose + Nginx + Let's Encrypt |
| Batch strategy | Real-time API calls (not async Batch API) |
| Pre-filter stack | F1 (bot sender) → F2 (non-text) → F3 (trivial) — centralized, deferred to Architecture |
| `hokim_related` | Boolean flag only, never a category enum value |
| Signal retention ⚙️ | 90 days |
| Raw message retention | Delete after classification |
| Pilot monthly cost | ~$7–9.50/month total |

---

_Last updated: 2026-05-15_
