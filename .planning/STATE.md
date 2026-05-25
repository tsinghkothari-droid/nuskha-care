# State

## Active Milestone

Phase 1: Durable Core

## Current Status

The repository is a working L1 skeleton with public docs, core pipeline modules, Baileys dev transport, Crof/Nahcrof health path, Sarvam environment slot, and tests. It is not ready for real medical use.

## Next Recommended Task

Implement Neon persistence while preserving the current `src/store/memory-store.mjs` contract:

1. Add schema/migration files.
2. Add database connection configuration using `DATABASE_URL`.
3. Add repository functions for families, consents, audit events, review tasks, and family memory.
4. Keep memory store as local fallback for tests.
5. Add tests proving both memory and database-shaped records follow the same behavior.

## Recent Decisions

- Neon replaces Supabase for Postgres.
- S3-compatible private storage replaces Supabase storage.
- Crof/Nahcrof is the preferred extraction provider where possible.
- Gemini remains fallback for image-heavy extraction failures.
- Sarvam key is local-only in `.env`; never commit it.
- Baileys remains internal development transport only.
- Product direction includes a pharmacist OS layer after the core review workflow is stable.

## Open Risks

- Real handwritten prescription extraction quality is unknown.
- Drug reference data is currently tiny and synthetic.
- Lab threshold policy needs clinical review.
- WhatsApp production templates are not approved.
- Review dashboard does not exist yet.
- Real TTS output is not implemented.
- Audit immutability and erasure process are not implemented.

