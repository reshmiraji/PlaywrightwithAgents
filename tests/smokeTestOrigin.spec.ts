/**
 * Reads and parses the JSON body from a Playwright APIResponse object.
 * @param {import('@playwright/test').APIResponse} response - The response object returned from Playwright's request.
 * @returns {Promise<any>} - The parsed JSON body.
 */

import test, { expect, Page } from '@playwright/test';
import { SmokeTestSuite } from './functions/smokeTestSuite';
import readProperties from './utils/readProperties';
import path from 'path';
import { postRequest } from './utils/requestBuilder';
import loadJsonPayload from './utils/loadJsonPayload';
import { parseFilterParameters, readResponseJson } from './utils/testUtils';

test.describe('Smoke Pack', () => {
    const props = readProperties('serviceURL_TST.properties');
    let filterParameter = "Display"
    let mrsValue = '100';
    let payloadPath: any;
    let payload: any = {};
    let response: any;
   

    test('Single EDP Single Mediatype - Display', async ({ page }) => {
        filterParameter = "Display";
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Display");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_DisplayCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);
        await smokeTestSuite.selectDemographics(page);
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });


    test('Single EDP Single Mediatype - Video', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Video"
        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Video");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_VideoCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);
        await smokeTestSuite.selectDemographics(page);
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);
    });

    test('Single EDP Single Mediatype - Other', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        filterParameter = "Other";

        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "SingleEDP_Other");
        await smokeTestSuite.createCampaignGroup(page, "SingleEDP_OtherCampaign");
        await smokeTestSuite.selectSingleMediaType(page, filterParameter);
        await smokeTestSuite.selectFirstRowFromList(page);
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);
        await smokeTestSuite.selectDemographics(page);
        await smokeTestSuite.selectMeasuredImpression(page, filterParameter, mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);
    });



    test('Cross Media - Display , Video and Other', async ({ page }) => {
        const smokeTestSuite = new SmokeTestSuite(page);
        const filterParameterArray = "Display, Video, Other";

        // Parse the filterParameterArray into a list
        const filterlist = await parseFilterParameters({ filterParameterArray });
        console.log('Parsed filter list:', filterlist);

        await smokeTestSuite.login(page);
        await smokeTestSuite.createReport(page, "CrossMedia_Display_Video_Other");
        await smokeTestSuite.createCampaignGroup(page, "CrossMedia_Campaign");

        // For each loop to parse through filterlist
        for (const filter of filterlist) {
            console.log(`Processing filter: ${filter}`);

            await smokeTestSuite.selectSingleMediaType(page, filter);
            await smokeTestSuite.selectFirstRowFromList(page);
        }
        await smokeTestSuite.submitSelectedCampaign(page);
        await smokeTestSuite.selectFilters(page, filterParameter);
        await smokeTestSuite.selectDemographics(page);
        await smokeTestSuite.selectMeasuredImpression(page, "", mrsValue);
        await smokeTestSuite.selectReportMetrics(page);
        await smokeTestSuite.reviewAndSubmitReport(page);

    });



    test('	Verify logout functionality', async ({ page }) => {
        filterParameter = "Display"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.logout(page);

    });


    test('Verify of Validate user consent in the context of a cookie banner', async ({ page }) => {
        filterParameter = "Display"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);

    });


    test('Verify Dashboard of Origin ', async ({ page }) => {
        filterParameter = "Display"
        const smokeTestSuite = new SmokeTestSuite(page);
        await smokeTestSuite.login(page);
        await smokeTestSuite.verifyDashboardOrigin(page);

    });


    test('Search Campaign Middleware - List Event Groups with CEL filters', async ({ request }) => {
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const SearchWithFilter = process.env.SearchWithFilter || props.SearchWithFilter;
        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', SearchWithFilter);
        payloadPath = path.join(__dirname, 'testData', 'eventFilterPayload.json');
        const fs = require('fs');
        if (!fs.existsSync(payloadPath)) {
            throw new Error(`File not found: ${payloadPath}`);
        }
        payload = loadJsonPayload(payloadPath);
        response = await postRequest(request, BASE_URI, SearchWithFilter, payload);
        expect([201]).toContain(response.status());
        const responseBody = await readResponseJson(response);
        expect(responseBody).toHaveProperty('eventGroups');
        expect(responseBody.eventGroups).toBeInstanceOf(Array);
        expect(responseBody.eventGroups.length).toBeGreaterThan(0);

        console.log(`✅ Found ${responseBody.eventGroups.length} event groups`);

        // Verify first event group structure (sample validation)
        const firstEventGroup = responseBody.eventGroups[0];

        // Required fields validation
        expect(firstEventGroup).toHaveProperty('name');
        expect(firstEventGroup.name).toBeTruthy();
        expect(typeof firstEventGroup.name).toBe('string');

        expect(firstEventGroup).toHaveProperty('cmmsEventGroup');
        expect(firstEventGroup.cmmsEventGroup).toBeTruthy();

        expect(firstEventGroup).toHaveProperty('cmmsDataProvider');
        expect(firstEventGroup.cmmsDataProvider).toBeTruthy();
        expect(firstEventGroup.cmmsDataProvider).toMatch(/^dataProviders\//);

        expect(firstEventGroup).toHaveProperty('eventGroupReferenceId');
        expect(firstEventGroup.eventGroupReferenceId).toBeTruthy();

        expect(firstEventGroup).toHaveProperty('eventTemplates');
        expect(firstEventGroup.eventTemplates).toBeInstanceOf(Array);
        expect(firstEventGroup.eventTemplates.length).toBeGreaterThan(0);

        // Validate eventTemplates contains valid media types
        const validMediaTypes = ['VIDEO', 'DISPLAY', 'OTHER'];
        firstEventGroup.eventTemplates.forEach((template: string) => {
            expect(validMediaTypes).toContain(template);
        });

        // Metadata validation
        expect(firstEventGroup).toHaveProperty('metadata');
        expect(firstEventGroup.metadata).toBeDefined();
        expect(firstEventGroup.metadata).toHaveProperty('displayName');
        expect(firstEventGroup.metadata).toHaveProperty('brand');
        expect(firstEventGroup.metadata).toHaveProperty('campaignStartDate');
        expect(firstEventGroup.metadata).toHaveProperty('campaignEndDate');

        // Date format validation (DD-MM-YYYY)
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        expect(firstEventGroup.metadata.campaignStartDate).toMatch(dateRegex);
        expect(firstEventGroup.metadata.campaignEndDate).toMatch(dateRegex);

        // Selected field validation
        expect(firstEventGroup).toHaveProperty('selected');
        expect(typeof firstEventGroup.selected).toBe('boolean');

        // Event Group ID validation
        expect(firstEventGroup).toHaveProperty('eventGroupId');
        expect(firstEventGroup.eventGroupId).toBeTruthy();

        // Validate all event groups have required fields
        responseBody.eventGroups.forEach((eventGroup: any, index: number) => {
            expect(eventGroup).toHaveProperty('name');
            expect(eventGroup).toHaveProperty('cmmsEventGroup');
            expect(eventGroup).toHaveProperty('cmmsDataProvider');
            expect(eventGroup).toHaveProperty('eventGroupReferenceId');
            expect(eventGroup).toHaveProperty('eventTemplates');
            expect(eventGroup).toHaveProperty('metadata');
            expect(eventGroup).toHaveProperty('selected');
            expect(eventGroup).toHaveProperty('eventGroupId');

            console.log(`✓ Event Group ${index + 1}: ${eventGroup.metadata?.displayName} - ${eventGroup.eventTemplates.join(', ')}`);
        });

        // Count event groups by media type
        const displayCount = responseBody.eventGroups.filter((eg: any) => eg.eventTemplates.includes('DISPLAY')).length;
        const videoCount = responseBody.eventGroups.filter((eg: any) => eg.eventTemplates.includes('VIDEO')).length;
        const otherCount = responseBody.eventGroups.filter((eg: any) => eg.eventTemplates.includes('OTHER')).length;

        console.log(`\n📊 Event Groups by Media Type:`);
        console.log(`   DISPLAY: ${displayCount}`);
        console.log(`   VIDEO: ${videoCount}`);
        console.log(`   OTHER: ${otherCount}`);
        console.log(`   TOTAL: ${responseBody.eventGroups.length}`);




        // Verify at least one event group from each expected data provider
      /*  const expectedDataProviders = ['dataProviders/SVf4UiJmHl4', 'dataProviders/XH0bvt2Z4Rs', 'dataProviders/GYPvFN2Z4Ug'];
        expectedDataProviders.forEach(provider => {
            const found = responseBody.eventGroups.some((eg: any) => eg.cmmsDataProvider === provider);
            expect(found).toBe(true);
            console.log(`✓ Found event groups from ${provider}`);
        });*/

        console.log('\n✅ Campaign search validation completed successfully');

    });
    test('Create Campaign Group - Display and Video - Duplicate Test', async ({ request }) => {
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const createCampaign = process.env.CreateCampaign || props.CreateCampaign;
        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', createCampaign);
        payloadPath = path.join(__dirname, 'testData', 'createCampaignGroup_tst.json');
        const fs = require('fs');
        if (!fs.existsSync(payloadPath)) {
            throw new Error(`File not found: ${payloadPath}`);
        }
        payload = loadJsonPayload(payloadPath);
        const now = new Date();
        const campaignName = `Campaign_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        (payload as any).campaignGroupName = campaignName;
        console.log('Request Body:', payload);
        response = await postRequest(request, BASE_URI, createCampaign, payload);
        expect([201]).toContain(response.status());
        const responseBody = await readResponseJson(response);

        console.log('Response Body:', JSON.stringify(responseBody, null, 2));

        // Verify response structure
        expect(responseBody).toHaveProperty('status');
        expect(responseBody.status).toBe('success');

        // Verify campaignGroup object exists
        expect(responseBody).toHaveProperty('campaignGroup');
        expect(responseBody.campaignGroup).toBeDefined();

        // Verify campaignGroup properties
        expect(responseBody.campaignGroup).toHaveProperty('campaignGroupId');
        expect(responseBody.campaignGroup.campaignGroupId).toBeTruthy();
        expect(typeof responseBody.campaignGroup.campaignGroupId).toBe('string');

        expect(responseBody.campaignGroup).toHaveProperty('campaignGroupName');
        expect(responseBody.campaignGroup.campaignGroupName).toBe(campaignName);

        expect(responseBody.campaignGroup).toHaveProperty('createdBy');
        expect(responseBody.campaignGroup.createdBy).toBeTruthy();

        expect(responseBody.campaignGroup).toHaveProperty('creationDate');
        expect(typeof responseBody.campaignGroup.creationDate).toBe('number');
        expect(responseBody.campaignGroup.creationDate).toBeGreaterThan(0);

        // Verify optional fields exist (even if null)
        expect(responseBody.campaignGroup).toHaveProperty('measurementConsumer');
        expect(responseBody.campaignGroup).toHaveProperty('campaignStartDate');
        expect(responseBody.campaignGroup).toHaveProperty('campaignEndDate');
        expect(responseBody.campaignGroup).toHaveProperty('mediaTypes');
        expect(responseBody.campaignGroup).toHaveProperty('dataSources');
        expect(responseBody.campaignGroup).toHaveProperty('externalEventGroupIdsByEdp');
        expect(responseBody.campaignGroup).toHaveProperty('eventGroupDataByEdp');

        console.log(`✅ Campaign Group created successfully with ID: ${responseBody.campaignGroup.campaignGroupId}`);


    });
    test('Create Campaign Group - Display and Video', async ({ request }) => {
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const createCampaign = process.env.CreateCampaign || props.CreateCampaign;
        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', createCampaign);
        payloadPath = path.join(__dirname, 'testData', 'createCampaignGroup_tst.json');
        const fs = require('fs');
        if (!fs.existsSync(payloadPath)) {
            throw new Error(`File not found: ${payloadPath}`);
        }
        payload = loadJsonPayload(payloadPath);
        const now = new Date();
        const campaignName = `Campaign_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        (payload as any).campaignGroupName = campaignName;
        console.log('Request Body:', payload);
        response = await postRequest(request, BASE_URI, createCampaign, payload);
        expect([201]).toContain(response.status());
        const responseBody = await readResponseJson(response);

        console.log('Response Body:', JSON.stringify(responseBody, null, 2));

        // Verify response structure
        expect(responseBody).toHaveProperty('status');
        expect(responseBody.status).toBe('success');

        // Verify campaignGroup object exists
        expect(responseBody).toHaveProperty('campaignGroup');
        expect(responseBody.campaignGroup).toBeDefined();

        // Verify campaignGroup properties
        expect(responseBody.campaignGroup).toHaveProperty('campaignGroupId');
        expect(responseBody.campaignGroup.campaignGroupId).toBeTruthy();
        expect(typeof responseBody.campaignGroup.campaignGroupId).toBe('string');

        expect(responseBody.campaignGroup).toHaveProperty('campaignGroupName');
        expect(responseBody.campaignGroup.campaignGroupName).toBe(campaignName);

        expect(responseBody.campaignGroup).toHaveProperty('createdBy');
        expect(responseBody.campaignGroup.createdBy).toBeTruthy();

        expect(responseBody.campaignGroup).toHaveProperty('creationDate');
        expect(typeof responseBody.campaignGroup.creationDate).toBe('number');
        expect(responseBody.campaignGroup.creationDate).toBeGreaterThan(0);

        // Verify optional fields exist (even if null)
        expect(responseBody.campaignGroup).toHaveProperty('measurementConsumer');
        expect(responseBody.campaignGroup).toHaveProperty('campaignStartDate');
        expect(responseBody.campaignGroup).toHaveProperty('campaignEndDate');
        expect(responseBody.campaignGroup).toHaveProperty('mediaTypes');
        expect(responseBody.campaignGroup).toHaveProperty('dataSources');
        expect(responseBody.campaignGroup).toHaveProperty('externalEventGroupIdsByEdp');
        expect(responseBody.campaignGroup).toHaveProperty('eventGroupDataByEdp');

        console.log(`✅ Campaign Group created successfully with ID: ${responseBody.campaignGroup.campaignGroupId}`);


    });
    test('Report Service - Create and Submit Report- CrossMedia Report - Vubox, Fastflix and QuickReel', async ({ request }) => {
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const CreateReport = process.env.CreateReport || props.CreateReport;
        let SubmitReport = process.env.SubmitReport || props.SubmitReport;

        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', CreateReport);
        payloadPath = path.join(__dirname, 'testData', 'createReport.json');
        const fs = require('fs');
        if (!fs.existsSync(payloadPath)) {
            throw new Error(`File not found: ${payloadPath}`);
        }
        payload = loadJsonPayload(payloadPath);
        const now = new Date();
        const reportName = `BatchReport_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const campaignName = `Campaign_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

        (payload as any).batchReportName = reportName;
        (payload as any).campaignGroupName = campaignName;
        console.log('Request Body:', payload);

        response = await postRequest(request, BASE_URI, CreateReport, payload);
        console.log('Response code:', response.status());
        expect([200]).toContain(response.status());
        console.log(`✅ Created the report with : $uuid`);


        const uuid = (await response.body()).toString();
        console.log('Response Body as Buffer String:', uuid);
        SubmitReport = SubmitReport.replace("{uuid}", uuid);
        response = await postRequest(request, BASE_URI, SubmitReport, payload);
        console.log('Response code:', response.status());
        expect([200]).toContain(response.status());

        // Get submit report response
        const submitResponseText = await response.text();
        console.log('Submit Report Response:', submitResponseText);

        // Validate workflow execution path format
        // Expected format: projects/{project-id}/locations/{location}/workflows/{workflow-name}/executions/{execution-id}
        const workflowPathRegex = /^projects\/\d+\/locations\/[\w-]+\/workflows\/[\w-]+\/executions\/[\w-]+$/;
        expect(submitResponseText).toMatch(workflowPathRegex);

        // Validate specific components
        expect(submitResponseText).toContain('projects/');
        expect(submitResponseText).toContain('/locations/');
        expect(submitResponseText).toContain('/workflows/');
        expect(submitResponseText).toContain('/executions/');

        // Validate location is europe-west2
        expect(submitResponseText).toContain('locations/europe-west2');

        // Validate workflow name
        expect(submitResponseText).toContain('workflows/origin-report-submission-v2_5');

        // Extract execution ID
        const executionIdMatch = submitResponseText.match(/executions\/([\w-]+)$/);
        expect(executionIdMatch).not.toBeNull();

        const executionId = executionIdMatch![1];
        console.log(`✅ Report submitted successfully`);
        console.log(`📋 Workflow Execution ID: ${executionId}`);
        console.log(`🔗 Full Workflow Path: ${submitResponseText}`);

        // Validate execution ID format (UUID format)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        expect(executionId).toMatch(uuidRegex);

        console.log('\n✅ Report creation and submission validation completed successfully');


    });


});

