/**
 * Sprint Naming Utility for AgileAiAgents
 * Generates consistent sprint folder names with current dates
 */

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date - Date to format (defaults to current date)
 * @returns {string} Formatted date string
 */
function formatSprintDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate sprint folder name
 * @param {string} featureName - Feature or sprint name
 * @param {Date} date - Sprint start date (defaults to current date)
 * @returns {string} Sprint folder name in format: sprint-YYYY-MM-DD-feature-name
 */
function generateSprintName(featureName, date = new Date()) {
  const dateStr = formatSprintDate(date);
  const sanitizedFeature = featureName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
    .replace(/--+/g, '-');          // Replace multiple hyphens with single
  
  return `sprint-${dateStr}-${sanitizedFeature}`;
}

/**
 * Parse sprint name to extract date and feature
 * @param {string} sprintName - Sprint folder name
 * @returns {object} Parsed sprint info with date and feature
 */
function parseSprintName(sprintName) {
  const match = sprintName.match(/^sprint-(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (!match) {
    return null;
  }
  
  return {
    date: match[1],
    feature: match[2],
    fullName: sprintName
  };
}

/**
 * Generate example sprint name (for templates)
 * @returns {string} Example sprint name with YYYY-MM-DD placeholder
 */
function generateExampleSprintName() {
  return 'sprint-YYYY-MM-DD-feature-name';
}

/**
 * Check if a sprint name uses the correct format
 * @param {string} sprintName - Sprint name to validate
 * @returns {boolean} True if valid format
 */
function isValidSprintName(sprintName) {
  return /^sprint-\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(sprintName);
}

module.exports = {
  formatSprintDate,
  generateSprintName,
  parseSprintName,
  generateExampleSprintName,
  isValidSprintName
};