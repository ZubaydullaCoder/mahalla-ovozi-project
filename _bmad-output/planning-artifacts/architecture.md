---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report-2026-05-18.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/index.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/executive-summary.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/core-user-experience.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/desired-emotional-response.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/ux-pattern-analysis-inspiration.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/design-system-foundation.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/defining-core-experience.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/visual-design-foundation.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/design-direction-decision.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/user-journey-flows.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/component-strategy.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/ux-consistency-patterns.md'
  - '_bmad-output/planning-artifacts/ux-design-specification/responsive-design-accessibility.md'
  - '_bmad-output/planning-artifacts/research/domain-mahalla-governance-research-2026-05-13.md'
  - '_bmad-output/planning-artifacts/research/technical-telegram-ai-pipeline-research-2026-05-13.md'
  - '_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-17.md'
  - 'user-client-preferences-log.md'
workflowType: 'architecture'
status: 'complete'
lastStep: 8
completedAt: '2026-05-22'
project_name: 'mahalla-ovozi'
user_name: 'Zubaydulla'
date: '2026-05-22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements (34 total):**
Seven groups: Signal Display (FR1вЂ“6), Context Drawer (FR7вЂ“10), Filtering & Search (FR11вЂ“15), Message Intake (FR16вЂ“19), AI Classification Pipeline (FR20вЂ“25), Signal Storage (FR26вЂ“28), Access & Authentication (FR29вЂ“32), Operational Health (FR33вЂ“34). All 34 FRs have zero epic coverage at this stage вЂ” architecture must enable story decomposition.

**Non-Functional Requirements (15 total):**
Performance: 3s initial load, 300ms client ops, 500ms drawer open, 60s background poll. Security: HTTPS only, httpOnly/secure session cookies, env-only secrets, webhook validation, disk encryption. Reliability: 99% webhook uptime, 3-retry AI recovery, daily backup, idempotent pipeline. Scalability: 5 groups + 1,000 msg/day pilot load, no architectural changes needed.

**Scale & Complexity:**
High complexity вЂ” dual-process runtime (web + worker), two external integrations (Telegram + AI), stateful async pipeline, strict client/server data boundary contract, WCAG 2.1 AA target, Uzbek Cyrillic enforcement, district-scoped multi-user auth.

- Primary domain: Full-stack TypeScript (bot intake + async worker + REST API + React SPA)
- Complexity level: High
- Estimated architectural components: 7 modules (bot, classifier, signals, auth, health, shared, web)

### Technical Constraints & Dependencies

- grammY + Telegram webhook (production); ngrok/tunnel for local development
- `@google/genai` SDK only; exact syntax must be verified during implementation
- Ant Design v5 with ConfigProvider tokens; no Tailwind
- `@tanstack/react-virtual` for lane virtualization (>50 cards threshold)
- Drizzle ORM; PostgreSQL schema-as-code
- Zod for all runtime validation (AI output, API inputs, env config)
- Session auth via secure httpOnly cookies; PostgreSQL-backed session store
- Single VPS: Docker Compose, Nginx + Let's Encrypt, Redis + PostgreSQL colocated
- BullMQ scheduler API version must be verified during package selection
- AI model/provider: configurable via env; provisionally Gemini-family
- Pre-filter thresholds: provisional until real-data validation

### Cross-Cutting Concerns Identified

1. **District-scoped data isolation** вЂ” middleware guard on all API routes
2. **Pre-filter pipeline centralization** вЂ” `src/bot/filters/pipeline.ts` only
3. **Uzbek Cyrillic string enforcement** вЂ” typed `strings.ts` dictionary + lint check
4. **Health state propagation** вЂ” `batch_health` в†’ `/api/health` в†’ 60s poll в†’ amber banner
5. **Idempotency** вЂ” `telegram_update_id` UNIQUE constraint; idempotent batch worker
6. **Security secrets** вЂ” four env-only secrets; webhook header validation on every intake request
7. **AI output validation** вЂ” Zod-validated before every write; invalid = retry or log, never silently accepted
8. **Configurable AI provider** вЂ” env config, single prompt template location

### Open Architectural Questions to Resolve

1. Drawer scope: query by `mahalla_id` or `telegram_chat_id`? (Critical if one mahalla maps to multiple monitored Telegram groups)
2. AI model + provider final selection (after implementation-time validation)
3. Pre-filter thresholds (after real mahalla data testing)
4. Session store implementation (`connect-pg-simple` vs Redis-backed)
5. Whether to retain a small sample of ignored messages during classifier tuning

---

## Starter Template Evaluation

### Primary Technology Domain

Custom full-stack TypeScript modular monolith вЂ” no single off-the-shelf starter covers the bot intake + async worker + REST API + React SPA shape. The foundation is a hand-structured npm workspaces monorepo aligned to the two runtime processes required by the PRD.

### Starter Options Considered

| Option | Assessment |
|---|---|
| T3 Stack / create-t3-app | Next.js + Prisma opinionated; no bot/worker pattern; rejected |
| Fastify Forge (Nx monorepo) | Includes Drizzle but uses Better Auth, not session cookies; Nx overhead unjustified for solo dev |
| create-vite + manual workspace | вњ… Chosen вЂ” minimal, well-maintained, exact module control |

### Selected Approach: Manual npm Workspaces Monorepo

**Rationale:** The project has two distinct runtime processes (web + worker) that share a TypeScript codebase but must not interfere at runtime. npm workspaces with a flat `apps/` directory is the simplest structure that achieves this without introducing Nx/Turborepo overhead for a solo developer.

### Initialization Commands

```bash
# Root workspace init
npm init -y

# Frontend SPA
npm create vite@latest apps/web -- --template react-ts

# Backend (server + bot + worker)
mkdir -p apps/server && cd apps/server && npm init -y
```

Root `package.json` workspace config:
```json
{
  "workspaces": ["apps/*"],
  "private": true
}
```

### Architectural Decisions Established by This Foundation

**Language & Runtime:**
- TypeScript throughout; strict mode enabled; root `tsconfig.json` + per-app extends
- Node.js 20+ LTS; `tsx` for development, compiled JS for production Docker images

**Package Versions (verified May 2026):**
- `fastify` v5.8.5
- `drizzle-orm` v0.45.2 + `drizzle-kit` (latest) + `postgres.js` driver
- `bullmq` v5.x вЂ” scheduler via `upsertJobScheduler` (replaces repeatable jobs API, introduced in v5.16.0)
- `grammy` (current stable) вЂ” `webhookCallback(bot, "fastify")` for Fastify integration
- `antd` v5.x вЂ” `ConfigProvider` token theming, no Tailwind
- `@tanstack/react-query` v5.x вЂ” server state caching in SPA
- `@tanstack/react-virtual` вЂ” lane virtualization (>50 cards threshold)
- `zod` вЂ” runtime validation for env config, API inputs, and AI output

**Build Tooling:**
- Frontend: Vite (HMR dev server, optimized production bundle)
- Backend: `tsx` for dev watch, `tsc` compile for production Docker image
- Linting: ESLint with TypeScript rules

**Testing Framework:**
- Unit tests: Vitest (shared across server and web workspaces)
- E2E: planned post-pilot via `bmad-qa-generate-e2e-tests`

