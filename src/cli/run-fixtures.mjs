import { fixtureCases } from "../../test/fixtures/cases.mjs";
import { handleInboundMessage } from "../core/pipeline.mjs";

const results = [];

for (const fixture of fixtureCases) {
  await handleInboundMessage({
    messageId: `${fixture.inbound.messageId}-consent`,
    phone: fixture.inbound.phone,
    text: "YES"
  });

  const result = await handleInboundMessage(fixture.inbound, { source: "fixture-runner" });
  results.push({
    name: fixture.name,
    status: result.status,
    riskPath: result.risk?.path || null,
    reviewTaskId: result.reviewTaskId || null,
    passed: fixture.expectedPath ? result.risk?.path === fixture.expectedPath : result.status === fixture.expectedStatus
  });
}

console.table(results);

if (results.some((result) => !result.passed)) {
  process.exitCode = 1;
}

