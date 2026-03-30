// tests/pages/LoginPage.ts - Complete POM Implementation with All Elements
import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Login form elements
  readonly loginBtn: Locator;
  readonly loginContinueButton: Locator;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  
  // Cookie and Terms elements
  readonly acceptCookiesBtn: Locator;
  readonly acceptCookiesClose: Locator;
  readonly termsAndServiceCheckbox: Locator;
  readonly continueTermsAndServiceBtn: Locator;
  
  // Error message elements
  readonly promptAlertMessage: Locator;
  readonly passwordErrorMessage: Locator;
  
  // Remember Me elements
  readonly rememberMeCheckbox: Locator;
  
  // Validation error elements
  readonly validationErrors: Locator;
  readonly invalidInputs: Locator;
  readonly allErrors: Locator;

  constructor(page: Page) {
    super(page);
    
    // Login form locators
    this.loginBtn = page.locator('//*[@id="login-btn"]');
    this.loginContinueButton = page.locator('button[type="submit"][value="default"]');
    this.usernameField = page.locator('input#username');
    this.passwordField = page.locator('input#password');
    
    // Cookie and Terms locators
    this.acceptCookiesBtn = page.locator('#allow-all-btn');
    this.acceptCookiesClose = page.locator('//*[@id="cookie-consent-modal"]/div/div[1]/img[2]');
    this.termsAndServiceCheckbox = page.locator('#terms-of-service-modal > div > div.content-container > div > label > span');
    this.continueTermsAndServiceBtn = page.locator('#terms-of-service-btn');
    
    // Error message locators
    this.promptAlertMessage = page.locator('//*[@id="prompt-alert"]/p');
    this.passwordErrorMessage = page.locator('//*[@id="error-element-password"]/span');
    
    // Remember Me locator
    this.rememberMeCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /remember/i }).first();
    
    // Validation error locators
    this.validationErrors = page.locator('input:invalid, .field-error, .error');
    this.invalidInputs = page.locator('input:invalid');
    this.allErrors = page.locator('.error, .alert-danger, [role="alert"], .field-error');
  }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.loginBtn.click();
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginContinueButton.click();
  }

  /**
   * Accept cookies and terms of service
   */
  async acceptCookiesAndTerms(): Promise<void> {
    try {
      // Close cookie modal
      if (await this.isVisible(this.acceptCookiesClose, 2000)) {
        await this.acceptCookiesClose.click();
        console.log('✓ Cookies modal closed');
      }
      
      // Accept terms and service
      if (await this.isVisible(this.termsAndServiceCheckbox, 2000)) {
        await this.termsAndServiceCheckbox.click();
        await this.continueTermsAndServiceBtn.click();
        console.log('✓ Terms and service accepted');
      }
    } catch (error) {
      console.log('ℹ️ No cookies or terms prompts found');
    }
  }

  /**
   * Complete login flow with credentials
   */
  async performLogin(username: string, password: string): Promise<void> {
    await this.login(username, password);
    await this.acceptCookiesAndTerms();
    await this.waitForPageLoad();
  }

  /**
   * Get prompt alert error message text
   */
  async getPromptAlertMessage(): Promise<string> {
    return await this.getTextContent(this.promptAlertMessage);
  }

  /**
   * Get password error message text
   */
  async getPasswordErrorMessage(): Promise<string> {
    return await this.getTextContent(this.passwordErrorMessage);
  }

  /**
   * Check if prompt alert is visible
   */
  async isPromptAlertVisible(): Promise<boolean> {
    return await this.isVisible(this.promptAlertMessage, 2000);
  }

  /**
   * Check if password error is visible
   */
  async isPasswordErrorVisible(): Promise<boolean> {
    return await this.isVisible(this.passwordErrorMessage, 2000);
  }

  /**
   * Check if remember me checkbox is visible
   */
  async isRememberMeVisible(): Promise<boolean> {
    return await this.isVisible(this.rememberMeCheckbox, 2000);
  }

  /**
   * Check the remember me checkbox
   */
  async checkRememberMe(): Promise<void> {
    if (await this.isRememberMeVisible()) {
      await this.rememberMeCheckbox.check();
      console.log('✓ Remember Me checkbox checked');
    }
  }

  /**
   * Get count of validation errors
   */
  async getValidationErrorCount(): Promise<number> {
    return await this.validationErrors.count();
  }

  /**
   * Check if there are any validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const invalidCount = await this.invalidInputs.count();
    const errorCount = await this.allErrors.count();
    return invalidCount > 0 || errorCount > 0;
  }

  /**
   * Get count of error messages on page
   */
  async getErrorMessageCount(): Promise<number> {
    return await this.page.locator('.error, .alert-danger, [role="alert"]').count();
  }
}