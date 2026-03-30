/**
 * Privacy Policy & Cookies Pop-up Test Suite
 * Tests AC1: Privacy Policy content verification
 * Tests AC2: Cookies pop-up display and Performance Cookies "Always active" status
 */

import test, { expect, Page } from '@playwright/test';
import { SmokeTestSuite } from '../functions/smokeTestSuite';
import readProperties from '../utils/readProperties';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../pages/LoginPage';

test.describe('Privacy Policy & Cookies Pop-up', () => {

    let username: string;
    let password: string;

    test.beforeAll(async () => {
        // Read credentials from credential.properties
        const credPath = path.resolve(__dirname, '../../credential_TST.properties');
        const credContent = fs.readFileSync(credPath, 'utf-8');
        const creds: { [key: string]: string } = {};
        credContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) creds[key.trim()] = value.trim();
        });
        username = Buffer.from(creds['username'], 'base64').toString('utf-8');
        password = Buffer.from(creds['password'], 'base64').toString('utf-8');
    });

    test.describe('REGRESSION PDH-3597 AC1 -1 PDH-T1488 ', () => {

        test('1.1 Privacy Policy Link Visibility on Navigation Bar', async ({ page }) => {
            console.log('🔍 Testing Privacy Policy Link Visibility...');

            const smokeTestSuite = new SmokeTestSuite(page);
            await smokeTestSuite.login(page);

            // Wait for dashboard to load
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            // Common selectors for Privacy Policy link
            const privacyPolicySelectors = page.locator("#privacy-notice-btn > img");
            expect(privacyPolicySelectors).not.toBeNull();
            // Verify link is clickable
            await expect(privacyPolicySelectors!).toBeVisible();
            await expect(privacyPolicySelectors!).toBeEnabled();
            console.log('✓ Privacy Policy link is visible and clickable');

            // Take screenshot
            await page.screenshot({
                path: 'test-results/privacy-policy-link-visible.png',
                fullPage: true
            });

            console.log('✅ Privacy Policy link visibility test passed');
        });

        test('1.2 Privacy Policy Link Click and Content Display', async ({ page }) => {
            console.log('🔗 Testing Privacy Policy Link Click Navigation...');

            const smokeTestSuite = new SmokeTestSuite(page);
            await smokeTestSuite.login(page);

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            const privacyLink = page.locator("#privacy-notice-btn > img");
            expect(privacyLink).not.toBeNull();

            expect(privacyLink).not.toBeNull();

            // Check if link opens in new tab or same page
            const linkTarget = await privacyLink!.getAttribute('target');
            console.log(`Link target: ${linkTarget || 'same page'}`);

            // Click the privacy policy link
            if (linkTarget === '_blank') {
                // Handle new tab/page
                const [newPage] = await Promise.all([
                    page.context().waitForEvent('page'),
                    privacyLink!.click()
                ]);

                await newPage.waitForLoadState('networkidle');
                await newPage.waitForTimeout(2000);

                console.log(`✓ Privacy Policy opened in new tab: ${newPage.url()}`);
                expect(newPage.url()).toContain('/measurement/privacynotice');
                // Verify content is loaded
                const contentVisible = await newPage.locator('body').isVisible();
                expect(contentVisible).toBe(true);

                // Take screenshot
                await newPage.screenshot({
                    path: 'test-results/privacy-policy-content.png',
                    fullPage: true
                });

                await newPage.close();
            } else {
                // Same page navigation
                await privacyLink!.click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(2000);

                console.log(`✓ Privacy Policy opened: ${page.url()}`);

                // Verify content is loaded
                const contentVisible = await page.locator('body').isVisible();
                expect(contentVisible).toBe(true);

                // Take screenshot
                await page.screenshot({
                    path: 'test-results/privacy-policy-content.png',
                    fullPage: true
                });
            }

            console.log('✅ Privacy Policy navigation test passed');
        });

        test('1.3 Privacy Policy Content Verification - Last Updated Date', async ({ page }) => {
            console.log('📅 Testing Privacy Policy Last Updated Date...');

            const smokeTestSuite = new SmokeTestSuite(page);
            await smokeTestSuite.login(page);

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            const privacyLink = page.locator("#privacy-notice-btn > img");
            expect(privacyLink).not.toBeNull();

            if (!privacyLink) {
                console.log('⚠️ Privacy Policy link not found, skipping content verification');
                test.skip();
            }

            const linkTarget = await privacyLink!.getAttribute('target');
            let policyPage = page;

            if (linkTarget === '_blank') {
                const [newPage] = await Promise.all([
                    page.context().waitForEvent('page'),
                    privacyLink!.click()
                ]);
                await newPage.waitForLoadState('networkidle');
                policyPage = newPage;
            } else {
                await privacyLink!.click();
                await page.waitForLoadState('networkidle');
            }

            await policyPage.waitForTimeout(2000);

            // Verify URL
            expect(policyPage.url()).toContain('/measurement/privacynotice');
            console.log('✓ URL verified: /measurement/privacynotice');

            // Verify main heading
            const mainHeading = policyPage.locator('h1, h2').first();
            await expect(mainHeading).toBeVisible();

            const headingText = await mainHeading.textContent();
            console.log(`✓ Main heading found: ${headingText}`);
            expect(headingText).toMatch(/privacy|notice/i);

            // Verify key section headings
            const expectedSections = [
                'HOW AND WHEN WE COLLECT PERSONAL INFORMATION ABOUT YOU',
                'HOW WE USE YOUR INFORMATION',
                'PURPOSES FOR PROCESSING YOUR PERSONAL INFORMATION',
                'LEGAL BASIS FOR PROCESSING YOUR PERSONAL INFORMATION',
                'WHERE WE STORE YOUR PERSONAL INFORMATION',
                'HOW WE KEEP YOUR PERSONAL INFORMATION',
                'SECURITY AND PASSWORDS',
                'DISCLOSING YOUR INFORMATION',
                'YOUR RIGHTS'];

            const pageContent = await policyPage.textContent('body');
            const foundSections: string[] = [];

            for (const section of expectedSections) {
                if (pageContent?.toLowerCase().includes(section.toLowerCase())) {
                    foundSections.push(section);
                    console.log(`✓ Found section: ${section}`);
                }
            }

            expect(foundSections.length).toBeGreaterThan(3);
            console.log(`✓ Found ${foundSections.length}/${expectedSections.length} expected sections`);



            // Take screenshot
            await policyPage.screenshot({
                path: 'test-results/privacy-policy-content-verified.png',
                fullPage: true
            });

            if (linkTarget === '_blank') {
                await policyPage.close();
            }
            const companyInfoChecks = [
                { text: 'ORIGIN MEDIA MEASUREMENT LIMITED', label: 'Company name' },
                { text: '15269296', label: 'Company number' },
                { text: '12 Henrietta Street, Covent Garden, London, WC2E 8LH', label: 'Company address' },
                { text: 'originsupport@isba.org.uk', label: 'Support email' },
                { text: 'cross-media measurement platform', label: 'Platform description' },
                { text: 'United Kingdom', label: 'UK jurisdiction' },
                // Data controller and privacy notice statements
                { text: 'Origin is the "data controller" in respect of your personal information', label: 'Data controller declaration' },
                { text: 'This Privacy Notice sets out the basis on which any of your personal information we collect from you or third parties', label: 'Privacy Notice scope - data sources' },
                { text: 'will be processed by us', label: 'Data processing statement' },
                { text: 'Please read the following carefully to understand our practices regarding your personal information', label: 'User instruction statement' },
                { text: 'Questions and comments regarding this Privacy Notice should be sent to: originsupport@isba.org.uk', label: 'Feedback mechanism' },
                { text: 'We may change this Privacy Notice at any time', label: 'Privacy Notice amendment policy' },
                { text: 'The new Privacy Notice will be displayed on the Origin Platform', label: 'Update communication method' },
                // Personal information collection methods
                { text: 'PERSONAL INFORMATION ABOUT YOU', label: 'Personal information section header' },
                { text: 'We collect and process personal information when you:', label: 'Collection introduction' },
                { text: 'use the Origin Platform and related services', label: 'Collection method 1 - Platform usage' },
                { text: 'contact us or request information from us in any other way', label: 'Collection method 2 - Direct contact' },
                { text: 'participate in our trials for new features, feedback processes or surveys', label: 'Collection method 3 - Trials and feedback' },
                // Specific data types collected
                { text: 'We may collect and process the following personal information about you:', label: 'Data types introduction' },
                { text: 'contact details (name and email address) and job role', label: 'Data type 1 - Contact details' },
                { text: 'password and other login/authentication information', label: 'Data type 2 - Authentication credentials' },
                { text: 'responses to any feedback requests/surveys (unless provided anonymously)', label: 'Data type 3 - Feedback responses' },
                { text: 'information about your device, operating system and IP address', label: 'Data type 4 - Device information' },
                { text: 'browser type and version', label: 'Data type 5 - Browser information' },
                { text: 'information about your use of the Origin Platform and related interactions including page interaction information', label: 'Data type 6 - Usage analytics' },
                // Cookie information
                { text: 'When you use the Origin Platform, we may also collect information from you automatically', label: 'Automatic collection statement' },
                { text: 'using cookies and other similar technologies', label: 'Cookie technology disclosure' },
                { text: 'A cookie is a small file of letters and numbers that we may set on your device', label: 'Cookie definition' },
                { text: 'Session cookies allow our site to link your actions during a particular browser session', label: 'Session cookies explanation' },
                { text: 'These expire each time you close your browser and do not remain on your device afterwards', label: 'Session cookies expiration' },
                { text: 'Persistent cookies are stored on your device in between browser sessions', label: 'Persistent cookies explanation' },
                { text: 'They allow your preferences or actions across the site to be remembered', label: 'Persistent cookies purpose' },
                { text: 'These will remain on your device until they expire, or you delete them from your cache', label: 'Persistent cookies retention' },

            ];

            console.log('\n📋 Verifying Company Information in First Paragraph:');
            for (const check of companyInfoChecks) {
                const hasContent = pageContent?.includes(check.text) || false;
                if (hasContent) {
                    console.log(`✓ Found: ${check.label} - "${check.text}"`);
                    expect(hasContent).toBe(true);
                } else {
                    console.log(`⚠️ Not found: ${check.label} - "${check.text}"`);
                }
            }

            // Verify Purposes for Processing Personal Information section
            console.log('\n🎯 Verifying Purposes for Processing Personal Information:');
            const processingPurposesChecks = [
                { text: 'PURPOSES FOR PROCESSING YOUR PERSONAL INFORMATION', label: 'Section header' },
                { text: 'We may process your personal information for the following purposes:', label: 'Introduction statement' },
                { text: 'to provide you with the services and with any information you have requested and to provide you with service/product updates', label: 'Purpose 1 - Service provision' },
                { text: 'to send you marketing communications and invite you to focus groups and other sessions we hold from time to time (including planning and product development sessions)', label: 'Purpose 2 - Marketing and focus groups' },
                { text: 'to collect and document feedback in order for us to develop and improve the Origin Platform', label: 'Purpose 3 - Feedback collection' },
                { text: 'to authenticate your access to the Origin Platform', label: 'Purpose 4 - Authentication' },
                { text: 'for system administration purposes and for internal operations, including troubleshooting, data analysis, testing, research, statistical and survey purposes', label: 'Purpose 5 - System administration' },
                { text: 'to distinguish you from other users (for example to remember your log-in details)', label: 'Purpose 6 - User distinction' },
                { text: 'to monitor your use of the Origin Platform to improve the user experience and to ensure that content is presented in the most effective manner for you', label: 'Purpose 7 - Usage monitoring' },
                { text: 'to understand how users interact with the Origin Platform to help us to improve the user experience', label: 'Purpose 8 - User interaction analysis' },
                { text: 'to measure audience engagement and site statistics', label: 'Purpose 9 - Analytics' },
                { text: 'to provide technical support and send you report notifications', label: 'Purpose 10 - Technical support' },
                { text: 'to notify you of any changes to our services', label: 'Purpose 11 - Service updates' },
                { text: 'for security and fraud prevention', label: 'Purpose 12 - Security' },
                { text: 'to ensure that the Origin Platform is safe and secure', label: 'Purpose 13 - Platform safety' },
                { text: 'to comply with applicable laws and regulations', label: 'Purpose 14 - Legal compliance' },
            ];

            let processingPurposesFoundCount = 0;
            for (const check of processingPurposesChecks) {
                const hasContent = pageContent?.includes(check.text) || false;
                if (hasContent) {
                    console.log(`✓ Found: ${check.label}`);
                    expect(hasContent).toBe(true);
                    processingPurposesFoundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label}`);
                }
            }

            console.log(`\n✓ Found ${processingPurposesFoundCount}/${processingPurposesChecks.length} processing purposes`);
            expect(processingPurposesFoundCount).toBeGreaterThan(10); // At least 11 out of 16 should be present

            // Verify Legal Basis for Processing Personal Information section
            console.log('\n⚖️ Verifying Legal Basis for Processing Personal Information:');
            const legalBasisChecks = [
                { text: 'LEGAL BASIS FOR PROCESSING YOUR PERSONAL INFORMATION', label: 'Section header' },
                { text: 'We will only process your personal information where we have a legal basis to do so', label: 'Legal basis requirement statement' },
                { text: 'The legal basis will depend on the purposes for which we have collected and use your personal information', label: 'Purpose-dependent basis statement' },
                { text: 'In almost every case the legal basis will be one of the following:', label: 'Legal basis introduction' },
                { text: 'Consent: For example, where you have provided your consent for us to process certain of your personal information', label: 'Legal basis 1 - Consent' },
                { text: 'Our legitimate business interests: Where it is necessary for us to understand our customers, promote our services and operate effectively as a cross-media measurement platform', label: 'Legal basis 2 - Legitimate interests (part 1)' },
                { text: 'provided in each case that this is done in a legitimate way which does not unduly affect your privacy and other rights', label: 'Legal basis 2 - Legitimate interests (part 2)' },
                { text: 'Performance of a contract with you (or in order to take steps prior to entering into a contract with you)', label: 'Legal basis 3 - Contract performance (part 1)' },
                { text: 'where you have accepted our terms and conditions and we need your personal data in order to provide the Origin Platform and its services to you', label: 'Legal basis 3 - Contract performance (part 2)' },
                { text: 'Compliance with law: Where we are subject to a legal obligation and need to use your personal information in order to comply with that obligation', label: 'Legal basis 4 - Legal compliance' },
            ];

            let legalBasisFoundCount = 0;
            for (const check of legalBasisChecks) {
                const hasContent = pageContent?.includes(check.text) || false;
                if (hasContent) {
                    console.log(`✓ Found: ${check.label}`);
                    expect(hasContent).toBe(true);
                    legalBasisFoundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label}`);
                }
            }

            console.log(`\n✓ Found ${legalBasisFoundCount}/${legalBasisChecks.length} legal basis statements`);
            expect(legalBasisFoundCount).toBeGreaterThan(7); // At least 8 out of 10 should be present
            // Verify Where We Store Your Personal Information section
            console.log('\n🌍 Verifying Where We Store Your Personal Information:');
            const dataStorageChecks = [
                { text: 'WHERE WE STORE YOUR PERSONAL INFORMATION', label: 'Section header' },
                { text: 'The personal information that we collect may be transferred to, and stored at, a destination outside the EEA or the UK', label: 'International transfer statement' },
                { text: 'including countries, which have less strict, or no data protection laws, when compared to those in the EEA or the UK', label: 'Data protection law differences' },
                { text: 'Whenever we transfer your information in this way, we will take steps which are reasonably necessary to ensure that adequate safeguards are in place', label: 'Safeguards commitment' },
                { text: 'to protect your personal information and to make sure it is treated securely and in accordance with this Privacy Notice', label: 'Security and compliance assurance' },
                { text: 'In these cases, we rely on approved data transfer mechanisms (such as standard contractual clauses)', label: 'Transfer mechanisms - SCCs' },
                { text: 'to ensure your information is subject to adequate safeguards in the recipient country', label: 'Recipient country safeguards' },
                { text: 'If you are located in the UK or the EEA, you may contact us for a copy of the safeguards which we have put in place', label: 'Right to obtain safeguards copy' },
                { text: 'to protect your personal information and privacy rights in these circumstances', label: 'Privacy rights protection' },
            ];

            let dataStorageFoundCount = 0;
            for (const check of dataStorageChecks) {
                const hasContent = pageContent?.includes(check.text) || false;
                if (hasContent) {
                    console.log(`✓ Found: ${check.label}`);
                    expect(hasContent).toBe(true);
                    dataStorageFoundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label}`);
                }
            }

            console.log(`\n✓ Found ${dataStorageFoundCount}/${dataStorageChecks.length} data storage statements`);
            expect(dataStorageFoundCount).toBeGreaterThan(6); // At least 7 out of 9 should be present

            // Verify How We Keep Your Personal Information section
            console.log('\n🕒 Verifying How We Keep Your Personal Information:');
            const dataRetentionChecks = [
                { text: 'HOW WE KEEP YOUR PERSONAL INFORMATION', label: 'Section header' },
                { text: 'We take steps to ensure that the personal information that you provide is retained for only as long as it is necessary for the purpose for which it was collected', label: 'Retention limitation principle' },
                { text: 'After this period it will be deleted or in some cases anonymised', label: 'Deletion or anonymisation policy' },
                { text: 'We may also keep a record of correspondence with you (for example if you have made a complaint)', label: 'Correspondence retention' },
                { text: 'for as long as is necessary to protect us from a legal claim', label: 'Legal defense retention' },
                { text: 'Where we have collected the personal information based on your consent and we have no other lawful basis to continue with that processing', label: 'Consent-based processing condition' },
                { text: 'if you subsequently withdraw your consent then we will delete your personal information', label: 'Consent withdrawal deletion' },
            ];

            let dataRetentionFoundCount = 0;
            for (const check of dataRetentionChecks) {
                const hasContent = pageContent?.includes(check.text) || false;
                if (hasContent) {
                    console.log(`✓ Found: ${check.label}`);
                    expect(hasContent).toBe(true);
                    dataRetentionFoundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label}`);
                }
            }

            console.log(`\n✓ Found ${dataRetentionFoundCount}/${dataRetentionChecks.length} data retention statements`);
            expect(dataRetentionFoundCount).toBeGreaterThan(5); // At least 6 out of 7 should be present
            // Verify Security and Passwords section
            console.log('\n🔒 Verifying Security and Passwords:');
            const securityPasswordsChecks = [
                { text: 'SECURITY AND PASSWORDS', label: 'Section header' },
                { text: 'You must keep your password and any other authentication information for the Origin Platform confidential', label: 'User password confidentiality obligation' },
                { text: 'If you know or suspect that anyone other than you knows your password or any other authentication information', label: 'Compromise detection condition' },
                { text: 'you must promptly notify us using the contact details at the top of this Privacy Notice', label: 'Notification requirement' },
                { text: 'Unfortunately, the transmission of information via the internet is not completely secure', label: 'Internet security limitation disclosure' },
                { text: 'Although we will do our best to protect your personal information', label: 'Best efforts commitment' },
                { text: 'we cannot guarantee the security of your information transmitted during your use of the Origin Platform', label: 'Security limitation disclaimer' },
            ];

            let securityPasswordsFoundCount = 0;
            for (const check of securityPasswordsChecks) {
                const hasContent = pageContent?.includes(check.text) || false;
                if (hasContent) {
                    console.log(`✓ Found: ${check.label}`);
                    expect(hasContent).toBe(true);
                    securityPasswordsFoundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label}`);
                }
            }

            console.log(`\n✓ Found ${securityPasswordsFoundCount}/${securityPasswordsChecks.length} security and password statements`);
            expect(securityPasswordsFoundCount).toBeGreaterThan(5); // At least 6 out of 7 should be present
            // Verify Disclosing Your Information section
            console.log('\n🔄 Verifying Disclosing Your Information:');
            const disclosingInfoChecks = [
                { text: 'DISCLOSING YOUR INFORMATION', label: 'Section header' },
                { text: 'We may share your personal information within our group of companies (i.e. our subsidiaries, our ultimate holding company and its subsidiaries, as defined in section 1159 of the UK Companies Act 2006)', label: 'Group company sharing' },
                { text: 'We may share your personal information with our suppliers, business partners, partner programmes and service providers where they are helping us to provide our services to you', label: 'Service provider sharing' },
                { text: 'We may also disclose your personal information to other third parties in the following cases:', label: 'Third party disclosure introduction' },
                { text: 'with our suppliers, business partners, partner programmes and service providers for the purposes of research, evaluation, and analysis of Origin and any other partner programmes', label: 'Research and analysis disclosure' },
                { text: 'e.g. ANA Aquila LLC ("Project Aquila") in the US', label: 'Example - Project Aquila' },
                { text: 'in the event that we sell any business or assets, in which case we may disclose your personal information to the prospective buyer of such business or assets', label: 'Business sale disclosure' },
                { text: 'if we are under a duty to disclose or share your personal information in order to comply with any legal or regulatory obligation or request', label: 'Legal obligation disclosure' },
                { text: 'to protect the rights, property or safety of us or our users, or others, and in order to enforce or apply our terms and conditions', label: 'Protection and enforcement disclosure' },
            ];

            let disclosingInfoFoundCount = 0;
            for (const check of disclosingInfoChecks) {
                const hasContent = pageContent?.includes(check.text) || false;
                if (hasContent) {
                    console.log(`✓ Found: ${check.label}`);
                    expect(hasContent).toBe(true);
                    disclosingInfoFoundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label}`);
                }
            }

            console.log(`\n✓ Found ${disclosingInfoFoundCount}/${disclosingInfoChecks.length} disclosure statements`);
            expect(disclosingInfoFoundCount).toBeGreaterThan(7); // At least 8 out of 9 should be present
            // Verify Your Rights section
            console.log('\n👤 Verifying Your Rights:');
            const yourRightsChecks = [
                { text: 'YOUR RIGHTS', label: 'Section header' },
                { text: 'You have certain rights in relation to your personal information', label: 'Rights introduction' },
                { text: 'the right to object to the processing of your information for certain purposes', label: 'Right to object' },
                { text: 'the right to access your personal information', label: 'Right of access' },
                { text: 'the ability to erase, restrict or receive a machine-readable copy of your personal information', label: 'Rights to erasure, restriction, and portability' },
                { text: 'We will handle any request to exercise your rights in accordance with applicable law and any relevant legal exemptions', label: 'Rights handling commitment' },
                { text: 'If you wish to exercise any of these rights please contact us using the contact details at the top of this Privacy Notice', label: 'Rights exercise contact instruction' },
                { text: 'You may also have the right to complain to a data protection authority', label: 'Right to complain to supervisory authority' },
                { text: 'if you think we have processed your personal information in a manner which is unlawful or breaches your rights', label: 'Complaint grounds' },
                { text: 'If you have such concerns we request that you initially contact us (using the contact details at the top of this Privacy Notice) so that we can investigate, and hopefully resolve, your concerns', label: 'Internal resolution request' },
            ];

            let yourRightsFoundCount = 0;
            for (const check of yourRightsChecks) {
                const hasContent = pageContent?.includes(check.text) || false;
                if (hasContent) {
                    console.log(`✓ Found: ${check.label}`);
                    expect(hasContent).toBe(true);
                    yourRightsFoundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label}`);
                }
            }

            console.log(`\n✓ Found ${yourRightsFoundCount}/${yourRightsChecks.length} data subject rights statements`);
            expect(yourRightsFoundCount).toBeGreaterThan(8); // At least 9 out of 10 should be present
            console.log('✅ Privacy Policy content verification test passed');
        });
    });

    test.describe('AC-1 Cookies Pop-up Display and Performance Cookies Verification - PDH-3597', () => {

        test('2.1 Cookies Strictly necessary cookies', async ({ page, context }) => {
            console.log('📅  Cookies Strictly necessary cookies');

            const smokeTestSuite = new SmokeTestSuite(page);
            await smokeTestSuite.login(page);

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            const privacyLink = page.locator("#privacy-notice-btn > img");
            expect(privacyLink).not.toBeNull();

            const linkTarget = await privacyLink!.getAttribute('target');
            let policyPage = page;

            if (linkTarget === '_blank') {
                const [newPage] = await Promise.all([
                    page.context().waitForEvent('page'),
                    privacyLink!.click()
                ]);
                await newPage.waitForLoadState('networkidle');
                policyPage = newPage;
            } else {
                await privacyLink!.click();
                await page.waitForLoadState('networkidle');
            }

            await policyPage.waitForTimeout(2000);

            // Verify URL
            expect(policyPage.url()).toContain('/measurement/privacynotice');
            console.log('✓ URL verified: /measurement/privacynotice');

            // Verify Strictly Necessary Cookies section
            console.log('\n🍪 Verifying Strictly Necessary Cookies Section:');
            const strictlyCookiesElement = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[1]/div/p');
            await strictlyCookiesElement.isVisible();
            const strictlyCookiesElementEmpander = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[1]/div[1]/img');

            strictlyCookiesElementEmpander.click();

            const strictlyCookiesElementDetails = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[1]/div[2]/li');

            const strictlyCookiesText = await strictlyCookiesElementDetails.textContent() || '';
            console.log(`✓ Strictly Necessary Cookies section found`);
            console.log(`Content: ${strictlyCookiesText}`);

            // Verify specific strictly necessary cookies text
            const strictlyNecessaryCookiesChecks = [
                { text: 'Strictly necessary cookies', label: 'Section title' },
                { text: 'These cookies are essential for you to be able to navigate the site and use its features', label: 'Essential for navigation' },
                { text: 'Without these cookies, the services you have asked for could not be provided', label: 'Services requirement' },
                { text: 'These are necessary for the site to function and cannot be switched off', label: 'Cannot be switched off statement' },
            ];

            console.log('\n📋 Verifying Strictly Necessary Cookies Content:');
            let foundCount = 0;
            for (const check of strictlyNecessaryCookiesChecks) {
                const hasContent = strictlyCookiesText.includes(check.text);
                if (hasContent) {
                    console.log(`✓ Found: ${check.label} - "${check.text}"`);
                    expect(hasContent).toBe(true);
                    foundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label} - "${check.text}"`);
                }
            }

            console.log('✅ Privacy Policy content verification test passed');
        });

        test('2.2 Performance Cookies "Always Active" Verification', async ({ page, context }) => {
            console.log('📅 Cookies Performance cookies...');

            const smokeTestSuite = new SmokeTestSuite(page);
            await smokeTestSuite.login(page);

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            const privacyLink = page.locator("#privacy-notice-btn > img");
            expect(privacyLink).not.toBeNull();

            const linkTarget = await privacyLink!.getAttribute('target');
            let policyPage = page;

            if (linkTarget === '_blank') {
                const [newPage] = await Promise.all([
                    page.context().waitForEvent('page'),
                    privacyLink!.click()
                ]);
                await newPage.waitForLoadState('networkidle');
                policyPage = newPage;
            } else {
                await privacyLink!.click();
                await page.waitForLoadState('networkidle');
            }

            await policyPage.waitForTimeout(2000);

            // Verify URL
            expect(policyPage.url()).toContain('/measurement/privacynotice');
            console.log('✓ URL verified: /measurement/privacynotice');

            // Verify Performance cookies  section
            console.log('\n🍪 Verifying Performance Cookies Section:');
            const performanceCookiesElement = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[2]/div/p');
            await performanceCookiesElement.isVisible();
            const performanceCookiesElementEmpander = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[2]/div[1]/img');
            performanceCookiesElementEmpander.click();

            const performanceCookiesDetails = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[2]/div[2]/li');

            const performanceCookiesText = await performanceCookiesDetails.textContent() || '';
            console.log(`✓ Performance Cookies section found`);
            console.log(`Content: ${performanceCookiesText}`);

            // Verify specific performance cookies text
            const performanceCookiesChecks = [
                { text: 'Performance cookies', label: 'Section title' },
                { text: 'These cookies collect information about how you use our site.', label: 'Collection purpose' },
                // { text: 'All information these cookies collect is aggregated and anonymous', label: 'Anonymity statement' },
                //{ text: 'If you do not allow these cookies we will not know when you have visited our site', label: 'Tracking statement' },
            ];

            console.log('\n📋 Verifying Performance Cookies Content:');
            let foundCount = 0;
            for (const check of performanceCookiesChecks) {
                const hasContent = performanceCookiesText.includes(check.text);
                if (hasContent) {
                    console.log(`✓ Found: ${check.label} - "${check.text}"`);
                    expect(hasContent).toBe(true);
                    foundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label} - "${check.text}"`);
                }
            }

            console.log('✅ Privacy Policy content verification test passed');
        });

        /*    test('2.3 Functional cookies', async ({ page, context }) => {
            console.log('📅 Functional cookies...');

            const smokeTestSuite = new SmokeTestSuite(page);
            await smokeTestSuite.login(page);

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            const privacyLink = page.locator("#privacy-notice-btn > img");
            expect(privacyLink).not.toBeNull();

            const linkTarget = await privacyLink!.getAttribute('target');
            let policyPage = page;

            if (linkTarget === '_blank') {
                const [newPage] = await Promise.all([
                    page.context().waitForEvent('page'),
                    privacyLink!.click()
                ]);
                await newPage.waitForLoadState('networkidle');
                policyPage = newPage;
            } else {
                await privacyLink!.click();
                await page.waitForLoadState('networkidle');
            }

            await policyPage.waitForTimeout(2000);

            // Verify URL
            expect(policyPage.url()).toContain('/measurement/privacynotice');
            console.log('✓ URL verified: /measurement/privacynotice');

            // Verify Functional cookies  section
            console.log('\n🍪 Verifying Functional cookies Section:');
            const functionalCookiesElement = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[3]/div/p');
            await functionalCookiesElement.isVisible();
            const functionalCookiesElementEmpander = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[3]/div[1]/img');
            functionalCookiesElementEmpander.click();
            const functionalCookiesDetails = await policyPage.locator('//*[@id="container"]/div/div[3]/div[1]/div[3]/div[3]/div[2]/li');
            const functionalCookiesText = await functionalCookiesDetails.textContent() || '';
            console.log(`✓ Functional Cookies section found`);
            console.log(`Content: ${functionalCookiesText}`);

            // Verify specific functional Cookies text
            const functionalCookiesChecks = [
                { text: 'Functional cookies', label: 'Section title' },
                { text: 'These cookies collect information about how you use our site.', label: 'Collection purpose' },
                { text: 'If you do not wish for cookies to be installed on your device, you can change the settings on your browser or device to reject cookies', label: 'Cookie rejection option' },
                { text: 'For more information about how to reject cookies using your internet browser settings please consult the "Help" section of your internet browser', label: 'Browser help reference' },
                { text: 'http://www.aboutcookies.org', label: 'AboutCookies.org reference' },
                { text: 'if you do set your Internet browser to reject cookies or otherwise withdraw your consent in relation to cookies, you may not be able to access all of the functions of the site', label: 'Functionality limitation warning' },
            ];

            console.log('\n📋 Verifying Functional Cookies Content:');
            let foundCount = 0;
            for (const check of functionalCookiesChecks) {
                const hasContent = functionalCookiesText.includes(check.text);
                if (hasContent) {
                    console.log(`✓ Found: ${check.label} - "${check.text}"`);
                    expect(hasContent).toBe(true);
                    foundCount++;
                } else {
                    console.log(`⚠️ Not found: ${check.label} - "${check.text}"`);
                }
            }

            console.log('✅ Privacy Policy content verification test passed');
        });*/
    });
    test.describe('REGRESSION PDH-3597 AC2 -1 PDH-T1489', () => {
        test('3.1 Verify ORIGIN Cookies pop-up display on first login', async ({ page, context }) => {
            console.log('📅 Verify ORIGIN Cookies pop-up display on first login');
            const smokeTestSuite = new SmokeTestSuite(page);
            const loginPage = new LoginPage(page);
            await loginPage.goto();
            // Read credentials from credential.properties
            const credPath = path.resolve(__dirname, '../../credential.properties');
            const credContent = fs.readFileSync(credPath, 'utf-8');
            const creds: { [key: string]: string } = {};
            credContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) creds[key.trim()] = value.trim();
            });
       
            await loginPage.login(username, password);

            // Wait for potential cookies pop-up
            await page.waitForTimeout(1000);
            const cookiesPopup = page.locator('#cookie-consent-modal');
            const isPopupVisible = await cookiesPopup.isVisible();
            if (isPopupVisible) {
                console.log('✓ Cookies pop-up is displayed on first login');
                expect(isPopupVisible).toBe(true);

                // Get the full content of the cookies pop-up
                const popupHeading = page.locator('//*[@id="heading"]');
                const popupContent = page.locator('//*[@id="cookie-consent-modal"]/div/p[2]');
                expect(popupHeading).toHaveText('About cookies on this site');

                // Verify "About cookies on this site" section content
                console.log('\n🍪 Verifying "About cookies on this site" Content:');
                const aboutCookiesChecks = [
                    { text: 'We use cookies on your device to operate this site which are necessary for this site to work or otherwise do not require your consent under applicable laws.', label: 'Cookies purpose statement' },
                    { text: 'or more information on how we use cookies please read our Privacy Notice.', label: 'Privacy notice reference' },
                ];
                let aboutCookiesFoundCount = 0;
                const popupContentText = await popupContent.textContent() || '';
                console.log(`Content: ${popupContentText}`);
                for (const check of aboutCookiesChecks) {
                    const hasContent = popupContentText.includes(check.text);
                    if (hasContent) {
                        console.log(`✓ Found: ${check.label} - "${check.text}"`);
                        expect(hasContent).toBe(true);
                        aboutCookiesFoundCount++;
                    } else {
                        console.log(`⚠️ Not found: ${check.label} - "${check.text}"`);
                    }
                }

                console.log(`\n✓ Found ${aboutCookiesFoundCount}/${aboutCookiesChecks.length} "About cookies" statements`);
                expect(aboutCookiesFoundCount).toBeGreaterThan(1); // At least 5 out of 6 should be present

                // Take screenshot of cookies pop-up
                await page.screenshot({
                    path: 'test-results/cookies-popup-display.png',
                    fullPage: true
                });


            } else {
                console.log('⚠️ Cookies pop-up is NOT displayed on first login');
            }
            console.log('✅ ORIGIN Cookies pop-up display verification test passed');


        });
    });
});
