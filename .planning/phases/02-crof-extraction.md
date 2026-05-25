# Phase 2: Crof Extraction

## Goal

Replace the stub extractor with Crof/Nahcrof structured extraction while keeping safety decisions deterministic.

## Build Steps

1. Add Crof extraction provider call using the existing OpenAI-compatible client.
2. Force strict JSON matching `src/schemas/medical-extraction.mjs`.
3. Validate model output with Zod.
4. Route invalid or low-confidence extraction to human OCR/review.
5. Add Gemini fallback placeholder for image-heavy failures.
6. Add synthetic fixture tests for handwritten-like text, lab reports, and unknown medicine names.

## Exit Criteria

- Extractor returns valid JSON or controlled failure.
- Unknown fields remain unknown.
- Risk engine receives only validated structured data.
- `npm test` and `npm run check` pass.

## Execution Log

- 2026-05-25: Added Crof/Nahcrof extraction path using the existing OpenAI-compatible chat provider.
- 2026-05-25: Added strict JSON parse and Zod validation before extraction enters validation/risk.
- 2026-05-25: Added controlled media-only fallback that routes low-confidence image-heavy cases to review instead of guessing.
- 2026-05-25: Added `NUSKHA_USE_LIVE_EXTRACTION=false` default so tests do not call live AI accidentally; set true only for live extraction trials.
- 2026-05-25: Verification passed with `npm test`, `npm run check`, and `npm run fixtures`.
- Remaining before production: harden prompts with fixture evals, add Gemini vision fallback, and test against synthetic handwritten images.