**Project Structure:**
```
mahalla-ovozi/
в”њв”Ђв”Ђ apps/
в”‚   в”њв”Ђв”Ђ server/              в†ђ Fastify web process + bot intake + BullMQ worker
в”‚   в”‚   в””в”Ђв”Ђ src/
в”‚   в”‚       в”њв”Ђв”Ђ bot/         в†ђ grammY setup, webhook handler, filters/pipeline.ts
в”‚   в”‚       в”њв”Ђв”Ђ classifier/  в†ђ AI classification, prompt template, Zod output schema
в”‚   в”‚       в”њв”Ђв”Ђ signals/     в†ђ signal query/storage/retention logic
в”‚   в”‚       в”њв”Ђв”Ђ auth/        в†ђ session middleware, login/logout routes
в”‚   в”‚       в”њв”Ђв”Ђ health/      в†ђ /api/health endpoint, batch_health queries
в”‚   в”‚       в”њв”Ђв”Ђ shared/      в†ђ db client, env config, types
в”‚   в”‚       в”њв”Ђв”Ђ worker/      в†ђ BullMQ scheduler + processor entry point
в”‚   в”‚       в””в”Ђв”Ђ web/         в†ђ Fastify server entry point (API + webhook routes)
в”‚   в””в”Ђв”Ђ web/                 в†ђ React + Vite SPA
в”‚       в””в”Ђв”Ђ src/
в”‚           в”њв”Ђв”Ђ components/  в†ђ LaneGrid, LaneColumn, SignalCard, Drawer wrappers
в”‚           в”њв”Ђв”Ђ pages/       в†ђ DashboardPage, LoginPage
в”‚           в”њв”Ђв”Ђ api/         в†ђ TanStack Query hooks
в”‚           в”њв”Ђв”Ђ strings.ts   в†ђ Typed Uzbek Cyrillic UI string dictionary
в”‚           в””в”Ђв”Ђ theme.ts     в†ђ AntD ConfigProvider token overrides
в”њв”Ђв”Ђ drizzle/                 в†ђ Generated SQL migrations
в”њв”Ђв”Ђ drizzle.config.ts
в”њв”Ђв”Ђ docker-compose.yml
в””в”Ђв”Ђ package.json             в†ђ npm workspaces root
```

**Development Scripts:**
- `npm run dev:web` вЂ” Vite SPA dev server
- `npm run dev:server` вЂ” Fastify server with tsx watch
- `npm run dev:worker` вЂ” BullMQ worker with tsx watch
- ngrok/cloudflare tunnel required for local Telegram webhook testing

**Note:** Project workspace initialization is the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Drawer context query scope: `mahalla_id` (not `telegram_chat_id`)
- Session store: Redis-backed via `@fastify/session` + `ioredis`
- Login mechanism: username/password in `users` table, `argon2` hashing

**Important Decisions (Shape Architecture):**
- Ignored message debug sampling: configurable via `RETAIN_IGNORED_SAMPLE_SIZE` env var (integer, default 0 = disabled)
- API versioning: none for MVP
- Global UI state: React built-ins only (`useState` + `useReducer`), no Zustand/Redux
- Routing: React Router v6, two routes only (`/login`, `/`)
- Docker Compose: separate `server` and `worker` services sharing one built image

**Deferred Decisions (Post-MVP):**
- CI/CD GitHub Actions pipeline
- Managed PostgreSQL/Redis (post-pilot cost analysis)
- `prefers-reduced-motion` CSS support
- Tablet/iPad breakpoint layout

---

### Data Architecture

**Database:** PostgreSQL 16 via Docker Compose. Drizzle ORM v0.45.2 schema-as-code. Driver: `postgres.js`. Migrations: `npx drizzle-kit generate` + `npx drizzle-kit migrate`.

**Drawer context scope:** `mahalla_id` вЂ” the drawer fetches all signals for `category = X AND mahalla_id = Y AND time_range`. This correctly aggregates across multiple Telegram groups belonging to the same mahalla. `telegram_chat_id` is used only for bot group routing, not for signal queries.

**Two-stage discard model (important — these are distinct populations):**

Messages are discarded at two separate stages. Conflating them causes incorrect classifier tuning.

- **Stage 1 — Pre-filter discard (at webhook intake, in `pipeline.ts`):** Messages rejected by F1/F2/F3 filters are never written to `raw_messages`. They are counted in structured `pino` logs at `info` level (`{ stage: 'prefilter', reason: 'bot_sender' | 'non_text' | 'trivial', districtId }`) and summarized in `batch_health.pre_filter_discards` per batch run. These discards are NOT accessible via `RETAIN_IGNORED_SAMPLE_SIZE` — they never reach the DB.

- **Stage 2 — AI-classified-as-ignore (at batch time, in `batch-processor.ts`):** Messages that pass pre-filtering but are classified by AI as non-civic signals. These exist in `raw_messages` and are deleted after classification. `RETAIN_IGNORED_SAMPLE_SIZE` controls how many of these are retained per district for classifier tuning review.

**`RETAIN_IGNORED_SAMPLE_SIZE` scope clarification:** `RETAIN_IGNORED_SAMPLE_SIZE` env var (integer, default 0). When > 0, the batch worker retains up to N most-recent AI-classified-as-ignore `raw_messages` per district. All other AI-ignored messages are deleted. Disabled by default in production after pilot tuning completes. Pre-filter discards are never in scope for this flag.

**Caching strategy:** No application-level cache for MVP. Redis is used exclusively for BullMQ queue backing store and session storage. Signal queries hit PostgreSQL directly. At pilot load (в‰¤1,000 msg/day), query latency is acceptable without a cache layer.


**Migration approach:** Drizzle Kit generates SQL migration files committed to the repo. Applied on deploy via `npx drizzle-kit migrate` in the server container entrypoint before starting Fastify.

---

### Database Schema

All tables use Drizzle schema-as-code in `apps/server/src/shared/schema/`. Column types use Drizzle's `postgres-js` dialect. All timestamps are stored as UTC and returned as UTC ISO 8601 strings.

#### `districts`

```typescript
// apps/server/src/shared/schema/districts.ts
export const districts = pgTable('districts', {
  id:        serial('id').primaryKey(),
  name:      varchar('name', { length: 200 }).notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
```

#### `mahallas`

```typescript
// apps/server/src/shared/schema/mahallas.ts
export const mahallas = pgTable('mahallas', {
  id:               serial('id').primaryKey(),
  district_id:      integer('district_id').notNull().references(() => districts.id),
  name:             varchar('name', { length: 200 }).notNull(),
  // IMPORTANT: mode:'bigint' required — Telegram supergroup IDs are negative int64 values
  // (e.g. -1001234567890) that exceed Number.MAX_SAFE_INTEGER. mode:'number' would corrupt them.
  telegram_chat_id: bigint('telegram_chat_id', { mode: 'bigint' }).notNull().unique(),
  bot_status:       varchar('bot_status', { length: 20 }).notNull().default('active'),
    // 'active' | 'removed' | 'unknown'
  bot_last_seen_at: timestamp('bot_last_seen_at'),
  created_at:       timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  idx_mahallas_district:      index('idx_mahallas_district_id').on(t.district_id),
  idx_mahallas_telegram_chat: index('idx_mahallas_telegram_chat_id').on(t.telegram_chat_id),
}));
```

**Telegram routing note:** `telegram_chat_id` is the canonical link between an incoming Telegram update and a mahalla. On every bot message intake, `pipeline.ts` looks up `mahallas` by `telegram_chat_id` to resolve the `mahalla_id` and `district_id`. If no matching row exists, the message is discarded and logged with `warn` level. Operator registers each monitored group by inserting a `mahallas` row (via seed script or admin CLI) before the bot is added to the group.

#### `users`

```typescript
// apps/server/src/shared/schema/users.ts
export const users = pgTable('users', {
  id:            serial('id').primaryKey(),
  district_id:   integer('district_id').notNull().references(() => districts.id),
  username:      varchar('username', { length: 100 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  is_active:     boolean('is_active').notNull().default(true),
  created_at:    timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  idx_users_district: index('idx_users_district_id').on(t.district_id),
}));
```

#### `raw_messages`

