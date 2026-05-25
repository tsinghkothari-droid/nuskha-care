# Phase 1: Durable Core

## Goal

Move Nuskha from memory-only demo to durable local/dev persistence with Neon-shaped records.

## Build Steps

1. Add migration files for families, members, consents, documents, extractions, risk decisions, review tasks, voice notes, deliveries, and audit events.
2. Add database configuration using `DATABASE_URL` and `DATABASE_PROVIDER=neon`.
3. Create a repository interface that preserves the current memory-store contract.
4. Keep memory store as test fallback.
5. Add duplicate-message protection.
6. Add synthetic fixtures for green, yellow, red, and unsupported cases.
7. Add fixture runner and tests.

## Exit Criteria

- Synthetic consented document creates durable database-shaped records.
- Duplicate inbound message is not processed twice.
- Audit event stores rule version and risk reasons.
- `npm test` and `npm run check` pass.

## Execution Log

- 2026-05-25: Added Neon-shaped migration at `db/migrations/001_core.sql`.
- 2026-05-25: Added store selector, optional Neon store, expanded memory store, duplicate-message guard, and object-storage stub.
- 2026-05-25: Added synthetic fixtures and `npm run fixtures` covering green, yellow, red, and unsupported flows.
- 2026-05-25: Verification passed with `npm test`, `npm run check`, and `npm run fixtures`.
- Remaining before production: run migration against a real Neon database, add migration runner, add real S3-compatible upload implementation.
