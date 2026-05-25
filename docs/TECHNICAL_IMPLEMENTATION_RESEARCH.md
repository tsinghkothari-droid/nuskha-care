# Technical Implementation Research

Date: 2026-05-25

This note turns the GitHub/docs search into a concrete implementation plan for the missing Nuskha pipeline.

## Sources Checked

- Baileys: `https://github.com/WhiskeySockets/Baileys`
- Baileys message examples: `https://github.com/kbiits/Whiskey-Baileys`
- Sarvam Bulbul v3: `https://docs.sarvam.ai/api-reference-docs/getting-started/models/bulbul`
- Sarvam REST stream TTS: `https://docs.sarvam.ai/api-reference-docs/text-to-speech/convert-stream`
- Sarvam TTS overview: `https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/text-to-speech/overview`
- Crof/Nahcrof OpenAI-compatible structured extraction through `https://ai.nahcrof.com/v1`
- Gemini structured outputs as fallback: `https://ai.google.dev/gemini-api/docs/structured-output`
- Neon Postgres: `https://neon.com/docs`
- S3-compatible private object storage for prescriptions, lab reports, and generated voice files.

## Target Technical Pipeline

```text
WhatsApp inbound
  -> normalize message
  -> store raw document
  -> classify document
  -> extract structured JSON with vision model
  -> validate medicines/labs
  -> deterministic risk engine
  -> generate safe script
  -> route review
  -> Sarvam TTS
  -> WhatsApp outbound
  -> audit log
  -> family memory
```

## 1. WhatsApp Transport

### Dev

Use Baileys only as the local development transport.

Current repo already has:

- `experimental/baileys-transport/login.mjs`
- `experimental/baileys-transport/bridge.mjs`

Needed:

- Add `send-text.mjs`.
- Add `send-audio.mjs`.
- Add one reusable `baileys-client.mjs` so login, bridge, and send do not duplicate socket setup.
- Add `onWhatsApp` validation before send.
- Add outbound delivery logging.

### Production

Use WABA via AiSensy or Gupshup.

Needed:

- `src/transport/waba/provider.mjs`
- `src/transport/waba/aisensy.mjs`
- `src/transport/waba/gupshup.mjs`
- `src/transport/waba/templates.mjs`
- Signature or token verification on inbound webhook.
- Template fallback when outside 24-hour WhatsApp session window.

## 2. Persistence And Document Storage

Use Neon Postgres for durable relational data.

Use S3-compatible private object storage for files. Good options:

- Cloudflare R2.
- AWS S3.
- Backblaze B2 S3-compatible buckets.
- Any India-region S3-compatible provider that supports private buckets and signed URLs.

Neon should store metadata and workflow state. It should not store raw images or audio blobs.

## Database

Provider:

```text
Neon Postgres
```

Connection:

```text
DATABASE_URL=postgresql://...
DATABASE_PROVIDER=neon
```

Needed module:

```text
src/db/neon.mjs
```

Use the `pg` package or a query builder later. Keep the first adapter thin:

```js
query(sql, params)
withTransaction(fn)
```

## File Storage

Bucket:

```text
medical-documents
```

Suggested object path:

```text
families/<family_id>/documents/<document_id>/<original_filename>
```

Needed tables:

```sql
documents (
  id uuid primary key,
  family_id uuid not null,
  source_message_id text not null,
  doc_type text,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  sha256 text,
  created_at timestamptz not null default now()
)
```

Implementation:

- Server receives file from Baileys bridge or WABA media fetch.
- Validate MIME type and size before upload.
- Upload to private S3-compatible object storage from backend only.
- Store only bucket/path in DB.
- Generate short-lived signed URLs only for reviewer display.

Do not make the bucket public.

## 3. Structured Extraction

Use Crof/Nahcrof structured extraction first when possible. It is already configured through the OpenAI-compatible provider slot and health checks pass locally.

Use Gemini structured output only as fallback for image-heavy cases where Crof cannot directly parse the media or where Crof returns low-confidence/invalid JSON.

Crof/Nahcrof pattern:

- Send the extracted text, image-derived text, or signed media reference to the OpenAI-compatible chat endpoint.
- Ask for strict JSON only.
- Parse with local Zod schema.
- Route invalid JSON or low confidence to human review or Gemini fallback.

Gemini fallback pattern:

- Set response MIME type to `application/json`.
- Provide JSON Schema.
- Parse and validate response using local Zod schema.

Needed module:

```text
src/extraction/crof-structured-extractor.mjs
src/extraction/gemini-vision-fallback.mjs
```

Input:

```js
{
  documentId,
  localPathOrSignedUrl,
  mimeType,
  docTypeHint
}
```

Output:

```js
{
  doc_type,
  doctor_name,
  patient_name,
  date,
  medicines,
  lab_values,
  overall_ocr_confidence,
  red_flag_terms_found,
  raw_text
}
```

Important:

- The model may extract facts, not decide clinical risk.
- If JSON schema parse fails, route to human OCR queue.
- If confidence is low, route yellow.
- Preserve raw OCR text for reviewer inspection.
- Crof/Nahcrof should be the first provider because it is already configured locally.
- Gemini should be a fallback, not the default path.

## 4. Drug And Lab Validation

Current repo has a small local drug reference stub.

Needed:

- `drug_reference` table.
- `drug_aliases` table.
- `lab_reference_rules` table.
- Fuzzy matching using normalized lower-case, punctuation stripping, edit distance, and alias lookup.

Tables:

