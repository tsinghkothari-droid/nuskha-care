# Readiness Check

Date: 2026-05-25

Current state:

> Nuskha Care is demo-skeleton ready. It is not pilot-ready or production-ready yet.

The repository has a runnable L1 backend scaffold, a Baileys dev bridge, a consent gate, deterministic risk routing, a stub extraction path, a stub voice delivery plan, and tests. It does not yet process real prescriptions safely end to end.

## Readiness Levels

## Level 0: Repo Ready

Status: done

Evidence:

- Public GitHub repository exists.
- README explains core product.
- Business case exists.
- L1 product steps exist.
- Technical structure exists.
- Local tests pass.
- Nahcrof/Crof provider health check works locally.

Remaining:

- Keep secrets out of GitHub.
- Add issue roadmap once implementation tasks are split.

## Level 1: Local Demo Ready

Status: partial

Goal:

Show the complete loop on a laptop using synthetic text and synthetic document examples.

Already done:

- Fastify API server.
- `/health` route.
- `/dev/whatsapp-inbound` route.
- Baileys dev bridge.
- Consent-required flow.
- In-memory family/audit/review store.
- Green/yellow/red risk routing.
- Simulation command.
- Basic unit tests.

Missing before L1 demo is credible:

1. Add synthetic prescription and lab fixtures.
2. Add a dev fixture runner for green, yellow, and red scenarios.
3. Add duplicate-message protection.
4. Add API route to inspect review tasks.
5. Add API route to approve/edit a review task.
6. Add local voice file stub or real TTS adapter.
7. Add local send stub that records "sent" messages.
8. Add end-to-end test for consent -> document -> risk -> review/send.

Definition of done:

- One green prescription demo returns a parent voice-script artifact.
- One yellow prescription creates a pharmacist review task.
- One red case creates a doctor review task and urgent-care message.
- All three demos use synthetic data only.

## Level 2: Founder Manual Pilot Ready

Status: not ready

Goal:

Run first 10 families manually with founder/operator review before every outbound response.

Required:

1. Supabase persistence for families, members, documents, consents, audit logs, review tasks, and voice notes.
2. Encrypted object storage for uploaded documents.
3. Real WABA inbound webhook verification.
4. WABA outbound send adapter.
5. WhatsApp template pack approval.
6. Production consent templates in Hindi and English.
7. Reviewer dashboard MVP.
8. Manual review lock: no auto-send until founder approves.
9. Simple operator login.
10. Synthetic QA pack for common prescriptions and labs.
11. Data deletion request process.
12. Private operations runbook.

Definition of done:

- Founder can onboard one synthetic family through WABA.
- Parent sends a prescription.
- Founder sees the case in dashboard.
- Founder approves/edits response.
- Parent receives voice or text response.
- Audit log records every step.
- No real case can bypass review during pilot mode.

## Level 3: Pharmacist Pilot Ready

Status: not ready

Goal:

Allow a part-time pharmacist to review yellow cases safely.

Required:

1. Pharmacist role and access control.
2. Two-factor authentication.
3. Review queue sorted by SLA.
4. Original document viewer.
5. Extracted JSON viewer.
6. Risk reasons visible on every card.
7. Inline script editing.
8. Regenerate voice action.
9. Approve/send action.
10. Escalate-to-doctor action.
11. Correction event capture.
12. Reviewer productivity dashboard.
13. Policy page: counselling only, no diagnosis, no dose change.

Definition of done:

- Pharmacist can review a yellow case in under 3 minutes.
- Every edit is captured as correction data.
- Pharmacist cannot approve red cases as green.
- Pharmacist cannot send forbidden claims.

## Level 4: Clinical Safety Ready

Status: not ready

Goal:

Reduce preventable clinical harm before any real paid use.

Required:

1. Clinical advisor review of risk rules.
2. Versioned rules stored outside code or with controlled release process.
3. Critical lab threshold policy.
4. High-risk medicine class list.
5. Pregnancy and child-patient escalation policy.
6. Emergency language approved by clinician.
7. Safety phrase blocklist.
8. Human escalation SLA.
9. Red-case no-auto-send guarantee.
10. Adverse event reporting process.
11. Clinical disclaimer reviewed by counsel.
12. Human signoff for every new rule version.

