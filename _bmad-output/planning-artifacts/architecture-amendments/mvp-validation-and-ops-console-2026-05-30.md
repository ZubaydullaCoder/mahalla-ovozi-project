# Architecture Amendment: MVP Validation Strategy and Ops Console

Date: 2026-05-30  
Status: Accepted for planning  
Supersedes: conflicting or broader-scope assumptions in `architecture.md` where explicitly stated below  
Applies to: MVP implementation, simulation validation, controlled real pilot, and production support

---

## 1. Purpose

This amendment records confirmed MVP architecture decisions that emerged after reviewing the architecture from product-fit, solo-development, HITL validation, and production-debugging perspectives.

The goal is to keep the MVP implementation simpler while making the system easier to inspect, validate, debug, and improve without blindly trusting AI classifier output.

This amendment does not replace the full architecture document. It narrows and clarifies implementation priorities before Epics & Stories are created.

---

## 2. Confirmed Development Philosophy

Mahalla Ovozi must be built with a validation-first approach.

The system must not move directly from implementation to broad production rollout. Instead, the MVP must support controlled technical and product validation before wider use.

Implementation must prioritize:

- evidence over assumptions;
- human-in-the-loop review;
- traceable message processing;
- simple MVP scope;
- developer-friendly debugging;
- production-safe internal monitoring.

---

## 3. Validation-First Rollout Strategy

### Stage 1 — Simulation Validation

Before real production use, the developer will create mock mahalla Telegram groups and simulate different realistic message cases.

Simulation must test:

- Telegram bot intake;
- mahalla/group resolution;
- structural pre-filtering;
- raw message persistence;
- AI classification;
- validation of AI output;
- signal creation;
- dashboard lane placement;
- context drawer behavior;
- Ops Console traceability;
- diagnostic reports.

The goal is not only to check whether the app runs, but to understand how well the full pipeline behaves across different message types.

### Stage 2 — Controlled Real Pilot

After simulation is satisfactory, real mahalla Telegram groups may be added in a controlled pilot.

The pilot must remain limited and observable. The system should be reviewed before expanding to more users, more groups, or broader operational use.

### Stage 3 — Expansion Gate

Expansion happens only after the developer/client is satisfied that:

- civic signals are being captured usefully;
- important messages are not being missed at an unacceptable level;
- irrelevant noise is not overwhelming the dashboard;
- the hokim/dashboard user can understand the situation faster than reading raw chats;
- Ops Console and reports provide enough debug context for support and improvement.

---

## 4. MVP Scope Simplification Decisions

### 4.1 One Telegram Group per Mahalla

MVP assumes exactly one monitored Telegram group per mahalla.

Therefore, MVP does not need a separate `telegram_chats` table.

The `mahallas` table may keep the Telegram chat identifier directly.

Future multi-group support may extract Telegram chat records into a separate table only if real pilot usage proves that one mahalla needs multiple monitored Telegram groups.

### 4.2 No Multi-Group Drawer Complexity in MVP

The drawer context may continue to use mahalla-based context because each mahalla has exactly one monitored Telegram group in MVP.

Future multi-group semantics are deferred.

### 4.3 Production Hardening Is Staged

The following are not first implementation priorities unless required by deployment timing:

- advanced observability platform;
- Grafana/Prometheus/Loki/ELK;
- OpenTelemetry;
- frontend session replay;
- complex alerting;
- multi-group-per-mahalla modeling;
- advanced admin tooling;
- full analytics.

These may be added after simulation or controlled pilot shows a clear need.

---

## 5. Ops Console Decision

Mahalla Ovozi MVP includes a minimal custom internal Ops Console.

Ops Console is not only for simulation. It remains useful in production for support, debugging, diagnostic reporting, and AI-assisted development.

Ops Console is the primary developer/operator analytical environment for understanding what the app is doing behind the scenes.

The true technical source of truth remains:

- PostgreSQL data;
- structured logs;
- pipeline event records;
- raw message and signal records;
- health records;
- diagnostic reports.

Ops Console is the main human-friendly window into those sources.

---

## 6. Ops Console Goals

Ops Console must help answer:

- Did the Telegram bot receive messages recently?
- Which mahalla/group did a message belong to?
- Was the message discarded before AI?
- If discarded, why?
- Was the raw message saved?
- Was it sent to AI?
- What did AI return?
- Did runtime validation pass?
- Was a signal created?
- Which dashboard lane received the signal?
- Are there failed or delayed messages?
- What happened in the last 24 hours?
- What context can be given to an AI coding/debugging assistant?

---

## 7. Minimal Ops Console Scope

The initial Ops Console should include:

