/**
 * JSON Query Utility Usage Examples
 * Demonstrates how agents can efficiently query JSON data with context optimization
 */

const { query } = require('./json-query-utility');

// Example 1: Basic JSON querying
function exampleBasicQueries() {
  console.log('🔍 Example: Basic JSON Queries');

  // Query entire agent JSON
  const coderAgent = query.queryJSON('coder_agent.json');
  console.log('Coder Agent summary:', coderAgent?.summary);

  // Query specific path
  const capabilities = query.queryJSON('coder_agent.json#/capabilities');
  console.log('Coder capabilities:', capabilities?.slice(0, 3));

  // Query nested data
  const contextPriorities = query.queryJSON('marketing_agent.json#/context_priorities');
  console.log('Marketing agent context priorities keys:', Object.keys(contextPriorities || {}));

  // Query array element
  const firstCapability = query.queryJSON('testing_agent.json#/capabilities/0');
  console.log('Testing agent first capability:', firstCapability);
}

// Example 2: Critical vs Optional Data Loading
function exampleContextOptimization() {
  console.log('⚡ Example: Context Optimization');

  // Get critical data only (high priority, always loaded)
  const criticalData = query.getCriticalData('marketing_agent', 'research_agent');
  console.log('Critical data from research_agent for marketing_agent:', Object.keys(criticalData || {}));

  // Get optional data (loaded only if context allows)
  const optionalData = query.getOptionalData('marketing_agent', 'research_agent', 5000); // 5KB limit
  console.log('Optional data from research_agent for marketing_agent:', Object.keys(optionalData || {}));

  // Get fully optimized context for an agent
  const optimizedContext = query.getOptimizedContext('coder_agent', ['prd_agent', 'testing_agent', 'security_agent']);
  console.log('Optimized context stats:', optimizedContext.metadata.optimization_stats);
  console.log('Critical sources:', Object.keys(optimizedContext.critical));
  console.log('Optional sources:', Object.keys(optimizedContext.optional));
}

