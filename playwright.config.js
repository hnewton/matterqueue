// playwright.config.js
// CJS syntax — no "type":"module" required in package.json
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 20000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'http://localhost:3333',
    // Each test gets a clean browser context (no shared IndexedDB / storage)
    storageState: undefined,
  },
  webServer: {
    // npx serve ships with Node 14+; zero extra install
    command: 'npx serve . --listen 3333 --no-clipboard --cors',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
