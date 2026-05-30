---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation-skipped', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflowStatus: 'complete'
releaseMode: 'single-release'
classification:
  projectType: 'web_app'
  domain: 'govtech'
  complexity: 'high'
  projectContext: 'greenfield'
  notes: 'Private internal tool operated by government — standard govtech compliance rules (FedRAMP, Section 508, open data) do not apply. Uzbekistan personal data law (ZRU-547) flagged; policy owned by client (hokim).'
inputDocuments:
  - 'project-raw-idea.md'
  - '_bmad-output/planning-artifacts/research/technical-telegram-ai-pipeline-research-2026-05-13.md'
  - '_bmad-output/planning-artifacts/research/domain-mahalla-governance-research-2026-05-13.md'
  - 'session-handoff.md'
  - 'user-client-preferences-log.md'
workflowType: 'prd'
briefCount: 0
researchCount: 2
brainstormingCount: 0
projectDocsCount: 0
lastConsistencyPatch: '2026-05-30 tone classification removal from MVP'
---

# Product Requirements Document - mahalla-ovozi

**Author:** Zubaydulla  
**Date:** 2026-05-16  
**Consistency Patch:** 2026-05-30 — removed tone classification/badges from MVP scope without expanding product scope

---

## Executive Summary

Mahalla Ovozi is a private internal civic signal monitoring system for district (tuman) leadership in Uzbekistan. It captures resident-reported text messages from selected mahalla Telegram supergroups via an official Telegram bot, filters them using AI classification, and surfaces relevant civic signals in a structured web dashboard — organized by service category, mahalla, and time.

The primary user is the tuman hokimi. The product solves a specific operational problem: district leadership cannot reliably monitor what residents are reporting in real Telegram group chats at scale. Important civic signals — about water, electricity, gas, waste, and hokim-related matters — are buried in high-volume, noisy group conversations. Existing channels (formal complaints, staff briefings) are delayed, filtered, and incomplete. Mahalla Ovozi gives the hokim direct, structured visibility into these signals without reading raw group chats.

The product is explicitly scoped. It is not a complaint portal, a resolution tracker, a citizen-facing chatbot, or a full Telegram archive. It captures, filters, and displays. Decision and action remain with the hokim and existing institutional processes.

### What Makes This Special

The core insight is that Telegram groups are where civic signals surface earliest and most authentically — before formal channels, before escalation. The gap is not signal availability; it is signal legibility for leadership.

Mahalla Ovozi's differentiation is its discipline: it solves exactly one problem and refuses all scope creep. No issue cards. No resolution workflow. No confidence scores. No automated truth claims. The product's value is a clean, evidence-backed signal stream that lets a busy non-technical leader scan what residents are saying in 60 seconds, not 60 minutes.

The 20-minute AI batch pipeline with a conservative centralized pre-filter stack keeps the system fast enough for live monitoring while controlling unnecessary AI cost. Exact AI model and cost estimates are implementation-time decisions and must be revalidated against current provider pricing, SDK support, latency, and Uzbek-language benchmark quality.

---

## Project Classification

| Field | Value |
|---|---|
| **Project Type** | Web App — internal dashboard + REST API backend + Telegram bot intake |
| **Domain** | GovTech (private internal tool; standard govtech compliance rules do not apply) |
| **Complexity** | High — government data, Uzbek NLP pipeline, personal data law exposure, async AI pipeline |
| **Project Context** | Greenfield |

---

## Success Criteria

### User Success

The product is successful when the hokim and authorized district staff can reliably scan current civic signals from monitored mahalla Telegram groups without reading the raw group chats themselves.

Specifically:
- Signal messages appear in the correct category lane with visible sender, mahalla, time, and raw text
- The context drawer surfaces related signals from the same mahalla and category without confusion
- Time range, mahalla, and search filters work predictably and narrow results as expected
- The dashboard is usable without any technical training or onboarding
- The hokim or staff can use it as a faster alternative to manually monitoring Telegram groups

### Business Success

The pilot is considered a success if the hokim finds the dashboard useful enough to continue using it after the initial 2–4 week validation period and is willing to expand it to more mahallas or staff.

Secondary business success indicators:
- No critical data loss or integrity issues during the pilot
- Bot connectivity maintained reliably across all monitored groups
- Operational cost stays within the low-cost pilot budget target after current AI pricing is revalidated

### Technical Success

- Telegram bot captures all in-scope text messages from monitored groups reliably
- 20-minute batch processing runs without failure in normal operating conditions
- Ignored messages are deleted after classification; signal messages are retained correctly
- System recovers from temporary AI API failures without data loss
- Admin/operator can verify system health without reading application logs

### AI Classification Success

AI accuracy targets are directional for the pilot — hard thresholds will be set after real-group testing with labeled data. The pilot aims to validate:
- Signal/ignore classification is accurate enough that the hokim trusts the lanes (low false negatives on obvious civic signals)
- Category assignment is mostly correct (water/electricity/gas/waste)
- Hokim-related flag is useful as a cross-cutting filter
- Classifier output stays focused on signal/ignore, service category, and hokim-related priority without requiring tone analysis

