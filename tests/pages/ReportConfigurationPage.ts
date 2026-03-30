import { Page, Locator, expect } from '@playwright/test';
import { FilterCalendar } from '../utils/FilterCalendar';

export class ReportConfigurationPage {
  readonly page: Page;

  // Date filter elements
  readonly startDate: Locator;
  readonly endDate: Locator;

  // Demographics elements
  readonly demographicsDropdown: Locator;
  readonly selectAllDemographics: Locator;
  readonly AllAdults: Locator;
  readonly AllAdultsImg: Locator;

  // Viewability/Measured Impression elements
  readonly viewabilityDropdown: Locator;
  readonly viewability100Checkbox: Locator;
  readonly continueFiltersBtn: Locator;

  // Report Metrics elements
  readonly totalReachSliderStart: Locator;
  readonly totalReachSliderEnd: Locator;
  readonly uniqueReachCheckbox: Locator;
  readonly averageFrequencyCheckbox: Locator;
  readonly impressionsCheckbox: Locator;
  readonly continueMetricsBtn: Locator;
  readonly cumulativeReachCheckbox: Locator;

  // Review and Submit elements
  readonly submitReportBtn: Locator;
  readonly auditBanner: Locator;
  readonly reportingMetrics: Locator;
  readonly demographicsAquila: Locator;

  readonly returnToHomeBtn: Locator;
  // Incremental Reach elements
  readonly measureIncrementalReachHeading: Locator;
  readonly measureIncrementalReachDescription: Locator;
  readonly measureIncrementalReachByLabel: Locator;
  readonly measureIncrementalReachDropdown: Locator;
  // Add these locators to the constructor:
  readonly anchorLabel: Locator;
  readonly measuredEntity2Label: Locator;

  // Add these locators to the constructor:
  readonly anchorDropdown: Locator;
  readonly measuredEntity2: Locator;
  readonly anchorFirstOption: Locator;



  // Add these locators to the constructor:
  readonly incrementalReachDropdown: Locator;
  readonly measuredEntityOption: Locator;
  constructor(page: Page) {
    this.page = page;

    // Date filter elements
    this.startDate = page.locator("//*[@id='report-filters-start-date']");
    this.endDate = page.locator("//*[@id='report-filters-end-date']");

    // Demographics elements
    this.demographicsDropdown = page.locator('//label[text()="Select one or more segments to include in a single audience group."]/following-sibling::img');
    this.selectAllDemographics = page.locator('//label[text()="Select all (All adults)"]/span');
    this.AllAdults = page.locator('//div[text()="All adults"]');
    this.AllAdultsImg = page.locator('//label[text()="All Adults"]/following-sibling::img');

    this.demographicsAquila = page.locator('//label[text()="Please Select"]/following-sibling::img');


    // Viewability/Measured Impression elements
    this.viewabilityDropdown = page.locator('#viewability-dropdown');
    this.viewability100Checkbox = page.locator("//*[@id='select-0']/div/div");
    this.continueFiltersBtn = page.locator("#report-filters-continue-btn");

    // Report Metrics elements
    this.totalReachSliderStart = page.locator('//*[@class="slider-wrapper"]/input[1]');
    this.totalReachSliderEnd = page.locator('//*[@class="slider-wrapper"]/input[2]');
    this.uniqueReachCheckbox = page.locator("//*[text()='Unique Reach']");
    this.averageFrequencyCheckbox = page.locator("//*[text()='Average Frequency']");
    this.impressionsCheckbox = page.locator("//*[text()='Impressions']");
    this.continueMetricsBtn = page.locator('#report-metrics-continue-btn');
    this.cumulativeReachCheckbox = page.locator("//*[@class='checkbox-title' and text()='Cumulative Reach data']/parent::*/following-sibling::span");

    // In constructor:
    this.incrementalReachDropdown = page.locator('#incermentalreach-dropdown > img');
    this.measuredEntityOption = page.locator('//*[text()="Measured Entity"]');
    // In constructor:
    this.measureIncrementalReachHeading = page.locator('//div[text()="Measure incremental reach"]');
    this.measureIncrementalReachDescription = page.locator('//div[text()="Use the following field if you would like to include incremental reach in your report. There must be at least 2 measured entities in your campaign."]');
    this.measureIncrementalReachByLabel = page.locator('//*[text()="Measure Incremental Reach by"]');
    this.measureIncrementalReachDropdown = page.locator('#measure-incremental-reach-dropdown'); // Update selector based on actual element
    // In constructor:
    this.anchorLabel = page.locator('//*[text()="Anchor"]');
    this.measuredEntity2Label = page.locator('//*[text()="Measured Entity 2"]');
    // In constructor:
    this.anchorDropdown = page.locator('#anchor-dropdown > img');
    this.measuredEntity2 = page.locator('#measured-entity-2-dropdown > img');

    this.anchorFirstOption = page.locator('#select-0 > div > div');


    // Review and Submit elements
    this.submitReportBtn = page.locator("//button[text()='Submit']");
    this.returnToHomeBtn = page.locator("//*[text()='Return to home']");
    this.auditBanner = page.locator('//*[@class="disclaimer-description"]');
    this.reportingMetrics = page.locator('//*[@class="textarea-field reporting-param "]');
  }