```typescript
// apps/server/src/shared/schema/raw-messages.ts
export const rawMessages = pgTable('raw_messages', {
  id:                  serial('id').primaryKey(),
  // update_id is a global monotonic counter — safe as JS number for current Telegram scale.
  telegram_update_id:  bigint('telegram_update_id', { mode: 'number' }).notNull().unique(),
  // message_id is per-chat. Stored for future deep-linking (t.me/c/chatid/messageid).
  telegram_message_id: bigint('telegram_message_id', { mode: 'number' }).notNull(),
  // chat_id: mode:'bigint' — supergroup IDs exceed Number.MAX_SAFE_INTEGER.
  chat_id:             bigint('chat_id', { mode: 'bigint' }).notNull(),
  district_id:         integer('district_id').notNull().references(() => districts.id),
  mahalla_id:          integer('mahalla_id').notNull().references(() => mahallas.id),
  sender_is_bot:       boolean('sender_is_bot').notNull().default(false),
  sender_display_name: varchar('sender_display_name', { length: 300 }),
  sender_username:     varchar('sender_username', { length: 100 }),
  text:                text('text').notNull(),
  text_source:         varchar('text_source', { length: 10 }).notNull(),
    // 'text' | 'caption'
  telegram_timestamp:  timestamp('telegram_timestamp').notNull(),
  created_at:          timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  idx_raw_messages_district:   index('idx_raw_messages_district_id').on(t.district_id),
  idx_raw_messages_mahalla:    index('idx_raw_messages_mahalla_id').on(t.mahalla_id),
  idx_raw_messages_created_at: index('idx_raw_messages_created_at').on(t.created_at),
}));
```

**Idempotency:** `telegram_update_id` UNIQUE constraint prevents duplicate intake. All inserts use `.onConflictDoNothing()`.

#### `signal_messages`

```typescript
// apps/server/src/shared/schema/signal-messages.ts
export const signalMessages = pgTable('signal_messages', {
  id:                  serial('id').primaryKey(),
  telegram_update_id:  bigint('telegram_update_id', { mode: 'number' }).notNull().unique(),
  // message_id copied from raw_messages for future deep-linking capability.
  telegram_message_id: bigint('telegram_message_id', { mode: 'number' }).notNull(),
  district_id:         integer('district_id').notNull().references(() => districts.id),
  mahalla_id:          integer('mahalla_id').notNull().references(() => mahallas.id),
  sender_display_name: varchar('sender_display_name', { length: 300 }),
  sender_username:     varchar('sender_username', { length: 100 }),
  telegram_timestamp:  timestamp('telegram_timestamp').notNull(),
  raw_text:            text('raw_text').notNull(),
  text_source:         varchar('text_source', { length: 10 }).notNull(),
    // 'text' | 'caption'
  category:            varchar('category', { length: 20 }).notNull(),
    // 'water' | 'electricity' | 'gas' | 'waste'
  hokim_related:       boolean('hokim_related').notNull().default(false),
  tone:                varchar('tone', { length: 20 }).notNull(),
    // 'complaint' | 'announcement' | 'praise' | 'question'
  short_label:         varchar('short_label', { length: 100 }),
  classified_at:       timestamp('classified_at').notNull(),
  created_at:          timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  idx_signal_messages_mahalla_id:  index('idx_signal_messages_mahalla_id').on(t.mahalla_id),
  idx_signal_messages_district_id: index('idx_signal_messages_district_id').on(t.district_id),
  idx_signal_messages_category:    index('idx_signal_messages_category').on(t.category),
  idx_signal_messages_timestamp:   index('idx_signal_messages_telegram_timestamp').on(t.telegram_timestamp),
  idx_signal_messages_hokim:       index('idx_signal_messages_hokim_related').on(t.hokim_related),
}));
```

**Retention:** Signals older than 90 days are purged by a daily scheduled BullMQ job. See Infrastructure & Deployment section.

#### `batch_health`

```typescript
// apps/server/src/shared/schema/batch-health.ts
export const batchHealth = pgTable('batch_health', {
  id:                   serial('id').primaryKey(),
  district_id:          integer('district_id').notNull().references(() => districts.id),
  status:               varchar('status', { length: 20 }).notNull(),
    // 'ok' | 'failed' | 'running'
  started_at:           timestamp('started_at').notNull(),
  completed_at:         timestamp('completed_at'),
  messages_fetched:     integer('messages_fetched').notNull().default(0),
  signals_written:      integer('signals_written').notNull().default(0),
  ignored_count:        integer('ignored_count').notNull().default(0),
  // pre_filter_discards: Stage-1 discards counted at intake time and written here
  // at batch completion. Required by FR33 (operator health: pre-filter discard counts).
  // Breakdown by reason is in pino logs; this field gives the aggregate per batch run.
  pre_filter_discards:  integer('pre_filter_discards').notNull().default(0),
  error_message:        text('error_message'),
}, (t) => ({
  idx_batch_health_district:   index('idx_batch_health_district_id').on(t.district_id),
  idx_batch_health_started_at: index('idx_batch_health_started_at').on(t.started_at),
}));
```

`/api/health` reads the most recent row per district. `last_batch_at` is `completed_at` of the most recent `status = 'ok'` row. `pre_filter_discards` is surfaced in the operator health endpoint alongside `ignored_count` (AI-classified discards) to satisfy FR33.

---



### Authentication & Security

**Auth mechanism:** Username/password stored in `users` table. Passwords hashed with `argon2`. No email flow. Operator creates accounts manually via seed script or admin CLI command.

**Session store:** `@fastify/session` + Redis-backed store via connect-store interface + `ioredis`. Redis is already running for BullMQ — no additional infrastructure. Session TTL: 8 hours. Cookie flags: `httpOnly: true`, `secure: true`, `sameSite: 'strict'`.

> **Implementation verification required (IMP-4):** Confirm `@fastify/session` v5+ is compatible with Fastify v5.8.5 and identify the correct Redis session store adapter (e.g., `connect-redis` v4+). Alternative if blocked: `@fastify/secure-session` (cookie-based encrypted session — no Redis adapter needed, uses SESSION_SECRET directly).

**CSRF protection:** `sameSite: 'strict'` on the session cookie prevents cross-origin cookie submission, providing CSRF protection without a separate token. No additional CSRF mechanism is needed for MVP. Never change `sameSite` to `'lax'` or `'none'` without re-evaluating CSRF exposure.

**Authorization:** Middleware guard on all `/api/*` routes (except `/api/auth/*`). Guard reads `session.userId` + `session.districtId` and injects `districtId` into all downstream DB queries. No signal is ever returned without a `WHERE district_id = ?` clause.

**Login rate limiting (IMP-7):** `POST /api/auth/login` enforces 5 attempts per username per 60-second window. Implement as a simple in-memory counter map in `auth/routes.ts` (key: username, value: `{ count, windowStart }`). Reset window on expiry. Return HTTP 429 when exceeded. Prevents brute-force attacks on operator credentials.

**Telegram webhook security:** Every incoming update validated via `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET` env var. Requests failing this check are rejected HTTP 401 before any processing.

**grammY Fastify v5 compatibility (IMP-6):** Verify that `grammy` current stable supports `webhookCallback(bot, 'fastify')` with Fastify v5.8.5 before writing the bot intake story. If incompatible, a thin custom handler is trivial: parse `req.body`, call `bot.handleUpdate(req.body)`, reply 200.

