import fs from 'node:fs';
import { defineConfig } from '@playwright/test';

const hasSystemChrome =
  process.platform === 'linux' &&
  (fs.existsSync('/usr/bin/google-chrome') || fs.existsSync('/usr/bin/google-chrome-stable'));

const browserChannel =
  process.env.PLAYWRIGHT_CHANNEL === 'bundled'
    ? undefined
    : process.env.PLAYWRIGHT_CHANNEL || (hasSystemChrome ? 'chrome' : undefined);

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8081',
    ...(browserChannel ? { channel: browserChannel } : {}),
    headless: true,
    viewport: { width: 412, height: 915 },
    geolocation: { latitude: -33.4489, longitude: -70.6693 },
    permissions: ['geolocation'],
  },
  webServer: {
    command: 'npx expo start --web --port 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
