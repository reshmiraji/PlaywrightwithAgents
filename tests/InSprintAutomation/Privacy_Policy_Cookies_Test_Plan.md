# Privacy Policy & Cookies Pop-up Test Plan

## Test Overview
**Feature**: ORIGIN Privacy Notice and Cookies Pop-up Compliance
**Version**: 1.0
**Date**: November 19, 2025
**Environment**: Test Environment (https://test-cmm.origincrossmedia.com/)

---

## Acceptance Criteria

### AC1 - ORIGIN Privacy Notice Updated to Last Version
**GIVEN** I clicked on 'Privacy Policy' link on the navigation bar  
**WHEN** I read the 'Privacy Policy' content  
**THEN** It reflects the most recent updates

### AC2 - ORIGIN Cookies Pop-up
**GIVEN** I have logged into Origin  
**WHEN** I am prompted with the cookies pop-up  
**THEN** The copy is updated at the last version  
**AND** The Performance Cookies are indicated as 'Always active'

---

## Test Scenarios

### 1. Privacy Policy Link Accessibility and Navigation

#### 1.1 Privacy Policy Link Visibility on Navigation Bar
**Objective**: Verify that the Privacy Policy link is visible and accessible on the navigation bar

**Pre-conditions**:
- User is logged into Origin application
- User is on the main dashboard

**Test Steps**:
1. Navigate to Origin login page
2. Log in with valid credentials
3. Accept cookies if prompted
4. Locate the Privacy Policy link on the navigation bar
5. Verify the link is visible and clickable

**Expected Results**:
- Privacy Policy link is visible in the navigation bar
- Link text clearly indicates "Privacy Policy" or similar
- Link is clickable and not disabled
- Link has proper styling and accessibility attributes

**Test Data**: Valid user credentials from credential.properties

---

#### 1.2 Privacy Policy Link Click Navigation
**Objective**: Verify clicking Privacy Policy link opens the privacy policy page/modal

**Pre-conditions**:
- User is logged into Origin application
- Privacy Policy link is visible

**Test Steps**:
1. Log in to Origin application
2. Locate the Privacy Policy link
3. Click on the Privacy Policy link
4. Observe the navigation/modal behavior
5. Verify the Privacy Policy content is displayed

**Expected Results**:
- Clicking the link opens Privacy Policy content (new tab, modal, or in-page)
- Privacy Policy content loads completely
- Page/modal header indicates "Privacy Policy" or "Privacy Notice"
- Content is readable and properly formatted

**Test Data**: Valid user credentials

---

#### 1.3 Privacy Policy Content Verification - Recent Updates
**Objective**: Verify that the Privacy Policy content reflects the most recent updates

**Pre-conditions**:
- User has navigated to Privacy Policy page/modal
- Latest Privacy Policy version date is known

**Test Steps**:
1. Open the Privacy Policy from navigation bar
2. Locate the version date or "Last Updated" information
3. Read the Privacy Policy content
4. Verify key sections are present:
   - Data collection practices
   - Cookie usage information
   - User rights
   - Contact information
   - Legal compliance statements
5. Compare version date with expected latest version
6. Verify content matches the latest approved copy

**Expected Results**:
- Privacy Policy displays "Last Updated" or version date
- Version date matches or exceeds the expected latest update date
- All required sections are present and accurate
- Content reflects current legal requirements and company practices
- Language is clear and compliant with GDPR/privacy regulations

**Test Data**: 
- Latest Privacy Policy version date
- Privacy Policy content checklist

---

#### 1.4 Privacy Policy Content Readability and Formatting
**Objective**: Verify the Privacy Policy is properly formatted and readable

**Pre-conditions**:
- User has opened Privacy Policy

**Test Steps**:
1. Open Privacy Policy
2. Verify text formatting (headings, paragraphs, lists)
3. Check for proper line breaks and spacing
4. Verify hyperlinks work (if any)
5. Test scrolling functionality
6. Test on different viewport sizes (desktop, tablet, mobile)

**Expected Results**:
- Text is properly formatted with clear headings
- Content is organized in logical sections
- Hyperlinks are functional and open correctly
- Scrolling works smoothly
- Content is responsive and readable on all devices

---

### 2. Cookies Pop-up Display and Content

#### 2.1 Cookies Pop-up Display on Login
**Objective**: Verify cookies pop-up appears after login

**Pre-conditions**:
- User has not previously accepted cookies (fresh browser session)
- User has valid credentials

**Test Steps**:
1. Clear browser cookies and cache
2. Navigate to Origin login page
3. Enter valid credentials
4. Click login/continue button
5. Observe for cookies pop-up display

**Expected Results**:
- Cookies pop-up appears immediately after successful authentication
- Pop-up is displayed prominently (modal or banner)
- Pop-up content is visible and not obscured
- User cannot proceed without acknowledging the pop-up

**Test Data**: Valid user credentials

---

#### 2.2 Cookies Pop-up Content - Updated Copy Verification
**Objective**: Verify the cookies pop-up contains the most recent copy/content

**Pre-conditions**:
- Cookies pop-up is displayed
- Latest approved cookies copy is available for comparison

**Test Steps**:
1. Trigger cookies pop-up display
2. Read the complete cookies notice text
3. Verify the following content elements:
   - Main cookie usage description
   - Types of cookies listed
   - Cookie categories (Essential, Performance, etc.)
   - Purpose of each cookie type
   - User consent options
4. Compare displayed text with latest approved copy
5. Check for typos or formatting issues

**Expected Results**:
- Cookies pop-up displays the latest approved content version
- All text matches the approved copy exactly
- No typos or grammatical errors
- Content is clear and easy to understand
- Legal language is accurate and compliant

**Test Data**: 
- Latest approved cookies notice copy
- Cookies content checklist

---

#### 2.3 Performance Cookies - "Always Active" Indication
**Objective**: Verify Performance Cookies are marked as "Always active"

**Pre-conditions**:
- Cookies pop-up is displayed

**Test Steps**:
1. Display cookies pop-up
2. Locate the Performance Cookies section/option
3. Verify the status indicator for Performance Cookies
4. Check if toggle/checkbox is disabled or marked as "Always active"
5. Attempt to toggle Performance Cookies (should not be possible)
6. Verify explanatory text about why Performance Cookies are always active

**Expected Results**:
- Performance Cookies section is clearly visible
- Status shows "Always active" or equivalent indicator
- Toggle/checkbox is disabled (greyed out or removed)
- User cannot disable Performance Cookies
- Explanatory text explains why Performance Cookies are mandatory
- Visual styling clearly indicates non-optional status

**Test Data**: N/A

---

#### 2.4 Essential/Required Cookies - "Always Active" Status
**Objective**: Verify Essential/Required cookies are also marked as always active

**Pre-conditions**:
- Cookies pop-up is displayed

**Test Steps**:
1. Display cookies pop-up
2. Locate Essential/Required Cookies section
3. Verify the status shows "Always active" or equivalent
4. Verify user cannot disable essential cookies
5. Check for explanatory text about essential cookies

**Expected Results**:
- Essential cookies are marked as "Always active"
- Toggle is disabled or not present
- Explanatory text clarifies why these cookies are necessary
- Visual distinction from optional cookie categories

---

#### 2.5 Optional Cookie Categories
**Objective**: Verify optional cookie categories can be toggled

**Pre-conditions**:
- Cookies pop-up is displayed

**Test Steps**:
1. Display cookies pop-up
2. Identify optional cookie categories (Marketing, Analytics, etc.)
3. Verify toggles/checkboxes are enabled for optional categories
4. Toggle each optional category ON and OFF
5. Verify visual feedback when toggling
6. Save preferences and verify acceptance

**Expected Results**:
- Optional cookie categories have functional toggles
- Toggles provide clear ON/OFF states
- Visual feedback confirms user selection
- User can customize cookie preferences
- Changes are saved when confirmed

---

### 3. Cookies Pop-up Interaction and Acceptance

#### 3.1 Accept All Cookies Button
**Objective**: Verify "Accept All" button functionality

**Pre-conditions**:
- Cookies pop-up is displayed

**Test Steps**:
1. Display cookies pop-up
2. Locate "Accept All" or equivalent button
3. Click the "Accept All" button
4. Verify pop-up closes
5. Verify user is redirected to dashboard
6. Check browser storage for cookie consent flags

**Expected Results**:
- "Accept All" button is clearly visible and prominent
- Clicking button accepts all cookies
- Pop-up closes immediately
- User proceeds to main application
- Cookie consent is stored in browser
- Pop-up does not reappear on subsequent sessions

**Test Data**: Valid user credentials

---

#### 3.2 Reject/Manage Cookies Functionality
**Objective**: Verify users can reject or customize cookie preferences

**Pre-conditions**:
- Cookies pop-up is displayed

**Test Steps**:
1. Display cookies pop-up
2. Locate "Reject All" or "Manage Preferences" button
3. Click the button
4. If customization panel opens, modify preferences
5. Save customized preferences
6. Verify only selected cookies are enabled

**Expected Results**:
- Reject/Manage option is available
- User can customize cookie categories
- Performance Cookies remain "Always active" even when rejecting
- Preferences are saved correctly
- Application functions with limited cookies

---

#### 3.3 Cookies Pop-up Close/Dismiss Behavior
**Objective**: Verify behavior when trying to close pop-up without selection

**Pre-conditions**:
- Cookies pop-up is displayed

**Test Steps**:
1. Display cookies pop-up
2. Look for close (X) button or ESC key behavior
3. Attempt to close without making selection
4. Verify expected behavior (forced selection or default acceptance)

**Expected Results**:
- Pop-up cannot be dismissed without cookie selection, OR
- Closing without selection applies default settings (essential cookies only)
- User experience is clear about cookie requirements
- No error messages displayed

---

### 4. Cookie Policy Link from Cookies Pop-up

#### 4.1 Link to Full Cookie Policy from Pop-up
**Objective**: Verify link to detailed cookie policy from cookies pop-up

**Pre-conditions**:
- Cookies pop-up is displayed

**Test Steps**:
1. Display cookies pop-up
2. Locate "Learn More", "Cookie Policy", or similar link
3. Click the link
4. Verify detailed cookie policy opens
5. Verify link opens in new tab (if applicable)
6. Return to cookies pop-up and verify it's still visible

**Expected Results**:
- Link to full cookie policy is visible in pop-up
- Link opens detailed cookie policy page
- Policy page contains comprehensive cookie information
- Original cookies pop-up remains accessible
- User can return and make selection

---

### 5. Responsive Design and Accessibility

#### 5.1 Cookies Pop-up Responsive Design
**Objective**: Verify cookies pop-up displays correctly on all devices

**Pre-conditions**:
- Access to different viewport sizes

**Test Steps**:
1. Display cookies pop-up on desktop (1920x1080)
2. Test on tablet viewport (768x1024)
3. Test on mobile viewport (375x667)
4. Verify content readability on each size
5. Verify buttons are accessible
6. Test scrolling if content overflows

**Expected Results**:
- Pop-up scales appropriately for each viewport
- All content remains readable
- Buttons are easily clickable
- No content is cut off or hidden
- Mobile experience is user-friendly

---

#### 5.2 Privacy Policy Link Accessibility
**Objective**: Verify Privacy Policy link is accessible via keyboard navigation

**Pre-conditions**:
- User is on dashboard

**Test Steps**:
1. Navigate dashboard using Tab key
2. Locate Privacy Policy link via keyboard
3. Press Enter to activate link
4. Verify keyboard focus indicators are visible
5. Test screen reader compatibility

**Expected Results**:
- Privacy Policy link is reachable via keyboard
- Focus indicators are clear and visible
- Enter key activates the link
- Screen readers announce link correctly
- ARIA labels are properly implemented

---

#### 5.3 Cookies Pop-up Keyboard Navigation
**Objective**: Verify cookies pop-up can be navigated with keyboard

**Pre-conditions**:
- Cookies pop-up is displayed

**Test Steps**:
1. Display cookies pop-up
2. Use Tab key to navigate through elements
3. Test toggling cookies with Space/Enter keys
4. Navigate to Accept/Reject buttons
5. Activate buttons with Enter key
6. Verify focus trap within modal

**Expected Results**:
- All interactive elements are keyboard accessible
- Tab order is logical
- Toggles can be activated via keyboard
- Buttons can be activated via Enter
- Focus is trapped within modal while open
- ESC key behavior is appropriate

---

### 6. Persistence and Re-display Logic

#### 6.1 Cookies Preference Persistence
**Objective**: Verify cookie preferences persist across sessions

**Pre-conditions**:
- User has accepted cookies

**Test Steps**:
1. Accept cookies (or customize preferences)
2. Navigate through application
3. Log out
4. Close browser
5. Reopen browser and log in again
6. Verify cookies pop-up does not reappear

**Expected Results**:
- Cookie preferences are saved in browser storage
- Pop-up does not reappear after acceptance
- Preferences persist across sessions
- User is not repeatedly prompted

---

#### 6.2 Cookies Pop-up Re-display After Preference Clearing
**Objective**: Verify pop-up reappears when cookies/preferences are cleared

**Pre-conditions**:
- User previously accepted cookies

**Test Steps**:
1. Accept cookies in initial session
2. Clear browser cookies and cache
3. Log in again
4. Verify cookies pop-up appears again

**Expected Results**:
- Clearing cookies resets consent status
- Pop-up appears again after clearing
- User can make new selection
- No errors occur

---

### 7. Cross-browser Compatibility

#### 7.1 Privacy Policy and Cookies on Chrome
**Objective**: Verify functionality on Google Chrome

**Test Steps**:
1. Test all scenarios on latest Chrome version
2. Verify rendering and functionality
3. Check console for errors

**Expected Results**:
- All features work correctly on Chrome
- No console errors
- Proper rendering

---

#### 7.2 Privacy Policy and Cookies on Firefox
**Objective**: Verify functionality on Mozilla Firefox

**Test Steps**:
1. Test all scenarios on latest Firefox version
2. Verify rendering and functionality
3. Check console for errors

**Expected Results**:
- All features work correctly on Firefox
- No console errors
- Proper rendering

---

#### 7.3 Privacy Policy and Cookies on Safari
**Objective**: Verify functionality on Safari

**Test Steps**:
1. Test all scenarios on latest Safari version
2. Verify rendering and functionality
3. Check console for errors

**Expected Results**:
- All features work correctly on Safari
- No console errors
- Proper rendering

---

#### 7.4 Privacy Policy and Cookies on Edge
**Objective**: Verify functionality on Microsoft Edge

**Test Steps**:
1. Test all scenarios on latest Edge version
2. Verify rendering and functionality
3. Check console for errors

**Expected Results**:
- All features work correctly on Edge
- No console errors
- Proper rendering

---

## Test Data Requirements

| Data Type | Description | Source |
|-----------|-------------|--------|
| Valid Credentials | Username and password for login | credential.properties |
| Latest Privacy Policy Version | Current version date and content | Legal/Compliance team |
| Approved Cookies Copy | Latest cookies notice text | Legal/Compliance team |
| Cookie Categories | List of cookie types and their status | Requirements document |
| Browser Versions | Supported browser versions | Technical specifications |

---

## Test Environment Setup

**Pre-requisites**:
- Test environment URL: https://test-cmm.origincrossmedia.com/
- Valid test user credentials in credential.properties
- Access to latest Privacy Policy and Cookies documentation
- Multiple browsers installed for cross-browser testing
- Different devices/viewports for responsive testing

**Configuration**:
- Playwright Test framework configured
- Headless mode: false (for visual verification)
- Screenshots enabled on failure
- Video recording enabled for failed tests

---

## Test Execution Criteria

### Entry Criteria:
- Test environment is accessible
- Latest Privacy Policy and Cookies copy is available
- Test credentials are valid
- All required browsers are installed
- Test framework is configured

### Exit Criteria:
- All test scenarios executed
- Pass rate >= 95%
- All critical defects resolved
- Privacy Policy displays latest content
- Performance Cookies marked as "Always active"
- Test report generated

---

## Defect Severity Guidelines

**Critical**:
- Privacy Policy displays outdated content
- Performance Cookies not marked as "Always active"
- Cookies pop-up not appearing
- User unable to access application

**High**:
- Privacy Policy link not working
- Cookies pop-up content has typos or errors
- Cannot accept/reject cookies
- Accessibility issues preventing usage

**Medium**:
- Formatting issues in Privacy Policy
- Visual inconsistencies
- Minor text errors
- Cross-browser rendering differences

**Low**:
- Cosmetic issues
- Tooltip inconsistencies
- Minor UX improvements

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|---------|-----------|
| Outdated Privacy Policy content | High | Verify with Legal team before testing |
| Cookies pop-up not displaying | High | Test in multiple browsers and clean sessions |
| Performance Cookies toggle functional | Critical | Automated checks for disabled state |
| Cross-browser inconsistencies | Medium | Test on all supported browsers |
| Responsive design issues | Medium | Test on multiple viewport sizes |

---

## Test Deliverables

1. Test execution report with results
2. Screenshots of Privacy Policy and Cookies pop-up
3. Defect reports (if any)
4. Browser compatibility matrix
5. Test coverage metrics
6. Recommendations for improvements

---

## Automation Recommendations

**High Priority for Automation**:
- Cookies pop-up display verification
- Performance Cookies "Always active" check
- Privacy Policy link navigation
- Cookie preference persistence
- Cross-browser testing

**Manual Testing Required**:
- Content accuracy verification (compare with approved copy)
- Visual design review
- User experience assessment
- Accessibility evaluation

---

## Notes and Assumptions

- Privacy Policy content verification requires access to approved legal copy
- "Always active" for Performance Cookies is a business requirement
- Cookies preferences should persist in browser local storage
- Pop-up should follow GDPR/privacy regulation best practices
- Test assumes English language version (add localization tests if needed)

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | | | |
| QA Manager | | | |
| Product Owner | | | |
| Compliance Officer | | | |

---

**Document Version**: 1.0  
**Last Updated**: November 19, 2025  
**Next Review Date**: As needed based on Privacy Policy updates
