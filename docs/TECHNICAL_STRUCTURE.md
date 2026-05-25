# Technical Structure

This is the first implementation structure for the Nuskha Care L1 product loop.

## Runtime Shape

```text
WhatsApp or Baileys dev bridge
  -> Fastify API
  -> core pipeline
  -> classifier
  -> extractor
  -> validator
  -> risk engine
  -> explanation generator
  -> review router
  -> delivery planner
  -> audit and memory store
```

## Main Entry Points

- `src/server.mjs`: Fastify API server.
- `src/core/pipeline.mjs`: L1 orchestration brain.
- `experimental/baileys-transport/bridge.mjs`: internal WhatsApp dev bridge.
- `src/cli/simulate.mjs`: local scenario runner.

## API Routes

`GET /health`

Checks that the service is alive.

`POST /dev/whatsapp-inbound`

Receives events from the Baileys dev bridge.

`POST /webhooks/waba/inbound`

Placeholder production route for WABA providers such as AiSensy or Gupshup.

Both inbound routes use the same core pipeline.

## Core Modules

`src/schemas/inbound.mjs`

Normalizes incoming WhatsApp-style payloads.

`src/core/classifier.mjs`

Classifies input into prescription, lab report, medicine label, or unsupported.

`src/core/extractor.mjs`

Temporary structured extraction stub. Later this becomes Gemini structured output plus Document AI fallback.

`src/core/validator.mjs`

Matches extracted medicines against the reference table and flags unknown or risky items.

`src/core/risk-engine.mjs`

Deterministic green/yellow/red routing. This is the safety heart of the product and must remain rule-based.

`src/core/explanation.mjs`

Creates safe parent and child drafts from allowed facts only.

`src/core/review-router.mjs`

Chooses auto, pharmacist, or doctor queue.

`src/core/delivery.mjs`

Creates a delivery plan. The current implementation stubs voice generation and WABA send.

`src/store/memory-store.mjs`

In-memory placeholder for families, audit log, and review tasks. Later this becomes Supabase.

## Current Code Boundary

Implemented now:

- Fastify service.
- Consent gate.
- Inbound payload schema.
- L1 classifier.
- Stub extractor.
- Drug reference validation.
- Rule-based risk engine.
- Safe draft generator.
- Review routing.
- Delivery plan stub.
- In-memory audit and family store.
- Node tests.

Still to build:

- Supabase persistence.
- Real Gemini extraction.
- Real drug table ingestion.
- Bhashini/Sarvam TTS.
- WABA provider send adapter.
- Pharmacist dashboard.
- Doctor review queue.
- Production consent templates.

## Local Commands

Install:

```bash
npm install
```

Start API:

```bash
npm run dev:api
```

Run simulated green case:

```bash
npm run simulate -- green
```

Configure Nahcrof/Crof AI locally:

```powershell
npm run provider:nahcrof -- -ApiKey YOUR_KEY -Model glm-4.7-flash
npm run ai:health
```

Run tests:

```bash
npm test
```

Check syntax:

```bash
npm run check
```
