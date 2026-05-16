# Previous Chat Session Context

> **Purpose:** This file is updated at the end of each working session. It gives the AI assistant in the next session immediate, accurate context about current project state — what was done and what was decided. Read this before starting any new work on Mahalla Ovozi.

---

## Session: 2026-05-16

### What Was Accomplished

#### 1. Technical Research — SDK and Pricing Corrections Applied
File: `_bmad-output/planning-artifacts/research/technical-telegram-ai-pipeline-research-2026-05-13.md`

Two critical corrections applied at the start of this session:
- **SDK migration:** `@google/generative-ai` → `@google/genai` (deprecated SDK removed; unified SDK required for `thinkingConfig` and `responseSchema`)
- **Pricing correction:** Gemini 2.5 Flash is ~2.8× more expensive than GPT-4o-mini at standard rates. Revised total pilot cost to **~$9.50–23/month** (vs. previous ~$7–9.50/month). Gemini is still the primary choice due to official Uzbek support and `responseSchema` integration. GPT-4o-mini remains listed as cost fallback.
- **BullMQ syntax:** `repeat` + `cron` → `upsertJobScheduler` (v5.16.0+ standard for repeatable jobs)

#### 2. PRD — Fully Completed (12-step bmad-create-prd workflow)
File: `_bmad-output/planning-artifacts/prd.md`

All 12 workflow steps completed. Final document contains:

| Section | Key Decisions |
|---|---|
| **Executive Summary** | Signal legibility for leadership; not a complaint portal; 20-min batch; ~40–50% pre-filter discard |
| **Project Classification** | GovTech, High Complexity, Greenfield, Private Internal Tool |
| **Success Criteria** | Behavioral (hokim trusts the lanes); AI accuracy targets directional until pilot data exists; 2–4 week pilot review |
| **Product Scope** | Single MVP release; no additions until pilot proven; Growth/Vision deferred entirely |
| **User Journeys** | 4 journeys: hokimi signal scan, mahalla investigation, staff monitoring, operator health check |
| **Domain Requirements** | Hokim owns all policy (data law, sender display, residency); developer owns security/retention/auth only |
| **Web App Requirements** | SPA (React/Next.js), desktop-only (1366×768 min), light mode, no SSE/WebSocket, 60s poll |
| **Project Scoping** | Single release; all 12 must-have capabilities listed; no nice-to-have deferrals |
| **Functional Requirements** | FR1–FR34 across 8 capability areas (Signal Display, Context Drawer, Filtering, Intake, AI Pipeline, Storage, Auth, Health) |
| **Non-Functional Requirements** | NFR1–15: performance targets, security controls, reliability guarantees, pilot-scale scalability |

#### 3. Key Clarifications Locked During PRD

- **"Morning briefing" framing rejected:** Domain research mentioned hokim's current verbal morning briefing as background context. This was incorrectly bleeding into journey narratives. Corrected: the dashboard is on-demand, time-agnostic. Never assume usage is tied to a specific time or schedule.
- **No AI accuracy hard targets in MVP:** Developer has not yet tested classifier on real groups. Hard accuracy thresholds will be set after real-group pilot data. PRD records directional targets only.
- **No vanity metrics in success criteria:** Signal counts, user activity charts, and similar analytics are not success criteria. Success is behavioral: hokim can reliably scan signals faster than reading raw chats.
- **Scope discipline:** MVP is exactly `project-raw-idea.md §6`. No additions regardless of how "small" they seem. Prove the concept first.

---

### Current Project State

| Artifact | Status |
|---|---|
| `project-raw-idea.md` | ✅ Source document — do not modify |
| Technical Research | ✅ Complete, reviewed, updated (SDK + pricing + BullMQ fixes applied) |
| Domain Research | ✅ Complete |
| User-Client Preferences Log | ✅ Updated (2026-05-16) |
| **PRD** | ✅ **Complete** — all 12 workflow steps done |
| UX Design | ❌ Not started |
| Architecture Document | ❌ Not started |
| Epics & Stories | ❌ Not started |

---

### Current Technical Decisions

> Research-grounded decisions are technically stable. Rows marked **⚙️** are preference-based — check `user-client-preferences-log.md` for the latest.

| Decision | Value |
|---|---|
| Architecture | Modular Monolith |
| Bot framework | grammY (Node.js/TypeScript) + webhooks |
| Queue | Redis + BullMQ v5.16.0+ (`upsertJobScheduler`) |
| AI Classifier ⚙️ | Google Gemini 2.5 Flash, `thinkingBudget: 0`, `temperature: 0` |
| Gemini SDK | `@google/genai` (NOT deprecated `@google/generative-ai`) |
| Database | PostgreSQL |
| Backend API | Fastify (Node.js/TypeScript) |
| Frontend | SPA (React or Next.js), REST + 60s polling, no WebSocket |
| Auth ⚙️ | Session-based (not JWT), `httpOnly` + `secure` cookies |
| Infra | Single VPS + Docker Compose + Nginx + Let's Encrypt |
| Batch strategy | Real-time API calls every 20 min via BullMQ job scheduler |
| Pre-filter stack | F1 (bot sender) → F2 (non-text) → F3 (trivial) — centralized in Architecture phase |
| `hokim_related` | Boolean flag only, never a category enum value |
| Signal retention ⚙️ | 90 days |
| Raw message retention | Delete after successful classification in same batch run |
| Pilot monthly cost | **~$9.50–23/month** (revised; Gemini standard pricing) |
| Display target | Large desktop (1920×1080+); minimum laptop (1366×768); no mobile |
| Browser support | Chrome, Firefox, Edge — latest stable only |

---

### Immediate Next Steps (Start of Next Session)

The PRD is complete. The recommended next actions in order:

1. **Option A — Validate:** Run `bmad-check-implementation-readiness` to confirm PRD is implementation-ready before architecture/UX work begins.
2. **Option B — UX Design:** Run `bmad-create-ux-design` (agent: Sally) — dashboard interaction patterns and component specs from FR1–FR34 and the 4 user journeys.
3. **Option C — Architecture:** Run `bmad-create-architecture` (agent: Winston) — system design from FR/NFR list and tech research.
4. **Option D — Epics & Stories:** Run `bmad-create-epics-and-stories` to break FRs into sprint-ready units.

Recommended order: Validate → UX → Architecture → Epics.

---

_Last updated: 2026-05-16_
