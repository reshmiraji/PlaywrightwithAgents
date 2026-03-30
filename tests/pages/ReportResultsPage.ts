import { Page, Locator } from '@playwright/test';

export class ReportResultsPage {
  readonly page: Page;
  readonly reportTable: Locator;
  readonly downloadButton: Locator;
  readonly exportOptions: Locator;
  readonly backButton: Locator;
  readonly reportTitle: Locator;
  readonly reportSummary: Locator;
  readonly loadingIndicator: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.reportTable = page.locator('table, .report-table, [data-testid="report-table"]');
    this.downloadButton = page.locator('button:has-text("Download"), a:has-text("Download"), [data-testid="download"]');
    this.exportOptions = page.locator('select[name*="export"], [data-testid="export-format"]');
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [data-testid="back"]');
    this.reportTitle = page.locator('h1, h2, .report-title, [data-testid="report-title"]');
    this.reportSummary = page.locator('.summary, .report-summary, [data-testid="summary"]');
    this.loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
    this.errorMessage = page.locator('.error, .alert-danger, [role="alert"]');
  }

  async waitForReportGeneration() {
    // Wait for loading to disappear
    try {
      await this.loadingIndicator.waitFor({ state: 'visible', timeout: 5000 });
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 60000 });
    } catch {
      // Loading indicator might not be present
    }
    
    // Wait for either report table or error message
    await Promise.race([
      this.reportTable.waitFor({ state: 'visible', timeout: 30000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 30000 })
    ]);
  }

  async isReportGenerated() {
    return await this.reportTable.isVisible();
  }

  async hasError() {
    return await this.errorMessage.isVisible();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async downloadReport(format?: string) {
    if (format) {
      await this.exportOptions.selectOption({ label: format });
    }
    await this.downloadButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async getReportTitle() {
    return await this.reportTitle.textContent();
  }

  async getReportData() {
    const rows = await this.reportTable.locator('tr').count();
    const headers = await this.reportTable.locator('th').allTextContents();
    return { rows, headers };
  }
}