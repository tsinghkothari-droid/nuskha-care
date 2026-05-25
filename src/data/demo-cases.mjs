export const demoCases = [
  {
    name: "green-prescription",
    inbound: {
      phone: "910000009001",
      text: "Rx Metformin 500mg once daily after food"
    },
    expectedPath: "green"
  },
  {
    name: "yellow-unknown-medicine",
    inbound: {
      phone: "910000009002",
      text: "Rx Glucorinex 10mg once daily after food"
    },
    expectedPath: "yellow"
  },
  {
    name: "red-insulin-emergency",
    inbound: {
      phone: "910000009003",
      text: "Rx Insulin 10 units once daily. Patient has chest pain."
    },
    expectedPath: "red"
  },
  {
    name: "yellow-lab-report",
    inbound: {
      phone: "910000009004",
      text: "Lab report HbA1c 8.4 high. Creatinine 1.6 high."
    },
    expectedPath: "yellow"
  }
];

