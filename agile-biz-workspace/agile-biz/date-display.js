#!/usr/bin/env node

/**
 * Simple Date Display Script
 * Displays the current date and time in various formats
 * 
 * **AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */

class DateDisplay {
  constructor() {
    this.date = new Date();
  }

  /**
   * Get formatted date strings
   */
  getFormattedDates() {
    return {
      // ISO 8601 format
      iso: this.date.toISOString(),
      
      // Locale-specific formats
      fullDate: this.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      
      fullDateTime: this.date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      
      shortDate: this.date.toLocaleDateString('en-US'),
      
      time12Hour: this.date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      
      time24Hour: this.date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      
      // Custom formats
      yearMonthDay: `${this.date.getFullYear()}-${String(this.date.getMonth() + 1).padStart(2, '0')}-${String(this.date.getDate()).padStart(2, '0')}`,
      
      unixTimestamp: Math.floor(this.date.getTime() / 1000),
      
      relativeToNow: this.getRelativeTime()
    };
  }

  /**
   * Calculate relative time (e.g., "just now", "5 minutes ago")
   */
  getRelativeTime() {
    const now = new Date();
    const diffMs = now - this.date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return this.date.toLocaleDateString();
  }

  /**
   * Display all date formats
   */
  displayAll() {
    const formats = this.getFormattedDates();
    
    console.log('\n========================================');
    console.log('         DATE DISPLAY UTILITY');
    console.log('========================================\n');
    
    console.log('📅 Standard Formats:');
    console.log('  Full Date:        ', formats.fullDate);
    console.log('  Full Date & Time: ', formats.fullDateTime);
    console.log('  Short Date:       ', formats.shortDate);
    console.log('  ISO 8601:         ', formats.iso);
    
    console.log('\n⏰ Time Formats:');
    console.log('  12-Hour:          ', formats.time12Hour);
    console.log('  24-Hour:          ', formats.time24Hour);
    
    console.log('\n🔧 Custom Formats:');
    console.log('  YYYY-MM-DD:       ', formats.yearMonthDay);
    console.log('  Unix Timestamp:   ', formats.unixTimestamp);
    console.log('  Relative:         ', formats.relativeToNow);
    
    console.log('\n========================================\n');
  }

  /**
   * Display specific format
   */
  displayFormat(formatName) {
    const formats = this.getFormattedDates();
    
    if (formats[formatName]) {
      console.log(`${formatName}: ${formats[formatName]}`);
    } else {
      console.error(`Unknown format: ${formatName}`);
      console.log('Available formats:', Object.keys(formats).join(', '));
    }
  }
}

// Command-line interface
function main() {
  const args = process.argv.slice(2);
  const dateDisplay = new DateDisplay();
  
  if (args.length === 0) {
    // No arguments - display all formats
    dateDisplay.displayAll();
  } else if (args[0] === '--help' || args[0] === '-h') {
    // Show help
    console.log('\nUsage: node date-display.js [format]');
    console.log('\nAvailable formats:');
    console.log('  iso          - ISO 8601 format');
    console.log('  fullDate     - Full date with weekday');
    console.log('  fullDateTime - Full date and time');
    console.log('  shortDate    - Short date (MM/DD/YYYY)');
    console.log('  time12Hour   - 12-hour time format');
    console.log('  time24Hour   - 24-hour time format');
    console.log('  yearMonthDay - YYYY-MM-DD format');
    console.log('  unixTimestamp- Unix timestamp');
    console.log('  relativeToNow- Relative time');
    console.log('\nOr run without arguments to see all formats.\n');
  } else {
    // Display specific format
    dateDisplay.displayFormat(args[0]);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = DateDisplay;