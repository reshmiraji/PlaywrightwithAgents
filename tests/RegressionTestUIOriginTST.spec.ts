/**
 * Reads and parses the JSON body from a Playwright APIResponse object.
 * @param {import('@playwright/test').APIResponse} response - The response object returned from Playwright's request.
 * @returns {Promise<any>} - The parsed JSON body.
 */

import test, { expect, Page } from '@playwright/test';
import { SmokeTestSuite } from './functions/smokeTestSuite';
import { parseFilterParameters } from './utils/testUtils';

test.describe('Regression Pack', () => {
    let filterParameter = "Display"
    let mrsValue = '100';
    const env = process.env.TEST_ENV ;

    test('PDH-1570 Single EDP Single Mediatype - Display', async ({ page }) => {
       if (env !== 'TST' && env !== 'UAT') {
            test.skip();
        }
         filterParameter = "Display";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Display");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_DisplayCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });
    test('PDH-659 Create a report with multiple EDP', async ({ page }) => {
        filterParameter = "CrossEDP";
        const filterParameterArray = "Linear TV,Fastflix,Vubox";
        // Parse the filterParameterArray into a list
        const filterlist = await parseFilterParameters({ filterParameterArray });
        console.log('Parsed filter list:', filterlist);

        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "Multiple_EDP");
        await smokeTestSuite.createCampaignGroup(page, "Multiple_EDP_Campaign");
        for (const measuredEntity of filterlist) {
            console.log(`Processing filter: ${measuredEntity}`);
            await smokeTestSuite.selectMultipleMeasuredEntity(page, measuredEntity);
            await smokeTestSuite.selectFirstRowFromList(page);
        }

        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
         await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });

    test('PDH-952 Verify media type filter dropdown is displaying in Campaign page', async ({ page }) => {
        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Display");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_DisplayCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
    });

    test('PDH-491 Verify to Media Type Column has values ', async ({ page }) => {
        const env = process.env.TEST_ENV || 'TST';
        if (env !== 'TST' && env !== 'STG') {
            test.skip();
        }

        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.validateCampaignTableSearchResults(page);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.validateCampaignTableSelectAdverts(page);
        await smokeTestSuite.submitSelectedCampaign(page);
    });


    test('PDH-491 UAT Verify to Media Type Column has values ', async ({ page }) => {
        const env = process.env.TEST_ENV ;
        if (env !== 'UAT') {
            test.skip();
        }
        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.validateCampaignTableSearchResultsforAquila(page);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.validateCampaignTableSelectAdvertsAquila(page);
        await smokeTestSuite.submitSelectedCampaign(page);
    });



    test('PDH-T650 Create campaign group with at least one event group with metadata', async ({ page }) => {
        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });



    test('PDH-T653 The Campaign group name can contain alphanumeric values', async ({ page }) => {
        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "Batch Report 123");
        await smokeTestSuite.createCampaignGroup(page, "Batch Report 123");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });

    test('PDH-T673 The Batch Report name can contain alphanumeric values', async ({ page }) => {
        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "Batch Report 123");
        await smokeTestSuite.createCampaignGroup(page, "Batch Report 123");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });

    test('PDH-T652 Create the campaign group  name with unique name', async ({ page }) => {
        filterParameter = "Other"
        const errorMessage = "The campaign name should be unique. Please update the name you have provided.";

        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "Report 123");
        const campaignGroupName = await smokeTestSuite.createCampaignGroup(page, "Report 123");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.logoutConfirmation(page);
        await page.waitForTimeout(2000); // Wait for 2 seconds
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "Report 123");
        await smokeTestSuite.createCampaignGroupForNameValidation(page, campaignGroupName);
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await page.waitForTimeout(2000);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.verifyCampaignNameRequiredErrorMessage(page, errorMessage);

    });

    test('PDH-T670 Create the batch report where the start date must be before or the same as end date', async ({ page }) => {
        filterParameter = "Other";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });
    test('PDH-T658 Campaign Group Name cannot be empty or null', async ({ page }) => {
        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);

        const errorMessage = "A campaign name is required.";
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroupForNameValidation(page, "");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.verifyCampaignNameRequiredErrorMessage(page, errorMessage);

    });

    test('PDH-T656 The Campaign group name contains <1 or >255 chars', async ({ page }) => {
        filterParameter = "Other"
        const errorMessage = "Campaign name is too long. Please provide a shorter name.";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroupForNameValidation(page, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.verifyCampaignNameRequiredErrorMessage(page, errorMessage);

    });


    test('PDH-T675 The Campaign group name contain <1 or >246 chars', async ({ page }) => {
        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "MaximumAllowedChar574");
        await smokeTestSuite.createCampaignGroupForNameValidation(page, "aaaaaaaaaaaaaaaaanbnbbnaaaaabaaaaaaaaaaaaaffaaaaaaaaaaaaaaaaaaaaa");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);
    });

    test('PDH-T654 The Report  name cannot be empty', async ({ page }) => {
        filterParameter = "Other"
        const errorMessage = "A report name is required.";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReportvalidatingNegativeScenarios(page, "");

        await smokeTestSuite.verifyCampaignNameRequiredErrorMessage(page, errorMessage);

    });

    test('PDH-T655 The Batch Report name contain between 1 and 255 chars', async ({ page }) => {
        filterParameter = "Other"
        const errorMessage = "Report name is too long. Please provide a shorter name.";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReportvalidatingNegativeScenarios(page, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

        await smokeTestSuite.verifyCampaignNameRequiredErrorMessage(page, errorMessage);

    });

    test('PDH-T659 Create Batch Report', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Video"
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Video");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_VideoCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);
    });
    test('PDH-T66 TV event group displayed successfully', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Video";
        const ME = "Linear TV";
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Video_Linear TV");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_VideoCampaignLinear TV");
        await smokeTestSuite.selectMeasuredEntity(page, ME);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);
    });



    test('PDH-T1572 Single EDP Single Mediatype - Video', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Video"
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Video");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_VideoCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);
    });

    test('PDH-T1574 Single EDP Single Mediatype - Other', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Other";

        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);
    });



    test('PDH-T1576 Cross Media - Display, Video and Other', async ({ page }) => {
        if (env !== 'TST') {
            test.skip();
        }
      

        mrsValue = 'CrossMedia';
        const smokeTestSuite = new SmokeTestSuite(page);
        const filterParameterArray = "Display,Video,Other";

        // Parse the filterParameterArray into a list
        const filterlist = await parseFilterParameters({ filterParameterArray });
        console.log('Parsed filter list:', filterlist);

        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "CrossMedia_Display_Other");
        await smokeTestSuite.createCampaignGroup(page, "CrossMedia_Campaign");

        // For each loop to parse through filterlist
        for (const filter of filterlist) {
            console.log(`Processing filter: ${filter}`);

            await smokeTestSuite.selectSingleMediaType(page, filter);
            await smokeTestSuite.selectFirstRowFromList(page);
        }
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, "", mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });

    
    test('PDH-T1576 Cross Media - Video and Other', async ({ page }) => {
         if (env === 'TST' || env === 'UAT') {
            test.skip();
        }
      

        mrsValue = 'CrossMedia';
        const smokeTestSuite = new SmokeTestSuite(page);
        const filterParameterArray = "Video,Other";

        // Parse the filterParameterArray into a list
        const filterlist = await parseFilterParameters({ filterParameterArray });
        console.log('Parsed filter list:', filterlist);

        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "CrossMedia_Video_Other");
        await smokeTestSuite.createCampaignGroup(page, "CrossMedia_Campaign");

        // For each loop to parse through filterlist
        for (const filter of filterlist) {
            console.log(`Processing filter: ${filter}`);

            await smokeTestSuite.selectSingleMediaType(page, filter);
            await smokeTestSuite.selectFirstRowFromList(page);
        }
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, "", mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });

    test('PDH-761 Verify Updated Cumulative Reach tabs for cross-media type report', async ({ page }) => {
        mrsValue = 'CrossMedia';
        const smokeTestSuite = new SmokeTestSuite(page);
        const filterParameterArray = " Video, Other";

        // Parse the filterParameterArray into a list
        const filterlist = await parseFilterParameters({ filterParameterArray });
        console.log('Parsed filter list:', filterlist);

        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "CrossMedia_Video_Other_Cummulative");
        await smokeTestSuite.createCampaignGroup(page, "CrossMedia_Campaign");

        // For each loop to parse through filterlist
        for (const filter of filterlist) {
            console.log(`Processing filter: ${filter}`);

            await smokeTestSuite.selectSingleMediaType(page, filter);
            await smokeTestSuite.selectFirstRowFromList(page);
        }
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFiltersForCumulative(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, "", mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });

    test('PDH-T79 Verify of all publisher on channel aligned with data provider based on their campaign selections', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        const filterParameterArray = " Video, Other";

        mrsValue = 'CrossMedia';
        const filterlist = await parseFilterParameters({ filterParameterArray });
        console.log('Parsed filter list:', filterlist);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "CrossMedia_Video_Other");
        await smokeTestSuite.createCampaignGroup(page, "CrossMedia_Campaign");
        // For each loop to parse through filterlist
        for (const filter of filterlist) {
            console.log(`Processing filter: ${filter}`);

            await smokeTestSuite.selectSingleMediaType(page, filter);
            await smokeTestSuite.selectFirstRowFromList(page);
        }
        await smokeTestSuite.submitSelectedCampaign(page);

        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, "", mrsValue);
        await smokeTestSuite.selectReportMetricsCrossMedia(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });

    test('PDH-981 Verify a combined search functionality and getting a successful results', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Video";
        const ME = "Linear TV";

        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Video_Linear TV");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_VideoCampaignLinear TV");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectMeasuredEntity(page, ME);
        await smokeTestSuite.selectFirstRowFromList(page);
        //  await smokeTestSuite.submitSelectedCampaign(page);

    });


    test('PDH-T1313	Clicking on Log out button during report building process', async ({ page }) => {
        filterParameter = "Display"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.logout(page);

    });


    test('PDH-T382 Verify of Validate user consent in the context of a cookie banner', async ({ page }) => {
        filterParameter = "Display"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);

    });


    test('PDH-T1060 Verify dashboard page paginationOrigin ', async ({ page }) => {
        filterParameter = "Display"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.verifyDashboardOrigin(page);

    });


    test('PDH-T1060 Verify dashboard page pagination', async ({ page }) => {
        filterParameter = "Display"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.verifyDashboardOrigin(page);

    });

    test('PDH-T1051 Verify Created by filter functionality from Dashboard ', async ({ page }) => {
        filterParameter = "Display"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.verifyDashboardfilters(page);
        await smokeTestSuite.verifyDashboardOrigin(page);

    });
    test('PDH-T1488 Privacy Notice updated to final version with the correct version of the Privacy Notice with Origin Media Measurement Limited as company name', async ({ page }) => {
        console.log('🔍 Testing Privacy Policy Link Visibility...');

        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        const privacyPolicySelectors = page.locator("#privacy-notice-btn > img");
        expect(privacyPolicySelectors).not.toBeNull();
        // Verify link is clickable
        await expect(privacyPolicySelectors!).toBeVisible();
        await expect(privacyPolicySelectors!).toBeEnabled();
        console.log('✓ Privacy Policy link is visible and clickable');

        // Take screenshot
        await page.screenshot({
            path: 'test-results/privacy-policy-link-visible.png',
            fullPage: true
        });

        console.log('✅ Privacy Policy link visibility test passed');
    });

    test('PDH-T1182 Verify an Audit banner is displaying on Review report page', async ({ page }) => {
     //   const env = process.env.TEST_ENV;
        if (env !== 'TST' && env !== 'STG') {
            test.skip();
        }

        filterParameter = "Other";
        mrsValue = '100';
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.validateAuditBanner(page);
        await smokeTestSuite.validateReviewAndSubmitReportPage(page);
    });

    test('PDH- T1251 Verify removed Cumulative reach data label when campaign period filter is less than 1week', async ({ page }) => {
        filterParameter = "Other"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.validateReportMetrics(page);

    });

    test('PDH-T1343 Feature Flag for Total Reach frequency 15+ (Set to ON)', async ({ page }) => {
        filterParameter = "Other";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);

        if (env == 'UAT') {
            await smokeTestSuite.selectDemographicsAquila(page);
        } else {
            await smokeTestSuite.selectDemographics(page);
        }
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.validateReviewAndSubmitReportPage(page);
    });

    test('PDH-T1019 Verify the renamed title of "Search for adverts"', async ({ page }) => {
        const title = "Search for adverts";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.searchForTitle(page, title);


    });

    test('PDH-T952 Verify media type filter button is displaying in Campaign page', async ({ page }) => {
        const title = "Search for adverts";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.searchForTitle(page, title);
    });

    test('PDH-1508 Nods Media Type must be Preselected by default', async ({ page }) => {
        filterParameter = "Other";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
    });

    test('PDH-T491 Verify to Media Type Column has values', async ({ page }) => {
        filterParameter = "Other";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.validateCampaignsOnTable(page);
        await smokeTestSuite.selectFirstRowFromList(page);

    });


    test('PDH-T1018 Verify the functionality of Advert and Brand name search ', async ({ page }) => {
        if (env !== 'TST') {
            test.skip();
        }

        const advert = "OriginVubox2";
        const brand = "Vubox2";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectbyAdvertOrBrand(page, advert, brand);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);

    });

    test('PDH-425 Verify of User de-selects a column ', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Video"
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Video");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_VideoCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectfirstcolumnAndDeselect(page);
        await smokeTestSuite.selectFirstRowFromList(page);
    });

    test('PDH-426 Verify to User re-selects a column', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Video"
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Video");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_VideoCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectfirstcolumnAndDeselect(page);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);

    });
    test('PDH-T745 Verify report name uniqueness', async ({ page }) => {

        filterParameter = "Other"
        const reportName = "SingleEDP_Other";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        const isDuplicate = await smokeTestSuite.createReportUniqueness(page, reportName);
        if (isDuplicate) {
            console.log(`✓ Verified: Report name "${reportName}" is identified as duplicate.`);
        } else {
            console.log(`✗ Info: Report name "${reportName}" is not identified as duplicate. Proceeding to submit report.`);
            await smokeTestSuite.createCampaignGroup(page, reportName);
            await smokeTestSuite.selectSingleMediaType(page, filterParameter);
            await smokeTestSuite.selectFirstRowFromList(page);
            await smokeTestSuite.submitSelectedCampaign(page);
            await smokeTestSuite.selectFilters(page, filterParameter);

            if (env == 'UAT') {
                await smokeTestSuite.selectDemographicsAquila(page);
            } else {
                await smokeTestSuite.selectDemographics(page);
            }
            await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
            await smokeTestSuite.selectReportMetrics(page);
            await smokeTestSuite.reviewAndSubmitReport(page);
            console.log(`✓ Report submitted successfully with report name "${reportName}".`);

            await smokeTestSuite.createReportUniqueness(page, reportName);
        }


    });


});

