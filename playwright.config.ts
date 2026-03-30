import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const reportTimestamp = new Date().toISOString().split('.')[0].replace(/[:.]/g, '-').replace('T', '_');

// Read environment configuration directly
function getEnvironmentConfig() {
  const envFile = path.resolve(__dirname, 'environment.properties');
  
  if (!fs.existsSync(envFile)) {
    console.warn('⚠️ environment.properties not found, using default TST URL');
    return {
      UI_URL: 'https://test-cmm.origincrossmedia.com/',
      API_URL: 'https://test-cmm.origincrossmedia.com/api'
    };
  }
  
  const content = fs.readFileSync(envFile, 'utf-8');
  const config: { [key: string]: string } = {};
  
  content.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;
    const [key, value] = line.split('=');
    if (key && value) {
      config[key.trim()] = value.trim();
    }
  });

  const environment = process.env.TEST_ENV || config['DEFAULT_ENV'] || 'TST';
  console.log(`🌍 Using ${environment} environment`);
  
  return {
    UI_URL: config[`${environment}_UI_URL`] || 'https://test-cmm.origincrossmedia.com/',
    API_URL: config[`${environment}_API_URL`] || 'https://test-cmm.origincrossmedia.com/api'
  };
}

const envConfig = getEnvironmentConfig();

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { 
      outputFolder: `playwright-report/test-report_${reportTimestamp}`,
      open: 'never' 
    }],
    ['json', { 
      outputFile: `playwright-report/test-report_${reportTimestamp}/results.json` 
    }],
    ['junit', { 
      outputFile: `playwright-report/test-report_${reportTimestamp}/junit-results.xml` 
    }],
    ['list']
  ],
  // Output folder for test artifacts (videos, screenshots, traces)
  outputDir: `test-results/test-run_${reportTimestamp}`,

  use: {
    baseURL: envConfig.UI_URL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: undefined,
});