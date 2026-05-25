# Phase 6: Pilot Readiness

## Goal

Prepare for first real controlled pilot with founder/operator review.

## Build Steps

1. Finalize WABA templates.
2. Add production webhook verification.
3. Add manual-review-only pilot mode.
4. Add consent copy in Hindi and English.
5. Add erasure workflow.
6. Add incident runbook.
7. Add monitoring and patient-data-safe logging.
8. Add clinical advisor review checklist.
9. Add deployment secret checklist.

## Exit Criteria

- Every outbound response is reviewed during pilot.
- Consent, deletion, incident, and access flows are documented.
- WABA template pack is ready for provider submission.
- `npm test` and `npm run check` pass.

## Execution Log

- 2026-05-25: Added `NUSKHA_PILOT_MODE=true` support so green-path cases route to pharmacist review during pilot instead of auto-send.
- 2026-05-25: Added WABA webhook verification through `GET /webhooks/waba/inbound` with `WABA_WEBHOOK_VERIFY_TOKEN`.
- 2026-05-25: Added pilot readiness APIs: `/pilot/readiness`, `/pilot/waba-templates`, `/pilot/consent-copy`, and `/privacy/erasure-requests`.
- 2026-05-25: Added Hindi and English consent copy, WABA utility template pack, clinical advisor checklist, deployment secret checklist, incident runbook, monitoring list, and erasure workflow in `docs/PILOT_READINESS.md`.
- 2026-05-25: Expanded logging redaction for phone, WhatsApp text, scripts, child summaries, and secrets.
- 2026-05-25: Added regression tests for readiness, erasure intake, WABA verification fail-closed behavior, and pilot-mode manual review.
- 2026-05-25: Verified Phase 6 L1 with `npm test` and `npm run check`.
- Remaining before production: configure real provider secrets, submit WABA templates, connect production WABA delivery, enable real private storage, add auth/RBAC, and complete clinical advisor signoff.
