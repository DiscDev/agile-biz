# CLAUDE-config.md

**PATH CONVENTION**: All file paths in this document are relative to the `agile-ai-agents/` directory.

**IMPORTANT (v7.0.0+)**: All configuration is now stored in `project-state/configuration.json` as the single source of truth. This document serves as reference documentation for the available settings and their valid values. Use the `/aaa-config` command to modify settings.

## Verbosity Configuration

```yaml
verbosity:
  level: "normal"              # Options: quiet, normal, verbose, debug
  display:
    format: "grouped_by_agent"  # How to group status messages
    timezone: "America/Los_Angeles"  # PST/PDT default (change to your timezone)
    time_format: "12h"          # Options: 12h, 24h
    show_timezone: true         # Show timezone in timestamps
```

## Project State Configuration

```yaml
project_state:
  auto_save:
    enabled: true               # Automatically save state after significant actions
    
    # Notification settings
    show_confirmations: true    # Show save confirmations
    confirmation_style: "minimal" # Options: silent, minimal, verbose
    
    # Save frequency preset
    frequency_preset: "balanced" # Options: aggressive, balanced, minimal, manual
    
    # Custom frequency (overrides preset)
    save_frequency:
      document_creation: true   # Save after creating documents
      section_completion: true  # Save after interview sections
      phase_transitions: true   # Save between workflow phases
      time_interval: 30         # Minutes between auto-saves (0 to disable)
      decision_threshold: 5     # Save after N decisions (0 to disable)
      
    # Save mode
    save_mode: "update"         # Options: update, checkpoint, hybrid
    # update: Only update current-state.json
    # checkpoint: Create full checkpoint (for manual /checkpoint only)
    # hybrid: Update current + checkpoint on phase transitions
    
    debounce_ms: 5000          # Wait 5 seconds before saving (batches rapid changes)
  
  # Frequency presets
  frequency_presets:
    aggressive:
      document_creation: true
      section_completion: true
      phase_transitions: true
      time_interval: 10
      decision_threshold: 1
      
    balanced:  # DEFAULT
      document_creation: true
      section_completion: true
      phase_transitions: true
      time_interval: 30
      decision_threshold: 5
      
    minimal:
      document_creation: false
      section_completion: false
      phase_transitions: true
      time_interval: 60
      decision_threshold: 10
      
    manual:
      document_creation: false
      section_completion: false
      phase_transitions: false
      time_interval: 0
      decision_threshold: 0
  
  checkpoint:
    auto_checkpoint_interval: 30  # Create checkpoint every 30 minutes
    max_checkpoints: 20          # Keep last 20 checkpoints
    checkpoint_on_phase_change: true  # Create checkpoint when project phase changes
  
  session:
    track_file_access: true     # Track which files are accessed
    max_recent_files: 10        # Number of recent files to track
    preserve_working_directory: true  # Remember working directory between sessions
  
  context:
    max_decisions_in_context: 10  # Number of recent decisions to keep loaded
    compress_old_sessions: true   # Compress sessions older than 7 days
    priority_loading: true        # Use smart context loading priorities
```

## Community Learnings Configuration

```yaml
community_learnings:
  contribution:
    enabled: true               # Enable community learning contributions
    
    # Command trigger behavior
    command_triggers:
      enabled: true             # Enable command-based triggers
      auto_prompt_after_command: true  # Auto show prompt after trigger commands (DEFAULT)
      # Options: true (automatic), false (manual), "confirm" (ask first)
      
    # Command integration  
    integrated_commands:
      sprint_retrospective: true    # /sprint-retrospective triggers contribution
      milestone: true              # /milestone triggers contribution
      deployment_success: true     # /deployment-success triggers contribution
      project_complete: true       # /project-complete triggers contribution
    
    auto_prompt:                # When to prompt for contributions
      - sprint_complete         # After sprint retrospective
      - milestone_reached       # After major milestones
      - deployment_success      # After successful deployments
      - project_complete        # At project completion
    prompt_delay_minutes: 10    # Wait before prompting (allows reflection)
    
    # Skip options
    skip_options:
      allow_skip: true          # Allow /skip-contribution command
      skip_duration: "session"  # Options: "session", "sprint", "day", "permanent"
      remember_skips: true      # Track why users skip
    
  capture:
    include_metrics: true       # Capture performance metrics
    include_patterns: true      # Capture identified patterns
    include_agent_feedback: true # Include agent-specific learnings
    anonymize_data: true        # Auto-anonymize sensitive information
    min_sprint_duration: 2      # Minimum days before capturing learnings
    
  analysis:
    enabled: true               # Enable Learning Analysis Agent
    confidence_threshold: 0.7   # Min confidence for pattern identification
    min_pattern_samples: 3      # Min contributions for pattern detection
    auto_implementation: 0.9    # Auto-implement if confidence >= 0.9
    
  privacy:
    scan_for_secrets: true      # Scan for API keys, passwords, etc.
    remove_identifiers: true    # Remove names, emails, domains
    replace_paths: true         # Replace absolute paths with relative
    review_before_submit: true  # User reviews before contribution
```

