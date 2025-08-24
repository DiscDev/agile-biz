#!/usr/bin/env node

/**
 * Simple Calculator Script
 * Adds two numbers provided as command-line arguments or through prompts
 * 
 * Usage:
 *   node calculator.js [number1] [number2]
 *   or just run: node calculator.js (for interactive mode)
 */

// Check if running in Node.js
if (typeof process === 'undefined') {
  console.error('This script requires Node.js to run');
  process.exit(1);
}

/**
 * Validates if a value is a valid number
 * @param {string} value - The value to validate
 * @returns {boolean} - True if valid number, false otherwise
 */
function isValidNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Adds two numbers together
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - Sum of the two numbers
 */
function add(a, b) {
  return a + b;
}

/**
 * Interactive mode using readline for user input
 */
function interactiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n=== Simple Calculator - Addition ===\n');

  rl.question('Enter the first number: ', (num1) => {
    if (!isValidNumber(num1)) {
      console.error('Error: First input is not a valid number');
      rl.close();
      process.exit(1);
    }

    rl.question('Enter the second number: ', (num2) => {
      if (!isValidNumber(num2)) {
        console.error('Error: Second input is not a valid number');
        rl.close();
        process.exit(1);
      }

      const a = parseFloat(num1);
      const b = parseFloat(num2);
      const result = add(a, b);

      console.log('\n--- Result ---');
      console.log(`${a} + ${b} = ${result}`);
      console.log('--------------\n');

      rl.close();
    });
  });
}

/**
 * Command-line mode using arguments
 * @param {string[]} args - Command line arguments
 */
function commandLineMode(args) {
  const num1 = args[0];
  const num2 = args[1];

  if (!isValidNumber(num1)) {
    console.error('Error: First argument is not a valid number');
    console.log('Usage: node calculator.js <number1> <number2>');
    process.exit(1);
  }

  if (!isValidNumber(num2)) {
    console.error('Error: Second argument is not a valid number');
    console.log('Usage: node calculator.js <number1> <number2>');
    process.exit(1);
  }

  const a = parseFloat(num1);
  const b = parseFloat(num2);
  const result = add(a, b);

  console.log(`${a} + ${b} = ${result}`);
}

/**
 * Main execution
 */
function main() {
  // Get command-line arguments (excluding node and script path)
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // No arguments provided, run in interactive mode
    interactiveMode();
  } else if (args.length === 2) {
    // Two arguments provided, run in command-line mode
    commandLineMode(args);
  } else {
    // Invalid number of arguments
    console.error('Error: Invalid number of arguments');
    console.log('Usage: node calculator.js [number1] [number2]');
    console.log('Or run without arguments for interactive mode');
    process.exit(1);
  }
}

// Run the main function
main();

/**
 * **AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */