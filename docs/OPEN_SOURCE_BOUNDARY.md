# Open Source Boundary

Nuskha Care can be public on GitHub, but not every asset belongs in public.

## Public Repository Purpose

The public repository should prove that the product is:

- Safety-led.
- Human-reviewed where needed.
- Auditable.
- Useful for Indian families.
- Clear about what it does not do.

It should attract collaborators without exposing patient data or business-critical private datasets.

## Good Public Content

- README.
- Business case.
- Product definition.
- Core algorithm.
- Risk-routing schema.
- Consent-flow templates.
- Synthetic examples.
- Dashboard wireframes.
- Test harnesses.
- Safety blocklist examples.
- API contracts.
- Database schema without real data.

## Private Content

Never publish:

- Real prescriptions.
- Real lab reports.
- WhatsApp numbers.
- Patient names.
- Doctor names from real cases.
- Payment data.
- Vendor secrets.
- Production logs.
- Raw pharmacist correction data.
- Clinical advisor private comments.

## Synthetic Fixture Rule

Every test image, prescription, lab report, or WhatsApp transcript in this repo must be synthetic.

If a file came from a real person, it must not be committed even if names are blurred. Redaction mistakes are too easy.

## Licensing Recommendation

Start with a conservative license decision:

- Docs can be Creative Commons Attribution-NonCommercial while the business model is being validated.
- Code can be private at first or published under Apache-2.0 later.
- Clinical rules should remain versioned and reviewable, but publication should be decided with legal and clinical advisors.

## Repo Positioning

The public repo should say:

> Nuskha Care is building safe medical-document explanation for Indian families on WhatsApp. This repository documents the product, safety model, and early implementation architecture.

It should not say:

> This repo diagnoses prescriptions.

It should not invite random contributors to submit clinical advice without review.