If classification quality is insufficient, the pilot will extend prompt engineering, few-shot examples, and/or model selection before declaring go/no-go.

### Measurable Outcomes

| Outcome | Threshold |
|---|---|
| Bot uptime during pilot | No unplanned downtime >24h (updates lost) |
| Batch processing | Runs every 20 min without manual intervention |
| Signal retention | No signal messages lost after classification |
| Dashboard availability | No outages during working hours |
| Pilot duration | 2–4 weeks of real-group operation before review |

### Pilot Review Questions

At the end of the pilot, evaluate success with lightweight human-in-the-loop review rather than vanity analytics:

- Did the hokim or staff find useful civic signals faster than reading raw Telegram chats?
- Were false positives tolerable enough for the dashboard to remain trusted and useful?
- Were any obvious civic signals missed in a way that reduced trust?
- Did the five-lane dashboard and context drawer make patterns easier to understand?
- Should the pilot continue, expand to more mahallas/staff, or pause for classifier/UX refinement?

---

## Product Scope

### MVP — Minimum Viable Product

Exactly what is defined in `project-raw-idea.md` §6: one district, 3–5 mahalla groups, text/caption-only intake, AI signal filtering, five-lane dashboard, context drawer, filters (time/mahalla/search), session-based auth, and operational health monitoring for operators.

For MVP intake, “text/caption-only” means Telegram `message.text` and textual `caption` content are in scope when Telegram provides them. Media binaries themselves — photos, videos, voice, stickers, polls, files, and similar non-text payloads — remain out of scope and are not stored or analyzed.

No additions. Prove the concept first.

### Growth Features (Post-MVP)

To be determined after pilot review based on real usage feedback from the hokim and district staff. No commitments made at this stage.

### Vision (Future)

Expand to multiple districts; potential integration with formal complaint tracking systems; mobile-optimized view for on-the-go monitoring. Scope and priority driven by pilot outcomes.

---

## User Journeys

### Journey 1: Hokimi — Signal Scan (Primary Success Path)

Jamshid is the tuman hokimi. When he needs situational awareness across his district's mahallas, he opens the Mahalla Ovozi dashboard. Previously this meant manually flipping through multiple Telegram group chats — wading through congratulation messages, food photos, and announcements — hoping not to miss anything important. Most of the time, important signals were buried or arrived through filtered summaries from staff.

Now he opens the dashboard. The default view shows today's signals across all monitored mahallas. He glances at the Gas lane — three gas-related resident reports from Navbahor mahallasi in the last two hours. He clicks one. The context drawer opens on the right, showing all gas-related signals from Navbahor today. Four messages from different residents give him the evidence he needs.

He didn't read a single raw group chat.

**Capabilities revealed:** five-lane dashboard, default Today view, lane signal counts, context drawer, mahalla filter, time range filter, sender + mahalla + timestamp visibility.

---

### Journey 2: Hokimi — Investigating a Specific Mahalla (Edge Case)

Jamshid hears from a staff member that residents in Olmazor mahallasi are reporting water issues. He wants to verify before acting. He opens the dashboard, selects Olmazor from the mahalla filter. The Water lane now shows only Olmazor signals. He sets a custom time range for the last 3 days. Four signals appear with their raw message snippets and timestamps. He opens the drawer and sees one mahalla rais message about a scheduled water shutoff and earlier resident reports from before that announcement. The pattern makes sense. No urgent action needed.

**Capabilities revealed:** mahalla filter scoping all lanes, time range filter (custom range up to 7 days), drawer context with related raw-message evidence, search as secondary fallback.

---

### Journey 3: District Staff — Ongoing Monitoring (Secondary User)

Dilnoza is an authorized district staff member. She monitors the dashboard on behalf of the hokim. She notices the Electricity lane showing an unusual spike — 7 signals from two different mahallas in the last hour. She uses the search filter to check if a specific term appears in the messages. Two signals match. She flags this pattern to the operator and prepares a summary for the hokim's review.

She never joins or reads the actual Telegram groups. She sees the filtered signal stream, uses search to narrow, and identifies a pattern the hokim needs to know about.

**Capabilities revealed:** search filter (keyword across raw text + mahalla + sender), lane independent scrolling, real-time-ish signal availability (20-min lag understood), cross-mahalla visibility when mahalla filter = All.

---

### Journey 4: Operator — Bot Setup and Health Check (Admin/Operations)

Rustam is the developer/operator who set up Mahalla Ovozi. Before the pilot launch, he adds the bot to each of the 3 selected mahalla Telegram groups, confirms the required Telegram group/bot setup in a real test group, and verifies the bot is receiving messages by checking the admin health endpoint. On day 3 of the pilot, the dashboard shows a "⚠️ Signals may be delayed" indicator. Rustam checks the health endpoint — the last batch ran 45 minutes ago. He inspects the logs, finds the AI provider returned a temporary error, and sees BullMQ has already retried successfully. The indicator clears on the next batch run. The hokim never saw a technical error.

