# Research Summary

This is a local synthesis of the existing Nuskha Care PRD/TRD, repository docs, and current code. No live web research was required for this initialization pass.

Key findings:

- The useful MVP is not a generic chatbot. It is a safety-routed document-to-explanation pipeline with human review.
- The most important technical gap is durable state: Neon records, private object storage, audit logs, and review tasks.
- The pharmacist OS pivot is compatible with the family WhatsApp wedge. Build the backend review workflow first, then expose it as a pharmacist dashboard.
- AI extraction must be provider-pluggable. Crof/Nahcrof can be primary, but validation and risk decisions must remain local and deterministic.
- Baileys is useful for development speed but must stay outside production architecture.

Recommended next build:

1. Neon schema and persistence adapter.
2. Review task API.
3. Synthetic fixture runner.
4. Crof-first extractor implementation.
5. Sarvam/Bhashini TTS adapter.
6. Pharmacist dashboard shell.

