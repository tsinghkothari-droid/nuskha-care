# State

## Active Milestone

Phase 6: Pilot Readiness

## Current Status

The repository is a completed L1 skeleton across phases 1-6 with public docs, core pipeline modules, Baileys dev transport, Crof/Nahcrof health path, Sarvam environment slot, Neon-shaped migration, optional Neon store, review workflow APIs, fixture runner, TTS/delivery interfaces, pharmacist CRM, pharmacy OS gap coverage, pilot-mode manual review, WABA template pack, consent copy, erasure intake, readiness checks, and tests. It is not ready for open public medical use.

## Next Recommended Task

Publish and maintain this repo as the public L1 reference, then move from L1 pilot readiness to production hardening. Start with real Neon migration verification, authentication/roles, real private object storage, real WABA provider setup, and clinical advisor signoff.

Production-hardening items remain:

1. Run and verify migrations against a real Neon database.
2. Replace object storage stub with real private S3-compatible storage.
3. Add live Crof extraction fixture evals before enabling `NUSKHA_USE_LIVE_EXTRACTION=true`.
4. Add real Sarvam/Bhashini TTS and WABA delivery.
5. Add auth and role checks before exposing review APIs.
6. Submit and approve WABA templates with the selected provider.
7. Complete clinical advisor review of rule packs and lab thresholds.
8. Run a controlled founder/operator pilot before any automated green-path send.

Follow `.planning/PHASES.md` for phase receipts and verification notes.

## Recent Decisions

- Neon replaces Supabase for Postgres.
- S3-compatible private storage replaces Supabase storage.
- Crof/Nahcrof is the preferred extraction provider where possible.
- Gemini remains fallback for image-heavy extraction failures.
- Sarvam key is local-only in `.env`; never commit it.
- Baileys remains internal development transport only.
- Product direction includes a pharmacist OS layer after the core review workflow is stable.
- Pharmacist CRM should look like a management-accountant operating desk, not a consumer wellness app.
- Chatbot is allowed only as a bounded care-desk assistant using structured context and safety policy.
- First pilot must run with `NUSKHA_PILOT_MODE=true`, forcing every outbound explanation through manual review.
- Public release snapshot lives at `docs/PUBLIC_RELEASE.md`; it is the safe front door for collaborators.

## Open Risks

- Real handwritten prescription extraction quality is unknown.
- Drug reference data is currently tiny and synthetic.
- Lab threshold policy needs clinical review.
- WhatsApp production templates are not approved.
- Real WABA production delivery is not implemented.
- Real TTS provider output is not implemented.
- Audit immutability and erasure process are not implemented.
