# Nuskha Care

Nuskha Care is a WhatsApp-first medication and lab-report explanation service for Indian families split across countries.

An older parent in India sends a prescription, lab report, or medicine label on WhatsApp. Nuskha Care reads it, validates what it can, routes risky cases to a pharmacist or doctor, and sends back a simple voice note in the parent's language. The child gets a concise caregiver summary.

Nuskha Care does not diagnose disease, change prescriptions, replace doctors, or sell medicines. The core product is safe explanation plus human review, delivered where families already live: WhatsApp.

## Core Product

The first product is:

> A family medical-document explanation layer for WhatsApp.

It turns messy healthcare paperwork into understandable family communication:

- Parent sends photo on WhatsApp.
- System classifies the document: prescription, lab report, medicine label, or unsupported.
- Vision model extracts structured facts.
- Drug and lab validators check extracted facts against known reference data.
- Rule-based risk engine routes the case to green, yellow, or red path.
- AI drafts a parent voice script and child summary from only validated facts.
- Pharmacist or doctor reviews uncertain or high-risk cases.
- Parent receives a mother-tongue voice note.
- Family memory improves future review with known medicines, doctors, allergies, language, and lab trends.

## What Nuskha Explains

For prescriptions:

- Medicine name, when confidently identified.
- What the medicine is commonly used for, in simple words.
- Timing instructions exactly as written or marked unclear.
- Two warning signs to watch.
- Three questions to ask the doctor next visit.
- Reminder: do not change dose without asking the doctor.

For lab reports:

- Which values appear high, low, normal, or critical.
- What body area the test usually relates to.
- Red-flag symptoms where the family should seek urgent care.
- Reminder: discuss interpretation with the treating doctor.

## What Nuskha Does Not Do

- No diagnosis.
- No medicine substitution.
- No instruction to stop, start, or change a dose.
- No "all clear" message.
- No diet plan in the MVP.
- No medicine marketplace in the MVP.
- No storing casual WhatsApp chat that is unrelated to care.

## Why WhatsApp

The buyer is often an NRI child. The user is often an older parent in India. App downloads, English interfaces, OTP friction, and tiny UI flows are the wrong interface for this family workflow.

WhatsApp is already installed, trusted, and used for healthcare photos today. Nuskha Care makes that existing behavior safer, clearer, and more accountable.

## Safety Model

Nuskha Care separates reading from safety decisions:

- AI reads documents and drafts explanations.
- Deterministic rules decide routing risk.
- Humans review uncertain or high-risk cases.
- Every decision is versioned and audited.

The business is not "replace pharmacist." The business is "give pharmacist leverage over the messy long tail."

## MVP Paths

Green path: clean prescription or lab report, low-risk content, high extraction confidence. The system can send automatically after safety checks.

Yellow path: unclear writing, unknown medicine, abnormal non-critical lab value, or medium-risk medicine. Pharmacist reviews before send.

Red path: emergency terms, critical lab values, pregnancy, child patient, chemotherapy, insulin, anticoagulants, opioids, immunosuppressants, or severe ambiguity. Doctor review or urgent-care instruction is required.

## Initial Stack

- WhatsApp Business API through AiSensy or Gupshup.
- Backend in Node.js and TypeScript.
- Fastify API.
- Supabase Postgres, Storage, Auth, and Realtime.
- BullMQ and Redis for queues.
- Gemini Flash for structured extraction.
- Rule engine for risk routing.
- Bhashini TTS first, Sarvam or ElevenLabs fallback.
- Next.js pharmacist dashboard.
- Stripe and Razorpay for subscriptions.

## Repository Status

This repository starts as a product and technical design package. It is intended to become the implementation home for:

- WhatsApp webhook service.
- Document extraction workers.
- Risk engine.
- Pharmacist review dashboard.
- Consent and audit-log system.
- Test fixtures using synthetic prescriptions and lab reports only.

No real patient documents, phone numbers, prescriptions, or medical records should ever be committed.

## Key Documents

- [L1 Core Product Steps](./docs/L1_CORE_PRODUCT_STEPS.md)
- [Technical Structure](./docs/TECHNICAL_STRUCTURE.md)
- [Readiness Check](./docs/READINESS_CHECK.md)
- [Business Case](./BUSINESS_CASE.md)
- [Core Algorithm](./CORE_ALGORITHM.md)
- [Product Definition](./PRODUCT.md)
- [Open Source Boundary](./docs/OPEN_SOURCE_BOUNDARY.md)
- [Baileys Dev Transport](./experimental/baileys-transport/README.md)
