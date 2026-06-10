# Sprint Change Proposal - Keyword Gate Demo/Pilot Default

Date: 2026-06-10
Project: mahalla-ovozi
Workflow: BMAD Correct Course
Status: Approved for direct adjustment

## 1. Issue Summary

The owner analyzed real mahalla Telegram groups and found that civic signal messages are rare relative to general group chatter. Keeping `ai_full` as the practical default would increase AI cost and may create unnecessary dashboard noise by sending every structurally retained message to AI.

The approved change is to make `keyword_gate` the preferred/default demo-pilot filtering mode while preserving `ai_full` as fallback and `shadow_compare` for validation.

## 2. Impact Analysis

Epic impact is contained to existing Epic 1 and Epic 6 work. No new epic is required.

Story impact:
- Story 1.4 remains valid; it already implemented all three filtering modes.
- Story 1.5 must aggregate keyword metrics correctly and treat `keyword_gate` as the default mode in env/config expectations.
- Story 6.4 becomes operationally important before demo/pilot because keyword management is required when `keyword_gate` is the preferred default.

Artifact impact:
- PRD filtering-mode language must no longer describe full AI as the default/safest baseline for pilot.
- Architecture must document `keyword_gate` as the default and preserve mode switchability.
- `.env.example`, local `.env`, and `env.ts` must default to `keyword_gate`.
- Completed story artifacts should keep historical trace but include post-completion notes to prevent future confusion.

Technical impact:
- No database schema change.
- No pipeline logic rewrite.
- Tests should continue to cover all three modes.
- Keyword quality becomes a release-readiness concern.

## 3. Recommended Approach

Use Direct Adjustment.

Rationale:
- The architecture already supports `keyword_gate`, `ai_full`, and `shadow_compare`.
- The change affects defaults and priority, not core system design.
- This keeps cost/noise lower for demo-pilot while retaining fallback options if keyword coverage is insufficient.

Risk level: Low to Medium.
Primary risk: missed non-keyword civic signals.
Mitigation: real/test data validation, keyword iteration through Ops Console, and optional `shadow_compare`.

## 4. Detailed Change Proposals

Update stakeholder decisions:
- Add the 2026-06-10 decision selecting `keyword_gate` as preferred demo/pilot default.
- Mark earlier “compare before choosing pilot default” decisions as superseded where they conflict.

Update PRD:
- Describe `keyword_gate` as preferred demo/pilot default based on real group analysis.
- Keep `ai_full` as fallback and `shadow_compare` as validation mode.

Update Architecture:
- Change documented `FILTER_MODE` default from `ai_full` to `keyword_gate`.
- Keep all three modes and clarify their roles.

Update Epics/Stories:
- Add `keyword_gate` default expectation to Story 1.4/1.5 planning language.
- Add post-completion notes to Story 1.2 and Story 1.4.

Update Config/Code:
- `.env.example`: `FILTER_MODE=keyword_gate`
- `.env`: `FILTER_MODE=keyword_gate`
- `apps/server/src/shared/env.ts`: Zod default `keyword_gate`

## 5. Implementation Handoff

Scope classification: Minor.
Route to: Developer agent for direct implementation.

Success criteria:
- All authoritative docs agree that `keyword_gate` is the preferred/default demo-pilot mode.
- Code/config defaults use `keyword_gate`.
- `ai_full` and `shadow_compare` remain supported.
- Tests and lint pass.

