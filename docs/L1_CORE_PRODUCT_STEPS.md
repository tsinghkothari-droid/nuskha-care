# L1 Core Product Steps

This is the first-level build map for Nuskha Care.

L1 means the smallest complete product loop:

> Parent sends medical paper on WhatsApp. Nuskha returns a safe voice explanation in the parent's language, with human review when needed.

## L1 Product Loop

```text
1. WhatsApp intake
2. Consent check
3. Document classification
4. Structured extraction
5. Medical validation
6. Risk routing
7. Draft explanation
8. Human review when needed
9. Voice generation
10. WhatsApp delivery
11. Audit log and family memory
```

## Step 1: WhatsApp Intake

Goal:

Receive a parent or child message from WhatsApp.

Input:

- WhatsApp sender.
- Text, image, PDF, or document.
- Timestamp.
- Message ID.
- Optional caption.

Output:

- Normalized inbound message.
- Stored raw document reference.
- Family lookup key.

Build first:

- WABA webhook contract.
- Baileys dev bridge for internal testing.
- Message normalization function.

Done when:

- A WhatsApp test message becomes one internal JSON event.
- Image and PDF uploads are stored outside Git.
- Duplicate message IDs are ignored.

## Step 2: Consent Check

Goal:

Confirm the family has accepted the explanation-only service boundary.

Input:

- Sender number.
- Family record.
- Consent status.
- Preferred language.

Output:

- Continue to processing, or send consent request.

Build first:

- `families` table.
- `members` table.
- `consents` table.
- Consent templates in English and Hindi.

Done when:

- First message without consent receives a consent prompt.
- Consent is recorded with timestamp, channel, language, and template version.
- No document is processed before consent.

## Step 3: Document Classification

Goal:

Decide what kind of medical document arrived.

Supported L1 classes:

- `prescription`
- `lab_report`
- `medicine_label`
- `unsupported`

Input:

- Uploaded image or document.
- Caption text.

Output:

- Document type.
- Classification confidence.
- Unsupported reason if not accepted.

Build first:

- Simple image/PDF classifier.
- Fallback manual label option in reviewer dashboard.

Done when:

- Prescription, lab report, and medicine label can be separated in synthetic tests.
- Unsupported documents get a polite reply.

## Step 4: Structured Extraction

Goal:

Turn the paper into structured JSON.

Input:

- Document file.
- Document type.

Output:

```json
{
  "doc_type": "prescription",
  "patient_name": null,
  "doctor_name": null,
  "date": null,
  "medicines": [],
  "lab_values": [],
  "overall_ocr_confidence": 0.0,
  "red_flag_terms_found": []
}
```

Build first:

- Crof/Nahcrof structured-output prompt first.
- Gemini vision fallback prompt for image-heavy cases.
- JSON schema validation.
- Low-confidence fallback queue.

Done when:

- The extractor always returns valid JSON or a controlled failure.
- Unclear fields are marked `unclear`, not guessed as fact.
- Original raw text is preserved for reviewer inspection.

## Step 5: Medical Validation

Goal:

Check extracted medical facts before explanation.

Input:

- Extracted medicines.
- Extracted lab values.
- Family memory.
- Drug reference table.

Output:

- Validated medicines.
- Unknown medicines.
- Risk flags.
- Lab flags.
- Confidence score.

Build first:

- Local drug table with brand, salt, class, common dose, and risk class.
- Fuzzy matcher for Indian brand names.
- Basic lab reference parser.

Done when:

- Known medicine names match a table entry.
- Unknown medicines are not explained as confirmed.
- High-risk medicine classes are flagged.

## Step 6: Risk Routing

Goal:

Route each case to green, yellow, or red path using deterministic rules.

Input:

- Extraction.
- Validation.
- Family memory.
- Rule version.

Output:

- `green`, `yellow`, or `red`.
- Triggered reasons.
- Rule version.

Build first:

- Rule engine.
- Versioned rule config.
- Unit tests for every red and yellow trigger.

Done when:

- LLM output cannot override risk path.
- Every decision explains why it happened.
- Rule version is stored in the audit log.