## Hooks Configuration

```yaml
hooks:
  enabled: true                  # Master switch for all hooks
  profile: "standard"            # Options: minimal, standard, advanced, custom
  
  # Hook-specific configurations
  hooks:
    sprint_document_tracker:
      enabled: true
      config:
        watchPaths: ["project-documents/orchestration/sprints"]
        updateInterval: 5000     # milliseconds
        velocityUpdateThreshold: 0.1  # 10% change triggers update
        
    pulse_generator:
      enabled: true
      config:
        eventTypes: ["sprint-start", "story-done", "blocker-new", "blocker-resolved", "milestone"]
        batchTimeout: 60000      # 60 seconds for minor events
        
    state_backup:
      enabled: true
      config:
        backupInterval: 1800000  # 30 minutes
        maxBackups: 10
        compressionThreshold: 1048576  # 1MB
        
    state_integrity_check:
      enabled: true
      config:
        checkInterval: 300000    # 5 minutes
        autoRepair: true
        requiredFields: ["version", "lastUpdated", "projectName"]
        
    session_tracker:
      enabled: true
      config:
        trackCommands: true
        trackFiles: true
        maxHistoryDays: 30
        
    agent_context_updater:
      enabled: true
      config:
        updateThreshold: 0.7     # confidence threshold
        trackCollaboration: true
        
    command_validator:
      enabled: true
      config:
        showSuggestions: true
        maxSuggestions: 3
        allowPartialMatch: true
        
    dashboard_event_notifier:
      enabled: true
      config:
        dashboardUrl: "http://localhost:3001"
        batchEvents: true
        batchSize: 10
        flushInterval: 2000      # 2 seconds
        
    cost_monitor:
      enabled: true
      config:
        thresholds:
          hourly: 10             # dollars
          daily: 50              # dollars
          session: 5             # dollars
        alertMethods: ["dashboard", "console"]
        
    learning_capture:
      enabled: true
      config:
        triggers: ["sprint-complete", "milestone", "deployment", "project-complete"]
        minSprintDuration: 2     # days
        anonymize: true
        
    input_security_scan:
      enabled: true
      config:
        scanPatterns: ["api_keys", "passwords", "pii", "secrets"]
        whitelist: ["test", "example", "demo"]
        logDetections: true
    
    # Agent-specific hooks (v3.6.0)
    vulnerability_scanner:
      enabled: true              # Profile: minimal, standard, advanced
      config:
        thresholds:
          critical: 0
          high: 0
          moderate: 5
          low: 10
    
    secret_rotation_reminder:
      enabled: true              # Profile: minimal, standard, advanced
      config:
        schedules:
          api_key: 90
          password: 60
          jwt_secret: 180
          database_password: 90
    
    coverage_gatekeeper:
      enabled: true              # Profile: minimal, standard, advanced
      config:
        thresholds:
          overall: 80
          branches: 75
          functions: 80
          lines: 80
    
    defensive_patterns:
      enabled: true              # Profile: minimal, standard, advanced
      config:
        blockingThreshold: 10
        autoFix: false
        strictMode: false
    
    deployment_window_enforcer:
      enabled: true              # Profile: standard, advanced
      config:
        allowedWindows:
          - days: ["monday", "tuesday", "wednesday", "thursday"]
            startHour: 9
            endHour: 16
          - days: ["friday"]
            startHour: 9
            endHour: 12
    
    dependency_checker:
      enabled: true              # Profile: standard, advanced
      config:
        checks:
          outdated: true
          deprecated: true
          licenses: true
          size: true
    
    import_validator:
      enabled: true              # Profile: standard, advanced
      config:
        requireExtensions: false
        checkCircular: true
    
    test_categorizer:
      enabled: true              # Profile: standard, advanced
      config:
        balanceTargets:
          unit: { min: 60, max: 80 }
          integration: { min: 15, max: 30 }
          e2e: { min: 5, max: 15 }
    
    # Enhancement hooks (v3.6.0)
    code_formatter:
      enabled: false             # Profile: advanced
      config:
        formatOnSave: true
        formatOnCommit: true
        formatters: ["prettier", "black", "gofmt", "rustfmt"]
    
    commit_message_validator:
      enabled: false             # Profile: advanced
      config:
        format: "conventional"
        maxHeaderLength: 100
        requireScope: false
        requireBody: false
    
    pr_template_checker:
      enabled: false             # Profile: advanced
      config:
        requiredSections: ["Description", "Type of Change", "Testing", "Checklist"]
        minimumCompleteness: 80
        enforceChecklist: true
    
    dead_code_detector:
      enabled: false             # Profile: none (high performance impact)
      config:
        warningThreshold: 20
        errorThreshold: 40
        checkExports: true
        ignorePatterns: ["test", "spec", "mock"]
    
    complexity_analyzer:
      enabled: false             # Profile: advanced
      config:
        thresholds:
          low: 5
          medium: 10
          high: 15
          critical: 20
        includeMethodComplexity: true
  
  # Agent hook profiles
  agent_hook_profiles:
    minimal:
      performanceBudget: 300     # milliseconds
      description: "Critical hooks only for minimal performance impact"
    standard:
      performanceBudget: 500     # milliseconds
      description: "Critical + valuable hooks for balanced approach"
    advanced:
      performanceBudget: 1000    # milliseconds
      description: "Most hooks enabled for maximum quality"
    custom:
      performanceBudget: 1000    # milliseconds
      description: "User-defined configuration"
        
  # Performance settings
  performance:
    timeout: 5000               # Max execution time per hook (ms)
    warningThreshold: 1000      # Log warning if hook takes longer (ms)
    maxRetries: 3              # For critical hooks only
    autoDisable:
      enabled: true             # Auto-disable poorly performing hooks
      thresholds:
        executionTime: 2000     # Disable if exceeds 2 seconds
        failureRate: 0.5        # Disable if >50% failure rate
        consecutiveFailures: 5  # Disable after 5 consecutive failures
    
  # Logging settings
  logging:
    level: "normal"              # Options: debug, info, warn, error
    file: "hooks/logs/hooks.log"
    maxSize: "10mb"
    maxFiles: 5
```