```sql
drug_reference (
  id uuid primary key,
  brand text not null,
  salt text,
  drug_class text,
  risk_class text not null,
  source text,
  updated_at timestamptz not null default now()
)

drug_aliases (
  id uuid primary key,
  drug_id uuid references drug_reference(id),
  alias text not null,
  source text,
  confidence numeric
)
```

Do not scrape or publish proprietary drug data until licensing is checked.

## 5. Risk Engine

Already started:

- `src/core/risk-engine.mjs`

Needed:

- Move rule config into versioned JSON.
- Add complete red/yellow rule tests.
- Add clinical owner fields.
- Log rule version in every case.

Suggested config:

```text
src/rules/risk-rules-l1.json
```

Rules must remain deterministic.

No LLM path should be able to downgrade red to yellow/green.

## 6. Review Workflow

Current repo creates in-memory review tasks.

Needed:

- Durable `review_tasks` table.
- API endpoints.
- Pharmacist dashboard.

API:

```text
GET    /review/tasks
GET    /review/tasks/:id
POST   /review/tasks/:id/edit
POST   /review/tasks/:id/approve
POST   /review/tasks/:id/escalate
POST   /review/tasks/:id/reject
```

Tables:

```sql
review_tasks (
  id uuid primary key,
  family_id uuid not null,
  document_id uuid,
  queue text not null,
  status text not null,
  risk_path text not null,
  risk_reasons jsonb not null,
  draft_parent_script text,
  draft_child_summary text,
  assigned_to uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

review_actions (
  id uuid primary key,
  review_task_id uuid references review_tasks(id),
  actor_id uuid,
  action text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
)
```

## 7. Sarvam TTS

Use Sarvam Bulbul v3.

Docs show:

- Model: `bulbul:v3`
- API key header: `api-subscription-key`
- REST stream endpoint: `/text-to-speech/stream`
- Supports Indian language codes such as `hi-IN`, `mr-IN`, `ta-IN`, `gu-IN`, `bn-IN`, `en-IN`
- Supports audio formats including MP3 and OPUS.

Needed module:

```text
src/tts/sarvam.mjs
```

Request:

```js
POST https://api.sarvam.ai/text-to-speech/stream
headers:
  api-subscription-key: process.env.SARVAM_API_KEY
  content-type: application/json
body:
{
  text,
  target_language_code: "hi-IN",
  speaker: "shubh",
  model: "bulbul:v3",
  speech_sample_rate: 22050,
  output_audio_codec: "mp3",
  output_audio_bitrate: "128k"
}
```

For WhatsApp:

- Prefer `opus` if Baileys/WABA accepts it cleanly.
- Otherwise generate MP3, then later add ffmpeg conversion to OGG Opus.

Needed:

- Store generated audio in private bucket.
- Link audio to `voice_notes` table.
- Retry failed TTS jobs.

## 8. WhatsApp Outbound

Current manual Baileys send works.

Needed:

- Delivery adapter interface:

```js
sendText({ to, text, context })
sendAudio({ to, audioPathOrUrl, caption, context })
sendTemplate({ to, templateName, variables, context })
```

Baileys dev adapter:

```text
src/transport/baileys/send.mjs
```

WABA production adapter:

```text
src/transport/waba/send.mjs
```

Delivery table:

```sql
message_deliveries (
  id uuid primary key,
  family_id uuid,
  document_id uuid,
  channel text not null,
  provider text not null,
  to_phone text not null,
  message_type text not null,
  provider_message_id text,
  status text not null,
  error text,
  created_at timestamptz not null default now()
)
```

## 9. Audit And Family Memory

Current memory store is in-process only.

Needed:

- Neon Postgres tables.
- Append-only audit log.
- Family context updates only after reviewed or validated facts.

Tables:

```sql
families
members
consents
documents
extractions
risk_decisions
review_tasks
review_actions
voice_notes
message_deliveries
family_medicines
family_lab_trends
audit_log
```

Audit log:

- No update/delete in app code.
- Include actor, action, entity type, entity id, timestamp, and redacted metadata.

## 10. Execution Order

Build in this order:

1. Neon schema and persistence adapter.
2. Baileys reusable client plus send-text/send-audio dev adapter.
3. Sarvam TTS adapter with local audio file output.
4. Delivery adapter interface wired into pipeline.
5. Review task APIs.
6. Synthetic fixture runner for green/yellow/red.
7. Crof/Nahcrof structured extractor.
8. Gemini fallback extractor for media cases.
9. Private object storage for inbound documents and generated audio.
10. Pharmacist dashboard.
11. WABA production adapter.

## Immediate Next Code Slice

Best next PR:

> Wire voice and send for the green path using Sarvam + Baileys dev adapter.

Files to create:

```text
src/tts/sarvam.mjs
src/transport/baileys/client.mjs
src/transport/baileys/send.mjs
src/transport/delivery-adapter.mjs
src/db/neon.mjs
src/storage/object-storage.mjs
test/tts-sarvam.test.mjs
test/delivery-adapter.test.mjs
```

Files to modify:

```text
src/core/delivery.mjs
src/core/pipeline.mjs
package.json
.env.example
docs/TECHNICAL_STRUCTURE.md
```

Acceptance:

- `npm run simulate -- green` can create a TTS audio artifact when `SARVAM_API_KEY` is configured.
- Green-path delivery can use Baileys dev send for text first.
- Audio send is behind `NUSKHA_ENABLE_DEV_SEND=true`.
- Tests still pass without real API keys.
