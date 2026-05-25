# Business Case

## The Opportunity

Indian families already run a hidden care-coordination system on WhatsApp.

Parents send photos of prescriptions, lab reports, medicine strips, and discharge papers. Children living abroad try to interpret them between meetings. The system works only because family members improvise. It is stressful, unsafe, repetitive, and expensive in attention.

Nuskha Care turns this informal behavior into a structured, safer service:

- WhatsApp intake.
- Medical-document understanding.
- Risk routing.
- Pharmacist or doctor review.
- Parent-language voice explanation.
- Shared family memory.

## The Buyer

The first buyer is the NRI child, usually age 30 to 45, living in the US, UK, UAE, Canada, Singapore, or similar markets.

They are already spending money and attention on parents' healthcare:

- Repeat doctor visits.
- Monthly chronic medicines.
- Quarterly lab reports.
- Family calls to explain paperwork.
- Anxiety when siblings disagree about what a prescription means.

This buyer pays for reassurance, clarity, and coordination.

## The User

The daily user is the older parent in India.

They may not want another healthcare app. They may not read English comfortably. They may not want to type long questions. They already know how to open WhatsApp and play a voice note.

That makes voice-on-WhatsApp the right interface.

## Core Product

Nuskha Care is not a telemedicine app and not a pharmacy app.

The core product is:

> A reviewed explanation layer for family medical paperwork.

The product promise is deliberately narrow:

> Send the medical paper. Receive a simple voice explanation in the parent's language, with human review when needed.

## Why This Is a Business

The pain repeats. Chronic care creates recurring documents:

- Diabetes prescriptions.
- Blood pressure medicines.
- Thyroid reports.
- Lipid panels.
- Kidney markers.
- Follow-up prescriptions after every visit.

The workflow is not one-time. It comes back every month or every quarter. That supports a subscription instead of a one-off utility.

## Pricing Logic

Initial price:

- USD 15 per month per family.
- USD 144 annual plan.
- Includes two parents and invited family members.
- Includes five pharmacist-reviewed documents per month.
- Doctor review is extra when required.

This price is high enough to support human review and low enough for the NRI care budget.

## Why Not a Big Pharmacy App

Large Indian pharmacy platforms are optimized for selling medicines, diagnostics, and appointments.

Nuskha Care is optimized for interpretation and family coordination. It does not need to push medicine sales in the MVP. That neutrality matters because the family is asking, "What does this mean?" not "What can I buy?"

The wedge is small enough that large players may ignore it, but painful enough that families will pay.

## Why GitHub

A public GitHub repository helps Nuskha Care in four ways.

First, it creates trust. Healthcare buyers, advisors, pharmacists, and early technical partners can see that the product is safety-led, audited, and not a black-box chatbot pretending to be a doctor.

Second, it helps recruit. Good engineers, pharmacists, designers, and clinical advisors can evaluate the operating model before joining.

Third, it creates implementation discipline. Public architecture documents force the team to define what is allowed, what is forbidden, and what must be reviewed by humans.

Fourth, it can become a public protocol for safe medical-document explanation in India while the company keeps private assets private.

## What Should Be Open

The public repository can include:

- Product definition.
- Risk-routing architecture.
- Synthetic test fixtures.
- Safety policy.
- Consent-flow templates.
- Audit-log schema.
- Dashboard wireframes.
- Non-clinical engineering code.
- Redacted examples.

## What Must Stay Private

The public repository must not include:

- Patient data.
- Phone numbers.
- Real prescriptions.
- Real lab reports.
- Production credentials.
- WABA tokens.
- Payment keys.
- Clinical-advisor private notes.
- Vendor contracts.
- Proprietary correction data before legal review.

The correction dataset is a business moat. It can produce public learnings later, but raw correction history should remain private.

## Moat

The defensibility is not OCR or text-to-speech.

The defensibility is:

- Family memory: medicine history, lab trends, doctor names, allergies, language, and prior verified documents.
- Pharmacist correction data: Indian-brand spelling, local phrasing, unsafe draft patterns, and review outcomes.
- Distribution network: each family account naturally invites siblings, spouses, doctors, and caregivers.
- Workflow trust: safety-first positioning without a medicine-sales conflict.

## Go-To-Market

First 10 families:

- Founder-led onboarding.
- Free forever.
- Hand-review every case.
- Learn failure modes.

First 100 families:

- NRI communities.
- Indian doctors abroad.
- India-based endocrinologists and physicians.
- Carefully written Reddit and LinkedIn founder story.

First 1,000 families:

- Paid Meta acquisition for NRI adult children.
- Referral loop through family invites.
- Doctor and pharmacist partner referrals.

## Success Metrics

North star:

> Parent voice notes listened per family per month.

Supporting metrics:

- Week-4 retention.
- Second-parent attachment rate.
- Pharmacist review time.
- Green/yellow/red distribution.
- Extraction confidence by document type.
- Human correction rate.
- WABA template approval and delivery rate.
- Family invite conversion.

## Kill Criteria

Nuskha Care should stop or pivot if:

- Week-4 retention is below 50 percent by month 3.
- Pharmacists cannot review at least 60 cases per day with acceptable quality.
- WABA template rejection is above 30 percent.
- Paid acquisition cost is above USD 80 by month 6.
- Families repeatedly ask for diagnosis or prescription changes instead of explanation.

## Business Thesis

Nuskha Care wins if it becomes the trusted family layer between Indian medical paperwork and overseas caregivers.

The product starts as voice explanation. The platform becomes longitudinal family medical context.

