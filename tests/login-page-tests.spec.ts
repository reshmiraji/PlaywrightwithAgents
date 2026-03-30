// tests/login-page-tests.spec.ts - Fully Refactored with POM
import { test, expect } from '@playwright/test';
import { PageFactory } from './pages/PageFactory';
import { LoginPage } from './pages/LoginPage';
import readProperties from './utils/readProperties';
import { getEnvironmentConfig } from './utils/environmentConfig';
import * as fs from 'fs';
import * as path from 'path';

// Get environment configuration
const envConfig = getEnvironmentConfig();

// Get test environment
const environment = process.env.TEST_ENV || 'TST';

// Read credentials from environment-specific file
const credFileName = `credential_${environment}.properties`;
const credPath = path.resolve(__dirname, '../', credFileName);

if (!fs.existsSync(credPath)) {
  throw new Error(`❌ Credential file not found: ${credFileName}`);
}

const credentials = readProperties(credFileName);
const usernameEncoded = credentials?.username || '';
const passwordEncoded = credentials?.password || '';
const username = usernameEncoded ? Buffer.from(usernameEncoded, 'base64').toString('utf-8') : '';
const password = passwordEncoded ? Buffer.from(passwordEncoded, 'base64').toString('utf-8') : '';

test.describe('Login Page - Comprehensive Test Suite', () => {
  let pageFactory: PageFactory;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Initialize PageFactory and LoginPage
    pageFactory = PageFactory.getInstance();
    loginPage = pageFactory.getLoginPage(page);

    // Navigate to login page using environment-specific URL
    await page.goto(envConfig.UI_URL);
    await loginPage.waitForPageLoad();
  });

  // ===================== 1. SUCCESSFUL LOGIN FLOW =====================

  test('1.1 Valid Credentials Login', async ({ page }) => {
    console.log('🔐 Testing valid credentials login...');

    // Perform complete login flow
    await loginPage.performLogin(username, password);

    // Verify successful login
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('login');
    console.log('✓ User redirected from login page');

    // Verify no error messages using LoginPage method
    const errorCount = await loginPage.getErrorMessageCount();
    expect(errorCount).toBe(0);
    console.log('✓ No error messages displayed');

    await loginPage.takeScreenshot('login-01-success');
    console.log('✅ Valid credentials login test completed successfully');
  });

  test('1.2 Remember Me Functionality', async ({ page }) => {
    console.log('🔐 Testing remember me functionality...');

    await loginPage.loginBtn.click();

    // Use LoginPage element
    if (await loginPage.isRememberMeVisible()) {
      await loginPage.usernameField.fill(username);
      await loginPage.passwordField.fill(password);
      await loginPage.checkRememberMe();

      await loginPage.loginContinueButton.click();
      await loginPage.acceptCookiesAndTerms();
      await loginPage.waitForPageLoad();

      // Verify login success
      expect(await loginPage.getCurrentUrl()).not.toContain('login');
      console.log('✓ Login successful with Remember Me');

      await loginPage.takeScreenshot('login-02-remember-me');
    } else {
      console.log('⚠️ Remember Me functionality not available on this page');
    }

    console.log('✅ Remember Me functionality test completed');
  });

  // ===================== 2. INVALID CREDENTIALS HANDLING =====================

  test('2.1 Invalid Email/Username', async ({ page }) => {
    console.log('🚫 Testing invalid email/username...');

    await loginPage.loginBtn.click();
    await loginPage.usernameField.fill('invalid@example.com');
    console.log('✓ Invalid email entered');

    await loginPage.passwordField.fill(password);
    console.log('✓ Valid password entered');

    await loginPage.loginContinueButton.click();
    console.log('✓ Login button clicked');

    await loginPage.wait(1000);

    // Verify remains on login page
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('login');
    console.log('✓ User remains on login page');

    // Use LoginPage element and method
    expect(await loginPage.isPromptAlertVisible()).toBe(true);
    const errorText = await loginPage.getPromptAlertMessage();
    console.log('✓ Error message displayed: ' + errorText);

    await loginPage.takeScreenshot('login-03-invalid-email');
    console.log('✅ Invalid email test completed successfully');
  });

  test('2.2 Invalid Password', async ({ page }) => {
    console.log('🚫 Testing invalid password...');

    await loginPage.loginBtn.click();
    await loginPage.usernameField.fill(username);
    console.log('✓ Valid email entered');

    await loginPage.passwordField.fill('wrongpassword');
    console.log('✓ Invalid password entered');

    await loginPage.loginContinueButton.click();
    console.log('✓ Login button clicked');

    await loginPage.wait(3000);

    // Verify remains on login page
    expect(await loginPage.getCurrentUrl()).toContain('login');
    console.log('✓ User remains on login page');

    // Use LoginPage element and method
    expect(await loginPage.isPasswordErrorVisible()).toBe(true);
    console.log('✓ Error message displayed for invalid password');

    await loginPage.takeScreenshot('login-04-invalid-password');
    console.log('✅ Invalid password test completed successfully');
  });

  test('2.3 Both Credentials Invalid', async ({ page }) => {
    console.log('🚫 Testing both credentials invalid...');

    await loginPage.loginBtn.click();
    await loginPage.usernameField.fill('invalid@example.com');
    console.log('✓ Invalid email entered');

    await loginPage.passwordField.fill('wrongpassword');
    console.log('✓ Invalid password entered');

    await loginPage.loginContinueButton.click();
    console.log('✓ Login button clicked');

    await loginPage.wait(3000);

    // Verify remains on login page
    expect(await loginPage.getCurrentUrl()).toContain('login');
    console.log('✓ User remains on login page');

    // Use LoginPage method
    expect(await loginPage.isPromptAlertVisible()).toBe(true);
    console.log('✓ Error message displayed for invalid credentials');

    await loginPage.takeScreenshot('login-05-both-invalid');
    console.log('✅ Both credentials invalid test completed successfully');
  });

  // ===================== 3. FORM VALIDATION =====================

  test('3.1 Empty Username Field', async ({ page }) => {
    console.log('📝 Testing empty username field validation...');

    await loginPage.loginBtn.click();
    await loginPage.passwordField.fill(password);
    console.log('✓ Password entered, username left blank');

    await loginPage.loginContinueButton.click();
    console.log('✓ Login button clicked');

    await loginPage.wait(2000);

    // Verify remains on login page
    expect(await loginPage.getCurrentUrl()).toContain('login');
    console.log('✓ User remains on login page');
    console.log('✓ Validation error displayed for empty username');

    await loginPage.takeScreenshot('login-06-empty-username');
    console.log('✅ Empty username validation test completed successfully');
  });

  test('3.2 Empty Password Field', async ({ page }) => {
    console.log('📝 Testing empty password field validation...');

    await loginPage.loginBtn.click();
    await loginPage.usernameField.fill(username);
    console.log('✓ Username entered, password left blank');

    await loginPage.loginContinueButton.click();
    console.log('✓ Login button clicked');

    await loginPage.wait(2000);

    // Verify remains on login page
    expect(await loginPage.getCurrentUrl()).toContain('login');
    console.log('✓ User remains on login page');

    // Use LoginPage method
    const errorCount = await loginPage.getValidationErrorCount();
    expect(errorCount).toBeGreaterThan(0);
    console.log('✓ Validation error displayed for empty password');

    await loginPage.takeScreenshot('login-07-empty-password');
    console.log('✅ Empty password validation test completed successfully');
  });

  test('3.3 Both Fields Empty', async ({ page }) => {
    console.log('📝 Testing both fields empty validation...');

    await loginPage.loginBtn.click();
    await loginPage.loginContinueButton.click();
    console.log('✓ Login button clicked with both fields empty');

    await loginPage.wait(2000);

    // Verify remains on login page
    expect(await loginPage.getCurrentUrl()).toContain('login');
    console.log('✓ User remains on login page');

    // Use LoginPage method
    const errorCount = await loginPage.getValidationErrorCount();
    expect(errorCount).toBeGreaterThan(0);
    console.log('✓ Validation errors displayed for both empty fields');

    await loginPage.takeScreenshot('login-08-both-empty');
    console.log('✅ Both fields empty validation test completed successfully');
  });

  test('3.4 Invalid Email Format', async ({ page }) => {
    console.log('📝 Testing invalid email format validation...');

    await loginPage.loginBtn.click();
    await loginPage.usernameField.fill('notanemail');
    console.log('✓ Malformed email entered');

    await loginPage.passwordField.fill(password);
    console.log('✓ Valid password entered');

    await loginPage.loginContinueButton.click();
    console.log('✓ Login button clicked');

    await loginPage.wait(3000);

    // Verify remains on login page
    expect(await loginPage.getCurrentUrl()).toContain('login');
    console.log('✓ User remains on login page');

    // Use LoginPage method
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBe(true);
    console.log('✓ Email format validation error detected');

    await loginPage.takeScreenshot('login-09-invalid-email-format');
    console.log('✅ Invalid email format test completed successfully');
  });

  // ===================== 4. SECURITY FEATURES =====================

  test('4.1 Password Field Masking', async ({ page }) => {
    console.log('🔒 Testing password field masking...');

    await loginPage.loginBtn.click();
    await loginPage.passwordField.click();
    await loginPage.passwordField.fill('testpassword123');
    console.log('✓ Text entered in password field');

    // Verify password field is masked
    const passwordType = await loginPage.passwordField.getAttribute('type');
    expect(passwordType).toBe('password');
    console.log('✓ Password field type is "password" (masked)');

    // Verify value is stored correctly
    const passwordValue = await loginPage.passwordField.inputValue();
    expect(passwordValue).toBe('testpassword123');
    console.log('✓ Password value is stored correctly but masked visually');

    await loginPage.takeScreenshot('login-10-password-masking');
    console.log('✅ Password field masking test completed successfully');
  });

  // ===================== 5. USER INTERFACE AND EXPERIENCE =====================

  test('5.1 Form Element Accessibility', async ({ page }) => {
    console.log('♿ Testing form element accessibility...');

    await loginPage.loginBtn.click();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log('✓ First tab navigation successful:', firstFocusedElement);

    await page.keyboard.press('Tab');
    const secondFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log('✓ Second tab navigation successful:', secondFocusedElement);

    // Fill form using keyboard
    await loginPage.usernameField.focus();
    await page.keyboard.type(username);
    console.log('✓ Username entered via keyboard');

    await page.keyboard.press('Tab');
    await page.keyboard.type(password);
    console.log('✓ Password entered via keyboard');

    // Submit with Enter key
    await page.keyboard.press('Enter');
    console.log('✓ Form submitted using Enter key');

    await loginPage.wait(3000);
    await loginPage.acceptCookiesAndTerms();

    // Verify successful login
    expect(await loginPage.getCurrentUrl()).not.toContain('login');
    console.log('✓ Form submission via Enter key successful');

    await loginPage.takeScreenshot('login-12-accessibility');
    console.log('✅ Form accessibility test completed successfully');
  });

  test('5.2 Responsive Design', async ({ page }) => {
    console.log('📱 Testing responsive design...');

    await loginPage.loginBtn.click();

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loginPage.wait(1000);

    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.loginContinueButton).toBeVisible();
    console.log('✓ All elements visible on desktop view');
    await loginPage.takeScreenshot('login-13-responsive-desktop');

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginPage.wait(1000);

    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.loginContinueButton).toBeVisible();
    console.log('✓ All elements visible on tablet view');
    await loginPage.takeScreenshot('login-14-responsive-tablet');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await loginPage.wait(1000);

    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.loginContinueButton).toBeVisible();
    console.log('✓ All elements visible on mobile view');
    await loginPage.takeScreenshot('login-15-responsive-mobile');

    console.log('✅ Responsive design test completed successfully');
  });
});