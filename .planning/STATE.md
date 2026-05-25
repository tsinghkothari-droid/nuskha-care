# State

## Active Milestone

Phase 5: Pharmacist CRM

## Current Status

The repository is a working L1 skeleton with public docs, core pipeline modules, Baileys dev transport, Crof/Nahcrof health path, Sarvam environment slot, Neon-shaped migration, optional Neon store, review workflow APIs, fixture runner, TTS/delivery interfaces, and tests. It is not ready for real medical use.

## Next Recommended Task

Build Phase 5: pharmacist CRM shell using the prompt in `docs/PHARMACIST_CRM_FRONTEND_PROMPT.md` and the bounded chatbot context in `src/core/chatbot-context.mjs`.

Phase 1-4 follow-up items remain production-hardening work:

1. Run and verify migrations against a real Neon database.
2. Replace object storage stub with real private S3-compatible storage.
3. Add live Crof extraction fixture evals before enabling `NUSKHA_USE_LIVE_EXTRACTION=true`.
4. Add real Sarvam/Bhashini TTS and WABA delivery.
5. Add auth and role checks before exposing review APIs.

Follow `.planning/PHASES.md` and execute the phase files in order.

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

## Open Risks

- Real handwritten prescription extraction quality is unknown.
- Drug reference data is currently tiny and synthetic.
- Lab threshold policy needs clinical review.
- WhatsApp production templates are not approved.
- Review dashboard does not exist yet.
- Real TTS output is not implemented.
- Audit immutability and erasure process are not implemented.
