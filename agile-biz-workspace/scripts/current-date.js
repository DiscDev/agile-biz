#!/usr/bin/env node

/**
 * Simple JavaScript script to output the current date
 * **AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */

// Get the current date
const currentDate = new Date();

// Output the date in various formats
console.log('Current Date Information:');
console.log('========================');
console.log('Full Date/Time:', currentDate.toString());
console.log('ISO Format:', currentDate.toISOString());
console.log('Locale String:', currentDate.toLocaleString());
console.log('Date Only:', currentDate.toLocaleDateString());
console.log('Time Only:', currentDate.toLocaleTimeString());
console.log('\nCustom Format:');
console.log(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`);
console.log('\nTimestamp:', currentDate.getTime());