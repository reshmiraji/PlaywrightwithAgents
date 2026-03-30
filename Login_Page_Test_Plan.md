# Login Page - Comprehensive Test Plan

## Application Overview

The Login Page is the authentication gateway for the ISBA Agent Testing application (test-cmm.origincrossmedia.com). This critical interface validates user credentials and grants access to the reporting dashboard and other protected features. The application features:

- **Authentication**: Email/username and password-based login
- **Session Management**: Maintains user sessions after successful authentication
- **Error Handling**: Provides clear feedback for invalid credentials and validation errors
- **Security**: Implements secure authentication protocols
- **User Experience**: Streamlined login process with proper form validation
- **Cookie/Terms Acceptance**: Integrated cookie and terms acceptance workflow

## Test Scenarios

### 1. Successful Login Flow

**Seed:** `tests/seed.spec.ts`

#### 1.1 Valid Credentials Login
**Steps:**
1. Navigate to the login page (https://test-cmm.origincrossmedia.com/)
2. Enter valid email address in the username field (e.g., "reshmi.raji@accenture.com")
3. Enter valid password in the password field (e.g., "Welcome@124")
4. Click the "Login" button
5. Accept cookies and terms if prompted

**Expected Results:**
- User is successfully authenticated
- Redirect to dashboard or main application page
- No error messages are displayed
- Session is established (user remains logged in on page refresh)
- Login page is no longer accessible without logout

#### 1.2 Remember Me Functionality (if available)
**Steps:**
1. Navigate to the login page
2. Enter valid credentials
3. Check "Remember Me" checkbox (if present)
4. Click "Login"
5. Close browser and reopen
6. Navigate to the application

**Expected Results:**
- User remains logged in after browser restart
- No need to re-enter credentials

### 2. Invalid Credentials Handling

#### 2.1 Invalid Email/Username
**Steps:**
1. Navigate to the login page
2. Enter invalid email address (e.g., "invalid@example.com")
3. Enter valid password
4. Click "Login"

**Expected Results:**
- Error message displayed indicating invalid credentials
- User remains on login page
- No session is established
- Password field may be cleared for security

#### 2.2 Invalid Password
**Steps:**
1. Navigate to the login page
2. Enter valid email address
3. Enter incorrect password (e.g., "wrongpassword")
4. Click "Login"

**Expected Results:**
- Error message displayed indicating invalid credentials
- User remains on login page
- No session is established

#### 2.3 Both Credentials Invalid
**Steps:**
1. Navigate to the login page
2. Enter invalid email address
3. Enter invalid password
4. Click "Login"

**Expected Results:**
- Error message displayed indicating invalid credentials
- User remains on login page
- No session is established

### 3. Form Validation

#### 3.1 Empty Username Field
**Steps:**
1. Navigate to the login page
2. Leave username field blank
3. Enter valid password
4. Click "Login"

**Expected Results:**
- Validation error message for required username field
- Form submission is prevented
- User remains on login page

#### 3.2 Empty Password Field
**Steps:**
1. Navigate to the login page
2. Enter valid username
3. Leave password field blank
4. Click "Login"

**Expected Results:**
- Validation error message for required password field
- Form submission is prevented
- User remains on login page

#### 3.3 Both Fields Empty
**Steps:**
1. Navigate to the login page
2. Leave both username and password fields blank
3. Click "Login"

**Expected Results:**
- Validation error messages for both required fields
- Form submission is prevented
- User remains on login page

#### 3.4 Invalid Email Format
**Steps:**
1. Navigate to the login page
2. Enter malformed email (e.g., "notanemail")
3. Enter valid password
4. Click "Login"

**Expected Results:**
- Email format validation error message
- Form submission is prevented or server returns validation error

### 4. Security Features

#### 4.1 Password Field Masking
**Steps:**
1. Navigate to the login page
2. Click in the password field
3. Type any text

**Expected Results:**
- Entered text is masked (shows dots or asterisks)
- Password content is not visible in plain text

#### 4.2 Password Visibility Toggle (if available)
**Steps:**
1. Navigate to the login page
2. Enter password
3. Click password visibility toggle button (eye icon)
4. Click toggle again

**Expected Results:**
- First click shows password in plain text
- Second click masks password again

#### 4.3 Account Lockout Protection (if implemented)
**Steps:**
1. Navigate to the login page
2. Enter valid username
3. Enter incorrect password 5+ times consecutively
4. Attempt to login with correct credentials

**Expected Results:**
- Account is temporarily locked after multiple failed attempts
- Clear message about account lockout and recovery options
- Valid credentials are rejected during lockout period

### 5. User Interface and Experience

#### 5.1 Form Element Accessibility
**Steps:**
1. Navigate to the login page
2. Use Tab key to navigate through form elements
3. Use Enter key to submit form
4. Test with screen reader (if available)

**Expected Results:**
- All form elements are keyboard accessible
- Tab order is logical (username → password → login button)
- Form can be submitted with Enter key
- Proper ARIA labels and accessibility attributes

#### 5.2 Responsive Design
**Steps:**
1. Navigate to the login page on desktop browser
2. Resize browser window to mobile dimensions
3. Test on actual mobile device (if available)

**Expected Results:**
- Login form remains functional at all screen sizes
- Elements are properly sized and positioned
- Text remains readable
- Touch targets are appropriately sized for mobile

#### 5.3 Error Message Display and Dismissal
**Steps:**
1. Trigger a login error (invalid credentials)
2. Observe error message display
3. Start typing in username field
4. Start typing in password field

**Expected Results:**
- Error message is clearly visible and well-positioned
- Error message disappears when user starts correcting input
- Multiple error messages are handled gracefully

### 6. Browser Compatibility

#### 6.1 Cross-Browser Testing
**Steps:**
1. Test login functionality in Chrome
2. Test login functionality in Firefox
3. Test login functionality in Safari
4. Test login functionality in Edge

**Expected Results:**
- Login works consistently across all major browsers
- UI appearance is consistent
- No JavaScript errors in browser console

### 7. Performance and Loading

#### 7.1 Page Load Performance
**Steps:**
1. Navigate to login page
2. Measure page load time
3. Check for loading indicators

**Expected Results:**
- Page loads within acceptable time (< 3 seconds)
- No broken images or missing resources
- Appropriate loading states if needed

#### 7.2 Network Failure Handling
**Steps:**
1. Navigate to login page
2. Disconnect network connection
3. Attempt to login
4. Reconnect network
5. Retry login

**Expected Results:**
- Clear error message when network is unavailable
- Graceful recovery when network is restored
- No application crash or hanging state

### 8. Session Management

#### 8.1 Session Timeout
**Steps:**
1. Successfully log in
2. Remain idle for extended period
3. Attempt to perform an action

**Expected Results:**
- User is automatically logged out after timeout
- Redirect to login page with appropriate message
- Session data is cleared

#### 8.2 Logout Functionality
**Steps:**
1. Successfully log in
2. Navigate to logout option
3. Click logout
4. Attempt to access protected pages directly

**Expected Results:**
- User is logged out successfully
- Redirect to login page
- Protected pages are inaccessible without re-authentication

### 9. Integration Testing

#### 9.1 Cookie and Terms Acceptance Flow
**Steps:**
1. Navigate to login page (fresh browser session)
2. Enter valid credentials
3. Click login
4. Accept cookies when prompted
5. Accept terms and conditions when prompted

**Expected Results:**
- Cookie acceptance workflow functions properly
- Terms acceptance workflow functions properly
- User successfully reaches dashboard after all acceptances
- Preferences are remembered for future sessions

#### 9.2 Deep Link After Login
**Steps:**
1. Attempt to access protected URL directly (while logged out)
2. Complete login process
3. Verify redirect destination

**Expected Results:**
- User is redirected to login page
- After successful login, user is taken to originally requested page
- URL parameters and state are preserved

### 10. Edge Cases and Error Scenarios

#### 10.1 Special Characters in Credentials
**Steps:**
1. Enter credentials containing special characters (!@#$%^&*)
2. Enter credentials with unicode characters
3. Enter extremely long credentials

**Expected Results:**
- Application handles special characters gracefully
- No application errors or crashes
- Appropriate validation messages if characters are not allowed

#### 10.2 SQL Injection Attempts
**Steps:**
1. Enter common SQL injection patterns in username field
2. Enter SQL injection patterns in password field
3. Attempt login

**Expected Results:**
- No SQL errors are displayed
- No unauthorized access is granted
- Application remains stable

#### 10.3 XSS Prevention
**Steps:**
1. Enter JavaScript code in username field
2. Enter script tags in form fields
3. Attempt login

**Expected Results:**
- Scripts are not executed
- No JavaScript alerts or malicious behavior
- Input is properly sanitized

### 11. API and Backend Integration

#### 11.1 Authentication API Response Handling
**Steps:**
1. Monitor network requests during login
2. Verify API response codes
3. Check request/response headers

**Expected Results:**
- Appropriate HTTP status codes (200 for success, 401 for unauthorized)
- Secure headers are present
- No sensitive data exposed in client-side code

## Quality Standards

- All scenarios must pass consistently across multiple test runs
- Tests should be automated where possible using Playwright
- Manual testing required for accessibility and visual validation
- Performance benchmarks should be established and monitored
- Security testing should be performed regularly

## Test Environment Requirements

- Test Environment: https://test-cmm.origincrossmedia.com/
- Valid Test Credentials: Available in test configuration
- Multiple Browser Support: Chrome, Firefox, Safari, Edge
- Mobile Device Testing: iOS and Android devices
- Network Simulation: Slow 3G, Offline scenarios

## Automation Notes

- Leverage existing LoginPage class for consistent automation
- Implement fallback login methods for different UI variations
- Use explicit waits for network-dependent operations
- Capture screenshots for visual regression testing
- Log detailed test execution information for debugging

This comprehensive test plan ensures the Login Page functionality is thoroughly validated across all critical user scenarios, security requirements, and technical specifications.