/**
 * Reads and parses the JSON body from a Playwright APIResponse object.
 * @param {import('@playwright/test').APIResponse} response - The response object returned from Playwright's request.
 * @returns {Promise<any>} - The parsed JSON body.
 */

import { BrowserContext, Page } from '@playwright/test';

export class TestUtils {
  static cleanupBrowserResources(page: Page, context: BrowserContext) {
      throw new Error('Method not implemented.');
  }
  static async waitForPageLoad(page: Page, timeout: number = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async takeScreenshot(page: Page, name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  static async scrollToElement(page: Page, selector: string) {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  static async waitForElement(page: Page, selector: string, timeout: number = 10000) {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  static async getPageTitle(page: Page): Promise<string> {
    return await page.title();
  }

  static async getCurrentUrl(page: Page): Promise<string> {
    return page.url();
  }

  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async clearAndFill(page: Page, selector: string, text: string) {
    const element = page.locator(selector);
    await element.clear();
    await element.fill(text);
  }

  static async selectDropdownOption(page: Page, selector: string, option: string) {
    const dropdown = page.locator(selector);
    await dropdown.click();
    await dropdown.selectOption({ label: option });
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  static getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDate(date);
  }

  static async isElementVisible(page: Page, selector: string): Promise<boolean> {
    try {
      return await page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }

  static async getElementText(page: Page, selector: string): Promise<string> {
    return await page.locator(selector).textContent() || '';
  }

  static async waitForNavigation(page: Page, expectedUrl?: string, timeout: number = 10000) {
    if (expectedUrl) {
      await page.waitForURL(expectedUrl, { timeout });
    } else {
      await page.waitForLoadState('networkidle', { timeout });
    }
  }
}

export async function readResponseJson(response: { json: () => any; }) {
  if (!response) {
    throw new Error('Response object is undefined or null');
  }
  return await response.json();
}

export async function parseFilterParameters({ filterParameterArray, delimiter = ',' }: { filterParameterArray: string; delimiter?: string; }): Promise<string[]> {
  return filterParameterArray.split(delimiter).map(param => param.trim());
    }
