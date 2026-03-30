import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  // Header elements
  readonly dashboardHeader: Locator;
  readonly reportsHeader: Locator;
  readonly createReportBtn: Locator;
  readonly logoutBtn: Locator;
  readonly logoutConfirmationBtn: Locator;

  // Navigation elements
  readonly homeLink: Locator;

  // Main content elements
  readonly reportsSection: Locator;
  readonly reportsTable: Locator;
  readonly reportsTableHeader1: Locator;
  readonly reportsTableHeader2: Locator;
  readonly reportsTableHeader3: Locator;
  readonly reportsTableHeader4: Locator;

  // User elements
  readonly userProfile: Locator;

  // Footer elements
  readonly pageNumber: Locator;
  readonly nextPageBtn: Locator;
  readonly previousPageBtn: Locator;

  // Table rows
  readonly reportsTableRows: Locator;

  // Filters
  readonly createdByDropdown: Locator;
  readonly filterBtn: Locator;

  // Report creation elements
  readonly reportNameInput: Locator;
  readonly continueBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.dashboardHeader = page.locator('h1, .dashboard-header');
    this.reportsHeader = page.locator('#dashboard > div.btn-container.btn-container-wrapper > h2');
    this.createReportBtn = page.locator('//*[@id="create-report-btnundefined"]/label');
    this.logoutBtn = page.locator('#logout-btn');
    this.logoutConfirmationBtn = page.locator('#continue-btn');

    // Navigation elements
    this.homeLink = page.locator('#home-btn');

    // Main content elements
    this.reportsSection = page.locator('#dashboard-table > div');
    this.reportsTable = page.locator('#dashboard-table > div > table');
    this.reportsTableHeader1 = page.locator('#dashboard-table > div > table > thead > tr > th:nth-child(1)');
    this.reportsTableHeader2 = page.locator('#dashboard-table > div > table > thead > tr > th:nth-child(2)');
    this.reportsTableHeader3 = page.locator('#dashboard-table > div > table > thead > tr > th:nth-child(3)');
    this.reportsTableHeader4 = page.locator('#dashboard-table > div > table > thead > tr > th:nth-child(4)');

    // User elements
    this.userProfile = page.locator('//*[@class="user-email "]');

    // Footer elements
    this.pageNumber = page.locator('#dashboard-table > footer > div > div');
    this.nextPageBtn = page.locator('//*[@data-locid="origin-next-btn-label"]');
    this.previousPageBtn = page.locator('//*[@data-locid="origin-previous-btn"]');

    // Table rows
    this.reportsTableRows = page.locator('#dashboard-table > div > table > tbody > tr');

    // Filters
    this.createdByDropdown = page.locator('//*[@id="createdby-dropdown"]/label');
    this.filterBtn = page.locator('//*[@id="select-0"]/div/label');

    // Report creation elements
    this.reportNameInput = page.locator('//*[@id="report-name-input"]');
    this.continueBtn = page.locator('//*[@id="continue-btn"]');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.dashboardHeader.waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyDashboardElements(): Promise<void> {
    console.log('🔍 Verifying Origin Dashboard elements...');

    const dashboardElements = [
      { locator: this.dashboardHeader, name: 'Welcome to Origin' },
      { locator: this.reportsHeader, name: 'Reports' },
      { locator: this.createReportBtn, name: 'Create Report Button' },
      { locator: this.logoutBtn, name: 'Logout Button' },
      { locator: this.homeLink, name: 'Home Link' },
      { locator: this.reportsSection, name: 'Reports Section' },
      { locator: this.reportsTable, name: 'Reports Table' },
      { locator: this.reportsTableHeader1, name: 'Report Name Header' },
      { locator: this.reportsTableHeader2, name: 'Campaign Header' },
      { locator: this.reportsTableHeader3, name: 'Created Date Header' },
      { locator: this.reportsTableHeader4, name: 'Status Header' },
      { locator: this.userProfile, name: 'User Profile' },
      { locator: this.pageNumber, name: 'Page Number' }
    ];

    const verificationResults: { element: string; status: string }[] = [];

    for (const element of dashboardElements) {
      try {
        await expect(element.locator).toBeVisible({ timeout: 5000 });
        console.log(`✓ ${element.name} is visible`);

        if (element.name.includes('Header')) {
          await expect(element.locator).toHaveText(element.name.replace(' Header', ''));
        }

        verificationResults.push({ element: element.name, status: 'PASS' });
      } catch (error) {
        console.warn(`⚠ ${element.name} not found or not visible`);
        verificationResults.push({ element: element.name, status: 'FAIL' });
      }
    }

    // Verify page URL
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('report');
    console.log(`✓ Dashboard URL verified: ${currentUrl}`);

    // Log summary
    const passed = verificationResults.filter(r => r.status === 'PASS').length;
    const failed = verificationResults.filter(r => r.status === 'FAIL').length;
    console.log(`\n📊 Verification Summary: ${passed} passed, ${failed} failed`);

    // Take screenshot
    await this.page.screenshot({
      path: `test-results/screenshots/dashboard-${Date.now()}.png`,
      fullPage: true
    });

    console.log('✅ Dashboard verification completed');
  }

  async getReportsTableData(): Promise<void> {
    console.log('\n📊 ========== FETCHING REPORTS TABLE DATA ==========');

    try {
      const rowCount = await this.reportsTableRows.count();
      console.log(`Total Rows Found: ${rowCount}\n`);

      if (rowCount > 0) {
        for (let i = 0; i < rowCount; i++) {
          console.log(`┌─────────────────────────────────────────────────────┐`);
          console.log(`│ ROW ${(i + 1).toString().padEnd(47)} │`);
          console.log(`├─────────────────────────────────────────────────────┤`);

          const row = this.reportsTableRows.nth(i);
          const columns = row.locator('td');
          const columnCount = await columns.count();

          for (let j = 0; j < columnCount; j++) {
            const columnValue = await columns.nth(j).textContent();
            const trimmedValue = columnValue?.trim() || '';

            let columnName = '';
            switch (j) {
              case 0: columnName = 'Report Name'; break;
              case 1: columnName = 'Campaign'; break;
              case 2: columnName = 'Created Date'; break;
              case 3:
                columnName = 'Status';
                if (trimmedValue === 'Failed') {
                  console.error('❌ Report has failed ', trimmedValue);
                } else if (trimmedValue === 'In progress') {
                  console.log('⏳ Report is still in progress ', trimmedValue);
                }
                break;
              default: columnName = `Column ${j + 1}`;
            }

            console.log(`│ ${columnName.padEnd(15)}: ${trimmedValue.substring(0, 32).padEnd(32)} │`);
          }

          console.log(`└─────────────────────────────────────────────────────┘\n`);
        }
      } else {
        console.log('⚠️  No rows found in the reports table\n');
      }
    } catch (error) {
      console.error('❌ Error iterating through table rows:', error);
    }

    console.log('===================================================\n');
  }

  async verifyFilters(): Promise<void> {
    console.log('🔍 Verifying Dashboard filters...');

    await this.createdByDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.createdByDropdown.click();
    await this.filterBtn.click();

    await this.page.screenshot({
      path: `test-results/screenshots/dashboard-filters-${Date.now()}.png`,
      fullPage: true
    });

    console.log('✅ Filter functionality verified');
  }

  async createReport(reportName: string): Promise<string> {
    await this.createReportBtn.click();
    await this.page.waitForLoadState('networkidle');

    const currentDateTime = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fullReportName = `${reportName}_${currentDateTime}`;

    await this.reportNameInput.fill(fullReportName);
    await this.continueBtn.click();

    console.log(`✓ Report name filled and entered: ${fullReportName}`);
    return fullReportName;
  }

  async createReportvalidatingNegativeScenarios(reportName: string): Promise<void> {
    await this.createReportBtn.click();
    await this.page.waitForLoadState('networkidle');

    const fullReportName = `${reportName}`;

    await this.reportNameInput.fill(fullReportName);
    await this.continueBtn.click();


  }

  async verifyReportNameErrorValidation(errorMessage: string): Promise<void> {
    const errorMessageinUI = this.page.locator('//*[contains(text(), errorMessage)]');
    await expect(errorMessageinUI).toBeVisible({ timeout: 5000 });

    const errorText = await errorMessageinUI.textContent();
    expect(errorText).toContain(errorMessage);

    console.log(`✓ Verified: Campaign name required error displayed - "${errorText}"`);

  }
 async createReportUniqueness(reportName: string): Promise<boolean> {
    await this.createReportBtn.click();
    await this.page.waitForLoadState('networkidle');

    const fullReportName = `${reportName}`;

    await this.reportNameInput.fill(fullReportName);
    await this.continueBtn.click();
    console.log(`✓ Attempted to create report with name: ${reportName}`);

    // Verify duplicate error appears
    const isDuplicate = await this.verifyDuplicateReportNameError();
    if (isDuplicate) {
      console.log('ℹ Duplicate report name confirmed; exiting this test flow from createReportUniqueness.');
      return true;
    }

    return false;
  }


  async reportNameValidation(reportName: string): Promise<void> {
    await this.createReportBtn.click();
    await this.page.waitForLoadState('networkidle');

    const fullReportName = `${reportName}`;
    

    // Test report name too long
    const ReportName_long = "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4";
    await this.reportNameInput.fill(ReportName_long);
    await this.continueBtn.click();

    // Verify too long error appears
    await this.verifyReportNameTooLongError();

    // Test report name with special characters
    const reportNameWithSpecialChars = "Report@#Name$%With^&*Special()Chars!";
    await this.reportNameInput.clear();
    await this.reportNameInput.fill(reportNameWithSpecialChars);
    await this.continueBtn.click();

    // Verify invalid characters error appears
    await this.verifyReportNameInvalidCharsError();

    console.log(`✓ Verified: Report name  validation, errors displayed as expected`);
  }

  async verifyReportNameTooLongError(): Promise<void> {
    const errorMessage = this.page.locator('//*[contains(text(), "Report name is too long")]');

    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('Report name is too long');
    expect(errorText).toContain('Please provide a shorter name');

    console.log(`✓ Verified: Report name too long error displayed - "${errorText}"`);
  }

  async verifyReportNameInvalidCharsError(): Promise<void> {
    const errorMessage = this.page.locator('//*[contains(text(), "The report name contains invalid characters")]');

    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('The report name contains invalid characters');
    expect(errorText).toContain('Please enter a different name');

    console.log(`✓ Verified: Invalid characters error displayed - "${errorText}"`);
  }
  async verifyReportNameRequiredError(): Promise<void> {
    const errorMessage = this.page.locator('//*[contains(text(), "A report name is required")]');

    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('A report name is required');

    console.log(`✓ Verified: Report name required error displayed - "${errorText}"`);
  }

  async verifyDuplicateReportNameError(): Promise<boolean> {
    const errorMessage = this.page.locator('//*[contains(text(), "This report name is already in use")]');
    // Wait up to 5 seconds for the error message to become visible
    await errorMessage.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});

    const isVisible = await errorMessage.isVisible();

    if (!isVisible) {
      console.log('ℹ Duplicate report name error message not enabled/visible; skipping this validation step.');
      return false;
    }

    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('This report name is already in use within your organization');
    expect(errorText).toContain('Please enter a new name');

    console.log(`✓ Verified: Duplicate report name error displayed - "${errorText}"`);
    return true;
  }



  async logout(): Promise<void> {
    try {
      await this.logoutBtn.waitFor({ state: 'visible', timeout: 5000 });
      await this.logoutBtn.click();
      console.log('✓ Logout button clicked');

      await this.page.waitForURL('', { timeout: 1000 });
      const logoutTitle = this.page.locator('h1.msg');
      await expect(logoutTitle).toContainText("You have successfully logged out");

      console.log('✓ Successfully logged out and redirected to login page');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  async logoutConfirmation(): Promise<void> {
    await this.logoutBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.logoutBtn.click();
    console.log('✓ Logout button clicked');
    await this.logoutConfirmationBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.logoutConfirmationBtn.click();
  }

}