**Secrets:** Four env-only secrets — `BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `AI_API_KEY`, `SESSION_SECRET`. Never logged, never committed.

---

### API & Communication Patterns

**Design:** REST. No versioning for MVP (single internal SPA client, co-deployed with server).

**Key endpoints:**
```
GET  /api/signals?category=&hokim_related=&mahalla_id=&from=&to=
GET  /api/signals/:id/context?from=&to=
GET  /api/mahallas
GET  /api/health
POST /api/auth/login
POST /api/auth/logout
```

**Context endpoint — two-step server lookup:**
`GET /api/signals/:id/context?from=&to=` performs two steps internally:
1. Fetch `signal_messages` by `:id` → extract `category` and `mahalla_id` from that row.
2. Query `signal_messages WHERE category = ? AND mahalla_id = ? AND district_id = ? AND telegram_timestamp BETWEEN from AND to ORDER BY telegram_timestamp ASC`.

The `from` and `to` query params are the user's currently active time-range filter (passed by the SPA). The `district_id` is always sourced from `req.session.districtId`, never from the request.

**API response type shapes:**

```typescript
// apps/server/src/shared/types.ts  (canonical — SPA mirrors these at HTTP boundary)

interface Signal {
  id:                 number;
  telegramUpdateId:   number;
  districtId:         number;
  mahallaId:          number;
  mahallaName:        string;
  senderDisplayName:  string | null;
  senderUsername:     string | null;
  telegramTimestamp:  string;          // ISO 8601 UTC
  rawText:            string;
  textSource:         'text' | 'caption';
  category:           'water' | 'electricity' | 'gas' | 'waste';
  hokimRelated:       boolean;
  tone:               'complaint' | 'announcement' | 'praise' | 'question';
  shortLabel:         string | null;
  classifiedAt:       string;          // ISO 8601 UTC
}

interface Mahalla {
  id:             number;
  districtId:     number;
  name:           string;
}

interface BotConnectivity {
  mahallaId:   number;
  mahallaName: string;
  botStatus:   'active' | 'removed' | 'unknown';
  botLastSeenAt: string | null;        // ISO 8601 UTC
}

interface HealthStatus {
  lastBatchAt:      string | null;     // ISO 8601 UTC; null if no batch has run
  queueDepth:       number;
  botConnectivity:  BotConnectivity[];
  errorsLastRun:    string | null;
  status:           'ok' | 'failed' | 'running' | 'never_run';
}
```

**`mahallaName` join:** Signal query joins `signal_messages` with `mahallas` on `mahalla_id` so the API returns `mahallaName` directly. SPA does not need a separate mahalla lookup to display the card.

**Error shape (Fastify v5 default serializer):**
```json
{ "statusCode": 400, "error": "Bad Request", "message": "..." }
```
All 4xx/5xx responses follow this shape. No custom error codes in MVP.

**Bot webhook endpoint:** `POST /webhook` вЂ” registered as a Fastify route, processed via `webhookCallback(bot, "fastify")`. Not under `/api/` namespace. Must respond within 10 seconds; all heavy work is queued asynchronously.

**Rate limiting:** Not implemented for MVP. Internal tool, closed network. Revisit post-pilot.

---

### Frontend Architecture

**State management:**
- Server state: `@tanstack/react-query` v5.x — signals fetch, mahallas fetch, health poll (60s `refetchInterval`)
- UI state: React `useState` + `useReducer` in `DashboardPage` — active filter, active signal ID, drawer open state. No Zustand/Redux.

**Routing:** React Router v6. Two routes:
- `/login` — unauthenticated login page
- `/` — authenticated dashboard (redirects to `/login` if no session)

**Component ownership:**
- `DashboardPage` — data fetching, filter state, drawer open/close, lane scroll position state
- `LaneGrid` — layout, virtual scroll instances, active card state
- `SignalCard` — pure presentational, no internal state

**Initial fetch scope and client-side slice boundary:**
- The initial `GET /api/signals` call fetches signals for the **calendar day in UTC+5** (from `00:00:00 UTC+5` of the current day to `now`). This aligns with the hokim's workday mental model — "Today" means from midnight of the current day, not the rolling last 24 hours.
- Time range presets `1 соат`, `3 соат`, `6 соат`, and `Бугун` operate **client-side** by slicing the already-fetched dataset — no additional API call, no skeleton shimmer.
- Time range presets `Кеча` (yesterday) and `7 кун` (7 days) trigger a **new API call** with explicit `from` and `to` query params, showing skeleton shimmer on all lanes during fetch.
- Custom `DatePicker.RangePicker` ranges always trigger a new API call.
- SPA sends `from` and `to` as ISO 8601 UTC strings computed from the user's UTC+5 local time.

**Lane scroll position preservation:**
- `DashboardPage` stores each lane's scroll offset in state (`Record<LaneKey, number>`).
- When the drawer opens, all lane scroll positions are frozen (virtual scroll offsets held).
- When the drawer closes, each lane restores its previous scroll position.
- Filter or time range changes reset all scroll positions to zero (top of lane).

**AntD theme and fonts:** Single `ConfigProvider` at app root with `mahallaTheme` token overrides (`theme.ts`). All category color tokens defined there. No ad-hoc color literals in components. `index.html` loads Inter via Google Fonts with `display=swap` and `latin,latin-ext,cyrillic` subset for Uzbek Cyrillic rendering.

**Uzbek Cyrillic enforcement:** `scripts/check-uz-strings.ts` Vitest test imports `strings.ts` and fails on known Latin slip-throughs (`soat`, `Bugun`, `Qidirish`, `Barcha`, `mahallalar`). Treated as a build failure. Run manually before PR merge until CI exists.

---


### Infrastructure & Deployment

**Docker Compose services:**
```yaml
services:
  postgres:   # PostgreSQL 16-alpine
  redis:      # Redis 7-alpine
  server:     # Fastify API + bot webhook (CMD: node dist/web/index.js)
  worker:     # BullMQ classifier worker (same image, CMD: node dist/worker/index.js)
  nginx:      # Reverse proxy + HTTPS (Let's Encrypt)
```
`server` and `worker` share a single Docker image. Different `CMD` entry points enforce process isolation. Worker crashes do not affect the API or webhook intake.

**Docker build context — critical:** The `Dockerfile` is located at `apps/server/Dockerfile`, but the Docker build context **must be the repository root** (not `./apps/server`), because the server container entrypoint runs `npx drizzle-kit migrate` which needs `drizzle.config.ts` and `drizzle/migrations/` at the repo root:
```yaml
# docker-compose.yml
server:
  build:
    context: .                        # repo root — gives access to drizzle.config.ts
    dockerfile: apps/server/Dockerfile
  healthcheck:
    test: ["CMD", "wget", "-qO-", "http://localhost:3001/api/health"]
    interval: 10s
    timeout: 5s
    retries: 5
worker:
  build:
    context: .
    dockerfile: apps/server/Dockerfile
  command: node dist/worker/index.js
  depends_on:
    server:
      condition: service_healthy    # prevents migration race condition (IMP-10)
