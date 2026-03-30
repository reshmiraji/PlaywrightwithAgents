import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CampaignPage } from '../pages/CampaignPage';
import { ReportConfigurationPage } from '../pages/ReportConfigurationPage';
import * as fs from 'fs';
import * as path from 'path';

export class SmokeTestSuite {
  private loginPage: LoginPage;
  private dashboardPage: DashboardPage;
  private campaignPage: CampaignPage;
  private reportConfigPage: ReportConfigurationPage;

  constructor(private page: Page) {
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
    this.campaignPage = new CampaignPage(page);
    this.reportConfigPage = new ReportConfigurationPage(page);
  }

  // ==================== LOGIN METHODS ====================

  async login(page: Page): Promise<void> {
    await this.loginPage.goto();

    const envPropsPath = path.resolve(__dirname, '../../environment.properties');
    let environment = process.env.TEST_ENV || 'UAT';

    if (fs.existsSync(envPropsPath)) {
      const envContent = fs.readFileSync(envPropsPath, 'utf-8');
      const envConfig: { [key: string]: string } = {};
      envContent.split('\n').forEach(line => {
        if (line.trim().startsWith('#') || !line.trim()) return;
        const [key, value] = line.split('=');
        if (key && value) envConfig[key.trim()] = value.trim();
      });
      environment = process.env.TEST_ENV || envConfig['DEFAULT_ENV'] || 'TST';
    }

    console.log(`🔐 Loading credentials for ${environment} environment`);

    const credFileName = `credential_${environment}.properties`;
    const credPath = path.resolve(__dirname, '../../', credFileName);

    if (!fs.existsSync(credPath)) {
      throw new Error(`❌ Credential file not found: ${credFileName}`);
    }

    const credContent = fs.readFileSync(credPath, 'utf-8');
    const creds: { [key: string]: string } = {};
    credContent.split('\n').forEach(line => {
      if (line.trim().startsWith('#') || !line.trim()) return;
      const [key, value] = line.split('=');
      if (key && value) creds[key.trim()] = value.trim();
    });

    const username = Buffer.from(creds['username'], 'base64').toString('utf-8');
    const password = Buffer.from(creds['password'], 'base64').toString('utf-8');

    console.log(`✓ Logging in with user: ${username.substring(0, 3)}***@${username.split('@')[1]}`);

    await this.loginPage.login(username, password);
    await this.loginPage.acceptCookiesAndTerms();
  }

  async logout(page: Page): Promise<void> {
    await this.dashboardPage.logout();
  }

    async logoutConfirmation(page: Page): Promise<void> {
    await this.dashboardPage.logoutConfirmation();
  }

  // ==================== DASHBOARD METHODS ====================

  async verifyDashboardOrigin(page: Page): Promise<void> {
    await this.dashboardPage.verifyDashboardElements();
    await this.dashboardPage.getReportsTableData();
  }

  async verifyDashboardfilters(page: Page): Promise<void> {
    await this.dashboardPage.verifyFilters();
  }

  async createReport(page: Page, reportName: string): Promise<string> {
    return await this.dashboardPage.createReport(reportName);
  }

  async createReportvalidatingNegativeScenarios(page: Page, reportName: string) {
    await this.dashboardPage.createReportvalidatingNegativeScenarios(reportName);
  }

  async createReportUniqueness(page: Page, reportName: string): Promise<boolean> {
    const isDuplicate = await this.dashboardPage.createReportUniqueness(reportName);
    return isDuplicate;
  }

  // ==================== CAMPAIGN METHODS ====================

  async createCampaignGroup(page: Page, campaignPrefix: string): Promise<string> {
    const campaignGroupName = await this.campaignPage.createCampaignGroup(campaignPrefix);
    return campaignGroupName;
   
  }



  async createCampaignGroupForNameValidation(page: Page, campaignPrefix: string): Promise<string> {
    return await this.campaignPage.createCampaignGroupForNameValidation(campaignPrefix);
  }
  async selectSingleMediaType(page: Page, mediaType: string): Promise<void> {
   // await this.campaignPage.verifyMediaTypeNotPreselected(mediaType);
    await this.campaignPage.selectSingleMediaType(mediaType);
  }


