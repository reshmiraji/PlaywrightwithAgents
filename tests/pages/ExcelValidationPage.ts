// tests/pages/ExcelValidationPage.ts
import { Page, APIRequestContext } from '@playwright/test';
import { BasePage } from './BasePage';
import { getExcelFileNames, readSummarySheetData, readColumnValues, getSummaryColumnHeaders, getSummaryPageContent, getNetCampaignDeliveryHeaders, getNetCampaignDeliveryData, getNetCampaignDeliverySummaryData, getNetCampaignDeliveryTitle, getTotalCampaignSheetInfo, getTotalCampaignData, getTotalCampaignPageContent, getTotalCampaignRowsText, getAllWorksheetNames, getWorksheetInfoByNameSubstring, getWorksheetHeadersByNameSubstring, getWorksheetRowDataByNameSubstring } from '../utils/excelFunctions';
import { getRequest } from '../utils/requestBuilder';
import { readResponseJson } from '../utils/testUtils';
import loadJsonPayload from '../utils/loadJsonPayload';

export interface ReportDetails {
  reportId: string;
  haloReportId: string;
  reportName: string;
  campaignGroupId: string;
  campaignGroupName: string;
  createdAt: string;
  reportStatus: string;
  measurementConsumer: string;
  edpId: string;
}

export interface CampaignDisplayName {
  dataProvider: string;
  mediaType: string;
  displayName: string;
  brand: string;
  campaignStartDate: string;
  campaignEndDate: string;
  channel: string;
  eventGroupName: string;
}

export class ExcelValidationPage extends BasePage {
  private summarySheetData: any = null;
  private excelFilePath: string = '';
  private reportDetails: ReportDetails | null = null;
  private campaignResponseJson: any = null;
  private basicReportJson: any = null;
  private finalReportJson: any = null;

  constructor(page: Page) {
    super(page);
  }

  /**
   * Load Excel file and read summary sheet data
   */
  async loadExcelSummaryData(excelFilePath: string): Promise<any> {
    this.excelFilePath = excelFilePath;
    this.summarySheetData = await readSummarySheetData(excelFilePath);
    console.log('\n📊 Summary Sheet Data Loaded:', this.summarySheetData);
    return this.summarySheetData;
  }

