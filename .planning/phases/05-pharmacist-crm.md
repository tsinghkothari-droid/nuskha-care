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
7. Keep UI dense, quiet, and highly scannable.

## Exit Criteria

- Pharmacist can process a yellow case in under 3 minutes in local demo.
- Dashboard exposes risk reasons and audit status on every case.
- Chatbot uses bounded context and cannot invent clinical facts.
- `npm test` and `npm run check` pass.

## Execution Log

- Pending.

