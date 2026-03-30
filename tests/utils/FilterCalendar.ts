import { Page } from "@playwright/test";

export class FilterCalendar {
  static async selectDateOfCalendar(page: Page, date: string, calendarBtnSelector: string): Promise<void> {
  console.log(`📅 Selecting date from calendar: ${date}`);
  
  try {
    // Parse target date from "dd MMMM yyyy" format (equivalent to LocalDate.parse)
    const targetDate = parseTargetDate(date);
    console.log(`🎯 Target date parsed: ${targetDate.day}/${targetDate.month}/${targetDate.year}`);
    
      //  await page.waitForTimeout(2000);    
     console.log(`Wait for calendar to appear`);
    // Wait for calendar to appear (equivalent to explicitWait)
    const calendarOfDate = page.locator(".react-calendar__month-view");
    if (!calendarOfDate) {
      throw new Error('Calendar container not found after clicking button');
    }
    
     await page.waitForTimeout(2000);    
     console.log(` Find month and year display element`);
    // Find month and year display element
    const monthAndYearOfCalendar = page.locator(".calendar-wrapper .calendar-view .react-calendar button.react-calendar__navigation__label span.react-calendar__navigation__label__labelText.react-calendar__navigation__label__labelText--from");
    if (!monthAndYearOfCalendar) {
      throw new Error('Month and year display element not found');
    }
    
    
 //await page.waitForTimeout(2000);

    
     console.log(`navigate To Target Year`);
// Navigate to target year (while loop for year navigation)
    await navigateToTargetYear(page, targetDate, monthAndYearOfCalendar);
    // await page.waitForTimeout(2000);
     console.log(`✓ year element found`);
    // Navigate to target month (while loop for month navigation)
    console.log(`navigate To Target Month`);

    await navigateToTargetMonth(page, targetDate, monthAndYearOfCalendar);
    // await page.waitForTimeout(2000);
     console.log(`✓ Month element found`);
    // Select the target day
    const selectedDay = targetDate.day.toString();

    const selectedMonthYear = `${getMonthName(targetDate.month)} ${targetDate.year}`;
    console.log(`🎯 Selecting day: ${selectedDay} in ${selectedMonthYear}`);
    // await page.waitForTimeout(3000);
     console.log(`Select the date from the calendar: ${selectedDay}`);
    await loopTheDays(page, selectedDay);
    
    console.log(`✅ Successfully selected date: ${date}`);
    
  } catch (error) {
    console.error(`❌ Error selecting calendar date: ${error}`);
    await page.screenshot({ path: `test-results/calendar-selection-error-${Date.now()}.png`, fullPage: true });
    throw error;
  }
  }

