import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000/pairminator#',
    env: {
      "NODE_ENV": "development",
      "REACT_APP_DATA_SOURCE": "emulators",
    }
  },
});
