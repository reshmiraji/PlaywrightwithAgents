// tests/pages/PageFactory.ts
import { Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';
import { CampaignPage } from './CampaignPage';
import { ReportConfigurationPage } from './ReportConfigurationPage';
import { ReportResultsPage } from './ReportResultsPage';
import { ExcelValidationPage } from './ExcelValidationPage';


/**
 * PageFactory - Singleton factory for creating page objects
 * Implements the Factory pattern for centralized page object creation
 */
export class PageFactory {
  private static instance: PageFactory;
  private pageCache: Map<string, any> = new Map();

  private constructor() {}

  /**
   * Get singleton instance of PageFactory
   */
  static getInstance(): PageFactory {
    if (!PageFactory.instance) {
      PageFactory.instance = new PageFactory();
    }
    return PageFactory.instance;
  }

  /**
   * Create or retrieve LoginPage instance
   */
  getLoginPage(page: Page): LoginPage {
    const key = `LoginPage_${page}`;
    if (!this.pageCache.has(key)) {
      this.pageCache.set(key, new LoginPage(page));
    }
    return this.pageCache.get(key);
  }

  /**
   * Create or retrieve DashboardPage instance
   */
  getDashboardPage(page: Page): DashboardPage {
    const key = `DashboardPage_${page}`;
    if (!this.pageCache.has(key)) {
      this.pageCache.set(key, new DashboardPage(page));
    }
    return this.pageCache.get(key);
  }

  /**
   * Create or retrieve CampaignPage instance
   */
  getCampaignPage(page: Page): CampaignPage {
    const key = `CampaignPage_${page}`;
    if (!this.pageCache.has(key)) {
      this.pageCache.set(key, new CampaignPage(page));
    }
    return this.pageCache.get(key);
  }

  /**
   * Create or retrieve ReportConfigurationPage instance
   */
  getReportConfigurationPage(page: Page): ReportConfigurationPage {
    const key = `ReportConfigurationPage_${page}`;
    if (!this.pageCache.has(key)) {
      this.pageCache.set(key, new ReportConfigurationPage(page));
    }
    return this.pageCache.get(key);
  }

  /**
   * Create or retrieve ReportResultsPage instance
   */
  getReportResultsPage(page: Page): ReportResultsPage {
    const key = `ReportResultsPage_${page}`;
    if (!this.pageCache.has(key)) {
      this.pageCache.set(key, new ReportResultsPage(page));
    }
    return this.pageCache.get(key);
  }

  /**
   * Create or retrieve ExcelValidationPage instance
   */
  getExcelValidationPage(page: Page): ExcelValidationPage {
    const cacheKey = 'ExcelValidationPage';
    if (!this.pageCache.has(cacheKey)) {
      this.pageCache.set(cacheKey, new ExcelValidationPage(page));
    }
    return this.pageCache.get(cacheKey) as ExcelValidationPage;
  }

  /**
   * Clear page cache
   */
  clearCache(): void {
    this.pageCache.clear();
  }

  /**
   * Create all page objects at once
   */
  getAllPages(page: Page): {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    campaignPage: CampaignPage;
    reportConfigPage: ReportConfigurationPage;
    reportResultsPage: ReportResultsPage;
    excelValidationPage: ExcelValidationPage;
  } {
    return {
      loginPage: this.getLoginPage(page),
      dashboardPage: this.getDashboardPage(page),
      campaignPage: this.getCampaignPage(page),
      reportConfigPage: this.getReportConfigurationPage(page),
      reportResultsPage: this.getReportResultsPage(page),
      excelValidationPage: this.getExcelValidationPage(page)
    };
  }
}