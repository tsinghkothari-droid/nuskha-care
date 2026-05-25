# Phase 4: Voice Delivery

## Goal

Generate and send approved parent-language responses.

## Build Steps

1. Add TTS adapter interface.
2. Add Sarvam implementation and Bhashini placeholder/fallback.
3. Add local stub that produces deterministic test artifacts.
4. Add OGG Opus conversion path for WhatsApp delivery.
5. Add delivery provider interface.
6. Add Baileys dev sender behind delivery interface.
7. Add WABA production sender placeholder.
8. Store delivery status, provider message ID, retry count, and failure reason.

## Exit Criteria

- Approved case creates voice artifact and delivery record.
- Baileys dev delivery can send an approved test message.
- WABA remains separate and production-only.
- `npm test` and `npm run check` pass.

## Execution Log

- 2026-05-25: Added TTS service interface with deterministic local artifact stub and Sarvam/Bhashini provider slots.
- 2026-05-25: Added delivery service interface with stub, Baileys dev, and WABA placeholder branches.
- 2026-05-25: Green auto path and approved review path now create voice-note and delivery records.
- 2026-05-25: Verification passed with `npm test`, `npm run check`, and `npm run fixtures`.
- Remaining before production: implement real Sarvam/Bhashini calls, OGG Opus conversion, Baileys audio send, WABA upload/send, retry worker, and delivery webhooks.