**Capabilities revealed:** admin health endpoint (last batch time, queue depth, errors), bot connectivity monitoring (my_chat_member events), "signals may be delayed" UI indicator for hokim (no raw errors shown), BullMQ retry handling, operator-only health view vs. hokim-facing dashboard.

---

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Five-lane dashboard with sticky headers + independent scroll | Journey 1, 2 |
| Default view: Today, All mahallas, newest-first | Journey 1 |
| Signal count per lane | Journey 1 |
| Context drawer (same mahalla + category + time range) | Journey 1, 2 |
| Selected message highlighted in drawer | Journey 1 |
| Mahalla filter (scopes all lanes) | Journey 2 |
| Time range filter (presets: Today, 1h, 3h, 6h, custom up to 7 days) | Journey 2 |
| Search filter (raw text, sender, mahalla) | Journey 3 |
| Cross-mahalla signal view when filter = All | Journey 3 |
| "Signals may be delayed" UI indicator (non-technical) | Journey 4 |
| Admin health endpoint (operator-only) | Journey 4 |
| Bot connectivity monitoring + operator-visible health alert state | Journey 4 |
| Session-based auth (scoped access) | All journeys |

---

## Domain-Specific Requirements

### Compliance & Regulatory

Mahalla Ovozi is a private internal tool commissioned and operated by an authorized district hokimiyat. The hokim, as the commissioned authority, owns all policy decisions related to this deployment — including data handling, sender display, resident notification, and data residency. These are not implementation blockers and do not gate development or the pilot launch.

The developer's responsibility is to implement specified technical requirements correctly. No regulatory approval, external audit, or compliance certification is required for this product.

This client-owned policy stance does not reduce developer-owned security and data-handling responsibilities. The implementation must still enforce the PRD's technical safeguards: HTTPS, secure session cookies, webhook secret validation, environment-only secrets, district-scoped access, retention behavior, backup protection, and operator-visible health/debug information.

### Technical Constraints

**Data security (developer-owned):**
- Bot token and API keys in environment variables only — never in code or logs
- Webhook requests validated via `X-Telegram-Bot-Api-Secret-Token` header
- Dashboard served over HTTPS only; session cookies with `httpOnly` and `secure` flags
- PostgreSQL on a single VPS with disk encryption; sufficient for pilot scale

**Data retention (developer-owned):**
- Raw messages: deleted after successful classification in the same batch run
- Signal messages: retained for 90 days (pilot period); revisit post-pilot based on DB growth
- No normalized text stored long-term — used during processing only

**Access control (developer-owned):**
- Session-based authentication; no public registration
- District-scoped visibility — authorized users only
- Sender display rendered as confirmed by the hokim; developer implements display, not the policy itself

### Risk Mitigations

| Risk | Mitigation |
|---|---|
| Bot token exposed | Env var only; rotate immediately if leaked |
| Webhook spoofed | Validate secret token header on every request |
| Data loss on VPS failure | Daily `pg_dump` backups to external object storage; RTO <4h, RPO <24h |
| Bot removed from group | `my_chat_member` event detection; expose operator-visible health alert state |
| AI API downtime | BullMQ retry; show "Signals may be delayed" to hokim on next batch; expose technical details only in operator health/logs |
| AI model/pricing assumptions stale | Revalidate current provider/model/pricing before implementation; keep model configurable |
| Pre-filter false negatives | Use conservative centralized filters; validate thresholds with real mahalla data before hardening |

### MVP Operator Alerting

For MVP, “operator alert” means an operator-visible system health state, not an additional external notification product. The minimum alert surfaces are:

- Hokim/staff-facing non-technical delayed-signal indicator on the dashboard.
- Operator-only health endpoint/status view showing bot connectivity, last successful batch time, queue depth, recent processing errors, and discard counts.
- Structured server logs for technical diagnosis.

Telegram/email/push alerts are not part of the MVP unless Architecture intentionally adds a minimal implementation for operational necessity without expanding the user-facing product scope.

---

## Web App Specific Requirements

### Project-Type Overview

Mahalla Ovozi's frontend is a **single-page application (SPA)** — a React (or Next.js) dashboard with real-time-feeling filtering, five independently scrolling category lanes, and a right-side context drawer. The primary display target is a large office monitor used by district leadership.

### Technical Architecture Considerations

**Rendering:** Client-side SPA. No SSR required for MVP — all data fetched from the Fastify REST API after session authentication.

**State management:** Local component state + React Query (or SWR) for server-state caching. No global state manager needed at MVP scale.

**API communication:** REST over HTTPS. Dashboard auto-refresh polling interval: 60 seconds (sufficient given 20-min batch cadence). No WebSocket for MVP.

**Auth flow:** Session cookie (`httpOnly`, `secure`) issued on login. Protected routes redirect to login if no valid session.

### Browser & Display Requirements

| Requirement | Target |
|---|---|
| Browser support | Chrome, Firefox, Edge — latest stable versions only |
| Mobile browser | ❌ Not required for MVP |
| Primary display | Large desktop monitor (1920×1080+) |
| Minimum display | Laptop screen (1366×768) — layout must remain functional |
