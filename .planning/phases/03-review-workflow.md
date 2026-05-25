# Phase 3: Review Workflow

## Goal

Make pharmacist and doctor review operational through APIs before the full dashboard.

## Build Steps

1. Add routes to list review tasks by queue and status.
2. Add task detail route with source document, extraction, validation, risk, and draft.
3. Add edit draft route.
4. Add approve/send route.
5. Add escalate route.
6. Add reviewer lock and audit events.
7. Store pharmacist corrections for future training.
8. Prevent red-case downgrade without doctor route.

## Exit Criteria

- Yellow case can be edited and approved by API.
- Red case cannot be approved as normal green output.
- Correction events are stored.
- `npm test` and `npm run check` pass.

## Execution Log

- 2026-05-25: Added review service for list, detail, edit, approve, and escalate flows.
- 2026-05-25: Added Fastify routes under `/review/tasks`.
- 2026-05-25: Added correction capture in memory and Neon store shapes.
- 2026-05-25: Added tests for edit/approve, red escalation, and duplicate inbound handling.
- 2026-05-25: Verification passed with `npm test`, `npm run check`, and `npm run fixtures`.
- Remaining before production: add auth, reviewer locks, role checks, and stricter red-case doctor approval policy.