1. System Health
   - last Telegram message time;
   - last classifier run time;
   - pending raw message count;
   - failed classification count;
   - latest error summary;
   - signals written today.

2. Message Timeline
   - received;
   - mahalla resolved;
   - pre-filter passed or discarded;
   - raw inserted;
   - AI request sent;
   - AI response received;
   - validation passed or failed;
   - signal written;
   - dashboard-visible state when applicable.

3. Pipeline Events
   - technical event list filtered by message, run, status, stage, and time.

4. Classifier Review
   - message text;
   - AI category;
   - AI tone;
   - AI `hokim_related`;
   - expected values entered by developer/operator;
   - correct/wrong decision;
   - review note.

5. Diagnostic Report
   - last 24h / selected-period summary;
   - Markdown export for AI-agent context;
   - JSON export for structured debugging.

---

## 8. Development Completion Rule

A pipeline feature is not considered complete until its behavior is inspectable through Ops Console, diagnostic output, or structured logs.

Examples:

- Bot intake is incomplete until received/discarded/inserted events are visible.
- AI classification is incomplete until AI request, AI response, validation result, and signal creation are visible.
- Dashboard signal display is incomplete until data source and API result can be traced from the underlying signal record.

This rule prevents blind trust in AI output and keeps HITL validation central throughout development.

---

## 9. Production Use and Access Control

Ops Console must be internal-only.

Recommended access:

- developer/admin users;
- trusted operator users if explicitly allowed;
- not part of the public/hokim-facing dashboard by default.

Ops Console may exist in production, but it must be role-restricted and should be optionally controlled by environment/config flags.

Suggested config:

- `OPS_CONSOLE_ENABLED`;
- `OPS_CONSOLE_SHOW_RAW_TEXT`;
- `OPS_CONSOLE_RETENTION_DAYS`.

---

## 10. Policy and Privacy Responsibility

Client/hokim owns all policy, legal, privacy, data retention, resident notification, and compliance decisions as recorded in `user-client-preferences-log.md`.

Developer must not block implementation on policy grounds when requirements have been accepted by the client.

However, technical safeguards remain required:

- no secrets in logs or diagnostic reports;
- role-restricted Ops Console access;
- configurable debug visibility;
- configurable retention;
- clear separation from the hokim-facing dashboard;
- audit-friendly event records where practical.

This is technical hygiene, not policy gatekeeping.

---

## 11. Suggested Minimal Data Model Additions

Implementation stories should consider these tables or equivalent structures:

### `pipeline_events`

- `id`
- `run_id`
- `telegram_update_id`
- `raw_message_id`
- `signal_message_id`
- `stage`
- `status`
- `details_json`
- `error_message`
- `duration_ms`
- `created_at`

### `classifier_reviews`

- `id`
- `signal_message_id`
- `raw_message_id`
- `expected_category`
- `expected_tone`
- `expected_hokim_related`
- `is_correct`
- `note`
- `reviewed_by_user_id`
- `reviewed_at`

### `diagnostic_reports`

- `id`
- `period_start`
- `period_end`
- `summary_json`
- `markdown_report`
- `created_at`

These structures should remain minimal. They should not become a full analytics platform in MVP.

---

## 12. Tooling Decision

Use custom minimal Ops Console as the primary analytical environment.

Do not introduce paid observability tools by default.

Allowed supporting tools:

- structured Pino logs;
- Drizzle Studio for local database inspection;
- optional external LLM tracing only if classifier debugging becomes too painful with the custom console.

Deferred unless proven necessary:

- Grafana;
- Prometheus;
- Loki;
- ELK;
- OpenTelemetry;
- Sentry/Highlight;
- Langfuse as a mandatory dependency.

---

## 13. Impact on Epics & Stories

Epics & Stories must include Ops Console work alongside real app pipeline work.

Recommended approach:

- Workspace scaffold includes debug/event foundation.
- Bot intake includes minimal message/event visibility.
- Classifier includes AI trace and review visibility.
- Dashboard includes signal traceability.
- Pre-pilot hardening includes diagnostic report export and retention configuration.

Ops Console should develop gradually with the real app, not as a large separate product built before or after the MVP.

---

## 14. Current Decision Summary

- MVP assumes one Telegram group per mahalla.
- No `telegram_chats` table in MVP.
- Use validation-first rollout: simulation, controlled pilot, then expansion.
- Add custom internal Ops Console.
- Ops Console remains useful in production.
- Pipeline stages must be inspectable.
- AI output must support human review.
- Diagnostic reports should help both humans and AI coding/debugging assistants.
- Paid observability tools are not default MVP dependencies.
- Technical safeguards remain required, while policy responsibility stays with the client/hokim.
