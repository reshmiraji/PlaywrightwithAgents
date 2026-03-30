export const TEST_CREDENTIALS = {
  username: 'reshmi.raji@accenture.com',
  password: 'Welcome@124'
};

export const TEST_DATA = {
  mediaTypes: ['Digital', 'TV', 'Radio', 'Print', 'OOH'],
  measuredEntities: ['Impressions', 'Clicks', 'Conversions', 'Reach', 'Frequency'],
  dateRanges: {
    lastWeek: {
      start: '2024-10-01',
      end: '2024-10-07'
    },
    lastMonth: {
      start: '2024-09-01',
      end: '2024-09-30'
    },
    currentMonth: {
      start: '2024-10-01',
      end: '2024-10-31'
    }
  }
};

export const TIMEOUTS = {
  short: 5000,
  medium: 15000,
  long: 30000,
  reportGeneration: 60000
};

export const SELECTORS = {
  common: {
    loadingSpinner: '.loading, .spinner, [data-loading="true"]',
    errorMessage: '.error, .alert-danger, [role="alert"]',
    successMessage: '.success, .alert-success',
    modal: '.modal, .dialog, [role="dialog"]',
    dropdown: 'select, .dropdown',
    submitButton: 'button[type="submit"], input[type="submit"]'
  },
  login: {
    form: 'form[name="login"], .login-form',
    usernameField: 'input[name="username"], input[name="email"], input[type="email"]',
    passwordField: 'input[name="password"], input[type="password"]',
    loginButton: 'button[type="submit"], input[type="submit"], button:has-text("Login")'
  },
  reports: {
    createButton: 'button:has-text("Create"), a:has-text("New Report")',
    configForm: '.report-config, form[name="report"]',
    resultsTable: 'table, .report-table, .results-table'
  }
};