## Research Verification Configuration (Prevent LLM Hallucination)

```yaml
research_verification:
  level: "normal"              # Global default: fast, balanced, thorough, paranoid
  
  # Override precedence: document_type > agent > global
  override_precedence: "document_agent_global"
  
  mcp_integration:
    enabled: true               # Use MCP servers when available
    preferred_sources:
      - perplexity              # Web searches with citations
      - firecrawl               # Website data extraction  
      - github                  # Code/repo verification
      - websearch               # General web searches
    fallback_to_llm: true       # Use LLM if MCPs unavailable
    
  agent_overrides:              # Agent-specific defaults
    research_agent: "thorough"
    finance_agent: "thorough"
    analysis_agent: "thorough"
    security_agent: "paranoid"
    marketing_agent: "balanced"
    business_documents_agent: "thorough"
    api_agent: "thorough"
    ui_ux_agent: "fast"
    coder_agent: "fast"
    scrum_master_agent: "fast"
    documentator_agent: "balanced"
    
  document_type_overrides:      # Highest priority overrides
    # Critical documents (paranoid)
    financial_projections: "paranoid"
    security_assessment: "paranoid"
    compliance_report: "paranoid"
    investment_analysis: "paranoid"
    vulnerability_report: "paranoid"
    
    # Research documents (thorough)
    market_research: "thorough"
    competitor_analysis: "thorough"
    technical_specifications: "thorough"
    api_documentation: "thorough"
    feasibility_study: "thorough"
    
    # Standard documents (balanced)
    project_plan: "balanced"
    sprint_planning: "balanced"
    requirements_document: "balanced"
    user_manual: "balanced"
    
    # Creative/Internal documents (fast)
    user_stories: "fast"
    ui_mockups: "fast"
    brainstorming_notes: "fast"
    team_updates: "fast"
    meeting_notes: "fast"
    
  verification_rules:
    require_sources_for:
      - statistics              # Any numerical claims
      - financial_data          # Revenue, costs, valuations
      - market_claims           # Market size, growth rates
      - technical_specs         # Version numbers, requirements
      - legal_requirements      # Compliance, regulations
      - quotes                  # Direct quotations
      - competitor_data         # Competitor information
      
    flag_uncertainty: true      # Add confidence indicators
    separate_facts_from_analysis: true
    
  cache:
    enabled: true
    location: "project-state/verification-cache/"
    retention_hours:
      market_data: 24           # 1 day
      company_info: 168         # 7 days
      technical_docs: 720       # 30 days
      cached_searches: 72       # 3 days
      
  mcp_failure_strategy: "degrade"  # Options: degrade, wait, abort
  
  degradation_rules:
    confidence_penalty: 20      # Reduce confidence by 20%
    flag_unverified: true       # Mark content as unverified
    notify_user: true           # Always inform about degradation
    allow_continue: true        # Don't block document creation
    
  notifications:
    show_verification_level: true
    show_mcp_status: true
    show_confidence_scores: true
    show_source_count: true
```

