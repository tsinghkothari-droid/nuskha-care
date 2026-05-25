# Product Definition

## One-Line Product

Nuskha Care explains Indian prescriptions and lab reports over WhatsApp using AI drafts, rule-based risk routing, and pharmacist or doctor review.

## Primary Job

Help an older parent and far-away child understand what a medical paper says without pretending to replace the treating doctor.

## Users

Parent:

- Lives in India.
- Uses WhatsApp.
- Prefers voice.
- May prefer Hindi, Marathi, Tamil, Bengali, Gujarati, or another Indian language.
- Wants simple instruction and reassurance.

Child:

- Lives away from parent.
- Pays for the plan.
- Wants a clear summary, shared history, and confidence that risky cases are reviewed.

Reviewer:

- Pharmacist handles routine medication explanation and uncertain extraction.
- Doctor handles red-path cases and urgent clinical concerns.

## MVP Scope

Supported:

- Prescription photo.
- Lab report photo or PDF.
- Medicine label or strip photo.
- Hindi voice response first.
- Pharmacist dashboard.
- Red/yellow/green routing.
- Family subscription.
- Consent capture.
- Audit log.

Unsupported:

- Diagnosis.
- Dose changes.
- Medicine substitution.
- Emergency treatment.
- Diet prescription.
- Claims that a report is safe or harmless.
- Full EHR replacement.

## User Flow

1. Parent or child sends a medical document on WhatsApp.
2. Nuskha confirms consent if needed.
3. System classifies the document.
4. System extracts structured data.
5. System validates medicines and lab values.
6. Risk engine assigns green, yellow, or red path.
7. AI drafts parent voice script and child summary.
8. Green cases are sent after automated safety checks.
9. Yellow cases go to pharmacist review.
10. Red cases go to doctor review or urgent-care instruction.
11. Final voice note and text summary are sent.
12. Reviewed facts update family memory.

## Parent Voice Note Requirements

Every voice note must:

- Use simple language.
- Mention uncertainty when a fact is unclear.
- Say not to change dose without asking the doctor.
- Mention warning signs where relevant.
- Give questions to ask the doctor.
- Avoid diagnosis.
- Avoid substitution.
- Avoid "do not worry" when a medical value is abnormal.

## Child Summary Requirements

Every child summary must:

- State document type.
- List extracted medicines or abnormal labs.
- State review path.
- State whether a pharmacist or doctor reviewed it.
- Highlight unclear fields.
- Include next questions for the treating doctor.

## Reviewer Dashboard Requirements

Reviewer cards must show:

- Original image.
- Extracted JSON.
- Medicine validation result.
- Risk decision and triggered rules.
- Draft parent script.
- Draft child summary.
- Edit controls.
- Regenerate voice.
- Send action.
- Audit trail.

Target pharmacist review time: 2 to 3 minutes per yellow case.

## Subscription

Initial plan:

- USD 15 per family per month.
- Two parents included.
- Multiple family viewers included.
- Five pharmacist-reviewed documents included.
- Doctor review charged separately when needed.

## North Star

Parent voice notes listened per family per month.

This is stronger than signups or documents sent because it measures whether the parent actually received help.