## Step 7: Draft Explanation

Goal:

Create safe parent and child explanations from allowed facts only.

Input:

- Validated facts.
- Risk decision.
- Parent language.
- Child language.

Output:

- Parent voice script.
- Child text summary.
- Required warnings and disclaimers.

Build first:

- Prompt with forbidden claims.
- Safety checker for diagnosis, dose change, substitution, and false reassurance.
- Hindi script first.

Done when:

- Draft never says to start, stop, or change medicine.
- Draft clearly marks uncertain facts.
- Draft includes "ask doctor before changing dose."

## Step 8: Human Review

Goal:

Let pharmacist or doctor review cases before delivery when needed.

Input:

- Original document.
- Extracted JSON.
- Validated facts.
- Risk decision.
- Draft script and summary.

Output:

- Approved script.
- Edited script.
- Escalated case.
- Rejected unsafe draft.

Build first:

- Pharmacist queue.
- Reviewer card.
- Inline edit and send action.
- Audit log for every reviewer action.

Done when:

- Yellow cases can be reviewed in under 3 minutes.
- Red cases cannot be sent as green.
- Every edit is stored as correction data.

## Step 9: Voice Generation

Goal:

Convert approved parent script into a WhatsApp-friendly voice note.

Input:

- Approved parent script.
- Language.
- Voice provider.

Output:

- OGG Opus audio file.
- Voice note metadata.

Build first:

- Bhashini adapter.
- Sarvam fallback.
- Common phrase cache.

Done when:

- Hindi voice note can be generated and sent.
- Failed TTS creates a retryable job.
- Audio file is linked to the audit log.

## Step 10: WhatsApp Delivery

Goal:

Send the final response back to parent and child.

Input:

- Voice note.
- Child summary.
- Review path.
- WhatsApp recipient list.

Output:

- Sent message IDs.
- Delivery status.
- Listen/read events where available.

Build first:

- WABA send adapter.
- Baileys dev send adapter only for internal testing.
- Template fallback for outside 24-hour window.

Done when:

- Parent receives voice note.
- Child receives text summary.
- Delivery failures are retryable and visible.

## Step 11: Audit Log And Family Memory

Goal:

Make the system safer and stickier after each reviewed case.

Input:

- Final extraction.
- Review decision.
- Sent script.
- Delivery metadata.
- Corrections.

Output:

- Immutable audit record.
- Updated family medicine list.
- Updated lab trend.
- Correction dataset candidate.

Build first:

- Append-only audit log.
- Family medical context tables.
- Correction event table.

Done when:

- Each case can be reconstructed from audit logs.
- Family memory updates only from validated or reviewed facts.
- Raw correction data stays private.

## L1 Build Order

Build in this exact order:

1. Intake and consent.
2. Synthetic document fixtures.
3. Document classifier.
4. Structured extractor.
5. Drug and lab validator.
6. Rule-based risk engine.
7. Explanation draft and safety checker.
8. Pharmacist queue.
9. TTS voice generation.
10. WhatsApp delivery.
11. Audit and family memory.

## L1 Demo Script

The first demo should show one clean prescription:

1. Send prescription photo on WhatsApp.
2. System records consent.
3. System extracts medicine name and timing.
4. System routes green.
5. System creates Hindi script.
6. System generates voice.
7. Parent receives voice note.
8. Child receives text summary.
9. Case appears in audit log.

The second demo should show one unclear prescription:

1. Send messy prescription photo.
2. System extracts partial facts.
3. System routes yellow.
4. Pharmacist sees review card.
5. Pharmacist fixes medicine name.
6. System regenerates voice.
7. Parent receives reviewed voice note.
8. Correction is stored.

The third demo should show one red case:

1. Send lab report with critical value or message with emergency term.
2. System routes red.
3. Parent receives urgent-care instruction.
4. Doctor review task is created.
5. No auto-reassurance is sent.

## L1 Non-Negotiables

- No real patient data in GitHub.
- No diagnosis.
- No medicine substitution.
- No dose change instruction.
- No LLM-only risk decision.
- No production Baileys.
- No processing before consent.
- No silent failure for red cases.
