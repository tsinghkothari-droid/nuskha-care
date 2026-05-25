# Roadmap

## Phase 1: Durable Core

Goal: Move the L1 skeleton from memory-only demo to persistent, inspectable core.

Deliverables:

- Neon schema migration for families, members, documents, consents, extractions, risk decisions, review tasks, voice notes, deliveries, and audit events.
- Database adapter matching the current memory-store behavior.
- Private object storage adapter interface with local stub and S3-compatible implementation.
- Duplicate-message protection.
- Synthetic fixture runner for green, yellow, red, and unsupported flows.
- End-to-end tests proving consent, persistence, risk, and audit records.

Exit criteria:

- `npm test` passes.
- A synthetic document creates durable records in Neon-compatible schema.
- No real secrets or patient data are committed.

## Phase 2: Crof Extraction and Validation

Goal: Replace the stub extractor with real structured extraction while keeping safety deterministic.

Deliverables:

- Crof/Nahcrof adapter that returns strict medical extraction JSON.
- Zod validation and controlled failure path.
- Low-confidence human OCR routing.
- Expanded synthetic prescription/lab fixture set.
- Drug reference ingestion seed file.
- Lab rules configuration and tests.
- Gemini vision fallback design slot for media-heavy cases.

Exit criteria:

- Extractor returns valid JSON or a controlled failure.
- Unknown fields remain unknown.
- LLM output cannot select green/yellow/red.

## Phase 3: Review Workflow API

Goal: Make pharmacist/doctor review operational before building the full dashboard.

Deliverables:

- Review task list and detail endpoints.
- Edit draft endpoint.
- Approve/send endpoint.
- Escalate endpoint.
- Review lock and audit events.
- Correction capture table.
- Safety guard that prevents red-case downgrade without doctor path.

Exit criteria:

- A yellow case can be edited and approved through API calls.
- A red case cannot be approved as green by accident.
- Correction data is stored for future learning.

## Phase 4: Voice and WhatsApp Delivery

Goal: Produce and deliver approved parent-language responses.

Deliverables:

- TTS adapter interface.
- Sarvam/Bhashini implementation path.
- Local voice artifact stub for tests.
- OGG Opus conversion plan or implementation.
- Delivery adapter interface.
- Baileys dev delivery implementation.
- WABA production adapter placeholder with provider-specific config.
- Delivery retry and failure records.

Exit criteria:

- Approved synthetic case creates a voice artifact and delivery record.
- Baileys dev can send approved text/audio in a controlled test.
- Production WABA remains behind a separate adapter.

## Phase 5: Pharmacist OS Shell

Goal: Turn the backend review loop into the first usable care-desk dashboard.

Deliverables:

- Next.js pharmacist queue.
- Case detail page with source document, extraction JSON, risk reasons, scripts, edit controls, approve, escalate.
- Family/patient context panel.
- Follow-up/refill queue stub.
- Productivity metrics for review time and queue SLA.
- Operator authentication and role boundaries.
- Bounded chatbot assistant panel using case context, family memory, risk reasons, and safety policy.
- Management-accountant visual direction: dense ledgers, strong tables, precise status, restrained palette, and business metrics.

Exit criteria:

- Pharmacist can process a yellow case in under 3 minutes in local demo.
- Dashboard never hides risk reasons.
- Dashboard does not imply diagnostic authority.
- Chatbot cannot invent clinical facts or override the risk engine.

## Phase 6: Pilot Readiness

Goal: Prepare for first controlled real-family pilot with founder/operator review.

Deliverables:

- WABA templates and production webhook verification.
- Production consent copy in Hindi and English.
- Manual-review-only pilot mode.
- Erasure request workflow.
- Incident and breach runbook.
- Basic monitoring and error capture.
- Clinical advisor review checklist for rule pack.
- Private deployment secret plan.

Exit criteria:

- Founder can process a synthetic WABA case from intake to delivery.
- Every outbound response is reviewed in pilot mode.
- Team can explain storage, access, deletion, and incident handling.
