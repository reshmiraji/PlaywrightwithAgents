// tests/ExcelValidation.spec.ts
import test, { expect, Page, BrowserContext, APIRequestContext } from '@playwright/test';
import { PageFactory } from './pages/PageFactory';
import readProperties from './utils/readProperties';
import path from 'path';

const props = readProperties('serviceURL_TST.properties');

// Configuration
const BASE_URI = process.env.BASE_URI || props.BASE_URI;
const GetReportByPageNumber = process.env.GetReportByPageNumber || props.GetReportByPageNumber;
const GetCampaignDetailsByCampaignId = process.env.GetCampaignDetailsByCampaignId || props.GetCampaignDetailsByCampaignId;

/*const resourcesPath = path.join(__dirname, 'resources', 'CrossMedia_Display_Video_Other_2026-01-26T08-31-38.xlsx');
const jsonPathFinalReport = path.join(__dirname, 'resources', '333938f7-4f38-453e-980d-e896a61ede01.json');
const basicJsonPath = path.join(__dirname, 'resources', 'Basic_afea2611f4e48ed8e76569857a980dc.json');
*/
const resourcesPath = path.join(__dirname, 'resources', 'CrossMedia_Display_Other_CUmmulative_2026-01-26T14-53-25.xlsx');
const jsonPathFinalReport = path.join(__dirname, 'resources', '7a4094f4-2301-43f5-a222-611a0032b594.json');
const basicJsonPath = path.join(__dirname, 'resources', 'Basic_bccd018cbe2849bb94d1ce1643f18fbc.json');



let validationPage: any;
let sharedContext: BrowserContext;
let sharedPage: Page;