## Sub-Agent Configuration (v4.0.0+)

```yaml
sub_agents:
  enabled: true                   # Master switch for sub-agent functionality
  default_mode: "parallel"        # Options: parallel, sequential, hybrid
  
  orchestration:
    max_concurrent: 5             # Maximum sub-agents running simultaneously
    timeout_seconds: 300          # 5 minute timeout per sub-agent
    retry_attempts: 1             # Retry once on failure
    
  token_management:
    base_budget: 10000           # Base token allocation
    session_limit: 100000        # Total tokens per session
    warning_threshold: 0.8       # Warn at 80% usage
    enforcement: "strict"        # Options: strict, flexible, monitoring
    
  document_registry:
    type: "hybrid"               # Hybrid approach (central + session-based)
    consolidation_interval: 300  # Consolidate every 5 minutes
    archive_after_hours: 24      # Archive old sessions after 24 hours
    
  code_coordination:
    ownership_model: "file-level"     # File-level ownership for simplicity
    conflict_prevention: true         # Prevent conflicts through smart assignment
    status_tracking: "pulse-system"   # Use pulse system for status updates
    
  error_handling:
    retry_on_timeout: true       # Retry once with reduced scope
    save_partial_progress: true  # Save work before failure
    fallback_to_main: true       # Use main agent if sub-agent fails
    
  research_phase:
    enabled: true
    groups:
      market_intelligence: ["competitive-analysis", "market-analysis", "industry-trends", "customer-research"]
      business_analysis: ["viability-analysis", "business-model-analysis", "pricing-strategy", "risk-assessment"]
      technical_feasibility: ["technology-landscape", "technical-feasibility", "vendor-supplier-analysis"]
    time_reduction: "75%"        # 4-6 hours → 1-2 hours
    
  sprint_execution:
    enabled: true
    parallel_stories: true       # Work on multiple stories simultaneously
    max_parallel_coders: 3       # Up to 3 coder sub-agents
    coordination_doc: "code-coordination.md"
    file_ownership: "exclusive"  # Each sub-agent owns specific files
    integration_phase: true      # Sequential handling of shared files
    time_reduction: "60%"        # 5 days → 2 days typical sprint
    
  project_analysis:
    enabled: true
    analysis_levels:
      quick: ["architecture", "security-critical", "performance-bottlenecks"]
      standard: ["architecture", "code-quality", "security", "performance", "dependencies", "testing", "technical-debt"]
      deep: ["all standard plus", "scalability", "maintainability", "documentation", "deployment", "monitoring"]
    time_reduction: "70-75%"     # 2-4 hours → 30-60 minutes
    parallel_categories: 3-12    # Based on analysis level
    
  integration_setup:
    enabled: true
    categories: ["authentication", "payment", "messaging", "storage", "analytics", "ai", "monitoring"]
    parallel_setup: true         # All integration categories simultaneously
    documentation: "automated"   # OpenAPI specs, guides, troubleshooting
    time_reduction: "78%"        # 3-4 hours → 45 minutes
```

