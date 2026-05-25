# Requirements

## MVP Requirements

### Intake

- `INTAKE-01`: Normalize inbound WhatsApp-style events from Baileys dev bridge and WABA providers into one internal message schema.
- `INTAKE-02`: Reject unsupported inputs with a clear, safe message.
- `INTAKE-03`: Record duplicate message IDs and avoid processing the same inbound document twice.

### Consent

- `CONSENT-01`: Require consent before processing any medical document.
- `CONSENT-02`: Store consent text, language, timestamp, source, and message ID.
- `CONSENT-03`: Never treat casual chat as medical history unless it is part of a consented care flow.

### Storage

- `STORE-01`: Replace in-memory store with Neon Postgres tables for families, members, documents, extractions, risk decisions, review tasks, voice notes, deliveries, and audit events.
- `STORE-02`: Store uploaded medical files in private S3-compatible object storage, not in Git or public URLs.
- `STORE-03`: Link each database record to the relevant audit events.
- `STORE-04`: Preserve a family memory table for medicines, allergies, doctors, language, and lab trends.

### Extraction

- `EXTRACT-01`: Implement Crof/Nahcrof structured extraction that returns the existing medical extraction schema.
- `EXTRACT-02`: Validate every extraction with Zod before it can enter the risk engine.
- `EXTRACT-03`: Preserve unknown and unclear fields rather than guessing.
- `EXTRACT-04`: Route low-confidence or invalid extraction to human OCR/review.
- `EXTRACT-05`: Add Gemini vision fallback for image-heavy cases Crof cannot handle reliably.

### Validation

- `VALID-01`: Validate medicine names against a local India-focused drug reference table.
- `VALID-02`: Flag unknown medicines for human review.
- `VALID-03`: Flag high-risk classes including insulin, anticoagulants, chemotherapy, opioids, immunosuppressants, cardiac drugs, steroids, and antiepileptics.
- `VALID-04`: Validate lab values against configured reference and critical thresholds.

### Risk Routing

- `RISK-01`: Keep green/yellow/red path decisions deterministic and test-covered.
- `RISK-02`: Store the rule version and exact triggered reasons with every decision.
- `RISK-03`: Red cases cannot auto-send a normal explanation.
- `RISK-04`: Emergency cases must return urgent-care guidance while preserving the no-diagnosis boundary.

### Review Workflow

- `REVIEW-01`: Add API routes to list, inspect, edit, approve, and escalate review tasks.
- `REVIEW-02`: Lock review tasks while an operator is editing.
- `REVIEW-03`: Store every pharmacist edit as correction data.
- `REVIEW-04`: Prevent a pharmacist from downgrading red cases without doctor review.
- `REVIEW-05`: Expose risk reasons, source document, extracted JSON, parent script, and child summary on each review case.

### Voice and Delivery

- `TTS-01`: Add a TTS adapter interface with Sarvam/Bhashini implementations and local stub fallback.
- `TTS-02`: Generate WhatsApp-compatible audio artifacts after approval.
- `TTS-03`: Store voice artifacts privately and link them to delivery records.
- `DELIVERY-01`: Add delivery interface with Baileys dev sender and WABA production sender.
- `DELIVERY-02`: Track delivery status, provider message ID, retry state, and failure reason.

### Dashboard

- `DASH-01`: Build a pharmacist queue focused on speed: document, JSON, risk reasons, draft script, edit, approve, escalate.
- `DASH-02`: Add patient/family context without implying diagnosis authority.
- `DASH-03`: Add basic pharmacy OS surfaces after review APIs are stable: family list, refill reminders, and follow-up queue.
- `DASH-04`: Make the pharmacist CRM feel like a serious management-accountant operating desk: dense, precise, ledger-like, quiet, and business-aware.

### Chatbot

- `CHAT-01`: Add a bounded chatbot context builder using family memory, inbound metadata, classification, extraction, validation, risk, and review status.
- `CHAT-02`: Chatbot must use only supplied context and say unclear when facts are missing.
- `CHAT-03`: Chatbot must preserve the no-diagnosis, no-dose-change, no-substitution, no-false-reassurance boundaries.
- `CHAT-04`: Chatbot must output parent script, child summary, pharmacist notes, doctor questions, and safety escalation sections.
- `CHAT-05`: Dashboard chatbot panel must display risk path and review requirement close to generated answers.

### Safety and Compliance

- `SAFE-01`: Block forbidden claims in generated scripts.
- `SAFE-02`: Add synthetic fixtures covering green, yellow, red, emergency, unknown medicine, and critical lab cases.
- `SAFE-03`: Add erasure request workflow before real pilot.
- `SAFE-04`: Add private operational runbook before first real family.
- `SAFE-05`: Add monitoring and structured logs without leaking medical content.

## Non-Goals

- Diagnose disease.
- Recommend dose changes.
- Recommend cheaper substitutes in MVP.
- Sell medicine in MVP.
- Use Baileys in production.
- Commit real medical files or secrets.

## L1 Traceability Status

As of 2026-05-25, the L1 implementation covers the MVP requirement surface through synthetic flows and local/provider seams. Production readiness still requires real provider setup, clinical signoff, auth/RBAC, durable storage verification, and real WABA/TTS delivery.

- Intake, consent, extraction, validation, risk, review workflow, voice/delivery, dashboard, chatbot, and safety/compliance requirements have code or documentation anchors.
- Phase 6 adds pilot controls for `SAFE-03`, `SAFE-04`, and `SAFE-05`: erasure intake, pilot runbook, readiness checks, template pack, and safe logging redaction.
- Open hardening: `STORE-01` through `STORE-04` must be verified against real Neon/S3, `REVIEW-02` needs real locking semantics, and production WABA must replace Baileys before live use.
