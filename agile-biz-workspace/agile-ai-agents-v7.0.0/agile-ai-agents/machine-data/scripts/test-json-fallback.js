#!/usr/bin/env node

/**
 * Test JSON fallback mechanism
 * Verifies that the system correctly falls back to MD files when JSON is not available
 */

const { query } = require('../json-query-utility');

async function testJSONFallback() {
  console.log('Testing JSON Fallback Mechanism\n');
  console.log('='.repeat(50));
  
  const testCases = [
    {
      name: 'Existing JSON file',
      path: 'agile-ai-agents/machine-data/aaa-documents-json/deployment.json',
      expectedSource: 'json'
    },
    {
      name: 'Non-existent JSON (should fallback to MD)',
      path: 'agile-ai-agents/machine-data/ai-agent-coordination-json/orchestrator-workflows.json',
      expectedSource: 'markdown_fallback'
    },
    {
      name: 'Agent JSON file',
      path: 'agile-ai-agents/machine-data/ai-agents-json/coder_agent.json',
      expectedSource: 'json'
    },
    {
      name: 'Direct JSON query',
      path: 'coder_agent.json#/reference_documentation',
      expectedSource: 'json'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTest: ${testCase.name}`);
    console.log(`Path: ${testCase.path}`);
    
    try {
      const result = query.queryJSON(testCase.path, { allowMarkdownFallback: true });
      
      if (result) {
        const source = result.meta?.source || 'json';
        console.log(`✓ Loaded successfully from: ${source}`);
        
        if (source !== testCase.expectedSource && testCase.expectedSource !== 'either') {
          console.log(`⚠️  Expected source: ${testCase.expectedSource}, got: ${source}`);
        }
        
        // Show a sample of the data
        if (result.meta) {
          console.log(`  File: ${result.meta.document || result.meta.file_path || 'unknown'}`);
          console.log(`  Tokens: ${result.meta.estimated_tokens || result.meta.full_md_tokens || 'unknown'}`);
        }
      } else {
        console.log('✗ Failed to load file');
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
    }
  }
  
  // Test the reference documentation paths
  console.log('\n' + '='.repeat(50));
  console.log('Testing Reference Documentation Paths\n');
  
  const agentData = query.queryJSON('devops_agent.json');
  if (agentData && agentData.reference_documentation) {
    console.log('DevOps Agent Reference Documents:');
    
    for (const [key, ref] of Object.entries(agentData.reference_documentation)) {
      console.log(`\n${key}:`);
      console.log(`  Path: ${ref.path}`);
      
      // Try to load the referenced document
      const docData = query.queryJSON(ref.path, { allowMarkdownFallback: true });
      if (docData) {
        const source = docData.meta?.source || 'json';
        console.log(`  ✓ Loaded from: ${source}`);
        if (docData.meta?.estimated_tokens) {
          console.log(`  Tokens: ${docData.meta.estimated_tokens}`);
        }
      } else {
        console.log(`  ✗ Could not load`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Fallback Test Complete!');
}

// Run the test
testJSONFallback().catch(console.error);