## Workflow Configuration

### Research Levels (for new and existing projects)
```yaml
research_levels:
  minimal:
    duration: "1-2 hours"
    enhanced_duration: "15-30 minutes"  # With multi-LLM acceleration
    description: "Essential market validation and feasibility"
    documents:
      - market-analysis.md
      - competitive-analysis.md
      - technical-feasibility.md
      - financial-analysis.md
      - executive-summary.md
    agent_count: 2-3
    
    # NEW: Model routing configuration
    model_routing:
      zen_enabled:  # When Zen MCP is available
        primary: "gemini-1.5-flash"      # Cheapest, fastest
        secondary: "claude-3-haiku"       # Via Zen for cost optimization
        tertiary: "gpt-3.5-turbo"        # Alternative option
        parallel_streams: 2
        
      claude_native:  # ALWAYS AVAILABLE FALLBACK
        primary: "claude-3-haiku"         # Direct Claude API
        secondary: "claude-3-sonnet"      # If Haiku unavailable
        final: "claude-3-opus"            # Ultimate quality fallback
        parallel_streams: 1               # Sequential execution
    
  medium:
    duration: "3-5 hours"
    enhanced_duration: "45-75 minutes"  # With multi-LLM acceleration
    description: "Comprehensive research and analysis"
    documents: 48  # See research-level-documents.json for full list
    agent_count: 4-5
    
    # NEW: Model routing configuration
    model_routing:
      zen_enabled:
        primary: "gemini-1.5-pro"         # Best cost/performance ratio
        secondary: "claude-3-haiku"       # Quick validations
        tertiary: "gpt-4-turbo"          # Alternative depth
        deep_research: "perplexity-sonar"
        parallel_streams: 3
        
      claude_native:  # FALLBACK
        primary: "claude-3-sonnet"        # Balanced performance
        secondary: "claude-3-haiku"       # For parallel tasks
        final: "claude-3-opus"            # Quality guarantee
        parallel_streams: 1
    
  thorough:  # DEFAULT
    duration: "6-10 hours"
    enhanced_duration: "1.5-2.5 hours"  # With multi-LLM acceleration
    description: "Enterprise-level deep dive with all research areas"
    documents: 194  # All documents across all categories - see research-level-documents.json
    agent_count: 8-10
    
    # NEW: Model routing configuration
    model_routing:
      zen_enabled:
        primary: "claude-sonnet-4"        # Via Zen for parallel work
        secondary: "gemini-1.5-pro"       # 1M context alternative
        specialized:
          financial: "claude-opus-4"
          technical: "gpt-4-turbo"
          market: "perplexity-sonar-pro"
        deep_research: ["perplexity-sonar-pro", "tavily", "exa"]
        parallel_streams: 5
        
      claude_native:  # FALLBACK
        primary: "claude-sonnet-4"        # 1M context
        secondary: "claude-opus-4"        # Premium quality
        final: "claude-opus-4"            # No compromise on thorough
        parallel_streams: 1               # Sequential but comprehensive
```

### Analysis Levels (for existing projects)
```yaml
analysis_levels:
  quick:
    duration: "30-60 minutes"
    description: "High-level architecture and obvious issues"
    scope:
      - Basic architecture mapping
      - Technology stack identification
      - Major security vulnerabilities
      - Critical performance issues
    
  standard:  # DEFAULT
    duration: "2-4 hours"
    description: "Comprehensive code and architecture analysis"
    scope:
      - Full architecture documentation
      - Code quality assessment
      - Security vulnerability scan
      - Performance bottleneck analysis
      - Dependency audit
      - Test coverage analysis
      - Technical debt assessment
    
  deep:
    duration: "4-8 hours"
    description: "Line-by-line analysis with performance profiling"
    scope:
      - Everything in standard plus:
      - Line-by-line code review
      - Memory profiling
      - Database query optimization
      - Detailed refactoring recommendations
      - Microservice decomposition analysis
      - Scalability assessment
```

