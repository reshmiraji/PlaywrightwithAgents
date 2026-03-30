import { Page } from '@playwright/test';

/**
 * Function to navigate to a specific date in the calendar and click on it
 * @param page - Playwright Page object
 * @param outputEndDate - Formatted date string like "24 Mar 2025" or "01 Oct 2025"
 * @param endDateInputSelector - Selector for the end date input field
 */
export async function navigateToEndDateInCalendar(page: Page, outputEndDate: string, endDateInputSelector: string = '#report-filters-end-date') {
  console.log(`🗓️ Starting calendar navigation for date: ${outputEndDate}`);
  
  try {
    // Parse the date string (format: "dd MMM yyyy" like "01 Oct 2025")
    const dateMatch = outputEndDate.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/);
    if (!dateMatch) {
      throw new Error(`Invalid date format: ${outputEndDate}. Expected format: dd MMM yyyy (e.g., "01 Oct 2025")`);
    }
    
    const targetDay = parseInt(dateMatch[1], 10);
    const targetMonth = dateMatch[2];
    const targetYear = parseInt(dateMatch[3], 10);
    
    console.log(`📅 Target date parsed: Day=${targetDay}, Month=${targetMonth}, Year=${targetYear}`);
    
    // Wait for calendar to be visible
    await page.waitForTimeout(500);
    
    // Common calendar selectors
    const calendarSelectors = [
      '.calendar',
      '.datepicker',
      '.date-picker',
      '[data-testid="calendar"]',
      '.calendar-popup',
      '.ui-datepicker',
      '.react-datepicker',
      '.calendar-container'
    ];
    
    let calendar = null;
    for (const selector of calendarSelectors) {
      const calendarElement = page.locator(selector);
      if (await calendarElement.isVisible({ timeout: 2000 })) {
        calendar = calendarElement;
        console.log(`✓ Found calendar with selector: ${selector}`);
        break;
      }
    }
    
    if (!calendar) {
      console.log('⚠️ Calendar not found, using page-level navigation');
      calendar = page;
    }
    
    // Navigate to correct month and year
    await navigateToTargetMonth(page, calendar, targetMonth, targetYear);
    
    // Click on the target day
    await clickTargetDay(page, calendar, targetDay, targetMonth);
    
    console.log(`✅ Successfully navigated to date: ${outputEndDate}`);
    
  } catch (error) {
    console.error(`❌ Error navigating to calendar date: ${error}`);
    // Take screenshot for debugging
    await page.screenshot({ path: `test-results/calendar-navigation-error-${Date.now()}.png`, fullPage: true });
    throw error;
  }
}

/**
 * Navigate to the target month and year in the calendar
 */
