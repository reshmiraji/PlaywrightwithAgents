import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ReportConfigurationPage } from '../pages/ReportConfigurationPage';
import { ReportResultsPage } from '../pages/ReportResultsPage';
import { TEST_CREDENTIALS } from './testData';

// Extend basic test by providing page objects
type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  reportConfigPage: ReportConfigurationPage;
  reportResultsPage: ReportResultsPage;
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  reportConfigPage: async ({ page }, use) => {
    const reportConfigPage = new ReportConfigurationPage(page);
    await use(reportConfigPage);
  },

  reportResultsPage: async ({ page }, use) => {
    const reportResultsPage = new ReportResultsPage(page);
    await use(reportResultsPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // Auto-login before each test that uses this fixture
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_CREDENTIALS.username, TEST_CREDENTIALS.password);
    
    // Verify login was successful
    const isLoggedIn = await loginPage.isLoginSuccessful();
    expect(isLoggedIn).toBe(true);
    
    await use(page);
  },
});

export { expect } from '@playwright/test';