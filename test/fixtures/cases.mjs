import { demoCases } from "../../src/data/demo-cases.mjs";

export const fixtureCases = [
  ...demoCases.map((item) => ({
    ...item,
    inbound: {
      ...item.inbound,
      messageId: `fixture-${item.name}`
    }
  })),
  {
    name: "unsupported-chat",
    inbound: {
      messageId: "fixture-unsupported",
      phone: "910000009004",
      text: "hello what is your pricing"
    },
    expectedStatus: "unsupported"
  }
];
