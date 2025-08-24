#!/usr/bin/env node

/**
 * Claude Hook Bridge
 * Provides unified control over both AgileAiAgents hooks and Claude Code hooks
 */

const fs = require('fs');
const path = require('path');

class ClaudeHookBridge {
  constructor() {
    this.workspaceRoot = path.join(__dirname, '../../..');
    this.repoRoot = path.join(__dirname, '..');
  }

  /**
   * Check if we're running in workspace mode (parent directory)
   */
  isWorkspaceMode() {
    try {
      // Check if we're in parent directory with agile-ai-agents folder
      return fs.existsSync(path.join(this.workspaceRoot, 'agile-ai-agents'));
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the appropriate settings path based on execution context
   */
  getSettingsPath() {
    return this.isWorkspaceMode() 
      ? path.join(this.workspaceRoot, '.claude/settings.local.json')
      : path.join(this.repoRoot, '.claude/settings.local.json');
  }

  /**
   * Get Claude Code settings path
   */
  getClaudeSettingsPath() {
    return this.isWorkspaceMode()
      ? path.join(this.workspaceRoot, '.claude/settings.json')
      : path.join(this.repoRoot, '.claude/settings.json');
  }

  /**
   * Load settings from file
   */
  loadSettings() {
    const settingsPath = this.getSettingsPath();
    try {
      if (fs.existsSync(settingsPath)) {
        return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    // Return default settings if file doesn't exist
    return {
      hookSettings: {
        enabled: true,
        syncEnabled: true,
        agileHooksProfile: 'standard',
        autoSyncToParent: true
      }
    };
  }

  /**
   * Save settings to file
   */
  saveSettings(settings) {
    const settingsPath = this.getSettingsPath();
    try {
      // Ensure directory exists
      const dir = path.dirname(settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Enable or disable all hooks
   */
  async setHooksEnabled(enabled) {
    console.log(`${enabled ? 'Enabling' : 'Disabling'} all hooks...`);
    
    // Update local settings
    const settings = this.loadSettings();
    settings.hookSettings.enabled = enabled;
    this.saveSettings(settings);
    
    // Update AgileAiAgents hooks
    await this.updateAgileHooks(enabled);
    
    // Update Claude Code hooks
    await this.updateClaudeHooks(enabled);
    
    console.log(`✅ All hooks ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Update AgileAiAgents hook configuration
   */
  async updateAgileHooks(enabled) {
    const hookConfigPath = path.join(this.repoRoot, 'hooks/config/hook-config.json');
    
    try {
      const config = JSON.parse(fs.readFileSync(hookConfigPath, 'utf8'));
      config.enabled = enabled;
      fs.writeFileSync(hookConfigPath, JSON.stringify(config, null, 2));
      console.log(`✅ AgileAiAgents hooks ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update AgileAiAgents hooks:', error);
    }
  }

  /**
   * Update Claude Code hook configuration
   */
  async updateClaudeHooks(enabled) {
    const claudeSettingsPath = this.getClaudeSettingsPath();
    
    try {
      let claudeSettings = {};
      
      if (fs.existsSync(claudeSettingsPath)) {
        claudeSettings = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf8'));
      }
      
      if (enabled) {
        // Restore hooks from template if enabling
        const templatePath = path.join(this.repoRoot, '.claude/settings.json.template');
        if (fs.existsSync(templatePath)) {
          const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
          claudeSettings.hooks = template.hooks;
          
          // Adjust paths for workspace mode
          if (this.isWorkspaceMode()) {
            this.adjustHookPaths(claudeSettings.hooks);
          }
        }
      } else {
        // Clear all hooks if disabling
        claudeSettings.hooks = {};
      }
      
      fs.writeFileSync(claudeSettingsPath, JSON.stringify(claudeSettings, null, 2));
      console.log(`✅ Claude Code hooks ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update Claude Code hooks:', error);
    }
  }

  /**
   * Adjust hook paths for workspace mode
   */
  adjustHookPaths(hooks) {
    for (const [eventName, hookList] of Object.entries(hooks)) {
      if (Array.isArray(hookList)) {
        hookList.forEach(hookConfig => {
          if (hookConfig.hooks && Array.isArray(hookConfig.hooks)) {
            hookConfig.hooks.forEach(hook => {
              if (hook.command && Array.isArray(hook.command)) {
                hook.command = hook.command.map(cmd => 
                  cmd.replace('$CLAUDE_PROJECT_DIR', '.')
                );
              }
            });
          }
        });
      }
    }
  }

  /**
   * Get current hook status
   */
  getStatus() {
    const settings = this.loadSettings();
    const agileConfigPath = path.join(this.repoRoot, 'hooks/config/hook-config.json');
    const claudeSettingsPath = this.getClaudeSettingsPath();
    
    let agileEnabled = false;
    let claudeEnabled = false;
    
    try {
      const agileConfig = JSON.parse(fs.readFileSync(agileConfigPath, 'utf8'));
      agileEnabled = agileConfig.enabled || false;
    } catch (error) {
      // Ignore
    }
    
    try {
      const claudeSettings = JSON.parse(fs.readFileSync(claudeSettingsPath, 'utf8'));
      claudeEnabled = claudeSettings.hooks && Object.keys(claudeSettings.hooks).length > 0;
    } catch (error) {
      // Ignore
    }
    
    return {
      masterEnabled: settings.hookSettings?.enabled || true,
      agileHooksEnabled: agileEnabled,
      claudeHooksEnabled: claudeEnabled,
      syncEnabled: settings.hookSettings?.syncEnabled || true,
      profile: settings.hookSettings?.agileHooksProfile || 'standard',
      executionContext: this.isWorkspaceMode() ? 'workspace' : 'repository'
    };
  }

  /**
   * Update sync settings
   */
  setSyncEnabled(enabled) {
    const settings = this.loadSettings();
    settings.hookSettings.syncEnabled = enabled;
    settings.hookSettings.autoSyncToParent = enabled;
    this.saveSettings(settings);
    console.log(`✅ Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set AgileAiAgents hook profile
   */
  setProfile(profile) {
    const settings = this.loadSettings();
    settings.hookSettings.agileHooksProfile = profile;
    this.saveSettings(settings);
    
    // Also update the AgileAiAgents hook config
    const hookConfigPath = path.join(this.repoRoot, 'hooks/config/hook-config.json');
    try {
      const config = JSON.parse(fs.readFileSync(hookConfigPath, 'utf8'));
      config.profile = profile;
      fs.writeFileSync(hookConfigPath, JSON.stringify(config, null, 2));
      console.log(`✅ Hook profile set to: ${profile}`);
    } catch (error) {
      console.error('Failed to update hook profile:', error);
    }
  }
}

// CLI interface
if (require.main === module) {
  const bridge = new ClaudeHookBridge();
  const command = process.argv[2];
  const param = process.argv[3];
  
  switch (command) {
    case 'enable':
      bridge.setHooksEnabled(true);
      break;
      
    case 'disable':
      bridge.setHooksEnabled(false);
      break;
      
    case 'status':
      const status = bridge.getStatus();
      console.log('Hook System Status:');
      console.log(`  Context: ${status.executionContext}`);
      console.log(`  Master: ${status.masterEnabled ? 'ON' : 'OFF'}`);
      console.log(`  AgileAiAgents: ${status.agileHooksEnabled ? 'ON' : 'OFF'}`);
      console.log(`  Claude Code: ${status.claudeHooksEnabled ? 'ON' : 'OFF'}`);
      console.log(`  Auto-sync: ${status.syncEnabled ? 'ON' : 'OFF'}`);
      console.log(`  Profile: ${status.profile}`);
      break;
      
    case 'sync':
      if (param === 'on') {
        bridge.setSyncEnabled(true);
      } else if (param === 'off') {
        bridge.setSyncEnabled(false);
      } else {
        console.log('Usage: node claude-hook-bridge.js sync [on|off]');
      }
      break;
      
    case 'profile':
      if (param) {
        bridge.setProfile(param);
      } else {
        console.log('Usage: node claude-hook-bridge.js profile [minimal|standard|advanced]');
      }
      break;
      
    default:
      console.log('Claude Hook Bridge - Unified hook control');
      console.log('');
      console.log('Usage:');
      console.log('  node claude-hook-bridge.js enable    - Enable all hooks');
      console.log('  node claude-hook-bridge.js disable   - Disable all hooks');
      console.log('  node claude-hook-bridge.js status    - Show hook status');
      console.log('  node claude-hook-bridge.js sync [on|off]  - Enable/disable auto-sync');
      console.log('  node claude-hook-bridge.js profile [name] - Set hook profile');
  }
}

module.exports = ClaudeHookBridge;