/**
 * Console Error Detection for Tests
 * Implements Testing Agent's CRITICAL REQUIREMENT:
 * "Console Error Detection: MANDATORY monitoring of browser console for JavaScript errors"
 */

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Override console.error to fail tests
console.error = (...args) => {
  originalError.apply(console, args);
  
  // Fail the test if console.error is called
  throw new Error(`Console error detected: ${args.join(' ')}`);
};

// Track warnings but don't fail
const warnings = [];
console.warn = (...args) => {
  originalWarn.apply(console, args);
  warnings.push(args);
};

// Expose warnings for inspection
global.consoleWarnings = warnings;

// Helper to temporarily allow console errors
global.allowConsoleError = (fn) => {
  const tempError = console.error;
  console.error = originalError;
  try {
    return fn();
  } finally {
    console.error = tempError;
  }
};

// Helper to temporarily allow console warnings
global.allowConsoleWarn = (fn) => {
  const tempWarn = console.warn;
  console.warn = originalWarn;
  try {
    return fn();
  } finally {
    console.warn = tempWarn;
  }
};