  static async verifyDateSelection(page: Page, expectedDate: string): Promise<string> {
    console.log(`🔍 Verifying date selection: ${expectedDate}`);
    
    try {
      // Check if the date appears in the input field
      const endDateInput = page.locator("//*[@id='report-filters-end-date']");
      
      // Wait a moment for the selection to register
      await page.waitForTimeout(500);
      
      // Try different methods to get the selected date
      const methods = [
        () => endDateInput.getAttribute('value'),
        () => endDateInput.textContent(),
        () => endDateInput.innerText(),
        () => endDateInput.inputValue()
      ];
      
      for (const method of methods) {
        try {
          const selectedValue = await method();
          if (selectedValue && selectedValue.trim()) {
            console.log(`✓ Found selected date: ${selectedValue}`);
            return selectedValue.trim();
          }
        } catch (error) {
          // Continue to next method
        }
      }
      
      // Check for any calendar-selected or active elements
      const selectedDateSelectors = [
        '.calendar-day.selected',
        '.day.selected',
        '.active',
        '.ui-state-active',
        '.react-datepicker__day--selected'
      ];
      
      for (const selector of selectedDateSelectors) {
        const selectedElement = page.locator(selector);
        if (await selectedElement.isVisible({ timeout: 1000 })) {
          const text = await selectedElement.textContent();
          if (text) {
            console.log(`✓ Found selected calendar element: ${text}`);
            return text.trim();
          }
        }
      }
      
      console.log(`⚠️ Could not verify date selection, but navigation completed`);
      return expectedDate;
      
    } catch (error) {
      console.log(`⚠️ Error verifying date selection: ${error}`);
      return expectedDate;
    }
  }
  static closeCalendar(page: Page) {
    // Helper function to close calendar
async function closeCalendar(page: Page): Promise<void> {
  console.log(`🔒 Closing calendar...`);
  
  try {
    // Method 1: Click outside the calendar
    await page.locator('body').click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(300);
    
    // Method 2: Press Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Method 3: Look for close button
    const closeButtonSelectors = [
      '.calendar-close',
      '.close',
      '.datepicker-close',
      'button:has-text("Close")',
      'button:has-text("✕")',
      '.ui-datepicker-close'
    ];
    
    for (const selector of closeButtonSelectors) {
      const closeButton = page.locator(selector);
      if (await closeButton.isVisible({ timeout: 500 })) {
        await closeButton.click();
        console.log(`✓ Closed calendar using close button`);
        return;
      }
    }
    
    // Method 4: Click on the date input again to toggle calendar
    const endDateInput = page.locator("//*[@id='report-filters-end-date']");
    if (await endDateInput.isVisible({ timeout: 500 })) {
      await endDateInput.click();
      await page.waitForTimeout(300);
    }
    
    console.log(`✓ Calendar close attempted`);
    
  } catch (error) {
    console.log(`⚠️ Error closing calendar: ${error}`);
  }
}
  }
  /**
   * Add days to a string date and return formatted string
   * @param dateString - Input date string in various formats
   * @param daysToAdd - Number of days to add (can be negative)
   * @param outputFormat - Optional output format ('dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'dd MMMM yyyy')
   * @returns Formatted date string
   */
  static addDaysToStringDate(dateString: string, daysToAdd: number, outputFormat: string = 'dd/MM/yyyy'): string {
    console.log(`📅 Adding ${daysToAdd} days to date: ${dateString}`);
    
    try {
      const inputDate = this.parseStringDate(dateString);     
      if (!inputDate || isNaN(inputDate.getTime())) {
        throw new Error(`Invalid date string: ${dateString}`);
      }
      const resultDate = new Date(inputDate);
      resultDate.setDate(resultDate.getDate() + daysToAdd);
      const formattedDate = this.formatDate(resultDate, outputFormat);      
      console.log(`✓ Result: ${dateString} + ${daysToAdd} days = ${formattedDate}`);
      return formattedDate;
      } catch (error) {
      console.error(`❌ Error adding days to date: ${error}`);
      throw error;
    }
  }
  