  /**
   * Load JSON payload from basic report output bucket
   */
  async loadBasicReportJson(jsonFilePath: string): Promise<any> {
    const fs = require('fs');
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`File not found: ${jsonFilePath}`);
    }
    this.basicReportJson = loadJsonPayload(jsonFilePath);
    return this.basicReportJson;
  }

  /**
   * Load JSON payload from final report output bucket
   */
  async loadFinalReportJson(jsonFilePath: string): Promise<any> {
    const fs = require('fs');
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`File not found: ${jsonFilePath}`);
    }
    this.finalReportJson = loadJsonPayload(jsonFilePath);
    return this.finalReportJson;
  }

  /**
   * Get Excel file names from directory
   */
  async getExcelFiles(resourcesPath: string): Promise<string[]> {
    const excelFiles = await getExcelFileNames(resourcesPath);
    console.log('\n📊 Excel Files Retrieved:', excelFiles);
    return excelFiles;
  }

  /**
   * Fetch reports from API by page number
   */
  async fetchReportsByPage(
    request: APIRequestContext,
    baseUri: string,
    endpoint: string,
    totalPages: number
  ): Promise<any[]> {
    const reportList: any[] = [];
    
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const response = await getRequest(request, baseUri, endpoint, { pageNumber });
      const responseBody = await readResponseJson(response);
      reportList.push(responseBody.reportList || []);
    }
    
    console.log(`\n📊 Total Reports: ${reportList.length} reports across ${totalPages} pages.`);
    return reportList;
  }

  /**
   * Find matching report by Excel file name
   */
  findMatchingReport(reportList: any[], excelFileName: string): ReportDetails | null {
    for (const reports of reportList) {
      for (const report of reports) {
        if (report.reportName === excelFileName) {
          const fullHaloReportId = report.haloReportId;
          const haloReportId = fullHaloReportId.includes('reports/')
            ? fullHaloReportId.split('reports/')[1]
            : fullHaloReportId;

          this.reportDetails = {
            reportId: report.reportId,
            haloReportId: haloReportId,
            reportName: report.reportName,
            campaignGroupId: report.campaignGroupId,
            campaignGroupName: report.campaignGroupName,
            createdAt: report.createdAt,
            reportStatus: report.reportStatus,
            measurementConsumer: report.measurementConsumer,
            edpId: report.edpId
          };

          console.log(`\n📋 Extracted Report Details:`);
          console.log(`   Campaign Group ID: ${this.reportDetails.campaignGroupId}`);
          console.log(`   Campaign Group Name: ${this.reportDetails.campaignGroupName}`);
          console.log(`   Halo Report ID: ${this.reportDetails.haloReportId}`);
          
          return this.reportDetails;
        }
      }
    }
    return null;
  }

  /**
   * Fetch campaign details by campaign group ID
   */
  async fetchCampaignDetails(
    request: APIRequestContext,
    baseUri: string,
    endpoint: string,
    campaignGroupId: string
  ): Promise<any> {
    const response = await getRequest(request, baseUri, endpoint, {}, { campaignGroupId });
    this.campaignResponseJson = await readResponseJson(response);
    console.log('\n📊 Campaign Group Details from API:', this.campaignResponseJson.campaignGroup.campaignGroupName);
    return this.campaignResponseJson;
  }

  /**
   * Extract all display names from campaign response
   */
  extractDisplayNames(): CampaignDisplayName[] {
    if (!this.campaignResponseJson) {
      throw new Error('Campaign response not loaded. Call fetchCampaignDetails first.');
    }

    const allDisplayNames: CampaignDisplayName[] = [];
    const eventGroupDataByEdp = this.campaignResponseJson.campaignGroup.eventGroupDataByEdp;

    Object.keys(eventGroupDataByEdp).forEach(edpKey => {
      const edpData = eventGroupDataByEdp[edpKey];
      ['DISPLAY', 'VIDEO', 'OTHER'].forEach(mediaType => {
        const eventGroups = edpData.eventGroupsByMedia[mediaType] || [];
        eventGroups.forEach((eventGroup: any) => {
          if (eventGroup.metadata && eventGroup.metadata.displayName) {
            allDisplayNames.push({
              dataProvider: edpKey,
              mediaType: mediaType,
              displayName: eventGroup.metadata.displayName,
              brand: eventGroup.metadata.brand,
              campaignStartDate: eventGroup.metadata.campaignStartDate,
              campaignEndDate: eventGroup.metadata.campaignEndDate,
              channel: eventGroup.channel,
              eventGroupName: eventGroup.eventGroupName
            });
          }
        });
      });
    });

    console.log(`\n📋 All Display Names (${allDisplayNames.length} total):`, 
                allDisplayNames.map(item => item.displayName));
    return allDisplayNames;
  }

  /**
   * Get value from summary sheet by key pattern
   */
  getSummaryValue(keyPattern: string): any {
    if (!this.summarySheetData) {
      throw new Error('Summary sheet data not loaded. Call loadExcelSummaryData first.');
    }

    for (const [key, value] of Object.entries(this.summarySheetData)) {
      if (key.toLowerCase().includes(keyPattern.toLowerCase())) {
        console.log(`\n📋 Found "${key}": ${value}`);
        return value;
      }
    }
    return null;
  }

  /**
   * Get Halo Report ID from Excel summary
   */
  getHaloReportIdFromExcel(): string {
    const reportId = this.getSummaryValue('report id');
    return reportId ? String(reportId).replace(/.*\/reports\//, '') : '';
  }

  /**
   * Get Report Name from Excel summary
   */
  getReportNameFromExcel(): string {
    return this.getSummaryValue('report name') || '';
  }

  /**
   * Get Campaign Names from Excel summary
   */
  getCampaignNamesFromExcel(): string[] {
    const campaignNames = this.getSummaryValue('campaigns included');
    if (!campaignNames) return [];
    
    return String(campaignNames)
      .split(/\r?\n/)
      .filter(name => name.trim())
      .map(name => name.trim().replace(/[,\n]/g, ''));
  }

  /**
   * Get Demographics from Excel summary
   */
  getDemographicsFromExcel(): string {
    let demographics = this.getSummaryValue('demographic*');
    if (demographics === 'All Adults (16+);') {
      demographics = 'Female, 16-34; Female, 35-54; Female, 55+; Male, 16-34; Male, 35-54; Male, 55+; ';
    }
    return demographics || '';
  }

  /**
   * Get Media Type from Excel summary (single value from first row)
   */
  getMediaTypeFromExcel(): string {
    return this.getSummaryValue('media type') || '';
  }

  /**
   * Get all Media Types from Excel summary column
   */
  async getAllMediaTypesFromExcel(): Promise<string[]> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await readColumnValues(this.excelFilePath, 'media type');
  }

  /**
   * Get all column headers from Excel Summary sheet
   */
  async getColumnHeaders(): Promise<string[]> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getSummaryColumnHeaders(this.excelFilePath);
  }

  /**
   * Get Summary Page content (all text content from Summary sheet)
   */
  async getSummaryPageContent(): Promise<string> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getSummaryPageContent(this.excelFilePath);
  }

  /**
   * Get column headers from Net Campaign Delivery - Reach & Frequency sheet
   */
  async getNetCampaignDeliveryHeaders(): Promise<string[]> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getNetCampaignDeliveryHeaders(this.excelFilePath);
  }

  /**
   * Get all data from Net Campaign Delivery - Reach & Frequency sheet
   */
  async getNetCampaignDeliveryData(): Promise<any[]> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getNetCampaignDeliveryData(this.excelFilePath);
  }

  /**
   * Get Net Campaign Delivery sheet title (first row, first cell)
   */
  async getNetCampaignDeliveryTitle(): Promise<string> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getNetCampaignDeliveryTitle(this.excelFilePath);
  }

  /**
   * Get Net Campaign Delivery data from Summary sheet
   */
  async getNetCampaignDeliverySummaryData(): Promise<any> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getNetCampaignDeliverySummaryData(this.excelFilePath);
  }

  /**
   * Get basic structural info for the Total Campaign sheet
   */
  async getTotalCampaignSheetInfo(): Promise<{ rowCount: number; columnCount: number; nonEmptyCellCount: number }> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getTotalCampaignSheetInfo(this.excelFilePath);
  }

  /**
   * Get all data rows from the Total Campaign sheet as key/value pairs
   */
  async getTotalCampaignData(): Promise<any[]> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getTotalCampaignData(this.excelFilePath);
  }

  /**
   * Get all text content from the Total Campaign sheet
   */
  async getTotalCampaignPageContent(): Promise<string> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getTotalCampaignPageContent(this.excelFilePath);
  }

  /**
   * Get text content for specific rows from the Total Campaign sheet
   */
  async getTotalCampaignRowsText(rowNumbers: number[]): Promise<string[]> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getTotalCampaignRowsText(this.excelFilePath, rowNumbers);
  }

  /**
   * Get all worksheet names from the current Excel file
   */
  async getAllWorksheetNames(): Promise<string[]> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getAllWorksheetNames(this.excelFilePath);
  }

  /**
   * Get basic info for a worksheet whose name contains the given text
   */
  async getWorksheetInfoByNameSubstring(nameSubstring: string): Promise<{ sheetName: string | null; rowCount: number; columnCount: number; nonEmptyCellCount: number }> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getWorksheetInfoByNameSubstring(this.excelFilePath, nameSubstring);
  }

  /**
   * Get header row for a worksheet whose name contains the given text
   */
  async getWorksheetHeadersByNameSubstring(nameSubstring: string): Promise<string[]> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getWorksheetHeadersByNameSubstring(this.excelFilePath, nameSubstring);
  }

  /**
   * Get a single data row from a worksheet whose name contains the given text
   */
  async getWorksheetRowDataByNameSubstring(nameSubstring: string, headerRowIndex: number = 1, dataRowIndex: number = 2): Promise<Record<string, any> | null> {
    if (!this.excelFilePath) {
      throw new Error('Excel file path not set. Call loadExcelSummaryData first.');
    }
    return await getWorksheetRowDataByNameSubstring(this.excelFilePath, nameSubstring, headerRowIndex, dataRowIndex);
  }

  /**
   * Get Net Campaign Delivery data from Final Report JSON
   */
  getNetCampaignDeliveryFromFinalJson(): any {
    if (!this.finalReportJson) {
      return null;
    }
    
    const netCampaignDelivery = this.finalReportJson?.summaryPage?.netCampaignDelivery;
    if (!netCampaignDelivery) {
      return null;
    }
    
    return {
      measuredEntity: netCampaignDelivery.measuredEntity || '',
      mediaType: netCampaignDelivery.mediaType || '',
      impressionFilter: netCampaignDelivery.impressionFilter || '',
      totalNetCampaignReach: netCampaignDelivery.totalNetCampaignReach || '',
      totalNetCampaignReachPercent: netCampaignDelivery.totalNetCampaignReachPercent || '',
      averageFrequency: netCampaignDelivery.averageFrequency || ''
    };
  }

  /**
   * Get Universe Size from Excel summary
   */
  getUniverseSizeFromExcel(): any {
    return this.getSummaryValue('universe size');
  }

  /**
   * Get external basic report ID from basic JSON
   */
  getExternalBasicReportId(): string {
    return this.basicReportJson?.externalBasicReportId || '';
  }

  /**
   * Get report name from basic JSON output bucket
   */
  getReportNameFromBasicJson(): string {
    return this.basicReportJson?.details?.title || '';
  }

  /**
   * Get campaign group display name from basic JSON
   */
  getCampaignGroupDisplayNameFromBasicJson(): string {
    return this.basicReportJson?.campaignGroupDisplayName || '';
  }

  /**
   * Get report name from final report JSON
   */
  getReportNameFromFinalJson(): string {
    return this.finalReportJson?.originalReportName || '';
  }

  /**
   * Get demographics from final report JSON
   */
  getDemographicsFromFinalJson(): string {
    return this.finalReportJson?.summaryPage?.summaryRow?.demographic || '';
  }

  /**
   * Get campaigns from final report JSON
   */
  getCampaignsFromFinalJson(): string {
    return this.finalReportJson?.summaryPage?.summaryRow?.campaign || '';
  }

  /**
   * Get Halo ID from final report JSON
   */
  getHaloIdFromFinalJson(): string {
    return this.finalReportJson?.haloReportId || '';
  }

  /**
   * Get media type from final report JSON (single value - first media type)
   */
  getMediaTypeFromFinalJson(): string {
    const mediaFilters = this.finalReportJson?.summaryPage?.summaryRow?.mediaFilters || [];
    return mediaFilters[0]?.mediaType || '';
  }

  /**
   * Get all media types from final report JSON mediaFilters array
   */
  getAllMediaTypesFromFinalJson(): string[] {
    const mediaFilters = this.finalReportJson?.summaryPage?.summaryRow?.mediaFilters || [];
    return mediaFilters.map((filter: any) => filter.mediaType).filter((type: string) => type);
  }

  

  /**
   * Get universe size from final report JSON
   */
  getUniverseSizeFromFinalJson(): any {
    return this.finalReportJson?.summaryPage?.summaryRow?.universeSize;
  }

  /**
   * Verify campaign names match between Excel and API
   */
  verifyCampaignNamesMatch(excelCampaignNames: string[], apiDisplayNames: CampaignDisplayName[]): boolean {
    const displayNamesList = apiDisplayNames.map(item => item.displayName);
    
    excelCampaignNames.forEach((excelName, index) => {
      const isFound = displayNamesList.includes(excelName);
      console.log(`\n🔍 Checking campaign #${index + 1}: "${excelName}"`);
      console.log(`   Found in API: ${isFound ? '✅ YES' : '❌ NO'}`);
      
      const matchedItem = apiDisplayNames.find(item => item.displayName === excelName);
      if (matchedItem) {
        console.log(`\n✅ Found matching campaign #${index + 1}:`);
        console.log(`   Display Name: ${matchedItem.displayName}`);
        console.log(`   Media Type: ${matchedItem.mediaType}`);
        console.log(`   Brand: ${matchedItem.brand}`);
        console.log(`   Data Provider: ${matchedItem.dataProvider}`);
      } else {
        console.log(`\n⚠️ No match found for: "${excelName}"`);
        console.log(`   Available display names: ${displayNamesList.join(', ')}`);
      }
    });
    
    return excelCampaignNames.every(name => displayNamesList.includes(name));
  }

  /**
   * Print detailed display names information
   */
  printDisplayNamesDetails(displayNames: CampaignDisplayName[]): void {
    console.log(`\n📋 Details of all Display Names:`);
    displayNames.forEach((item, index) => {
      console.log(`\n   ${index + 1}. Display Name: "${item.displayName}"`);
      console.log(`      - Media Type: ${item.mediaType}`);
      console.log(`      - Brand: ${item.brand}`);
      console.log(`      - Data Provider: ${item.dataProvider}`);
      console.log(`      - Campaign Period: ${item.campaignStartDate} to ${item.campaignEndDate}`);
      console.log(`      - Channel: ${item.channel}`);
    });
  }

  /**
   * Get current report details
   */
  getReportDetails(): ReportDetails | null {
    return this.reportDetails;
  }

  /**
   * Get campaign response JSON
   */
  getCampaignResponseJson(): any {
    return this.campaignResponseJson;
  }

  /**
   * Get summary sheet data
   */
  getSummarySheetData(): any {
    return this.summarySheetData;
  }
}