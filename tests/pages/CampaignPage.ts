import { Page, Locator, expect } from '@playwright/test';

export class CampaignPage {
  verifyReportNameErrorValidation(errorMessage: string) {
    throw new Error('Method not implemented.');
  }
  readonly page: Page;

  // Campaign Group elements
  readonly campaignNameInput: Locator;
  readonly searchInput: Locator;
  readonly pageTitle: Locator;


  // Media Type elements
  readonly mediaTypeDropdown: Locator;
  readonly displayCheckbox: Locator;
  readonly videoCheckbox: Locator;
  readonly otherCheckbox: Locator;
  readonly displayCheckboxSelected: Locator;
  readonly videoCheckboxSelected: Locator;
  readonly otherCheckboxSelected: Locator;

  // Measured Entity elements
  readonly measuredEntityDropdown: Locator;
  readonly fastflixCheckbox: Locator;
  readonly vuboxCheckbox: Locator;
  readonly tvCheckbox: Locator;
  readonly quickReelCheckbox: Locator;
  readonly firstCheckboxSelected: Locator;
  readonly secondCheckboxSelected: Locator;
  readonly thirdCheckboxSelected: Locator;
  readonly forthCheckboxSelected: Locator;

  // Campaign list elements
  readonly firstCampaignRow: Locator;

  // Search Results elements
  readonly searchResultsTitle: Locator;
  readonly searchResultsDescription: Locator;
  readonly downloadResultsButton: Locator;

  // Selected Adverts elements
  readonly selectedAdvertsTitle: Locator;
  readonly selectedAdvertsDescription: Locator;
  readonly downloadSelectionButton: Locator;

  // Action buttons
  readonly applyFiltersBtn: Locator;
  readonly saveCampaignGroupBtn: Locator;
  readonly continueBtn: Locator;


  readonly selectFirstMeasuredEntity : Locator;
  readonly selectSecondMeasuredEntity : Locator;
   readonly selectThirdMeasuredEntity : Locator;
    readonly selectForthMeasuredEntity : Locator;


  constructor(page: Page) {
    this.page = page;

    // Campaign Group elements
    this.campaignNameInput = page.locator('//*[@id="campaign-group-name-input"]');
    this.searchInput = page.locator('#search-input');
    this.pageTitle = page.locator('[data-loc-id="page-title"]');
    // Media Type elements
    this.mediaTypeDropdown = page.locator('//*[@id="media-type-dropdown"]/label');
    this.displayCheckbox = page.locator('//*[@id="select-0"]/div/label/span');
    this.videoCheckbox = page.locator('//*[@id="select-1"]/div/label/span');
    this.otherCheckbox = page.locator('//*[@id="select-2"]/div/label/span');
    this.displayCheckboxSelected = page.locator('#select-0 > div.selected-label.menu-item');
    this.videoCheckboxSelected = page.locator('#select-1 > div.selected-label.menu-item');
    this.otherCheckboxSelected = page.locator('#select-2 > div.selected-label.menu-item');

    // Measured Entity elements
    this.measuredEntityDropdown = page.locator('//*[@id="measured-entities-dropdown"]/label');
    this.fastflixCheckbox = page.locator('//label[text()="FastFlix"]/span');
    this.vuboxCheckbox = page.locator('//label[text()="Vubox"]/span');
    this.tvCheckbox = page.locator('//label[text()="Linear TV"]/span');
    this.quickReelCheckbox = page.locator('//label[text()="QuickReel"]/span');
    this.firstCheckboxSelected = page.locator('#select-0 > div.selected-label.menu-item');
    this.secondCheckboxSelected = page.locator('#select-1 > div.selected-label.menu-item');
    this.thirdCheckboxSelected = page.locator('#select-2 > div.selected-label.menu-item');
    this.forthCheckboxSelected = page.locator('#select-3 > div.selected-label.menu-item');


    this.selectFirstMeasuredEntity = page.locator('//*[@id="select-0"]/div/label/span');       
    this.selectSecondMeasuredEntity = page.locator('//*[@id="select-1"]/div/label/span');
    this.selectThirdMeasuredEntity = page.locator('//*[@id="select-2"]/div/label/span');
    this.selectForthMeasuredEntity = page.locator('//*[@id="select-3"]/div/label/span');

    // Campaign list elements
    this.firstCampaignRow = page.locator("//input[@id='campaign-group-1']");

    // Search Results elements
    this.searchResultsTitle = page.locator('//*[text()="Search results"]');
    this.searchResultsDescription = page.locator('//*[contains(text(), "The filtered search results for adverts are shown below.")]');
    this.downloadResultsButton = page.locator('//button[contains(text(), "Download results")] | //*[contains(text(), "Download results")]');

    // Selected Adverts elements
    this.selectedAdvertsTitle = page.locator('//*[text()="Selected Adverts"]');
    this.selectedAdvertsDescription = page.locator('//*[contains(text(), "The adverts you have selected are shown below")]');
    this.downloadSelectionButton = page.locator('//button[contains(text(), "Download selection")] | //*[contains(text(), "Download selection")]');

    // Action buttons
    this.applyFiltersBtn = page.locator('//button[text()="Search"]');
    this.saveCampaignGroupBtn = page.locator("#save-campaign-group-btn");
    this.continueBtn = page.locator("//*[@id='continue-btn']");
  }

  async createCampaignGroup(campaignPrefix: string): Promise<string> {
    const currentDateTime = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const campaignName = `${campaignPrefix}_${currentDateTime}`;

    await this.campaignNameInput.fill(campaignName);
    console.log(`✓ Campaign group created with name: ${campaignName}`);

    return campaignName;
  }

  async createCampaignGroupForNameValidation(campaignPrefix: string): Promise<string> {

    const campaignName = `${campaignPrefix}`;

    await this.campaignNameInput.fill(campaignName);
    console.log(`✓ Campaign group created with name: ${campaignName}`);

    return campaignName;
  }

