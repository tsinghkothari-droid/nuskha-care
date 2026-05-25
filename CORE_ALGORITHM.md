# Core Algorithm

Nuskha Care is a hybrid system.

AI reads and explains. Rules decide safety routing. Humans guard uncertainty. Family memory improves future context.

## Pipeline

```text
WhatsApp message
  -> consent check
  -> document classification
  -> structured extraction
  -> validation
  -> risk routing
  -> explanation draft
  -> safety check
  -> human review if needed
  -> voice generation
  -> WhatsApp response
  -> audit log
  -> family memory update
```

## Main Handler

```text
handleIncomingMessage(message):
  family = identifyFamily(message.sender)

  if consentMissing(family):
    sendConsentRequest(family)
    log("consent_required")
    return

  intake = normalizeMessage(message)

  classification = classifyDocument(intake)

  if classification.type not in ["prescription", "lab_report", "medicine_label"]:
    sendUnsupportedDocumentReply(family)
    log("unsupported_document")
    return

  extraction = extractStructuredData(intake, classification)

  validation = validateMedicalFacts(extraction, family)

  risk = routeRisk(extraction, validation, family)

  draft = generateExplanationDraft(
    extraction = extraction,
    validation = validation,
    risk = risk,
    family = family
  )

  safety = runDraftSafetyCheck(draft)

  if safety.failed:
    createPharmacistTask(family, extraction, validation, draft, safety)
    sendReviewDelayReply(family)
    return

  if risk.path == "green":
    voice = generateVoice(draft.parentScript, family.language)
    sendVoiceAndSummary(family, voice, draft.childSummary)
    updateFamilyMemoryAfterSend(family, validation, reviewed = false)
    return

  if risk.path == "yellow":
    createPharmacistTask(family, extraction, validation, draft, risk)
    sendReviewDelayReply(family)
    return

  if risk.path == "red":
    maybeSendUrgentSafetyReply(family, risk)
    createDoctorTask(family, extraction, validation, draft, risk)
    return
```

## Risk Routing

Risk routing must be deterministic and versioned. It should not rely on an LLM's opinion.

```text
routeRisk(extraction, validation, family):
  reasons = []

  if emergencyTermsFound(extraction):
    reasons.add("emergency_terms")

  if patientIsMinor(extraction, family):
    reasons.add("minor_patient")

  if pregnancyMentioned(extraction):
    reasons.add("pregnancy")

  if criticalLabValueFound(extraction.labValues):
    reasons.add("critical_lab_value")

  if highRiskMedicineFound(validation.medicines):
    reasons.add("high_risk_medicine")

  if severeDrugConflictFound(validation.medicines, family.activeMedicines):
    reasons.add("possible_severe_drug_conflict")

  if allergyConflictFound(validation.medicines, family.allergies):
    reasons.add("possible_allergy_conflict")

  if any reasons in RED_REASON_SET:
    return { path: "red", reasons, ruleVersion }

  if extraction.overallConfidence < 0.60:
    reasons.add("low_extraction_confidence")

  if unknownMedicineFound(validation.medicines):
    reasons.add("unknown_medicine")

  if mediumRiskMedicineFound(validation.medicines):
    reasons.add("medium_risk_medicine")

  if abnormalNonCriticalLabFound(extraction.labValues):
    reasons.add("abnormal_lab_value")

  if doseOrTimingAmbiguous(validation.medicines):
    reasons.add("ambiguous_dose_or_timing")

  if newMedicineAddedToChronicStack(validation.medicines, family.activeMedicines):
    reasons.add("new_medicine_for_known_patient")

  if any reasons in YELLOW_REASON_SET:
    return { path: "yellow", reasons, ruleVersion }

  return { path: "green", reasons: ["clean_low_risk_document"], ruleVersion }
```

## Risk Classes

Red:

- Emergency words.
- Critical lab values.
- Pregnancy mention.
- Patient age below 18.
- Insulin.
- Anticoagulants.
- Chemotherapy.
- Opioids.
- Immunosuppressants.
- Severe allergy conflict.
- Severe interaction candidate.

Yellow:

- Unknown medicine.
- Low extraction confidence.
- Messy handwriting.
- Steroids.
- Cardiac medicines.
- Antiepileptics.
- Abnormal but non-critical lab values.
- Dose or food timing unclear.
- New medicine added to known chronic stack.

Green:

- Known low-risk medicine or normal lab.
- High extraction confidence.
- No critical terms.
- No known high-risk class.
- No unclear dose or timing.

## Explanation Generation

The explanation generator receives only allowed facts. It should never be allowed to invent diagnoses or instructions.

```text
generateExplanationDraft(extraction, validation, risk, family):
  allowedFacts = buildAllowedFactSet(extraction, validation, family)

  forbiddenClaims = [
    "diagnosis",
    "dose_change",
    "medicine_substitution",
    "stop_medicine",
    "start_medicine",
    "all_clear",
    "ignore_doctor",
    "guaranteed_safe",
    "diet_prescription"
  ]

  parentScript = generateParentScript(
    language = family.language,
    facts = allowedFacts,
    requiredDisclaimers = [
      "This explains the doctor's paper.",
      "Do not change dose without asking the doctor.",
      "If warning signs appear, contact a doctor urgently."
    ],
    forbiddenClaims = forbiddenClaims
  )

  childSummary = generateChildSummary(
    language = family.childLanguage,
    facts = allowedFacts,
    risk = risk,
    forbiddenClaims = forbiddenClaims
  )

  return { parentScript, childSummary }
```

## Draft Safety Check

```text
runDraftSafetyCheck(draft):
  if containsDiagnosis(draft):
    fail("diagnosis_claim")

  if containsDoseChangeInstruction(draft):
    fail("dose_change")

  if containsSubstitutionInstruction(draft):
    fail("substitution")

  if containsAllClearLanguage(draft):
    fail("false_reassurance")

  if omitsDoctorDisclaimer(draft):
    fail("missing_doctor_disclaimer")

  if omitsUncertaintyWhereNeeded(draft):
    fail("missing_uncertainty")

  return pass
```

## Family Memory

Family memory should update only after validated or reviewed facts.

```text
updateFamilyMemory(family, reviewedCase):
  for medicine in reviewedCase.confirmedMedicines:
    upsert active_medicine:
      name
      salt
      dose
      frequency
      timing
      doctor
      startDate
      confidence

  for labValue in reviewedCase.labValues:
    append lab_trend:
      testName
      value
      unit
      referenceRange
      flag
      reportDate

  update known_doctors
  update allergies
  update preferred_language
  update recurring_document_patterns
```

## Learning Loop

Every pharmacist or doctor correction becomes structured improvement data.

```text
recordCorrection(original, corrected, caseContext):
  diff = compare(original, corrected)

  classifyCorrection(diff):
    medicine_name_fix
    dose_fix
    food_timing_fix
    unsafe_phrase_removed
    unclear_fact_marked
    better_local_language_phrase
    risk_level_changed

  storeCorrection(diff, caseContext)

  if repeatedMedicineNameFix:
    proposeDrugAliasTableUpdate()

  if repeatedUnsafePhrase:
    proposeSafetyBlocklistUpdate()

  if repeatedRiskChange:
    proposeRiskRuleReview()
```

The system may propose improvements automatically, but clinical or safety rules must be approved by a responsible human.

## Core Principle

The product should be safe by structure:

> AI drafts. Rules route. Humans review. Voice explains. Memory compounds.