Definition of done:

- Every red/yellow rule has a clinical owner.
- Every rule has tests.
- Rule version appears in audit logs.
- Safety tests fail if forbidden medical claims are generated.

## Level 5: AI/OCR Ready

Status: not ready

Goal:

Use AI for real document understanding without letting it make safety decisions.

Required:

1. Gemini or Nahcrof structured extraction adapter.
2. Prompt that returns strict JSON only.
3. JSON schema validation.
4. Low-confidence fallback to human OCR.
5. Original OCR text preserved.
6. Image/PDF upload pipeline.
7. Document AI fallback plan.
8. Synthetic handwritten prescription test set.
9. Lab report parser test set.
10. Extraction confidence scoring.

Definition of done:

- Extractor always returns valid JSON or a controlled failure.
- Unknown/unclear fields stay unknown/unclear.
- LLM output cannot directly choose green/yellow/red.
- At least 50 synthetic fixtures pass expected classifications and risk paths.

## Level 6: Voice Ready

Status: not ready

Goal:

Send usable parent-language voice notes.

Required:

1. Bhashini TTS adapter.
2. Sarvam fallback.
3. OGG Opus export for WhatsApp.
4. Voice file storage.
5. Retryable TTS jobs.
6. Language preference per parent.
7. Common phrase cache.
8. Audio quality check.

Definition of done:

- Hindi voice note is generated from an approved script.
- Voice file is stored and linked to the case.
- Failed TTS does not lose the case.
- WhatsApp receives audio in the expected format.

## Level 7: Payment Ready

Status: not ready

Goal:

Charge early users without blocking care operations.

Required:

1. Stripe subscription for USD users.
2. Razorpay subscription or payment link for India cards.
3. Family plan model.
4. Usage counter for pharmacist-reviewed documents.
5. Annual plan support.
6. Failed payment state.
7. Admin override for first 10 free families.

Definition of done:

- A family can be marked free, trial, active, past due, or cancelled.
- Payment state does not erase medical history.
- Usage limits are visible but manually overrideable during pilot.

## Level 8: Production Ready

Status: not ready

Goal:

Run paid families with operational, legal, and technical safeguards.

Required:

1. India-region infrastructure decision.
2. Backups and restore test.
3. Audit log immutability.
4. Secret management.
5. Sentry or equivalent error monitoring.
6. Structured logs without patient data leakage.
7. Rate limiting.
8. WABA delivery monitoring.
9. Incident response runbook.
10. DPDP consent and erasure workflow.
11. Vendor processor agreements.
12. Privacy policy and terms.
13. Security review.
14. Access review for operators.

Definition of done:

- A real family can use the service with consent, review, delivery, audit, deletion, and incident processes in place.
- The team can explain exactly where data is stored, who can access it, and how it can be deleted.

## Highest Priority Next Build

Build these first:

1. Supabase schema and persistence adapter.
2. Review task API: list, inspect, edit, approve, escalate.
3. Fixture runner for green/yellow/red synthetic cases.
4. Real WABA adapter interface with dev send stub.
5. TTS adapter interface with local stub, then Bhashini.
6. Structured extraction provider interface using Nahcrof/Gemini.

## Not Ready Because

The current system is not ready for real families because:

- It uses in-memory storage.
- It does not persist uploaded documents.
- It does not have a reviewer dashboard.
- It does not send real WhatsApp replies.
- It does not generate real audio.
- It does not use real OCR/vision extraction.
- It has no clinical-approved rule pack.
- It has no production consent, privacy, erasure, or incident workflow.

## What Can Be Demoed Today

Safe to demo today:

- Product thesis.
- GitHub repo.
- Local API skeleton.
- Consent gate behavior.
- Green/yellow/red routing on synthetic text.
- Nahcrof/Crof AI connectivity.
- Baileys dev bridge structure.

Not safe to demo as working healthcare product:

- Real prescription interpretation.
- Real lab interpretation.
- Real patient workflow.
- Real pharmacist review.
- Real doctor review.
- Real WhatsApp production workflow.

