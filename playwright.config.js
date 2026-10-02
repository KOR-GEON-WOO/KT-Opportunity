import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'
import process from 'node:process'
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export default defineConfig({
  testDir: './tests/browser', fullyParallel: true, workers: 2, timeout: 30000,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1440, height: 1000 }, colorScheme: 'light', trace: 'retain-on-failure', screenshot: 'only-on-failure', launchOptions: { executablePath: process.env.CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined) } },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
})