  async selectFilters(filterParameter: string): Promise<void> {
    const startDateValue = await this.startDate.textContent();

    let outputDays: string;

    if (filterParameter === 'Video') {
      outputDays = FilterCalendar.addDaysToStringDate(startDateValue || '', 0, 'dd MMM yyyy');
    } else if (filterParameter === 'XXX') {
      outputDays = FilterCalendar.addDaysToStringDate(startDateValue || '', 2, 'dd MMM yyyy');
    } else {
      outputDays = FilterCalendar.addDaysToStringDate(startDateValue || '', 2, 'dd MMM yyyy');
    }


    const EndDateValue = await this.endDate.textContent();
    console.log(`📅 Cal Start date: ${startDateValue}`);
    console.log(`📅 Cal End date: ${EndDateValue}`);
    const startDateParsed = new Date(startDateValue || '');
    const endDateParsed = new Date(EndDateValue || '');
    expect(startDateParsed.getTime()).toBeLessThanOrEqual(endDateParsed.getTime());

    console.log(`📅 Start date: ${outputDays}`);
    await this.endDate.click();

    console.log(`🗓️ Navigating to calendar date: ${outputDays}`);
    await FilterCalendar.selectDateOfCalendar(this.page, outputDays, '#report-filters-end-date > img');

    const selectedDate = FilterCalendar.verifyDateSelection(this.page, outputDays);
    console.log(`✅ Date successfully selected: ${selectedDate}`);
    await FilterCalendar.closeCalendar(this.page);
  }

  async selectFiltersForCumulative(filterParameter: string): Promise<void> {
    const startDateValue = await this.startDate.textContent();

    let outputDays: string;

    if (filterParameter === 'Video') {
      outputDays = FilterCalendar.addDaysToStringDate(startDateValue || '', 0, 'dd MMM yyyy');
    } else if (filterParameter === 'XXX') {
      outputDays = FilterCalendar.addDaysToStringDate(startDateValue || '', 8, 'dd MMM yyyy');
    } else {
      outputDays = FilterCalendar.addDaysToStringDate(startDateValue || '', 8, 'dd MMM yyyy');
    }


    const EndDateValue = await this.endDate.textContent();
    console.log(`📅 Cal Start date: ${startDateValue}`);
    console.log(`📅 Cal End date: ${EndDateValue}`);
    const startDateParsed = new Date(startDateValue || '');
    const endDateParsed = new Date(EndDateValue || '');
    expect(startDateParsed.getTime()).toBeLessThanOrEqual(endDateParsed.getTime());

    console.log(`📅 Start date: ${outputDays}`);
    await this.endDate.click();

    console.log(`🗓️ Navigating to calendar date: ${outputDays}`);
    await FilterCalendar.selectDateOfCalendar(this.page, outputDays, '#report-filters-end-date > img');

    const selectedDate = FilterCalendar.verifyDateSelection(this.page, outputDays);
    console.log(`✅ Date successfully selected: ${selectedDate}`);
    await FilterCalendar.closeCalendar(this.page);
  }

