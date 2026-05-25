# Executable Phase Index

Run these phases in order. Do not start a later phase until the exit criteria of the previous phase are met, unless a hotfix is needed.

| Order | Phase | Status | Output |
|---|---|---|---|
| 1 | [Phase 1: Durable Core](./phases/01-durable-core.md) | implemented-l1 | Neon schema, storage adapter, duplicate guard, fixtures |
| 2 | [Phase 2: Crof Extraction](./phases/02-crof-extraction.md) | implemented-l1 | Crof extraction adapter, validation, fallback routing |
| 3 | [Phase 3: Review Workflow](./phases/03-review-workflow.md) | implemented-l1 | Review APIs, edits, approval, escalation |
| 4 | [Phase 4: Voice Delivery](./phases/04-voice-delivery.md) | implemented-l1 | TTS, audio artifacts, Baileys dev delivery, WABA seam |
| 5 | [Phase 5: Pharmacist CRM](./phases/05-pharmacist-crm.md) | implemented-l1 | Management-accountant style CRM/dashboard |
| 6 | [Phase 6: Pilot Readiness](./phases/06-pilot-readiness.md) | implemented-l1 | WABA templates, consent, monitoring, runbooks |

## Execution Rule

Each phase must finish with:

- Code or document changes committed.
- `npm test` passing.
- `npm run check` passing.
- A short receipt in the phase file under `Execution Log`.
