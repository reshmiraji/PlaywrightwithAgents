# Playwright Test Automation for Origin Cross Media

This project contains automated test scripts for the Origin Cross Media application using Playwright.

## Project Structure

```
├── tests/
│   ├── pages/              # Page Object Model classes
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── ReportConfigurationPage.ts
│   │   └── ReportResultsPage.ts
│   ├── fixtures/           # Test fixtures and data
│   │   ├── fixtures.ts
│   │   └── testData.ts
│   ├── utils/              # Utility functions
│   │   └── testUtils.ts
│   └── *.spec.ts          # Test specifications
├── test-results/          # Test execution results
├── playwright.config.ts   # Playwright configuration
└── package.json          # Node.js dependencies
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in headed mode (visible browser):
```bash
npm run test:headed
```

### Run tests with UI mode:
```bash
npm run test:ui
```

### Run specific test:
```bash
npx playwright test reportGeneration.spec.ts
```

### Debug tests:
```bash
npm run test:debug
```

## Test Configuration

### Base URL
The application base URL is configured in `playwright.config.ts`:
```typescript
baseURL: 'https://test-cmm.origincrossmedia.com/'
```

### Test Credentials
Default test credentials are stored in `tests/fixtures/testData.ts`:
- Username: xxx
- Password: Welcome@124

### Browser Support
Tests are configured to run on:
- Chromium (Desktop Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- Microsoft Edge
- Google Chrome

## Test Scenarios

### Main Test Flow (`reportGeneration.spec.ts`)
1. **Login Flow**: Authentication with valid/invalid credentials
2. **Navigation**: Dashboard and reports section navigation
3. **Report Configuration**: 
   - Select single media type
   - Select single measured entity
   - Select single campaign
   - Set date range
4. **Report Generation**: Submit and validate report creation
5. **Report Validation**: Verify generated report data and download options

### Page Objects

#### LoginPage
- Handles authentication flow
- Validates login success/failure
- Manages error messages

#### DashboardPage
- Dashboard navigation
- Access to reports section
- User profile management

#### ReportConfigurationPage
- Report parameter selection
- Form validation
- Data range configuration

#### ReportResultsPage
- Report generation monitoring
- Result validation
- Download functionality

## Utilities

### TestUtils
- Page load waiting
- Screenshot capture
- Element interaction helpers
- Date formatting utilities
- Random data generation

## Test Reports

After test execution, reports are available:
- HTML Report: `playwright-report/index.html`
- JSON Results: `test-results/results.json`
- JUnit XML: `test-results/results.xml`
- Screenshots: `test-results/screenshots/`

View HTML report:
```bash
npm run test:report
```

## Debugging

### VS Code Integration
1. Install Playwright Test extension
2. Set breakpoints in test files
3. Use "Debug Test" option in VS Code

### Playwright Inspector
```bash
npx playwright test --debug
```

### Trace Viewer
Traces are automatically captured on test failures. View with:
```bash
npx playwright show-trace test-results/trace.zip
```

## Best Practices

1. **Page Object Model**: All page interactions are encapsulated in page objects
2. **Data Separation**: Test data is separated from test logic
3. **Fixtures**: Reusable test setup using Playwright fixtures
4. **Screenshots**: Automatic screenshots on key steps and failures
5. **Waiting Strategies**: Proper waits for dynamic content
6. **Error Handling**: Comprehensive error detection and reporting

## Continuous Integration

The configuration supports CI/CD environments with:
- Retry mechanisms for flaky tests
- Parallel execution control
- Multiple output formats
- Artifact collection

## Troubleshooting

### Common Issues

1. **Login Failures**: Verify credentials in `testData.ts`
2. **Timeout Errors**: Increase timeouts in `playwright.config.ts`
3. **Element Not Found**: Update selectors in page objects
4. **Network Issues**: Check `baseURL` configuration

### Debug Commands
```bash
# Run with verbose output
npx playwright test --reporter=line

# Run single test with debug
npx playwright test reportGeneration.spec.ts --debug

# Generate test with codegen
npx playwright codegen https://test-cmm.origincrossmedia.com/
```

## Contributing

1. Follow the existing page object pattern
2. Add new selectors to page objects, not directly in tests
3. Use the fixtures for common test setup
4. Include appropriate assertions and error handling
5. Add screenshots for key verification points
