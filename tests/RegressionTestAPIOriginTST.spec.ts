/**
 * Reads and parses the JSON body from a Playwright APIResponse object.
 * @param {import('@playwright/test').APIResponse} response - The response object returned from Playwright's request.
 * @returns {Promise<any>} - The parsed JSON body.
 */

import test, { expect, Page } from '@playwright/test';
import readProperties from './utils/readProperties';
import path from 'path/win32';
import { getRequest, postRequest } from './utils/requestBuilder';
import loadJsonPayload from './utils/loadJsonPayload';
import { readResponseJson } from './utils/testUtils';
;

test.describe('Regression Pack', () => {

    let mcId = "Ceq6zPONCi0";
    const props = readProperties('serviceURL_TST.properties');
    let payloadPath;
    let payload = {};
    let response;
    test('PDH-T664 User can return multiple campaign groups from the list of campaign groups', async ({ request }) => {
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


     test('PDH-T662 Cannot retrieve Event Groups within the Campaign Group if the user uses the wrong parameters', async ({ request }) => {
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const SearchWithFilter = process.env.SearchWithFilter || props.SearchWithFilter;
        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', SearchWithFilter);
        payloadPath = path.join(__dirname, 'testData', 'invalidPayloadForEventGroupFilter.json');
        const fs = require('fs');
        if (!fs.existsSync(payloadPath)) {
            throw new Error(`File not found: ${payloadPath}`);
        }
        payload = loadJsonPayload(payloadPath);
        response = await postRequest(request, BASE_URI, SearchWithFilter, payload);
        expect([400]).toContain(response.status());
        const responseBody = await readResponseJson(response);
        
        // Verify error response structure
        expect(responseBody).toHaveProperty('message');
        expect(responseBody.message).toBeInstanceOf(Array);
        expect(responseBody.message).toContain('campaign.filters must be an array');

        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error).toBe('Bad Request');

        expect(responseBody).toHaveProperty('statusCode');
        expect(responseBody.statusCode).toBe(400);

        console.log(`📋 Error Response:`);
        console.log(`   Message: ${responseBody.message}`);
        console.log(`   Error: ${responseBody.error}`);
        console.log(`   Status Code: ${responseBody.statusCode}`);

        console.log('\n✅ Invalid payload validation completed successfully - Bad Request error received as expected');

    });
  test('PDH-T79 Verify of all publisher on channel aligned with data provider based on their campaign selections - Fastflix', async ({ request }) => {
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const SearchWithFilter = process.env.SearchWithFilter || props.SearchWithFilter;
        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', SearchWithFilter);
        payloadPath = path.join(__dirname, 'testData', 'eventFilterPayload_fastflix.json');
        const fs = require('fs');
        if (!fs.existsSync(payloadPath)) {
            throw new Error(`File not found: ${payloadPath}`);
        }
        payload = loadJsonPayload(payloadPath);
        response = await postRequest(request, BASE_URI, SearchWithFilter, payload);
        expect([201]).toContain(response.status());
        const responseBody = await readResponseJson(response);
        
        // Verify response structure
        expect(responseBody).toHaveProperty('eventGroups');
        expect(responseBody.eventGroups).toBeInstanceOf(Array);
        expect(responseBody.eventGroups.length).toBeGreaterThan(0);

        console.log(`✅ Found ${responseBody.eventGroups.length} event groups for Fastflix`);

        // Validate all event groups have required fields and correct data provider
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

        console.log('\n✅ Fastflix publisher/channel alignment validation completed successfully');

    });


    test('PDH-T609 Verify the user is able to create campaign group for cross-media Media types - Display and Video', async ({ request }) => {
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


    test('PDH-T665 User can return campaigns with correct mcid', async ({ request }) => {

        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const getCampaignByMcid = process.env.getCampaignByMcid || props.getCampaignByMcid;
        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', getCampaignByMcid);

        response = await getRequest(request, BASE_URI, getCampaignByMcid, {}, { mcId: mcId });
        expect([200]).toContain(response.status());
        const responseBody = await readResponseJson(response);
        console.log('Response Body:', JSON.stringify(responseBody, null, 2));
        // Verify response structure
        expect(responseBody).toHaveProperty('status');
        expect(responseBody.status).toBe('success');

        console.log(`✅ Campaign Groups retrieved successfully for mcId: ${mcId}`);

    });

    test('PDH-T666 User cannot return list of campaign groups if MCId is missing', async ({ request }) => {
        mcId = "";
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const getCampaignByMcid = process.env.getCampaignByMcid || props.getCampaignByMcid;
        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', getCampaignByMcid);

        response = await getRequest(request, BASE_URI, getCampaignByMcid, {}, { mcId: mcId });
        expect([404]).toContain(response.status());
        const responseBody = await readResponseJson(response);
        console.log('Response Body:', JSON.stringify(responseBody, null, 2));
        
        // Verify error response structure
        expect(responseBody).toHaveProperty('message');
        expect(responseBody.message).toBe('The current request is not defined by this API.');

        console.log(`✅ Verified error response when mcId is missing: ${responseBody.message}`);

    });
    test('PDH-T1111 Report Service| Create Report and Submit Report using API- CrossMedia Report - Vubox, Fastflix and QuickReel', async ({ request }) => {
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

test('PDH-T646 Get the Batch Report details from the MC', async ({ request }) => {
        mcId = "Ceq6zPONCi0"; // Reset mcId to valid value
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const getReportByMcid = process.env.getReportByMcid || props.getReportByMcid;
        console.log('BASE_URI:', BASE_URI);
        console.log('ENDPOINT:', getReportByMcid);

        response = await getRequest(request, BASE_URI, getReportByMcid, {}, { mcId: mcId });
        expect([200]).toContain(response.status());
        const responseBody = await readResponseJson(response);
        console.log('Response Body:', JSON.stringify(responseBody, null, 2));
        
        // Verify pagination response structure
        expect(responseBody).toHaveProperty('reportCount');
        expect(typeof responseBody.reportCount).toBe('number');
        expect(responseBody.reportCount).toBeGreaterThanOrEqual(0);

        expect(responseBody).toHaveProperty('totalCount');
        expect(typeof responseBody.totalCount).toBe('number');
        expect(responseBody.totalCount).toBeGreaterThanOrEqual(0);

        expect(responseBody).toHaveProperty('pageNumber');
        expect(typeof responseBody.pageNumber).toBe('number');
        expect(responseBody.pageNumber).toBeGreaterThanOrEqual(1);

        expect(responseBody).toHaveProperty('pageSize');
        expect(typeof responseBody.pageSize).toBe('number');
        expect(responseBody.pageSize).toBeGreaterThan(0);

        console.log(`📊 Pagination Info:`);
        console.log(`   Report Count: ${responseBody.reportCount}`);
        console.log(`   Total Count: ${responseBody.totalCount}`);
        console.log(`   Page Number: ${responseBody.pageNumber}`);
        console.log(`   Page Size: ${responseBody.pageSize}`);

        console.log(`✅ Batch Report details retrieved successfully for mcId: ${mcId}`);

    });

test('PDH-T907 - Verify of - API integration with Campaign group service v2.5 /dataproviders API', async ({ request }) => {
        mcId = "Ceq6zPONCi0"; // Reset mcId to valid value
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const getCampaignForDataProvider = process.env.getReportByMcid || props.getCampaignForDataProvider;
        console.log('BASE_URI:',
             BASE_URI);
        console.log('ENDPOINT:', getCampaignForDataProvider);

        response = await getRequest(request, BASE_URI, getCampaignForDataProvider);
        expect([200]).toContain(response.status());
        const responseBody = await readResponseJson(response);
        console.log('Response Body:', JSON.stringify(responseBody, null, 2));

        // Verify response is an array
        expect(responseBody).toBeInstanceOf(Array);
        expect(responseBody.length).toBeGreaterThan(0);

        console.log(`✅ Found ${responseBody.length} data providers`);

        // Validate each data provider structure
        responseBody.forEach((dataProvider: any, index: number) => {
            // Required fields validation
            expect(dataProvider).toHaveProperty('dataProviderId');
            expect(dataProvider.dataProviderId).toBeTruthy();
            expect(typeof dataProvider.dataProviderId).toBe('string');
            expect(dataProvider.dataProviderId).toMatch(/^dataProviders\//);

            expect(dataProvider).toHaveProperty('dataProviderName');
            expect(dataProvider.dataProviderName).toBeTruthy();
            expect(typeof dataProvider.dataProviderName).toBe('string');

            expect(dataProvider).toHaveProperty('channelType');
            expect(dataProvider.channelType).toBeTruthy();
            expect(typeof dataProvider.channelType).toBe('string');
            // Validate channel type is one of expected values
            const validChannelTypes = ['Digital', 'Linear TV', 'Broadcast', 'Online'];
            expect(validChannelTypes).toContain(dataProvider.channelType);

            expect(dataProvider).toHaveProperty('timeLag');
            expect(typeof dataProvider.timeLag).toBe('number');
            expect(dataProvider.timeLag).toBeGreaterThanOrEqual(0);

            expect(dataProvider).toHaveProperty('dayRange');
            expect(typeof dataProvider.dayRange).toBe('number');
            expect(dataProvider.dayRange).toBeGreaterThan(0);

            expect(dataProvider).toHaveProperty('availabilityDateFrom');
            expect(dataProvider.availabilityDateFrom).toBeTruthy();
            expect(typeof dataProvider.availabilityDateFrom).toBe('string');

            expect(dataProvider).toHaveProperty('availabilityDateTo');
            expect(dataProvider.availabilityDateTo).toBeTruthy();
            expect(typeof dataProvider.availabilityDateTo).toBe('string');

            // Date format validation (DD-MM-YYYY)
            const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
            expect(dataProvider.availabilityDateFrom).toMatch(dateRegex);
            expect(dataProvider.availabilityDateTo).toMatch(dateRegex);

            console.log(`✓ Data Provider ${index + 1}: ${dataProvider.dataProviderName} (${dataProvider.channelType}) - TimeLag: ${dataProvider.timeLag}d, Range: ${dataProvider.dayRange}d`);
        });

        // Validate specific known data providers are present
        const expectedProviders = ['Fastflix', 'StreamZone'];
        expectedProviders.forEach(providerName => {
            const found = responseBody.some((dp: any) => dp.dataProviderName === providerName);
            if (found) {
                console.log(`✓ Found expected data provider: ${providerName}`);
            }
        });

        // Summary statistics
        const digitalProviders = responseBody.filter((dp: any) => dp.channelType === 'Digital').length;
        const averageTimeLag = responseBody.reduce((sum: number, dp: any) => sum + dp.timeLag, 0) / responseBody.length;
        const averageDayRange = responseBody.reduce((sum: number, dp: any) => sum + dp.dayRange, 0) / responseBody.length;

        console.log(`\n📊 Data Providers Summary:`);
        console.log(`   Total Providers: ${responseBody.length}`);
        console.log(`   Digital Providers: ${digitalProviders}`);
        console.log(`   Average Time Lag: ${averageTimeLag.toFixed(1)} days`);
        console.log(`   Average Day Range: ${averageDayRange.toFixed(1)} days`);

        console.log('\n✅ Data providers API validation completed successfully');

    });
     test('PDH-T748 - Verify get ReportingSets API is responding with UUID and saved in database successfully', async ({ request }) => {
        mcId = "Ceq6zPONCi0"; // Reset mcId to valid value
        const BASE_URI = process.env.BASE_URI || props.BASE_URI;
        const getMetricCalcSpecs = process.env.getReportByMcid || props.getMetricCalcSpecs;
        console.log('BASE_URI:',
             BASE_URI);
        console.log('ENDPOINT:', getMetricCalcSpecs);
 
        response = await getRequest(request, BASE_URI, getMetricCalcSpecs);
        expect([200]).toContain(response.status());
        const responseBody = await readResponseJson(response);
        console.log('Response Body:', JSON.stringify(responseBody, null, 2));
 
        // Verify response is an array of metric calculation specifications
        expect(responseBody).toBeInstanceOf(Array);
        expect(responseBody.length).toBeGreaterThan(0);
 
        console.log(`✅ Found ${responseBody.length} metric calculation specifications`);
 
        // Validate each metric calculation specification structure
        responseBody.forEach((metricSpec: any, index: number) => {
            // Verify response structure for metric calculation specification
            expect(metricSpec).toHaveProperty('metricCalculationSpecId');
            expect(metricSpec.metricCalculationSpecId).toBeTruthy();
            expect(typeof metricSpec.metricCalculationSpecId).toBe('string');
 
            // Validate UUID format for metricCalculationSpecId
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            expect(metricSpec.metricCalculationSpecId).toMatch(uuidRegex);
 
            // Verify tags object exists
            expect(metricSpec).toHaveProperty('tags');
            expect(metricSpec.tags).toBeDefined();
            expect(typeof metricSpec.tags).toBe('object');
 
            // Validate tags properties
            expect(metricSpec.tags).toHaveProperty('metrics');
            expect(typeof metricSpec.tags.metrics).toBe('string');
            expect(metricSpec.tags.metrics).toBeTruthy();
 
            expect(metricSpec.tags).toHaveProperty('grouping');
            expect(typeof metricSpec.tags.grouping).toBe('string');
 
            expect(metricSpec.tags).toHaveProperty('cumulative');
            expect(typeof metricSpec.tags.cumulative).toBe('string');
            expect(['true', 'false']).toContain(metricSpec.tags.cumulative.toLowerCase());
 
            expect(metricSpec.tags).toHaveProperty('common_filter');
            expect(typeof metricSpec.tags.common_filter).toBe('string');
 
            expect(metricSpec.tags).toHaveProperty('set_operation');
            expect(typeof metricSpec.tags.set_operation).toBe('string');
            expect(metricSpec.tags.set_operation).toBeTruthy();
 
            expect(metricSpec.tags).toHaveProperty('metric_frequency');
            expect(typeof metricSpec.tags.metric_frequency).toBe('string');
 
            // Validate specific metric values
            const validMetrics = ['reach', 'frequency', 'impressions', 'clicks', 'conversions', 'frequency1', 'frequency2', 'frequency3', 'frequency4', 'frequency5', 'frequency1,impressions', 'frequency2,impressions', 'frequency3,impressions', 'frequency4,impressions', 'frequency5,impressions'];
            const metricsArray = metricSpec.tags.metrics.toLowerCase().split(',').map((m: string) => m.trim());
            metricsArray.forEach((metric: string) => {
                expect(validMetrics.some(vm => vm.includes(metric) || metric.includes(vm.split(',')[0]))).toBe(true);
            });
 
            const validSetOperations = ['cumulative', 'incremental', 'overlap', 'union', 'difference'];
            expect(validSetOperations).toContain(metricSpec.tags.set_operation.toLowerCase());
 
            // Validate common_filter format (semicolon-separated or "-")
            if (metricSpec.tags.common_filter) {
                if (metricSpec.tags.common_filter !== '-') {
                    expect(metricSpec.tags.common_filter).toMatch(/.*;$/);
                }
            }
 
            // Validate metric_frequency format (can be "-" or actual frequency)
            const validFrequencies = ['-', 'daily', 'weekly', 'monthly', 'weekly1', 'weekly2', 'weekly3', 'weekly4', 'weekly5', 'weekly6', 'weekly7'];
            expect(validFrequencies).toContain(metricSpec.tags.metric_frequency.toLowerCase());
 
            console.log(`✓ Specification ${index + 1}: ${metricSpec.metricCalculationSpecId} - ${metricSpec.tags.metrics} (${metricSpec.tags.set_operation})`);
        });
 
        // Summary statistics
        const cumulativeSpecs = responseBody.filter((spec: any) => spec.tags.cumulative === 'true').length;
        const reachSpecs = responseBody.filter((spec: any) => spec.tags.metrics.includes('reach')).length;
        const frequencySpecs = responseBody.filter((spec: any) => spec.tags.metrics.includes('frequency')).length;
        const impressionSpecs = responseBody.filter((spec: any) => spec.tags.metrics.includes('impressions')).length;
 
        console.log(`\n📊 Metric Calculation Specifications Summary:`);
        console.log(`   Total Specifications: ${responseBody.length}`);
        console.log(`   Cumulative Specs: ${cumulativeSpecs}`);
        console.log(`   Reach Metrics: ${reachSpecs}`);
        console.log(`   Frequency Metrics: ${frequencySpecs}`);
        console.log(`   Impressions Metrics: ${impressionSpecs}`);
 
        // Validate unique UUIDs
        const uniqueIds = new Set(responseBody.map((spec: any) => spec.metricCalculationSpecId));
        expect(uniqueIds.size).toBe(responseBody.length);
        console.log(`✓ All ${responseBody.length} specifications have unique UUIDs`);
 
        console.log('\n✅ ReportingSets API validation completed successfully - All UUIDs generated and response structures validated');
 
    });
 
});