  async selectDemographics(): Promise<void> {
    if (await this.demographicsDropdown.isVisible()) {
      await this.demographicsDropdown.click();
      if (await this.selectAllDemographics.isVisible()) {
        await this.selectAllDemographics.click();
        await this.AllAdultsImg.click();
      } else {
        await this.AllAdults.click();
      }
    }
    console.log('✓ Demographics selected');
  }

  async selectDemographicsAquila(): Promise<void> {
    if (await this.demographicsAquila.isVisible()) {
      await this.demographicsAquila.click();
      if (await this.selectAllDemographics.isVisible()) {
        await this.selectAllDemographics.click();
        await this.AllAdultsImg.click();
      } else {
        await this.AllAdults.click();
      }
    }
    console.log('✓ Demographics selected');
  }

  async selectMeasuredImpression(mediaType: string, mrsValue: string): Promise<void> {
    await this.page.waitForTimeout(500);
    if (mediaType.includes('Display') || mediaType.includes('Video')) {
      await this.page.waitForTimeout(500);
      if (await this.viewabilityDropdown.isVisible()) {
        await this.page.waitForTimeout(300);
        await this.viewabilityDropdown.click();
        await this.page.waitForTimeout(1500);

        if (mrsValue === '100') {
          await this.page.waitForTimeout(300);
          await this.viewability100Checkbox.click();
          await this.page.waitForTimeout(100);
          console.log('✓ Viewability 100% selected');
        } else if (mrsValue === '50') {
          await this.page.waitForTimeout(100);
          const mrc50Checkbox = this.page.locator("//*[@id='select-1']/div/div");
          await this.page.waitForTimeout(100);
          await mrc50Checkbox.click();
          await this.page.waitForTimeout(100);
          console.log('✓ MRC 50% selected');
        } else if (mrsValue === 'CrossMedia') {
          await this.page.waitForTimeout(100);
          const mrcStandardVideoCheckbox = this.page.locator('//label[text()="MRC Standard for Video ads (100% of pixels in view for at least 2 seconds)."]/span');
          await this.page.waitForTimeout(100);
          await mrcStandardVideoCheckbox.click();
          await this.page.waitForTimeout(100);
          console.log('✓ MRC Standard for Video ads (CrossMedia) selected');
        }
        await this.page.waitForTimeout(100);
      }
    } else {

      
    }
    console.log('✓ Measured Impression selected');

    //await this.continueFiltersBtn.waitFor({ state: 'visible' });
    //await expect(this.continueFiltersBtn).toBeEnabled();
    //await this.continueFiltersBtn.click();

    await this.continueFiltersBtn.click();

  }

  async selectReportMetrics(): Promise<void> {
    console.log('🎯 Starting report metrics selection...');

    const totalReachStartValue = await this.totalReachSliderStart.inputValue();
    const totalReachEndValue = await this.totalReachSliderEnd.inputValue();
    console.log(`📊 Total Reach Percentage Start value: ${totalReachStartValue}`);
    console.log(`📊 Total Reach Percentage End value: ${totalReachEndValue}`);

    await this.uniqueReachCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Unique Reach selected via JavaScript click');

    await this.averageFrequencyCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Average Frequency selected via JavaScript click');

    await this.impressionsCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Impressions selected via JavaScript click');

    await this.continueMetricsBtn.first().scrollIntoViewIfNeeded();
    await this.continueMetricsBtn.first().click();
    console.log('✅ Report metrics selection completed successfully');
  }


  async selectReportMetricsCrossMedia(): Promise<void> {
    console.log('🎯 Starting report metrics selection...');

    const totalReachStartValue = await this.totalReachSliderStart.inputValue();
    const totalReachEndValue = await this.totalReachSliderEnd.inputValue();
    console.log(`📊 Total Reach Percentage Start value: ${totalReachStartValue}`);
    console.log(`📊 Total Reach Percentage End value: ${totalReachEndValue}`);

    await this.uniqueReachCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Unique Reach selected via JavaScript click');

    await this.averageFrequencyCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Average Frequency selected via JavaScript click');

    await this.impressionsCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Impressions selected via JavaScript click');

    await this.verifyMeasureIncrementalReachSection();
    await this.selectMeasuredEntityForIncrementalReach();


    await this.continueMetricsBtn.first().scrollIntoViewIfNeeded();
    await this.continueMetricsBtn.first().click();
    console.log('✅ Report metrics selection completed successfully');
  }

