/**
 * Test Service Detector - Development Mode
 * Tests service detection with simulated environment variables
 */

const ServiceDetector = require('./service-detector');

// Simulate environment variables for testing
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-for-development';
process.env.ZEN_MCP_ENABLED = 'false';
process.env.GOOGLE_AI_API_KEY = '';
process.env.OPENAI_API_KEY = '';
process.env.PERPLEXITY_API_KEY = '';

console.log('🧪 Running Service Detector in TEST MODE\n');
console.log('   Note: Using simulated environment for testing\n');

const detector = new ServiceDetector();

detector.detectServices()
  .then(result => {
    detector.displayStatus();
    
    console.log('📋 Detection Result:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
  });