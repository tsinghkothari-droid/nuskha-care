import test from "node:test";
import assert from "node:assert/strict";

import { routeRisk } from "../src/core/risk-engine.mjs";

test("routes insulin to red path", () => {
  const risk = routeRisk({
    extraction: { red_flag_terms_found: [], lab_values: [], overall_ocr_confidence: 0.9 },
    validation: {
      medicines: [{ normalizedName: "insulin", class: "insulin", riskClass: "high", dose: "10 units", frequency: "once daily" }],
      labValues: []
    },
    familyMemory: {}
  });

  assert.equal(risk.path, "red");
  assert.equal(risk.reasons[0].code, "high_risk_medicine");
});

test("routes unknown medicine to yellow path", () => {
  const risk = routeRisk({
    extraction: { red_flag_terms_found: [], lab_values: [], overall_ocr_confidence: 0.9 },
    validation: {
      medicines: [{ normalizedName: "unclear", matchStatus: "unknown", dose: "unclear", frequency: "unclear" }],
      labValues: []
    },
    familyMemory: {}
  });

  assert.equal(risk.path, "yellow");
});

test("routes clean low-risk document to green path", () => {
  const risk = routeRisk({
    extraction: { red_flag_terms_found: [], lab_values: [], overall_ocr_confidence: 0.9 },
    validation: {
      medicines: [{ normalizedName: "metformin", class: "antidiabetic", riskClass: "low", matchStatus: "matched", dose: "500mg", frequency: "once daily" }],
      labValues: []
    },
    familyMemory: {}
  });

  assert.equal(risk.path, "green");
});

