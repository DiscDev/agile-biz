const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs-extra');
const path = require('path');

/**
 * Deployment Window Enforcer Hook
 * Enforces deployment windows and blackout periods
 * Prevents deployments during high-risk times
 */
class DeploymentWindowEnforcer extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'deployment-window-enforcer',
      agent: 'devops_agent',
      category: 'critical',
      impact: 'low', // Just date/time checks
      cacheEnabled: false, // Always check current time
      ...config
    });

    // Default deployment windows (in project timezone)
    this.allowedWindows = config.config?.allowedWindows || [
      {
        days: ['monday', 'tuesday', 'wednesday', 'thursday'],
        startHour: 9,
        endHour: 16,
        timezone: 'America/Los_Angeles'
      },
      {
        days: ['friday'],
        startHour: 9,
        endHour: 12, // No Friday afternoon deployments
        timezone: 'America/Los_Angeles'
      }
    ];

    // Blackout periods (absolute no deployments)
    this.blackoutPeriods = config.config?.blackoutPeriods || [
      {
        name: 'Holiday Shopping Season',
        startDate: '11-20',
        endDate: '01-02',
        critical: true
      },
      {
        name: 'End of Quarter',
        dates: ['03-28', '03-29', '03-30', '03-31', '06-28', '06-29', '06-30', '09-28', '09-29', '09-30', '12-28', '12-29', '12-30', '12-31'],
        critical: true
      }
    ];

    // Emergency override settings
    this.emergencyOverride = {
      enabled: config.config?.emergencyOverride?.enabled ?? true,
      requiresApproval: config.config?.emergencyOverride?.requiresApproval ?? true,
      approvers: config.config?.emergencyOverride?.approvers || ['devops-lead', 'cto', 'engineering-manager'],
      reason: config.config?.emergencyOverride?.reason || null
    };

    // Risk assessment thresholds
    this.riskThresholds = {
      highTrafficHours: config.config?.riskThresholds?.highTrafficHours || [
        { startHour: 11, endHour: 14 }, // Lunch hours
        { startHour: 18, endHour: 21 }  // Evening peak
      ],
      weekendMultiplier: config.config?.riskThresholds?.weekendMultiplier ?? 2,
      holidayMultiplier: config.config?.riskThresholds?.holidayMultiplier ?? 5
    };
  }

  async handle(context) {
    const { action, trigger, metadata = {} } = context;

    // Only check deployment-related actions
    if (!['deployment', 'pre-deployment', 'deploy-check'].includes(trigger)) {
      return { skipped: true, reason: 'Not a deployment trigger' };
    }

    const now = new Date();
    const assessment = this.assessDeploymentRisk(now, metadata);

    // Check if in allowed window
    const windowCheck = this.checkDeploymentWindow(now);
    const blackoutCheck = this.checkBlackoutPeriod(now);
    
    // Check for emergency override
    const hasOverride = await this.checkEmergencyOverride(metadata);

    const allowed = windowCheck.allowed && !blackoutCheck.inBlackout;
    const canProceed = allowed || hasOverride;

    return {
      success: canProceed,
      allowed: canProceed,
      blocked: !canProceed,
      window: windowCheck,
      blackout: blackoutCheck,
      risk: assessment,
      override: hasOverride ? {
        used: true,
        approver: metadata.approver,
        reason: metadata.overrideReason
      } : null,
      message: this.generateMessage(windowCheck, blackoutCheck, assessment, hasOverride),
      recommendations: this.generateRecommendations(windowCheck, assessment)
    };
  }

  assessDeploymentRisk(date, metadata) {
    let riskScore = 0;
    const factors = [];

    // Day of week risk
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    if (['saturday', 'sunday'].includes(dayOfWeek)) {
      riskScore += 30;
      factors.push({ factor: 'weekend', score: 30, reason: 'Limited support availability' });
    } else if (dayOfWeek === 'friday') {
      riskScore += 20;
      factors.push({ factor: 'friday', score: 20, reason: 'Issues may persist over weekend' });
    }

    // Time of day risk
    const hour = date.getHours();
    const inHighTraffic = this.riskThresholds.highTrafficHours.some(period => 
      hour >= period.startHour && hour < period.endHour
    );
    if (inHighTraffic) {
      riskScore += 25;
      factors.push({ factor: 'high-traffic', score: 25, reason: 'Peak usage hours' });
    }

    // After hours risk
    if (hour < 8 || hour >= 18) {
      riskScore += 15;
      factors.push({ factor: 'after-hours', score: 15, reason: 'Outside business hours' });
    }

    // Deployment size risk
    if (metadata.changeSize === 'large') {
      riskScore += 30;
      factors.push({ factor: 'large-change', score: 30, reason: 'Significant changes' });
    } else if (metadata.changeSize === 'medium') {
      riskScore += 15;
      factors.push({ factor: 'medium-change', score: 15, reason: 'Moderate changes' });
    }

    // Recent incident risk
    if (metadata.recentIncidents > 0) {
      const incidentScore = Math.min(metadata.recentIncidents * 10, 30);
      riskScore += incidentScore;
      factors.push({ 
        factor: 'recent-incidents', 
        score: incidentScore, 
        reason: `${metadata.recentIncidents} incidents in last 7 days` 
      });
    }

    // Calculate risk level
    let level = 'low';
    if (riskScore >= 70) level = 'critical';
    else if (riskScore >= 50) level = 'high';
    else if (riskScore >= 30) level = 'medium';

    return {
      score: riskScore,
      level,
      factors,
      recommendation: this.getRiskRecommendation(level)
    };
  }

  checkDeploymentWindow(date) {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const hour = date.getHours();
    const minute = date.getMinutes();
    const currentTime = hour + (minute / 60);

    for (const window of this.allowedWindows) {
      if (window.days.includes(dayOfWeek)) {
        if (currentTime >= window.startHour && currentTime < window.endHour) {
          const remainingHours = window.endHour - currentTime;
          return {
            allowed: true,
            window: window,
            remainingTime: `${Math.floor(remainingHours)}h ${Math.round((remainingHours % 1) * 60)}m`
          };
        }
      }
    }

    // Find next available window
    const nextWindow = this.findNextWindow(date);

    return {
      allowed: false,
      reason: 'Outside deployment window',
      currentTime: date.toLocaleString(),
      nextWindow
    };
  }

  checkBlackoutPeriod(date) {
    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    for (const blackout of this.blackoutPeriods) {
      // Check specific dates
      if (blackout.dates && blackout.dates.includes(monthDay)) {
        return {
          inBlackout: true,
          period: blackout,
          reason: blackout.name
        };
      }

      // Check date ranges
      if (blackout.startDate && blackout.endDate) {
        const inRange = this.isDateInRange(monthDay, blackout.startDate, blackout.endDate);
        if (inRange) {
          return {
            inBlackout: true,
            period: blackout,
            reason: blackout.name
          };
        }
      }
    }

    return {
      inBlackout: false
    };
  }

  isDateInRange(date, start, end) {
    // Handle year boundary (e.g., 11-20 to 01-02)
    if (start > end) {
      return date >= start || date <= end;
    }
    return date >= start && date <= end;
  }

  findNextWindow(currentDate) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = currentDate.getDay();
    const currentHour = currentDate.getHours();

    // Check remaining time today
    for (const window of this.allowedWindows) {
      const dayIndex = daysOfWeek.indexOf(daysOfWeek[currentDay]);
      if (window.days.includes(daysOfWeek[dayIndex]) && currentHour < window.startHour) {
        const hoursUntil = window.startHour - currentHour;
        return {
          day: daysOfWeek[dayIndex],
          time: `${window.startHour}:00`,
          hoursUntil
        };
      }
    }

    // Check future days
    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const futureDay = (currentDay + daysAhead) % 7;
      const dayName = daysOfWeek[futureDay];
      
      for (const window of this.allowedWindows) {
        if (window.days.includes(dayName)) {
          const hoursUntil = (daysAhead * 24) - currentHour + window.startHour;
          return {
            day: dayName,
            time: `${window.startHour}:00`,
            hoursUntil,
            daysAway: daysAhead
          };
        }
      }
    }

    return null;
  }

  async checkEmergencyOverride(metadata) {
    if (!this.emergencyOverride.enabled) {
      return false;
    }

    if (!metadata.emergencyOverride) {
      return false;
    }

    // Check if approver is authorized
    if (this.emergencyOverride.requiresApproval) {
      const approver = metadata.approver || metadata.emergencyOverride.approver;
      if (!this.emergencyOverride.approvers.includes(approver)) {
        return false;
      }
    }

    // Check if reason is provided
    const reason = metadata.overrideReason || metadata.emergencyOverride.reason;
    if (!reason || reason.length < 10) {
      return false;
    }

    // Log the override
    await this.logOverride({
      timestamp: new Date(),
      approver: metadata.approver,
      reason,
      deployment: metadata.deploymentId || 'unknown'
    });

    return true;
  }

  async logOverride(override) {
    const logPath = path.join(this.config.projectPath, '.deployment-overrides.log');
    const logEntry = `${override.timestamp.toISOString()} | ${override.approver} | ${override.deployment} | ${override.reason}\n`;
    
    try {
      await fs.appendFile(logPath, logEntry);
    } catch (error) {
      console.error('[DeploymentWindowEnforcer] Failed to log override:', error);
    }
  }

  getRiskRecommendation(level) {
    const recommendations = {
      low: 'Safe to deploy with standard procedures',
      medium: 'Deploy with caution, ensure rollback plan ready',
      high: 'Consider postponing unless critical, have team on standby',
      critical: 'Strongly recommend postponing deployment'
    };
    return recommendations[level];
  }

  generateRecommendations(windowCheck, assessment) {
    const recommendations = [];

    if (!windowCheck.allowed && windowCheck.nextWindow) {
      if (windowCheck.nextWindow.hoursUntil < 4) {
        recommendations.push({
          type: 'wait',
          message: `Wait ${windowCheck.nextWindow.hoursUntil} hours for next deployment window`
        });
      } else {
        recommendations.push({
          type: 'schedule',
          message: `Schedule deployment for ${windowCheck.nextWindow.day} at ${windowCheck.nextWindow.time}`
        });
      }
    }

    if (assessment.level === 'high' || assessment.level === 'critical') {
      recommendations.push({
        type: 'risk-mitigation',
        message: 'Consider breaking deployment into smaller changes'
      });
      recommendations.push({
        type: 'monitoring',
        message: 'Ensure enhanced monitoring during and after deployment'
      });
    }

    return recommendations;
  }

  generateMessage(windowCheck, blackoutCheck, assessment, hasOverride) {
    if (blackoutCheck.inBlackout && !hasOverride) {
      return `🚫 Deployment blocked: ${blackoutCheck.reason} blackout period`;
    }

    if (!windowCheck.allowed && !hasOverride) {
      const next = windowCheck.nextWindow;
      return `⏰ Deployment blocked: Outside allowed window. Next window: ${next.day} at ${next.time} (${next.hoursUntil}h)`;
    }

    if (hasOverride) {
      return `⚠️ Emergency deployment override approved. Risk level: ${assessment.level}`;
    }

    if (assessment.level === 'critical') {
      return `⚠️ Deployment allowed but HIGH RISK (score: ${assessment.score}). Proceed with extreme caution`;
    }

    if (assessment.level === 'high') {
      return `⚠️ Deployment allowed with elevated risk (score: ${assessment.score}). Ensure team availability`;
    }

    return `✅ Deployment allowed. Risk level: ${assessment.level} (score: ${assessment.score}). Window closes in ${windowCheck.remainingTime}`;
  }

  getDescription() {
    return 'Enforces deployment windows and prevents deployments during blackout periods';
  }

  getConfigurableOptions() {
    return {
      allowedWindows: {
        type: 'array',
        default: [
          { days: ['monday', 'tuesday', 'wednesday', 'thursday'], startHour: 9, endHour: 16 },
          { days: ['friday'], startHour: 9, endHour: 12 }
        ],
        description: 'Allowed deployment time windows'
      },
      blackoutPeriods: {
        type: 'array',
        default: [],
        description: 'Absolute no-deployment periods'
      },
      emergencyOverride: {
        enabled: {
          type: 'boolean',
          default: true,
          description: 'Allow emergency override'
        },
        requiresApproval: {
          type: 'boolean',
          default: true,
          description: 'Require approval for override'
        },
        approvers: {
          type: 'array',
          default: ['devops-lead', 'cto'],
          description: 'Authorized approvers'
        }
      },
      riskThresholds: {
        type: 'object',
        default: {
          highTrafficHours: [{ startHour: 11, endHour: 14 }, { startHour: 18, endHour: 21 }],
          weekendMultiplier: 2,
          holidayMultiplier: 5
        },
        description: 'Risk assessment configuration'
      }
    };
  }
}

module.exports = DeploymentWindowEnforcer;