async function navigateToTargetMonth(page: Page, calendar: any, targetMonth: string, targetYear: number) {
  console.log(`🔄 Navigating to ${targetMonth} ${targetYear}`);
  
  const monthMap: { [key: string]: number } = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };
  
  const targetMonthIndex = monthMap[targetMonth.toLowerCase()];
  if (targetMonthIndex === undefined) {
    throw new Error(`Invalid month: ${targetMonth}`);
  }
  
  // Get current displayed month and year
  const currentDate = new Date();
  let attempts = 0;
  const maxAttempts = 24; // Max 2 years navigation
  
  while (attempts < maxAttempts) {
    // Try to find current month/year display
    const monthYearSelectors = [
      '.calendar-header',
      '.datepicker-header',
      '.calendar-title',
      '.month-year',
      '.current-month',
      '.ui-datepicker-title',
      '.react-datepicker__current-month'
    ];
    
    let currentMonthYear = '';
    for (const selector of monthYearSelectors) {
      const element = calendar.locator(selector);
      if (await element.isVisible({ timeout: 1000 })) {
        currentMonthYear = await element.textContent() || '';
        if (currentMonthYear.trim()) {
          break;
        }
      }
    }
    
    console.log(`Current calendar display: ${currentMonthYear}`);
    
    // Check if we're at the target month/year
    const currentMonthMatch = currentMonthYear.toLowerCase();
    if (currentMonthMatch.includes(targetMonth.toLowerCase()) && currentMonthMatch.includes(targetYear.toString())) {
      console.log(`✓ Reached target month: ${targetMonth} ${targetYear}`);
      return;
    }
    
    // Determine navigation direction
    const currentYearMatch = currentMonthYear.match(/\d{4}/);
    const currentYear = currentYearMatch ? parseInt(currentYearMatch[0]) : currentDate.getFullYear();
    
    let needsNext = false;
    if (currentYear < targetYear) {
      needsNext = true;
    } else if (currentYear === targetYear) {
      // Check month
      for (const [month, index] of Object.entries(monthMap)) {
        if (currentMonthMatch.includes(month)) {
          needsNext = index < targetMonthIndex;
          break;
        }
      }
    }
    
    // Click navigation button
    const navSelector = needsNext ? 
      ['.next', '.calendar-next', '.datepicker-next', '>>'] : 
      ['.prev', '.calendar-prev', '.datepicker-prev', '<<'];
    
    let navigated = false;
    for (const selector of navSelector) {
      const navButton = calendar.locator(selector);
      if (await navButton.isVisible({ timeout: 1000 })) {
        await navButton.click();
        await page.waitForTimeout(300);
        navigated = true;
        break;
      }
    }
    
    if (!navigated) {
      console.log('⚠️ Could not find navigation buttons, trying arrow buttons');
      // Try generic arrow buttons
      const arrowButtons = needsNext ? 
        calendar.locator('button:has-text(">")', 'button:has-text("Next")') :
        calendar.locator('button:has-text("<")', 'button:has-text("Prev")');
      
      if (await arrowButtons.first().isVisible({ timeout: 1000 })) {
        await arrowButtons.first().click();
        await page.waitForTimeout(300);
      } else {
        throw new Error('Could not find calendar navigation buttons');
      }
    }
    
    attempts++;
  }
  
  throw new Error(`Could not navigate to ${targetMonth} ${targetYear} after ${maxAttempts} attempts`);
}

/**
 * Click on the target day in the calendar
 */
async function clickTargetDay(page: Page, calendar: any, targetDay: number, targetMonth: string) {
  console.log(`🎯 Looking for day ${targetDay} in ${targetMonth}`);
  
  // Wait for calendar to update
  await page.waitForTimeout(500);
  
  // Look for day selectors
  const daySelectors = [
    `td:has-text("${targetDay}")`,
    `div:has-text("${targetDay}")`,
    `button:has-text("${targetDay}")`,
    `span:has-text("${targetDay}")`,
    `.day:has-text("${targetDay}")`,
    `.calendar-day:has-text("${targetDay}")`,
    `[data-day="${targetDay}"]`
  ];
  
  for (const selector of daySelectors) {
    const dayElements = calendar.locator(selector);
    const count = await dayElements.count();
    
    if (count > 0) {
      console.log(`Found ${count} elements matching day ${targetDay}`);
      
      // If multiple elements, try to find the correct one (not disabled, in current month)
      for (let i = 0; i < count; i++) {
        const dayElement = dayElements.nth(i);
        
        if (await dayElement.isVisible({ timeout: 1000 })) {
          // Check if it's not disabled
          const isDisabled = await dayElement.getAttribute('disabled') !== null ||
                            await dayElement.getAttribute('class')?.includes('disabled') ||
                            await dayElement.getAttribute('class')?.includes('inactive');
          
          if (!isDisabled) {
            await dayElement.click();
            console.log(`✅ Clicked on day ${targetDay}`);
            await page.waitForTimeout(300);
            return;
          }
        }
      }
    }
  }
  
  throw new Error(`Could not find clickable day ${targetDay} in calendar`);
}