  async selectbyAdvertOrBrand(page: Page, advert: string, brand: string): Promise<void> {
    await this.campaignPage.selectCampaignUsingAdvertOrBrand(advert, brand);
  }

  async searchForTitle(page: Page, advert: string): Promise<void> {
    await this.campaignPage.checkTheTitle(advert);
  }


  async selectMeasuredEntity(page: Page, measuredEntity: string): Promise<void> {
    await this.campaignPage.selectMeasuredEntity(measuredEntity);
  }

    async selectMultipleMeasuredEntity(page: Page, measuredEntity: string): Promise<void> {
    await this.campaignPage.selectMultipleMeasuredEntity(measuredEntity);
  }

  async selectFirstRowFromList(page: Page) {
    return await this.campaignPage.selectFirstRowFromList();
  }

    async validateCampaignTableSearchResults(page: Page) {
    return await this.campaignPage.validateCampaignTableSearchResults();
  }

    async validateCampaignTableSearchResultsforAquila(page: Page) {
    return await this.campaignPage.validateCampaignTableSearchResultsforAquila();
  }
     async validateCampaignTableSearchResultsAquila(page: Page) {
    return await this.campaignPage.validateCampaignTableSearchResultsforAquila();
  }
  async validateCampaignTableSelectAdverts(page: Page) {
    return await this.campaignPage.validateCampaignTableSelectAdverts();
  }

 async validateCampaignTableSelectAdvertsAquila(page: Page) {
    return await this.campaignPage.validateCampaignTableSelectAdvertsforAquila();
  }
  
  verifyCampaignNameRequiredErrorMessage(page: Page, errorMessage: string) {
    return this.campaignPage.verifyCampaignNameRequiredError(errorMessage);
  } 


    verifyReportNameRequiredErrorMessage(page: Page, errorMessage: string) {
    return this.campaignPage.verifyReportNameErrorValidation(errorMessage);
  } 

  
  async selectfirstcolumnAndDeselect(page: Page) {
    return await this.campaignPage.selectfirstcolumnAndDeselect();
  }

  

   async validateCampaignsOnTable(page: Page) {
    return await this.campaignPage.validateTableOfCampaigns();
  }


  async submitSelectedCampaign(page: Page): Promise<void> {
    await this.campaignPage.submitSelectedCampaign();
  }

   

  
  // ==================== REPORT CONFIGURATION METHODS ====================

  async selectFilters(page: Page, filterParameter: string): Promise<void> {
    await this.reportConfigPage.selectFilters(filterParameter);
  }
  async selectFiltersForCumulative(page: Page, filterParameter: string): Promise<void> {
    await this.reportConfigPage.selectFiltersForCumulative(filterParameter);
  }

  
  async selectDemographics(page: Page): Promise<void> {
    await this.reportConfigPage.selectDemographics();
  }

  async selectDemographicsAquila(page: Page): Promise<void> {
    await this.reportConfigPage.selectDemographicsAquila();
  }


  async selectMeasuredImpression(page: Page, mediaType: string, mrsValue: string): Promise<void> {
    await this.reportConfigPage.selectMeasuredImpression(mediaType, mrsValue);
  }

  async selectReportMetrics(page: Page): Promise<void> {
    await this.reportConfigPage.selectReportMetrics();
  }
 async selectReportMetricsCrossMedia(page: Page): Promise<void> {
    await this.reportConfigPage.selectReportMetricsCrossMedia();
  }
  
  async validateReportMetrics(page: Page): Promise<void> {
    await this.reportConfigPage.validateReportMetrics();
  }

  async reviewAndSubmitReport(page: Page): Promise<void> {
    await this.reportConfigPage.reviewAndSubmitReport();
  }
  async validateReviewAndSubmitReportPage(page: Page): Promise<void> {
    await this.reportConfigPage.validateReviewAndSubmitReport();
  }

    async validateAuditBanner(page: Page): Promise<void> {
    await this.reportConfigPage.validateAuditBanner();
  }
}