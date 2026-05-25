# Public Release Snapshot

This repository is public-safe as an L1 implementation of Nuskha Care. It contains synthetic fixtures, local development transports, provider seams, and operating documentation. It must not be treated as a production medical device or an open live patient system.

## What Is Built

- WhatsApp-style intake normalization.
- Consent gate before medical document processing.
- Structured extraction adapter path for Crof/Nahcrof, with strict schema validation.
- Drug and lab validation against a small synthetic reference set.
- Deterministic green/yellow/red risk routing.
- Pharmacist and doctor review APIs.
- TTS and delivery adapter seams.
- Baileys development transport for internal testing.
- Fastify-served pharmacist CRM at `/crm`.
- Pharmacy care desk layer at `/crm/ops`.
- Pilot readiness APIs, WABA template pack, consent copy, erasure intake, and runbook.

## GSD Phase Status

| Phase | Status | Public artifact |
|---|---|---|
| 1 Durable Core | implemented-l1 | Neon-shaped schema, store seam, fixtures |
| 2 Crof Extraction | implemented-l1 | Crof/Nahcrof adapter path and validation |
| 3 Review Workflow | implemented-l1 | Review task APIs and correction capture |
| 4 Voice Delivery | implemented-l1 | TTS/delivery seams and Baileys dev path |
| 5 Pharmacist CRM | implemented-l1 | Management-accountant CRM and pharmacy OS surface |
| 6 Pilot Readiness | implemented-l1 | Pilot mode, WABA templates, consent, erasure, runbooks |

## How To Run Locally

```bash
npm install
npm test
npm run check
npm run fixtures
npm run dev:crm
```

Open:

```text
http://localhost:8787/crm
```

Useful endpoints:

```text
GET /health
GET /crm/ops
GET /pilot/readiness
GET /pilot/waba-templates
GET /pilot/consent-copy
POST /dev/seed-fixtures
POST /privacy/erasure-requests
```

## Safety Boundary

Nuskha Care may explain what is written in a document. It must not:

- diagnose disease,
- change a prescription,
- recommend substitutions,
- claim a lab report is safe,
- bypass human review in the controlled pilot,
- use Baileys for production patient workflows,
- commit real patient data or secrets.

## Before Any Real Pilot

- Set `NUSKHA_PILOT_MODE=true`.
- Configure a real WABA provider and approved templates.
- Verify Neon migrations against a real database.
- Replace local object storage stubs with private S3-compatible storage.
- Add authentication and role-based access control.
- Complete clinical advisor review of risk rules and lab thresholds.
- Run only founder/operator-supervised cases until the audit trail, erasure, delivery, and escalation flows are verified.

## Verification Receipt

Current local verification:

- `npm test`: 20/20 passing.
- `npm run check`: passing.
- `/pilot/readiness`: passes when local pilot environment variables are configured.
- `/crm/ops`: populates after synthetic fixtures are seeded.
