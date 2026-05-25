# Pharmacist CRM Frontend Prompt

Use this prompt to build the first Nuskha pharmacist CRM/dashboard frontend.

```text
Build a production-quality pharmacist CRM and care-desk dashboard for Nuskha Care.

Product context:
Nuskha Care is a WhatsApp-first care desk for Indian families and neighborhood pharmacists. Parents send prescriptions, lab reports, and medicine labels. The backend extracts structured facts, validates medicines/labs, runs deterministic green/yellow/red risk routing, drafts scripts, and sends cases to pharmacist or doctor review when needed. The pharmacist dashboard is the operator cockpit.

Design direction:
Make it feel like a management accountant's operating desk for a serious pharmacy business: calm, dense, precise, financially literate, and trustworthy. Avoid a consumer wellness look. Avoid oversized marketing sections, pastel health cards, decorative gradients, and playful illustrations. Use restrained color, strong tables, ledger-style summaries, clear status chips, tight spacing, and excellent scanability.

Primary users:
- Pharmacist reviewer processing yellow cases quickly.
- Pharmacy owner tracking workload, pending care, follow-ups, and revenue.
- Founder/operator reviewing pilot safety.

Core screens:
1. Work Queue
- SLA timer
- Risk path
- Case type
- Patient/family
- Language
- Source channel
- Assigned reviewer
- Status
- Last action
- Quick filters: overdue, red, yellow, unknown medicine, critical lab, failed delivery

2. Case Detail
- Original document preview area
- Extracted JSON panel
- Validated medicines and lab values
- Risk reasons with rule version
- Parent voice script editor
- Child summary editor
- Chatbot assistant panel using bounded context
- Buttons: approve, regenerate voice, escalate, request clearer photo, mark unsupported
- Audit timeline

3. Patient Ledger
- Family members
- Known medicines
- Allergies
- Doctors
- Lab trends
- Past documents
- Voice notes sent
- Open follow-ups

4. Pharmacy Operations
- Review workload
- Refill/follow-up queue
- Doctor escalations
- Failed WhatsApp deliveries
- Monthly recurring revenue
- Plan status
- Pharmacist throughput

5. Settings
- Languages
- Review policies
- WhatsApp templates
- TTS provider status
- AI provider status
- Safety rule version

Interaction rules:
- Never hide risk reasons.
- Never let red cases look routine.
- Make approve/send actions deliberate.
- Put clinical uncertainty close to the edit controls.
- Show audit status everywhere a decision is made.
- Prefer tables, ledgers, drawers, split panes, tabs, compact filters, and keyboard-friendly controls.

Visual style:
- White or near-white workspace.
- Muted ink, charcoal, slate, and restrained green/red/amber for status only.
- Thin borders, compact rows, 4-8px radius.
- No card-inside-card layouts.
- No hero section.
- No decorative background blobs or gradients.
- Typography should feel like a professional operations product, not a landing page.

Frontend stack:
- Next.js App Router
- TypeScript
- shadcn/ui
- Tailwind
- lucide-react icons

Build real mock data and working interactions for the first pass. The first screen should be the Work Queue, not a landing page.
```

