/**
 * Test script for Research Agent sub-agent functionality
 * Demonstrates parallel research execution
 */

const ResearchAgentOrchestrator = require('../machine-data/research-agent-orchestrator');

async function testResearchSubAgents() {
  console.log('🧪 Testing Research Agent Sub-Agent System\n');
  
  const orchestrator = new ResearchAgentOrchestrator();
  
  try {
    // Initialize the system
    console.log('1️⃣  Initializing research orchestration system...');
    await orchestrator.initialize();
    console.log('   ✅ System initialized\n');
    
    // Define test project context
    const projectContext = {
      projectName: 'AI-Powered Task Manager',
      description: 'A smart task management application using AI to prioritize and organize work',
      targetMarket: 'Remote teams and freelancers',
      businessObjectives: [
        'Improve team productivity by 40%',
        'Reduce task management overhead',
        'AI-driven task prioritization'
      ],
      competitiveLandscape: [
        'Asana',
        'Trello',
        'Monday.com'
      ]
    };
    
    // Test different research levels
    const researchLevels = ['minimal', 'medium', 'thorough'];
    
    for (const level of researchLevels) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing ${level.toUpperCase()} Research Level`);
      console.log(${'='.repeat(60)}\n`);
      
      // Execute parallel research
      const result = await orchestrator.executeParallelResearch(level, projectContext);
      
      // Display results
      console.log('\n📈 Research Results:');
      console.log(`   Documents Created: ${result.research.totalDocuments}`);
      console.log(`   Successful Sub-Agents: ${result.research.successfulSubAgents}`);
      console.log(`   Failed Sub-Agents: ${result.research.failedSubAgents}`);
      console.log(`   Execution Time: ${result.metrics.duration}s`);
      console.log(`   Token Usage: ${result.metrics.tokenUsage.totalUsed} / ${result.metrics.tokenUsage.totalAllocated}`);
      
      // Show time savings
      const sequentialTime = level === 'minimal' ? 2 : level === 'medium' ? 4 : 8;
      const timeSavings = ((sequentialTime * 3600 - result.metrics.duration) / (sequentialTime * 3600) * 100).toFixed(1);
      console.log(`   ⏱️  Time Savings: ${timeSavings}% (vs ${sequentialTime} hours sequential)`);
      
      // Get current status
      const status = await orchestrator.getResearchStatus();
      console.log(`\n📊 Registry Statistics:`);
      console.log(`   Total Documents: ${status.registry.totalDocuments}`);
      console.log(`   Active Sessions: ${status.registry.activeSessions}`);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Test error handling
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('Testing Error Handling');
    console.log(${'='.repeat(60)}\n`);
    
    // Create a task that will fail
    const failingTask = {
      id: 'test-fail',
      subAgentId: 'research_fail_sub',
      description: 'This task will simulate a failure',
      documents: ['non-existent-research'],
      tokenBudget: 5000,
      simulateError: true // Flag for testing
    };
    
    const errorResult = await orchestrator.orchestrator.launchSubAgents([failingTask]);
    console.log('Error handling result:', errorResult[0].status === 'error' ? '✅ Properly handled' : '❌ Not handled');
    
    // Archive the session
    console.log('\n5️⃣  Archiving research session...');
    await orchestrator.orchestrator.archiveSession();
    console.log('   ✅ Session archived\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testResearchSubAgents().then(() => {
  console.log('\n✅ Research sub-agent test completed!');
}).catch(error => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});