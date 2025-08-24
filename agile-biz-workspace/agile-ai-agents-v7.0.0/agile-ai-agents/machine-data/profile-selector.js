/**
 * Velocity Profile Selector
 * Handles selection and application of community-learned velocity profiles
 */

const fs = require('fs-extra');
const path = require('path');

class VelocityProfileSelector {
  constructor() {
    this.profilesPath = path.join(__dirname, '..', 'templates', 'release-templates', 'product-backlog', 'velocity-profiles.json');
    this.profiles = null;
  }

  /**
   * Load velocity profiles from JSON file
   */
  async loadProfiles() {
    try {
      if (!this.profiles) {
        this.profiles = await fs.readJSON(this.profilesPath);
      }
      return this.profiles;
    } catch (error) {
      console.error('Failed to load velocity profiles:', error);
      return null;
    }
  }

  /**
   * Get all available profiles
   */
  async getAvailableProfiles() {
    const profiles = await this.loadProfiles();
    if (!profiles) return [];
    
    return Object.values(profiles.profiles).map(profile => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      initial_velocity: profile.initial_velocity,
      confidence: profile.confidence,
      recommended_for: profile.recommended_for
    }));
  }

  /**
   * Get a specific profile by ID
   */
  async getProfile(profileId) {
    const profiles = await this.loadProfiles();
    if (!profiles || !profiles.profiles[profileId]) {
      return null;
    }
    return profiles.profiles[profileId];
  }

  /**
   * Apply a velocity profile to the velocity metrics
   */
  async applyProfile(velocityMetricsPath, profileId) {
    try {
      // Load the selected profile
      const profile = await this.getProfile(profileId);
      if (!profile) {
        throw new Error(`Profile ${profileId} not found`);
      }

      // Load current velocity metrics
      const velocityMetrics = await fs.readJSON(velocityMetricsPath);

      // Apply profile values
      velocityMetrics.meta.velocity_profile = profileId;
      velocityMetrics.meta.profile_selected_at = new Date().toISOString();
      
      velocityMetrics.metrics.average_velocity = profile.initial_velocity;
      velocityMetrics.metrics.velocity_range = profile.velocity_range;
      velocityMetrics.metrics.confidence_level = profile.confidence;
      velocityMetrics.metrics.is_community_default = true;
      
      velocityMetrics.community_benchmarks.profile = profileId;
      velocityMetrics.community_benchmarks.profile_name = profile.name;
      velocityMetrics.community_benchmarks.using_defaults = true;
      velocityMetrics.community_benchmarks.comparison.community_average = profile.initial_velocity;

      // Update forecasting
      velocityMetrics.forecasting.next_sprint_estimate = profile.initial_velocity;
      velocityMetrics.forecasting.confidence_interval.low = profile.velocity_range.min;
      velocityMetrics.forecasting.confidence_interval.high = profile.velocity_range.max;

      // Save updated metrics
      await fs.writeJSON(velocityMetricsPath, velocityMetrics, { spaces: 2 });

      return {
        success: true,
        profile: profile.name,
        initial_velocity: profile.initial_velocity,
        message: `Applied ${profile.name} profile with initial velocity of ${profile.initial_velocity} points`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format profiles for display in CLI
   */
  formatProfilesForCLI() {
    return this.getAvailableProfiles().then(profiles => {
      let output = '\\n🎯 Available Velocity Profiles:\\n\\n';
      
      profiles.forEach((profile, index) => {
        output += `${index + 1}. ${profile.name}\\n`;
        output += `   ${profile.description}\\n`;
        output += `   Initial velocity: ${profile.initial_velocity} points`;
        output += ` (confidence: ${Math.round(profile.confidence * 100)}%)\\n`;
        output += `   Best for: ${profile.recommended_for.slice(0, 2).join(', ')}`;
        if (profile.recommended_for.length > 2) {
          output += `, +${profile.recommended_for.length - 2} more`;
        }
        output += '\\n\\n';
      });
      
      return output;
    });
  }

  /**
   * Get profile recommendation based on project characteristics
   */
  async recommendProfile(projectCharacteristics) {
    const profiles = await this.loadProfiles();
    if (!profiles) return 'custom';

    const { hasUI, isAPI, isMobile, isDataIntensive, isEnterprise, isMVP } = projectCharacteristics;

    // Simple recommendation logic
    if (isEnterprise) return 'enterprise_system';
    if (isMobile) return 'mobile_app';
    if (isDataIntensive) return 'data_pipeline';
    if (isMVP) return 'saas_mvp';
    if (isAPI && !hasUI) return 'api_only';
    if (hasUI) return 'standard_web_app';
    
    return 'custom';
  }

  /**
   * Calculate performance percentile based on actual vs community velocity
   */
  calculatePercentile(actualVelocity, profileId) {
    const profile = this.profiles?.profiles[profileId];
    if (!profile) return 'N/A';

    const { min, max } = profile.velocity_range;
    const average = profile.initial_velocity;

    if (actualVelocity < min) return 'Below 25th';
    if (actualVelocity > max) return 'Above 75th';
    
    // Simple linear interpolation
    const position = (actualVelocity - min) / (max - min);
    const percentile = Math.round(position * 50 + 25); // Maps to 25th-75th percentile
    
    return `${percentile}th percentile`;
  }

  /**
   * Update velocity comparison after sprint completion
   */
  async updateComparison(velocityMetricsPath, actualVelocity) {
    try {
      const velocityMetrics = await fs.readJSON(velocityMetricsPath);
      const profileId = velocityMetrics.meta.velocity_profile;
      
      if (profileId && profileId !== 'custom') {
        velocityMetrics.community_benchmarks.comparison.your_velocity = actualVelocity;
        velocityMetrics.community_benchmarks.comparison.percentile = 
          this.calculatePercentile(actualVelocity, profileId);
        
        const communityAvg = velocityMetrics.community_benchmarks.comparison.community_average;
        const performance = actualVelocity > communityAvg * 1.1 ? 'Above Average' :
                          actualVelocity < communityAvg * 0.9 ? 'Below Average' : 'Average';
        velocityMetrics.community_benchmarks.comparison.performance = performance;
        
        await fs.writeJSON(velocityMetricsPath, velocityMetrics, { spaces: 2 });
      }
    } catch (error) {
      console.error('Failed to update velocity comparison:', error);
    }
  }
}

module.exports = VelocityProfileSelector;