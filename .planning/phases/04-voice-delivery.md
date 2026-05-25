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

- Pending.