  async selectMeasuredEntityForIncrementalReach(): Promise<void> {
    console.log('🎯 Selecting Measured Entity for Incremental Reach...');

    // Click on the dropdown to open it
    await this.incrementalReachDropdown.click();
    console.log('✓ Incremental Reach dropdown opened');

    // Select Measured Entity option
    await this.measuredEntityOption.click();
    console.log('✓ Measured Entity selected');

    // Verify Anchor label is visible
    await expect(this.anchorLabel).toBeVisible();
    console.log('✓ "Anchor" label is visible');

    // Verify Measured Entity 2 label is visible
    await expect(this.measuredEntity2Label).toBeVisible();
    console.log('✓ "Measured Entity 2" label is visible');

    // Click on the Anchor dropdown to open it
    await this.anchorDropdown.click();
    console.log('✓ Anchor dropdown opened');
    // Select the first option
    await this.anchorFirstOption.click();

    await this.measuredEntity2.click();
    // Select the first option
    await this.anchorFirstOption.click();
    console.log('✓ Anchor option selected');

    console.log('✅ Incremental Reach selection completed');
  }

  async verifyMeasureIncrementalReachSection(): Promise<void> {
    console.log('🎯 Verifying Measure Incremental Reach section...');

    await expect(this.measureIncrementalReachHeading).toBeVisible();
    console.log('✓ Heading "Measure incremental reach" is visible');

    await expect(this.measureIncrementalReachDescription).toBeVisible();
    console.log('✓ Description text is visible');

    await expect(this.measureIncrementalReachByLabel).toBeVisible();
    console.log('✓ Label "Measure Incremental Reach by" is visible');

    console.log('✅ Measure Incremental Reach section verified successfully');
  }
  async validateReportMetrics(): Promise<void> {
    console.log('🎯 Starting report metrics validation...');

    const totalReachStartValue = await this.totalReachSliderStart.inputValue();
    const totalReachEndValue = await this.totalReachSliderEnd.inputValue();
    console.log(`📊 Total Reach Percentage Start value: ${totalReachStartValue}`);
    console.log(`📊 Total Reach Percentage End value: ${totalReachEndValue}`);

    await this.uniqueReachCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Unique Reach selected via JavaScript click');

    await this.averageFrequencyCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Average Frequency selected via JavaScript click');

    await this.impressionsCheckbox.first().evaluate((element: any) => element.click());
    console.log('✓ Impressions selected via JavaScript click');

    await this.continueMetricsBtn.first().scrollIntoViewIfNeeded();

    await this.cumulativeReachCheckbox.waitFor({ state: 'visible', timeout: 1000 });
    await expect(this.cumulativeReachCheckbox).not.toBeEditable();

    console.log('✅ Report metrics page validated successfully');
  }

  async reviewAndSubmitReport(): Promise<void> {
    await this.submitReportBtn.waitFor({ state: 'visible', timeout: 1000 });
    await expect(this.submitReportBtn).toBeEnabled();

    if (await this.submitReportBtn.isVisible()) {
      await this.submitReportBtn.click();
    }

   // await this.returnToHomeBtn.waitFor({ state: 'visible', timeout: 2000 });
    //await this.page.waitForTimeout(8000);
    if (await this.returnToHomeBtn.isVisible()) {
      await this.returnToHomeBtn.click();
    }
    console.log('✓ Report Submitted successfully');
  }


  async validateAuditBanner(): Promise<void> {
    await this.auditBanner.waitFor({ state: 'visible', timeout: 1000 });
  }
  async validateReviewAndSubmitReport(): Promise<void> {
    await this.submitReportBtn.waitFor({ state: 'visible', timeout: 1000 });
    await expect(this.submitReportBtn).toBeEnabled();
    await expect(this.auditBanner).toBeEnabled();

    const reportingMetricsText = (await this.reportingMetrics.textContent())?.trim();
    console.log('Reporting Metrics Text:', reportingMetricsText);
    expect(reportingMetricsText).toContain('Total Reach (1+) % to (15+) %');
    console.log('✓  Audit banner is displayed on Review report page');
  }
}