  /**
   * Validates the Search Results section header texts
   * Verifies "Search results" title and "Results for your advert search appear below, with any filters applied." description
   */
  async validateSearchResultsText(): Promise<void> {
    console.log('🔍 Validating Search Results Text...');

    // Validate "Search results" title
    await expect(this.searchResultsTitle).toBeVisible();
    const titleText = await this.searchResultsTitle.textContent();
    console.log(`✓ "Search results" title is visible: "${titleText?.trim()}"`);

    // Validate description text
    await expect(this.searchResultsDescription).toBeVisible();
    const descriptionText = await this.searchResultsDescription.textContent();
    console.log(`✓ Description text is visible: "${descriptionText?.trim()}"`);

    // Validate Download results button (optional - may not always be visible)
    const downloadVisible = await this.downloadResultsButton.isVisible();
    if (downloadVisible) {
      console.log('✓ "Download results" button is visible');
    } else {
      console.log('ℹ️ "Download results" button is not visible');
    }

    console.log('✅ Search Results Text validated successfully');
  }

  /**
   * Validates table headers and fetches all row data from the table
   * No parameters required - fetches and validates data directly from the screen
   */
  async validateTableWithData(): Promise<Array<Record<string, string>>> {
    console.log('🔍 Validating Table Headers and Fetching Data...');

    // Wait for table to be fully loaded
    await this.page.waitForTimeout(1000);

    // Expected headers
    const expectedHeaders = ['Advert', 'Brand', 'Measured Entity', 'Media Type', 'TV On Air Dates', 'Start Date', 'End Date'];

    // Validate table headers
    const tableHeaders = this.page.locator('.table-with-data thead th, table thead th, table tr th');
    await tableHeaders.first().waitFor({ state: 'visible', timeout: 5000 });


    const headerCount = await tableHeaders.count();
    const actualHeaders: string[] = [];

    for (let i = 0; i < headerCount; i++) {
      const headerText = await tableHeaders.nth(i).textContent();
      actualHeaders.push(headerText?.trim() || '');
      await this.page.waitForTimeout(100); // Small delay between header reads
    }

    console.log(`✓ Table headers found: ${actualHeaders.join(', ')}`);

    // Check if optional "TV On Air Dates" column exists
    const hasTvOnAirDatesHeader = actualHeaders.some(h => h.includes('TV On Air Dates'));

    // Validate each expected header is present
    for (const expectedHeader of expectedHeaders) {
      if (expectedHeader === 'TV On Air Dates' && !hasTvOnAirDatesHeader) {
        console.log('ℹ️ Optional header "TV On Air Dates" not present - skipping mandatory validation');
        continue;
      }

      const headerFound = actualHeaders.some(h => h.includes(expectedHeader));
      expect(headerFound, `Expected header "${expectedHeader}" to be present`).toBe(true);
      console.log(`✓ Header "${expectedHeader}" is present`);
      await this.page.waitForTimeout(100); // Small delay between validations
    }

    // Fetch all table rows
    const tableRows = this.page.locator('.table-with-data tbody tr, table tbody tr');
    await this.page.waitForTimeout(500);
    const rowCount = await tableRows.count() - 1;

    const tableData: Array<Record<string, string>> = [];

    console.log(`\n📊 Fetching ${rowCount} rows from table...`);
    console.log('═'.repeat(60));

    await this.page.waitForTimeout(500); // Wait before starting row iteration

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      await this.page.waitForTimeout(300); // Delay between each row
      const row = tableRows.nth(rowIndex);
      const cells = row.locator('td');
      const cellCount = await cells.count();

      const rowData: Record<string, string> = {};

      // Map cells to headers
      for (let cellIndex = 0; cellIndex < cellCount && cellIndex < actualHeaders.length; cellIndex++) {
        const cellText = await cells.nth(cellIndex).textContent();
        const headerKey = actualHeaders[cellIndex] || `column_${cellIndex}`;

        // If headerKey is Advert, trim the "Add to campaign" prefix
        if (headerKey === 'Advert' || headerKey.includes('Advert')) {
          const trimmedValue = (cellText?.trim() || '').replace(/^Add to campaign/i, '').trim();
          rowData[headerKey] = trimmedValue;
        } else {
          rowData[headerKey] = cellText?.trim() || '';
        }
        //await this.page.waitForTimeout(50); // Small delay between cell reads
      }

      tableData.push(rowData);

      // Log row data in a formatted box
      console.log(`┌─────────────────────────────────────────────────────┐`);
      console.log(`│ ROW ${rowIndex + 1}`.padEnd(54) + '│');
      console.log(`├─────────────────────────────────────────────────────┤`);
      console.log(`│ Advert         : ${(rowData['Advert'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ Brand          : ${(rowData['Brand'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ Measured Entity: ${(rowData['Measured Entity'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ Media Type     : ${(rowData['Media Type'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ TV On Air Dates: ${(rowData['TV On Air Dates'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ Start Date     : ${(rowData['Start Date'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ End Date       : ${(rowData['End Date'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`└─────────────────────────────────────────────────────┘`);
      await this.page.waitForTimeout(200); // Delay after logging each row
    }

    await this.page.waitForTimeout(500); // Wait before validation

    // Validate that each row has required data
    for (let i = 0; i < tableData.length; i++) {
      await this.page.waitForTimeout(200); // Delay between row validations
      const rowData = tableData[i];

      // Validate Advert is not empty
      const advertValue = rowData['Advert'] || '';
      expect(advertValue.trim().length, `Row ${i + 1}: Advert should not be empty`).toBeGreaterThan(0);

      // Validate Brand is not empty
      const brandValue = rowData['Brand'] || '';
      expect(brandValue.trim().length, `Row ${i + 1}: Brand should not be empty`).toBeGreaterThan(0);

      // Validate Measured Entity is not empty
      const entityValue = rowData['Measured Entity'] || '';
      expect(entityValue.trim().length, `Row ${i + 1}: Measured Entity should not be empty`).toBeGreaterThan(0);

      // Validate Media Type is not empty
      const mediaTypeValue = rowData['Media Type'] || '';
      expect(mediaTypeValue.trim().length, `Row ${i + 1}: Media Type should not be empty`).toBeGreaterThan(0);

      // Validate TV On Air Dates only when column is available
      if (hasTvOnAirDatesHeader) {
        const tvOnAirDatesValue = rowData['TV On Air Dates'] || '';
        expect(tvOnAirDatesValue.trim(), `Row ${i + 1}: TV On Air Dates should be "-"`).toBe('-');
        console.log(`✓ Row ${i + 1}: TV On Air Dates validated - "${tvOnAirDatesValue}"`);
      } else {
        console.log(`ℹ️ Row ${i + 1}: "TV On Air Dates" column not present - skipping validation`);
      }


      // Validate Start Date format (DD MMM YYYY, e.g., "18 Mar 2025" or "06 Nov 2025")
      const startDateValue = rowData['Start Date'] || '';
      const dateFormatRegex = /^(0?[1-9]|[12][0-9]|3[01])\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;
      expect(startDateValue.trim(), `Row ${i + 1}: Start Date should match date format`).toMatch(dateFormatRegex);
      console.log(`✓ Row ${i + 1}: Start Date format validated - "${startDateValue}"`);

      // Validate End Date format (DD MMM YYYY, e.g., "18 Mar 2025" or "06 Nov 2025")
      const endDateValue = rowData['End Date'] || '';
      expect(endDateValue.trim(), `Row ${i + 1}: End Date should match date format`).toMatch(dateFormatRegex);
      console.log(`✓ Row ${i + 1}: End Date format validated - "${endDateValue}"`);


      console.log(`✓ Row ${i + 1}: All required fields validated`);
    }

    console.log('═'.repeat(80));
    console.log(`\n✅ Table validation completed - ${tableData.length} rows fetched and validated`);

    return tableData;
  }

  async validateTableWithDataforAquila(): Promise<Array<Record<string, string>>> {
    console.log('🔍 Validating Table Headers and Fetching Data...');

    // Wait for table to be fully loaded
    await this.page.waitForTimeout(1000);

    // Expected headers
    const expectedHeaders = ['Advert', 'Brand', 'Measured Entity', 'Media Type', 'TV On Air Dates', 'Start Date', 'End Date'];

    // Validate table headers
    const tableHeaders = this.page.locator('.table-with-data thead th, table thead th, table tr th');
    await tableHeaders.first().waitFor({ state: 'visible', timeout: 5000 });


    const headerCount = await tableHeaders.count();
    const actualHeaders: string[] = [];

    for (let i = 0; i < headerCount; i++) {
      const headerText = await tableHeaders.nth(i).textContent();
      actualHeaders.push(headerText?.trim() || '');
      await this.page.waitForTimeout(100); // Small delay between header reads
    }

    console.log(`✓ Table headers found: ${actualHeaders.join(', ')}`);

    // Check if optional "TV On Air Dates" column exists
    const hasTvOnAirDatesHeader = actualHeaders.some(h => h.includes('TV On Air Dates'));

    // Validate each expected header is present
    for (const expectedHeader of expectedHeaders) {
      if (expectedHeader === 'TV On Air Dates' && !hasTvOnAirDatesHeader) {
        console.log('ℹ️ Optional header "TV On Air Dates" not present - skipping mandatory validation');
        continue;
      }

      const headerFound = actualHeaders.some(h => h.includes(expectedHeader));
      expect(headerFound, `Expected header "${expectedHeader}" to be present`).toBe(true);
      console.log(`✓ Header "${expectedHeader}" is present`);
      await this.page.waitForTimeout(100); // Small delay between validations
    }

    // Fetch all table rows
    const tableRows = this.page.locator('.table-with-data tbody tr, table tbody tr');
    await this.page.waitForTimeout(500);
    const rowCount = await tableRows.count() - 1;

    const tableData: Array<Record<string, string>> = [];

    console.log(`\n📊 Fetching ${rowCount} rows from table...`);
    console.log('═'.repeat(60));

    await this.page.waitForTimeout(500); // Wait before starting row iteration

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      await this.page.waitForTimeout(300); // Delay between each row
      const row = tableRows.nth(rowIndex);
      const cells = row.locator('td');
      const cellCount = await cells.count();

      const rowData: Record<string, string> = {};

      // Map cells to headers
      for (let cellIndex = 0; cellIndex < cellCount && cellIndex < actualHeaders.length; cellIndex++) {
        const cellText = await cells.nth(cellIndex).textContent();
        const headerKey = actualHeaders[cellIndex] || `column_${cellIndex}`;

        // If headerKey is Advert, trim the "Add to campaign" prefix
        if (headerKey === 'Advert' || headerKey.includes('Advert')) {
          const trimmedValue = (cellText?.trim() || '').replace(/^Add to campaign/i, '').trim();
          rowData[headerKey] = trimmedValue;
        } else {
          rowData[headerKey] = cellText?.trim() || '';
        }
        //await this.page.waitForTimeout(50); // Small delay between cell reads
      }

      tableData.push(rowData);

      // Log row data in a formatted box
      console.log(`┌─────────────────────────────────────────────────────┐`);
      console.log(`│ ROW ${rowIndex + 1}`.padEnd(54) + '│');
      console.log(`├─────────────────────────────────────────────────────┤`);
      console.log(`│ Advert         : ${(rowData['Advert'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ Brand          : ${(rowData['Brand'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ Measured Entity: ${(rowData['Measured Entity'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ Media Type     : ${(rowData['Media Type'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ TV On Air Dates: ${(rowData['TV On Air Dates'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ Start Date     : ${(rowData['Start Date'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`│ End Date       : ${(rowData['End Date'] || '-').substring(0, 35).padEnd(35)}│`);
      console.log(`└─────────────────────────────────────────────────────┘`);
      await this.page.waitForTimeout(200); // Delay after logging each row
    }

    await this.page.waitForTimeout(500); // Wait before validation

    // Validate that each row has required data
    for (let i = 0; i < tableData.length; i++) {
      await this.page.waitForTimeout(200); // Delay between row validations
      const rowData = tableData[i];

      // Validate Advert is not empty
      const advertValue = rowData['Advert'] || '';
      expect(advertValue.trim().length, `Row ${i + 1}: Advert should not be empty`).toBeGreaterThan(0);

      // Validate Brand is not empty
      const brandValue = rowData['Brand'] || '';
      expect(brandValue.trim().length, `Row ${i + 1}: Brand should not be empty`).toBeGreaterThan(0);

      // Validate Measured Entity is not empty
      const entityValue = rowData['Measured Entity'] || '';
      expect(entityValue.trim().length, `Row ${i + 1}: Measured Entity should not be empty`).toBeGreaterThan(0);

      // Validate Media Type is not empty
      const mediaTypeValue = rowData['Media Type'] || '';
      expect(mediaTypeValue.trim().length, `Row ${i + 1}: Media Type should not be empty`).toBeGreaterThan(0);

      // Validate TV On Air Dates only when column is available
      if (hasTvOnAirDatesHeader) {
        const tvOnAirDatesValue = rowData['TV On Air Dates'] || '';
        expect(tvOnAirDatesValue.trim(), `Row ${i + 1}: TV On Air Dates should be "-"`).toBe('-');
        console.log(`✓ Row ${i + 1}: TV On Air Dates validated - "${tvOnAirDatesValue}"`);
      } else {
        console.log(`ℹ️ Row ${i + 1}: "TV On Air Dates" column not present - skipping validation`);
      }


      const startDateValue = rowData['Start Date'] || '';
      const dateFormatRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(0?[1-9]|[12][0-9]|3[01])\s\d{4}$/;
      expect(startDateValue.trim(), `Row ${i + 1}: Start Date should match date format`).toMatch(dateFormatRegex);
      console.log(`✓ Row ${i + 1}: Start Date format validated - "${startDateValue}"`);

      // Validate End Date format (MMM DD YYYY, e.g., "Mar 18 2025")
      const endDateValue = rowData['End Date'] || '';
      expect(endDateValue.trim(), `Row ${i + 1}: End Date should match date format`).toMatch(dateFormatRegex);
      console.log(`✓ Row ${i + 1}: End Date format validated - "${endDateValue}"`);

      console.log(`✓ Row ${i + 1}: All required fields validated`);
    }

    console.log('═'.repeat(80));
    console.log(`\n✅ Table validation completed - ${tableData.length} rows fetched and validated`);

    return tableData;
  }


  async verifyMediaTypeNotPreselected(mediaType: string): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.mediaTypeDropdown.click();

    let isSelected = false;

    if (mediaType === 'Display') {
      isSelected = await this.displayCheckboxSelected.isVisible();
    } else if (mediaType === 'Video') {
      isSelected = await this.videoCheckboxSelected.isVisible();
    } else if (mediaType === 'Other') {
      isSelected = await this.otherCheckboxSelected.isVisible();
    }

    expect(isSelected).toBe(false);

    console.log(`✓ Verified: ${mediaType} is not preselected`);


  }

  async selectSingleMediaType(mediaType: string): Promise<void> {
    await this.mediaTypeDropdown.click();

    if (mediaType === 'Display') {
      if (await this.videoCheckboxSelected.isVisible()) {
        await this.videoCheckboxSelected.click();
      }
      if (await this.otherCheckboxSelected.isVisible()) {
        await this.otherCheckboxSelected.click();
      }
      await this.displayCheckbox.click();
      console.log('✓ Display checkbox clicked');
    }

    if (mediaType === 'Video') {
      if (await this.displayCheckboxSelected.isVisible()) {
        await this.displayCheckboxSelected.click();
      }
      if (await this.otherCheckboxSelected.isVisible()) {
        await this.otherCheckboxSelected.click();
      }
      await this.videoCheckbox.click();
      console.log('✓ Video checkbox clicked');
    }

    if (mediaType === 'Other') {
      if (await this.displayCheckboxSelected.isVisible()) {
        await this.displayCheckboxSelected.click();
      }
      if (await this.videoCheckboxSelected.isVisible()) {
        await this.videoCheckboxSelected.click();
      }
      await this.otherCheckbox.click();
      console.log('✓ Other checkbox clicked');
    }

    await this.page.locator('body').click();
    console.log('✓ Clicked on screen to defocus');
    console.log(`✓ ${mediaType} media type selected`);

    await expect(this.applyFiltersBtn).toBeVisible();
    await expect(this.applyFiltersBtn).toBeEnabled();
    await this.applyFiltersBtn.click();
    console.log('✓ Search the Campaign group');
  }

  async selectMeasuredEntity(measuredEntity: string): Promise<void> {
    await this.measuredEntityDropdown.click();

    if (measuredEntity === 'QuickReel') {
      if (await this.firstCheckboxSelected.isVisible()) {
        await this.firstCheckboxSelected.click();
      }
      if (await this.secondCheckboxSelected.isVisible()) {
        await this.secondCheckboxSelected.click();
      }
      if (await this.thirdCheckboxSelected.isVisible()) {
        await this.thirdCheckboxSelected.click();
      }
      await this.quickReelCheckbox.click();
      console.log('✓ QuickReel checkbox clicked');
    }

    if (measuredEntity === 'Linear TV') {
      if (await this.firstCheckboxSelected.isVisible()) {
        await this.firstCheckboxSelected.click();
      }
      if (await this.secondCheckboxSelected.isVisible()) {
        await this.secondCheckboxSelected.click();
      }
      if (await this.forthCheckboxSelected.isVisible()) {
        await this.forthCheckboxSelected.click();
      }
      await this.tvCheckbox.click();
      console.log('✓Linear TV checkbox clicked');
    }

    if (measuredEntity === 'Vubox') {
      if (await this.firstCheckboxSelected.isVisible()) {
        await this.firstCheckboxSelected.click();
      }
      if (await this.thirdCheckboxSelected.isVisible()) {
        await this.thirdCheckboxSelected.click();
      }
      if (await this.forthCheckboxSelected.isVisible()) {
        await this.forthCheckboxSelected.click();
      }
      await this.vuboxCheckbox.click();
      console.log('✓ Vubox checkbox clicked');
    }

    if (measuredEntity === 'Fastflix') {
      if (await this.secondCheckboxSelected.isVisible()) {
        await this.secondCheckboxSelected.click();
      }
      if (await this.thirdCheckboxSelected.isVisible()) {
        await this.thirdCheckboxSelected.click();
      }
      if (await this.forthCheckboxSelected.isVisible()) {
        await this.forthCheckboxSelected.click();
      }
      await this.fastflixCheckbox.click();
      console.log('✓ Fastflix checkbox clicked');
    }

    if (measuredEntity === 'All') {
      if (await this.firstCheckboxSelected.isVisible()) {
        await this.firstCheckboxSelected.click();
      }
      if (await this.secondCheckboxSelected.isVisible()) {
        await this.secondCheckboxSelected.click();
      }
      if (await this.thirdCheckboxSelected.isVisible()) {
        await this.thirdCheckboxSelected.click();
      }
      if (await this.forthCheckboxSelected.isVisible()) {
        await this.forthCheckboxSelected.click();
      }
      await this.fastflixCheckbox.click();
      await this.vuboxCheckbox.click();
      await this.tvCheckbox.click();
      await this.quickReelCheckbox.click();
    }

    console.log('✓ Clicked on screen to defocus');
    console.log(`✓ ${measuredEntity} measured entity selected`);

    await this.applyFiltersBtn.click();
    console.log('✓ Search the Campaign group');
  }

  async selectMultipleMeasuredEntity(measuredEntity: string): Promise<void> {
    await this.measuredEntityDropdown.click();

    if (measuredEntity === 'Linear TV') {
      if (await this.secondCheckboxSelected.isVisible()) {
        await this.secondCheckboxSelected.click();
      }
      if (await this.thirdCheckboxSelected.isVisible()) {
        await this.thirdCheckboxSelected.click();
      }
      if (await this.forthCheckboxSelected.isVisible()) {
        await this.forthCheckboxSelected.click();
      }
      await this.selectFirstMeasuredEntity.click();
      console.log('✓ select first checkbox clicked');
    }

      if (measuredEntity === 'Fastflix') {
      if (await this.firstCheckboxSelected.isVisible()) {
        await this.firstCheckboxSelected.click();
      }
      if (await this.thirdCheckboxSelected.isVisible()) {
        await this.thirdCheckboxSelected.click();
      }
      if (await this.forthCheckboxSelected.isVisible()) {
        await this.forthCheckboxSelected.click();
      }
      await this.selectSecondMeasuredEntity.click();
      console.log('✓ select second checkbox clicked');
    }
    

    if (measuredEntity === 'Vubox') {
      if (await this.firstCheckboxSelected.isVisible()) {
        await this.firstCheckboxSelected.click();
      }
      if (await this.secondCheckboxSelected.isVisible()) {
        await this.secondCheckboxSelected.click();
      }
      if (await this.forthCheckboxSelected.isVisible()) {
        await this.forthCheckboxSelected.click();
      }
      await this.selectThirdMeasuredEntity.click();
      console.log('✓ select third checkbox clicked');
    }

  
    if (measuredEntity === 'QuickReel') {
      if (await this.firstCheckboxSelected.isVisible()) {
        await this.firstCheckboxSelected.click();
      }
      if (await this.secondCheckboxSelected.isVisible()) {
        await this.secondCheckboxSelected.click();
      }
      if (await this.thirdCheckboxSelected.isVisible()) {
        await this.thirdCheckboxSelected.click();
      }
      await this.selectForthMeasuredEntity.click();
      console.log('✓Linear Forth checkbox clicked');
    }

    if (measuredEntity === 'All') {
      if (await this.firstCheckboxSelected.isVisible()) {
        await this.firstCheckboxSelected.click();
      }
      if (await this.secondCheckboxSelected.isVisible()) {
        await this.secondCheckboxSelected.click();
      }
      if (await this.thirdCheckboxSelected.isVisible()) {
        await this.thirdCheckboxSelected.click();
      }
      if (await this.forthCheckboxSelected.isVisible()) {
        await this.forthCheckboxSelected.click();
      }
      await this.fastflixCheckbox.click();
      await this.vuboxCheckbox.click();
      await this.tvCheckbox.click();
      await this.quickReelCheckbox.click();
    }

    console.log('✓ Clicked on screen to defocus');
    console.log(`✓ ${measuredEntity} measured entity selected`);

    await this.applyFiltersBtn.click();
    console.log('✓ Search the Campaign group');
  }
  async selectCampaignUsingAdvertOrBrand(advert: string, brand: string): Promise<void> {
    const searchTerms: string[] = [advert, brand];
    for (const searchByAdvertOrBrand of searchTerms) {
      await this.searchInput.clear();
      await this.searchInput.fill(searchByAdvertOrBrand);
      console.log(`✓ Searching for: ${searchByAdvertOrBrand}`);
      await this.applyFiltersBtn.click();
      await expect(this.firstCampaignRow).toBeVisible({ timeout: 1000 });
      await this.page.waitForTimeout(1000);
    }

    console.log('✓ Search the Campaign group with Advert and Brand');
  }
  async checkTheTitle(advert: string): Promise<void> {
    const titleText = await this.pageTitle.textContent();
    expect(titleText).toContain(advert);
    console.log(`✓ Page title "${titleText}" contains advert: ${advert}`);
  }


  async selectFirstRowFromList(): Promise<Locator> {

    await expect(this.firstCampaignRow).toBeVisible({ timeout: 15000 });
    await this.page.waitForTimeout(1000);
    await this.firstCampaignRow.click();
    console.log('✓ First row from data list selected');

    return this.firstCampaignRow;
  }

  async validateCampaignTableSearchResults(): Promise<void> {
    await this.validateSearchResultsText();
    await this.validateTableWithData();
  }


  async validateCampaignTableSearchResultsforAquila(): Promise<void> {
    await this.validateSearchResultsText();
    await this.validateTableWithDataforAquila();
  }


  async validateCampaignTableSelectAdverts(): Promise<void> {
    await this.validateSelectedAdvertsText();
    await this.validateSelectedAdvertsTable();
  }
  async validateCampaignTableSelectAdvertsforAquila(): Promise<void> {
    await this.validateSelectedAdvertsText();
    await this.validateSelectedAdvertsTableforAquila();
  }

  /**
   * Validates the Selected Adverts table with expected data
   * Validates headers and row data matching expected values
   */
  async validateSelectedAdvertsTable(): Promise<void> {
    console.log('🔍 Validating Selected Adverts Table...');
    await this.page.waitForTimeout(500);

    // Wait for table to be fully loaded

    // Expected headers ("TV On Air Dates" is optional)
    const expectedHeaders = ['Advert', 'Brand', 'Measured Entity', 'Media Type', 'TV On Air Dates', 'Start date', 'End date'];


    // Validate table headers
    const tableHeaders = this.page.locator('.table-with-data thead th, table thead th, table tr th');

    await tableHeaders.first().waitFor({ state: 'visible', timeout: 5000 });


    const headerCount = await tableHeaders.count();
    await this.page.waitForTimeout(300);
    const actualHeaders: string[] = [];

    for (let i = 0; i < headerCount; i++) {
      const headerText = await tableHeaders.nth(i).textContent();
      actualHeaders.push(headerText?.trim() || '');
    }

    console.log(`✓ Table headers found: ${actualHeaders.join(', ')}`);

    // Check if optional "TV On Air Dates" column exists
    const hasTvOnAirDatesHeader = actualHeaders.some(h => h.includes('TV On Air Dates'));

    // Validate each expected header is present
    for (const expectedHeader of expectedHeaders) {
      if (expectedHeader === 'TV On Air Dates' && !hasTvOnAirDatesHeader) {
        console.log('ℹ️ Optional header "TV On Air Dates" not present in Selected Adverts table - skipping mandatory validation');
        continue;
      }

      const headerFound = actualHeaders.some(h => h.includes(expectedHeader));
      expect(headerFound, `Expected header "${expectedHeader}" to be present`).toBe(true);
      console.log(`✓ Header "${expectedHeader}" is present`);
    }


    // Fetch table row data
    const tableRows = this.page.locator('.table-with-data tbody tr, table tbody tr');

    const rowCount = await tableRows.count();


    console.log(`\n📊 Found ${rowCount} row(s) in Selected Adverts table`);
    console.log(`📊 Fetching rows starting from row 11 (after first 10 rows)...`);
    console.log('═'.repeat(60));
    await this.page.waitForTimeout(500);

    // Skip first 10 rows and get data starting from row 11 (index 10)
    const startIndex = 10;

    const row = tableRows.nth(startIndex);

    const cells = row.locator('td');

    const cellCount = await cells.count();


    const rowData: Record<string, string> = {};

    // Map cells to headers
    for (let cellIndex = 0; cellIndex < cellCount && cellIndex < actualHeaders.length; cellIndex++) {

      const cellText = await cells.nth(cellIndex).textContent();
      const headerKey = actualHeaders[cellIndex] || `column_${cellIndex}`;

      // If headerKey is Advert, trim the "Remove from campaign" or similar prefix
      if (headerKey === 'Advert' || headerKey.includes('Advert')) {
        const trimmedValue = (cellText?.trim() || '').replace(/^(Remove from campaign)/i, '').trim();
        rowData[headerKey] = trimmedValue;
      } else {
        rowData[headerKey] = cellText?.trim() || '';
      }
      await this.page.waitForTimeout(100);
    }

    // Log row data in a formatted box
    console.log(`┌─────────────────────────────────────────────────────┐`);
    console.log(`│ SELECTED ADVERT ROW`.padEnd(54) + '│');
    console.log(`├─────────────────────────────────────────────────────┤`);
    console.log(`│ Advert         : ${(rowData['Advert'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ Brand          : ${(rowData['Brand'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ Measured Entity: ${(rowData['Measured Entity'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ Media Type     : ${(rowData['Media Type'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ TV On Air Dates: ${(rowData['TV On Air Dates'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ Start date     : ${(rowData['Start date'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ End date       : ${(rowData['End date'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`└─────────────────────────────────────────────────────┘`);

    await this.page.waitForTimeout(500);

    // Validate that each field is not empty
    console.log('\n🔍 Validating row data is not empty...');
    await this.page.waitForTimeout(500);

    // Validate Advert is not empty
    await this.page.waitForTimeout(300);
    const advertValue = rowData['Advert'] || '';
    expect(advertValue.trim().length, 'Advert should not be empty').toBeGreaterThan(0);
    console.log(`✓ Advert: "${advertValue}" - validated`);
    // Validate Brand is not empty   
    const brandValue = rowData['Brand'] || '';
    await this.page.waitForTimeout(200);
    expect(brandValue.trim().length, 'Brand should not be empty').toBeGreaterThan(0);
    console.log(`✓ Brand: "${brandValue}" - validated`);

    // Validate Measured Entity is not empty
    const entityValue = rowData['Measured Entity'] || '';
    await this.page.waitForTimeout(200);
    expect(entityValue.trim().length, 'Measured Entity should not be empty').toBeGreaterThan(0);
    console.log(`✓ Measured Entity: "${entityValue}" - validated`);

    // Validate Media Type is not empty

    const mediaTypeValue = rowData['Media Type'] || '';
    await this.page.waitForTimeout(200);
    expect(mediaTypeValue.trim().length, 'Media Type should not be empty').toBeGreaterThan(0);
    console.log(`✓ Media Type: "${mediaTypeValue}" - validated`);
    // Validate TV On Air Dates is "-"

    const tvOnAirDatesValue = rowData['TV On Air Dates'] || '';
    await this.page.waitForTimeout(200);
    if (hasTvOnAirDatesHeader) {
      expect(tvOnAirDatesValue.trim(), 'TV On Air Dates should be "-"').toBe('-');
      console.log(`✓ TV On Air Dates: "${tvOnAirDatesValue}" - validated`);
    } else {
      console.log('ℹ️ "TV On Air Dates" column not present in Selected Adverts table - skipping validation');
    }

    // Validate Start date format (dd MMM yyyy, e.g., "18 Mar 2025" or "06 Nov 2025")
    const startDateValue = rowData['Start Date'] || '';
      const dateFormatRegex = /^(0?[1-9]|[12][0-9]|3[01])\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;
    expect(startDateValue.trim(), 'Start date should match date format').toMatch(dateFormatRegex);
    console.log(`✓ Start date: "${startDateValue}" - format validated`);

    // Validate End date format (dd MMM yyyy, e.g., "18 Mar 2025" or "06 Nov 2025")
    const endDateValue = rowData['End Date'] || '';
    expect(endDateValue.trim(), 'End date should match date format').toMatch(dateFormatRegex);
    console.log(`✓ End date: "${endDateValue}" - format validated`);


    console.log('═'.repeat(60));

    console.log('✅ Selected Adverts Table validated successfully');
  }


  /**
  * Validates the Selected Adverts table with expected data
  * Validates headers and row data matching expected values
  */
  async validateSelectedAdvertsTableforAquila(): Promise<void> {
    console.log('🔍 Validating Selected Adverts Table...');
    await this.page.waitForTimeout(500);

    // Wait for table to be fully loaded

    // Expected headers ("TV On Air Dates" is optional)
    const expectedHeaders = ['Advert', 'Brand', 'Measured Entity', 'Media Type', 'TV On Air Dates', 'Start Date', 'End Date'];


    // Validate table headers
    const tableHeaders = this.page.locator('.table-with-data thead th, table thead th, table tr th');

    await tableHeaders.first().waitFor({ state: 'visible', timeout: 5000 });


    const headerCount = await tableHeaders.count();
    await this.page.waitForTimeout(300);
    const actualHeaders: string[] = [];

    for (let i = 0; i < headerCount; i++) {
      const headerText = await tableHeaders.nth(i).textContent();
      actualHeaders.push(headerText?.trim() || '');
    }

    console.log(`✓ Table headers found: ${actualHeaders.join(', ')}`);

    // Check if optional "TV On Air Dates" column exists
    const hasTvOnAirDatesHeader = actualHeaders.some(h => h.includes('TV On Air Dates'));

    // Validate each expected header is present
    for (const expectedHeader of expectedHeaders) {
      if (expectedHeader === 'TV On Air Dates' && !hasTvOnAirDatesHeader) {
        console.log('ℹ️ Optional header "TV On Air Dates" not present in Selected Adverts table - skipping mandatory validation');
        continue;
      }

      const headerFound = actualHeaders.some(h => h.includes(expectedHeader));
      expect(headerFound, `Expected header "${expectedHeader}" to be present`).toBe(true);
      console.log(`✓ Header "${expectedHeader}" is present`);
    }


    // Fetch table row data
    const tableRows = this.page.locator('.table-with-data tbody tr, table tbody tr');

    const rowCount = await tableRows.count();


    console.log(`\n📊 Found ${rowCount} row(s) in Selected Adverts table`);
    console.log(`📊 Fetching rows starting from row 11 (after first 10 rows)...`);
    console.log('═'.repeat(60));
    await this.page.waitForTimeout(500);

    // Skip first 10 rows and get data starting from row 11 (index 10)
    const startIndex = 10;

    const row = tableRows.nth(startIndex);

    const cells = row.locator('td');

    const cellCount = await cells.count();


    const rowData: Record<string, string> = {};

    // Map cells to headers
    for (let cellIndex = 0; cellIndex < cellCount && cellIndex < actualHeaders.length; cellIndex++) {

      const cellText = await cells.nth(cellIndex).textContent();
      const headerKey = actualHeaders[cellIndex] || `column_${cellIndex}`;

      // If headerKey is Advert, trim the "Remove from campaign" or similar prefix
      if (headerKey === 'Advert' || headerKey.includes('Advert')) {
        const trimmedValue = (cellText?.trim() || '').replace(/^(Remove from campaign)/i, '').trim();
        rowData[headerKey] = trimmedValue;
      } else {
        rowData[headerKey] = cellText?.trim() || '';
      }
      await this.page.waitForTimeout(100);
    }

    // Log row data in a formatted box
    console.log(`┌─────────────────────────────────────────────────────┐`);
    console.log(`│ SELECTED ADVERT ROW`.padEnd(54) + '│');
    console.log(`├─────────────────────────────────────────────────────┤`);
    console.log(`│ Advert         : ${(rowData['Advert'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ Brand          : ${(rowData['Brand'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ Measured Entity: ${(rowData['Measured Entity'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ Media Type     : ${(rowData['Media Type'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ TV On Air Dates: ${(rowData['TV On Air Dates'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ Start date     : ${(rowData['Start Date'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`│ End date       : ${(rowData['End Date'] || '-').substring(0, 35).padEnd(35)}│`);
    console.log(`└─────────────────────────────────────────────────────┘`);

    await this.page.waitForTimeout(500);

    // Validate that each field is not empty
    console.log('\n🔍 Validating row data is not empty...');
    await this.page.waitForTimeout(500);

    // Validate Advert is not empty
    await this.page.waitForTimeout(300);
    const advertValue = rowData['Advert'] || '';
    expect(advertValue.trim().length, 'Advert should not be empty').toBeGreaterThan(0);
    console.log(`✓ Advert: "${advertValue}" - validated`);
    // Validate Brand is not empty   
    const brandValue = rowData['Brand'] || '';
    await this.page.waitForTimeout(200);
    expect(brandValue.trim().length, 'Brand should not be empty').toBeGreaterThan(0);
    console.log(`✓ Brand: "${brandValue}" - validated`);

    // Validate Measured Entity is not empty
    const entityValue = rowData['Measured Entity'] || '';
    await this.page.waitForTimeout(200);
    expect(entityValue.trim().length, 'Measured Entity should not be empty').toBeGreaterThan(0);
    console.log(`✓ Measured Entity: "${entityValue}" - validated`);

    // Validate Media Type is not empty

    const mediaTypeValue = rowData['Media Type'] || '';
    await this.page.waitForTimeout(200);
    expect(mediaTypeValue.trim().length, 'Media Type should not be empty').toBeGreaterThan(0);
    console.log(`✓ Media Type: "${mediaTypeValue}" - validated`);
    // Validate TV On Air Dates is "-"

    const tvOnAirDatesValue = rowData['TV On Air Dates'] || '';
    await this.page.waitForTimeout(200);
    if (hasTvOnAirDatesHeader) {
      expect(tvOnAirDatesValue.trim(), 'TV On Air Dates should be "-"').toBe('-');
      console.log(`✓ TV On Air Dates: "${tvOnAirDatesValue}" - validated`);
    } else {
      console.log('ℹ️ "TV On Air Dates" column not present in Selected Adverts table - skipping validation');
    }

    // Validate Start date format (MMM DD YYYY, e.g., "Mar 18 2025")
    const startDateValue = rowData['Start Date'] || '';
    const dateFormatRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(0?[1-9]|[12][0-9]|3[01])\s\d{4}$/;
    expect(startDateValue.trim(), 'Start date should match date format').toMatch(dateFormatRegex);
    console.log(`✓ Start date: "${startDateValue}" - format validated`);

    // Validate End date format (MMM DD YYYY, e.g., "Mar 18 2025")
    const endDateValue = rowData['End Date'] || '';
    expect(endDateValue.trim(), 'End date should match date format').toMatch(dateFormatRegex);
    console.log(`✓ End date: "${endDateValue}" - format validated`);


    console.log('═'.repeat(60));

    console.log('✅ Selected Adverts Table validated successfully');
  }

  /**
   * Validates the Selected Adverts section header texts
   * Verifies "Selected Adverts" title and "The adverts you have selected are shown below." description
   */
  async validateSelectedAdvertsText(): Promise<void> {
    console.log('🔍 Validating Selected Adverts Text...');

    // Wait for page to load
    await this.page.waitForTimeout(1000);

    // Validate "Selected Adverts" title
    await expect(this.selectedAdvertsTitle).toBeVisible();
    const titleText = await this.selectedAdvertsTitle.textContent();
    console.log(`✓ "Selected Adverts" title is visible: "${titleText?.trim()}"`);
    await this.page.waitForTimeout(500);

    // Validate description text
    await expect(this.selectedAdvertsDescription).toBeVisible();
    const descriptionText = await this.selectedAdvertsDescription.textContent();
    console.log(`✓ Description text is visible: "${descriptionText?.trim()}"`);
    await this.page.waitForTimeout(500);

    // Validate Download selection button
    const downloadVisible = await this.downloadSelectionButton.isVisible();
    if (downloadVisible) {
      console.log('✓ "Download selection" button is visible');
    } else {
      console.log('ℹ️ "Download selection" button is not visible');
    }
    await this.page.waitForTimeout(500);

    console.log('✅ Selected Adverts Text validated successfully');
  }

  async verifyCampaignNameRequiredError(expectedErrorMessage: string): Promise<void> {
    const errorMessage = this.page.locator(`//*[text()="${expectedErrorMessage}"]`);
    //
    //(`//*[contains(text(), "${expectedErrorMessage}")]`);

    await expect(errorMessage).toBeVisible();
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain(expectedErrorMessage);

    console.log(`✓ Verified: Campaign name required error displayed - "${errorText}"`);
  }


  async selectfirstcolumnAndDeselect(): Promise<Locator> {
    await expect(this.firstCampaignRow).toBeVisible({ timeout: 15000 });
    await this.firstCampaignRow.click();
    console.log('✓ First row from data list selected');

    // Verify the checkbox is selected (checked)
    await expect(this.firstCampaignRow).toBeChecked();
    console.log('✓ Verified: First row checkbox is selected');

    // Deselect the checkbox
    await this.firstCampaignRow.click();
    console.log('✓ First row from data list deselected');
    // Verify the checkbox is deselected (unchecked)
    await expect(this.firstCampaignRow).not.toBeChecked();
    console.log('✓ Verified: First row checkbox is deselected');

    return this.firstCampaignRow;
  }

  async submitSelectedCampaign(): Promise<void> {
    await this.saveCampaignGroupBtn.waitFor({ state: 'visible', timeout: 1000 });
    await this.saveCampaignGroupBtn.waitFor({ state: 'attached', timeout: 1000 });
    await expect(this.saveCampaignGroupBtn).toBeEnabled();
    await this.saveCampaignGroupBtn.click();
    console.log('✓ Save campaign group button clicked successfully');

    // await this.page.waitForTimeout(5000);

    await this.continueBtn.click();
    console.log('✓ Campaign submitted successfully');
  }

  async validateTableOfCampaigns(): Promise<Array<Record<string, string>>> {
    const tableLocator = this.page.locator('.table-with-data');
    
    // Wait for table to be visible
    // await expect(tableLocator).toBeVisible();
    
    await this.applyFiltersBtn.click();
    await this.firstCampaignRow.waitFor({ state: 'visible', timeout: 10_000 });
    
    // Extract headers from thead
    const headers: string[] = await tableLocator
      .locator('thead th')
      .allTextContents();
    
    console.log(`✓ Table headers found: ${headers.join(', ')}`);
    
    // Get all rows from tbody
    const rows = tableLocator.locator('tbody tr');
    const rowCount = await rows.count();
    
    const tableData: Array<Record<string, string>> = [];
    
    // Loop through each row
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = rows.nth(rowIndex);
      const cells = row.locator('td');
      const cellCount = await cells.count();
      
      const rowData: Record<string, string> = {};
      
      // Loop through each cell and map to header key
      for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
        const cellText = await cells.nth(cellIndex).textContent();
        const headerKey = headers[cellIndex] || `column_${cellIndex}`;
        rowData[headerKey] = cellText?.trim() || '';
      }
      
      tableData.push(rowData);
      console.log(`✓ Row ${rowIndex + 1}: ${JSON.stringify(rowData)}`);
    }
    
    console.log(`✓ Total rows extracted: ${tableData.length}`);
    
    // Assert Media Type is not empty for all rows
    for (let i = 0; i < tableData.length; i++) {
      const rowData = tableData[i];
      const mediaTypeValue = rowData['Media Type'] || rowData['MediaType'] || rowData['media type'] || '';
      
      expect(mediaTypeValue.trim().length, `Row ${i + 1}: Media Type should not be empty`).toBeGreaterThan(0);
      console.log(`✓ Row ${i + 1}: Media Type validated - "${mediaTypeValue}"`);
    }
    console.log(`✓ Total rows extracted and validated: ${tableData.length}`);

    return tableData;
  }
}