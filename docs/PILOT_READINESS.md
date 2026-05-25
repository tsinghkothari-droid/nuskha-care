# Pilot Readiness

This phase prepares Nuskha Care for a controlled founder/operator pilot. It does not make the product safe for open public medical use.

## Pilot Rule

Set:

```text
NUSKHA_PILOT_MODE=true
```

In pilot mode, even green-path documents are routed to pharmacist review. The goal is to prove intake, extraction, review, consent, and delivery under human supervision before any auto-send behavior is allowed.

## Readiness API

```text
GET /pilot/readiness
GET /pilot/waba-templates
GET /pilot/consent-copy
POST /privacy/erasure-requests
GET /webhooks/waba/inbound?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
```

The readiness endpoint checks pilot mode, WABA verification token, AI provider configuration, WhatsApp dev pairing, consent copy, template pack, erasure workflow, safe logging, clinical checklist, and secret checklist.

## WABA Template Pack

Submit these as utility templates through the WABA provider:

- `nuskha_consent_hi`: Hindi first-contact consent.
- `nuskha_consent_en`: English first-contact consent.
- `nuskha_review_waiting_hi`: Document received, manual review in progress.
- `nuskha_review_ready_hi`: Reviewed explanation is ready.
- `nuskha_emergency_hi`: Emergency-symptom guidance with local urgent-care instruction.

Keep templates non-promotional. Do not mention discounts, medicine sales, or diagnosis.

## Consent Copy

Hindi and English consent copy lives in `src/core/pilot-readiness.mjs` and is exposed by `/pilot/consent-copy`.

Consent must say:

- Nuskha explains documents in simple language.
- Nuskha is not a doctor replacement.
- Nuskha does not diagnose, change dose, or suggest substitutes.
- Pilot responses are reviewed by a trained reviewer before sending.
- The user must reply YES before processing.

## Erasure Workflow

`POST /privacy/erasure-requests` records an `erasure_requested` audit event.

Operator runbook:

1. Verify requester identity through the registered family channel.
2. Record the request timestamp and audit ID.
3. Export a minimal internal receipt for the operator.
4. Delete or minimize family records, documents, voice notes, and delivery artifacts according to the retention decision.
5. Confirm completion within 30 days.

## Incident Runbook

Severity 1:

- Wrong patient, wrong medicine, secret leak, unsafe dose/substitution language, or emergency case handled as routine.
- Stop outbound sends.
- Preserve audit log and relevant provider IDs.
- Notify founder and clinical advisor.
- Draft family notification within 72 hours if personal data exposure is confirmed.

Severity 2:

- Provider outage, delayed review SLA, failed WABA delivery, or low-confidence extraction spike.
- Pause affected route.
- Move cases to manual review.
- Record root cause and prevention task.

## Monitoring

Track:

- `/health`
- `/pilot/readiness`
- Review queue age
- Red case count
- WABA delivery failures
- AI extraction failures
- Erasure request count

Logs must not include full phone numbers, inbound message text, scripts, child summaries, API keys, or access tokens.

## Clinical Advisor Checklist

- Review every risk-engine rule code and threshold before pilot.
- Confirm red-path classes: insulin, anticoagulants, chemotherapy, opioids, immunosuppressants, cardiac drugs, steroids, antiepileptics.
- Confirm lab critical thresholds and urgent-care language.
- Confirm no script diagnoses, changes dose, recommends substitutions, or says all clear.
- Sign off on pilot reviewer escalation rules and SLA.

## Deployment Secret Checklist

- `WABA_WEBHOOK_VERIFY_TOKEN`
- `WABA_ACCESS_TOKEN`
- `DATABASE_URL`
- `OBJECT_STORAGE_*` private bucket credentials
- `OPENAI_BASE_URL` and `OPENAI_API_KEY` for Crof or Nahcrof
- `SARVAM_API_KEY` or `BHASHINI_API_KEY`
- Error capture DSN, such as Sentry
- `NUSKHA_PILOT_MODE=true`