```

**Migrations on deploy (IMP-10):** Migrations run **only in the `server` container** entrypoint (`npx drizzle-kit migrate && node dist/web/index.js`). The `worker` container does NOT run migrations — it starts only after `server` reports healthy via the healthcheck above. Without `depends_on: service_healthy`, both containers start simultaneously and the worker may attempt DB operations before the schema is ready.

**Session TTL:** Absolute expiry — 8 hours from the time of login. No sliding window for MVP. Cookie expires after 8 hours regardless of activity. The hokim re-authenticates on the next workday. Rationale: simpler to implement; 8 hours covers a full workday with margin.

**Logging:** Fastify `pino` (JSON structured, stdout). `pino-pretty` for local dev. Viewed via `docker compose logs -f server worker`.

**Operator health:** `/api/health` returns `lastBatchAt`, `queueDepth`, `botConnectivity[]`, `errorsLastRun`, `status`. Hokim-facing amber banner reads only `lastBatchAt >= 25min`.

**Bot connectivity health state:**
- `my_chat_member` events are handled in `apps/server/src/bot/index.ts`.
- On bot removal from a group: update `mahallas.bot_status = 'removed'` and `mahallas.bot_last_seen_at = now()` for the matching `telegram_chat_id`.
- On bot re-addition: update `mahallas.bot_status = 'active'`.
- `/api/health` reads `mahallas.bot_status` + `bot_last_seen_at` per district and returns the `botConnectivity[]` array. No separate table required.

**90-day signal retention:**
A daily BullMQ scheduled job (`purge-signals-daily`) runs at 03:00 UTC via `upsertJobScheduler`. It deletes `signal_messages WHERE created_at < NOW() - INTERVAL '90 days'`. Scheduled in `apps/server/src/worker/index.ts` alongside the classifier scheduler. Logs the count of deleted rows at `info` level.

**Backups:** Daily `pg_dump` cron to external S3-compatible storage (e.g., Backblaze B2). Script: `scripts/backup.sh`. Restore procedure documented before pilot launch.

**CI/CD:** Deferred post-pilot. MVP deploy: `git pull && docker compose up --build -d`.

---


### Decision Impact Analysis

**Implementation Sequence (dependency order):**
1. Workspace scaffold + Docker Compose + env config + root tsconfig
2. Drizzle schema + migrations (all 6 tables)
3. Auth module (argon2 + Redis session + middleware guard)
4. Bot intake (grammY + webhook route + pre-filter `pipeline.ts`)
5. Classifier module (AI client + Zod output schema + batch processor)
6. BullMQ worker + scheduler (`upsertJobScheduler`, 20-minute interval)
7. Signals API (query endpoints + `/api/health`)
8. React SPA (`DashboardPage` + `LaneGrid` + `SignalCard` + AntD Drawer)
9. `strings.ts` dictionary + `check-uz-strings.ts` lint test

**Cross-Component Dependencies:**
- `shared/` db client + env config is required by every other module
- Auth middleware must be in place before any signal API route is testable
- Drizzle schema must be finalized before classifier writes `signal_messages`
- `strings.ts` must be populated before any React component renders UI copy
- `/api/health` `last_batch_at` field is the single source of truth for the amber banner
- `RETAIN_IGNORED_SAMPLE_SIZE=0` must be the default to prevent accidental data retention in production

---

## Implementation Patterns and Consistency Rules

### Critical Conflict Points Identified: 9 areas

Naming conventions, API JSON casing, date/time format, test file location, module boundary exports, structured log format, loading state rules, district scope injection, AI output validation.

---

### Naming Patterns

**Database Naming:**

Table names: snake_case plural (signal_messages, raw_messages, batch_health).
Column names: snake_case (telegram_update_id, sender_display_name, hokim_related).
Foreign keys: table_singular_id (district_id, mahalla_id).
Boolean columns: no is_ prefix unless ambiguous (hokim_related, is_active).
Indexes: idx_table_column (idx_signal_messages_mahalla_id).
Enum values: lowercase strings ('water', 'electricity', 'gas', 'waste').

**API Naming:**

Endpoint paths: plural nouns, no trailing slash (/api/signals, /api/mahallas).
Route parameters: :id pattern (/api/signals/:id/context).
Query parameters: snake_case (?mahalla_id=&hokim_related=&from=&to=).

**TypeScript and Code Naming:**

Source files: kebab-case (signal-card.tsx, pipeline.ts, batch-processor.ts).
React components: PascalCase (SignalCard, LaneGrid, DashboardPage).
Functions and hooks: camelCase (useSignals(), classifyMessages()).
Types and interfaces: PascalCase (Signal, Mahalla, ClassifierOutput).
Zod schemas: TypeNameSchema (ClassifierOutputSchema, EnvSchema).
Constants: SCREAMING_SNAKE_CASE (MAX_DRAWER_SIGNALS, BATCH_INTERVAL_MS).
Env variables: SCREAMING_SNAKE_CASE (BOT_TOKEN, DATABASE_URL).

---

### Structure Patterns

Test files: Co-located with source. signal-card.test.tsx lives next to signal-card.tsx. Exception: scripts/check-uz-strings.ts at workspace root.

Import order (top-to-bottom in every file):
1. Node built-ins (node:fs, node:path)
2. External packages (fastify, grammy, zod)
3. Internal workspace (none in MVP)
4. Relative imports (./db, ../shared/types)

Module boundaries: Each module exposes one index.ts barrel only. No cross-module deep imports allowed.

Shared types across API boundary: Server domain types in apps/server/src/shared/types.ts. SPA defines its own matching interfaces at the HTTP boundary. Intentionally duplicated — no shared package for MVP.

  Type sync enforcement (IMP-11): After any API response shape change, BOTH files must be updated
  in the same PR: apps/server/src/shared/types.ts AND apps/web/src/types.ts. Add a cross-reference
  comment at the top of each file: '// Mirror of apps/web/src/types.ts — keep in sync on API changes'
  and '// Mirror of apps/server/src/shared/types.ts — keep in sync on API changes'.
  This duplication is a conscious MVP tradeoff. Post-pilot, consider extracting to packages/shared/.

---

### Format Patterns

API response — direct, unwrapped:
  GET /api/signals  returns Signal[] (not { data: Signal[] })
  GET /api/mahallas returns Mahalla[]
  GET /api/health   returns HealthStatus

JSON field casing — camelCase in all API responses:
Drizzle returns snake_case from DB. A dedicated mapper converts before Fastify serializes. Never expose raw DB column names.
  DB:  { sender_display_name: 'Ali', hokim_related: true }
  API: { senderDisplayName: 'Ali', hokimRelated: true }

Date/time — ISO 8601 strings only: "classifiedAt": "2026-05-22T17:30:00Z". No Unix timestamps in API responses. SPA handles all display formatting.

Null vs undefined: Optional absent fields returned as null, never undefined. Fastify silently drops undefined fields, breaking SPA contracts.

Error shape (Fastify v5 standard applied consistently):
  { "statusCode": 400, "error": "Bad Request", "message": "Human-readable description" }

---

### Communication Patterns

BullMQ job identifiers:
  Classifier queue:
    Queue name: 'classifier'
    Job name:   'classify-batch'
    Scheduler:  'classifier-20min'  (upsertJobScheduler, every 20 min)

  Retention queue:
    Queue name: 'maintenance'
    Job name:   'purge-signals'
    Scheduler:  'purge-signals-daily'  (upsertJobScheduler, every 24h, fires at 03:00 UTC)

AI classifier settings (in ai-client.ts):
  temperature: 0       — deterministic output for classification tasks
  thinking mode: OFF   — disable reasoning tokens when supported by the selected model;
                         add thinkingConfig: { thinkingBudget: 0 } if the SDK exposes it.
  responseMimeType: 'application/json'  — required for structured output
  Verify current syntax for thinkingConfig and responseSchema against @google/genai SDK during
  implementation (SDK API evolves; do not rely on pre-trained knowledge of exact parameter names).

Pino log levels:
  error — Unrecoverable failures (AI down after retries, DB write failure)
  warn  — Recoverable issues (retry attempt, invalid AI schema output)
  info  — Normal operational events (batch started, N messages processed)
  debug — Per-message detail, dev only, never in production

Log call format — structured fields, never string interpolation:
  Correct: log.info({ districtId, messagesProcessed }, 'Batch complete')
  Wrong:   log.info(`Batch complete for district ${districtId}`)

Frontend state — immutable React updates only:
  Correct: setFilter(prev => ({ ...prev, mahallaId: id }))
  Wrong:   filter.mahallaId = id; setFilter(filter)

---



### Process Patterns

Server error handling:
  - Throw new Error(message) with rich context from domain modules
  - Fastify setErrorHandler catches and serializes to standard error shape
  - AI failures: log.warn + retry 3x exponential backoff, then mark batch_health.status = 'failed'
  - Never swallow errors silently

Client error handling:
  - TanStack Query errors: console.error in dev; silent degraded state in prod; no error modals for hokim-facing UI
  - HTTP 401 from any API call redirects to /login

Loading state rules (UX spec enforced as code contract):
  Initial signals fetch        > AntD Skeleton active in all 5 lane columns
  Drawer context fetch         > AntD Skeleton active in drawer body (3 rows)
  Yesterday / 7d preset        > AntD Skeleton active in all 5 lanes
  Client-side filter/search    > NO loading state — instant under 300ms

Never use a spinner. Never show a skeleton on a client-side operation.

AI output — always Zod-parse before DB write:
  Correct:
    const result = ClassifierOutputSchema.safeParse(rawAiJson)
    if (!result.success) { log.warn({ error: result.error, messageId }, 'Invalid'); retry(); return }
    await db.insert(signalMessages).values(mapToDbRow(result.data))
  Wrong:
    const result = rawAiJson as ClassifierOutput

Bot intake idempotency:
  Correct: await db.insert(rawMessages).values(row).onConflictDoNothing()
  Wrong:   await db.insert(rawMessages).values(row)

District scope — session only, never request body:
  Correct: const signals = await getSignals({ districtId: req.session.districtId, ...filters })
  Wrong:   const signals = await getSignals({ districtId: req.body.districtId })

Telegram intake edge cases (handled in pipeline.ts):
  Edited messages:       Telegram `edited_message` updates are ignored. Messages are captured as
                         immutable snapshots at intake time. Re-processing edits is out of MVP scope.
                         pipeline.ts discards updates where `update.edited_message` is defined.

  Forwarded messages:    Treated as original messages. Sender = the forwarder (not the original
                         poster). `forward_from` metadata is not stored in MVP. No special handling.

  Anonymous admin posts: Telegram group anonymous admins send messages via `GroupAnonymousBot`
                         which has `from.is_bot === true`. These are discarded by the F1 bot-sender
                         filter. Known MVP limitation: mahalla rais posts as anonymous admin are
                         not captured. Document in operator setup guide.

Pre-filter criteria (IMP-12 — explicit definition to prevent false negatives):
  pipeline.ts evaluates messages through three sequential filters. A message is discarded if ANY
  filter matches. ALL THREE criteria must be satisfied to reach the AI classifier.

  F1 — Bot sender filter:
    Discard if `update.message.from.is_bot === true`.
    Rationale: bot-generated messages are structural noise, not resident signals.

  F2 — Non-text type filter:
    Discard if `update.message.text` is undefined AND `update.message.caption` is undefined.
    Accept if either field has a non-empty string value (even a single character).
    Rationale: photos/videos/stickers/polls with no textual content are out of MVP scope.

  F3 — Trivial content filter (NARROW — text length thresholds are FORBIDDEN):
    Discard ONLY if the text matches one of these exclusively:
      a. Bot command: text starts with '/' (e.g. /start, /help)
      b. Pure emoji: text matches /^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\s]+$/u with no alphanumeric chars
      c. Empty string after trimming whitespace
    DO NOT discard based on character count. Short civic texts like 'gaz?', 'suv?', 'tok?', 'svet?'
    MUST pass to the AI classifier. These are the highest false-negative risk (PRD validation notes).
    Any expansion of F3 rules requires real mahalla data validation first.

Batch processor district scope (CRIT-4):
  A single BullMQ job (`classify-batch`) processes ALL districts sequentially in one run.
  There is ONE job per scheduler tick — not one job per district. This ensures:
  - No concurrent jobs racing over the same district's raw_messages.
  - No wasted AI calls from duplicate processing (the signal_messages UNIQUE constraint
    would catch duplicates, but wasted AI cost is still undesirable).
  - Simple, predictable execution: district 1 → district 2 → ... → done.
  At pilot scale (1 district), this is trivially correct. Post-pilot with multiple districts,
  evaluate per-district BullMQ job keys with deduplication if sequential processing is too slow.

Batch partial-failure strategy:
  The batch processor handles each raw message sequentially. Write each successful signal immediately
  without waiting for the full batch to complete:

  1. For each active district (sequentially):
     a. Fetch all pending raw_messages for the district.
     b. For each message:
        i.  Call AI classifier.
        ii. Zod-parse the result.
        iii. On success: db.insert(signalMessages) + db.delete(rawMessages by id).
        iv. On AI failure after 3 retries: log.error, skip this message, do NOT delete raw_message.
            The raw_message is retained for retry in the next batch run.
     c. After processing all messages for the district:
        i.  If all succeeded: batch_health.status = 'ok', completed_at = now().
        ii. If any failed: batch_health.status = 'failed', error_message = summary of failed IDs.
            Already-written signals from the same batch are retained (not rolled back).
  2. Do not block on already-committed writes. Partial success is better than full rollback.

Worker graceful shutdown (IMP-9):
  The worker entry point (`apps/server/src/worker/index.ts`) must register SIGTERM and SIGINT
  handlers to drain in-flight jobs before the container stops:

    const worker = new Worker('classifier', processorFn, { connection: redis })
    const gracefulShutdown = async (signal: string) => {
      log.info({ signal }, 'Worker shutting down')
      await worker.close()    // drains in-flight jobs, stops accepting new ones
      await redis.quit()
      process.exit(0)
    }
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT',  () => gracefulShutdown('SIGINT'))

  Without this, a mid-AI-call container kill leaves the BullMQ job in a stalled state.
  BullMQ stall detection will retry it eventually, but this wastes AI API calls.
  With graceful shutdown, the current message completes or the job is released cleanly.

---

### Enforcement Guidelines

All AI Agents MUST:
  - snake_case DB table/column names; camelCase all API JSON fields; PascalCase React components
  - Co-locate test files with source (*.test.ts beside source file)
  - Use a dedicated mapper for snake_case DB rows to camelCase API responses; never expose raw DB fields in API output
  - Use structured pino fields in all log calls; no string interpolation in log messages
  - Show Skeleton only on API-boundary transitions; no loading indicator for client-side operations
  - Zod-parse all AI output before DB write; treat parse failures as retryable errors
  - Inject districtId exclusively from req.session.districtId; reject any request body or param source
  - Use onConflictDoNothing() on every raw_messages insert
  - Return null for absent optional fields; never undefined from Fastify route handlers
  - All user-facing UI strings must be Uzbek Cyrillic — stored in strings.ts only; no inline Latin Uzbek strings in components
  - The hard-block unsupported-screen message is: "Маҳалла Овози фақат компьютер экранида ишлайди" (not Latin)

Pre-PR verification checklist:
  1. npm run lint passes
  2. npm run test passes (includes check-uz-strings.ts)
  3. No snake_case field names in Fastify route handler return values
  4. No districtId sourced from request body or query params
  5. No Latin Uzbek strings visible in the dashboard UI (check strings.ts against the table in ux-consistency-patterns.md)

---

## Project Structure and Boundaries

### Requirements to Structure Mapping

| FR Category | Module / Directory |
|---|---|
| Signal Display (FR1-6) | apps/web/src/pages/dashboard-page.tsx, apps/web/src/components/ |
| Context Drawer (FR7-10) | apps/web/src/components/context-drawer/ |
| Filtering and Search (FR11-15) | apps/web/src/components/filter-bar/, apps/web/src/hooks/use-filters.ts |
| Message Intake (FR16-19) | apps/server/src/bot/, apps/server/src/bot/filters/pipeline.ts |
| AI Classification (FR20-25) | apps/server/src/classifier/ |
| Signal Storage (FR26-28) | apps/server/src/signals/, drizzle/ |
| Auth and Access (FR29-32) | apps/server/src/auth/ |
| Operational Health (FR33-34) | apps/server/src/health/, apps/web/src/components/delay-banner.tsx |

---

### Complete Project Directory Structure

```
mahalla-ovozi/
+-- .env                              < secrets (gitignored)
+-- .env.example                      < template with all required keys
+-- .gitignore
+-- package.json                      < npm workspaces root { "workspaces": ["apps/*"] }
+-- tsconfig.json                     < root base strict TypeScript config
+-- drizzle.config.ts                 < Drizzle Kit config (points to apps/server schema)
+-- docker-compose.yml                < production: postgres, redis, server, worker, nginx
+-- docker-compose.dev.yml            < dev overrides: tsx watch, no nginx
+-- scripts/
¦   L-- check-uz-strings.ts           < Vitest test: scans strings.ts for Latin slip-throughs
+-- drizzle/
¦   L-- migrations/                   < generated SQL migration files (committed to repo)
+-- nginx/
¦   L-- default.conf                  < reverse proxy + HTTPS termination config
+-- apps/
¦   +-- server/
¦   ¦   +-- package.json
¦   ¦   +-- tsconfig.json             < extends root; compiles to dist/
¦   ¦   +-- Dockerfile
¦   ¦   L-- src/
¦   ¦       +-- shared/
¦   ¦       ¦   +-- db.ts             < Drizzle db client (postgres.js driver)
¦   ¦       ¦   +-- env.ts            < EnvSchema (Zod) + validated config export
¦   ¦       ¦   +-- types.ts          < Signal, Mahalla, HealthStatus, ClassifierOutput types
¦   ¦       ¦   L-- schema/
¦   ¦       ¦       +-- index.ts      < re-exports all Drizzle table schemas
¦   ¦       ¦       +-- raw-messages.ts
¦   ¦       ¦       +-- signal-messages.ts
¦   ¦       ¦       +-- mahallas.ts
¦   ¦       ¦       +-- districts.ts
¦   ¦       ¦       +-- users.ts
¦   ¦       ¦       L-- batch-health.ts
¦   ¦       +-- bot/
¦   ¦       ¦   +-- index.ts          < grammY Bot instance; registers message handlers
¦   ¦       ¦   +-- webhook.ts        < Fastify route POST /webhook (webhookCallback)
¦   ¦       ¦   L-- filters/
¦   ¦       ¦       L-- pipeline.ts   < ALL pre-filter logic (F1 bot, F2 type, F3 trivial content)
¦   ¦       +-- classifier/
¦   ¦       ¦   +-- index.ts          < classifyMessages() public function
¦   ¦       ¦   +-- ai-client.ts      < @google/genai client factory (AI_PROVIDER + AI_MODEL from env)
¦   ¦       ¦   +-- prompt.ts         < classification prompt template + few-shot examples
¦   ¦       ¦   +-- schema.ts         < ClassifierOutputSchema (Zod) + ClassifierOutput type
¦   ¦       ¦   L-- batch-processor.ts < fetches pending raw_messages, calls AI, writes signal_messages
¦   ¦       +-- signals/
¦   ¦       ¦   +-- index.ts          < getSignals(), getSignalContext() public functions
¦   ¦       ¦   +-- query.ts          < Drizzle query builders for all signal DB queries
¦   ¦       ¦   L-- mapper.ts         < DB snake_case row -> camelCase API response shape
¦   ¦       +-- auth/
¦   ¦       ¦   +-- index.ts          < registerAuthRoutes() Fastify plugin
¦   ¦       ¦   +-- routes.ts         < POST /api/auth/login, POST /api/auth/logout
¦   ¦       ¦   +-- middleware.ts     < requireAuth hook: validates session, injects districtId
¦   ¦       ¦   L-- password.ts       < argon2 hash + verify helpers
¦   ¦       +-- health/
¦   ¦       ¦   +-- index.ts          < registerHealthRoutes() Fastify plugin
¦   ¦       ¦   +-- routes.ts         < GET /api/health
¦   ¦       ¦   L-- query.ts          < reads batch_health table, checks BullMQ queue depth
¦   ¦       +-- web/
¦   ¦       ¦   L-- index.ts          < Fastify server entry point; registers all plugins + starts server
¦   ¦       L-- worker/
¦   ¦           L-- index.ts          < BullMQ worker entry point; upsertJobScheduler 20-min interval
¦   L-- web/
¦       +-- package.json
¦       +-- tsconfig.json             < extends root
¦       +-- vite.config.ts            < Vite config; /api proxy -> server in dev
¦       +-- index.html
¦       L-- src/
¦           +-- main.tsx              < React entry; wraps with QueryClientProvider + ConfigProvider
¦           +-- theme.ts              < AntD ConfigProvider mahallaTheme token overrides
¦           +-- strings.ts            < typed Uzbek Cyrillic UI string dictionary (ALL user-facing copy)
¦           +-- types.ts              < API response interface types (mirrors server types at HTTP boundary)
¦           +-- router.tsx            < React Router v6: /login and / routes with auth guard
¦           +-- api/
¦           ¦   +-- signals.ts        < useSignals() TanStack Query hook
¦           ¦   +-- mahallas.ts       < useMahallas() hook
¦           ¦   +-- health.ts         < useHealth() hook (60s refetchInterval)
¦           ¦   L-- auth.ts           < login(), logout() mutations
¦           +-- hooks/
¦           ¦   L-- use-filters.ts    < filter state: mahalla, time-range, keyword
¦           +-- pages/
¦           ¦   +-- dashboard-page.tsx  < owns data fetch, filter state, drawer state; groups signals by lane
¦           ¦   L-- login-page.tsx
¦           L-- components/
¦               +-- filter-bar/
¦               ¦   +-- filter-bar.tsx        < sticky 56px bar: chips + select + search
¦               ¦   +-- time-range-chips.tsx  < 1h/3h/6h/Bugyn/Kecha/7kun preset buttons (Cyrillic labels)
¦               ¦   +-- mahalla-select.tsx    < AntD Select wrapper
¦               ¦   L-- keyword-search.tsx    < AntD Input.Search with 300ms debounce
¦               +-- lane-grid/
¦               ¦   +-- lane-grid.tsx         < flex row; renders 5 LaneColumns; no reflow on drawer open
¦               ¦   L-- lane-column.tsx       < sticky header + @tanstack/react-virtual scroll
¦               +-- signal-card/
¦               ¦   +-- signal-card.tsx       < pure presentational: left border + meta + text + badges
¦               ¦   L-- signal-card.test.tsx
¦               +-- context-drawer/
¦               ¦   +-- context-drawer.tsx    < AntD Drawer wrapper; skeleton/content/empty states
¦               ¦   L-- drawer-signal-card.tsx < drawer variant: no 3-line clamp, no action menus
¦               +-- delay-banner.tsx           < AntD Alert warning; shown when last_batch_at >= 25min
¦               L-- unsupported-screen.tsx     < <1024px hard block message (CSS @media only, no JS)
```

---

### Architectural Boundaries

**API Boundaries (server to SPA):**
- All SPA data flows through REST endpoints: `/api/signals`, `/api/mahallas`, `/api/health`, `/api/signals/:id/context`
- Auth state flows via session cookie set on `POST /api/auth/login`; all other API routes require valid session
- Vite dev proxy (`/api -> http://localhost:3001`) bridges SPA to local Fastify in development
- Production: Nginx routes `/api/*` and `/webhook` to the `server` container; all other paths serve the Vite static build

