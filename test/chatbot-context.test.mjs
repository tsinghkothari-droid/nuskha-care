import test from "node:test";
import assert from "node:assert/strict";

import { buildCareChatbotContext, buildCareChatbotPrompt } from "../src/core/chatbot-context.mjs";

test("builds chatbot context with safety policy and family memory", () => {
  const context = buildCareChatbotContext({
    family: {
      language: "hi",
      childLanguage: "en",
      activeMedicines: [{ name: "Metformin", class: "diabetes" }]
    },
    inbound: { messageId: "msg_1", text: "Rx Metformin" },
    extraction: { doc_type: "prescription", overall_ocr_confidence: 0.82 },
    validation: { medicines: [{ normalizedName: "Metformin", matchStatus: "matched" }] },
    risk: { path: "green", ruleVersion: "risk-l1", reasons: [] }
  });

  assert.equal(context.product, "Nuskha Care");
  assert.equal(context.audience.parentLanguage, "hi");
  assert.equal(context.familyMemory.knownMedicines.length, 1);
  assert.equal(context.document.medicines.length, 1);
  assert.ok(context.safetyPolicy.some((rule) => rule.includes("Do not diagnose")));
});

test("chatbot prompt includes required safe-output sections", () => {
  const prompt = buildCareChatbotPrompt(buildCareChatbotContext({ risk: { path: "red" } }));

  assert.match(prompt, /Parent voice script/);
  assert.match(prompt, /Pharmacist notes/);
  assert.match(prompt, /Safety escalation/);
  assert.match(prompt, /Never diagnose/);
});

