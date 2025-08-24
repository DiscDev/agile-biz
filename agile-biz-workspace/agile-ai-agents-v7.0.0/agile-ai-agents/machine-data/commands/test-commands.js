#!/usr/bin/env node

/**
 * Test script for the command registry system
 */

const { registry } = require('./registry');

async function test() {
  console.log('Testing AgileAiAgents Command System\n');

  // Test 1: Check if commands are registered
  console.log('1. Testing command registration:');
  const commands = [
    '/aaa-help',
    '/aaa-status',
    '/setup-dev-environment',
    '/project-state-reset'
  ];
  
  commands.forEach(cmd => {
    const exists = registry.hasCommand(cmd);
    console.log(`   ${cmd}: ${exists ? '✓' : '✗'}`);
  });

  // Test 2: Check alias
  console.log('\n2. Testing alias:');
  const statusCmd = registry.getCommand('/status');
  console.log(`   /status → /aaa-status: ${statusCmd ? '✓' : '✗'}`);

  // Test 3: Show help
  console.log('\n3. Running /aaa-help:\n');
  await registry.executeCommand('/aaa-help');

  // Test 4: Test specific category
  console.log('\n4. Running /aaa-help development:\n');
  await registry.executeCommand('/aaa-help development');

  // Test 5: List backups (should be empty)
  console.log('\n5. Running /list-backups:\n');
  await registry.executeCommand('/list-backups');
}

// Run tests
test().catch(console.error);