**Component Boundaries (SPA):**
- `DashboardPage` — owns all server state (TanStack Query) and all UI state (filter, activeSignalId, drawerOpen); the sole data orchestrator
- `LaneGrid` — layout + virtual scroll only; receives pre-grouped `SignalsByCategory` + `activeSignalId` (prop from DashboardPage, not internal state) + `onCardClick`; manages virtual scroll instances internally; never fetches data
- `SignalCard` — pure presentational; receives `signal`, `isActive`, `categoryColor`, `onClick`; zero internal state
- `FilterBar` — reads filter state from `useFilters()` hook; emits changes up to `DashboardPage`

**Data Boundaries:**
- `apps/server/src/shared/schema/` — single source of truth for all DB table definitions; Drizzle Kit reads this for migration generation
- `apps/server/src/signals/mapper.ts` — the only location where DB snake_case rows are converted to camelCase API shapes
- `apps/server/src/classifier/schema.ts` — the only location where AI output is Zod-parsed and typed
- `apps/server/src/bot/filters/pipeline.ts` — the only location where pre-filter rules are evaluated; no filtering logic anywhere else

**Service Boundaries (no cross-module DB access):**
- `bot/` — writes only to `raw_messages`
- `classifier/` — reads `raw_messages`, writes `signal_messages` + `batch_health`, deletes processed `raw_messages`
- `signals/` — reads `signal_messages` + `mahallas` only
- `health/` — reads `batch_health` + BullMQ queue depth only
- `auth/` — reads/writes `users` + manages session store

