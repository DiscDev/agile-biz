/**
 * Cypress Configuration for E2E Testing
 * Follows Testing Agent's browser testing requirements
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    supportFile: 'tests/test-utils/setup.js',
    specPattern: 'tests/e2e/**/*.test.js',
    
    // Testing Agent requirements
    setupNodeEvents(on, config) {
      // Console error detection
      on('task', {
        failOnConsoleError(message) {
          throw new Error(`Console error detected: ${message}`);
        }
      });

      // Browser launch options for real testing
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          // Enable real browser features
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          
          // Keep console logs visible
          launchOptions.args.push('--enable-logging');
          launchOptions.args.push('--v=1');
        }
        
        return launchOptions;
      });
    },
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Viewport for testing
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video and screenshots
    video: true,
    screenshotOnRunFailure: true,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Environment variables
    env: {
      DASHBOARD_PORT: 3001,
      TEST_MODE: true,
      COVERAGE: true
    }
  },
  
  // Component testing configuration (if needed later)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'tests/component/**/*.test.js',
  }
});