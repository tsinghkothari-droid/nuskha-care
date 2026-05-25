# Chatbot Context

The Nuskha chatbot is not a free-form medical advisor. It is a bounded assistant for the pharmacist care desk and family explanation workflow.

## What It Can Do

- Explain extracted and validated document facts in simple language.
- Prepare parent voice scripts.
- Prepare child summaries.
- List questions for the doctor.
- Help pharmacists review risk reasons and missing fields.
- Point out when a case needs pharmacist or doctor review.

## What It Cannot Do

- Diagnose.
- Change dose.
- Stop or start a medicine.
- Suggest substitute medicine in MVP.
- Say that a lab value is safe.
- Override the risk engine.

## Context Contract

The chatbot receives structured context from `src/core/chatbot-context.mjs`:

- Product and role.
- Audience language.
- Family memory.
- Document classification.
- Extracted and validated medicines/labs.
- Risk path and reasons.
- Review queue/status.
- Safety policy.

It should use only this context. If something is missing, it must say unclear and route to review.

