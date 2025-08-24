#!/usr/bin/env node

/**
 * Test script for Community Contribution Generator
 * Verifies the generator works without syntax errors
 */

const path = require('path');
const fs = require('fs');

// Add the machine-data directory to require path
const machineDataPath = path.join(__dirname, '..', 'machine-data');
const CommunityContributionGenerator = require(path.join(machineDataPath, 'community-contribution-generator.js'));

async function testGenerator() {
  console.log('🧪 Testing Community Contribution Generator...');
  
  try {
    // Create a test generator instance
    const projectRoot = path.join(__dirname, '..');
    const generator = new CommunityContributionGenerator(projectRoot);
    
    console.log('✅ Generator class instantiated successfully');
    
    // Test basic methods without actually generating files
    console.log('🔍 Testing project info extraction...');
    const projectInfo = await generator.extractProjectInfo();
    console.log('✅ Project info extracted:', {
      projectType: projectInfo.projectType,
      industry: projectInfo.industry,
      duration: projectInfo.duration
    });
    
    console.log('🔍 Testing technology detection...');
    const technology = await generator.detectTechnology();
    console.log('✅ Technology detected:', technology);
    
    console.log('🔍 Testing agent versions...');
    const agentVersions = await generator.getCurrentAgentVersions();
    console.log('✅ Agent versions found:', Object.keys(agentVersions).length, 'agents');
    
    console.log('\n✅ All tests passed! The contribution generator is working properly.');
    console.log('\n🚀 You can now run:');
    console.log('   bash scripts/bash/generate-contribution.sh');
    console.log('   or');
    console.log('   node machine-data/community-contribution-generator.js');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testGenerator();
}

module.exports = { testGenerator };