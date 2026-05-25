# Phase 5: Pharmacist CRM

## Goal

Build the first pharmacist CRM/dashboard as a serious care-management console, visually closer to a management accountant's operating desk than a consumer health app.

## Build Steps

1. Create dashboard app shell.
2. Add review queue with SLA, risk, status, assigned reviewer, and family context.
3. Add case detail page with document preview, extracted JSON, validated facts, draft script, edit controls, approve, and escalate.
4. Add patient ledger view: family, medicines, allergies, lab trend notes, documents, conversations, and follow-ups.
5. Add pharmacy operations view: refill due, pending reviews, doctor escalations, failed deliveries, revenue/plan state.
6. Add chatbot assistant panel using the context contract in `src/core/chatbot-context.mjs`.
7. Add pharmacist CRM modules from `docs/PHARMACIST_CRM_IDEA.md`: prescription inbox, patient ledger, refill pipeline, family WhatsApp CRM, counselling scripts, and business desk.
8. Keep UI dense, quiet, and highly scannable.

## Exit Criteria

- Pharmacist can process a yellow case in under 3 minutes in local demo.
- Dashboard exposes risk reasons and audit status on every case.
- Chatbot uses bounded context and cannot invent clinical facts.
- CRM shows patient ledger, refill pipeline, family communication state, and pharmacy business desk.
- `npm test` and `npm run check` pass.

## Execution Log

- 2026-05-25: Converted the static CRM prototype into a real API-backed dashboard.
- 2026-05-25: Added backend-served `/crm` route so the dashboard can run on the same Fastify origin as the review APIs.
- 2026-05-25: Added `/dev/seed-fixtures` to create synthetic cases through the actual consent, extraction, risk, review, voice, and delivery pipeline.
- 2026-05-25: Added `/dev/state` so CRM metrics, patient ledger, refill rows, delivery counts, and business desk use store state instead of hardcoded mock arrays.
- 2026-05-25: CRM queue now loads from `/review/tasks`; edit, approve, escalate, reload, and seed actions call real backend APIs.
- 2026-05-25: Added regression tests for `/crm` and CRM seed-to-review-task flow.
- 2026-05-25: Connected CRM integration panel to real `/integrations/status`, live Nahcrof health check, Baileys profile status, and Baileys dev send endpoint.
- 2026-05-25: Redesigned the CRM to match the approved management-accountant concept: sidebar ledger nav, top AI/WhatsApp chips, queue/accounting desk, right-side case command surface, assistant panel, audit timeline, and quick actions.
- 2026-05-25: Added competitor gap analysis covering refill recovery, two-way messaging, patient portal/forms, payments, inventory hooks, medication synchronization, adherence, staff workflow, consent, and delivery tracking.
- 2026-05-25: Added `/crm/ops` as the L1 pharmacy care desk backend layer for refill recovery, WhatsApp inbox, family portal summaries, order/payment state, inventory/expiry hooks, medication sync, campaigns, adherence, staff SLA, consent, and pickup/delivery tracking.
- 2026-05-25: Wired the CRM business desk, refill pipeline, patient ledger, and WhatsApp inbox panels to the `/crm/ops` response so the competitor gaps are visible from the live dashboard.
- 2026-05-25: Verified Phase 5 L1 with `npm test`, `npm run check`, fixture run, `/crm/ops` smoke test, and browser screenshot.
- Remaining before production: add authentication, role permissions, real patient search, pagination, real refill scheduling, real payment links, inventory/POS integration, and move the UI into a maintainable Next.js app when the product surface stabilizes.