---

### Integration Points

**External integrations:**
- Telegram Bot API: `apps/server/src/bot/` via grammY `webhookCallback`
- AI provider (Gemini-family): `apps/server/src/classifier/ai-client.ts` via `@google/genai`

**End-to-end data flow:**
```
Telegram -> POST /webhook -> grammY -> pipeline.ts pre-filter -> raw_messages (PostgreSQL)
                                                                        |
                                                               BullMQ scheduler (every 20 min)
                                                                        |
                                                              batch-processor.ts fetches pending
                                                                        |
                                                              ai-client.ts calls AI provider
                                                                        |
                                                              ClassifierOutputSchema.safeParse()
                                                                        |
                                                              signal_messages written
                                                              raw_messages deleted
                                                              batch_health updated
                                                                        |
SPA GET /api/signals (60s poll)  <-  signals/query.ts reads signal_messages
SPA GET /api/health  (60s poll)  <-  health/query.ts reads batch_health
SPA GET /api/signals/:id/context <-  signals/query.ts: category + mahalla_id + time_range
```

---

### Development Workflow Integration

**Root package.json scripts:**
```json
{
  "scripts": {
    "dev:server": "tsx watch apps/server/src/web/index.ts",
    "dev:worker": "tsx watch apps/server/src/worker/index.ts",
    "dev:web":    "vite --config apps/web/vite.config.ts",
    "lint":       "eslint apps/",
    "test":       "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate":  "drizzle-kit migrate",
    "db:studio":   "drizzle-kit studio"
  }
}
```

