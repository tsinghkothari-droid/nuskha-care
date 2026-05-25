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

- Pending.

