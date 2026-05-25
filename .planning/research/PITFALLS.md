# Pitfalls

## Medical Safety

- Do not let AI decide green/yellow/red.
- Do not generate diagnosis or dose-change language.
- Do not say a lab value is safe or harmless.
- Treat low confidence as review-required.

## Data Handling

- Never commit `.env`, runtime WhatsApp sessions, real patient files, or phone numbers.
- Do not log full prescription text in production logs.
- Do not expose private object storage URLs without signed access and expiry.

## WhatsApp Transport

- Baileys can break or violate production expectations if treated as a product transport.
- WABA template rejection can block onboarding, so template copy should be utility-focused and reviewed early.

## Product Focus

- Pharmacy OS scope can sprawl quickly. First build review workflow, audit, delivery, and patient memory.
- Medicine marketplace and substitution features should wait until safety and pharmacist workflow are proven.

