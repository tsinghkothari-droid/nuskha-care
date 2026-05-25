# Nuskha Care

## Project Vision

Nuskha Care is a WhatsApp-first care desk for Indian families and neighborhood pharmacists. The first wedge explains prescriptions, lab reports, and medicine labels in a parent's language, with deterministic risk routing and human review. The larger product becomes a pharmacist operating system that helps a normal pharmacy deliver Tata 1mg-style care support without owning a large tech team.

The product must stay narrow and safe: explain what is written, route uncertainty to humans, create useful voice/text summaries, and build family memory over time. It must not diagnose, change doses, recommend substitutions, or imply that a report is safe without a clinician.

## Current Repository State

This repo already contains the public product case, core algorithm, L1 backend scaffold, Crof/Nahcrof provider slot, Sarvam environment slot, Baileys development transport, and a readiness checklist. Local tests pass against synthetic flows.

Implemented foundations:

- Fastify API with `/health`, dev WhatsApp inbound, and WABA placeholder routes.
- Core pipeline: classify, extract, validate, risk-route, draft, review-route, delivery-plan.
- Consent gate before document processing.
- Deterministic green/yellow/red risk engine.
- In-memory families, audit events, and review tasks.
- Synthetic unit tests for risk and pipeline behavior.
- Baileys dev transport for local WhatsApp login/send experiments.
- Crof/Nahcrof AI health check path and provider configuration.
- Neon Postgres chosen for durable database.
- S3-compatible private object storage chosen for medical documents and voice files.

Not yet built:

- Neon schema and database adapter.
- Private object storage adapter.
- Real Crof-first structured extraction.
- Gemini/media fallback.
- Real Sarvam/Bhashini TTS output.
- Review task API and pharmacist dashboard.
- Production WABA adapter.
- Bounded care-desk chatbot UI connected to structured case context.
- Production consent, audit immutability, erasure, and incident workflows.

## Product Position

Primary wedge:

- NRI child or Indian caregiver sends parent medical paperwork through WhatsApp.
- Nuskha explains the document in safe, simple language.
- Parent gets a voice note.
- Child gets a short summary.
- Pharmacist/doctor reviews risky or unclear cases.

Strategic pivot:

- Turn the workflow into a pharmacist care OS.
- Let a local pharmacist manage patient documents, counselling scripts, refill reminders, and family communication through one dashboard.
- Keep the family WhatsApp experience simple while giving pharmacists structured tools behind the scenes.

## Hard Boundaries

- No real patient records, phone numbers, prescriptions, lab reports, or secrets in Git.
- Baileys is development-only; production uses WABA via an approved provider.
- Risk decisions are rule-based, versioned, and audited.
- AI may extract and draft, but AI cannot decide final risk.
- No diagnosis, dose change, medicine substitution, or "all clear" claim in MVP.
- Every high-risk or unclear case must route to human review.
- Secrets live only in local `.env` or managed deployment secret stores.

## Technical Baseline

- Runtime: Node.js, ESM, Fastify.
- Database target: Neon Postgres.
- Object storage target: S3-compatible private bucket.
- AI extraction: Crof/Nahcrof first where possible, Gemini fallback for image-heavy failures.
- TTS: Sarvam/Bhashini adapter path, WhatsApp-compatible OGG Opus target.
- WhatsApp dev: Baileys bridge.
- WhatsApp production: WABA adapter behind the same delivery interface.
- Chatbot context: bounded assistant context from family memory, extracted facts, validation, risk, review status, and safety policy.
- Dashboard target: Next.js pharmacist console after API review flows exist.

## Execution Model

The work should run as ordered phases, one after another, using `.planning/PHASES.md` as the index. Each phase has its own file in `.planning/phases/` with build steps, exit criteria, and an execution log. Finish Phase 1 before Phase 2, Phase 2 before Phase 3, and so on unless a hotfix blocks the project.

## Success Metric

North star:

- Parent voice notes listened per family per month.

Engineering near-term metric:

- Synthetic green, yellow, and red cases run end to end with durable persistence, audit records, and review/delivery artifacts.

Operational near-term metric:

- A pharmacist can inspect, edit, approve, or escalate a yellow case in under 3 minutes without seeing raw system internals.