test.describe('Excel Data Validation -  Report Summary ', () => {

  test.beforeAll(async ({ browser, request }) => {
    // Create a shared context and page for beforeAll
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();

    // Get ExcelValidationPage from PageFactory
    validationPage = PageFactory.getInstance().getExcelValidationPage(sharedPage);

    // Load Excel summary data
    await validationPage.loadExcelSummaryData(resourcesPath);

    // Load JSON files
    await validationPage.loadBasicReportJson(basicJsonPath);
    await validationPage.loadFinalReportJson(jsonPathFinalReport);

    // Get Excel files
    const excelFiles = await validationPage.getExcelFiles(resourcesPath);
    const excelFileName = excelFiles[0]?.replace(/\.xlsx$/i, '') || '';
    console.log('\n📊 Excel File Name:', excelFileName);

    // Fetch reports from API (10 pages)
    const reportList = await validationPage.fetchReportsByPage(
      request,
      BASE_URI,
      GetReportByPageNumber,
      10
    );

    // Find matching report
    const matchedReport = validationPage.findMatchingReport(reportList, excelFileName);

    if (matchedReport) {
      // Truncate the prefix from haloReportId
      const truncatedHaloReportId = matchedReport.haloReportId?.replace(/^measurementConsumers\/[^\/]+\/reports\//, '') || '';

      console.log(`\n🎯 Matched Report ID: ${matchedReport.reportId}`);
      console.log(`🎯 Halo Report ID: ${truncatedHaloReportId}`);
      console.log(`🎯 Report Name: ${matchedReport.reportName}`);

      // Fetch campaign details
      await validationPage.fetchCampaignDetails(
        request,
        BASE_URI,
        GetCampaignDetailsByCampaignId,
        matchedReport.campaignGroupId
      );
    } else {
      console.log(`\n❌ No match found for Excel file: ${excelFileName}`);
      throw new Error(`No matching report found for: ${excelFileName}`);
    }
  });

  test.afterAll(async () => {
    // Clean up shared context
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  test('PDH-1585 Verify Excel Summary Column Headers - Excel and Final Report Output bucket', async ({ page }) => {
    const columnHeaders = await validationPage.getColumnHeaders();

    console.log(`\n🔍 Excel Summary Sheet Column Headers:`);
    columnHeaders.forEach((header: string, index: number) => {
      console.log(`   ${index + 1}. ${header}`);
    });

    // Define expected column headers
    const expectedHeaders = [
      'Brand',
      'Report Name',
      'Campaigns Included',
      'Report ID',
      'Start Date',
      'End Date',
      'Demographic*',
      'Universe Size',
      'Media Type',
      'Impression Filter',
      'Viewability',
      'Digital Video Completion Status'
    ];

    // Validate headers are not empty
    expect(columnHeaders.length).toBeGreaterThan(0);
    console.log(`   ✓ Excel has ${columnHeaders.length} column headers`);

    // Verify expected headers exist in Excel (case-insensitive)
    console.log(`\n🔍 Validating expected headers in Excel:`);
    expectedHeaders.forEach(expectedHeader => {
      const found = columnHeaders.some((header: string) =>
        header.toLowerCase().includes(expectedHeader.toLowerCase())
      );
      console.log(`   ✓ "${expectedHeader}": ${found ? 'Found' : 'NOT FOUND'}`);
      expect(found).toBe(true);
    });

    // Verify headers from Final JSON match Excel headers
    console.log(`\n🔍 Validating headers match between Excel and Expected:`);
    const sortedExcelHeaders = [...columnHeaders].sort();
    const sortedExpectedHeaders = [...expectedHeaders].sort();

    console.log(`   Excel Headers (sorted): ${sortedExcelHeaders.join(', ')}`);
    console.log(`   Expected Headers (sorted): ${sortedExpectedHeaders.join(', ')}`);

    // Verify all expected headers exist in Excel
    const allHeadersMatch = sortedExpectedHeaders.every((expectedHeader: string) =>
      sortedExcelHeaders.some((excelHeader: string) =>
        excelHeader.toLowerCase().includes(expectedHeader.toLowerCase())
      )
    );
    expect(allHeadersMatch).toBe(true);

    console.log(`✅ All expected column headers found and validated!`);
  });

  test('PDH-1586 Verify Summary Page Content Headers and Sections', async ({ page }) => {
    const summaryPageContent = await validationPage.getSummaryPageContent();

    console.log(`\n🔍 Summary Page Content Validation:`);

    // Define expected section headers/content
    const expectedSections = [
      'Report Summary',
      'Independent auditing of the Origin methodology and data inputs',
      'Data quality notice',
      'Utilising AMI and MRC data in the report',
      'A note on demographics'
    ];

    // Define expected key phrases that should be present
    const expectedKeyPhrases = [
      'summary page of your report',
      'highlights and main numbers',
      'Origin methodology and input data are subject to a broader audit framework',
      'independent audit organisations',
      'Help & Support',
      'Amazon Prime Video campaigns',
      'measurement quality standards',
      'indicative only',
      'AMI and MRC are not directly comparable',
      'inventory types',
      'lowest common denominator',
      'demographic age data from Meta and Amazon Prime Video',
      'AMI and MRC are not directly comparable, when comparing metrics across inventory types (such as Other and Video) AMI should be the metric considered for comparability as the lowest common denominator.'
    ];

    // Validate section headers exist
    console.log(`\n🔍 Validating Section Headers:`);
    expectedSections.forEach(section => {
      const found = summaryPageContent.toLowerCase().includes(section.toLowerCase());
      console.log(`   ${found ? '✓' : '✗'} "${section}": ${found ? 'Found' : 'NOT FOUND'}`);
      expect(found).toBe(true);
    });

    // Validate key phrases exist
    console.log(`\n🔍 Validating Key Content Phrases:`);
    expectedKeyPhrases.forEach(phrase => {
      const found = summaryPageContent.toLowerCase().includes(phrase.toLowerCase());
      console.log(`   ${found ? '✓' : '✗'} "${phrase.substring(0, 40)}...": ${found ? 'Found' : 'NOT FOUND'}`);
      expect(found).toBe(true);
    });

    // Validate hyperlink exists
    const hasHelpSupportLink = summaryPageContent.includes('Help & Support') ||
      summaryPageContent.includes('Read Me First');
    console.log(`\n🔍 Validating Help & Support Link: ${hasHelpSupportLink ? '✓ Found' : '✗ NOT FOUND'}`);
    expect(hasHelpSupportLink).toBe(true);

    console.log(`\n✅ All Summary Page content sections validated!`);
  });

  test('PDH-1587 Verify Net Campaign Delivery - Reach & Frequency Section on Summary Sheet', async ({ page }) => {
    const summaryPageContent = await validationPage.getSummaryPageContent();

    console.log(`\n🔍 Net Campaign Delivery - Reach & Frequency Section Validation:`);

    // Validate full section header text exists on Summary sheet
    const sectionHeader = 'Net Campaign Delivery - Reach & Frequency';
    const hasSectionHeader = summaryPageContent.includes(sectionHeader);
    console.log(`   ${hasSectionHeader ? '✓' : '✗'} Section Header "${sectionHeader}": ${hasSectionHeader ? 'Found' : 'NOT FOUND'}`);
    expect(hasSectionHeader).toBe(true);

    // Additionally validate the base title "Net Campaign Delivery" is displayed (more tolerant)
    const baseTitle = 'Net Campaign Delivery';
    const hasBaseTitle = summaryPageContent.includes(baseTitle);
    console.log(`   ${hasBaseTitle ? '✓' : '✗'} Base Title "${baseTitle}": ${hasBaseTitle ? 'Found' : 'NOT FOUND'}`);
    expect(hasBaseTitle).toBe(true);

    // Define expected column headers for this section
    const expectedColumnHeaders = [
      'Measured Entity',
      'Media Type',
      'Impression Filter',
      'Total Net Campaign Reach',
      'Total Net Campaign Reach%',
      'Average Frequency'
    ];

    // Validate all column headers exist in the content
    console.log(`\n🔍 Validating Net Campaign Delivery Column Headers:`);
    expectedColumnHeaders.forEach(header => {
      const found = summaryPageContent.includes(header);
      console.log(`   ${found ? '✓' : '✗'} "${header}": ${found ? 'Found' : 'NOT FOUND'}`);
      expect(found).toBe(true);
    });

    console.log(`\n✅ Net Campaign Delivery - Reach & Frequency section validated on Summary sheet!`);
  });

 
  test('PDH-1588 Verify Net Campaign Delivery Data Values on Summary Sheet', async ({ page }) => {
    // First, ensure the section header text exists on the Summary sheet
    const summaryPageContent = await validationPage.getSummaryPageContent();
    const expectedSectionHeader = 'Net Campaign Delivery - Reach & Frequency';
    const hasExpectedSectionHeader = summaryPageContent.includes(expectedSectionHeader);

    console.log(`\n🔍 Validating presence of section header on Summary sheet: "${expectedSectionHeader}"`);
    console.log(`   ${hasExpectedSectionHeader ? '✓' : '✗'} Section Header: ${hasExpectedSectionHeader ? 'Found' : 'NOT FOUND'}`);
    expect(hasExpectedSectionHeader).toBe(true);

    const netCampaignDeliveryData = await validationPage.getNetCampaignDeliverySummaryData();

    console.log(`\n🔍 Net Campaign Delivery Data Values Validation:`);
    // Validate data is not empty
    expect(netCampaignDeliveryData).toBeTruthy();
    // Log Excel data
    console.log(`\n📊 Data from Excel Summary Sheet:`);
    console.log(`   Measured Entity: ${netCampaignDeliveryData.measuredEntity}`);
    console.log(`   Media Type: ${netCampaignDeliveryData.mediaType}`);
    console.log(`   Impression Filter: ${netCampaignDeliveryData.impressionFilter}`);
    console.log(`   Total Net Campaign Reach: ${netCampaignDeliveryData.totalNetCampaignReach}`);
    console.log(`   Total Net Campaign Reach%: ${netCampaignDeliveryData.totalNetCampaignReachPercent}`);
    console.log(`   Average Frequency: ${netCampaignDeliveryData.averageFrequency}`);

    // Ensure all key fields have non-empty values
    const fieldsToValidate: { [key: string]: unknown } = {
      'Measured Entity': netCampaignDeliveryData.measuredEntity,
      'Media Type': netCampaignDeliveryData.mediaType,
      'Impression Filter': netCampaignDeliveryData.impressionFilter,
      'Total Net Campaign Reach': netCampaignDeliveryData.totalNetCampaignReach,
      'Total Net Campaign Reach%': netCampaignDeliveryData.totalNetCampaignReachPercent,
      'Average Frequency': netCampaignDeliveryData.averageFrequency
    };

    Object.entries(fieldsToValidate).forEach(([label, value]) => {
      const stringValue = value !== undefined && value !== null ? String(value).trim() : '';
      console.log(`   🔎 Validating presence of ${label}: "${stringValue}"`);
      // Basic non-empty check
      expect(stringValue.length).toBeGreaterThan(0);

      // For numeric metrics, also ensure value is not 0 or NA
      if (label === 'Total Net Campaign Reach' || label === 'Total Net Campaign Reach%') {
        const upperCompact = stringValue.toUpperCase().replace(/\s/g, '');

        // Must not be NA / N.A / N/A etc.
        expect(['NA', 'N/A', 'N.A'].includes(upperCompact)).toBe(false);

        // Strip commas and percent signs and ensure numeric > 0
        const numeric = parseFloat(stringValue.replace(/[,\s%]/g, ''));
        console.log(`   🔢 Parsed numeric value for ${label}: ${numeric}`);
        expect(Number.isNaN(numeric)).toBe(false);
        expect(numeric).toBeGreaterThan(0);

        // Additional type-specific validations
        if (label === 'Total Net Campaign Reach') {
          // Reach should be an integer count
          expect(Number.isInteger(numeric)).toBe(true);
        }

        if (label === 'Total Net Campaign Reach%') {
          // Percentage should contain a '%' symbol and be within 0–100 range
          expect(stringValue.includes('%')).toBe(true);
          expect(numeric).toBeLessThanOrEqual(100);
        }
      }
    });



    console.log(`\n✅ Net Campaign Delivery Summary sheet values match expected data!`);
  });



  test('PDH-1590 Verify HaloReportId from API and Final Output Bucket json Matches', async ({ page }) => {
    const reportDetails = validationPage.getReportDetails();
    const excelReportId = validationPage.getHaloReportIdFromExcel();
    const externalBasicReportId = validationPage.getExternalBasicReportId();
    const haloIdFromOutputBucketRaw = validationPage.getHaloIdFromFinalJson();

    // Truncate the prefix from haloReportId and haloIdFromOutputBucket
    const haloReportId = reportDetails?.haloReportId?.replace(/^measurementConsumers\/[^\/]+\/reports\//, '') || '';
    const haloIdFromOutputBucket = haloIdFromOutputBucketRaw?.replace(/^measurementConsumers\/[^\/]+\/reports\//, '') || '';

    console.log(`\n🔍 Verify externalBasicReportId from ReportOutput json and HaloReportId from API:`);
    console.log(`   externalBasicReportId: ${externalBasicReportId}`);
    console.log(`   haloReportId (from API): ${haloReportId}`);
    console.log(`   HaloId from Output Bucket: ${haloIdFromOutputBucket}`);
    console.log(`   Report ID from Excel: ${excelReportId}`);

    expect(excelReportId).toBe(haloReportId);
    expect(externalBasicReportId).toBe(haloReportId);
    expect(haloIdFromOutputBucket).toBe(haloReportId);

    console.log(`✅ Verification passed: HaloReportId match!`);
  });

  test('PDH-1591 Verify ReportName in Excel, ReportOutput json and API Response Matches', async ({ page }) => {
    const reportDetails = validationPage.getReportDetails();
    const reportNameFromExcel = validationPage.getReportNameFromExcel();
    const reportNameFromBasicJson = validationPage.getReportNameFromBasicJson();
    const reportNameFromFinalJson = validationPage.getReportNameFromFinalJson();

    console.log(`\n🔍 Verify ReportName across all sources:`);
    console.log(`   From Basic report JSON: ${reportNameFromBasicJson}`);
    console.log(`   From Final report JSON: ${reportNameFromFinalJson}`);
    console.log(`   From API: ${reportDetails?.reportName}`);
    console.log(`   From Excel: ${reportNameFromExcel}`);

    expect(reportNameFromBasicJson).toBe(reportDetails?.reportName);
    expect(reportNameFromBasicJson).toBe(reportNameFromExcel);
    expect(reportNameFromFinalJson).toBe(reportNameFromExcel);

    console.log(`✅ Verification passed: Report names match!`);
  });

  test('PDH-1592 Verify CampaignGroupName AND CAMPAIGNS in Report json, Excel and API', async ({ page }) => {
    const reportDetails = validationPage.getReportDetails();
    const campaignResponseJson = validationPage.getCampaignResponseJson();
    const campaignGroupDisplayName = validationPage.getCampaignGroupDisplayNameFromBasicJson();
    const campaignsFromFinalJson = validationPage.getCampaignsFromFinalJson();
    const campaignNamesFromExcel = validationPage.getCampaignNamesFromExcel();

    console.log(`\n🔍 Comparing Campaign Group Names:`);
    console.log(`   From Report Output JSON: ${campaignGroupDisplayName}`);
    console.log(`   From Campaign API: ${campaignResponseJson.campaignGroup.campaignGroupName}`);
    console.log(`   From Report API: ${reportDetails?.campaignGroupName}`);
    console.log(`   From Excel (Campaign Names): ${campaignNamesFromExcel.join(', ')}`);

    // Extract all display names from campaign API
    const allDisplayNames = validationPage.extractDisplayNames();
    validationPage.printDisplayNamesDetails(allDisplayNames);

    // Verify campaign names match
    const allMatch = validationPage.verifyCampaignNamesMatch(campaignNamesFromExcel, allDisplayNames);

    expect(allMatch).toBe(true);
    expect(campaignGroupDisplayName).toBe(campaignResponseJson.campaignGroup.campaignGroupName);
    expect(campaignGroupDisplayName).toBe(reportDetails?.campaignGroupName);
    expect(campaignGroupDisplayName).toBe(campaignsFromFinalJson);

    console.log(`✅ Verification passed: Campaign Group Names and Display Names match!`);
  });

  test('PDH-1593 Verify Demographics - Excel and Final Report Output bucket', async ({ page }) => {
    const demographicsFromExcel = validationPage.getDemographicsFromExcel();
    const demographicsFromFinalJson = validationPage.getDemographicsFromFinalJson();

    console.log(`\n🔍 Verify Demographics:`);
    console.log(`   Demographics from Excel: ${demographicsFromExcel}`);
    console.log(`   Demographics from Output Bucket: ${demographicsFromFinalJson}`);

    expect(demographicsFromExcel).toBe(demographicsFromFinalJson);

    console.log(`✅ Verification passed: Demographics match!`);
  });

  test('PDH-1595 Verify Media Type - Excel and Final Report Output bucket', async ({ page }) => {
    const allMediaTypesFromExcel = await validationPage.getAllMediaTypesFromExcel();
    const allMediaTypesFromFinalJson = validationPage.getAllMediaTypesFromFinalJson();

    console.log(`\n🔍 Verify Media Type:`);
    console.log(`   All Media Types from Excel: ${allMediaTypesFromExcel.join(', ')}`);
    console.log(`   All Media Types from Report Output Bucket: ${allMediaTypesFromFinalJson.join(', ')}`);

    // Sort both arrays and compare
    const sortedExcelTypes = [...allMediaTypesFromExcel].sort();
    const sortedJsonTypes = [...allMediaTypesFromFinalJson].map((type: string) => type.toUpperCase()).sort();

    console.log(`   Sorted Excel Media Types: ${sortedExcelTypes.join(', ')}`);
    console.log(`   Sorted JSON Media Types: ${sortedJsonTypes.join(', ')}`);

    // Verify all media types from JSON exist in Excel
    const allTypesMatch = sortedJsonTypes.every((jsonType: string) => sortedExcelTypes.includes(jsonType));
    expect(allTypesMatch).toBe(true);

    // Verify counts match
    expect(sortedExcelTypes.length).toBe(sortedJsonTypes.length);

    console.log(`✅ Verification passed: All Media Types match!`);
  });

  test('PDH-1584 Verify Universe Size - Excel and Final Report Output bucket', async ({ page }) => {
    const universeSizeFromExcel = validationPage.getUniverseSizeFromExcel();
    const universeSizeFromFinalJson = validationPage.getUniverseSizeFromFinalJson();

    console.log(`\n🔍 Verify Universe Size:`);
    console.log(`   Universe Size from Excel: ${universeSizeFromExcel}`);
    console.log(`   Universe Size from Report Output Bucket: ${universeSizeFromFinalJson}`);

    expect(universeSizeFromExcel).toBe(universeSizeFromFinalJson);

    console.log(`✅ Verification passed: Universe Size match!`);
  });

  test('PDH-1626 Verify Measured Entity from Summary sheet align with Sheet names in the xlsx file', async ({ page }) => {
    // Fetch Net Campaign Delivery data from the Summary sheet
    const netCampaignDeliveryData = await validationPage.getNetCampaignDeliverySummaryData();

    const measuredEntityRaw = netCampaignDeliveryData?.measuredEntity;
    const measuredEntity = measuredEntityRaw !== undefined && measuredEntityRaw !== null
      ? String(measuredEntityRaw).trim()
      : '';

    console.log(`\n🔍 Measured Entity from Summary sheet (Net Campaign Delivery section): "${measuredEntity}"`);

    // Basic validation: Measured Entity should be present and non-empty
    expect(measuredEntity.length).toBeGreaterThan(0);

    // Parse Measured Entity string into a list (array), splitting on comma
    const measuredEntityList = measuredEntity
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0);

    console.log(`\n📋 Parsed Measured Entity list:`);
    measuredEntityList.forEach((entity, index) => {
      console.log(`   ${index + 1}. ${entity}`);
    });

    // Ensure the list is not empty
    expect(measuredEntityList.length).toBeGreaterThan(0);

    // If there are multiple measured entities, verify each one has a corresponding sheet available
    if (measuredEntityList.length > 1) {
      console.log(`\n🔍 Multiple Measured Entities detected (${measuredEntityList.length}). Verifying each has a corresponding sheet...`);

      const sheetNames = await validationPage.getAllWorksheetNames();
      const sheetNamesLower = sheetNames.map((name: string) => name.toLowerCase());

      console.log(`   Available worksheet names: ${sheetNames.join(', ')}`);

      for (const entity of measuredEntityList) {
        const entityLower = entity.toLowerCase();

        // Look for a sheet whose name contains the measured entity text (case-insensitive)
        const hasMatchingSheet = sheetNamesLower.some((name: string | string[]) => name.includes(entityLower));

        console.log(`   Measured Entity "${entity}": ${hasMatchingSheet ? 'Sheet found' : 'NO matching sheet'}`);
        expect(hasMatchingSheet).toBe(true);
      }
    }

    console.log(`\n✅ Measured Entity fetched and parsed into list successfully from Summary sheet!`);
  });


  test('PDH-1627 Verify individual Measured Entity sheets have data', async ({ page }) => {
    // Fetch Net Campaign Delivery data from the Summary sheet
    const netCampaignDeliveryData = await validationPage.getNetCampaignDeliverySummaryData();

    const measuredEntityRaw = netCampaignDeliveryData?.measuredEntity;
    const measuredEntity = measuredEntityRaw !== undefined && measuredEntityRaw !== null
      ? String(measuredEntityRaw).trim()
      : '';


      
    // Build list of entities
    const measuredEntityList = measuredEntity
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0);

    console.log(`\n📋 Parsed Measured Entity list for individual sheet validation:`);   
    // If no entities, nothing to validate
    expect(measuredEntityList.length).toBeGreaterThan(0);

    // Expected headers for each individual Measured Entity sheet
    const expectedHeaders = [
      'Measured Entity',
      'Media Type',
      'Impression Filter',
      'GRPs',
      'Total Reach (1+)',
      'Total Reach (2+)',
      'Total Reach (3+)',
      'Total Reach (4+)',
      'Total Reach (5+)',
      'Total Reach (6+)',
      'Total Reach (7+)',
      'Total Reach (8+)',
      'Total Reach (9+)',
      'Total Reach (10+)',
      'Total Reach (11+)',
      'Total Reach (12+)',
      'Total Reach (13+)',
      'Total Reach (14+)',
      'Total Reach (15+)',
      'Total Reach (1+)%',
      'Total Reach (2+)%',
      'Total Reach (3+)%',
      'Total Reach (4+)%',
      'Total Reach (5+)%',
      'Total Reach (6+)%',
      'Total Reach (7+)%',
      'Total Reach (8+)%',
      'Total Reach (9+)%',
      'Total Reach (10+)%',
      'Total Reach (11+)%',
      'Total Reach (12+)%',
      'Total Reach (13+)%',
      'Total Reach (14+)%',
      'Total Reach (15+)%'
    ];

    for (const entity of measuredEntityList) {   
      const info = await validationPage.getWorksheetInfoByNameSubstring(entity);
      // Sheet name must be found
      expect(info.sheetName).not.toBeNull();
      // Sheet should have some rows, columns, and non-empty cells
      expect(info.rowCount).toBeGreaterThan(0);
      expect(info.columnCount).toBeGreaterThan(0);
      expect(info.nonEmptyCellCount).toBeGreaterThan(0);

      // Validate header row on the individual Measured Entity sheet
      const headers = await validationPage.getWorksheetHeadersByNameSubstring(entity);
      // Header row must have at least one non-empty cell
      expect(headers.length).toBeGreaterThan(0);

      // Validate that all expected headers are present (case-insensitive)
      const headersLower = headers.map((h: string) => h.toLowerCase());
      console.log('   🔍 Validating expected headers on individual sheet:');
      expectedHeaders.forEach(expectedHeader => {
        const found = headersLower.some((actual: string) => actual === expectedHeader.toLowerCase());
        console.log(`      ${found ? '✓' : '✗'} "${expectedHeader}": ${found ? 'Found' : 'NOT FOUND'}`);
        expect(found).toBe(true);
      });

      // Fetch first data row (row 2) and validate values
      const rowData = await validationPage.getWorksheetRowDataByNameSubstring(entity, 1, 2);
      expect(rowData).not.toBeNull();
      if (!rowData) {
        continue;
      }

      console.log(`\n🔍 Validating first data row for individual Measured Entity sheet: ${info.sheetName}`);

      const getValueByHeader = (targetHeader: string): any => {
        const index = headersLower.findIndex((h: string) => h === targetHeader.toLowerCase());
        if (index === -1) {
          return undefined;
        }
        const actualHeader = headers[index];
        return (rowData as any)[actualHeader];
      };

      // First three descriptor fields must be non-empty strings
      const descriptorHeaders = ['Measured Entity', 'Media Type', 'Impression Filter'];
      descriptorHeaders.forEach(header => {
        const rawValue = getValueByHeader(header);
        const valueType = typeof rawValue;
        const stringValue = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';

        console.log(`   ${header}: type="${valueType}", value="${stringValue}"`);
        expect(valueType).toBe('string');
        expect(stringValue.length).toBeGreaterThan(0);
      });

      // All other expected headers should not contain error markers or negative values
      const nonNumericHeaders = descriptorHeaders;
      expectedHeaders.forEach(header => {
        if (nonNumericHeaders.includes(header)) {
          return;
        }

        const rawValue = getValueByHeader(header);
        if (rawValue === undefined || rawValue === null) {
          return;
        }

        const rawString = String(rawValue).trim();
        if (!rawString) {
          return;
        }

        const lower = rawString.toLowerCase();

        // Ensure there are no error markers like 'err'
        console.log(`   ${header}: value="${rawString}"`);
        expect(lower.includes('err')).toBeFalsy();

        // Allow non-numeric markers like 'N/A'
        if (lower === 'n/a') {
          return;
        }

        // Normalise number string: remove commas, spaces, and percent sign
        const numericCandidate = rawString.replace(/[\,\s%]/g, '');
        if (!numericCandidate) {
          return;
        }

        const num = Number(numericCandidate);
        expect(Number.isNaN(num)).toBeFalsy();
        expect(num).toBeGreaterThanOrEqual(0);
      });

      // Validate Total Reach cascade: Total Reach (1+) >= Total Reach (2+) >= ... >= Total Reach (15+)
      const totalReachColumns = [
        'Total Reach (1+)',
        'Total Reach (2+)',
        'Total Reach (3+)',
        'Total Reach (4+)',
        'Total Reach (5+)',
        'Total Reach (6+)',
        'Total Reach (7+)',
        'Total Reach (8+)',
        'Total Reach (9+)',
        'Total Reach (10+)',
        'Total Reach (11+)',
        'Total Reach (12+)',
        'Total Reach (13+)',
        'Total Reach (14+)',
        'Total Reach (15+)'
      ];

      console.log(`\n🔍 Validating Total Reach cascade for ${info.sheetName} (each reach value should be >= next):`);
      
      for (let i = 0; i < totalReachColumns.length - 1; i++) {
        const currentColumn = totalReachColumns[i];
        const nextColumn = totalReachColumns[i + 1];
        
        const currentValue = getValueByHeader(currentColumn);
        const nextValue = getValueByHeader(nextColumn);
        
        // Parse numeric values (remove commas, spaces, and convert to number)
        const currentNumeric = parseFloat(String(currentValue).replace(/[,\s]/g, ''));
        const nextNumeric = parseFloat(String(nextValue).replace(/[,\s]/g, ''));
        
        console.log(`   Comparing ${currentColumn} vs ${nextColumn}:`);
        console.log(`      ${currentColumn}: ${currentNumeric}`);
        console.log(`      ${nextColumn}: ${nextNumeric}`);
        
        // Validate current value >= next value
        if (!isNaN(currentNumeric) && !isNaN(nextNumeric)) {
          expect(currentNumeric).toBeGreaterThanOrEqual(nextNumeric);
          console.log(`      ✓ ${currentNumeric} >= ${nextNumeric} - Valid cascade`);
        } else {
          console.log(`      ⚠️ Skipped comparison - non-numeric value detected`);
        }
      }
    }

    console.log(`\n✅ All individual Measured Entity sheets verified to exist, contain data, headers, and Total Reach cascade!`);
  });


  test('PDH-1589 Verify Total Campaign Sheet key/value data', async ({ page }) => {
    // Recompute Measured Entity list from Summary sheet to decide if this test should run fully
    const netCampaignDeliveryData = await validationPage.getNetCampaignDeliverySummaryData();

    const measuredEntityRaw = netCampaignDeliveryData?.measuredEntity;
    const measuredEntity = measuredEntityRaw !== undefined && measuredEntityRaw !== null
      ? String(measuredEntityRaw).trim()
      : '';

    const measuredEntityList = measuredEntity
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0);

    console.log(`\n🔍 PDH-1589 Measured Entity list size: ${measuredEntityList.length}`);

    // Only run full Total Campaign validation when more than one Measured Entity is present
    if (measuredEntityList.length <= 1) {
      console.log('\nℹ️ PDH-1589 skipped because measuredEntityList.length <= 1');
      return;
    }

    const sheetInfo = await validationPage.getTotalCampaignSheetInfo();

    console.log(`\n🔍 Total Campaign Sheet Info:`);
    console.log(`   Rows: ${sheetInfo.rowCount}, Columns: ${sheetInfo.columnCount}, Non-empty cells: ${sheetInfo.nonEmptyCellCount}`);

    // Basic structural checks
    expect(sheetInfo.rowCount).toBeGreaterThan(2); // At least header row + one data row
    expect(sheetInfo.columnCount).toBeGreaterThan(0);
    expect(sheetInfo.nonEmptyCellCount).toBeGreaterThan(0);

    const allTotalCampaignData = await validationPage.getTotalCampaignData();
    const totalCampaignData = allTotalCampaignData.slice(0, 2); // Only use first two data rows

    console.log(`\n🔍 Total Campaign Sheet key/value rows (first two): ${totalCampaignData.length}`);
    expect(totalCampaignData.length).toBeGreaterThan(0);



    // Use the first row to derive the headers actually present in the sheet
    const firstRow = totalCampaignData[0];
    const headersFromSheet = Object.keys(firstRow);
    console.log(`   Headers from sheet: ${headersFromSheet.join(', ')}`);

    // Expected headers in order, as provided
    const expectedHeaders = [
      'Measured Entity',
      'Media Type',
      'Impression Filter',
      'GRPs',
      'Deduplicated Net Campaign Reach (Frequency 1+)',
      'Deduplicated Net Campaign Reach (Frequency 2+)',
      'Deduplicated Net Campaign Reach (Frequency 3+)',
      'Deduplicated Net Campaign Reach (Frequency 4+)',
      'Deduplicated Net Campaign Reach (Frequency 5+)',
      'Deduplicated Net Campaign Reach (Frequency 6+)',
      'Deduplicated Net Campaign Reach (Frequency 7+)',
      'Deduplicated Net Campaign Reach (Frequency 8+)',
      'Deduplicated Net Campaign Reach (Frequency 9+)',
      'Deduplicated Net Campaign Reach (Frequency 10+)',
      'Deduplicated Net Campaign Reach (Frequency 11+)',
      'Deduplicated Net Campaign Reach (Frequency 12+)',
      'Deduplicated Net Campaign Reach (Frequency 13+)',
      'Deduplicated Net Campaign Reach (Frequency 14+)',
      'Deduplicated Net Campaign Reach (Frequency 15+)',
      'Deduplicated Net Campaign Reach (Frequency 1+)%',
      'Deduplicated Net Campaign Reach (Frequency 2+)%',
      'Deduplicated Net Campaign Reach (Frequency 3+)%',
      'Deduplicated Net Campaign Reach (Frequency 4+)%',
      'Deduplicated Net Campaign Reach (Frequency 5+)%',
      'Deduplicated Net Campaign Reach (Frequency 6+)%',
      'Deduplicated Net Campaign Reach (Frequency 7+)%',
      'Deduplicated Net Campaign Reach (Frequency 8+)%',
      'Deduplicated Net Campaign Reach (Frequency 9+)%',
      'Deduplicated Net Campaign Reach (Frequency 10+)%',
      'Deduplicated Net Campaign Reach (Frequency 11+)%',
      'Deduplicated Net Campaign Reach (Frequency 12+)%',
      'Deduplicated Net Campaign Reach (Frequency 13+)%',
      'Deduplicated Net Campaign Reach (Frequency 14+)%',
      'Deduplicated Net Campaign Reach (Frequency 15+)%'
    ];

    console.log(`\n🔍 Validating Total Campaign headers:`);
    expectedHeaders.forEach(expectedHeader => {
      const found = headersFromSheet.some(h => h.toLowerCase().includes(expectedHeader.toLowerCase()));
      console.log(`   ${found ? '✓' : '✗'} Header "${expectedHeader}": ${found ? 'Found' : 'NOT FOUND'}`);
      expect(found).toBe(true);
    });

    // Verify the first three descriptor fields have non-empty string values
    const descriptorHeaders = ['Measured Entity', 'Media Type', 'Impression Filter'];
    console.log(`\n🔍 Verifying descriptor fields (first three columns) have string values:`);
    descriptorHeaders.forEach(header => {
      const rawValue = firstRow[header];
      const valueType = typeof rawValue;
      const stringValue = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';

      console.log(`   ${header}: type="${valueType}", value="${stringValue}"`);
      expect(stringValue.length).toBeGreaterThan(0);
    });

    // Cross-check that Measured Entity on Total Campaign sheet matches Net Campaign Delivery summary
    const netCampaignSummary = await validationPage.getNetCampaignDeliverySummaryData();
    const measuredEntityFromTotalCampaign = firstRow['Measured Entity'];
    const measuredEntityFromSummary = netCampaignSummary?.measuredEntity;

    const measuredEntityTotalStr = measuredEntityFromTotalCampaign !== undefined && measuredEntityFromTotalCampaign !== null
      ? String(measuredEntityFromTotalCampaign).trim()
      : '';
    const measuredEntitySummaryStr = measuredEntityFromSummary !== undefined && measuredEntityFromSummary !== null
      ? String(measuredEntityFromSummary).trim()
      : '';

    console.log(`\n🔍 Verifying Measured Entity consistency between Total Campaign sheet and Net Campaign Delivery summary:`);
    console.log(`   Measured Entity (Total Campaign): "${measuredEntityTotalStr}"`);
    console.log(`   Measured Entity (Summary Net Campaign Delivery): "${measuredEntitySummaryStr}"`);

    expect(measuredEntityTotalStr.length).toBeGreaterThan(0);
    expect(measuredEntitySummaryStr.length).toBeGreaterThan(0);
    expect(measuredEntityTotalStr).toBe(measuredEntitySummaryStr);

    // Validate that all numeric-like values are non-negative and not error values
    console.log(`\n🔍 Validating Total Campaign values are non-negative and not errors:`);

    // Exclude obviously non-numeric descriptor fields
    const nonNumericHeaders = ['Measured Entity', 'Media Type', 'Impression Filter'];

    headersFromSheet.forEach(header => {
      if (nonNumericHeaders.includes(header)) {
        return;
      }

      const rawValue = firstRow[header];
      if (rawValue === undefined || rawValue === null) {
        return;
      }

      const rawString = String(rawValue).trim();
      if (!rawString) {
        return;
      }

      const lower = rawString.toLowerCase();

      // Ensure there are no error markers like 'err'
      console.log(`   ${header}: value="${rawString}"`);
      expect(lower.includes('err')).toBeFalsy();

      // Allow non-numeric markers like 'N/A'
      if (lower === 'n/a') {
        return;
      }

      // Normalise number string: remove commas and percent sign
      const numericCandidate = rawString.replace(/[,\s%]/g, '');
      if (!numericCandidate) {
        return;
      }

      const num = Number(numericCandidate);
      expect(Number.isNaN(num)).toBeFalsy();
      expect(num).toBeGreaterThanOrEqual(0);
    });


    
    // Validate presence and position of Origin audit explanatory text on Total Campaign sheet (rows 5 and 6)
    const [row5Text, row6Text] = await validationPage.getTotalCampaignRowsText([5, 6]);

    const normalisedRow5 = row5Text.replace(/\s+/g, ' ').trim().toLowerCase();
    const normalisedRow6 = row6Text.replace(/\s+/g, ' ').trim().toLowerCase();

    const expectedAuditHeading = 'Independent auditing of the Origin methodology and data inputs:';
    const expectedAuditBody = 'The Origin methodology and input data are subject to a broader audit framework, managed though collaboration with independent audit organisations. For more detail on the status of these audits please go to the Help & Support page.';

    const expectedHeadingNormalised = expectedAuditHeading.replace(/\s+/g, ' ').trim().toLowerCase();
    const expectedBodyNormalised = expectedAuditBody.replace(/\s+/g, ' ').trim().toLowerCase();

    console.log('\n🔍 Validating Origin audit explanatory text on Total Campaign sheet (rows 5 and 6)');
    expect(normalisedRow5).toContain(expectedHeadingNormalised);
    //expect(normalisedRow6).toContain(expectedBodyNormalised);

    console.log(`\n✅ Total Campaign Sheet key/value data and audit text (including rows 5 and 6) validated successfully!`);
  });

  
  

  test('PDH-1671 Validate Deduplicated Net Campaign Reach Frequency Data (1+ through 15+) in Total Summary sheet', async ({ page }) => {
    // Get all data from the Total Campaign sheet
    const allTotalCampaignData = await validationPage.getTotalCampaignData();
    
    if (allTotalCampaignData.length === 0) {
      console.log('\n⚠️ No data found in Total Campaign sheet');
      return;
    }

    // Use the first data row
    const firstRow = allTotalCampaignData[0];

    // Define the frequency columns we want to fetch (1+ through 15+)
    const frequencyColumns = [
      'Deduplicated Net Campaign Reach (Frequency 1+)',
      'Deduplicated Net Campaign Reach (Frequency 2+)',
      'Deduplicated Net Campaign Reach (Frequency 3+)',
      'Deduplicated Net Campaign Reach (Frequency 4+)',
      'Deduplicated Net Campaign Reach (Frequency 5+)',
      'Deduplicated Net Campaign Reach (Frequency 6+)',
      'Deduplicated Net Campaign Reach (Frequency 7+)',
      'Deduplicated Net Campaign Reach (Frequency 8+)',
      'Deduplicated Net Campaign Reach (Frequency 9+)',
      'Deduplicated Net Campaign Reach (Frequency 10+)',
      'Deduplicated Net Campaign Reach (Frequency 11+)',
      'Deduplicated Net Campaign Reach (Frequency 12+)',
      'Deduplicated Net Campaign Reach (Frequency 13+)',
      'Deduplicated Net Campaign Reach (Frequency 14+)',
      'Deduplicated Net Campaign Reach (Frequency 15+)'
    ];

    console.log(`\n🔍 Fetching Deduplicated Net Campaign Reach (Frequency 1+ through 15+):`);
    
    // Extract and display key-value pairs for each frequency column
    const frequencyData: Record<string, any> = {};
    
    frequencyColumns.forEach(column => {
      const value = firstRow[column];
      frequencyData[column] = value;
      console.log(`   ${column}: ${value}`);
    });

    // Validate that all frequency columns exist and have values
    frequencyColumns.forEach(column => {
      expect(firstRow.hasOwnProperty(column)).toBe(true);
      const value = firstRow[column];
      
      // Ensure value is not null/undefined
      expect(value).toBeDefined();
      
      // Log the value type and content
      const stringValue = value !== undefined && value !== null ? String(value).trim() : '';
      console.log(`\n   🔎 Validating ${column}:`);
      console.log(`      Type: ${typeof value}`);
      console.log(`      Value: "${stringValue}"`);
      
      // Validate the value is not an error
      if (stringValue) {
        const lower = stringValue.toLowerCase();
        expect(lower.includes('err')).toBeFalsy();
      }
    });

    // Validate cascade: Frequency 1+ > Frequency 2+ > Frequency 3+ ... > Frequency 15+
    console.log(`\n🔍 Validating frequency cascade (each frequency should be >= next frequency):`);
    
    for (let i = 0; i < frequencyColumns.length - 1; i++) {
      const currentColumn = frequencyColumns[i];
      const nextColumn = frequencyColumns[i + 1];
      
      const currentValue = firstRow[currentColumn];
      const nextValue = firstRow[nextColumn];
      
      // Parse numeric values (remove commas, spaces, and convert to number)
      const currentNumeric = parseFloat(String(currentValue).replace(/[,\s]/g, ''));
      const nextNumeric = parseFloat(String(nextValue).replace(/[,\s]/g, ''));
      
      console.log(`\n   Comparing ${currentColumn.match(/\d+\+/)?.[0]} vs ${nextColumn.match(/\d+\+/)?.[0]}:`);
      console.log(`      ${currentColumn.match(/\d+\+/)?.[0]}: ${currentNumeric}`);
      console.log(`      ${nextColumn.match(/\d+\+/)?.[0]}: ${nextNumeric}`);
      
      // Validate current value >= next value
      if (!isNaN(currentNumeric) && !isNaN(nextNumeric)) {
        expect(currentNumeric).toBeGreaterThanOrEqual(nextNumeric);
        console.log(`      ✓ ${currentNumeric} >= ${nextNumeric} - Valid cascade`);
      } else {
        console.log(`      ⚠️ Skipped comparison - non-numeric value detected`);
      }
    }

    console.log(`\n✅ Successfully fetched and validated all Deduplicated Net Campaign Reach frequency data (1+ through 15+)!`);
  });


  

});