// Example 3: Multiple queries in one call
function exampleMultipleQueries() {
  console.log('📊 Example: Multiple Queries');

  const multipleResults = query.queryMultiple({
    prd_summary: 'prd_agent.json#/summary',
    coder_tools: 'coder_agent.json#/tools',
    testing_capabilities: 'testing_agent.json#/capabilities',
    marketing_workflows: 'marketing_agent.json#/workflows'
  });

  console.log('Multiple query results:');
  for (const [key, value] of Object.entries(multipleResults)) {
    if (Array.isArray(value)) {
      console.log(`${key}: [${value.length} items]`);
    } else if (typeof value === 'object' && value !== null) {
      console.log(`${key}: {${Object.keys(value).length} keys}`);
    } else {
      console.log(`${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
    }
  }
}

// Example 4: Real-world agent context loading
function exampleRealWorldUsage() {
  console.log('🔄 Example: Real-world Agent Context Loading');

  // Simulate Marketing Agent loading context from multiple sources
  console.log('\n🎯 Marketing Agent loading optimized context...');
  
  // Get critical data from key sources
  const marketingContext = {
    research: query.getCriticalData('marketing_agent', 'research_agent'),
    finance: query.getCriticalData('marketing_agent', 'finance_agent'),
    analytics: query.getCriticalData('marketing_agent', 'analytics_growth_intelligence_agent')
  };

  console.log('Marketing context loaded:');
  console.log('- Research data fields:', Object.keys(marketingContext.research || {}));
  console.log('- Finance data fields:', Object.keys(marketingContext.finance || {}));
  console.log('- Analytics data fields:', Object.keys(marketingContext.analytics || {}));

  // Simulate Coder Agent loading context for development work
  console.log('\n👨‍💻 Coder Agent loading development context...');
  
  const coderContext = query.getOptimizedContext('coder_agent', [
    'prd_agent',
    'testing_agent',
    'security_agent',
    'ui_ux_agent',
    'devops_agent'
  ], { contextLimit: 30000 }); // 30KB limit

  console.log('Coder context optimization:');
  console.log(`- Total size: ${coderContext.metadata.optimization_stats.total_size} bytes`);
  console.log(`- Critical size: ${coderContext.metadata.optimization_stats.critical_size} bytes`);
  console.log(`- Optional size: ${coderContext.metadata.optimization_stats.optional_size} bytes`);
  console.log(`- Reduction: ${((1 - coderContext.metadata.optimization_stats.total_size / 100000) * 100).toFixed(1)}%`);
}

// Example 5: Fallback to markdown demonstration
function exampleMarkdownFallback() {
  console.log('📄 Example: Markdown Fallback');

  // Try to query a non-existent JSON file (should fallback to markdown)
  const nonExistentJson = query.queryJSON('nonexistent_agent.json');
  console.log('Non-existent JSON result:', nonExistentJson ? 'Fallback worked' : 'No fallback data');

  // Query with fallback disabled
  const withoutFallback = query.queryJSON('nonexistent_agent.json', { allowMarkdownFallback: false });
  console.log('Without fallback:', withoutFallback ? 'Got data' : 'No data (expected)');
}

// Example 6: Caching demonstration
function exampleCaching() {
  console.log('💾 Example: Caching Performance');

  // Clear cache and get initial stats
  query.clearCache();
  console.log('Initial cache stats:', query.getCacheStats());

  // Make the same query multiple times
  const queries = [
    'marketing_agent.json#/capabilities',
    'coder_agent.json#/tools',
    'marketing_agent.json#/capabilities', // Duplicate - should hit cache
    'testing_agent.json#/summary',
    'coder_agent.json#/tools' // Duplicate - should hit cache
  ];

  console.log('\nExecuting queries...');
  queries.forEach((queryPath, index) => {
    const result = query.queryJSON(queryPath);
    console.log(`Query ${index + 1}: ${queryPath} → ${result ? 'Success' : 'Failed'}`);
  });

  console.log('\nFinal cache stats:', query.getCacheStats());
}

// Example 7: Error handling and edge cases
function exampleErrorHandling() {
  console.log('⚠️ Example: Error Handling');

  // Query invalid JSON path
  const invalidPath = query.queryJSON('marketing_agent.json#/invalid/deeply/nested/path');
  console.log('Invalid path result:', invalidPath);

  // Query invalid file
  const invalidFile = query.queryJSON('completely_invalid_file.json');
  console.log('Invalid file result:', invalidFile ? 'Got data' : 'No data (expected)');

  // Query with malformed path
  const malformedPath = query.queryJSON('marketing_agent.json#/capabilities/99999');
  console.log('Array out of bounds result:', malformedPath);
}

// Example 8: Context optimization simulation
function exampleContextOptimizationDemo() {
  console.log('📈 Example: Context Optimization Simulation');

  // Simulate before/after context optimization
  console.log('\n🔴 BEFORE Optimization (Traditional approach):');
  
  // Load full agent data (simulating traditional approach)
  const fullAgentData = [
    query.queryJSON('research_agent.json'),
    query.queryJSON('finance_agent.json'),
    query.queryJSON('analytics_growth_intelligence_agent.json'),
    query.queryJSON('customer_lifecycle_retention_agent.json')
  ].filter(data => data !== null);

  const fullDataSize = JSON.stringify(fullAgentData).length;
  console.log(`Full data size: ${fullDataSize} bytes (${(fullDataSize / 1024).toFixed(1)} KB)`);

  console.log('\n🟢 AFTER Optimization (JSON Context Optimization):');
  
  // Load optimized context
  const optimized = query.getOptimizedContext('marketing_agent', [
    'research_agent',
    'finance_agent', 
    'analytics_growth_intelligence_agent',
    'customer_lifecycle_retention_agent'
  ], { contextLimit: 10000 });

  const optimizedSize = optimized.metadata.optimization_stats.total_size;
  const reduction = ((fullDataSize - optimizedSize) / fullDataSize * 100).toFixed(1);
  
  console.log(`Optimized size: ${optimizedSize} bytes (${(optimizedSize / 1024).toFixed(1)} KB)`);
  console.log(`Size reduction: ${reduction}%`);
  console.log(`Performance gain: ${(fullDataSize / optimizedSize).toFixed(1)}x faster`);
}

// Run all examples
function runAllExamples() {
  console.log('🚀 Running JSON Query Utility Examples\n');

  exampleBasicQueries();
  console.log('');
  
  exampleContextOptimization();
  console.log('');
  
  exampleMultipleQueries();
  console.log('');
  
  exampleRealWorldUsage();
  console.log('');
  
  exampleMarkdownFallback();
  console.log('');
  
  exampleCaching();
  console.log('');
  
  exampleErrorHandling();
  console.log('');
  
  exampleContextOptimizationDemo();
}

// Export functions for individual testing
module.exports = {
  exampleBasicQueries,
  exampleContextOptimization,
  exampleMultipleQueries,
  exampleRealWorldUsage,
  exampleMarkdownFallback,
  exampleCaching,
  exampleErrorHandling,
  exampleContextOptimizationDemo,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}