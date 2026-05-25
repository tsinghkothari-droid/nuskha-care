# Stack Notes

## Backend

- Node.js with ESM modules.
- Fastify API.
- Zod schema validation.
- Current storage is in-memory and should be wrapped behind a durable repository layer.

## Database

- Neon Postgres is the chosen durable database.
- Core tables should be migration-driven and audit-friendly.
- Store provider IDs and timestamps explicitly so WhatsApp retries and duplicate webhooks are easy to reason about.

## Object Storage

- Use S3-compatible private object storage.
- Store medical images, PDFs, and generated voice files outside Postgres.
- Database records should store object keys, content type, checksum, size, and access policy.

## AI

- Crof/Nahcrof is preferred for structured extraction when possible.
- Gemini vision fallback should handle cases requiring stronger image reasoning.
- AI output must be schema-validated before downstream use.
- AI never controls risk path.

## WhatsApp

- Baileys is development-only.
- Production delivery should use WABA via AiSensy, Gupshup, or equivalent.
- Keep inbound normalization and outbound delivery behind provider interfaces.

## Dashboard

- Build review APIs before dashboard UI.
- Dashboard should be operational and dense: queue, SLA, source document, extracted facts, risk reasons, scripts, edit, approve, escalate.

