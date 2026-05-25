export const fixtureCases = [
  {
    name: "green-prescription",
    inbound: {
      messageId: "fixture-green",
      phone: "910000009001",
      text: "Rx Metformin 500mg once daily after food"
    },
    expectedPath: "green"
  },
  {
    name: "yellow-unknown-medicine",
    inbound: {
      messageId: "fixture-yellow",
      phone: "910000009002",
      text: "Rx Glucorinex 10mg once daily after food"
    },
    expectedPath: "yellow"
  },
  {
    name: "red-insulin-emergency",
    inbound: {
      messageId: "fixture-red",
      phone: "910000009003",
      text: "Rx Insulin 10 units once daily. Patient has chest pain."
    },
    expectedPath: "red"
  },
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