### Workflow State Extension
```yaml
workflow_state:
  active_workflow: null     # "new-project" | "existing-project" | null
  workflow_phase: null      # Current phase of active workflow
  initiated_by: null        # Command that started workflow
  started_at: null          # Timestamp of workflow start
  
  discovery:
    sections_completed: []  # Track completed interview sections
    current_section: null   # Active interview section
    approvals: {}          # Record stakeholder approvals with timestamps
    iterations: {}         # Track clarification rounds per section
    
  configuration:
    research_level: null   # Selected research depth
    analysis_level: null   # Selected analysis depth (existing projects)
    
  context:
    project_type: null     # Type of project being built
    existing_tech: []      # Technologies found (existing projects)
    key_decisions: []      # Important decisions made during workflow
```

## Statusline Configuration

```yaml
statusline:
  enabled: true                  # Master switch for statusline display
  mode: "adaptive"               # Options: static, adaptive, alert-priority
  update_frequency: 500          # Milliseconds between updates (min 300)
  
  display:
    show_health: true           # Show project health indicator
    show_milestone: true        # Show last completed milestone
    show_agents: true           # Show active agents and efficiency
    show_cost: true             # Show session cost
    show_dashboard: true        # Show dashboard link when online
    show_hooks: false           # Show hook status (verbose/debug only)
    show_tokens: false          # Show token usage (debug only)
    max_width: 120              # Maximum statusline width in characters
    
  thresholds:
    action_urgency: 10          # Minutes before showing countdown
    cost_warning: 5             # Dollar amount for cost warning
    token_warning: 0.8          # 80% of token limit triggers warning
    stall_detection: 15         # Minutes to detect phase stall
    
  priorities:                  # Display priority levels
    stakeholder_actions: 1      # Highest priority
    errors_blockers: 1          # Critical issues
    active_operations: 2        # Current work
    monitoring_alerts: 3        # Warnings
    background_ops: 4           # Background tasks
    
  auto_mode_switches:           # Automatic mode changes
    alert_on_error: true        # Switch to alert mode on errors
    verbose_on_action: true     # Expand when action needed
    quiet_during_research: true # Minimize during long operations
    
  abbreviations:                # Text compression settings
    use_icons: true             # Use emoji icons
    shorten_agent_names: true   # Abbreviate agent names
    compress_progress: true     # Show percentages vs counts
    
  colors:                       # ANSI color scheme
    health_good: "green"
    health_warning: "yellow"
    health_critical: "red"
    action_needed: "bold_yellow"
    milestone: "dim_white"
    progress: "cyan"
    sub_agents: "blue"
    cost: "magenta"
```

### Statusline Display Examples

**Normal Operations:**
```
🟢 Sprint 1 CI/CD | 3 agents working | Step 4/7 (57%) | Auto-save ✓ | $2.34 | Dashboard ↗
```

**Stakeholder Action Required:**
```
⚠️ ACTION NEEDED | Create GitHub repo "project-name" | 5 mins until blocked | See above ⬆️
```

**System Alert:**
```
🔴 BLOCKED | 2 agents timeout | Token limit 85% | Recovery in progress | Check dashboard
```

### Verbosity-Based Display

- **quiet**: Minimal display showing only phase and progress
- **normal**: Standard display with health, phase, agents, and cost
- **verbose**: Detailed display including all priority 1-3 items
- **debug**: Everything including internal states and token counts

## Claude Code Hooks Configuration Format

Claude Code hooks configuration uses string matchers with regex patterns:

### settings.json (Project-level hooks)
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/on-file-create.sh"
          }
        ]
      },
      {
        "matcher": "Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/on-file-change.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-command-validation.sh"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/user-prompt-submit.sh"
          }
        ]
      }
    ]
  }
}
```

### Key Points
- Matchers are **strings** with regex patterns (e.g., "Write|Edit|MultiEdit")
- Use pipe `|` to match multiple tools
- Use `.*` for matching all
- Commands can use `$CLAUDE_PROJECT_DIR` or relative paths
- Both settings.json and settings.local.json can define hooks

---

For complete details on other topics, see:
- **Core Information**: CLAUDE-core.md
- **Agent Guidelines**: CLAUDE-agents.md
- **Reference Documents**: CLAUDE-reference.md

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)