**Local dev requirements:**
- ngrok or Cloudflare Tunnel to expose `POST /webhook` for Telegram bot testing
- `.env` populated from `.env.example` before first run
- `npm run db:migrate` before first `dev:server` start

**Production deploy:**
```bash
git pull origin main
docker compose up --build -d
# server container entrypoint: npx drizzle-kit migrate && node dist/web/index.js
# worker container entrypoint: node dist/worker/index.js
```


---

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All verified package versions are mutually compatible.
fastify v5.8.5 + grammY webhookCallback(bot, "fastify"), drizzle-orm v0.45.2 + postgres.js driver,
bullmq v5 upsertJobScheduler, @tanstack/react-query v5 + antd v5 — no conflicts.

**Pattern Consistency:** snake_case DB / camelCase API / PascalCase component naming is internally
consistent throughout all sections. mapper.ts pattern, onConflictDoNothing idempotency, and
session-only districtId injection are unambiguous and enforced by the pre-PR checklist.

**Structure Alignment:** Module directories (bot/, classifier/, signals/, auth/, health/, shared/,
web/, worker/) map exactly to FR categories and architectural decisions. The server/worker Docker
service split matches the two-process runtime requirement. strings.ts is the enforced single source
for all Uzbek Cyrillic UI copy.

---

### Requirements Coverage Validation

All 34 functional requirements have explicit architectural support across modules, API endpoints,
and SPA components. All 15 NFRs are addressed:

13 of 15 NFRs are fully architecturally enforced. 2 NFRs are delegated:
- Disk encryption: VPS-level infrastructure concern; not application-level; operator responsibility
- WCAG 2.1 AA: AntD v5 provides accessible components by default; verification deferred to QA

FR coverage summary:
- Signal Display (FR1-6): DashboardPage + LaneGrid + LaneColumn + SignalCard; hokim lane via client-side grouping
- Context Drawer (FR7-10): ContextDrawer + GET /api/signals/:id/context; scope = mahalla_id (resolved)
- Filtering and Search (FR11-15): FilterBar + useFilters(); client-side for 1h/3h/6h/Today; server fetch for Yesterday/7d
- Message Intake (FR16-19): grammY webhook + pipeline.ts pre-filters; onConflictDoNothing idempotency
- AI Classification (FR20-25): classifier/ module; Zod output schema; 3x retry; configurable AI_PROVIDER/AI_MODEL env
- Signal Storage (FR26-28): Drizzle schema (raw_messages, signal_messages); 90-day retention; RETAIN_IGNORED_SAMPLE_SIZE flag
- Auth and Access (FR29-32): auth/ module; argon2 passwords; Redis session; requireAuth middleware; districtId injection
- Operational Health (FR33-34): GET /api/health; batch_health table; DelayBanner; 60s poll; two-audience design

---

### Implementation Readiness Validation

All 5 open questions from Step 2 are fully resolved:
1. Drawer scope: mahalla_id (not telegram_chat_id)
2. AI model/provider: configurable via env (AI_PROVIDER, AI_MODEL)
3. Pre-filter thresholds: provisional until real data; isolated in pipeline.ts for easy tuning
4. Session store: Redis-backed via @fastify/session + ioredis
5. Ignored message sampling: RETAIN_IGNORED_SAMPLE_SIZE env flag, default 0

All critical decisions have confirmed package versions. All 9 conflict points are addressed
with concrete code examples. Pre-PR checklist gives agents unambiguous pass/fail criteria.

---

### Gap Analysis Results

**Critical Gaps: NONE**

**Important Gaps (non-blocking, captured as implementation story tasks):**

1. DB schema column-level detail (types, lengths, defaults) — captured in the Drizzle schema definition story
2. Operator seed script — add apps/server/src/shared/seed.ts as part of the auth implementation story
3. pg_dump backup cron — add scripts/backup.sh to project structure before pilot launch

**Nice-to-Have Gaps (deferred post-pilot):**
- OpenAPI/Swagger API documentation
- E2E Playwright tests (via bmad-qa-generate-e2e-tests skill)
- docker-compose.test.yml for isolated test environment

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

---

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High**

**Key Strengths:**
- All open architectural questions resolved before implementation begins
- Two-process runtime (server/worker) explicitly isolated — no coupling risk
- Cross-cutting concerns (districtId scope, Uzbek strings, AI output validation) have enforceable, concrete patterns
- File-level project structure eliminates structural ambiguity for AI agents
- All package versions verified against live sources (May 2026)

**Areas for Future Enhancement:**
- Add API versioning (/api/v1/) when a second client or mobile app is introduced
- Move to managed PostgreSQL/Redis after pilot validates load assumptions
- Add GitHub Actions CI pipeline after first stable deploy
- Add prefers-reduced-motion CSS support for accessibility completeness

---

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented in this file
- Apply the implementation patterns and pre-PR enforcement checklist to every story
- Respect module boundaries — no cross-module DB access; all access through owning module public functions
- Refer to this document for all architectural questions before inventing solutions

**First Implementation Story — Workspace Scaffold:**
1. Root package.json with npm workspaces config (workspaces: ["apps/*"])
2. npm create vite@latest apps/web -- --template react-ts
3. mkdir apps/server && npm init -y in apps/server
4. Root tsconfig.json (strict mode base config)
5. docker-compose.yml with all 5 services (postgres, redis, server, worker, nginx)
6. .env.example with all 4 required secrets documented
7. drizzle.config.ts pointing to apps/server schema