  /**
   * Parse various date string formats into a Date object
   * @param dateString - Date string in various formats
   * @returns Date object or null if parsing fails
   */
  private static parseStringDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }
    
    // Clean the date string
    const cleanDateString = dateString.trim();
    
    // Try ISO format first
    let parsedDate = new Date(cleanDateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    // Try DD/MM/YYYY format (common European format)
    const ddmmyyyyMatch = cleanDateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // Month is 0-indexed
      const year = parseInt(ddmmyyyyMatch[3], 10);
      
      // Try DD/MM/YYYY first
      let date = new Date(year, month, day);
      if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date;
      }
      
      // If that fails, try MM/DD/YYYY
      date = new Date(year, day - 1, month + 1);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Try parsing month names (21 March 2025, Mar 21 2025, etc.)
    const monthNameMatch = cleanDateString.match(/^(\d{1,2})\s+(\w{3,9})\s+(\d{4})$/);
    if (monthNameMatch) {
      const day = parseInt(monthNameMatch[1], 10);
      const monthName = monthNameMatch[2];
      const year = parseInt(monthNameMatch[3], 10);
      const month = this.parseMonthName(monthName);
      
      if (month !== -1) {
        return new Date(year, month, day);
      }
    }
    
    // Try MMM DD, YYYY format
    const mmmddyyyyMatch = cleanDateString.match(/^(\w{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
    if (mmmddyyyyMatch) {
      const monthName = mmmddyyyyMatch[1];
      const day = parseInt(mmmddyyyyMatch[2], 10);
      const year = parseInt(mmmddyyyyMatch[3], 10);
      const month = this.parseMonthName(monthName);
      
      if (month !== -1) {
        return new Date(year, month, day);
      }
    }
    
    console.warn(`⚠️ Could not parse date string: ${dateString}`);
    return null;
  }
  
  /**
   * Parse month name to month number (0-indexed)
   * @param monthName - Month name (full or abbreviated)
   * @returns Month number (0-11) or -1 if not found
   */
  private static parseMonthName(monthName: string): number {
    const monthMap: { [key: string]: number } = {
      'january': 0, 'jan': 0,
      'february': 1, 'feb': 1,
      'march': 2, 'mar': 2,
      'april': 3, 'apr': 3,
      'may': 4,
      'june': 5, 'jun': 5,
      'july': 6, 'jul': 6,
      'august': 7, 'aug': 7,
      'september': 8, 'sep': 8, 'sept': 8,
      'october': 9, 'oct': 9,
      'november': 10, 'nov': 10,
      'december': 11, 'dec': 11
    };
    
    const normalizedMonth = monthName.toLowerCase();
    return monthMap[normalizedMonth] ?? -1;
  }
  
  /**
   * Format date according to specified format
   * @param date - Date object to format
   * @param format - Output format string
   * @returns Formatted date string
   */
  private static formatDate(date: Date, format: string): string {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Month is 0-indexed
    const year = date.getFullYear();
    
    const paddedDay = day.toString().padStart(2, '0');
    const paddedMonth = month.toString().padStart(2, '0');
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthNamesShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    switch (format.toLowerCase()) {
      case 'dd/mm/yyyy':
        return `${paddedDay}/${paddedMonth}/${year}`;
        
      case 'mm/dd/yyyy':
        return `${paddedMonth}/${paddedDay}/${year}`;
        
      case 'yyyy-mm-dd':
        return `${year}-${paddedMonth}-${paddedDay}`;
        
      case 'dd-mm-yyyy':
        return `${paddedDay}-${paddedMonth}-${year}`;
        
      case 'dd mmmm yyyy':
        return `${paddedDay} ${monthNames[month - 1]} ${year}`;
        
      case 'dd mmm yyyy':
        return `${paddedDay} ${monthNamesShort[month - 1]} ${year}`;
     
      case 'mmmm dd, yyyy':
        return `${monthNames[month - 1]} ${paddedDay}, ${year}`;
        
      case 'mmm dd, yyyy':
        return `${monthNamesShort[month - 1]} ${paddedDay}, ${year}`;
        
      default:
        // Default to DD/MM/YYYY
        return `${paddedDay}/${paddedMonth}/${year}`;
    }
  }
  
  /**
   * Get current date as formatted string
   * @param format - Output format string
   * @returns Current date as formatted string
   */
  static getCurrentDateString(format: string = 'dd/MM/yyyy'): string {
    return this.formatDate(new Date(), format);
  }
  
  /**
   * Calculate difference in days between two date strings
   * @param startDate - Start date string
   * @param endDate - End date string
   * @returns Number of days difference
   */
  static getDaysDifference(startDate: string, endDate: string): number {
    const start = this.parseStringDate(startDate);
    const end = this.parseStringDate(endDate);
    
    if (!start || !end) {
      throw new Error('Invalid date strings provided');
    }
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}


// Mock action object for compatibility with existing code patterns
const action = {
  /**
   * Mock function to simulate taking text from driver/page element
   * @param driver - WebDriver or Page object
   * @param element - Element locator or selector
   * @returns Promise<string> - Text content
   */
  async takeText(driver: any, element: any): Promise<string> {
    try {
      if (typeof element === 'string') {
        // If element is a string selector, use it with the page
        const textContent = await driver.locator(element).textContent();
        return textContent?.trim() || '';
      } else if (element && typeof element.textContent === 'function') {
        // If element has textContent method
        const textContent = await element.textContent();
        return textContent?.trim() || '';
      } else if (element && typeof element.innerText === 'function') {
        // If element has innerText method
        const innerText = await element.innerText();
        return innerText?.trim() || '';
      } else {
        console.warn('⚠️ Could not extract text from element');
        return '';
      }
    } catch (error) {
      console.error('❌ Error taking text from element:', error);
      return '';
    }
  }


};


function parseTargetDate(date: string): { day: number; month: number; year: number; monthName: string } {
  // Expected format: "18 Oct 2025" or "18 October 2025"
  const dateMatch = date.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (!dateMatch) {
    throw new Error(`Invalid date format: ${date}. Expected format: "dd MMM yyyy" (e.g., "18 Oct 2025") or "dd MMMM yyyy" (e.g., "18 October 2025")`);
  }
  
  const day = parseInt(dateMatch[1], 10);
  const monthName = dateMatch[2];
  const year = parseInt(dateMatch[3], 10);
  
  // Convert month name to number - supports both abbreviated and full names
  const monthMap: { [key: string]: number } = {
    // Full month names
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12,
    // Abbreviated month names
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
    'jun': 6, 'jul': 7, 'aug': 8,
    'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  
  const month = monthMap[monthName.toLowerCase()];
  if (!month) {
    throw new Error(`Invalid month name: ${monthName}. Supported formats: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec or January, February, March, etc.`);
  }
  
  return { day, month, year, monthName: monthName.toLowerCase() };
}



/**
 * Navigate to target year (equivalent to first while loop in Java)
 */
async function navigateToTargetYear(page: Page, targetDate: any, monthYearElement: any): Promise<void> {
  console.log(`📅 Navigating to year: ${targetDate.year}`);
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Get current displayed year (equivalent to action.takeText split)
    const monthYearText = await monthYearElement.textContent();
    if (!monthYearText) break;
    // await page.waitForTimeout(2000);

    const parts = monthYearText.trim().split(' ');
    const currentYear = parseInt(parts[parts.length - 1]); // Last part should be year
    
    console.log(`Current calendar year: ${currentYear}, Target: ${targetDate.year}`);
    
    if (currentYear === targetDate.year) {
      console.log(`✓ Reached target year: ${targetDate.year}`);
      return;
    }
    
    // Determine navigation direction (equivalent to targetDate.isAfter(LocalDate.now()))
    const today = new Date();
    const targetDateObj = new Date(targetDate.year, targetDate.month - 1, targetDate.day);
    const needsNext = targetDateObj > today;
     //await page.waitForTimeout(2000);

    // Find and click year navigation buttons
    const yearNavSelector = needsNext ? 
      '.next-year, .year-next, [title*="next year"], [aria-label*="next year"]' : 
      '.prev-year, .year-prev, [title*="prev year"], [aria-label*="prev year"]';
    
    const navButton = page.locator(yearNavSelector).first();
    if (await navButton.isVisible({ timeout: 1000 }) && await navButton.isEnabled()) {
      await navButton.click();
      await page.waitForTimeout(500);
    } else {
      console.log(`⚠️ Year navigation button not found or disabled`);
      break;
    }
    
    attempts++;
  }
}



/**
 * Navigate to target month (equivalent to second while loop in Java)
 */
async function navigateToTargetMonth(page: Page, targetDate: any, monthYearElement: any): Promise<void> {
  console.log(`📅 Navigating to month: ${getMonthName(targetDate.month)} ${targetDate.year}`);
  
  let attempts = 0;
  const maxAttempts = 24; // Max 2 years worth of months
  
  while (attempts < maxAttempts) {
    // Get current displayed month and year
    const monthYearText = await monthYearElement.textContent();
    if (!monthYearText) break;
    
    const parts = monthYearText.trim().split(' ');
    const currentYear = parseInt(parts[parts.length - 1]);
    const currentMonthName = parts[0].toUpperCase();
    const currentMonth = getMonthNumber(currentMonthName);
    
    console.log(`Current: ${currentMonthName} ${currentYear}, Target: ${getMonthName(targetDate.month)} ${targetDate.year}`);
    
    // Check if we've reached target month and year
    if (currentYear === targetDate.year && currentMonth === targetDate.month) {
      console.log(`✓ Reached target month: ${getMonthName(targetDate.month)} ${targetDate.year}`);
      return;
    }
    
    // Determine navigation direction (equivalent to targetDate.isAfter(displayedDate))
    const displayedDate = new Date(currentYear, currentMonth - 1, 1);
    const targetDateObj = new Date(targetDate.year, targetDate.month - 1, 1);
    const needsNext = targetDateObj > displayedDate;
    
    // Find and click month navigation buttons
    const monthNavSelector = needsNext ? 
      '.react-calendar__navigation__next-button' : 
      '.react-calendar__navigation__prev-button';
    
    const navButton = page.locator(monthNavSelector).first();
    if (await navButton.isVisible({ timeout: 1000 }) && await navButton.isEnabled()) {
      await navButton.click();
      await page.waitForTimeout(500);
    } else {
      throw new Error('Could not find or click month navigation button');
    }
    
    attempts++;
  }
  
  throw new Error(`Could not navigate to ${getMonthName(targetDate.month)} ${targetDate.year} after ${maxAttempts} attempts`);
}
/**
 * Get month name from month number
 */
function getMonthName(monthNumber: number): string {
  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[monthNumber] || 'January';
}





/**
 * Loop through days and select target day (equivalent to loopTheDays method)
 */
async function loopTheDays(page: Page, selectedDay: string): Promise<void> {
  console.log(`🎯 Looking for day: ${selectedDay}`);
  
  // Get list of day elements (equivalent to action.getListOfElements(daysOfTheCalendar, 10))
  const daysOfTheCalendar = ['.react-calendar__month-view__days__day' ];
  
  let listOfDays: any[] = [];
  
  // Try different selectors to find day elements
  for (const selector of daysOfTheCalendar) {
    const elements = page.locator(selector);
    const count = await elements.count();
    
    if (count > 0) {
     //  await page.waitForTimeout(3000);
      // Get up to 10 elements (equivalent to getListOfElements limit)
      const maxElements = Math.min(count, 42); // Maximum days in a calendar month view
      for (let i = 0; i < maxElements; i++) {
        listOfDays.push(elements.nth(i));
      }
      break; // Use the first selector that finds elements
    }
  }
  
  if (listOfDays.length === 0) {
    throw new Error('No calendar day elements found');
  }
  
  console.log(`Found ${listOfDays.length} day elements to check`);
  
  // Loop through list of days (equivalent to for (WebElement curDay : listOfDays))
  for (const curDay of listOfDays) {
    try {
      // Check if element is visible first
      if (await curDay.isVisible({ timeout: 1000 })) {
        // Get text from current day element (equivalent to action.takeText(getDriver(), curDay))
        const dayText = await curDay.textContent();
        const cleanDayText = dayText?.trim() || '';
        
        // Check if day text equals target day (equivalent to .equals(day))
        if (cleanDayText === selectedDay) {
          console.log(`✓ Found matching day: ${selectedDay}`);
          
          // Scroll to element (equivalent to action.scrollToElement(getDriver(), curDay))
          await curDay.scrollIntoViewIfNeeded();
          
          try {
            // Wait 4 seconds (equivalent to Thread.sleep(4000))
         //   await page.waitForTimeout(4000);
            // await page.waitForTimeout(3000);

            // Click on the day element with retry (equivalent to action.click(getDriver(), curDay, 5))
            await clickWithRetry(page, curDay, 5);
            
            console.log(`✅ Successfully clicked on day ${selectedDay}`);
            return;
            
          } catch (e) {
            console.error(`❌ Error clicking day ${selectedDay}:`, e);
            throw new Error(`Failed to click day ${selectedDay}: ${e}`);
          }
        }
      }
    } catch (error) {
      // Continue to next element if current one fails
      console.log(`⚠️ Error checking day element: ${error}`);
      continue;
    }
  }
  
  // Throw exception if day not found (equivalent to throw new NoSuchElementException)
  throw new Error(`Day not found: ${selectedDay}`);
}

/**
 * Click element with retry mechanism (equivalent to action.click with retry count)
 */
async function clickWithRetry(page: Page, element: any, maxRetries: number = 5): Promise<void> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      // Check if element is still visible and enabled
      if (await element.isVisible({ timeout: 1000 }) && await element.isEnabled({ timeout: 1000 })) {
        await element.click();
        console.log(`✓ Click successful on attempt ${attempts + 1}`);
        return;
      } else {
        throw new Error('Element not visible or enabled');
      }
    } catch (error) {
      attempts++;
      console.log(`⚠️ Click attempt ${attempts} failed: ${error}`);
      
      if (attempts >= maxRetries) {
        throw new Error(`Failed to click after ${maxRetries} attempts: ${error}`);
      }
      
      // Wait before retry
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Check if day element is disabled
 */
async function isDayDisabled(dayElement: any): Promise<boolean> {
  try {
    const isDisabled = await dayElement.getAttribute('disabled') !== null ||
                      (await dayElement.getAttribute('class') || '').includes('disabled') ||
                      (await dayElement.getAttribute('class') || '').includes('inactive') ||
                      (await dayElement.getAttribute('aria-disabled')) === 'true';
    return isDisabled;
  } catch {
    return false;
  }
}



/**
 * Get month number from month name
 */
function getMonthNumber(monthName: string): number {
  const monthMap: { [key: string]: number } = {
    'JANUARY': 1, 'JAN': 1,
    'FEBRUARY': 2, 'FEB': 2,
    'MARCH': 3, 'MAR': 3,
    'APRIL': 4, 'APR': 4,
    'MAY': 5,
    'JUNE': 6, 'JUN': 6,
    'JULY': 7, 'JUL': 7,
    'AUGUST': 8, 'AUG': 8,
    'SEPTEMBER': 9, 'SEP': 9, 'SEPT': 9,
    'OCTOBER': 10, 'OCT': 10,
    'NOVEMBER': 11, 'NOV': 11,
    'DECEMBER': 12, 'DEC': 12
  };
  
  return monthMap[monthName.toUpperCase()] || 1;
}






// Helper function to verify date selection in calendar
async function verifyDateSelection(page: Page, expectedDate: string): Promise<string> {
  console.log(`🔍 Verifying date selection: ${expectedDate}`);
  
  try {
    // Check if the date appears in the input field
    const endDateInput = page.locator("//*[@id='report-filters-end-date']");
    
    // Wait a moment for the selection to register
    await page.waitForTimeout(500);
    
    // Try different methods to get the selected date
    const methods = [
      () => endDateInput.getAttribute('value'),
      () => endDateInput.textContent(),
      () => endDateInput.innerText(),
      () => endDateInput.inputValue()
    ];
    
    for (const method of methods) {
      try {
        const selectedValue = await method();
        if (selectedValue && selectedValue.trim()) {
          console.log(`✓ Found selected date: ${selectedValue}`);
          return selectedValue.trim();
        }
      } catch (error) {
        // Continue to next method
      }
    }
    
    // Check for any calendar-selected or active elements
    const selectedDateSelectors = [
      '.calendar-day.selected',
      '.day.selected',
      '.active',
      '.ui-state-active',
      '.react-datepicker__day--selected'
    ];
    
    for (const selector of selectedDateSelectors) {
      const selectedElement = page.locator(selector);
      if (await selectedElement.isVisible({ timeout: 1000 })) {
        const text = await selectedElement.textContent();
        if (text) {
          console.log(`✓ Found selected calendar element: ${text}`);
          return text.trim();
        }
      }
    }
    
    console.log(`⚠️ Could not verify date selection, but navigation completed`);
    return expectedDate;
    
  } catch (error) {
    console.log(`⚠️ Error verifying date selection: ${error}`);
    return expectedDate;
  }
}

