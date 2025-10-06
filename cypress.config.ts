
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000', // Assuming the app runs on this port
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
